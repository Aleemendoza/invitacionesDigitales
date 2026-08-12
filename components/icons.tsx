import type { ReactNode, SVGProps } from "react";

export type IconName = "calendar" | "pin" | "timeline" | "gallery" | "hanger" | "dress" | "suit" | "gift" | "camera" | "mail" | "menu" | "music" | "musicOff" | "arrow" | "close" | "copy" | "check" | "plus" | "edit" | "trash" | "link" | "share" | "users";

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
};

export function Icon({ name, size = 24, ...props }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
