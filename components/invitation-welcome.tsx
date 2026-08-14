"use client";

import { useState, type CSSProperties } from "react";
import { welcomeMessageForEventType, welcomeStyleForEventType, type WelcomeConfig } from "@/lib/invitation-welcome";
import "./invitation-welcome.css";

const confetti = Array.from({ length: 22 }, (_, index) => index);

export function InvitationWelcome({ title, eventType, message, backgroundUrl, accentColor, onStart, compact = false }: { title: string; eventType: string; message?: string; backgroundUrl: string; accentColor: string; onStart: () => void; compact?: boolean }) {
  const [isOpening, setIsOpening] = useState(false);
  const style = { "--welcome-background": `url("${backgroundUrl}")`, "--welcome-accent": accentColor } as CSSProperties;
  const beginInvitation = () => {
    if (isOpening) return;
    setIsOpening(true);
    window.setTimeout(onStart, 640);
  };
  return <section className={`invitationWelcome welcome-${welcomeStyleForEventType(eventType)}${compact ? " isCompact" : ""}${isOpening ? " isOpening" : ""}`} style={style}>
    <div className="welcomeConfetti" aria-hidden="true">{confetti.map((item) => <i key={item} style={{ "--piece": item } as CSSProperties} />)}</div>
    <div className="welcomeContent"><p className="eyebrow">TE DAMOS LA BIENVENIDA</p><h1>{title || "Tu celebración"}</h1><p>{message?.trim() || welcomeMessageForEventType(eventType, title)}</p><button type="button" disabled={isOpening} onClick={beginInvitation}>Comenzar <span aria-hidden="true">→</span></button></div>
  </section>;
}

export type { WelcomeConfig };
