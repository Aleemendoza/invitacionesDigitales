"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";

type Item = { icon: IconName; title: string; description: string };
type Faq = { question: string; answer: ReactNode };
type FaqGroup = { title: string; questions: Faq[] };

const features: Item[] = [
  ["rsvp", "Confirmación propia", "Tus invitados confirman su asistencia dentro de la invitación, sin salir de la experiencia."],
  ["trivia", "Trivia interactiva", "Sumá preguntas personalizadas para que tus invitados jueguen antes de la fiesta."],
  ["duo", "Invitación en dúo", "Diferenciá invitados de cena, fiesta o ambos, y administrá sus lugares con claridad."],
  ["countdown", "Cuenta regresiva", "Creá expectativa con una cuenta regresiva en tiempo real hasta el comienzo del evento."],
  ["map", "Ubicación y mapas", "Compartí direcciones precisas para cada momento: ceremonia, recepción y fiesta."],
  ["sparkles", "Pantalla de bienvenida", "Recibí a cada invitado con una apertura especial antes de que descubra los detalles."],
  ["songRequest", "Canciones sugeridas", "Dejá que tus invitados propongan esas canciones que no pueden faltar."],
  ["diamond", "Dress code", "Informá el código o estilo de vestimenta elegido de manera clara y elegante."],
  ["instagram", "Instagram Wall", "Compartí un hashtag o usuario para reunir las fotos y publicaciones de todos."],
  ["card", "Valor tarjeta", "Indicá el valor de la tarjeta cuando corresponda, de forma directa y cuidada."],
  ["gift", "Sección regalos", "Facilitá los datos necesarios para quienes quieran hacerte llegar un regalo."],
  ["photoHeart", "Álbum de fotos", "Incluí book, preboda o recuerdos para compartir la historia con quienes más querés."],
  ["music", "Música de fondo", "Elegí una canción que acompañe la invitación y marque el clima de tu evento."],
  ["story", "Frases e historia", "Dale un toque emocional con palabras, recuerdos o una breve historia."],
  ["weddingParty", "Padrinos", "Destacá a las personas clave que forman parte de este momento especial."],
].map(([icon, title, description]) => ({ icon: icon as IconName, title, description }));

const benefits: Item[] = [
  ["smile", "Fácil de compartir", "Mandá un único link por WhatsApp y llegá a todos tus invitados en segundos."],
  ["hand", "Envíos ilimitados", "Compartila todas las veces que necesites, sin límite de invitados ni reenvíos."],
  ["bolt", "Entrega rápida", "Tu invitación queda lista dentro de los tiempos comunicados para tu proyecto."],
  ["wallet", "Económicas", "Ahorrá impresión, sobres y distribución física sin resignar una gran primera impresión."],
  ["bulb", "Funcionales", "Información, RSVP y recursos del evento reunidos en una experiencia simple para todos."],
  ["wand", "Personalizadas", "Diseño y contenidos pensados para reflejar tu celebración y tu estilo."],
].map(([icon, title, description]) => ({ icon: icon as IconName, title, description }));

