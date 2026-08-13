import Link from "next/link";

export function PartnerTeaser() {
  return <section className="closingCta" style={{ background: "linear-gradient(120deg, #412431, #7e4053)" }}>
    <div><p className="eyebrow">¿TENÉS UN ESPACIO PARA EVENTOS?</p><h2>Tu salón también puede<br/><em>ser parte de Papeleta.</em></h2><p>Ofrecé a tus clientes una experiencia digital para su celebración y potenciá la presencia de tu espacio.</p><p><Link className="button light" href="/partner">Conocer Papeleta Partner →</Link> <Link className="button outline" style={{ color: "white", borderColor: "#ffffff88" }} href="/partner#como-funciona">Cómo funciona</Link></p></div>
  </section>;
}
