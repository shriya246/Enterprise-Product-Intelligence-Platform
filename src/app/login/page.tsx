"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { motion } from "framer-motion";
import { login, type AuthFormState } from "./actions";
import { SubmitButton } from "@/components/submit-button";
import { AuthLayout } from "@/components/auth/auth-layout";

const initialState: AuthFormState = {};

const inputClass =
  "rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand";

export default function LoginPage() {
  const [state, formAction] = useFormState(login, initialState);

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          Log in to PulseAI
        </h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-brand hover:underline">
            Sign up
          </Link>
        </p>

        <form action={formAction} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-text-secondary">
            Email
            <input name="email" type="email" required className={inputClass} />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-text-secondary">
            Password
            <input name="password" type="password" required className={inputClass} />
          </label>

          {state.error && (
            <p role="alert" className="text-sm text-status-critical">
              {state.error}
            </p>
          )}

          <SubmitButton pendingText="Logging in...">Log in</SubmitButton>
        </form>
      </motion.div>
    </AuthLayout>
  );
}
