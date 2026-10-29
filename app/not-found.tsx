import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page auth">
      <Link href="/" className="brand"><i />Tarjeta digital</Link>
      <h1>Esta tarjeta no existe</h1>
      <p style={{ color: "var(--mute)", margin: 0 }}>Revisa que el enlace esté bien escrito, o crea la tuya.</p>
      <Link href="/registro" className="btn primary">Crear mi tarjeta</Link>
    </main>
  );
}
