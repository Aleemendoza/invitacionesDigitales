export type FontStyle = "clasica" | "refinada" | "princesa";
export type EventTheme = { primaryColor: string; accentColor: string; fontStyle: FontStyle };
export const defaultTheme: EventTheme = { primaryColor: "#2f2b23", accentColor: "#ad2e50", fontStyle: "clasica" };
const hex = /^#[0-9a-fA-F]{6}$/;
export function isTheme(value: unknown): value is EventTheme { return !!value && typeof value === "object" && hex.test((value as EventTheme).primaryColor) && hex.test((value as EventTheme).accentColor) && ["clasica", "refinada", "princesa"].includes((value as EventTheme).fontStyle); }
export function textColor(background: string) { const rgb = background.slice(1).match(/.{2}/g)?.map(value => parseInt(value, 16)) ?? [0, 0, 0]; return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722 > 155 ? "#21191b" : "#ffffff"; }
