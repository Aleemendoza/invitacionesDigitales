import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";
export const metadata:Metadata={title:"Ingresar",robots:{index:false,follow:false}};
export default function Page(){return <Suspense fallback={null}><LoginForm/></Suspense>}
