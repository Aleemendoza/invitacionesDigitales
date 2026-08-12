export type FontStyle = "clasica" | "refinada" | "princesa";
export type EventTheme = { primaryColor: string; accentColor: string; backgroundColor: string; fontStyle: FontStyle };
type LegacyEventTheme = Omit<EventTheme, "backgroundColor"> & { backgroundColor?: string };
export const defaultTheme: EventTheme = { primaryColor: "#2f2b23", accentColor: "#ad2e50", backgroundColor: "#f7f3ee", fontStyle: "clasica" };
const hex = /^#[0-9a-fA-F]{6}$/;
export function templateTheme(templateThemeName: string): EventTheme {
  if (["midnight", "gala", "after"].includes(templateThemeName)) return { primaryColor: "#24191d", accentColor: "#c89e42", backgroundColor: "#eee8e2", fontStyle: "refinada" };
  if (["aura", "dream"].includes(templateThemeName)) return { primaryColor: "#3e2340", accentColor: "#b33c71", backgroundColor: "#f4e6ee", fontStyle: "princesa" };
  if (["dino", "safari", "tropical"].includes(templateThemeName)) return { primaryColor: "#294638", accentColor: "#ab6a39", backgroundColor: "#edf3df", fontStyle: "clasica" };
  if (["space", "forward"].includes(templateThemeName)) return { primaryColor: "#203744", accentColor: "#227b92", backgroundColor: "#e9eff4", fontStyle: "refinada" };
  return defaultTheme;
}
export function isTheme(value: unknown): value is LegacyEventTheme { return !!value && typeof value === "object" && hex.test((value as LegacyEventTheme).primaryColor) && hex.test((value as LegacyEventTheme).accentColor) && ["clasica", "refinada", "princesa"].includes((value as LegacyEventTheme).fontStyle) && (!(value as LegacyEventTheme).backgroundColor || hex.test((value as LegacyEventTheme).backgroundColor!)); }
export function normalizeTheme(value: unknown, fallback: EventTheme = defaultTheme): EventTheme { return isTheme(value) ? { primaryColor: value.primaryColor, accentColor: value.accentColor, backgroundColor: value.backgroundColor ?? fallback.backgroundColor, fontStyle: value.fontStyle } : fallback; }
export function textColor(background: string) { const rgb = background.slice(1).match(/.{2}/g)?.map(value => parseInt(value, 16)) ?? [0, 0, 0]; return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722 > 155 ? "#21191b" : "#ffffff"; }
