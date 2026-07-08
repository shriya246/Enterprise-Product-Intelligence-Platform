"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyableCode({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="relative rounded-lg border border-border bg-surface-raised">
      {label && (
        <p className="border-b border-border px-3 py-1.5 text-xs font-medium text-text-muted">
          {label}
        </p>
      )}
      <pre className="overflow-x-auto p-3 text-xs text-text-primary">
        <code>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-xs text-text-secondary hover:border-brand/40 hover:text-brand"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
