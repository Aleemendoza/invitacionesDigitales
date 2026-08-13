export const allowedEmailDomains = ["gmail.com", "outlook.com", "hotmail.com"] as const;
export function isAllowedEmail(value: string) { const email = value.trim().toLowerCase(); const at = email.lastIndexOf("@"); return at > 0 && allowedEmailDomains.includes(email.slice(at + 1) as typeof allowedEmailDomains[number]); }
export const allowedEmailHint = "Usá una cuenta @gmail.com, @outlook.com o @hotmail.com.";
