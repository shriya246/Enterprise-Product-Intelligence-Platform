"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, TrendingUp } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-radial-brand px-6 pb-20 pt-20 sm:pt-28">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-14 lg:flex-row lg:items-center lg:gap-10">
        <div className="flex-1 text-center lg:text-left">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand-subtle px-3 py-1 text-xs font-medium text-brand"
          >
            Product intelligence, unified
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-5 text-balance text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl lg:text-[3.25rem]"
          >
            The AI-native workspace for product teams who ship with data, not guesswork.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-5 max-w-xl text-balance text-lg text-text-secondary lg:mx-0"
          >
            Analytics, customer feedback, and AI-generated insight in one workspace — so your
            team spends less time stitching tools together and more time deciding what to build
            next.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
          >
            <Link
              href="/signup"
              className="w-full rounded-lg bg-gradient-brand px-6 py-3 text-center text-sm font-semibold text-white shadow-glow-brand transition-transform hover:scale-[1.02] sm:w-auto"
            >
              Get started free
            </Link>
            <a
              href="#preview"
              className="flex w-full items-center justify-center gap-1 rounded-lg border border-border px-6 py-3 text-center text-sm font-semibold text-text-primary hover:bg-surface-raised sm:w-auto"
            >
              See it in action
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </motion.div>
        </div>

        {/* Animated product preview card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md flex-1"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="rounded-2xl border border-border bg-surface p-5 shadow-soft-lg"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-text-primary">Weekly active users</p>
              <span className="flex items-center gap-1 text-xs font-medium text-status-good">
                <TrendingUp className="h-3.5 w-3.5" />
                +18.2%
              </span>
            </div>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-text-primary">
              24,891
            </p>

            <svg viewBox="0 0 300 80" className="mt-4 w-full">
              <motion.path
                d="M0 60 L30 55 L60 58 L90 40 L120 44 L150 30 L180 34 L210 18 L240 22 L270 10 L300 14"
                fill="none"
                stroke="var(--brand)"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.4, delay: 0.6, ease: "easeOut" }}
              />
            </svg>

            <div className="mt-4 rounded-xl bg-gradient-radial-brand p-3">
              <p className="flex items-center gap-1.5 text-xs font-medium text-brand">
                AI insight
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                Activation dropped 8.4% in the onboarding cohort — likely tied to the new pricing
                step. Consider an experiment.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
