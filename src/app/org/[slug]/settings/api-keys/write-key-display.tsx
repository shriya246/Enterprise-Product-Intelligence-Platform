"use client";

import { useState } from "react";
import { Check, Copy, Eye, EyeOff } from "lucide-react";

export function WriteKeyDisplay({ writeKey }: { writeKey: string }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(writeKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const masked = `${writeKey.slice(0, 8)}${"•".repeat(20)}`;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-raised px-3.5 py-2.5">
      <code className="flex-1 truncate text-sm text-text-primary">
        {revealed ? writeKey : masked}
      </code>
      <button
        onClick={() => setRevealed((v) => !v)}
        className="rounded-md p-1.5 text-text-secondary hover:bg-surface"
        aria-label={revealed ? "Hide key" : "Reveal key"}
      >
        {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
      <button
        onClick={handleCopy}
        className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-text-secondary hover:border-brand/40 hover:text-brand"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
