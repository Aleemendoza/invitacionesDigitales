"use client";

import type { EventTheme, FontStyle } from "@/lib/event-theme";

const fonts: { value: FontStyle; label: string }[] = [
  { value: "clasica", label: "Clásica" },
  { value: "refinada", label: "Refinada" },
  { value: "princesa", label: "Princesa" },
];

export function ThemeControls({ value, defaults, onChange }: { value: EventTheme; defaults: EventTheme; onChange: (theme: EventTheme) => void }) {
  const update = (key: keyof EventTheme, next: string) => onChange({ ...value, [key]: next });
  return <section className="themeControls" aria-label="Identidad visual">
    <div className="themeControlsHeading"><div><p className="eyebrow">Identidad visual</p><p>Personalizá la paleta sin perder legibilidad.</p></div><button className="textButton" type="button" onClick={() => onChange(defaults)}>Restaurar plantilla</button></div>
    <div className="themeColorFields">
      <label>Color principal<input type="color" value={value.primaryColor} onChange={(event) => update("primaryColor", event.currentTarget.value)} /></label>
      <label>Color de acento<input type="color" value={value.accentColor} onChange={(event) => update("accentColor", event.currentTarget.value)} /></label>
      <label>Color de fondo<input type="color" value={value.backgroundColor} onChange={(event) => update("backgroundColor", event.currentTarget.value)} /></label>
    </div>
    <fieldset className="fontChoices"><legend>Tipografía</legend><div>{fonts.map((font) => <button className={value.fontStyle === font.value ? "selected" : ""} type="button" key={font.value} onClick={() => update("fontStyle", font.value)} aria-pressed={value.fontStyle === font.value}>{font.label}</button>)}</div></fieldset>
  </section>;
}
