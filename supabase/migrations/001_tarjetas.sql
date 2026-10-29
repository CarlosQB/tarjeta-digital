-- Tarjeta digital: perfiles, enlaces, estadísticas y fotos.
-- Correr una sola vez en Supabase > SQL Editor.

-- ---------- Perfiles: una tarjeta por usuario ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique
    check (username ~ '^[a-z0-9][a-z0-9_-]{2,29}$'),
  full_name text not null default '' check (char_length(full_name) <= 80),
  title text not null default '' check (char_length(title) <= 80),
  bio text not null default '' check (char_length(bio) <= 280),
  city text not null default '' check (char_length(city) <= 60),
  phone text not null default '' check (char_length(phone) <= 30),
  whatsapp text not null default '' check (char_length(whatsapp) <= 30),
  public_email text not null default '' check (char_length(public_email) <= 120),
  avatar_url text not null default '',
  accent text not null default 'oro'
    check (accent in ('oro', 'esmeralda', 'coral', 'cielo', 'lila')),
  available boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Nombres que chocan con rutas de la app.
create or replace function public.is_reserved_username(name text)
returns boolean language sql immutable as $$
  select lower(name) = any (array[
    'api', 'auth', 'panel', 'entrar', 'registro', 'salir', 'admin',
    'login', 'signup', 'ajustes', 'estadisticas', 'legacy', '_next',
    'favicon.ico', 'manifest.webmanifest', 'robots.txt', 'sitemap.xml'
  ]);
$$;

alter table public.profiles
  add constraint username_not_reserved check (not public.is_reserved_username(username));

-- ---------- Enlaces de cada tarjeta ----------
create table public.links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 60),
  url text not null check (url ~* '^https?://' and char_length(url) <= 500),
  icon text not null default 'web'
    check (icon in ('web', 'github', 'linkedin', 'instagram', 'x', 'tiktok', 'youtube', 'facebook')),
  position int not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);
create index links_user_position on public.links (user_id, position);

-- ---------- Estadísticas: visitas y clics (sin datos personales) ----------
create table public.events (
  id bigint generated always as identity primary key,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null
    check (kind in ('view', 'qr', 'save_contact', 'whatsapp', 'call', 'email', 'link')),
  link_id uuid references public.links (id) on delete set null,
  created_at timestamptz not null default now()
);
create index events_profile_created on public.events (profile_id, created_at desc);

-- ---------- Seguridad (RLS) ----------
alter table public.profiles enable row level security;
alter table public.links enable row level security;
alter table public.events enable row level security;

-- Cualquiera puede ver tarjetas; cada quien edita solo la suya.
create policy "perfiles visibles" on public.profiles for select using (true);
create policy "editar mi perfil" on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "enlaces visibles" on public.links for select
  using (visible or auth.uid() = user_id);
create policy "crear mis enlaces" on public.links for insert
  with check (auth.uid() = user_id);
create policy "editar mis enlaces" on public.links for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "borrar mis enlaces" on public.links for delete
  using (auth.uid() = user_id);

-- Solo el dueño lee sus estadísticas. Se escriben con track_event().
create policy "ver mis estadisticas" on public.events for select
  using (auth.uid() = profile_id);

create or replace function public.track_event(p_username text, p_kind text, p_link uuid default null)
returns void language plpgsql security definer set search_path = public as $$
declare pid uuid;
begin
  select id into pid from profiles where username = lower(p_username);
  if pid is null then return; end if;
  if p_link is not null and not exists (select 1 from links where id = p_link and user_id = pid) then
    p_link := null;
  end if;
  insert into events (profile_id, kind, link_id) values (pid, p_kind, p_link);
end $$;
grant execute on function public.track_event(text, text, uuid) to anon, authenticated;

-- Para el registro: saber si un nombre de usuario está libre.
create or replace function public.username_available(p_username text)
returns boolean language sql stable security definer set search_path = public as $$
  select lower(p_username) ~ '^[a-z0-9][a-z0-9_-]{2,29}$'
     and not public.is_reserved_username(p_username)
     and not exists (select 1 from profiles where username = lower(p_username));
$$;
grant execute on function public.username_available(text) to anon, authenticated;

-- ---------- Crear el perfil al registrarse ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, full_name, public_email)
  values (
    new.id,
    lower(new.raw_user_meta_data ->> 'username'),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, '')
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ---------- Fotos de perfil ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "fotos visibles" on storage.objects for select
  using (bucket_id = 'avatars');
create policy "subir mi foto" on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "cambiar mi foto" on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "borrar mi foto" on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------- Resumen de estadísticas del usuario que inició sesión ----------
-- Agrupa por día (hora de México), tipo y enlace. RLS deja ver solo lo propio.
create or replace function public.my_stats(p_days int default 7)
returns table (day date, kind text, link_id uuid, total bigint)
language sql stable security invoker set search_path = public as $$
  select (created_at at time zone 'America/Mexico_City')::date as day, kind, link_id, count(*) as total
  from events
  where profile_id = auth.uid()
    and created_at >= now() - make_interval(days => least(greatest(p_days, 1), 365))
  group by 1, 2, 3;
$$;
grant execute on function public.my_stats(int) to authenticated;
