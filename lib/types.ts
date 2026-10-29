import type { CSSProperties } from "react";

export type Accent = "oro" | "esmeralda" | "coral" | "cielo" | "lila";

export type Profile = {
  id: string;
  username: string;
  full_name: string;
  title: string;
  bio: string;
  city: string;
  phone: string;
  whatsapp: string;
  public_email: string;
  avatar_url: string;
  accent: Accent;
  available: boolean;
};

export type LinkIcon =
  | "web"
  | "github"
  | "linkedin"
  | "instagram"
  | "x"
  | "tiktok"
  | "youtube"
  | "facebook";

export type CardLink = {
  id: string;
  user_id: string;
  title: string;
  url: string;
  icon: LinkIcon;
  position: number;
  visible: boolean;
};

export type EventKind = "view" | "qr" | "save_contact" | "whatsapp" | "call" | "email" | "link";

export const ACCENTS: { id: Accent; label: string; color: string }[] = [
  { id: "oro", label: "Oro", color: "#d9b45a" },
  { id: "esmeralda", label: "Esmeralda", color: "#3fbf8f" },
  { id: "coral", label: "Coral", color: "#f07a62" },
  { id: "cielo", label: "Cielo", color: "#5aa9f0" },
  { id: "lila", label: "Lila", color: "#a98cf0" },
];

export const LINK_ICONS: { id: LinkIcon; label: string }[] = [
  { id: "web", label: "Sitio web" },
  { id: "github", label: "GitHub" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "instagram", label: "Instagram" },
  { id: "x", label: "X" },
  { id: "tiktok", label: "TikTok" },
  { id: "youtube", label: "YouTube" },
  { id: "facebook", label: "Facebook" },
];

export function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join("") || "?"
  );
}

// Solo dígitos; si son 10 (número mexicano) se antepone 52 para WhatsApp.
export function waNumber(raw: string) {
  const d = raw.replace(/\D/g, "");
  return d.length === 10 ? `52${d}` : d;
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function accentStyle(accent: Accent) {
  const color = ACCENTS.find((a) => a.id === accent)?.color ?? ACCENTS[0]!.color;
  return { "--accent": color } as CSSProperties;
}
