"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Icon } from "@/components/icons";
import type { GiftSectionConfig } from "@/lib/event-sections";
import { GIFT_MESSAGE } from "@/lib/invitation-copy";

type GiftLoadState = "loading" | "ready" | "error";

export function GiftSection({ slug, fallback, theme = "ivory", photoUrl }: { slug: string; fallback: GiftSectionConfig; theme?: string; photoUrl?: string }) {
  const [config, setConfig] = useState<GiftSectionConfig>();
  const [state, setState] = useState<GiftLoadState>("loading");
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/public/events/${encodeURIComponent(slug)}/gift-details`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("missing");
        setConfig(await response.json());
        setState("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState("error");
      });
    return () => controller.abort();
  }, [slug]);

  const preview = config ?? fallback;
  if (!preview.enabled || preview.type === "none") return null;
  const isTransfer = preview.type === "bank_transfer";
  const account = config?.accounts?.[0];
  const canOpen = isTransfer && state === "ready" && Boolean(account?.accountAlias);
  const style = surfaceStyle(preview.visual, photoUrl);
  const body = <><p className="giftLabel"><Icon name="gift" size={20} /><span>Regalos</span></p><h2>{preview.title || "Un detalle para recordar"}</h2><p className="giftMessage">{preview.message || GIFT_MESSAGE}</p></>;

  if (preview.type === "cash_message") return <section className={`giftSection premiumGift gift-${theme} sectionSurface`} style={style}>{body}</section>;
  if (!isTransfer) return <section className={`giftSection premiumGift gift-${theme} sectionSurface`} style={style}>{body}{preview.externalUrl && <a className="giftCta" href={preview.externalUrl} target="_blank" rel="noreferrer">{preview.externalLabel ?? "Ver opciones"}<Icon name="arrow" size={15} /></a>}</section>;

  return <section id="regalos" className={`giftSection premiumGift gift-${theme} sectionSurface`} style={style}>
    {body}
    <button ref={trigger} className="giftCta" disabled={!canOpen} onClick={() => setOpen(true)}>
      <Icon name="gift" size={16} />{state === "loading" ? "Preparando datos" : canOpen ? "Ver datos del regalo" : "Datos no disponibles"}
    </button>
    {state === "error" && <p className="giftStatus">No pudimos obtener los datos del regalo. Probá de nuevo más tarde.</p>}
    {open && account && <GiftDialog account={account} onClose={() => { setOpen(false); trigger.current?.focus(); }} />}
  </section>;
}

function surfaceStyle(visual?: GiftSectionConfig["visual"], resolvedPhotoUrl?: string) {
  return {
    "--section-custom-bg": visual?.backgroundColor || "transparent",
    "--section-custom-fg": visual?.textColor || "currentColor",
    "--section-custom-accent": visual?.accentColor || "var(--event-accent)",
    "--section-custom-photo": (resolvedPhotoUrl || visual?.photoUrl) ? `url("${resolvedPhotoUrl || visual?.photoUrl}")` : "none",
    "--section-photo-overlay": String((visual?.photoOverlay ?? 55) / 100),
  } as CSSProperties;
}

function GiftDialog({ account, onClose }: { account: GiftSectionConfig["accounts"][number]; onClose: () => void }) {
  const [copied, setCopied] = useState("");
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    close.current?.focus();
    const listener = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [onClose]);
  const copy = async (value: string, label: string) => { await navigator.clipboard.writeText(value); setCopied(label); window.setTimeout(() => setCopied(""), 1500); };

  return <div className="giftBackdrop" onMouseDown={onClose}><section className="giftDialog" role="dialog" aria-modal="true" aria-labelledby="gift-title" onMouseDown={(event) => event.stopPropagation()}>
    <button ref={close} className="dialogClose" onClick={onClose} aria-label="Cerrar"><Icon name="close" /></button>
    <p className="eyebrow">Un detalle más</p><h2 id="gift-title">Datos para regalo</h2>
    <Field label="Titular" value={account.accountHolderFullName} />
    <Field label="Alias" value={account.accountAlias} copy={() => copy(account.accountAlias, "Alias")} />
    {account.bankName && <Field label="Banco" value={account.bankName} />}
    {account.cbuOrCvu && <Field label="CBU / CVU" value={account.cbuOrCvu} copy={() => copy(account.cbuOrCvu!, "CBU")} />}
    <p className="recipientCheck"><Icon name="check" size={17} /> Verificá el titular antes de transferir.</p>
    <p className="copyFeedback">{copied && `${copied} copiado`}</p>
  </section></div>;
}

function Field({ label, value, copy }: { label: string; value: string; copy?: () => void }) {
  return <div className="giftField"><small>{label}</small><b>{value}</b>{copy && <button onClick={copy}><Icon name="copy" size={15} />Copiar</button>}</div>;
}
