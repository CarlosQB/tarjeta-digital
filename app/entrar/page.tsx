"use client";

import Link from "next/link";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function Entrar() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      return setError(
        /not confirmed/i.test(error.message)
          ? "Primero confirma tu correo con el enlace que te mandamos."
          : "Correo o contraseña incorrectos."
      );
    }
    window.location.href = "/panel";
  }

  async function reset() {
    setError("");
    if (!email) return setError("Escribe tu correo y vuelve a tocar «Olvidé mi contraseña».");
    await supabaseBrowser().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/nueva-contrasena`,
    });
    setInfo("Si el correo tiene cuenta, te llegará un enlace para cambiar la contraseña.");
  }

  return (
    <main className="page auth">
      <Link href="/" className="brand"><i />Tarjeta digital</Link>
      <h1>Entrar</h1>
      <form className="box" onSubmit={submit}>
        <label className="f" htmlFor="email">
          Correo
          <input id="email" type="email" className="input" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="f" htmlFor="password">
          Contraseña
          <input id="password" type="password" className="input" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="err">{error}</p>}
        {info && <p className="okmsg">{info}</p>}
        <button className="btn primary" disabled={busy}>{busy ? "Entrando…" : "Entrar"}</button>
        <button type="button" className="btn ghost small" style={{ alignSelf: "center", border: 0, color: "var(--mute)" }} onClick={reset}>
          Olvidé mi contraseña
        </button>
      </form>
      <p className="alt">¿No tienes cuenta? <Link href="/registro">Crea tu tarjeta</Link></p>
    </main>
  );
}
