"use client";

import { useEffect, useRef, useState, type CSSProperties, type TransitionEvent } from "react";
import { Icon } from "@/components/icons";
import { welcomeMessageForEventType, welcomeStyleForEventType, type WelcomeConfig } from "@/lib/invitation-welcome";
import "./invitation-welcome.css";
import "./invitation-confetti.css";

const pseudoRandom = (seed: number) => {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
};

const confetti = Array.from({ length: 30 }, (_, index) => {
  const duration = 7 + pseudoRandom(index + 11) * 4;
  return {
    index,
    style: {
      "--delay": `-${(pseudoRandom(index + 23) * duration).toFixed(2)}s`,
      "--drift": `${Math.round(-18 + pseudoRandom(index + 37) * 36)}vw`,
      "--duration": `${duration.toFixed(2)}s`,
      "--left": `${(2 + pseudoRandom(index + 3) * 96).toFixed(2)}%`,
      "--rotation": `${Math.round(pseudoRandom(index + 51) * 360)}deg`,
      "--turns": `${Math.round(360 + pseudoRandom(index + 71) * 720)}deg`,
    } as CSSProperties,
  };
});

export function InvitationWelcome({ title, eventType, message, backgroundUrl, accentColor, onStart, musicEmbedUrl, musicPlaying = false, onToggleMusic, compact = false }: { title: string; eventType: string; message?: string; backgroundUrl: string; accentColor: string; onStart: () => void; musicEmbedUrl?: string; musicPlaying?: boolean; onToggleMusic?: () => void; compact?: boolean }) {
  const [isOpening, setIsOpening] = useState(false);
  const fallbackTimer = useRef<number | undefined>(undefined);
  const completed = useRef(false);
  const style = { "--welcome-background": `url("${backgroundUrl}")`, "--welcome-accent": accentColor } as CSSProperties;
  const completeOpening = () => {
    if (completed.current) return;
    completed.current = true;
    if (fallbackTimer.current) window.clearTimeout(fallbackTimer.current);
    onStart();
  };
  const beginInvitation = () => {
    if (isOpening) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      completeOpening();
      return;
    }
    setIsOpening(true);
    fallbackTimer.current = window.setTimeout(completeOpening, 720);
  };
  const finishTransition = (event: TransitionEvent<HTMLElement>) => {
    if (isOpening && event.target === event.currentTarget && event.propertyName === "opacity") completeOpening();
  };
  useEffect(() => () => {
    if (fallbackTimer.current) window.clearTimeout(fallbackTimer.current);
  }, []);
  return <section className={`invitationWelcome welcome-${welcomeStyleForEventType(eventType)}${compact ? " isCompact" : ""}${isOpening ? " isOpening" : ""}`} style={style} onTransitionEnd={finishTransition}>
    <div className="welcomeConfetti" aria-hidden="true">{confetti.map(({ index, style }) => <i key={index} style={style} />)}</div>
    {musicEmbedUrl && onToggleMusic && <button className={`welcomeMusicToggle${musicPlaying ? " isPlaying" : ""}`} type="button" aria-label={musicPlaying ? "Silenciar música" : "Activar música"} aria-pressed={musicPlaying} onClick={onToggleMusic}><Icon name={musicPlaying ? "music" : "musicOff"} size={19} /></button>}
    <div className="welcomeContent"><p className="eyebrow">TE DAMOS LA BIENVENIDA</p><h1>{title || "Tu celebración"}</h1><p>{message?.trim() || welcomeMessageForEventType(eventType, title)}</p><button type="button" disabled={isOpening} onClick={beginInvitation}>Comenzar <span aria-hidden="true">→</span></button></div>
  </section>;
}

export type { WelcomeConfig };
