"use client";

import { useState, type CSSProperties } from "react";
import { Icon } from "@/components/icons";
import { normalizeInstagramHandle, type SocialPhotoSectionConfig } from "@/lib/event-sections";
import { SOCIAL_PHOTOS_MESSAGE } from "@/lib/invitation-copy";

export function SocialPhotosSection({ config, theme = "ivory", photoUrl }: { config: SocialPhotoSectionConfig; theme?: string; photoUrl?: string }) {
  const [copied, setCopied] = useState(false);
  if (!config.enabled || config.socialType === "collaborative_album" || !config.socialValue.trim()) return null;

  const value = config.socialType === "instagram_handle"
    ? `@${normalizeInstagramHandle(config.socialValue)}`
    : config.socialValue.startsWith("#") ? config.socialValue : `#${config.socialValue}`;
  const url = config.socialUrl || (config.socialType === "instagram_handle" ? `https://instagram.com/${normalizeInstagramHandle(config.socialValue)}` : undefined);
  const copy = async () => {
    await navigator.clipboard?.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const style = {
    "--section-custom-bg": config.visual?.backgroundColor || "transparent",
    "--section-custom-fg": config.visual?.textColor || "currentColor",
    "--section-custom-accent": config.visual?.accentColor || "var(--event-accent)",
    "--section-custom-photo": (photoUrl || config.visual?.photoUrl) ? `url("${photoUrl || config.visual?.photoUrl}")` : "none",
    "--section-photo-overlay": String((config.visual?.photoOverlay ?? 55) / 100),
  } as CSSProperties;
  return <section className={`socialSection premiumSocial social-${theme} sectionSurface`} style={style}>
    <div className="premiumSocialCopy">
      <Icon name="camera" />
      <div><p className="eyebrow">{config.title || "Fotos sociales"}</p><h2>{config.description || SOCIAL_PHOTOS_MESSAGE}</h2></div>
    </div>
    <div className="premiumSocialActions">
      <strong>{value}</strong>
      {config.showCopyButton && <button className="socialButton" onClick={copy}><Icon name={copied ? "check" : "copy"} size={15} />{copied ? "Copiado" : "Copiar"}</button>}
      {url && <a className="socialLink" href={url} target="_blank" rel="noreferrer">{config.ctaLabel ?? "Abrir Instagram"}<Icon name="arrow" size={14} /></a>}
    </div>
  </section>;
}
