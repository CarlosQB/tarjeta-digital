import Link from "next/link";
import { redirect } from "next/navigation";
import { PanelNav } from "@/components/PanelNav";
import { supabaseServer } from "@/lib/supabase-server";
import { accentStyle, type CardLink, type Profile } from "@/lib/types";

export const metadata = { title: "Estadísticas" };

type Row = { day: string; kind: string; link_id: string | null; total: number };

const LABELS: Record<string, string> = {
  save_contact: "Guardar contacto",
  whatsapp: "WhatsApp",
  call: "Llamar",
  email: "Correo",
};

function mxDate(d: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" }).format(d);
}

export default async function Estadisticas({ searchParams }: { searchParams: Promise<{ dias?: string }> }) {
  const { dias } = await searchParams;
  const days = dias === "30" ? 30 : 7;

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const [{ data: profile }, { data: links }, { data: rows }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single<Profile>(),
    supabase.from("links").select("*").eq("user_id", user.id).returns<CardLink[]>(),
    supabase.rpc("my_stats", { p_days: days }),
  ]);
  if (!profile) redirect("/entrar");

  const data = ((rows ?? []) as Row[]).map((r) => ({ ...r, total: Number(r.total) }));
  const sum = (kinds: string[]) => data.filter((r) => kinds.includes(r.kind)).reduce((a, r) => a + r.total, 0);

  const visits = sum(["view", "qr"]);
  const scans = sum(["qr"]);
  const saves = sum(["save_contact"]);
  const clicks = sum(["whatsapp", "call", "email", "link"]);

  // Visitas por día, rellenando los días sin visitas.
  const series: { key: string; label: string; v: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = mxDate(d);
    const label =
      days === 7
        ? new Intl.DateTimeFormat("es-MX", { weekday: "narrow", timeZone: "America/Mexico_City" }).format(d).toUpperCase()
        : key.slice(8);
    series.push({ key, label, v: data.filter((r) => r.day === key && (r.kind === "view" || r.kind === "qr")).reduce((a, r) => a + r.total, 0) });
  }
  const max = Math.max(4, ...series.map((s) => s.v));

  // Qué tocan más.
  const titleOf = new Map((links ?? []).map((l) => [l.id, l.title]));
  const counts = new Map<string, number>();
  for (const r of data) {
    const name = r.kind === "link" ? titleOf.get(r.link_id ?? "") ?? "Enlace borrado" : LABELS[r.kind];
    if (name) counts.set(name, (counts.get(name) ?? 0) + r.total);
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  const topMax = top[0]?.[1] ?? 1;

  // Medidas del gráfico.
  const W = 320, H = 150, top0 = 20, h = 110;
  const slot = W / series.length;
  const bw = Math.min(28, slot * 0.6);
  const ticks = [0, Math.round(max / 2), max];

  return (
    <main className="page wide" style={accentStyle(profile.accent)}>
      <PanelNav current="estadisticas" />

      <div className="range" role="group" aria-label="Periodo">
        <Link href="/panel/estadisticas" aria-current={days === 7}>7 días</Link>
        <Link href="/panel/estadisticas?dias=30" aria-current={days === 30}>30 días</Link>
      </div>

      <div className="kpis">
        <div className="kpi"><b>{visits}</b><span>visitas</span></div>
        <div className="kpi"><b>{scans}</b><span>escaneos de QR</span></div>
        <div className="kpi"><b>{saves}</b><span>guardaron tu contacto</span></div>
        <div className="kpi"><b>{clicks}</b><span>clics en botones y enlaces</span></div>
      </div>

      <section className="box">
        <h2>Visitas por día</h2>
        {visits === 0 ? (
          <p className="empty">Aún no hay visitas en este periodo. Comparte tu QR o tu enlace y aquí verás cuántas personas la abren.</p>
        ) : (
          <svg viewBox={`0 0 ${W} ${H}`} className="bars" role="img" aria-label={`Visitas por día, últimos ${days} días`} style={{ width: "100%", height: "auto" }}>
            {ticks.map((t) => {
              const y = top0 + h - (t / max) * h;
              return <line key={t} x1="0" x2={W} y1={y} y2={y} stroke="var(--line)" strokeWidth="1" />;
            })}
            {series.map((s, i) => {
              const x = i * slot + (slot - bw) / 2;
              const bh = (s.v / max) * h;
              const y = top0 + h - bh;
              const isToday = i === series.length - 1;
              return (
                <g key={s.key}>
                  <rect x={x} y={y} width={bw} height={Math.max(bh, s.v ? 2 : 0)} rx={Math.min(6, bw / 3)}
                    fill={isToday ? "var(--accent)" : "color-mix(in srgb, var(--accent) 35%, var(--line))"} />
                  {days === 7 && s.v > 0 && <text className="v" x={x + bw / 2} y={y - 5} textAnchor="middle">{s.v}</text>}
                  {(days === 7 || i % 5 === 4 || isToday) && (
                    <text x={x + bw / 2} y={top0 + h + 16} textAnchor="middle">{s.label}</text>
                  )}
                </g>
              );
            })}
          </svg>
        )}
      </section>

      <section className="box">
        <h2>Qué tocan más</h2>
        {top.length === 0 ? (
          <p className="empty">Cuando alguien toque WhatsApp, Guardar contacto o tus enlaces, aparecerá aquí.</p>
        ) : (
          <div className="sec" style={{ gap: 10 }}>
            {top.map(([name, v]) => (
              <div key={name} className="cl">
                <span>{name}</span>
                <span className="bar"><i style={{ width: `${(v / topMax) * 100}%` }} /></span>
                <em>{v}</em>
              </div>
            ))}
          </div>
        )}
      </section>
      <p className="made">Solo tú ves esto. No se guarda quién visita, solo cuántas veces.</p>
    </main>
  );
}
