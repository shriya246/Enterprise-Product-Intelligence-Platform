"use client";

import { motion } from "framer-motion";

const LOGOS = ["NORTHPEAK", "VERUS", "ATLAS LABS", "CIRCUIT", "MERIDIAN", "HALCYON"];

export function TrustSection() {
  return (
    <section className="border-y border-border bg-surface px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center text-xs font-medium uppercase tracking-wide text-text-muted"
        >
          Built for product teams at fast-moving companies
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
        >
          {LOGOS.map((logo) => (
            <span
              key={logo}
              className="text-sm font-semibold tracking-wide text-text-muted/70 grayscale"
            >
              {logo}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
