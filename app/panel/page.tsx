import { redirect } from "next/navigation";
import { OwnerCard } from "@/components/OwnerCard";
import { PanelNav } from "@/components/PanelNav";
import { supabaseServer } from "@/lib/supabase-server";
import { siteUrl, type CardLink, type Profile } from "@/lib/types";

export const metadata = { title: "Mi tarjeta" };

export default async function MiTarjeta() {
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
    <main className="page">
      <PanelNav current="tarjeta" />
      <OwnerCard profile={profile} links={links ?? []} cardUrl={`${siteUrl()}/${profile.username}`} />
    </main>
  );
}
