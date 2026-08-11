import { demoEvent } from "@/lib/templates";

export function PhotoInvite({ imageSrc, title = demoEvent.title, large = false }: { imageSrc?: string; title?: string; large?: boolean }) {
  return <article className={`invite ${demoEvent.template.theme} ${large ? "large" : ""}`}>
    <div style={{ backgroundImage: `linear-gradient(transparent 30%,#160d10cc),url(${imageSrc || "/images/eclat-wedding.png"})` }} />
    <section><small>{demoEvent.template.category.toUpperCase()}</small><h3>{title}</h3><b>12 · 12 · 2026</b><span>{demoEvent.venue}</span></section>
  </article>;
}
