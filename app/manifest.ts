import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tarjeta digital",
    short_name: "Tarjeta",
    start_url: "/panel",
    display: "standalone",
    background_color: "#070d1a",
    theme_color: "#070d1a",
    icons: [
      { src: "/icono-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icono-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
