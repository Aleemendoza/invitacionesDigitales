"use client";

import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase-browser";

export type AccountRole = "organizer" | "admin";
type AccountContext = { userId: string; role: AccountRole; fullName: string };

export function useAccountRole() {
  const [account, setAccount] = useState<AccountContext>();
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    void (async () => {
      const token = (await getBrowserSupabase()?.auth.getSession())?.data.session?.access_token;
      if (!token) { if (active) setError("Iniciá sesión para acceder a este panel."); return; }
      const response = await fetch("/api/account/role", { headers: { authorization: `Bearer ${token}` } });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "No pudimos comprobar tu rol.");
      if (active) setAccount(body);
    })().catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "No pudimos comprobar tu rol."); });
    return () => { active = false; };
  }, []);
  return { account, error, loading: !account && !error };
}

export function RoleBadge({ role }: { role: AccountRole | "guest" }) {
  const label = role === "admin" ? "Administrador" : role === "organizer" ? "Organizador" : "Invitado";
  return <span className={`roleBadge ${role}`}>Rol: {label}</span>;
}
