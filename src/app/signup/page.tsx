"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { signup } from "./actions";
import type { AuthFormState } from "@/app/login/actions";
import { SubmitButton } from "@/components/submit-button";
import { AuthLayout } from "@/components/auth/auth-layout";

const initialState: AuthFormState = {};

const inputClass =
  "rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand";

export default function SignupPage() {
  const [state, formAction] = useFormState(signup, initialState);

  if (state.success) {
    return (
      <AuthLayout>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="text-center"
        >
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-status-good/10 text-status-good">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-text-primary">
            Check your email
          </h1>
          <p className="mt-1.5 text-sm text-text-secondary">
            We sent you a confirmation link. Follow it to activate your account, then log in.
          </p>
          <Link href="/login" className="mt-4 inline-block text-sm font-medium text-brand hover:underline">
            Back to login
          </Link>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          Create your PulseAI account
        </h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand hover:underline">
            Log in
          </Link>
        </p>

        <form action={formAction} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-text-secondary">
            Full name
            <input name="fullName" type="text" required className={inputClass} />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-text-secondary">
            Email
            <input name="email" type="email" required className={inputClass} />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-text-secondary">
            Password
            <input name="password" type="password" required minLength={8} className={inputClass} />
          </label>

          {state.error && (
            <p role="alert" className="text-sm text-status-critical">
              {state.error}
            </p>
          )}

          <SubmitButton pendingText="Creating account...">Sign up</SubmitButton>
        </form>
      </motion.div>
    </AuthLayout>
  );
}
