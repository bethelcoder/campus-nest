"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LetterActions({ letterId, status }: { letterId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function act(url: string, body: object) {
    setLoading(true);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (status === "PENDING_REVIEW") {
    return (
      <div className="flex gap-2">
        <button
          disabled={loading}
          onClick={() => act("/api/confirmation/endorse", { letterId, decision: "ENDORSE" })}
          className="text-xs bg-safe text-white px-2 py-1 rounded disabled:opacity-50"
        >
          Endorse
        </button>
        <button
          disabled={loading}
          onClick={() => act("/api/confirmation/endorse", { letterId, decision: "REJECT" })}
          className="text-xs bg-risk text-white px-2 py-1 rounded disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    );
  }

  if (status === "ENDORSED") {
    return (
      <button
        disabled={loading}
        onClick={() => act("/api/confirmation/send", { letterId })}
        className="text-xs bg-gray-900 text-white px-2 py-1 rounded disabled:opacity-50"
      >
        Send to student & funder
      </button>
    );
  }

  return null;
}
