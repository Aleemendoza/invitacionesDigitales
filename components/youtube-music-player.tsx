"use client";

import { useCallback, useEffect, useRef } from "react";

const hiddenPlayerStyle = {
  position: "fixed",
  width: 1,
  height: 1,
  border: 0,
  opacity: 0,
  pointerEvents: "none",
} as const;

export function YouTubeMusicPlayer({ embedUrl, playing }: { embedUrl?: string; playing: boolean }) {
  const playerRef = useRef<HTMLIFrameElement>(null);
  const sendCommand = useCallback((command: "pauseVideo" | "playVideo") => {
    playerRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func: command, args: [] }), "https://www.youtube-nocookie.com");
  }, []);

  useEffect(() => {
    if (playing) sendCommand("playVideo");
    else sendCommand("pauseVideo");
  }, [playing, sendCommand]);

  if (!embedUrl || !playing) return null;

  return <iframe ref={playerRef} title="Música del evento" src={embedUrl} allow="autoplay; encrypted-media" onLoad={() => sendCommand("playVideo")} style={hiddenPlayerStyle} />;
}
