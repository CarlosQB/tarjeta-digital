import type { LinkIcon } from "@/lib/types";

type Name =
  | LinkIcon
  | "download"
  | "whatsapp"
  | "phone"
  | "mail"
  | "qr"
  | "install"
  | "pin"
  | "up"
  | "down"
  | "trash"
  | "eye"
  | "eyeoff"
  | "chart"
  | "edit"
  | "share"
  | "arrow";

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function Icon({ name, size = 20 }: { name: Name; size?: number }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", "aria-hidden": true };
  switch (name) {
    case "download":
      return <svg {...p} {...stroke} strokeWidth={2}><path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14" /></svg>;
    case "whatsapp":
      return (
        <svg {...p} fill="currentColor">
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.2 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.8-.2 1.5Z" />
        </svg>
      );
    case "phone":
      return <svg {...p} {...stroke}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></svg>;
    case "mail":
      return <svg {...p} {...stroke}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>;
    case "qr":
      return (
        <svg {...p} {...stroke}>
          <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
          <path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3" />
        </svg>
      );
    case "install":
      return <svg {...p} {...stroke}><rect x="6" y="2" width="12" height="20" rx="2" /><path d="M11 18h2" /></svg>;
    case "pin":
      return <svg {...p} {...stroke}><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>;
    case "up":
      return <svg {...p} {...stroke}><path d="m6 15 6-6 6 6" /></svg>;
    case "down":
      return <svg {...p} {...stroke}><path d="m6 9 6 6 6-6" /></svg>;
    case "trash":
      return <svg {...p} {...stroke}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>;
    case "eye":
      return <svg {...p} {...stroke}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>;
    case "eyeoff":
      return <svg {...p} {...stroke}><path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3 3.9M6.1 6.1C3.5 7.9 2 12 2 12s3.5 7 10 7c1.6 0 3-.4 4.2-1" /></svg>;
    case "chart":
      return <svg {...p} {...stroke}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>;
    case "edit":
      return <svg {...p} {...stroke}><path d="M4 20h4L19 9l-4-4L4 16v4ZM14 6l4 4" /></svg>;
    case "share":
      return <svg {...p} {...stroke}><path d="M12 3v13M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" /></svg>;
    case "arrow":
      return <svg {...p} {...stroke}><path d="m9 6 6 6-6 6" /></svg>;
    case "github":
      return (
        <svg {...p} fill="currentColor">
          <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9V21c0 .3.2.6.7.5A10 10 0 0 0 12 2Z" />
        </svg>
      );
    case "linkedin":
      return <svg {...p} fill="currentColor"><path d="M4.5 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM3 9h3v12H3zM9 9h3v1.7c.5-.9 1.7-1.9 3.5-1.9 3.2 0 3.5 2.1 3.5 4.8V21h-3v-6.5c0-1.5 0-3.2-2-3.2s-2.3 1.5-2.3 3.1V21H9z" /></svg>;
    case "instagram":
      return <svg {...p} {...stroke}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5v.01" /></svg>;
    case "x":
      return <svg {...p} {...stroke}><path d="M4 4l16 16M20 4 4 20" /></svg>;
    case "tiktok":
      return <svg {...p} {...stroke}><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.5 2.5 2.5 4.5 5 5" /></svg>;
    case "youtube":
      return <svg {...p} {...stroke}><rect x="2" y="5" width="20" height="14" rx="4" /><path d="m10 9 5 3-5 3V9Z" /></svg>;
    case "facebook":
      return <svg {...p} {...stroke}><path d="M15 3h-2a4 4 0 0 0-4 4v3H7v4h2v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h2V3Z" /></svg>;
    case "web":
    default:
      return <svg {...p} {...stroke}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" /></svg>;
  }
}
