import Link from "next/link";

type Tab = "tarjeta" | "editar" | "estadisticas";

export function PanelNav({ current }: { current: Tab }) {
  return (
    <>
      <div className="topbar">
        <Link href="/panel" className="brand"><i />Tarjeta digital</Link>
        <form action="/auth/salir" method="post">
          <button className="btn small ghost">Salir</button>
        </form>
      </div>
      <nav className="tabs" aria-label="Panel">
        <Link href="/panel" aria-current={current === "tarjeta" ? "page" : undefined}>Mi tarjeta</Link>
        <Link href="/panel/editar" aria-current={current === "editar" ? "page" : undefined}>Editar</Link>
        <Link href="/panel/estadisticas" aria-current={current === "estadisticas" ? "page" : undefined}>Estadísticas</Link>
      </nav>
    </>
  );
}
