"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";

type PromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

// Agrega la tarjeta a la pantalla de inicio. Android/Chrome usa el aviso nativo;
// en iPhone no existe, así que se muestran los pasos.
export function InstallButton() {
  const [prompt, setPrompt] = useState<PromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [help, setHelp] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) setInstalled(true);
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as PromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  async function install() {
    if (prompt) {
      await prompt.prompt();
      await prompt.userChoice;
      setPrompt(null);
    } else {
      setHelp(true);
    }
  }

  const ios = typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);

  return (
    <>
      <button className="btn ghost" onClick={install}>
        <Icon name="install" size={18} /> Agregar a inicio
      </button>
      {help && (
        <div className="sheet-bg" onClick={(e) => e.target === e.currentTarget && setHelp(false)}>
          <div className="sheet" role="dialog" aria-label="Agregar a la pantalla de inicio">
            <div className="grab" />
            <h2 style={{ margin: 0, fontFamily: "var(--f-display)", fontSize: 20 }}>Agregar a inicio</h2>
            {ios ? (
              <ol>
                <li>Abre esta página en <b>Safari</b>.</li>
                <li>Toca <b>Compartir</b> (el cuadro con la flecha hacia arriba).</li>
                <li>Elige <b>Agregar a pantalla de inicio</b> y luego <b>Agregar</b>.</li>
              </ol>
            ) : (
              <ol>
                <li>Toca el menú <b>⋮</b> del navegador.</li>
                <li>Elige <b>Instalar aplicación</b> o <b>Agregar a pantalla principal</b>.</li>
              </ol>
            )}
            <p>Así abres tu tarjeta con un toque, como una app.</p>
            <button className="btn" onClick={() => setHelp(false)}>Entendido</button>
          </div>
        </div>
      )}
    </>
  );
}
