"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Icon } from "@/components/Icon";
import { ACCENTS, initials, waNumber, type CardLink, type EventKind, type Profile } from "@/lib/types";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Props = {
  profile: Profile;
  links: CardLink[];
  cardUrl: string;
  /** En el panel se muestra como vista previa: no cuenta visitas. */
  preview?: boolean;
};

export function accentStyle(accent: Profile["accent"]) {
  const color = ACCENTS.find((a) => a.id === accent)?.color ?? ACCENTS[0]!.color;
  return { "--accent": color } as React.CSSProperties;
}

export function CardView({ profile, links, cardUrl, preview = false }: Props) {
  const [sheet, setSheet] = useState(false);
  const [toast, setToast] = useState("");

  function track(kind: EventKind, linkId?: string) {
    if (preview) return;
    supabaseBrowser()
      .rpc("track_event", { p_username: profile.username, p_kind: kind, p_link: linkId ?? null })
      .then(() => {}, () => {});
  }

  useEffect(() => {
    if (preview) return;
    const params = new URLSearchParams(window.location.search);
    track(params.has("qr") ? "qr" : "view");
    if (params.has("qr")) window.history.replaceState(null, "", window.location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  }

  async function share() {
    const data = { title: profile.full_name || profile.username, url: cardUrl };
    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch {
        /* el usuario canceló: mostramos el QR */
      }
    }
    setSheet(true);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(cardUrl);
      flash("Enlace copiado");
    } catch {
      flash("Copia el enlace de arriba");
    }
  }

  const wa = waNumber(profile.whatsapp);
  const tel = profile.phone.replace(/[^\d+]/g, "");
  const visibleLinks = links.filter((l) => l.visible);

  return (
    <div className="sec" style={{ ...accentStyle(profile.accent), gap: 14 }}>
      <div className="hero">
        <div className="cover" />
        <div className="id">
          <div className="avatar">
            {profile.avatar_url ? <img src={profile.avatar_url} alt="" /> : initials(profile.full_name || profile.username)}
          </div>
          <div>
            <h1 className="name">{profile.full_name || `@${profile.username}`}</h1>
            {profile.title && <p className="role">{profile.title}</p>}
          </div>
          {profile.bio && <p className="bio">{profile.bio}</p>}
          {(profile.available || profile.city) && (
            <div className="chips">
              {profile.available && <span className="chip on">Disponible para proyectos</span>}
              {profile.city && <span className="chip"><Icon name="pin" size={13} />{profile.city}</span>}
            </div>
          )}
        </div>
      </div>

      <a
        className="btn primary"
        href={preview ? undefined : `/api/vcard/${profile.username}`}
        onClick={(e) => {
          if (preview) {
            e.preventDefault();
            flash("Aquí se descarga el contacto");
          } else track("save_contact");
        }}
      >
        <Icon name="download" /> Guardar contacto
      </a>

      {(wa || tel || profile.public_email) && (
        <div className="quick">
          {wa && (
            <a className="q wa" href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" onClick={() => track("whatsapp")}>
              <Icon name="whatsapp" size={22} /> WhatsApp
            </a>
          )}
          {tel && (
            <a className="q" href={`tel:${tel}`} onClick={() => track("call")}>
              <Icon name="phone" size={22} /> Llamar
            </a>
          )}
          {profile.public_email && (
            <a className="q" href={`mailto:${profile.public_email}`} onClick={() => track("email")}>
              <Icon name="mail" size={22} /> Correo
            </a>
          )}
        </div>
      )}

      {visibleLinks.length > 0 && (
        <div className="sec">
          <h2 className="sec-title">Enlaces</h2>
          {visibleLinks.map((l) => (
            <a key={l.id} className="link" href={l.url} target="_blank" rel="noopener noreferrer" onClick={() => track("link", l.id)}>
              <span className="ic"><Icon name={l.icon} size={18} /></span>
              <span className="t"><b>{l.title}</b><small>{l.url.replace(/^https?:\/\/(www\.)?/, "")}</small></span>
              <span className="arr"><Icon name="arrow" size={18} /></span>
            </a>
          ))}
        </div>
      )}

      {(profile.phone || profile.public_email) && (
        <div className="sec">
          <h2 className="sec-title">Datos</h2>
          {profile.phone && <div className="data-line"><span>Teléfono</span><code>{profile.phone}</code></div>}
          {profile.public_email && <div className="data-line"><span>Correo</span><code>{profile.public_email}</code></div>}
        </div>
      )}

      <div className="row2">
        <button className="btn ghost" onClick={() => setSheet(true)}><Icon name="qr" size={18} /> Mostrar QR</button>
        <button className="btn ghost" onClick={share}><Icon name="share" size={18} /> Compartir</button>
      </div>

      {!preview && (
        <p className="made">¿Quieres una así? <a href="/registro">Crea la tuya gratis</a></p>
      )}

      {sheet && (
        <div className="sheet-bg" onClick={(e) => e.target === e.currentTarget && setSheet(false)}>
          <div className="sheet" role="dialog" aria-label="Código QR">
            <div className="grab" />
            <div className="qrbox"><QRCodeSVG value={`${cardUrl}?qr=1`} size={200} marginSize={0} /></div>
            <p>Que lo escaneen con la cámara del celular.</p>
            <code className="url">{cardUrl.replace(/^https?:\/\//, "")}</code>
            <button className="btn" onClick={copy}>Copiar enlace</button>
            <button className="btn ghost" style={{ border: 0, color: "var(--mute)" }} onClick={() => setSheet(false)}>Cerrar</button>
          </div>
        </div>
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
