import { getCard } from "@/lib/card-data";
import { siteUrl } from "@/lib/types";

// Escapa los caracteres especiales del formato vCard.
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");

// Las líneas de vCard no deben pasar de 75 caracteres.
function fold(line: string) {
  const out: string[] = [];
  for (let i = 0; i < line.length; i += 74) out.push((i ? " " : "") + line.slice(i, i + 74));
  return out.join("\r\n");
}

async function photoLine(url: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const type = (res.headers.get("content-type") || "").includes("png") ? "PNG" : "JPEG";
    const b64 = Buffer.from(await res.arrayBuffer()).toString("base64");
    return fold(`PHOTO;ENCODING=b;TYPE=${type}:${b64}`);
  } catch {
    return null;
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const card = await getCard(username);
  if (!card) return new Response("No encontrada", { status: 404 });
  const { profile: p, links } = card;

  const name = p.full_name || p.username;
  const parts = name.trim().split(/\s+/);
  const first = parts.length > 1 ? parts.slice(0, Math.ceil(parts.length / 2)).join(" ") : name;
  const last = parts.length > 1 ? parts.slice(Math.ceil(parts.length / 2)).join(" ") : "";

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${esc(name)}`,
    `N:${esc(last)};${esc(first)};;;`,
    p.title && `TITLE:${esc(p.title)}`,
    p.phone && `TEL;TYPE=CELL:${p.phone.replace(/[^\d+]/g, "")}`,
    p.public_email && `EMAIL;TYPE=INTERNET:${p.public_email}`,
    p.city && `ADR;TYPE=WORK:;;;${esc(p.city)};;;`,
    p.bio && fold(`NOTE:${esc(p.bio)}`),
    `URL:${siteUrl()}/${p.username}`,
    ...links.map((l) => `URL:${l.url}`),
    p.avatar_url && (await photoLine(p.avatar_url)),
    "END:VCARD",
  ].filter(Boolean);

  return new Response(lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${p.username}.vcf"`,
      "Cache-Control": "no-store",
    },
  });
}
