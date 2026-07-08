"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

const PERSONAS = [
  "Product Manager",
  "Product Analyst",
  "UX Researcher",
  "Engineering Manager",
  "Executive",
];

const inputClass =
  "rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand";

export function GeneratorPanel({
  orgId,
  themes,
}: {
  orgId: string;
  themes: string[];
}) {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const [persona, setPersona] = useState("");
  const [businessGoal, setBusinessGoal] = useState("");
  const [relatedTheme, setRelatedTheme] = useState("");
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
        body: JSON.stringify({
          orgId,
          featureIdea: idea,
          persona: persona || undefined,
          businessGoal: businessGoal || undefined,
          relatedTheme: relatedTheme || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not generate PRD");
        return;
      }

      setIdea("");
      setBusinessGoal("");
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
        className={inputClass}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-xs font-medium text-text-muted">
          Primary persona
          <select value={persona} onChange={(e) => setPersona(e.target.value)} className={inputClass}>
            <option value="">No specific persona</option>
            {PERSONAS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        {themes.length > 0 && (
          <label className="flex flex-col gap-1.5 text-xs font-medium text-text-muted">
            Related feedback theme
            <select
              value={relatedTheme}
              onChange={(e) => setRelatedTheme(e.target.value)}
              className={inputClass}
            >
              <option value="">No related feedback</option>
              {themes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <label className="flex flex-col gap-1.5 text-xs font-medium text-text-muted">
        Business goal (optional)
        <input
          value={businessGoal}
          onChange={(e) => setBusinessGoal(e.target.value)}
          placeholder="e.g. Reduce churn among Team-plan accounts"
          className={inputClass}
        />
      </label>

      {error && <p className="text-sm text-status-critical">{error}</p>}
      <SubmitButtonWrapper pending={pending} />
    </form>
  );
}

function SubmitButtonWrapper({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-fit items-center gap-1.5 rounded-lg bg-gradient-brand px-4 py-2.5 text-sm font-semibold text-white shadow-glow-brand disabled:opacity-60"
    >
      <Sparkles className="h-3.5 w-3.5" />
      {pending ? "Generating..." : "Generate PRD draft"}
    </button>
  );
}
