"use client";

import { type CSSProperties } from "react";
import { welcomeMessageForEventType, welcomeStyleForEventType, type WelcomeConfig } from "@/lib/invitation-welcome";
import "./invitation-welcome.css";

const confetti = Array.from({ length: 22 }, (_, index) => index);

export function InvitationWelcome({ title, eventType, message, backgroundUrl, accentColor, onStart, compact = false }: { title: string; eventType: string; message?: string; backgroundUrl: string; accentColor: string; onStart: () => void; compact?: boolean }) {
  const style = { "--welcome-background": `url("${backgroundUrl}")`, "--welcome-accent": accentColor } as CSSProperties;
  return <section className={`invitationWelcome welcome-${welcomeStyleForEventType(eventType)}${compact ? " isCompact" : ""}`} style={style}>
    <div className="welcomeConfetti" aria-hidden="true">{confetti.map((item) => <i key={item} style={{ "--piece": item } as CSSProperties} />)}</div>
    <div className="welcomeContent"><p className="eyebrow">TE DAMOS LA BIENVENIDA</p><h1>{title || "Tu celebración"}</h1><p>{message?.trim() || welcomeMessageForEventType(eventType, title)}</p><button type="button" onClick={onStart}>Comenzar <span aria-hidden="true">→</span></button></div>
  </section>;
}

export type { WelcomeConfig };
