import { Suspense } from "react";
import AuthPage from "@/components/auth/auth-page";

export default function SrcLoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthPage role="SRC_REPRESENTATIVE" mode="login" />
    </Suspense>
  );
}