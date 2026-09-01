const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u;

export function isAllowedEmail(value: string) {
  const email = value.trim();
  return email.length <= 254 && emailPattern.test(email);
}

export const allowedEmailHint = "Usá una dirección de email válida.";
