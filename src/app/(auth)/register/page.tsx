import { Suspense } from "react";
import AuthPage from "@/components/auth/auth-page";

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <AuthPage role="STUDENT" mode="register" />
    </Suspense>
  );
}
