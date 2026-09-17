"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  Zap,
  Layers,
  Webhook,
  Code2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Calendar,
  Clock,
  ChevronRight,
  BarChart3,
  Server,
  FileSpreadsheet,
  Workflow,
  ExternalLink,
} from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input, Select, Textarea } from "@/components/ui/Input";

export default function LandlordMarketingPage() {
  // Trust Audit Booking Modal / State
  const [bookingStep, setBookingStep] = useState<1 | 2>(1);
  const [auditForm, setAuditForm] = useState({
    businessName: "",
    contactEmail: "",
    propertyCount: "1 - 5 Units",
    city: "Johannesburg",
    preferredDate: "",
    notes: "",
  });
  const [auditSubmitted, setAuditSubmitted] = useState(false);

  const handleAuditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuditSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/80 dark:border-navy-800 bg-gradient-to-b from-navy-900 via-navy-950 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:28px_28px] opacity-20 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-semibold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>B2B Multi-Tier Housing Operator Infrastructure</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-poppins leading-[1.15]">
              Fast-Track Your Rental Income Pipeline.{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Eliminate Corporate Bursary
              </span>{" "}
              Bureaucracy.
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed">
              Whether you manage a 4-bedroom commune or a 2,000-bed purpose-built student community, CampusNest
              automates student verification, municipal safety ratings, and instant funder disbursement confirmations.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/landlord/register">
                <Button variant="emerald" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Register Property &amp; Begin Audit
                </Button>
              </Link>
              <a href="#audit-booking">
                <Button variant="outline" size="lg" className="text-white border-slate-700 hover:bg-slate-800">
                  Book a Compliance Audit
                </Button>
              </a>
            </div>

            {/* Quick Metrics Header */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 border-t border-slate-800/80 text-left">
              <div className="p-3 bg-navy-900/50 rounded-xl border border-slate-800">
                <div className="text-2xl font-extrabold text-white">99.4%</div>
                <div className="text-xs text-slate-400">Bursary Approval Rate</div>
              </div>
              <div className="p-3 bg-navy-900/50 rounded-xl border border-slate-800">
                <div className="text-2xl font-extrabold text-emerald-400">&lt; 48 Hrs</div>
                <div className="text-xs text-slate-400">SLA Resolution Engine</div>
              </div>
              <div className="p-3 bg-navy-900/50 rounded-xl border border-slate-800">
                <div className="text-2xl font-extrabold text-blue-400">StarRez / MRI</div>
                <div className="text-xs text-slate-400">Headless API Ready</div>
              </div>
              <div className="p-3 bg-navy-900/50 rounded-xl border border-slate-800">
                <div className="text-2xl font-extrabold text-teal-300">0% Ghost Leases</div>
                <div className="text-xs text-slate-400">Tamper-Proof Audit Trail</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Tier Strategy Grid */}
      <section className="py-20 bg-white dark:bg-navy-900 border-b border-slate-200/80 dark:border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <Badge variant="navy" size="md">
              ARCHITECTURE &amp; INTEGRATION MATRIX
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-poppins">
              Tailored Across Three Operating Scales
            </h2>
            <p className="text-base text-slate-500 dark:text-slate-400">
              Select the operating model matching your property portfolio's technical and operational infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Column 1: The SME/Independent Tier */}
            <Card variant="elevated" className="border-t-4 border-t-emerald-500 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
                    Tier 1: SME &amp; Direct
                  </span>
                  <Building2 className="w-5 h-5 text-emerald-600" />
                </div>
                <CardTitle className="text-xl mb-2">Independent Landlords</CardTitle>
                <CardDescription className="text-sm leading-relaxed mb-6">
                  For private property owners managing 1 to 20 beds seeking zero-paperwork accreditation and immediate
                  funder recognition.
                </CardDescription>

                <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300 mb-6">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Digital 13-Point Self-Auditing Tool</strong> with guided photographic upload.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Native Tracking Engine</strong> for inbound student bursary applications.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Maintenance Triage Pipeline</strong> with built-in SLA countdown timers.
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-navy-800">
                <Link href="/landlord/register">
                  <Button variant="emerald" className="w-full">
                    Start SME Onboarding
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Column 2: The Mid-Tier (Profile Hand-off) */}
            <Card variant="elevated" className="border-t-4 border-t-blue-500 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full">
                    Tier 2: Mid-Tier Agency
                  </span>
                  <Workflow className="w-5 h-5 text-blue-600" />
                </div>
                <CardTitle className="text-xl mb-2">Property Agencies &amp; Res Co.</CardTitle>
                <CardDescription className="text-sm leading-relaxed mb-6">
                  For professional management firms (20 to 200 beds) requiring batch profile hand-offs and fast-tracked
                  tenant onboarding.
                </CardDescription>

                <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300 mb-6">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Profile Hand-off</strong> with pre-filled encrypted URL parameters.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Dynamic Custom Field Injector</strong> for proprietary guarantor and medical waivers.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Multi-Unit Batch Accreditation</strong> with university compliance export.
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-navy-800">
                <Link href="/landlord/register">
                  <Button variant="primary" className="w-full">
                    Configure Agency Portal
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Column 3: The Enterprise Tier (Headless JSON & Webhooks) */}
            <Card
              variant="elevated"
              className="border-t-4 border-t-purple-500 bg-gradient-to-b from-white to-purple-50/20 dark:from-navy-900 dark:to-purple-950/20 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-full">
                    Tier 3: Enterprise PBSA
                  </span>
                  <Server className="w-5 h-5 text-purple-600" />
                </div>
                <CardTitle className="text-xl mb-2">Enterprise Housing REITs</CardTitle>
                <CardDescription className="text-sm leading-relaxed mb-6">
                  For large-scale operators (200+ beds) running StarRez, MRI Software, or custom PMS platforms needing
                  headless programmatic sync.
                </CardDescription>

                <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300 mb-6">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Headless REST API</strong> (<code>/api/v1/enterprise</code>) pushing structured KYC JSON.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Inbound Webhook Listeners</strong> for automated <code>room_booked</code> inventory
                      deductions.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Cryptographic Bulk Funder Letters</strong> with instant QR registry endpoints.
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-navy-800">
                <Link href="/landlords#enterprise-docs">
                  <Button variant="secondary" className="w-full" rightIcon={<Code2 className="w-4 h-4" />}>
                    Explore Enterprise API Specs
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Audit Call-To-Action & Booking Loop */}
      <section id="audit-booking" className="py-20 bg-slate-100/70 dark:bg-navy-950 border-b border-slate-200/80 dark:border-navy-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <Badge variant="warning" size="md">
              THE 2-STEP VETTING LOOP
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-poppins">
              Book Your Student-Centric Safety Audit
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Submit your property details and schedule a local municipal compliance audit to unlock verified student
              trust badges.
            </p>
          </div>

          <Card variant="elevated" className="p-6 sm:p-10 bg-white dark:bg-navy-900">
            {auditSubmitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Audit Request Received!</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                  Our regional accreditation officer for <strong>{auditForm.city}</strong> will contact{" "}
                  <strong>{auditForm.contactEmail}</strong> within 24 business hours to confirm your audit inspection
                  date.
                </p>
                <div className="pt-4">
                  <Link href="/landlord/register">
                    <Button variant="primary" size="md">
                      Continue to Self-Assessment Setup
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAuditSubmit} className="space-y-6">
                {/* Step indicator */}
                <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-navy-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      1
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Digital KYC &amp; Profile</h4>
                      <p className="text-xs text-slate-400">Business registration and property counts</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center">
                      2
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Physical Compliance Audit</h4>
                      <p className="text-xs text-slate-400">13-point bylaw verification inspection</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Entity or Property Name"
                    required
                    placeholder="e.g. Apex Student Living Pty Ltd"
                    value={auditForm.businessName}
                    onChange={(e) => setAuditForm({ ...auditForm, businessName: e.target.value })}
                  />
                  <Input
                    label="Business Contact Email"
                    type="email"
                    required
                    placeholder="e.g. operations@apexliving.co.za"
                    value={auditForm.contactEmail}
                    onChange={(e) => setAuditForm({ ...auditForm, contactEmail: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    label="Portfolio Size"
                    value={auditForm.propertyCount}
                    onChange={(e) => setAuditForm({ ...auditForm, propertyCount: e.target.value })}
                    options={[
                      { value: "1 - 5 Units", label: "1 - 5 Units (SME)" },
                      { value: "6 - 20 Units", label: "6 - 20 Units (Mid-Tier)" },
                      { value: "21 - 100 Units", label: "21 - 100 Units" },
                      { value: "100+ Beds", label: "100+ Beds (Enterprise PBSA)" },
                    ]}
                  />

                  <Select
                    label="Metro Region"
                    value={auditForm.city}
                    onChange={(e) => setAuditForm({ ...auditForm, city: e.target.value })}
                    options={[
                      { value: "Johannesburg", label: "City of Johannesburg (Wits / UJ)" },
                      { value: "Tshwane", label: "City of Tshwane (UP / TUT)" },
                      { value: "Cape Town", label: "City of Cape Town (UCT / CPUT / UWC)" },
                      { value: "Durban", label: "eThekwini (UKZN / DUT)" },
                      { value: "Gqeberha", label: "Nelson Mandela Bay (NMU)" },
                    ]}
                  />

                  <Input
                    label="Target Inspection Date"
                    type="date"
                    required
                    value={auditForm.preferredDate}
                    onChange={(e) => setAuditForm({ ...auditForm, preferredDate: e.target.value })}
                  />
                </div>

                <Textarea
                  label="Special Notes or Access Specifications (Optional)"
                  rows={2}
                  placeholder="e.g., Keycard gate codes, on-site building manager contact info..."
                  value={auditForm.notes}
                  onChange={(e) => setAuditForm({ ...auditForm, notes: e.target.value })}
                />

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-500">
                    Includes automatic 0–100 Safety Score grade computation upon physical visit.
                  </span>
                  <Button type="submit" variant="emerald" size="md" rightIcon={<Calendar className="w-4 h-4" />}>
                    Schedule Vetting Audit
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      </section>

      {/* Enterprise API Code Example Teaser */}
      <section id="enterprise-docs" className="py-20 bg-navy-950 text-white border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="purple" size="md">
                HEADLESS REST API &amp; WEBHOOKS
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-poppins">
                Programmatic Ingestion for Enterprise PMS
              </h2>
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                Hook into <code>/api/v1/enterprise</code> to push bulk verified student tenants directly from your StarRez
                or MRI instance, and register webhook endpoints to automatically adjust available beds as rooms are
                booked.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-mono">
                    POST
                  </div>
                  <span>
                    <code>/api/v1/enterprise</code> &mdash; Batch Student KYC &amp; Verification Ingestion
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-mono">
                    POST
                  </div>
                  <span>
                    <code>/api/v1/enterprise/webhook</code> &mdash; Real-time StarRez / MRI Event Sync
                  </span>
                </div>
              </div>
            </div>

            {/* Code Snippet Box */}
            <div className="rounded-2xl bg-navy-900 border border-navy-700/80 p-5 shadow-2xl font-mono text-xs overflow-x-auto text-slate-300">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-navy-800 text-slate-400">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[11px] text-slate-400 ml-2">enterprise-webhook-payload.json</span>
                </span>
                <span className="text-[10px] text-blue-400 font-semibold">JSON Schema</span>
              </div>
              <pre className="text-slate-200">
{`{
  "event": "room_booked",
  "operator_id": "OP-9821-PBSA",
  "property_id": "prop_braam_loft_102",
  "student": {
    "student_number": "2489102",
    "institution": "University of the Witwatersrand",
    "university_email": "lerato.nkosi@wits.ac.za",
    "funder": "NSFAS",
    "kyc_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  },
  "lease_terms": {
    "monthly_rate": 4950.00,
    "start_date": "2026-02-01",
    "end_date": "2026-11-30"
  },
  "auto_generate_letter": true
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
