const whatsappNumber = "5493884486112";

function whatsappUrl(message: string) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const partnerWhatsappUrl = whatsappUrl("¡Hola! Tengo un espacio para eventos y quiero conocer Papeleta Partner.");
