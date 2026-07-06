"use client";

import { useFormState } from "react-dom";
import { useState } from "react";
import Papa from "papaparse";
import { addFeedback, importFeedback, type FeedbackFormState } from "./actions";
import { SubmitButton } from "@/components/submit-button";

const initialState: FeedbackFormState = {};

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
        className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
      />
      <input
        name="author"
        type="text"
        placeholder="Author (optional)"
        className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
      />
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.success && <p className="text-sm text-green-600">Added.</p>}
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
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        className="text-sm"
      />
      <input type="hidden" name="rows" value={rowsJson} />

      {parseError && <p className="text-sm text-red-600">{parseError}</p>}
      {parsedCount !== null && !parseError && (
        <p className="text-sm text-neutral-500">Parsed {parsedCount} row(s), ready to import.</p>
      )}
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm text-green-600">Imported {state.importedCount} row(s).</p>
      )}

      <SubmitButton pendingText="Importing...">Import CSV</SubmitButton>
    </form>
  );
}
