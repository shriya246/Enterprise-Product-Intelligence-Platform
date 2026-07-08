"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

function toMarkdown(draft: {
  title: string;
  user_stories: string[];
  acceptance_criteria: string[];
  success_metrics: string[];
  risks: string[];
}): string {
  const section = (title: string, items: string[]) =>
    items.length === 0 ? "" : `## ${title}\n${items.map((i) => `- ${i}`).join("\n")}\n\n`;

  return (
    `# ${draft.title}\n\n` +
    section("User stories", draft.user_stories) +
    section("Acceptance criteria", draft.acceptance_criteria) +
    section("Success metrics", draft.success_metrics) +
    section("Risks", draft.risks)
  ).trim();
}

export function CopyMarkdownButton({
  draft,
}: {
  draft: {
    title: string;
    user_stories: string[];
    acceptance_criteria: string[];
    success_metrics: string[];
    risks: string[];
  };
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(toMarkdown(draft));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:border-brand/40 hover:text-brand"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy Markdown"}
    </button>
  );
}
