"use client";

import { useFormState } from "react-dom";
import { useState } from "react";
import Papa from "papaparse";
import { UploadCloud } from "lucide-react";
import { addFeedback, importFeedback, type FeedbackFormState } from "./actions";
import { SubmitButton } from "@/components/submit-button";

const initialState: FeedbackFormState = {};

const inputClass =
  "rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand";

export function AddFeedbackForm({ slug }: { slug: string }) {
  const boundAction = addFeedback.bind(null, slug);
  const [state, formAction] = useFormState(boundAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <textarea
        name="body"
        required
        rows={3}
        placeholder="Paste a piece of customer feedback..."
        className={inputClass}
      />
      <input name="author" type="text" placeholder="Author (optional)" className={inputClass} />
      {state.error && (
        <p role="alert" className="text-sm text-status-critical">
          {state.error}
        </p>
      )}
      {state.success && <p className="text-sm text-status-good">Added.</p>}
      <SubmitButton pendingText="Adding...">Add feedback</SubmitButton>
    </form>
  );
}

export function ImportCsvForm({ slug }: { slug: string }) {
  const boundAction = importFeedback.bind(null, slug);
  const [state, formAction] = useFormState(boundAction, initialState);
  const [rowsJson, setRowsJson] = useState("");
  const [parsedCount, setParsedCount] = useState<number | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  function handleFile(file: File) {
    setParseError(null);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data
          .map((row) => ({
            body: row.body ?? row.feedback ?? row.text ?? "",
            author: row.author ?? row.name ?? undefined,
          }))
          .filter((row) => row.body.trim().length > 0);

        if (rows.length === 0) {
          setParseError("No usable rows found. Expected a 'body' (or 'feedback'/'text') column.");
          setRowsJson("");
          setParsedCount(null);
          return;
        }

        setRowsJson(JSON.stringify(rows));
        setParsedCount(rows.length);
      },
      error: (err) => setParseError(err.message),
    });
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border px-4 py-6 text-center transition-colors hover:border-brand/40 hover:bg-brand-subtle">
        <UploadCloud className="h-5 w-5 text-text-muted" />
        <span className="text-sm text-text-secondary">Click to choose a CSV file</span>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          className="hidden"
        />
      </label>
      <input type="hidden" name="rows" value={rowsJson} />

      {parseError && <p className="text-sm text-status-critical">{parseError}</p>}
      {parsedCount !== null && !parseError && (
        <p className="text-sm text-text-muted">Parsed {parsedCount} row(s), ready to import.</p>
      )}
      {state.error && (
        <p role="alert" className="text-sm text-status-critical">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm text-status-good">Imported {state.importedCount} row(s).</p>
      )}

      <SubmitButton pendingText="Importing...">Import CSV</SubmitButton>
    </form>
  );
}
