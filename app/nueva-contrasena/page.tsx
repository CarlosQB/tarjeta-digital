"use client";

import Link from "next/link";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function NuevaContrasena() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("La contraseña necesita al menos 8 caracteres.");
    setBusy(true);
    const { error } = await supabaseBrowser().auth.updateUser({ password });
    setBusy(false);
    if (error) return setError("El enlace ya caducó. Pide otro desde «Entrar».");
    window.location.href = "/panel";
  }

  return (
    <main className="page auth">
      <Link href="/" className="brand"><i />Tarjeta digital</Link>
      <h1>Nueva contraseña</h1>
      <form className="box" onSubmit={submit}>
        <label className="f" htmlFor="password">
          Contraseña nueva
          <input id="password" type="password" className="input" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="err">{error}</p>}
        <button className="btn primary" disabled={busy}>{busy ? "Guardando…" : "Guardar contraseña"}</button>
      </form>
    </main>
  );
}
