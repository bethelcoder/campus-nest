import { Suspense } from "react";
import AuthPage from "@/components/auth/auth-page";

export default function LandlordLoginPage() {
  return <Suspense fallback={null}><AuthPage role="LANDLORD" mode="login" /></Suspense>;
}