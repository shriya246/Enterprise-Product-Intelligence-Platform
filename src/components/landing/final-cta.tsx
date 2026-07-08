"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function FinalCta() {
  return (
    <section className="px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-3xl overflow-hidden rounded-2xl bg-gradient-brand px-8 py-14 text-center text-white shadow-glow-brand"
      >
        <h2 className="text-3xl font-semibold tracking-tight">
          Start building with real signal today
        </h2>
        <p className="mx-auto mt-3 max-w-md text-white/85">
          Free to start. No credit card, no separate analytics and feedback tools to wire
          together.
        </p>
        <Link
          href="/signup"
          className="mt-7 inline-block rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand transition-transform hover:scale-[1.03]"
        >
          Get started free
        </Link>
      </motion.div>
    </section>
  );
}
