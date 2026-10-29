import Link from "next/link";
import { Icon } from "@/components/Icon";
import { supabaseServer } from "@/lib/supabase-server";

export default async function Home() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="page landing">
      <div className="topbar">
        <Link href="/" className="brand"><i />Tarjeta digital</Link>
        {user ? (
          <Link href="/panel" className="btn small">Mi panel</Link>
        ) : (
          <Link href="/entrar" className="btn small">Entrar</Link>
        )}
      </div>

      <h1>Tu tarjeta de presentación, <em>en un QR</em>.</h1>
      <p className="lead">
        Comparte tu contacto, tu WhatsApp y tus redes con un solo enlace. Quien la abre te guarda en su celular con un toque.
      </p>

      <Link href={user ? "/panel" : "/registro"} className="btn primary">
        {user ? "Ir a mi tarjeta" : "Crear mi tarjeta gratis"}
      </Link>

      <div className="features">
        <div className="feature">
          <span className="ic"><Icon name="qr" /></span>
          <div><b>Tu QR listo para imprimir</b><span>Descárgalo en PNG y ponlo en tu gafete, tu local o tu currículum.</span></div>
        </div>
        <div className="feature">
          <span className="ic"><Icon name="download" /></span>
          <div><b>Guardar contacto en un toque</b><span>Descarga tu nombre, teléfono, correo y enlaces directo a la agenda.</span></div>
        </div>
        <div className="feature">
          <span className="ic"><Icon name="edit" /></span>
          <div><b>Edítala cuando quieras</b><span>Cambia tus datos, foto, color y enlaces desde el celular. El QR no cambia.</span></div>
        </div>
        <div className="feature">
          <span className="ic"><Icon name="chart" /></span>
          <div><b>Mira quién la abre</b><span>Visitas, escaneos y en qué botón tocan más. Sin guardar datos de nadie.</span></div>
        </div>
      </div>
    </main>
  );
}
