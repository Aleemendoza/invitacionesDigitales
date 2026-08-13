"use client";

import { useEffect, useRef, useState } from "react";

type GalleryPhoto = { storage_path: string; url?: string };

export function AutoGallery({ photos }: { photos: GalleryPhoto[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const element = track.current;
    if (!element || paused || photos.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      const firstCard = element.firstElementChild as HTMLElement | null;
      if (!firstCard) return;
      const next = firstCard.offsetWidth + 10;
      const atEnd = element.scrollLeft + element.clientWidth >= element.scrollWidth - 4;
      element.scrollTo({ left: atEnd ? 0 : element.scrollLeft + next, behavior: "smooth" });
    }, 3200);

    return () => window.clearInterval(timer);
  }, [paused, photos.length]);

  return <div className="piGalleryCarousel" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)}>
    <div className="piGalleryTrack" ref={track} tabIndex={0} aria-label="Galería de fotos, se desplaza automáticamente">
      {photos.map((item, index) => <img key={item.storage_path} src={item.url} alt={"Foto " + (index + 1) + " del evento"} loading={index > 1 ? "lazy" : "eager"} />)}
    </div>
    {photos.length > 1 && <span className="piGalleryHint">Deslizá para ver más</span>}
  </div>;
}
