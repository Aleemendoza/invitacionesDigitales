"use client";

import { useState, type CSSProperties } from "react";
import { Icon } from "@/components/icons";
import { normalizeInstagramHandle, type SocialPhotoSectionConfig } from "@/lib/event-sections";
import { SOCIAL_PHOTOS_MESSAGE } from "@/lib/invitation-copy";

export function SocialPhotosSection({ config, theme = "ivory", photoUrl }: { config: SocialPhotoSectionConfig; theme?: string; photoUrl?: string }) {
  const [copied, setCopied] = useState(false);
  if (!config.enabled || config.socialType === "collaborative_album" || !config.socialValue.trim()) return null;

  const handle = normalizeInstagramHandle(config.socialValue);
  const value = config.socialType === "instagram_handle" ? `@${handle}` : config.socialValue.startsWith("#") ? config.socialValue : `#${config.socialValue}`;
  const url = config.socialUrl || (config.socialType === "instagram_handle" ? `https://instagram.com/${handle}` : config.socialType === "hashtag" ? `https://instagram.com/explore/tags/${encodeURIComponent(value.slice(1))}` : undefined);
  const copy = async () => {
    try { await navigator.clipboard?.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 1500); } catch { /* Clipboard access is optional; the profile link remains available. */ }
  };
  const style = { "--section-custom-bg": config.visual?.backgroundColor || "transparent", "--section-custom-fg": config.visual?.textColor || "currentColor", "--section-custom-accent": config.visual?.accentColor || "var(--event-accent)", "--section-custom-photo": (photoUrl || config.visual?.photoUrl) ? `url("${photoUrl || config.visual?.photoUrl}")` : "none", "--section-photo-overlay": String((config.visual?.photoOverlay ?? 55) / 100) } as CSSProperties;

  return <section className={`socialSection premiumSocial social-${theme} sectionSurface`} style={style}>
    <div className="premiumSocialCopy"><Icon name="instagram" /><div><p className="eyebrow">{config.title || "Fotos sociales"}</p><h2>{config.description || SOCIAL_PHOTOS_MESSAGE}</h2></div></div>
    <div className="premiumSocialActions">
      {url ? <a className="socialInstagramLink" href={url} target="_blank" rel="noreferrer" aria-label={`${config.ctaLabel || "Abrir Instagram"}: ${value}`}><span><Icon name="instagram" size={19} /></span><div><strong>{value}</strong><small>{config.ctaLabel || "Abrir Instagram"}</small></div></a> : <div className="socialInstagramLink isStatic"><span><Icon name="instagram" size={19} /></span><div><strong>{value}</strong><small>{config.ctaLabel || "Instagram"}</small></div></div>}
      {config.showCopyButton && <button className="socialButton" onClick={() => void copy()}><Icon name={copied ? "check" : "copy"} size={15} />{copied ? "Copiado" : "Copiar"}</button>}
    </div>
  </section>;
}
