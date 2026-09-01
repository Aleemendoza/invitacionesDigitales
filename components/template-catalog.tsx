"use client";
import { useState } from "react";
import { TemplateCard } from "@/components/template-card";
import { templates } from "@/lib/templates";

const filters = ["Todas","Bodas","XV","Cumpleaños","Infantiles","Corporativos"] as const;
export function TemplateCatalog(){const[filter,setFilter]=useState<(typeof filters)[number]>("Todas");const list=filter==="Todas"?templates:templates.filter((template)=>template.category===filter);return <><div className="filters" role="group" aria-label="Filtrar plantillas por celebración">{filters.map((item)=><button type="button" className={filter===item?"active":""} aria-pressed={filter===item} onClick={()=>setFilter(item)} key={item}>{item}</button>)}</div><p className="srOnly" aria-live="polite">{list.length} plantillas disponibles.</p><div className="grid">{list.map((template)=><TemplateCard template={template} key={template.slug}/>)}</div></>}
