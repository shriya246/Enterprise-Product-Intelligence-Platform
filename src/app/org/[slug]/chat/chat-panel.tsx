"use client";

import { useState } from "react";
import { Sparkles, Send } from "lucide-react";
import { AIMessage, type Evidence } from "@/components/ui/ai-message";
import { PromptChip } from "@/components/ui/prompt-chip";

interface Message {
  role: "user" | "assistant" | "error";
  content: string;
  evidence?: Evidence[];
  streaming?: boolean;
}

const SUGGESTIONS = [
  "Why is retention dropping?",
  "Which feature should we prioritize?",
  "Summarize customer feedback.",
  "What experiment should we run next?",
  "Generate an executive product summary.",
];

export function ChatPanel({ orgId }: { orgId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState(false);

  async function ask(q: string) {
    if (!q.trim() || pending) return;

    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setQuestion("");
    setPending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, question: q }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        res.ok
          ? { role: "assistant", content: data.answer, evidence: data.evidence, streaming: true }
          : { role: "error", content: data.error ?? "Something went wrong" },
      ]);
    } catch {
      setMessages((prev) => [...prev, { role: "error", content: "Network error" }]);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {messages.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border px-6 py-10 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-brand-subtle text-brand">
            <Sparkles className="h-5 w-5" />
          </span>
          <p className="mt-3 text-sm font-semibold text-text-primary">
            Ask anything about your product data
          </p>
          <p className="mt-1 text-sm text-text-muted">
            Answers are grounded in your org&apos;s real analytics and feedback — try one of these:
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((s) => (
              <PromptChip key={s} label={s} onClick={() => ask(s)} />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-5">
        {messages.map((m, i) =>
          m.role === "error" ? (
            <p key={i} className="rounded-xl border border-status-critical/30 bg-status-critical/5 px-4 py-2.5 text-sm text-status-critical">
              {m.content}
            </p>
          ) : (
            <AIMessage
              key={i}
              role={m.role}
              content={m.content}
              evidence={m.evidence}
              streaming={m.streaming && i === messages.length - 1}
            />
          )
        )}
        {pending && (
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-brand text-white">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted" />
            </span>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
        className="flex gap-2"
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about your product data..."
          className="flex-1 rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand"
        />
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-brand px-4 py-2.5 text-sm font-semibold text-white shadow-glow-brand disabled:opacity-60"
        >
          <Send className="h-3.5 w-3.5" />
          Ask
        </button>
      </form>
    </div>
  );
}
