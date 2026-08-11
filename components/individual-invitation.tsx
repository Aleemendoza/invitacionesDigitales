"use client";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
export function IndividualInvitation({slug,token}:{slug:string;token:string}){const router=useRouter();const[message,setMessage]=useState("Verificando tu invitación…");useEffect(()=>{fetch(`/api/public/events/${encodeURIComponent(slug)}/legacy-access`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({token})}).then(async response=>{const body=await response.json();if(!response.ok)throw new Error(body.error);router.replace(`${body.canonicalUrl}/rsvp`)}).catch(error=>setMessage(error instanceof Error?error.message:"El enlace no es válido."))},[router,slug,token]);return <main className="publicUnavailable"><h1>Tu invitación</h1><p>{message}</p></main>}