const p = (text: string) => <p>{text}</p>;
const faqGroups: FaqGroup[] = [
  { title: "Sobre los modelos de invitación", questions: [
    { question: "¿Cuál es la diferencia entre los tres modelos de invitación?", answer: <><h4>Modelo Estándar</h4>{p("Incluye un botón de confirmación que redirige a WhatsApp. Tus invitados hacen clic y te confirman por mensaje; es ideal si solo querés saber quién viene.")}<h4>Modelo Premium</h4>{p("Incluye nuestro sistema de confirmación propio. Tus invitados completan un formulario dentro de la invitación con datos como nombre, apellido, acompañantes, restricciones alimentarias o música favorita. Recibís un listado en tiempo real y podés descargar la información para organizarte.")}<h4>Modelo Premium Plus+</h4>{p("Incluye todo lo del Modelo Premium y suma la invitación personalizada por invitado: cada persona recibe su invitación con nombre y lugares asignados, lista para enviar por WhatsApp.")}<ul><li>Trivia interactiva.</li><li>Álbum QR de fotos ilimitado.</li></ul></> },
    { question: "¿Cuál es el modelo más elegido?", answer: p("El modelo Premium suele ser elegido por quienes buscan centralizar confirmaciones e información de invitados. El modelo ideal depende de cuánto detalle quieras gestionar.") },
    { question: "¿Cuántas fotos puedo incluir?", answer: p("Podés sumar las imágenes que mejor cuenten la historia de tu celebración. La selección se adapta al diseño para conservar una carga ágil y una buena lectura.") },
    { question: "¿Las invitaciones pueden ser sin fotos?", answer: p("Sí. Podemos crear una invitación tipográfica o gráfica que conserve la personalidad de tu evento sin utilizar fotografías.") },
    { question: "¿Puedo elegir cualquier diseño con cualquier modelo?", answer: p("Los diseños se adaptan al modelo elegido. Antes de empezar, revisamos que las funciones que necesitás queden integradas de manera coherente.") },
    { question: "¿Cómo funciona el álbum de fotos?", answer: p("Podés incluir un álbum para mostrar imágenes elegidas por ustedes. Cuando el modelo incorpora álbum QR, los invitados también podrán aportar sus fotos.") },
  ] },
  { title: "Sobre la confirmación de invitados", questions: [
    { question: "¿Cuál es la diferencia entre la confirmación por WhatsApp y el sistema de confirmación?", answer: p("WhatsApp abre un mensaje para que el invitado responda directamente. El sistema propio reúne las respuestas dentro de la invitación y las ordena en un solo lugar.") },
    { question: "¿Cómo funciona la invitación personalizada por invitado del Modelo Premium Plus+?", answer: p("Cada invitado o grupo recibe un enlace preparado con su nombre y los lugares asignados. Así, la información relevante llega clara desde el primer mensaje.") },
    { question: "¿Qué significa que usan un sistema de confirmación propio?", answer: p("La respuesta se completa dentro de la invitación. Podés pedir los datos que necesitás para organizarte y revisar las confirmaciones actualizadas desde tu panel.") },
    { question: "¿Puedo ver quién confirmó su asistencia?", answer: p("Sí. Cuando tu modelo incluye confirmación propia, vas a poder consultar las respuestas recibidas y la información asociada a cada invitado.") },
  ] },
  { title: "Sobre tiempos de entrega", questions: [
    { question: "¿Con cuánta anticipación tengo que encargar mi invitación?", answer: p("Lo ideal es comenzar con anticipación suficiente para definir diseño, contenidos y datos del evento con tranquilidad. Si tu fecha está cerca, consultanos para revisar disponibilidad.") },
    { question: "¿Cuánto demora la entrega?", answer: p("El plazo se confirma al iniciar cada proyecto según el modelo, el diseño y el material disponible. La invitación se entrega dentro del tiempo acordado.") },
    { question: "¿Puedo realizar ajustes en mi invitación una vez activada?", answer: p("Podés solicitar ajustes sobre información necesaria del evento. Te indicaremos qué cambios están contemplados antes de compartir el link.") },
  ] },
  // { title: "Sobre el Save the Date", questions: [
  //   { question: "¿Qué versión del Save the Date se entrega?", answer: p("Se prepara como una versión breve y clara para anticipar la celebración: protagonistas, fecha y el tono visual del evento.") },
  //   { question: "¿Cómo funciona el descuento en el Save the Date?", answer: p("Las promociones vigentes se confirman de forma personalizada antes de iniciar el proyecto, para que recibas las condiciones actuales aplicables.") },
  //   { question: "¿Con cuánta anticipación tengo que encargar mi Save the Date?", answer: p("Conviene prepararlo antes de enviar la invitación completa, para que tus invitados puedan reservar la fecha con tiempo.") },
  // ] },
  // { title: "Invitación en dúo", questions: [
  //   { question: "¿Qué es la invitación en dúo?", answer: p("Permite comunicar con claridad dos momentos del evento, por ejemplo cena y fiesta, según el acceso de cada invitado.") },
  //   { question: "¿En qué casos se recomienda usarla?", answer: p("Es ideal cuando diferentes grupos participarán de instancias distintas o cuando necesitás organizar accesos y horarios de forma personalizada.") },
  //   { question: "¿Cómo funciona el descuento en la segunda invitación?", answer: p("Las condiciones promocionales se confirman al momento de la consulta, de acuerdo con la propuesta elegida y la disponibilidad vigente.") },
  // ] },
  { title: "Pagos", questions: [
    { question: "¿Cómo se realiza el pago?", answer: p("Al confirmar tu proyecto, recibirás las opciones de pago disponibles y los pasos necesarios para reservar el trabajo de tu invitación.") },
    { question: "¿Puedo congelar el precio aunque el evento sea más adelante?", answer: p("Las condiciones de reserva y vigencia se revisan en cada consulta para darte información actualizada antes de avanzar.") },
    { question: "¿Debo abonar por cada invitación enviada?", answer: p("No. La invitación se comparte mediante un link y podés enviarlo a tus invitados sin un costo por cada reenvío.") },
  ] },
];

