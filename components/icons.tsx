import type { ReactNode, SVGProps } from "react";

export type IconName = "calendar" | "pin" | "timeline" | "gallery" | "hanger" | "dress" | "suit" | "gift" | "camera" | "mail" | "menu" | "music" | "musicOff" | "arrow" | "close" | "copy" | "check" | "plus" | "edit" | "trash" | "link" | "share" | "users" | "rsvp" | "trivia" | "duo" | "countdown" | "map" | "sparkles" | "songRequest" | "diamond" | "instagram" | "card" | "photoHeart" | "story" | "weddingParty" | "smile" | "hand" | "bolt" | "wallet" | "bulb" | "wand";

const paths: Record<IconName, ReactNode> = {
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4m10-4v4M3 10h18" /></>,
  pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  timeline: <><path d="M4 4v16m5-16v16m5-16v16m5-16v16M3 8h18M3 16h18" /></>,
  gallery: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8" cy="9" r="1.5" /><path d="m4 18 5-5 3 3 3-4 5 6" /></>,
  hanger: <><path d="M12 4a2.5 2.5 0 1 1-2.5 2.5" /><path d="m10 6.5-7 9.5h18l-7-9.5" /></>,
  dress: <><path d="M9 3h6l1 5-2 2 5 10H5l5-10-2-2Z" /><path d="M9 3c.2 2 1.2 3 3 3s2.8-1 3-3M8 20h8" /></>,
  suit: <><path d="m8 3 4 4 4-4 4 6-3 3v8H7v-8L4 9Z" /><path d="m12 7-2 5 2 2 2-2-2-5M12 14v6" /></>,
  gift: <><rect x="4" y="9" width="16" height="11" rx="1" /><path d="M3 9h18M12 9v11M12 9H8.5C5 9 5 4 8.5 4 11 4 12 9 12 9Zm0 0h3.5C19 9 19 4 15.5 4 13 4 12 9 12 9Z" /></>,
  camera: <><path d="M4 7h3l1.5-2h7L17 7h3v12H4Z" /><circle cx="12" cy="13" r="4" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 7 9-7" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  music: <><path d="M9 18V6l10-2v12" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="16" r="2" /></>,
  musicOff: <><path d="M9 18V6l10-2v12" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="16" r="2" /><path d="m4 4 16 16" /></>,
  arrow: <path d="m5 12 7 7 7-7M12 19V5" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  copy: <><rect x="8" y="8" width="11" height="12" rx="2" /><path d="M5 16H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  edit: <><path d="m4 20 4.2-1 10-10a2.8 2.8 0 0 0-4-4l-10 10Z" /><path d="m12.5 6.5 4 4" /></>,
  trash: <><path d="M4 7h16M10 11v5m4-5v5M9 4h6l1 3H8Z" /><path d="M6 7l1 14h10l1-14" /></>,
  link: <><path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" /><path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1" /></>,
  share: <><path d="M7 12h10M13 8l4 4-4 4" /><path d="M4 5v14h12" /></>,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3 20c.5-4 3-6 6-6s5.5 2 6 6M17 8a3 3 0 0 1 0 6m1 1c2 0 3.5 1.5 4 4" /></>,
  rsvp: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m7 12 3 3 6-7M7 7h.01" /></>,
  trivia: <><path d="M5 5h14v11H9l-4 4Z" /><path d="M9 9.5a3 3 0 1 1 4.5 2.6c-.9.5-1.5 1-1.5 2.1M12 16h.01" /></>,
  duo: <><path d="M8 4 5 8l2 12h10l2-12-3-4Z" /><path d="m12 4-2 5 2 3 2-3-2-5M4 12h16" /></>,
  countdown: <><circle cx="12" cy="13" r="8" /><path d="M12 9v4l3 2M9 3h6M12 3v2" /></>,
  map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z" /><path d="M9 3v15m6-12v15" /></>,
  sparkles: <><path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4ZM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7ZM5 16l.6 1.7L7.3 18l-1.7.6L5 20.3l-.6-1.7L2.7 18l1.7-.3Z" /></>,
  songRequest: <><path d="M8 18V6l10-2v12" /><circle cx="6" cy="18" r="2" /><circle cx="16" cy="16" r="2" /><path d="M3 4h4m-2-2v4" /></>,
  diamond: <><path d="m5 8 3-4h8l3 4-7 12Z" /><path d="m5 8h14M8 4l4 4 4-4m-4 4v12" /></>,
  instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" /></>,
  card: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 9h18M7 15h3" /></>,
  photoHeart: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m5 17 4-4 3 3 2-2 5 3" /><path d="M12 10.5c-2.5-2.5-5 .9 0 4.1 5-3.2 2.5-6.6 0-4.1Z" /></>,
  story: <><path d="M5 4h11l3 3v13H5Z" /><path d="M16 4v4h3M8 12h8M8 16h6M8 8h3" /></>,
  weddingParty: <><circle cx="8" cy="7" r="2.5" /><circle cx="16" cy="7" r="2.5" /><path d="M3 20c.5-4 2.2-6.5 5-6.5S12.5 16 13 20m-1-6.2c1-.2 1.8-.3 2.7-.3 2.9 0 4.8 2.5 5.3 6.5" /></>,
  smile: <><circle cx="12" cy="12" r="9" /><path d="M8 14s1.3 2 4 2 4-2 4-2M9 9h.01M15 9h.01" /></>,
  hand: <><path d="M8 12V5a1.5 1.5 0 0 1 3 0v5V3.5a1.5 1.5 0 0 1 3 0V10V5a1.5 1.5 0 0 1 3 0v7l1.2-1.2a1.5 1.5 0 0 1 2.1 2.1L17 17.2A5 5 0 0 1 13.5 19H12a5 5 0 0 1-5-5v-2a1.5 1.5 0 0 1 3 0Z" /></>,
  bolt: <path d="m13 2-8 12h6l-1 8 9-13h-6Z" />,
  wallet: <><path d="M4 7a3 3 0 0 1 3-3h11v16H7a3 3 0 0 1-3-3Z" /><path d="M4 8h14v8h-4a2 2 0 1 1 0-4h4M14 14h.01" /></>,
  bulb: <><path d="M8 15c-1.3-1.1-2-2.7-2-4.5a6 6 0 1 1 12 0c0 1.8-.7 3.4-2 4.5-.8.7-1 1.3-1 2.5H9c0-1.2-.2-1.8-1-2.5ZM9 21h6M9 18h6" /></>,
  wand: <><path d="m5 19 10-10 3 3L8 22Z" /><path d="m14 4 1-2 1 2 2 1-2 1-1 2-1-2-2-1ZM5 7l.7-1.7L7.5 5l-1.8-.7L5 2.5l-.7 1.8L2.5 5l1.8.3Z" /></>,
};

export function Icon({ name, size = 24, ...props }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
