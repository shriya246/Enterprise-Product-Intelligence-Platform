"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, BarChart3, MessageSquare, Map } from "lucide-react";

const HIGHLIGHTS = [
  { icon: BarChart3, text: "Real-time analytics grounded in your org's own events" },
  { icon: MessageSquare, text: "AI-clustered feedback with sentiment, not a raw inbox" },
  { icon: Map, text: "Roadmap prioritization backed by usage, not opinion" },
];

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <Link href="/" className="mb-10 flex items-center gap-2 font-semibold">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-brand text-white">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          PulseAI
        </Link>
        <div className="mx-auto w-full max-w-sm">{children}</div>
      </div>

      <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-gradient-brand p-12 lg:flex">
        <div className="absolute inset-0 bg-gradient-radial-brand opacity-40" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative max-w-md text-white"
        >
          <p className="text-2xl font-semibold leading-snug">
            One workspace for analytics, feedback, and AI-generated product insight.
          </p>
          <div className="mt-8 flex flex-col gap-4">
            {HIGHLIGHTS.map((item, i) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <item.icon className="h-4 w-4" />
                </span>
                <p className="text-sm text-white/90">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
