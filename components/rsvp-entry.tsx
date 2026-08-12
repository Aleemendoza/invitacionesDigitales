"use client";
import { useEffect, useState } from "react";
import { GeneralRsvp } from "@/components/general-rsvp";
import { PublicRsvp } from "@/components/public-rsvp";
export function RsvpEntry({slug}:{slug:string}){const[plus,setPlus]=useState<boolean>();useEffect(()=>{fetch(`/api/public/events/${encodeURIComponent(slug)}/general-rsvp`).then(async response=>{const body=await response.json();setPlus(body.event?.plan==="premium_plus")}).catch(()=>setPlus(false))},[slug]);if(plus===undefined)return null;return plus?<PublicRsvp slug={slug}/>:<GeneralRsvp slug={slug}/>}
