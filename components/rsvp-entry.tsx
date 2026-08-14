"use client";
import { useEffect, useState } from "react";
import { GeneralRsvp } from "@/components/general-rsvp";
import { PublicRsvp } from "@/components/public-rsvp";
export function RsvpEntry({slug}:{slug:string}){
  const [hasPremiumFlow,setHasPremiumFlow]=useState<boolean>();
  useEffect(()=>{
    fetch(`/api/public/events/${encodeURIComponent(slug)}/general-rsvp`)
      .then(async response=>{
        const body=await response.json();
        setHasPremiumFlow(body.event?.plan==="premium_plus");
      })
      .catch(()=>setHasPremiumFlow(false));
  },[slug]);
  if(hasPremiumFlow===undefined)return null;
  return hasPremiumFlow?<PublicRsvp slug={slug}/>:<GeneralRsvp slug={slug}/>;
}
