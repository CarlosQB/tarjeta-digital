"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { CardView, accentStyle } from "@/components/CardView";
import { Icon } from "@/components/Icon";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { ACCENTS, LINK_ICONS, initials, type CardLink, type LinkIcon, type Profile } from "@/lib/types";

type Props = { initialProfile: Profile; initialLinks: CardLink[]; site: string };

const USERNAME_RE = /^[a-z0-9][a-z0-9_-]{2,29}$/;

function normalizeUrl(u: string) {
  const t = u.trim();
  if (!t) return t;
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

export function Editor({ initialProfile, initialLinks, site }: Props) {
  const router = useRouter();
  const [p, setP] = useState(initialProfile);
  const [links, setLinks] = useState(initialLinks);
  const [removed, setRemoved] = useState<string[]>([]);
  const [mode, setMode] = useState<"editar" | "vista">("editar");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [userStatus, setUserStatus] = useState<"same" | "checking" | "free" | "taken" | "invalid">("same");
  const qrCanvas = useRef<HTMLDivElement>(null);
  const savedUsername = useRef(initialProfile.username);

  const cardUrl = `${site}/${savedUsername.current}`;

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }

  function set<K extends keyof Profile>(key: K, value: Profile[K]) {
    setP((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  function setLink(id: string, patch: Partial<CardLink>) {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    setDirty(true);
  }

  function move(index: number, dir: -1 | 1) {
    setLinks((prev) => {
      const next = [...prev];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j]!, next[index]!];
      return next;
    });
    setDirty(true);
  }

  function addLink() {
    setLinks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), user_id: p.id, title: "", url: "", icon: "web", position: prev.length, visible: true },
    ]);
    setDirty(true);
  }

  function removeLink(id: string) {
    setLinks((prev) => prev.filter((l) => l.id !== id));
    if (initialLinks.some((l) => l.id === id)) setRemoved((r) => [...r, id]);
    setDirty(true);
  }

  // Revisar si el nuevo nombre de usuario está libre.
  useEffect(() => {
    if (p.username === savedUsername.current) return setUserStatus("same");
    if (!USERNAME_RE.test(p.username)) return setUserStatus("invalid");
    setUserStatus("checking");
    const t = setTimeout(async () => {
      const { data } = await supabaseBrowser().rpc("username_available", { p_username: p.username });
      setUserStatus(data ? "free" : "taken");
    }, 350);
    return () => clearTimeout(t);
  }, [p.username]);

  // Avisar si sales con cambios sin guardar.
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  async function uploadAvatar(file: File) {
    setError("");
    if (file.size > 2 * 1024 * 1024) return setError("La foto pesa más de 2 MB. Usa una más ligera.");
    setUploading(true);
    const supabase = supabaseBrowser();
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${p.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { contentType: file.type });
    if (upErr) {
      setUploading(false);
      return setError("No se pudo subir la foto. Usa JPG, PNG o WebP.");
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const { error: dbErr } = await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", p.id);
    setUploading(false);
    if (dbErr) return setError("La foto se subió pero no se guardó. Intenta de nuevo.");
    setP((prev) => ({ ...prev, avatar_url: data.publicUrl }));
    flash("Foto actualizada");
  }

  async function removeAvatar() {
    const { error } = await supabaseBrowser().from("profiles").update({ avatar_url: "" }).eq("id", p.id);
    if (!error) setP((prev) => ({ ...prev, avatar_url: "" }));
  }

  async function save() {
    setError("");
    if (userStatus === "taken" || userStatus === "invalid" || userStatus === "checking") {
      return setError("Elige un nombre de usuario disponible antes de guardar.");
    }
    const cleaned = links.map((l, i) => ({ ...l, title: l.title.trim(), url: normalizeUrl(l.url), position: i }));
    const bad = cleaned.find((l) => !l.title || !l.url);
    if (bad) return setError("Cada enlace necesita nombre y dirección.");

    setSaving(true);
    const supabase = supabaseBrowser();
    const { error: pErr } = await supabase
      .from("profiles")
      .update({
        username: p.username,
        full_name: p.full_name.trim(),
        title: p.title.trim(),
        bio: p.bio.trim(),
        city: p.city.trim(),
        phone: p.phone.trim(),
        whatsapp: p.whatsapp.trim(),
        public_email: p.public_email.trim(),
        accent: p.accent,
        available: p.available,
      })
      .eq("id", p.id);
    if (pErr) {
      setSaving(false);
      return setError(/duplicate|unique/i.test(pErr.message) ? "Ese nombre de usuario ya está ocupado." : "No se pudo guardar tu información.");
    }
    if (removed.length) await supabase.from("links").delete().in("id", removed);
    if (cleaned.length) {
      const { error: lErr } = await supabase
        .from("links")
        .upsert(cleaned.map(({ id, user_id, title, url, icon, position, visible }) => ({ id, user_id, title, url, icon, position, visible })));
      if (lErr) {
        setSaving(false);
        return setError("Tu información se guardó, pero hubo un problema con los enlaces. Revisa que las direcciones sean válidas.");
      }
    }
    setLinks(cleaned);
    setRemoved([]);
    setSaving(false);
    setDirty(false);
    savedUsername.current = p.username;
    setUserStatus("same");
    flash("Cambios guardados");
    router.refresh();
  }

  function downloadQr() {
    const canvas = qrCanvas.current?.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `qr-${savedUsername.current}.png`;
    a.click();
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(cardUrl);
      flash("Enlace copiado");
    } catch {
      flash(cardUrl);
    }
  }

  return (
    <div className="sec" style={{ ...accentStyle(p.accent), gap: 14 }}>
      {/* Compartir */}
      <div className="box">
        <div className="share-card">
          <div className="qrbox" style={{ padding: 8, borderRadius: 12 }}>
            <QRCodeSVG value={`${cardUrl}?qr=1`} size={96} marginSize={0} />
          </div>
          <div className="t">
            <b style={{ fontFamily: "var(--f-display)", fontSize: 18 }}>Tu tarjeta</b>
            <code className="url" style={{ textAlign: "left" }}>{cardUrl.replace(/^https?:\/\//, "")}</code>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button className="btn small" onClick={copy}>Copiar enlace</button>
              <button className="btn small" onClick={downloadQr}>Descargar QR</button>
            </div>
          </div>
        </div>
        <div ref={qrCanvas} hidden>
          <QRCodeCanvas value={`${cardUrl}?qr=1`} size={1024} marginSize={4} />
        </div>
      </div>

      <nav className="tabs" aria-label="Modo">
        <a href="#" aria-current={mode === "editar" ? "page" : undefined} onClick={(e) => { e.preventDefault(); setMode("editar"); }}>Editar datos</a>
        <a href="#" aria-current={mode === "vista" ? "page" : undefined} onClick={(e) => { e.preventDefault(); setMode("vista"); }}>Vista previa</a>
      </nav>

      {mode === "vista" ? (
        <CardView profile={p} links={links.filter((l) => l.title && l.url)} cardUrl={cardUrl} preview />
      ) : (
        <>
          <section className="box">
            <h2>Foto y color</h2>
            <div className="avatar-edit">
              <div className="avatar">
                {p.avatar_url ? <img src={p.avatar_url} alt="" /> : initials(p.full_name || p.username)}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label className="btn small" style={{ cursor: "pointer" }}>
                  {uploading ? "Subiendo…" : p.avatar_url ? "Cambiar foto" : "Subir foto"}
                  <input
                    id="avatar" type="file" accept="image/jpeg,image/png,image/webp" hidden
                    onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])}
                  />
                </label>
                {p.avatar_url && <button className="btn small ghost danger" onClick={removeAvatar}>Quitar</button>}
              </div>
            </div>
            <div className="swatches" role="group" aria-label="Color de acento">
              {ACCENTS.map((a) => (
                <button
                  key={a.id} className="swatch" aria-pressed={p.accent === a.id} aria-label={a.label} title={a.label}
                  style={{ "--sw": a.color } as React.CSSProperties} onClick={() => set("accent", a.id)}
                />
              ))}
            </div>
          </section>

          <section className="box">
            <h2>Tu información</h2>
            <label className="f" htmlFor="full_name">Nombre
              <input id="full_name" className="input" value={p.full_name} maxLength={80} onChange={(e) => set("full_name", e.target.value)} />
            </label>
            <label className="f" htmlFor="title">Puesto o a qué te dedicas
              <input id="title" className="input" value={p.title} maxLength={80} placeholder="Desarrollador web" onChange={(e) => set("title", e.target.value)} />
            </label>
            <label className="f" htmlFor="bio">Descripción corta
              <textarea id="bio" className="input" value={p.bio} maxLength={280} onChange={(e) => set("bio", e.target.value)} />
              <span className="hint">{p.bio.length}/280</span>
            </label>
            <label className="f" htmlFor="city">Ciudad
              <input id="city" className="input" value={p.city} maxLength={60} placeholder="Guadalajara, Jal." onChange={(e) => set("city", e.target.value)} />
            </label>
            <div className="toggle-row">
              <div className="t"><b>Disponible para proyectos</b><small>Muestra una etiqueta verde en tu tarjeta</small></div>
              <button className="sw" role="switch" aria-checked={p.available} aria-label="Disponible para proyectos" onClick={() => set("available", !p.available)} />
            </div>
          </section>

          <section className="box">
            <h2>Contacto</h2>
            <p className="help">Deja vacío lo que no quieras mostrar.</p>
            <div className="grid2">
              <label className="f" htmlFor="phone">Teléfono
                <input id="phone" className="input" inputMode="tel" value={p.phone} maxLength={30} placeholder="33 1234 5678" onChange={(e) => set("phone", e.target.value)} />
              </label>
              <label className="f" htmlFor="whatsapp">WhatsApp
                <input id="whatsapp" className="input" inputMode="tel" value={p.whatsapp} maxLength={30} placeholder="33 1234 5678" onChange={(e) => set("whatsapp", e.target.value)} />
              </label>
            </div>
            <label className="f" htmlFor="public_email">Correo público
              <input id="public_email" type="email" className="input" value={p.public_email} maxLength={120} onChange={(e) => set("public_email", e.target.value)} />
            </label>
          </section>

          <section className="box">
            <h2>Enlaces</h2>
            {links.length === 0 && <p className="empty">Agrega tu GitHub, LinkedIn, Instagram o portafolio.</p>}
            {links.map((l, i) => (
              <div key={l.id} className={`link-row${l.visible ? "" : " hidden-link"}`}>
                <div className="grid2">
                  <label className="f" htmlFor={`lt-${l.id}`}>Nombre
                    <input id={`lt-${l.id}`} className="input" value={l.title} maxLength={60} placeholder="GitHub" onChange={(e) => setLink(l.id, { title: e.target.value })} />
                  </label>
                  <label className="f" htmlFor={`li-${l.id}`}>Ícono
                    <select id={`li-${l.id}`} className="input" value={l.icon} onChange={(e) => setLink(l.id, { icon: e.target.value as LinkIcon })}>
                      {LINK_ICONS.map((ic) => <option key={ic.id} value={ic.id}>{ic.label}</option>)}
                    </select>
                  </label>
                </div>
                <label className="f" htmlFor={`lu-${l.id}`}>Dirección
                  <input id={`lu-${l.id}`} className="input" inputMode="url" autoCapitalize="none" value={l.url} maxLength={500} placeholder="github.com/usuario" onChange={(e) => setLink(l.id, { url: e.target.value })} />
                </label>
                <div className="actions">
                  <button className="icon-btn" aria-label="Subir" disabled={i === 0} onClick={() => move(i, -1)}><Icon name="up" size={18} /></button>
                  <button className="icon-btn" aria-label="Bajar" disabled={i === links.length - 1} onClick={() => move(i, 1)}><Icon name="down" size={18} /></button>
                  <button className="icon-btn" aria-label={l.visible ? "Ocultar" : "Mostrar"} onClick={() => setLink(l.id, { visible: !l.visible })}>
                    <Icon name={l.visible ? "eye" : "eyeoff"} size={18} />
                  </button>
                  <button className="icon-btn" aria-label="Borrar" onClick={() => removeLink(l.id)} style={{ color: "var(--danger)" }}><Icon name="trash" size={18} /></button>
                </div>
              </div>
            ))}
            <button className="btn ghost" style={{ borderStyle: "dashed", color: "var(--mute)" }} onClick={addLink}>+ Agregar enlace</button>
          </section>

          <section className="box">
            <h2>Tu enlace</h2>
            <label className="f" htmlFor="username">Nombre de usuario
              <input
                id="username" className="input" autoCapitalize="none" value={p.username}
                onChange={(e) => set("username", e.target.value.toLowerCase().replace(/\s/g, ""))}
              />
              <span className={`hint ${userStatus === "free" ? "ok" : userStatus === "taken" || userStatus === "invalid" ? "bad" : ""}`}>
                {userStatus === "same" && `${site.replace(/^https?:\/\//, "")}/${p.username}`}
                {userStatus === "checking" && "Revisando…"}
                {userStatus === "free" && "Disponible. Ojo: tu QR anterior dejará de funcionar."}
                {userStatus === "taken" && "Ese nombre ya está ocupado."}
                {userStatus === "invalid" && "De 3 a 30 caracteres: minúsculas, números, guion o guion bajo."}
              </span>
            </label>
          </section>
        </>
      )}

      {(dirty || error) && (
        <div style={{ position: "sticky", bottom: "calc(12px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", gap: 8 }}>
          {error && <p className="err" style={{ background: "var(--card)", padding: "8px 12px", borderRadius: 12 }}>{error}</p>}
          {dirty && (
            <button className="btn primary" onClick={save} disabled={saving}>
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
          )}
        </div>
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
