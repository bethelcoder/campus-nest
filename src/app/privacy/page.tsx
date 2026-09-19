import Link from "next/link";
import { Footer } from "@/components/shared/Footer";

export const metadata = {
  title: "Privacy Policy",
  description: "The CampusNest Privacy Policy and POPIA information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-20">
        <Link href="/" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">CampusNest</Link>
        <article className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Legal</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="mt-3 text-sm text-slate-500">Last updated: 19 September 2026</p>
          <div className="prose prose-slate mt-8 max-w-none prose-headings:font-semibold prose-a:text-emerald-700">
            <p>This Privacy Policy explains how CampusNest collects, uses, stores, and protects personal information when you use the platform.</p>
            <h2>1. Information we collect</h2>
            <p>Depending on your role, we may collect your name, contact details, identity or passport information, university details, funding information, residence details, uploaded documents, applications, messages, and safety reports.</p>
            <h2>2. Why we use information</h2>
            <p>We use information to create and secure accounts, verify users, review residence safety, publish approved listings, process applications, generate confirmations, respond to reports, and communicate important service updates.</p>
            <h2>3. POPIA principles</h2>
            <p>CampusNest aims to process personal information lawfully, fairly, and transparently; collect it for specific purposes; limit collection; keep it accurate; retain it only as needed; and protect it against unauthorised access or loss.</p>
            <h2>4. Sharing information</h2>
            <p>We share information only where needed to operate the service, complete a requested housing or funding workflow, meet a legal obligation, protect safety, or with your consent. We do not sell personal information.</p>
            <h2>5. Documents and security</h2>
            <p>Uploaded identity, enrolment, and supporting documents are access-controlled and used for verification workflows. No online system can guarantee absolute security, but we apply reasonable technical and organisational safeguards.</p>
            <h2>6. Your rights</h2>
            <p>Subject to applicable law, you may request access to, correction of, or deletion of your personal information, or object to certain processing. Marketing messages include an opt-out option. Operational messages may still be sent when necessary.</p>
            <h2>7. Contact</h2>
            <p>To exercise a privacy right or ask a question, contact the CampusNest support team through the contact details provided in the platform.</p>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
