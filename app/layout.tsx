import type { Metadata, Viewport } from "next";
import { siteUrl } from "@/lib/types";
import "./globals.css";

// Fuentes desde Google Fonts con <link>; next/font/google falló al compilar en Vercel.
const FONTS =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=JetBrains+Mono:wght@500&family=Manrope:wght@400;500;600;700&display=swap";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "Tarjeta digital", template: "%s · Tarjeta digital" },
  description: "Crea tu tarjeta de presentación digital: QR, guardar contacto, WhatsApp y tus enlaces en un solo lugar.",
  appleWebApp: { capable: true, title: "Tarjeta", statusBarStyle: "black-translucent" },
  icons: { icon: "/icono-192.png", apple: "/icono-192.png" },
};

export const viewport: Viewport = {
  themeColor: "#070d1a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={FONTS} />
      </head>
      <body>{children}</body>
    </html>
  );
}
