"use client";
import "./testimonials-showcase.css";
import { useEffect, useState } from "react";

const examples = [
  ["Sofía M.", "El diseño quedó precioso y mis invitados pudieron confirmar sin preguntarme nada por WhatsApp."],
  ["Carla R.", "Pudimos ordenar todos los detalles en un solo link. Fue muy simple de preparar."],
  ["Familia Álvarez", "La invitación se veía genial desde el celular y la agenda fue súper clara."],
  ["Vale G.", "Nos encantó poder elegir una estética que realmente se sintiera nuestra."],
  ["Martina P.", "El RSVP nos ahorró muchísimo tiempo y quedó muy lindo para compartir."],
  ["Lucía y Tomás", "Una forma práctica y especial de invitar a quienes queremos."],
  ["Natalia C.", "Todo quedó ordenado: ubicación, horarios y confirmaciones en el mismo lugar."],
  ["Cami F.", "La experiencia fue clara de principio a fin y el resultado se sintió personal."],
  ["Micaela D.", "Fue muy fácil armar la invitación y compartirla con toda la familia."],
  ["Julieta S.", "El diseño se adaptó perfecto a nuestro evento. Se veía increíble."],
] as const;

export function TestimonialsShowcase() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setIndex((value) => (value + 1) % examples.length),
      5500
    );
    return () => window.clearInterval(timer);
  }, []);

  const [name, text] = examples[index];

  return (
    <section className="testimonials testimonials--stacked" aria-labelledby="testimonials-title">
      <div className="testimonialsBadge testimonialsBadge--top">
        <img
          src="/images/review-badge-example.png"
          alt="Insignia de reseñas"
        />
      </div>

      <div className="testimonialsContent">
        <p className="eyebrow">OPINIONES</p>
        
        <article className="testimonialCard" aria-live="polite">
          <div className="testimonialAvatar" aria-hidden="true">{name[0]}</div>
          <div>
            <b>{name}</b>
            <span className="testimonialStars" aria-label="5 de 5 estrellas">★★★★★</span>
          </div>
          <blockquote>“{text}”</blockquote>
        </article>

        <div className="testimonialDots" aria-label="Seleccionar ejemplo">
          {examples.map((_, item) => (
            <button
              key={item}
              onClick={() => setIndex(item)}
              className={index === item ? "active" : ""}
              aria-label={`Ver ejemplo ${item + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}