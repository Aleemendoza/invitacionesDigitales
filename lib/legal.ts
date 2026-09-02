export const LEGAL_LAST_UPDATED = "2 de septiembre de 2026";

const value = (name: string) => process.env[name]?.trim() || undefined;

export function getLegalProvider() {
  return {
    commercialName: "Papeleta",
    legalName: value("LEGAL_OPERATOR_NAME"), cuit: value("LEGAL_CUIT"),
    address: value("LEGAL_ADDRESS"), city: value("LEGAL_CITY"),
    email: value("LEGAL_CONTACT_EMAIL") || "hola@papeleta.app",
    phone: value("LEGAL_CONTACT_PHONE"),
    supportHours: value("LEGAL_SUPPORT_HOURS") || "lunes a viernes, de 9:00 a 17:00 (hora argentina)",
  };
}
