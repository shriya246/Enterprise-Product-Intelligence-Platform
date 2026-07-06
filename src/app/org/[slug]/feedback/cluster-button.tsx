"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ClusterButton({ orgId }: { orgId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setStatus("loading");
    setMessage(null);

    try {
      const res = await fetch("/api/feedback/cluster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Could not cluster feedback");
        return;
      }

      setStatus("done");
      setMessage(`Clustered ${data.clustered} item(s).`);
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Network error");
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={status === "loading"}
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-60 dark:border-neutral-700"
      >
        {status === "loading" ? "Clustering..." : "Cluster with AI"}
      </button>
      {message && (
        <p className={`text-xs ${status === "error" ? "text-red-600" : "text-neutral-500"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
