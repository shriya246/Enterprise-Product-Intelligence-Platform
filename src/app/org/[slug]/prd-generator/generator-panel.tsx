"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function GeneratorPanel({ orgId }: { orgId: string }) {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    try {
      const res = await fetch("/api/prd/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, featureIdea: idea }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not generate PRD");
        return;
      }

      setIdea("");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <textarea
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        rows={3}
        required
        minLength={10}
        placeholder="Describe a feature idea, e.g. 'Let users export their dashboard as a PDF for board decks'"
        className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-neutral-900"
      >
        {pending ? "Generating..." : "Generate PRD draft"}
      </button>
    </form>
  );
}
