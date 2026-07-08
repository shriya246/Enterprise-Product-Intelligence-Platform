"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  MessageSquare,
  Sparkles,
  Map,
  FileText,
  FlaskConical,
  type LucideIcon,
} from "lucide-react";

const FEATURES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: BarChart3,
    title: "Product analytics",
    description:
      "DAU/WAU/MAU, retention curves, cohorts, and funnels — built on your org's own event stream, not a sample.",
  },
  {
    icon: MessageSquare,
    title: "Feedback intelligence",
    description:
      "Import feedback from anywhere and let AI cluster it into themes with sentiment, so patterns surface in minutes.",
  },
  {
    icon: Sparkles,
    title: "AI product assistant",
    description:
      "Ask \"why is retention dropping\" and get an answer grounded in your org's real analytics and feedback data.",
  },
  {
    icon: Map,
    title: "Roadmap prioritization",
    description:
      "AI-recommended priority ranking driven by real engagement and feedback volume, not a spreadsheet of guesses.",
  },
  {
    icon: FileText,
    title: "PRD generation",
    description:
      "Turn a feature idea into a structured draft — user stories, acceptance criteria, success metrics, risks.",
  },
  {
    icon: FlaskConical,
    title: "Experimentation",
    description:
      "Feature flags with percentage rollout and A/B significance testing, so you know a lift is real before you ship it.",
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-text-primary">
            Everything a product team needs, in one place
          </h2>
          <p className="mt-3 text-text-secondary">
            No more tab-switching between an analytics tool, a feedback tool, a roadmap tool, and
            a chat AI trying to reason about all three separately.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-border bg-surface p-6 shadow-soft transition-shadow hover:shadow-soft-lg"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-subtle text-brand">
                <feature.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-text-primary">{feature.title}</h3>
              <p className="mt-1.5 text-sm text-text-secondary">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
