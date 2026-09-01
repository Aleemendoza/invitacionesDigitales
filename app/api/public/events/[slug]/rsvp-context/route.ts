import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase, getGuestSession, unavailable } from "@/lib/public-guest-server";
import { memberFoodPreference } from "@/lib/member-food-preference";

export async function GET(_request:NextRequest,{params}:{params:Promise<{slug:string}>}){try{
  const{slug}=await params,db=getAdminSupabase();
  const{data:event}=await db.from("events").select("id,slug,title,event_type,starts_at,template_slug,content,rsvp_enabled,rsvp_deadline,status,guest_access_mode,guest_lookup_enabled,event_media(storage_path,kind,position)").eq("slug",slug).eq("status","published").eq("payment_status","approved").maybeSingle();
  if(!event||!event.rsvp_enabled)return NextResponse.json({error:"Las confirmaciones no están disponibles."},{status:403});
  const session=await getGuestSession(event.id);if(!session)return NextResponse.json({event:{...event,event_media:[]},group:null,members:[],questions:[],answers:[]});
  const groupId=session.guest_group_id;
  const[{data:members},{data:questions},{data:answers},{data:group}]=await Promise.all([
    db.from("guest_members").select("id,name,attending,guest_member_food_preferences(food_preference)").eq("guest_group_id",groupId),
    db.from("rsvp_questions").select("id,key,label,kind,required,config,position").eq("event_id",event.id).order("position"),
    db.from("rsvp_answers").select("question_id,value").eq("guest_group_id",groupId),
    db.from("guest_groups").select("id,display_name,seats,status,confirmed_seats,response_version").eq("id",groupId).single(),
  ]);
  const media=await Promise.all((event.event_media??[]).sort((a:{position:number},b:{position:number})=>a.position-b.position).map(async item=>({...item,url:(await db.storage.from("event-media").createSignedUrl(item.storage_path,3600)).data?.signedUrl??""})));
  return NextResponse.json({event:{...event,event_media:media},group,members:(members??[]).map(member=>({...member,foodPreference:memberFoodPreference(member.guest_member_food_preferences)??""})),questions:(questions??[]).map(q=>({...q,options:(q.config as{options?:string[]})?.options??[]})),answers:answers??[]});
}catch(error){console.error("rsvp context",error);return unavailable()}}
