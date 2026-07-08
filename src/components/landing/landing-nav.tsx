"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function LandingNav() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-brand text-white">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          PulseAI
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-text-secondary md:flex">
          <a href="#features" className="hover:text-text-primary">
            Features
          </a>
          <a href="#workflow" className="hover:text-text-primary">
            How it works
          </a>
          <a href="#preview" className="hover:text-text-primary">
            Product
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-text-secondary hover:text-text-primary"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-glow-brand transition-transform hover:scale-[1.03]"
          >
            Get started free
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
