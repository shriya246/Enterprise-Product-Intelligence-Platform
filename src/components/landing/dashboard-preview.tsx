"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";

const TILES = [
  { label: "Daily active users", value: "3,204", delta: "+6.1%", up: true },
  { label: "Weekly retention (Wk 4)", value: "61%", delta: "-4.2%", up: false },
  { label: "Feedback items this week", value: "128", delta: "+23%", up: true },
];

export function DashboardPreview() {
  return (
    <section id="preview" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-text-primary">
            See it the way your team will
          </h2>
          <p className="mt-3 text-text-secondary">
            Real numbers, not a demo tour — this is what an org&apos;s Overview page looks like.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mt-14 overflow-hidden rounded-2xl border border-border bg-surface shadow-soft-lg"
        >
          <div className="flex items-center gap-1.5 border-b border-border px-5 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-status-critical/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-status-warning/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-status-good/60" />
            <span className="ml-3 text-xs text-text-muted">app.pulseai — Overview</span>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {TILES.map((tile) => (
                <div key={tile.label} className="rounded-xl border border-border p-4">
                  <p className="text-xs text-text-muted">{tile.label}</p>
                  <div className="mt-1 flex items-end justify-between">
                    <p className="text-2xl font-semibold text-text-primary">{tile.value}</p>
                    <span
                      className={`flex items-center gap-0.5 text-xs font-medium ${
                        tile.up ? "text-status-good" : "text-status-critical"
                      }`}
                    >
                      {tile.up ? (
                        <TrendingUp className="h-3.5 w-3.5" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5" />
                      )}
                      {tile.delta}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-brand/20 bg-gradient-radial-brand p-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-brand">
                <ArrowUpRight className="h-3.5 w-3.5" />
                AI recommends prioritizing Slack integration based on feedback volume and
                enterprise impact
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                Mentioned in 34 feedback items this quarter, concentrated among accounts on the
                Team plan.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
