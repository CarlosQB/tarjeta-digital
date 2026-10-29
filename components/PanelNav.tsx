import Link from "next/link";

export function PanelNav({ current, username }: { current: "editar" | "estadisticas"; username: string }) {
  return (
    <>
      <div className="topbar">
        <Link href="/" className="brand"><i />Tarjeta digital</Link>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href={`/${username}`} className="btn small" target="_blank">Ver tarjeta</Link>
          <form action="/auth/salir" method="post">
            <button className="btn small ghost">Salir</button>
          </form>
        </div>
      </div>
      <nav className="tabs" aria-label="Panel">
        <Link href="/panel" aria-current={current === "editar" ? "page" : undefined}>Editar</Link>
        <Link href="/panel/estadisticas" aria-current={current === "estadisticas" ? "page" : undefined}>Estadísticas</Link>
      </nav>
    </>
  );
}
