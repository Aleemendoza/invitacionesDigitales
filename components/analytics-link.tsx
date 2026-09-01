"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { trackAnalyticsEvent, type AnalyticsEvent } from "@/lib/analytics";

type Props = ComponentProps<typeof Link> & { analytics: AnalyticsEvent | readonly AnalyticsEvent[] };

export function AnalyticsLink({ analytics, onClick, ...props }: Props) {
  return <Link {...props} onClick={(event) => { (Array.isArray(analytics) ? analytics : [analytics]).forEach(trackAnalyticsEvent); onClick?.(event); }} />;
}
