import { NextRequest, NextResponse } from "next/server";
import { fetchMercadoPagoPayment, validatePayment, verifyMercadoPagoSignature } from "@/lib/mercadopago-server";
import { getAdminSupabase } from "@/lib/public-guest-server";

export const runtime="nodejs";
export async function POST(request:NextRequest){try{
  const body=await request.json() as{type?:string;data?:{id?:string|number}},paymentId=String(body.data?.id??request.nextUrl.searchParams.get("data.id")??"");
  if(!paymentId||body.type!=="payment")return NextResponse.json({ok:true});
  if(!verifyMercadoPagoSignature(request,paymentId))return NextResponse.json({error:"Firma inválida."},{status:401});
  const payment=await fetchMercadoPagoPayment(paymentId),match=/^papeleta:([0-9a-f-]+):([0-9a-f-]+)$/i.exec(payment.external_reference??"");if(!match)return NextResponse.json({ok:true});
  const[,localPaymentId,eventId]=match,db=getAdminSupabase(),{data:local,error}=await db.from("event_payments").select("id,event_id,plan,amount,status,provider,provider_preference_id,provider_payment_id").eq("id",localPaymentId).eq("event_id",eventId).maybeSingle();if(error)throw error;if(!local)return NextResponse.json({ok:true});
  const validationError=validatePayment(payment,local);if(validationError){console.error("mercadopago validation rejected",{reason:validationError,localPaymentId});return NextResponse.json({error:"Pago inconsistente."},{status:400})}
  if(payment.status==="approved"){
    const{error:approveError}=await db.rpc("approve_payment_and_publish",{p_local_payment_id:local.id,p_event_id:local.event_id,p_provider_payment_id:String(payment.id),p_provider_status:payment.status,p_provider_payload:{currency_id:payment.currency_id,transaction_amount:payment.transaction_amount,preference_id:payment.preference_id,collector_id:payment.collector_id}});if(approveError)throw approveError;
  }else if(local.status!=="approved"){
    const status=["pending","in_process","authorized"].includes(payment.status)?"pending":"rejected";
    const{error:updateError}=await db.from("event_payments").update({status,provider_payment_id:String(payment.id),provider_status:payment.status,provider_payload:{currency_id:payment.currency_id,transaction_amount:payment.transaction_amount,preference_id:payment.preference_id,collector_id:payment.collector_id},updated_at:new Date().toISOString()}).eq("id",local.id).neq("status","approved");if(updateError)throw updateError;
    // Never mutate the event here: only the approval RPC can publish or change a plan.
  }
  return NextResponse.json({ok:true});
}catch(error){console.error("mercadopago webhook",error instanceof Error?error.message:"unknown");return NextResponse.json({error:"No pudimos procesar la notificación."},{status:500})}}
