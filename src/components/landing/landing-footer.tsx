import Link from "next/link";
import { Sparkles } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-border px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-text-muted sm:flex-row">
        <div className="flex items-center gap-2 font-medium text-text-secondary">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-brand text-white">
            <Sparkles className="h-3 w-3" />
          </span>
          PulseAI
        </div>
        <p>© {new Date().getFullYear()} PulseAI. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/login" className="hover:text-text-primary">
            Log in
          </Link>
          <Link href="/signup" className="hover:text-text-primary">
            Sign up
          </Link>
        </div>
      </div>
    </footer>
  );
}
