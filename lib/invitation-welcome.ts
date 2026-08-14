export type WelcomeConfig = { message?: string; backgroundPhotoPath?: string };

export function welcomeMessageForEventType(eventType: string, title?: string) {
  const normalized = eventType.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const name = title?.trim() || "esta celebración";
  if (normalized.includes("boda") || normalized.includes("casamiento")) return `Bienvenidos a nuestra historia. Gracias por acompañarnos a celebrar nuestra boda.`;
  if (normalized.includes("xv") || normalized.includes("15")) return `Estás por entrar a una noche única. Gracias por ser parte de mis XV.`;
  if (normalized.includes("infantil")) return `Una gran aventura está por comenzar. ¡Vení a celebrar ${name}!`;
  if (normalized.includes("baby")) return `Una dulce espera merece ser celebrada. Gracias por acompañarnos.`;
  if (normalized.includes("corporativo")) return `Gracias por ser parte de este encuentro. Te damos la bienvenida a ${name}.`;
  if (normalized.includes("cumple")) return `La fiesta está por comenzar. ¡Gracias por venir a celebrar ${name}!`;
  return `Qué alegría que estés acá. Te damos la bienvenida a ${name}.`;
}

export function welcomeStyleForEventType(eventType: string) {
  const normalized = eventType.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (normalized.includes("infantil") || normalized.includes("baby")) return "playful";
  if (normalized.includes("corporativo")) return "refined";
  if (normalized.includes("xv") || normalized.includes("cumple")) return "celebration";
  return "romantic";
}
