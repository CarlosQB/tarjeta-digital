"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { Icon } from "@/components/Icon";
import { InstallButton } from "@/components/InstallButton";
import { accentStyle, initials, type CardLink, type Profile } from "@/lib/types";

type Props = { profile: Profile; links: CardLink[]; cardUrl: string };

// Pantalla principal del dueño: su tarjeta lista para mostrarla y compartirla.
export function OwnerCard({ profile: p, links, cardUrl }: Props) {
  const [big, setBig] = useState(false);
  const [toast, setToast] = useState("");
  const canvasBox = useRef<HTMLDivElement>(null);
  const qrValue = `${cardUrl}?qr=1`;
  const shortUrl = cardUrl.replace(/^https?:\/\//, "");
  const visible = links.filter((l) => l.visible);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  }

  async function share() {
    const data = { title: p.full_name || p.username, text: "Esta es mi tarjeta de contacto", url: cardUrl };
    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch {
        return; // canceló
      }
    }
    copy();
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(cardUrl);
      flash("Enlace copiado");
    } catch {
      flash(shortUrl);
    }
  }

  function downloadQr() {
    const canvas = canvasBox.current?.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `qr-${p.username}.png`;
    a.click();
  }

  return (
    <div className="sec" style={{ ...accentStyle(p.accent), gap: 14 }}>
      <div className="hero owner">
        <div className="cover" />
        <div className="id">
          <div className="avatar">
            {p.avatar_url ? <img src={p.avatar_url} alt="" /> : initials(p.full_name || p.username)}
          </div>
          <div>
            <h1 className="name">{p.full_name || `@${p.username}`}</h1>
            {p.title && <p className="role">{p.title}</p>}
          </div>
          {(p.phone || p.public_email) && (
            <div className="owner-data">
              {p.phone && <span><Icon name="phone" size={16} />{p.phone}</span>}
              {p.public_email && <span><Icon name="mail" size={16} />{p.public_email}</span>}
            </div>
          )}

          <button className="owner-qr" onClick={() => setBig(true)} aria-label="Mostrar QR en grande">
            <span className="qrbox"><QRCodeSVG value={qrValue} size={200} marginSize={0} /></span>
            <span className="owner-qr-text">
              <b>Escanea para guardar mi contacto</b>
              <small>{shortUrl}</small>
            </span>
          </button>
        </div>
      </div>

      <button className="btn primary" onClick={share}>
        <Icon name="share" /> Compartir mi tarjeta
      </button>
      <div className="row2">
        <button className="btn ghost" onClick={() => setBig(true)}><Icon name="qr" size={18} /> QR en grande</button>
        <InstallButton />
      </div>
      <div className="row2">
        <button className="btn ghost" onClick={copy}>Copiar enlace</button>
        <button className="btn ghost" onClick={downloadQr}>Descargar QR</button>
      </div>

      {(visible.length === 0 || !p.phone) && (
        <Link href="/panel/editar" className="link">
          <span className="ic"><Icon name="edit" size={18} /></span>
          <span className="t">
            <b>Completa tu tarjeta</b>
            <small>{!p.phone ? "Agrega tu teléfono y WhatsApp" : "Agrega tus redes y enlaces"}</small>
          </span>
          <span className="arr"><Icon name="arrow" size={18} /></span>
        </Link>
      )}
      <a href={`/${p.username}`} target="_blank" className="link">
        <span className="ic"><Icon name="eye" size={18} /></span>
        <span className="t"><b>Ver como la ven los demás</b><small>Abre tu tarjeta pública</small></span>
        <span className="arr"><Icon name="arrow" size={18} /></span>
      </a>

      <div ref={canvasBox} hidden>
        <QRCodeCanvas value={qrValue} size={1024} marginSize={4} />
      </div>

      {big && (
        <div className="qr-full" onClick={() => setBig(false)} role="dialog" aria-label="QR en grande">
          <p className="qr-full-name">{p.full_name || p.username}</p>
          <div className="qrbox"><QRCodeSVG value={qrValue} size={300} marginSize={0} style={{ width: "min(76vw, 360px)", height: "auto" }} /></div>
          <p>Abre la cámara y apunta aquí</p>
          <button className="btn" style={{ width: "auto" }}>Cerrar</button>
        </div>
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
