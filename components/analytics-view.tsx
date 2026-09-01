"use client";
import { useEffect } from "react";
import { trackAnalyticsEvent, type AnalyticsEvent } from "@/lib/analytics";
export function AnalyticsView({event}:{event:AnalyticsEvent}){useEffect(()=>{trackAnalyticsEvent(event)},[event.name,event.eventId,event.plan,event.eventType,event.campaign,event.templateSlug,event.step,event.value,event.currency]);return null}
