export type GiftType = "bank_transfer" | "gift_registry" | "custom_link" | "cash_message" | "none";
export type GiftAccount = { accountHolderFullName: string; accountAlias: string; bankName?: string; accountType?: string; cbuOrCvu?: string; currency: string; additionalNote?: string };
export type SectionVisualConfig = { backgroundColor?: string; textColor?: string; accentColor?: string; photoPath?: string; photoUrl?: string; photoOverlay?: number };
export type InvitationSectionStyles = { rsvp?: SectionVisualConfig; closing?: SectionVisualConfig };
export type GiftSectionConfig = { enabled: boolean; title: string; message: string; type: GiftType; protectedDetails: boolean; accounts: GiftAccount[]; externalUrl?: string; externalLabel?: string; styleVariant?: "minimal" | "dark_panel" | "editorial" | "photo_background" | "ornamental"; visual?: SectionVisualConfig };
export type SocialType = "instagram_handle" | "hashtag" | "custom" | "collaborative_album";
export type SocialPhotoSectionConfig = { enabled: boolean; title: string; description: string; socialType: SocialType; socialValue: string; socialUrl?: string; ctaLabel?: string; showCopyButton: boolean; visual?: SectionVisualConfig };
export const demoGift: GiftSectionConfig = { enabled: true, title: "Regalos", message: "Nada es más importante que tu presencia, pero si deseás hacerme un presente podés depositarlo en la siguiente cuenta:", type: "bank_transfer", protectedDetails: true, accounts: [{ accountHolderFullName: "Valeria & Julian Mendoza", accountAlias: "emilce.Julian.BODA", bankName: "Banco Galicia", accountType: "Caja de ahorro en pesos", cbuOrCvu: "1234567890123456789012", currency: "ARS" }], styleVariant: "editorial" };
export const demoSocial: SocialPhotoSectionConfig = { enabled: true, title: "Fotos sociales", description: "Queremos ver tus fotos. Podés etiquetarnos en todas tus publicaciones de Instagram.", socialType: "instagram_handle", socialValue: "emilceJulian", ctaLabel: "Abrir Instagram", showCopyButton: true };
export function normalizeAlias(value: string) { return value.trim().toUpperCase().replace(/\s+/g, ""); }
export function isValidArgentineAccount(value: string) { return /^\d{22}$/.test(value.replace(/\D/g, "")); }
export function isSafeExternalUrl(value: string) { try { return new URL(value).protocol === "https:"; } catch { return false; } }
export function normalizeInstagramHandle(value: string) { return value.trim().replace(/^@+/, "").replace(/\s/g, "").toLowerCase(); }
export function socialDisplayValue(config: SocialPhotoSectionConfig, mode: "preview" | "public") {
  if (!config.enabled || config.socialType === "collaborative_album" || (mode === "public" && !config.socialValue.trim())) return null;
  const rawValue = config.socialValue.trim() || (config.socialType === "hashtag" ? "tuevento" : "tuusuario");
  if (config.socialType === "instagram_handle") return `@${normalizeInstagramHandle(rawValue)}`;
  return rawValue.startsWith("#") ? rawValue : `#${rawValue}`;
}
export function formatAccount(value?: string) { const digits = (value ?? "").replace(/\D/g, ""); return digits ? digits.replace(/(.{4})/g, "$1 ").trim() : ""; }
