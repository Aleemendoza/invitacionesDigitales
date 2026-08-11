"use client";
import { useEffect, useRef, useState } from "react";
import type { GiftSectionConfig } from "@/lib/event-sections";

export function GiftSection({ slug, fallback, theme = "ivory" }: { slug: string; fallback: GiftSectionConfig; theme?: string }) {
  const [config, setConfig] = useState(fallback); const [open, setOpen] = useState(false); const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => { fetch(`/api/public/events/${encodeURIComponent(slug)}/gift-details`).then(async r => r.ok ? setConfig(await r.json()) : undefined).catch(() => undefined); }, [slug]);
  if (!config.enabled || config.type === "none") return null;
  const account = config.accounts[0];
  if (config.type === "cash_message") return <section className={`giftSection gift-${theme}`}><p className="sectionIcon">✦</p><p className="eyebrow">{config.title.toUpperCase()}</p><h2>{config.message}</h2></section>;
  if (config.type !== "bank_transfer") return <section className={`giftSection gift-${theme}`}><p className="eyebrow">{config.title.toUpperCase()}</p><h2>{config.message}</h2>{config.externalUrl && <a className="giftCta" href={config.externalUrl} target="_blank" rel="noreferrer">{config.externalLabel ?? "Ver opciones"} →</a>}</section>;
  return <section id="regalos" className={`giftSection gift-${theme}`}><p className="sectionIcon">⌁</p><p className="eyebrow">{config.title.toUpperCase()}</p><h2>{config.message}</h2><button ref={trigger} className="giftCta" onClick={() => setOpen(true)}>Ver datos del regalo →</button>{open && <GiftDialog config={config} account={account} onClose={() => { setOpen(false); trigger.current?.focus(); }} theme={theme}/>}</section>;
}
function GiftDialog({ config, account, onClose, theme }: { config: GiftSectionConfig; account: GiftSectionConfig["accounts"][number]; onClose: () => void; theme: string }) {
  const [copied, setCopied] = useState(""); const close = useRef<HTMLButtonElement>(null);
  useEffect(() => { close.current?.focus(); const key = (event: KeyboardEvent) => event.key === "Escape" && onClose(); document.addEventListener("keydown", key); return () => document.removeEventListener("keydown", key); }, [onClose]);
  const copy = async (value: string, label: string) => { try { await navigator.clipboard.writeText(value); } catch { const area = document.createElement("textarea"); area.value = value; document.body.append(area); area.select(); document.execCommand("copy"); area.remove(); } setCopied(label); window.setTimeout(() => setCopied(""), 1500); };
  return <div className="giftBackdrop" role="presentation" onMouseDown={onClose}><section className={`giftDialog gift-${theme}`} role="dialog" aria-modal="true" aria-labelledby="gift-title" onMouseDown={event => event.stopPropagation()}><button ref={close} className="dialogClose" onClick={onClose} aria-label="Cerrar datos del regalo">×</button><p className="eyebrow">UN DETALLE MÁS</p><h2 id="gift-title">Datos para regalo</h2><GiftField label="Titular" value={account.accountHolderFullName}/><GiftField label="Alias" value={account.accountAlias} action={() => copy(account.accountAlias, "Alias")}/>{account.bankName && <GiftField label="Banco" value={account.bankName}/>} {account.accountType && <GiftField label="Cuenta" value={account.accountType}/>} {account.cbuOrCvu && <GiftField label="CBU / CVU" value={account.cbuOrCvu} action={() => copy(account.cbuOrCvu!, "CBU")}/>}<p className="recipientCheck">✓ Antes de transferir verificá que figure <b>{account.accountHolderFullName}</b>.</p><p className="copyFeedback" aria-live="polite">{copied ? `${copied} copiado` : ""}</p></section></div>;
}
function GiftField({ label, value, action }: { label: string; value: string; action?: () => void }) { return <div className="giftField"><small>{label}</small><b>{value}</b>{action && <button onClick={action}>Copiar</button>}</div>; }
