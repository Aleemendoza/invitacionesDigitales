import styles from "./agenda-step-editor.module.css";

type AgendaItem = { time: string; title: string };
type AgendaErrors = Record<string, string>;

export function AgendaStepEditor({ agenda, errors = {}, onChange }: { agenda: AgendaItem[]; errors?: AgendaErrors; onChange: (agenda: AgendaItem[]) => void }) {
  const updateItem = (index: number, field: keyof AgendaItem, value: string) => {
    onChange(agenda.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  };

  const removeItem = (index: number) => onChange(agenda.filter((_, itemIndex) => itemIndex !== index));

  return <fieldset className={styles.agenda}>
    <legend>Momentos de la celebración</legend>
    <p>Sumá los instantes importantes en el orden en que ocurren.</p>
    <div className={styles.list}>
      {agenda.map((item, index) => <div className={styles.item} key={`${index}-${item.time}`}>
        <span className={styles.order} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
        <label>Hora
          <input aria-label={`Hora del momento ${index + 1}`} aria-invalid={Boolean(errors[`agenda.${index}.time`])} aria-describedby={errors[`agenda.${index}.time`] ? `agenda-${index}-time-error` : undefined} type="time" value={item.time} onChange={(event) => updateItem(index, "time", event.currentTarget.value)} />
          {errors[`agenda.${index}.time`] && <span className={styles.error} id={`agenda-${index}-time-error`}>{errors[`agenda.${index}.time`]}</span>}
        </label>
        <label>Momento
          <input aria-label={`Nombre del momento ${index + 1}`} aria-invalid={Boolean(errors[`agenda.${index}.title`])} aria-describedby={errors[`agenda.${index}.title`] ? `agenda-${index}-title-error` : undefined} placeholder="Ej.: Ceremonia" value={item.title} onChange={(event) => updateItem(index, "title", event.currentTarget.value)} />
          {errors[`agenda.${index}.title`] && <span className={styles.error} id={`agenda-${index}-title-error`}>{errors[`agenda.${index}.title`]}</span>}
        </label>
        {agenda.length > 1 && <button className={styles.remove} type="button" aria-label={`Eliminar ${item.title || `momento ${index + 1}`}`} onClick={() => removeItem(index)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 11v6M14 11v6M9 7l1-2h4l1 2M8 7l.7 12h6.6L16 7" /></svg>
        </button>}
      </div>)}
    </div>
    {errors.agenda && <p className={styles.error} role="alert">{errors.agenda}</p>}
    <button className={styles.add} type="button" onClick={() => onChange([...agenda, { time: "", title: "" }])}>
      <span aria-hidden="true">+</span> Agregar un momento
    </button>
  </fieldset>;
}
