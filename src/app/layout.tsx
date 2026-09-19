import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CampusNest | Curated Student Housing Safety & Confirmation Platform",
    template: "%s | CampusNest",
  },
  description:
    "Centralized Trust Registry and Compliance Utility bridging South African students, small landlords, enterprise housing operators, and Student Representative Councils (SRCs).",
  keywords: [
    "student housing South Africa",
    "NSFAS accredited accommodation",
    "student safety audit",
    "funder confirmation letter",
    "DHET norms and standards",
    "Wits student housing",
    "UJ student accommodation",
  ],
};

export const viewport: Viewport = {
  themeColor: "#0b192c",
  width: "device-width",
  initialScale: 1,
};

import React, { Suspense } from "react";
import TopProgressBar from "@/components/common/TopProgressBar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`scroll-smooth ${poppins.variable}`}>
      <body className={`${poppins.className} min-h-screen font-poppins bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white`}>
        <Suspense fallback={null}>
          <TopProgressBar />
        </Suspense>
        {children}
      </body>
    </html>
  );
}

