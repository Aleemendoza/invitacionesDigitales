export type GiftType = "bank_transfer" | "gift_registry" | "custom_link" | "cash_message" | "none";
export type GiftAccount = { accountHolderFullName: string; accountAlias: string; bankName?: string; accountType?: string; cbuOrCvu?: string; currency: string; additionalNote?: string };
export type GiftSectionConfig = { enabled: boolean; title: string; message: string; type: GiftType; protectedDetails: boolean; accounts: GiftAccount[]; externalUrl?: string; externalLabel?: string; styleVariant?: "minimal" | "dark_panel" | "editorial" | "photo_background" | "ornamental" };
export type SocialType = "instagram_handle" | "hashtag" | "custom" | "collaborative_album";
export type SocialPhotoSectionConfig = { enabled: boolean; title: string; description: string; socialType: SocialType; socialValue: string; socialUrl?: string; ctaLabel?: string; showCopyButton: boolean };
export const demoGift: GiftSectionConfig = { enabled: true, title: "Regalos", message: "Nada es más importante que tu presencia, pero si deseás hacerme un presente podés depositarlo en la siguiente cuenta:", type: "bank_transfer", protectedDetails: true, accounts: [{ accountHolderFullName: "Sofía & Mateo Mendoza", accountAlias: "SOFIA.MATEO.BODA", bankName: "Banco Galicia", accountType: "Caja de ahorro en pesos", cbuOrCvu: "1234567890123456789012", currency: "ARS" }], styleVariant: "editorial" };
export const demoSocial: SocialPhotoSectionConfig = { enabled: true, title: "Fotos sociales", description: "Queremos ver tus fotos. Podés etiquetarnos en todas tus publicaciones de Instagram.", socialType: "instagram_handle", socialValue: "sofiamateo", ctaLabel: "Abrir Instagram", showCopyButton: true };
export function normalizeAlias(value: string) { return value.trim().toUpperCase().replace(/\s+/g, ""); }
export function isValidArgentineAccount(value: string) { return /^\d{22}$/.test(value.replace(/\D/g, "")); }
export function isSafeExternalUrl(value: string) { try { return new URL(value).protocol === "https:"; } catch { return false; } }
export function normalizeInstagramHandle(value: string) { return value.trim().replace(/^@+/, "").replace(/\s/g, "").toLowerCase(); }
export function formatAccount(value?: string) { const digits = (value ?? "").replace(/\D/g, ""); return digits ? digits.replace(/(.{4})/g, "$1 ").trim() : ""; }
