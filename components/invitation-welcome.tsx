"use client";

import { useState, type CSSProperties } from "react";
import { Icon } from "@/components/icons";
import { welcomeMessageForEventType, welcomeStyleForEventType, type WelcomeConfig } from "@/lib/invitation-welcome";
import "./invitation-welcome.css";

const confetti = Array.from({ length: 22 }, (_, index) => index);

export function InvitationWelcome({ title, eventType, message, backgroundUrl, accentColor, onStart, musicEmbedUrl, musicPlaying = false, onToggleMusic, compact = false }: { title: string; eventType: string; message?: string; backgroundUrl: string; accentColor: string; onStart: () => void; musicEmbedUrl?: string; musicPlaying?: boolean; onToggleMusic?: () => void; compact?: boolean }) {
  const [isOpening, setIsOpening] = useState(false);
  const style = { "--welcome-background": `url("${backgroundUrl}")`, "--welcome-accent": accentColor } as CSSProperties;
  const beginInvitation = () => {
    if (isOpening) return;
    setIsOpening(true);
    window.setTimeout(onStart, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 3000);
  };
  return <section className={`invitationWelcome welcome-${welcomeStyleForEventType(eventType)}${compact ? " isCompact" : ""}${isOpening ? " isOpening" : ""}`} style={style}>
    <div className="welcomeConfetti" aria-hidden="true">{confetti.map((item) => <i key={item} style={{ "--piece": item } as CSSProperties} />)}</div>
    {musicEmbedUrl && onToggleMusic && <><button className={`welcomeMusicToggle${musicPlaying ? " isPlaying" : ""}`} type="button" aria-label={musicPlaying ? "Silenciar música" : "Activar música"} aria-pressed={musicPlaying} onClick={onToggleMusic}><Icon name={musicPlaying ? "music" : "musicOff"} size={19} /></button>{musicPlaying && <iframe className="welcomeMusicPlayer" title="Música del evento" src={musicEmbedUrl} allow="autoplay; encrypted-media" />}</>}
    <div className="welcomeContent"><p className="eyebrow">TE DAMOS LA BIENVENIDA</p><h1>{title || "Tu celebración"}</h1><p>{message?.trim() || welcomeMessageForEventType(eventType, title)}</p><button type="button" disabled={isOpening} onClick={beginInvitation}>Comenzar <span aria-hidden="true">→</span></button></div>
  </section>;
}

export type { WelcomeConfig };
