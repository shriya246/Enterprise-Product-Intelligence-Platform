import { Check, X } from "lucide-react";

export function QualityChecklist({
  draft,
}: {
  draft: {
    user_stories: string[];
    acceptance_criteria: string[];
    success_metrics: string[];
    risks: string[];
  };
}) {
  const checks = [
    { label: "At least 3 user stories", pass: draft.user_stories.length >= 3 },
    { label: "Has testable acceptance criteria", pass: draft.acceptance_criteria.length >= 3 },
    { label: "Has measurable success metrics", pass: draft.success_metrics.length >= 2 },
    { label: "Risks identified", pass: draft.risks.length >= 2 },
  ];

  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
      {checks.map((check) => (
        <li
          key={check.label}
          className={`flex items-center gap-1 text-xs ${check.pass ? "text-status-good" : "text-text-muted"}`}
        >
          {check.pass ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          {check.label}
        </li>
      ))}
    </ul>
  );
}
