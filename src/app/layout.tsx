import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Student Housing Safety & Confirmation Platform",
  description: "Verified, safe student housing with automated funder confirmation letters.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
