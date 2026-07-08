"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";

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
      <motion.button
        type="button"
        onClick={handleClick}
        disabled={status === "loading"}
        whileHover={status === "loading" ? undefined : { scale: 1.02 }}
        whileTap={status === "loading" ? undefined : { scale: 0.98 }}
        className="flex items-center gap-1.5 rounded-lg bg-gradient-brand px-3.5 py-1.5 text-sm font-medium text-white shadow-glow-brand disabled:opacity-60"
      >
        {status === "loading" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Sparkles className="h-3.5 w-3.5" />
        )}
        {status === "loading" ? "Clustering..." : "Cluster with AI"}
      </motion.button>
      {message && (
        <p className={`text-xs ${status === "error" ? "text-status-critical" : "text-text-muted"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
