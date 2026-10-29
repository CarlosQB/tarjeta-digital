import { redirect } from "next/navigation";
import { Editor } from "@/components/Editor";
import { PanelNav } from "@/components/PanelNav";
import { supabaseServer } from "@/lib/supabase-server";
import { siteUrl, type CardLink, type Profile } from "@/lib/types";

export const metadata = { title: "Editar tarjeta" };

export default async function EditarTarjeta() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single<Profile>();
  if (!profile) redirect("/entrar");
  const { data: links } = await supabase
    .from("links")
    .select("*")
    .eq("user_id", user.id)
    .order("position")
    .returns<CardLink[]>();

  return (
    <main className="page wide">
      <PanelNav current="editar" />
      <Editor initialProfile={profile} initialLinks={links ?? []} site={siteUrl()} />
    </main>
  );
}
