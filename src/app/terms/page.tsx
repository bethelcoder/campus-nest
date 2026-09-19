import Link from "next/link";
import { Footer } from "@/components/shared/Footer";

export const metadata = {
  title: "Terms and Conditions",
  description: "The CampusNest Terms and Conditions.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-20">
        <Link href="/" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">CampusNest</Link>
        <article className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Legal</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Terms and Conditions</h1>
          <p className="mt-3 text-sm text-slate-500">Last updated: 19 September 2026</p>
          <div className="prose prose-slate mt-8 max-w-none prose-headings:font-semibold prose-a:text-emerald-700">
            <p>These Terms govern your use of CampusNest, a student housing safety, discovery, application, and confirmation platform.</p>
            <h2>1. Using CampusNest</h2>
            <p>You must provide accurate information, keep your account secure, and use the platform lawfully. You are responsible for activity performed through your account.</p>
            <h2>2. Students and applicants</h2>
            <p>Students must provide truthful identity, enrolment, funding, and contact information. CampusNest may request documents to verify eligibility and safety-related requirements.</p>
            <h2>3. Landlords and residence operators</h2>
            <p>Operators are responsible for accurate listings, lawful accommodation, truthful safety information, and responding to student or platform communications. A residence is not advertised to students until CampusNest administration approves it.</p>
            <h2>4. Verification and platform role</h2>
            <p>CampusNest reviews submitted information and may approve, reject, flag, or request changes to a listing. A CampusNest verification does not replace a landlord&apos;s legal, regulatory, or contractual obligations.</p>
            <h2>5. Content and communications</h2>
            <p>You grant CampusNest permission to process and display information needed to provide the service. We may send operational messages about accounts, listings, applications, safety, and verification.</p>
            <h2>6. Suspension and termination</h2>
            <p>We may restrict or close accounts where information is misleading, the platform is misused, or continued access creates a safety, legal, or operational risk.</p>
            <h2>7. Contact</h2>
            <p>For questions about these Terms, contact the CampusNest support team through the contact details provided in the platform.</p>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
