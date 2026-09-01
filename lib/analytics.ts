export const analyticsConsentKey = "papeleta-analytics-consent-v1";

export type AnalyticsEventName =
  | "campaign_visit"
  | "template_view"
  | "create_start"
  | "wizard_step_completed"
  | "signup_completed"
  | "draft_created"
  | "checkout_started"
  | "payment_approved"
  | "event_published"
  | "whatsapp_clicked"
  | "concierge_lead";

export type AnalyticsPlan = "standard" | "premium" | "premium_plus";
export type AnalyticsEvent = {
  name: AnalyticsEventName;
  eventId?: string;
  plan?: AnalyticsPlan;
  eventType?: string;
  campaign?: string;
  templateSlug?: string;
  step?: number;
  value?: number;
  currency?: "ARS";
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}
function hasConsent() {
  return typeof window !== "undefined" && window.localStorage.getItem(analyticsConsentKey) === "accepted";
}

export function trackAnalyticsEvent(event: AnalyticsEvent) {
  if (!hasConsent()) return;
  const { name, ...properties } = event;
  const payload = { schema_version: 1, occurred_at: new Date().toISOString(), ...properties };
  window.gtag?.("event", name, payload);
  window.fbq?.("trackCustom", name, payload);
}
