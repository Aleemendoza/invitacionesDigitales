import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal-page";
export const metadata:Metadata={title:"Baja del servicio | Papeleta",description:"Canal directo para solicitar la baja de Papeleta.",alternates:{canonical:"/baja"},robots:{index:false,follow:true}};
const subject=encodeURIComponent("BAJA DEL SERVICIO — solicitud");
const body=encodeURIComponent("Email de la cuenta:\nID o URL del evento:\nAlcance (evento o cuenta):\n\nSolicito la baja del servicio.");
const sections:LegalSection[]=[
 {id:"solicitar",title:"Solicitar la baja",content:<><p>Podés pedir la baja del evento o cuenta sin iniciar sesión. Indicá email asociado e ID o URL del evento. No envíes tu contraseña.</p><p><a href={`mailto:hola@papeleta.app?subject=${subject}&body=${body}`}>Enviar solicitud de baja</a></p></>},
 {id:"respuesta",title:"Confirmación",content:<p>Dentro de 24 horas enviaremos por el mismo medio un código y las medidas adoptadas. Podemos verificar razonablemente tu identidad para evitar eliminaciones no autorizadas.</p>},
 {id:"efectos",title:"Efectos y datos",content:<p>Informaremos cuándo deja de publicarse la invitación y qué datos se eliminan o conservan por obligaciones legales, comprobantes o auditoría mínima. La baja no impide ejercer reembolso, garantía, acceso o supresión.</p>},
];
export default function CancellationPage(){return <LegalPage eyebrow="ACCESO DIRECTO, SIN LOGIN" title="Baja del servicio" lead="Solicitá la baja de un evento o de tu cuenta por un canal simple y trazable." sections={sections}/>}
