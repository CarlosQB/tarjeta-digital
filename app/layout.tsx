import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Manrope, JetBrains_Mono } from "next/font/google";
import { siteUrl } from "@/lib/types";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["500"], variable: "--font-mono" });

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
    <html lang="es-MX" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
