"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, ShieldAlert, Users } from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";

export interface SrcReport {
  id: string;
  subject: string;
  description: string;
  type: string;
  severity: string;
  status: string;
  category: string | null;
  actionNotes: string | null;
  createdAt: string;
  slaExpiresAt: string | null;
  student: { name: string; studentNumber: string; institution: string; email: string };
  property: { title: string; address: string; landlord: string };
}

type Filter = "ALL" | "UNDER_INTERVENTION" | "ESCALATED";

function severityClass(severity: string) {
  if (severity === "CRITICAL_EMERGENCY") return "border-red-600 bg-red-50";
  if (severity === "HIGH") return "border-orange-500 bg-orange-50";
  return "border-amber-400 bg-amber-50";
}

export default function SrcDashboardClient() {
  const [reports, setReports] = useState<SrcReport[]>([]);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadReports() {
    const response = await fetch("/api/src/reports", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Could not load escalated reports.");
      return;
    }
    setReports(data.reports);
  }

  useEffect(() => {
    loadReports().finally(() => setLoading(false));
  }, []);

  async function updateStatus(reportId: string, status: "UNDER_INTERVENTION" | "RESOLVED") {
    setUpdatingId(reportId);
    const response = await fetch("/api/src/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, status }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Could not update this report.");
    } else if (status === "RESOLVED") {
      setReports((current) => current.filter((report) => report.id !== reportId));
    } else {
      setReports((current) => current.map((report) => report.id === reportId ? { ...report, status } : report));
    }
    setUpdatingId(null);
  }

  const filteredReports = useMemo(
    () => filter === "ALL" ? reports : reports.filter((report) => report.status === filter),
    [filter, reports]
  );
  const criticalCount = reports.filter((report) => report.severity === "CRITICAL_EMERGENCY").length;
  const interventionCount = reports.filter((report) => report.status === "UNDER_INTERVENTION").length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-poppins">
      <Navbar userRole="SRC_REPRESENTATIVE" userName="SRC Representative" />
      <main className="mx-auto max-w-7xl space-y-7 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl bg-[#1E1B4B] p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-300"><ShieldAlert className="h-4 w-4" /> Student complaint response desk</div>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">Escalated residence complaints</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-200">Review complaints escalated by students and coordinate intervention with landlords. Resolved cases leave the active queue.</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3"><div className="text-2xl font-extrabold text-red-300">{criticalCount}</div><div className="text-[10px] text-indigo-200">Critical</div></div>
              <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3"><div className="text-2xl font-extrabold text-amber-300">{interventionCount}</div><div className="text-[10px] text-indigo-200">In action</div></div>
              <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3"><div className="text-2xl font-extrabold text-white">{reports.length}</div><div className="text-[10px] text-indigo-200">Open queue</div></div>
            </div>
          </div>
        </section>

        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div><h2 className="text-xl font-bold">SRC intervention queue</h2><p className="text-xs text-slate-500">Every case below was escalated by a student through CampusNest.</p></div>
          <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1">
            {(["ALL", "UNDER_INTERVENTION", "ESCALATED"] as Filter[]).map((value) => <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${filter === value ? "bg-[#4C1D95] text-white" : "text-slate-600 hover:bg-slate-50"}`}>{value.replace("_", " ")}</button>)}
          </div>
        </section>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
        {loading ? <div className="rounded-2xl bg-white p-10 text-center text-sm text-slate-500">Loading escalated complaints...</div> : filteredReports.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" /><p className="mt-3 font-bold">No complaints in this queue</p><p className="mt-1 text-sm text-slate-500">New student escalations will appear here.</p></div> : <div className="space-y-4">
          {filteredReports.map((report) => <article key={report.id} className={`rounded-2xl border-l-4 border border-slate-200 p-5 shadow-sm ${severityClass(report.severity)}`}>
            <div className="flex flex-col justify-between gap-3 border-b border-black/5 pb-4 sm:flex-row sm:items-start">
              <div className="flex items-center gap-2"><span className="rounded-md bg-red-600 px-2 py-1 text-[10px] font-extrabold uppercase text-white">SRC flagged</span><span className="text-xs font-bold uppercase text-slate-600">{report.severity.replace("_", " ")}</span><span className="text-xs text-slate-500">{report.category || "General"}</span></div>
              <span className="text-xs text-slate-500">{new Date(report.createdAt).toLocaleString("en-ZA")}</span>
            </div>
            <div className="grid gap-5 py-4 md:grid-cols-3">
              <div><p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-500"><Users className="h-3.5 w-3.5" /> Student</p><p className="mt-1 font-bold">{report.student.name}</p><p className="text-xs text-slate-600">{report.student.studentNumber} · {report.student.institution}</p><p className="text-xs text-slate-600">{report.student.email}</p></div>
              <div><p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Residence</p><p className="mt-1 font-bold">{report.property.title}</p><p className="text-xs text-slate-600">{report.property.address}</p><p className="text-xs text-slate-600">Landlord: {report.property.landlord}</p></div>
              <div><p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-500"><Clock3 className="h-3.5 w-3.5" /> SLA</p><p className="mt-1 font-bold">{report.slaExpiresAt ? new Date(report.slaExpiresAt).toLocaleString("en-ZA") : "Review required"}</p><p className="text-xs text-slate-600">{report.status.replace("_", " ")}</p></div>
            </div>
            <div className="rounded-xl border border-black/5 bg-white/70 p-4"><p className="font-bold">{report.subject}</p><p className="mt-1 text-sm leading-6 text-slate-700">{report.description}</p></div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><span className="text-xs font-semibold text-slate-600">Reference: {report.id}</span><div className="flex gap-2">{report.status !== "UNDER_INTERVENTION" && <button type="button" disabled={updatingId === report.id} onClick={() => updateStatus(report.id, "UNDER_INTERVENTION")} className="rounded-lg bg-[#4C1D95] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Start intervention</button>}<button type="button" disabled={updatingId === report.id} onClick={() => updateStatus(report.id, "RESOLVED")} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Mark resolved</button></div></div>
          </article>)}
        </div>}
      </main>
      <Footer />
    </div>
  );
}
