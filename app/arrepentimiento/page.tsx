import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal-page";
export const metadata:Metadata={title:"Botón de arrepentimiento | Papeleta",description:"Canal directo para revocar una contratación.",alternates:{canonical:"/arrepentimiento"},robots:{index:false,follow:true}};
const subject=encodeURIComponent("BOTÓN DE ARREPENTIMIENTO — solicitud");
const body=encodeURIComponent("Email usado en la compra:\nID de pago o evento:\nFecha aproximada:\n\nSolicito ejercer el derecho de arrepentimiento.");
const sections:LegalSection[]=[
 {id:"solicitar",title:"Iniciar la solicitud",content:<><p>No necesitás iniciar sesión ni explicar el motivo. Incluí email de compra e ID de pago o evento. No envíes contraseñas ni datos completos de tarjeta.</p><p><a href={`mailto:hola@papeleta.com.ar?subject=${subject}&body=${body}`}>Enviar solicitud de arrepentimiento</a></p></>},
 {id:"despues",title:"Qué sucede después",content:<p>Dentro de 24 horas recibirás por el mismo medio un código de identificación y las medidas adoptadas. Podremos verificar razonablemente tu identidad sólo por seguridad.</p>},
 {id:"alcance",title:"Alcance legal",content:<p>Se analizará conforme a la Ley 24.240, el Código Civil y Comercial y sus excepciones. El trámite no limita otros derechos por incumplimiento, cobros incorrectos o defectos.</p>},
];
export default function WithdrawalPage(){return <LegalPage eyebrow="ACCESO DIRECTO, SIN LOGIN" title="Botón de arrepentimiento" lead="Canal para revocar una contratación a distancia dentro del plazo legal aplicable." notice={<><strong>Plazo general: 10 días corridos.</strong>Consultá detalles y excepciones en nuestra política de reembolsos.</>} sections={sections}/>}
