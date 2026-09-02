"use client";

import { useState, type CSSProperties } from "react";
import { Icon } from "@/components/icons";
import { normalizeInstagramHandle, socialDisplayValue, type SocialPhotoSectionConfig } from "@/lib/event-sections";
import { SOCIAL_PHOTOS_MESSAGE } from "@/lib/invitation-copy";

export function SocialPhotosSection({ config, theme = "ivory", photoUrl, mode = "public" }: { config: SocialPhotoSectionConfig; theme?: string; photoUrl?: string; mode?: "preview" | "public" }) {
  const [copied, setCopied] = useState(false);
  const value = socialDisplayValue(config, mode);
  if (!value) return null;
  const handle = normalizeInstagramHandle(value);
  const url = config.socialUrl || (config.socialType === "instagram_handle" ? `https://instagram.com/${handle}` : config.socialType === "hashtag" ? `https://instagram.com/explore/tags/${encodeURIComponent(value.slice(1))}` : undefined);
  const copy = async () => {
    if (mode === "preview") return;
    try { await navigator.clipboard?.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 1500); } catch { /* Clipboard access is optional; the profile link remains available. */ }
  };
  const style = { "--section-custom-bg": config.visual?.backgroundColor || "transparent", "--section-custom-fg": config.visual?.textColor || "currentColor", "--section-custom-accent": config.visual?.accentColor || "var(--event-accent)", "--section-custom-photo": (photoUrl || config.visual?.photoUrl) ? `url("${photoUrl || config.visual?.photoUrl}")` : "none", "--section-photo-overlay": String((config.visual?.photoOverlay ?? 55) / 100) } as CSSProperties;

  return <section className={`socialSection premiumSocial social-${theme} sectionSurface`} style={style}>
    <div className="premiumSocialCopy"><Icon name="instagram" /><div><p className="eyebrow">{config.title || "Fotos sociales"}</p><h2>{config.description || SOCIAL_PHOTOS_MESSAGE}</h2></div></div>
    <div className="premiumSocialActions">
      {url && mode === "public" ? <a className="socialInstagramLink" href={url} target="_blank" rel="noreferrer" aria-label={`${config.ctaLabel || "Abrir Instagram"}: ${value}`}><span><Icon name="instagram" size={19} /></span><div><strong>{value}</strong><small>{config.ctaLabel || "Abrir Instagram"}</small></div></a> : <div className="socialInstagramLink isStatic"><span><Icon name="instagram" size={19} /></span><div><strong>{value}</strong><small>{config.ctaLabel || "Instagram"}</small></div></div>}
      {config.showCopyButton && <button className="socialButton" onClick={() => void copy()}><Icon name={copied ? "check" : "copy"} size={15} />{copied ? "Copiado" : "Copiar"}</button>}
    </div>
  </section>;
}
