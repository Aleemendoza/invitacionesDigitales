export type TemplatePreview = { title: string; date: string; venue: string };
export type InvitationSection = "message" | "details" | "agenda" | "gallery" | "dress" | "gifts" | "social" | "rsvp";
export type SectionVisual = { tone: "light" | "dark"; gradient: string; card: "paper" | "glass" | "solid"; decorativeImage: string; photoEnabled?: boolean };
export type Template = { slug: string; name: string; category: string; style: string; plan: "standard" | "premium"; theme: string; coverImage: string; countdownImage: string; preview: TemplatePreview; sections: Record<InvitationSection, SectionVisual> };

const raw = [
  ["eclat", "Éclat", "Bodas", "Editorial", "premium", "ivory", "Clara & Tomás", "18 · 10 · 2026", "Casa Madero"],
  ["amalfi", "Amalfi", "Bodas", "Mediterráneo", "premium", "amalfi", "Valentina & Bruno", "07 · 11 · 2026", "Villa del Lago"],
  ["midnight", "Midnight", "Bodas", "Cinematic", "premium", "midnight", "Martina & Felipe", "22 · 08 · 2026", "Palacio Sans Souci"],
  ["aura", "Aura", "XV", "Fashion glam", "premium", "aura", "Julieta", "14 · 11 · 2026", "La Escondida"],
  ["dreamscape", "Dreamscape", "XV", "Soft pearl", "premium", "dream", "Olivia", "05 · 09 · 2026", "La Arboleda"],
  ["after-dark", "After Dark", "XV", "Club", "premium", "after", "Renata", "19 · 12 · 2026", "Club 21"],
  ["studio-54", "Studio 54", "Cumpleaños", "Disco", "premium", "disco", "Violeta cumple 30", "11 · 07 · 2026", "Ritual Club"],
  ["dinner-club", "Dinner Club", "Cumpleaños", "Cocktail", "standard", "dinner", "Camila cumple 35", "29 · 08 · 2026", "Casa Pardo"],
  ["tropicale", "Tropicale", "Cumpleaños", "Tropical", "standard", "tropical", "Nico cumple 28", "26 · 12 · 2026", "Patio del Sol"],
  ["dino-club", "Dino Club", "Infantiles", "Modern kids", "standard", "dino", "León cumple 5", "16 · 08 · 2026", "Mundo Verde"],
  ["space-camp", "Space Camp", "Infantiles", "Cosmic", "standard", "space", "Alma cumple 7", "03 · 10 · 2026", "Base Estelar"],
  ["safari-club", "Safari Club", "Infantiles", "Jungle", "standard", "safari", "Emma cumple 4", "12 · 09 · 2026", "Jardín Botánico"],
  ["forward", "Forward", "Corporativos", "Tech", "premium", "forward", "Summit Norte", "08 · 10 · 2026", "Distrito 10"],
  ["gala", "Gala", "Corporativos", "Black tie", "premium", "gala", "Fundación Horizonte", "05 · 12 · 2026", "Teatro Colón"],
] as const;

const sectionFamilies: Record<string, Record<InvitationSection, SectionVisual>> = {
  wedding: createSections("/images/sections/wedding-editorial.webp", "#fffdf8", "#24191f", "linear-gradient(135deg,rgba(255,253,248,.96),rgba(248,228,221,.78))", "linear-gradient(135deg,rgba(38,24,31,.94),rgba(79,45,54,.82))"),
  glam: createSections("/images/sections/glam-night.webp", "#fff8fc", "#20131e", "linear-gradient(135deg,rgba(255,247,252,.91),rgba(248,220,237,.78))", "linear-gradient(135deg,rgba(25,12,24,.93),rgba(75,28,59,.8))"),
  kids: createSections("/images/sections/kids-playful.webp", "#fffdf4", "#264236", "linear-gradient(135deg,rgba(255,253,244,.94),rgba(230,244,224,.8))", "linear-gradient(135deg,rgba(26,63,51,.91),rgba(54,96,72,.78))"),
  corporate: createSections("/images/sections/corporate-architecture.webp", "#f6fafb", "#14262b", "linear-gradient(135deg,rgba(246,250,251,.94),rgba(214,233,236,.8))", "linear-gradient(135deg,rgba(12,28,34,.94),rgba(28,65,73,.82))"),
};

function createSections(image: string, light: string, dark: string, lightGradient: string, darkGradient: string): Record<InvitationSection, SectionVisual> {
  return {
    message: { tone: "light", gradient: lightGradient, card: "paper", decorativeImage: image, photoEnabled: true },
    details: { tone: "light", gradient: lightGradient, card: "paper", decorativeImage: image },
    agenda: { tone: "dark", gradient: darkGradient, card: "solid", decorativeImage: image, photoEnabled: true },
    gallery: { tone: "light", gradient: `linear-gradient(135deg,${light},rgba(255,255,255,.84))`, card: "paper", decorativeImage: image },
    dress: { tone: "light", gradient: lightGradient, card: "glass", decorativeImage: image },
    gifts: { tone: "dark", gradient: darkGradient, card: "solid", decorativeImage: image, photoEnabled: true },
    social: { tone: "light", gradient: lightGradient, card: "glass", decorativeImage: image },
    rsvp: { tone: "dark", gradient: darkGradient, card: "solid", decorativeImage: image, photoEnabled: true },
  };
}

function familyFor(category: string): keyof typeof sectionFamilies {
  if (category === "Bodas") return "wedding";
  if (category === "Infantiles") return "kids";
  if (category === "Corporativos") return "corporate";
  return "glam";
}

export const templates: Template[] = raw.map(([slug, name, category, style, plan, theme, title, date, venue]) => ({
  slug, name, category, style, plan, theme,
  // Backgrounds are served directly by CSS, so use the precompressed mobile assets
  // rather than relying on the image optimizer (which cannot optimize CSS URLs).
  coverImage: `/images/templates/${slug}-cover.webp`,
  countdownImage: `/images/templates/${slug}-countdown.webp`,
  preview: { title, date, venue },
  sections: sectionFamilies[familyFor(category)],
}));

export const demoEvent = { id: "emilce-Julian", slug: "emilce-y-Julian", title: "Valeria & Julian", date: "12 de diciembre de 2026", venue: "Estancia La Candelaria", template: templates[0] };
