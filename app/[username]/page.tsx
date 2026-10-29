import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CardView } from "@/components/CardView";
import { getCard } from "@/lib/card-data";
import { siteUrl } from "@/lib/types";

type Params = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { username } = await params;
  const card = await getCard(username);
  if (!card) return { title: "Tarjeta no encontrada" };
  const name = card.profile.full_name || `@${card.profile.username}`;
  const description = [card.profile.title, card.profile.bio].filter(Boolean).join(" · ") || "Tarjeta de presentación digital";
  return {
    title: name,
    description,
    openGraph: {
      title: name,
      description,
      url: `${siteUrl()}/${card.profile.username}`,
      images: card.profile.avatar_url ? [card.profile.avatar_url] : undefined,
    },
  };
}

export default async function CardPage({ params }: Params) {
  const { username } = await params;
  const card = await getCard(username);
  if (!card) notFound();
  return (
    <main className="page">
      <CardView profile={card.profile} links={card.links} cardUrl={`${siteUrl()}/${card.profile.username}`} />
    </main>
  );
}
