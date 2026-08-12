import type { RsvpQuestion } from "@/lib/event-types";
export const standardRsvpQuestions: RsvpQuestion[] = [
  { key:"food_preference", label:"Preferencia de comida", kind:"single_choice", required:true, options:["Tradicional","Vegetariana","Vegana"], position:0 },
  { key:"dietary_restrictions", label:"Alguna alergia o restricción alimentaria", kind:"text", required:false, options:[], position:1 },
  { key:"song_request", label:"Alguna canción que no puede faltar", kind:"text", required:false, options:[], position:2 },
];
export function normalizeRsvpQuestions(questions:RsvpQuestion[]){const custom=questions.filter(question=>!standardRsvpQuestions.some(standard=>standard.key===question.key));return [...standardRsvpQuestions,...custom].map((question,position)=>({...question,position}));}
