import { Suspense } from "react";
import AuthPage from "@/components/auth/auth-page";

export default function SrcRegisterPage() {
  return (
    <Suspense fallback={null}>
      <AuthPage role="SRC_REPRESENTATIVE" mode="register" />
    </Suspense>
  );
}