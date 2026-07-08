"use client";

import { useFormState } from "react-dom";
import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Power } from "lucide-react";
import { createFlag, toggleFlag, updateFlagRollout, type ExperimentFormState } from "./actions";
import { SubmitButton } from "@/components/submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { AnimatedCard } from "@/components/ui/animated-card";

const initialState: ExperimentFormState = {};

interface Flag {
  id: string;
  key: string;
  name: string;
  is_enabled: boolean;
  rollout_pct: number;
}

const inputClass =
  "rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm text-text-primary outline-none focus:border-brand";

function FlagCard({ slug, flag, index }: { slug: string; flag: Flag; index: number }) {
  const [pending, startTransition] = useTransition();
  const [rollout, setRollout] = useState(flag.rollout_pct);

  function handleToggle() {
    const formData = new FormData();
    formData.set("flagId", flag.id);
    formData.set("isEnabled", (!flag.is_enabled).toString());
    startTransition(() => {
      toggleFlag(slug, formData);
    });
  }

  function commitRollout(value: number) {
    const formData = new FormData();
    formData.set("flagId", flag.id);
    formData.set("rolloutPct", String(value));
    startTransition(() => {
      updateFlagRollout(slug, formData);
    });
  }

  return (
    <AnimatedCard delay={index * 0.04} className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-text-primary">{flag.name}</p>
          <p className="text-xs text-text-muted">{flag.key}</p>
        </div>
        <motion.button
          type="button"
          onClick={handleToggle}
          disabled={pending}
          whileTap={{ scale: 0.95 }}
          title={flag.is_enabled ? "Kill switch — disable this flag" : "Enable this flag"}
          className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
          style={{
            background: flag.is_enabled ? "var(--status-good)" : "var(--border)",
            color: flag.is_enabled ? "#ffffff" : "var(--text-secondary)",
          }}
        >
          <Power className="h-3 w-3" />
          {flag.is_enabled ? "Enabled" : "Disabled"}
        </motion.button>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>Rollout</span>
          <span className="[font-variant-numeric:tabular-nums]">{rollout}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={rollout}
          onChange={(e) => setRollout(Number(e.target.value))}
          onMouseUp={(e) => commitRollout(Number((e.target as HTMLInputElement).value))}
          onTouchEnd={(e) => commitRollout(Number((e.target as HTMLInputElement).value))}
          className="mt-1 w-full accent-brand"
        />
      </div>
    </AnimatedCard>
  );
}

export function FlagsPanel({ slug, flags }: { slug: string; flags: Flag[] }) {
  const boundAction = createFlag.bind(null, slug);
  const [state, formAction] = useFormState(boundAction, initialState);

  return (
    <div className="flex flex-col gap-4">
      {flags.length === 0 ? (
        <EmptyState
          icon={<Power className="h-5 w-5" />}
          title="No feature flags yet"
          description="Add one below to gate a rollout by percentage."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {flags.map((flag, i) => (
            <FlagCard key={flag.id} slug={slug} flag={flag} index={i} />
          ))}
        </div>
      )}

      <form action={formAction} className="flex flex-wrap items-end gap-2 rounded-xl border border-border p-3">
        <label className="flex flex-col gap-1 text-xs text-text-muted">
          Name
          <input name="name" required placeholder="New checkout flow" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-text-muted">
          Key
          <input
            name="key"
            required
            placeholder="new_checkout"
            pattern="[a-z0-9_]+"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-text-muted">
          Rollout %
          <input
            name="rolloutPct"
            type="number"
            min={0}
            max={100}
            defaultValue={100}
            className={`w-20 ${inputClass}`}
          />
        </label>
        <SubmitButton pendingText="Adding...">Add flag</SubmitButton>
      </form>
      {state.error && <p className="text-sm text-status-critical">{state.error}</p>}
    </div>
  );
}
