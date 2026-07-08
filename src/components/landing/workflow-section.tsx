"use client";

import { motion } from "framer-motion";
import { Database, Sparkles, Map, FileText, FlaskConical, Briefcase } from "lucide-react";

const STEPS = [
  { icon: Database, label: "Data in" },
  { icon: Sparkles, label: "AI insight" },
  { icon: Map, label: "Roadmap decision" },
  { icon: FileText, label: "PRD" },
  { icon: FlaskConical, label: "Experiment" },
  { icon: Briefcase, label: "Executive summary" },
];

export function WorkflowSection() {
  return (
    <section id="workflow" className="bg-surface px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-text-primary">
            One loop, not five disconnected tools
          </h2>
          <p className="mt-3 text-text-secondary">
            Every stage feeds the next, without a manual export in between.
          </p>
        </div>

        <div className="mt-14 flex flex-col items-center gap-3 lg:flex-row lg:justify-between">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              className="flex items-center gap-3 lg:flex-col lg:gap-2"
            >
              <div className="flex flex-col items-center gap-3 lg:flex-row">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-glow-brand">
                  <step.icon className="h-5 w-5" />
                </span>
                {i < STEPS.length - 1 && (
                  <div className="hidden h-px w-10 bg-border lg:block" aria-hidden />
                )}
              </div>
              <p className="text-center text-sm font-medium text-text-primary lg:text-center">
                {step.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
