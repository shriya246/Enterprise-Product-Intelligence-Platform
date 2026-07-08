"use client";

import { useFormStatus } from "react-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function SubmitButton({
  children,
  pendingText,
}: {
  children: React.ReactNode;
  pendingText: string;
}) {
  const { pending } = useFormStatus();

  return (
    <motion.button
      type="submit"
      disabled={pending}
      whileHover={pending ? undefined : { scale: 1.02 }}
      whileTap={pending ? undefined : { scale: 0.98 }}
      className="flex items-center justify-center gap-1.5 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-glow-brand transition-opacity disabled:opacity-60"
    >
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {pending ? pendingText : children}
    </motion.button>
  );
}
