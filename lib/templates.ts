export type TemplatePreview = { title: string; date: string; venue: string };
export type Template = { slug: string; name: string; category: string; style: string; plan: "Essential" | "Plus" | "Premium"; theme: string; coverImage: string; countdownImage: string; preview: TemplatePreview };

const raw = [
  ["eclat", "Éclat", "Bodas", "Editorial", "Plus", "ivory", "Clara & Tomás", "18 · 10 · 2026", "Casa Madero"],
  ["amalfi", "Amalfi", "Bodas", "Mediterráneo", "Plus", "amalfi", "Valentina & Bruno", "07 · 11 · 2026", "Villa del Lago"],
  ["midnight", "Midnight", "Bodas", "Cinematic", "Premium", "midnight", "Martina & Felipe", "22 · 08 · 2026", "Palacio Sans Souci"],
  ["aura", "Aura", "XV", "Fashion glam", "Plus", "aura", "Julieta", "14 · 11 · 2026", "La Escondida"],
  ["dreamscape", "Dreamscape", "XV", "Soft pearl", "Plus", "dream", "Olivia", "05 · 09 · 2026", "La Arboleda"],
  ["after-dark", "After Dark", "XV", "Club", "Premium", "after", "Renata", "19 · 12 · 2026", "Club 21"],
  ["studio-54", "Studio 54", "Cumpleaños", "Disco", "Plus", "disco", "Violeta cumple 30", "11 · 07 · 2026", "Ritual Club"],
  ["dinner-club", "Dinner Club", "Cumpleaños", "Cocktail", "Essential", "dinner", "Camila cumple 35", "29 · 08 · 2026", "Casa Pardo"],
  ["tropicale", "Tropicale", "Cumpleaños", "Tropical", "Essential", "tropical", "Nico cumple 28", "26 · 12 · 2026", "Patio del Sol"],
  ["dino-club", "Dino Club", "Infantiles", "Modern kids", "Essential", "dino", "León cumple 5", "16 · 08 · 2026", "Mundo Verde"],
  ["space-camp", "Space Camp", "Infantiles", "Cosmic", "Essential", "space", "Alma cumple 7", "03 · 10 · 2026", "Base Estelar"],
  ["safari-club", "Safari Club", "Infantiles", "Jungle", "Essential", "safari", "Emma cumple 4", "12 · 09 · 2026", "Jardín Botánico"],
  ["forward", "Forward", "Corporativos", "Tech", "Plus", "forward", "Summit Norte", "08 · 10 · 2026", "Distrito 10"],
  ["gala", "Gala", "Corporativos", "Black tie", "Premium", "gala", "Fundación Horizonte", "05 · 12 · 2026", "Teatro Colón"],
] as const;

export const templates: Template[] = raw.map(([slug, name, category, style, plan, theme, title, date, venue]) => ({
  slug, name, category, style, plan, theme,
  // Backgrounds are served directly by CSS, so use the precompressed mobile assets
  // rather than relying on the image optimizer (which cannot optimize CSS URLs).
  coverImage: `/images/templates/${slug}-cover.webp`,
  countdownImage: `/images/templates/${slug}-countdown.webp`,
  preview: { title, date, venue },
}));

export const demoEvent = { id: "sofia-mateo", slug: "sofia-y-mateo", title: "Sofía & Mateo", date: "12 de diciembre de 2026", venue: "Estancia La Candelaria", template: templates[0] };
