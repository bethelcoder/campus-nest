"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EscalateReportButton({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function escalate() {
    setState("loading");
    const response = await fetch(`/api/reports/${reportId}/escalate`, { method: "POST" });
    const data = await response.json();
    if (!response.ok) {
      setState("error");
      setMessage(data.error || "Could not escalate this report.");
      return;
    }
    setState("done");
    setMessage("Escalated to SRC");
    router.refresh();
  }

  if (state === "done") {
    return <span className="text-[11px] font-extrabold uppercase tracking-wide text-red-700">{message}</span>;
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={escalate}
        disabled={state === "loading"}
        className="rounded-lg border border-red-300 bg-red-50 px-2.5 py-1.5 text-[11px] font-extrabold text-red-700 hover:bg-red-100 disabled:cursor-wait disabled:opacity-60"
      >
        {state === "loading" ? "Escalating..." : "Escalate to SRC"}
      </button>
      {state === "error" && <span className="max-w-[180px] text-right text-[10px] text-red-600">{message}</span>}
    </div>
  );
}