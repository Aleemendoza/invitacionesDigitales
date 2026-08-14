"use client";

type GalleryPhoto = { storage_path: string; url?: string };

/** A duplicated, CSS-driven rail avoids scroll resets and stays seamless at every loop. */
export function AutoGallery({ photos }: { photos: GalleryPhoto[] }) {
  const moving = photos.length > 1;
  const items = moving ? [...photos, ...photos] : photos;
  return <div className={`piGalleryCarousel ${moving ? "isMoving" : ""}`} aria-label="Galería de fotos">
    <div className="piGalleryTrack">
      <div className="piGalleryRail">
        {items.map((item, index) => {
          const duplicate = moving && index >= photos.length;
          return <img key={`${item.storage_path}-${index}`} src={item.url} alt={duplicate ? "" : `Foto ${index + 1} del evento`} aria-hidden={duplicate || undefined} loading={index > 1 ? "lazy" : "eager"} />;
        })}
      </div>
    </div>
  </div>;
}
