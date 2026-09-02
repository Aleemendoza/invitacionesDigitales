export function closingMessageForEventType(eventType: string) {
  const normalized = eventType.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (normalized.includes("boda") || normalized.includes("casamiento")) return "Gracias por ser parte de nuestra historia.";
  if (normalized.includes("xv") || normalized.includes("15")) return "Gracias por ser parte de mis XV años.";
  if (normalized.includes("cumple")) return "Gracias por ser parte de mi día.";
  if (normalized.includes("baby")) return "Gracias por acompañarnos en esta dulce espera.";
  if (normalized.includes("infantil")) return "Gracias por ser parte de esta gran aventura.";
  return "Gracias por ser parte de este día tan especial.";
}

export function resolveClosingMessage(customMessage: string | undefined, eventType: string) {
  return customMessage?.trim() || closingMessageForEventType(eventType);
}
