"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { analyticsConsentKey } from "@/lib/analytics";

type Consent = "accepted" | "rejected" | null;

export function AnalyticsConsent() {
  const [consent, setConsent] = useState<Consent>(null);
  const rawGaId = process.env.NEXT_PUBLIC_GA_ID;
  const rawMetaId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const gaId = rawGaId && /^(G|AW)-[A-Z0-9]{6,20}$/.test(rawGaId) ? rawGaId : undefined;
  const metaId = rawMetaId && /^\d{5,20}$/.test(rawMetaId) ? rawMetaId : undefined;

  useEffect(() => {
    const saved = window.localStorage.getItem(analyticsConsentKey);
    setConsent(saved === "accepted" || saved === "rejected" ? saved : null);
  }, []);

  const decide = (value: Exclude<Consent, null>) => {
    window.localStorage.setItem(analyticsConsentKey, value);
    setConsent(value);
  };

  return <>
    {consent === "accepted" && gaId && <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`} strategy="afterInteractive" />
      <Script id="papeleta-ga" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${gaId}',{anonymize_ip:true});`}</Script>
    </>}
    {consent === "accepted" && metaId && <Script id="papeleta-meta" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaId}');fbq('track','PageView');`}</Script>}
    {consent === null && <aside className="consentBanner" aria-label="Preferencias de privacidad">
      <div><b>Tu privacidad importa</b><p>Usamos medición opcional para mejorar el recorrido. No enviamos nombres, emails, teléfonos ni respuestas.</p></div>
      <div><button className="button outline" type="button" onClick={() => decide("rejected")}>Sólo esenciales</button><button className="button dark" type="button" onClick={() => decide("accepted")}>Aceptar medición</button></div>
    </aside>}
  </>;
}
