"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

const USERNAME_RE = /^[a-z0-9][a-z0-9_-]{2,29}$/;

export default function Registro() {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "free" | "taken" | "invalid">("idle");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!username) return setStatus("idle");
    if (!USERNAME_RE.test(username)) return setStatus("invalid");
    setStatus("checking");
    const t = setTimeout(async () => {
      const { data } = await supabaseBrowser().rpc("username_available", { p_username: username });
      setStatus(data ? "free" : "taken");
    }, 350);
    return () => clearTimeout(t);
  }, [username]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (status !== "free") return setError("Elige un nombre de usuario disponible.");
    if (password.length < 8) return setError("La contraseña necesita al menos 8 caracteres.");
    setBusy(true);
    const { data, error } = await supabaseBrowser().auth.signUp({
      email,
      password,
      options: {
        data: { username, full_name: fullName.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/panel`,
      },
    });
    setBusy(false);
    if (error) return setError(traducir(error.message));
    if (data.session) window.location.href = "/panel";
    else setSent(true);
  }

  if (sent) {
    return (
      <main className="page auth">
        <Link href="/" className="brand"><i />Tarjeta digital</Link>
        <h1>Revisa tu correo</h1>
        <p className="lead" style={{ color: "var(--mute)" }}>
          Te mandamos un enlace a <b>{email}</b>. Ábrelo para activar tu cuenta y entrar a tu panel.
        </p>
      </main>
    );
  }

  return (
    <main className="page auth">
      <Link href="/" className="brand"><i />Tarjeta digital</Link>
      <h1>Crea tu tarjeta</h1>
      <form className="box" onSubmit={submit}>
        <label className="f" htmlFor="username">
          Tu enlace
          <input
            id="username" className="input" autoCapitalize="none" autoComplete="username" required
            placeholder="tu-nombre" value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
          />
          <span className={`hint ${status === "free" ? "ok" : status === "taken" || status === "invalid" ? "bad" : ""}`}>
            {status === "idle" && "Así quedará tu tarjeta: /tu-nombre"}
            {status === "checking" && "Revisando…"}
            {status === "free" && `Disponible: /${username}`}
            {status === "taken" && "Ese nombre ya está ocupado."}
            {status === "invalid" && "De 3 a 30 caracteres: letras minúsculas, números, guion o guion bajo."}
          </span>
        </label>
        <label className="f" htmlFor="fullName">
          Nombre completo
          <input id="fullName" className="input" autoComplete="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </label>
        <label className="f" htmlFor="email">
          Correo
          <input id="email" type="email" className="input" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <span className="hint">Se mostrará en tu tarjeta; puedes quitarlo o cambiarlo en tu panel.</span>
        </label>
        <label className="f" htmlFor="password">
          Contraseña
          <input id="password" type="password" className="input" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          <span className="hint">Mínimo 8 caracteres.</span>
        </label>
        {error && <p className="err">{error}</p>}
        <button className="btn primary" disabled={busy}>{busy ? "Creando…" : "Crear cuenta"}</button>
      </form>
      <p className="alt">¿Ya tienes cuenta? <Link href="/entrar">Entrar</Link></p>
    </main>
  );
}

function traducir(msg: string) {
  if (/already registered/i.test(msg)) return "Ese correo ya tiene cuenta. Entra con tu contraseña.";
  if (/database error/i.test(msg)) return "No se pudo crear la cuenta. Prueba con otro nombre de usuario.";
  if (/rate limit/i.test(msg)) return "Demasiados intentos. Espera un minuto y vuelve a probar.";
  return msg;
}
