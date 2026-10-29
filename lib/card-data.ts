import { cache } from "react";
import { supabaseServer } from "@/lib/supabase-server";
import type { CardLink, Profile } from "@/lib/types";

export const getCard = cache(async (username: string) => {
  const supabase = await supabaseServer();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username.toLowerCase())
    .maybeSingle<Profile>();
  if (!profile) return null;
  const { data: links } = await supabase
    .from("links")
    .select("*")
    .eq("user_id", profile.id)
    .eq("visible", true)
    .order("position")
    .returns<CardLink[]>();
  return { profile, links: links ?? [] };
});
