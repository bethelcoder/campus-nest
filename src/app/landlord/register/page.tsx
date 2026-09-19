import { Suspense } from "react";
import AuthPage from "@/components/auth/auth-page";

export default function LandlordRegisterPage() {
  return (
    <Suspense fallback={null}>
      <AuthPage role="LANDLORD" mode="register" />
    </Suspense>
  );
}