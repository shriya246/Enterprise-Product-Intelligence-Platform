"use client";

import { useState } from "react";

interface Message {
  role: "user" | "assistant" | "error";
  content: string;
}

const SUGGESTIONS = [
  "Why is retention dropping?",
  "Which feedback theme comes up most?",
  "How are we trending on weekly active users?",
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
          ? { role: "assistant", content: data.answer }
          : { role: "error", content: data.error ?? "Something went wrong" },
      ]);
    } catch {
      setMessages((prev) => [...prev, { role: "error", content: "Network error" }]);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => ask(s)}
              className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs dark:border-neutral-700"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-2xl rounded-lg border p-3 text-sm ${
              m.role === "user"
                ? "self-end border-neutral-300 dark:border-neutral-700"
                : m.role === "error"
                  ? "self-start border-red-300 text-red-600"
                  : "self-start border-neutral-200 dark:border-neutral-800"
            }`}
          >
            {m.content}
          </div>
        ))}
        {pending && <p className="text-sm text-neutral-500">Thinking...</p>}
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
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-neutral-900"
        >
          Ask
        </button>
      </form>
    </div>
  );
}