export function LandingDetails() {
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const cards = sectionRef.current?.querySelectorAll<HTMLElement>("[data-reveal]") ?? [];
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);
  return <>
    <section className="includedSection" ref={sectionRef} aria-labelledby="included-title"><div className="includedInner"><p className="eyebrow">TODO EN UN SOLO LINK</p><h2 id="included-title">¿Qué incluye tu<br/><em>invitación?</em></h2><p className="includedLead">Una invitación que informa, organiza y emociona desde el primer mensaje.</p><div className="includedGrid">{features.map((feature, index) => <article className="includedCard" data-reveal key={feature.title} style={{ "--reveal-delay": `${index * 45}ms` } as CSSProperties}><Icon name={feature.icon} size={34} className="includedIcon" /><h3>{feature.title}</h3><p>{feature.description}</p></article>)}</div></div></section>
    <section className="benefitsSection section" aria-labelledby="benefits-title"><p className="eyebrow">PENSADO PARA DISFRUTARLO</p><h2 id="benefits-title">Beneficios de elegir<br/><em>una invitación digital.</em></h2><div className="benefitsGrid">{benefits.map((benefit) => <article className="benefitCard" key={benefit.title}><Icon name={benefit.icon} size={30} className="benefitIcon" /><div><h3>{benefit.title}</h3><p>{benefit.description}</p></div></article>)}</div></section>
    <section className="faqSection section" aria-labelledby="faq-title"><p className="eyebrow">TE ACOMPAÑAMOS A ELEGIR</p><h2 id="faq-title">Preguntas<br/><em>frecuentes.</em></h2><p className="sectionLead">Todo lo que necesitás saber antes de empezar a crear la invitación de tu celebración.</p><div className="faqGroups">{faqGroups.map((group) => <FaqGroupView group={group} key={group.title} />)}</div></section>
  </>;
}

function FaqGroupView({ group }: { group: FaqGroup }) { return <section className="faqGroup"><h3>{group.title}</h3>{group.questions.map((faq) => <FaqItem faq={faq} key={faq.question} />)}</section>; }
function FaqItem({ faq }: { faq: Faq }) { const [open, setOpen] = useState(false); const id = useId(); return <article className={`faqItem ${open ? "is-open" : ""}`}><h4><button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((value) => !value)}><span>{faq.question}</span><span className="faqToggle" aria-hidden="true">+</span></button></h4><div id={id} className="faqAnswer" role="region" aria-label={faq.question}><div>{faq.answer}</div></div></article>; }
