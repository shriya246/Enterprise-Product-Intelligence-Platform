import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        "surface-raised": "var(--surface-raised)",
        border: "var(--border)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        brand: {
          DEFAULT: "var(--brand)",
          hover: "var(--brand-hover)",
          subtle: "var(--brand-subtle)",
        },
        accent: {
          violet: "var(--accent-violet)",
          aqua: "var(--accent-aqua)",
        },
        status: {
          good: "var(--status-good)",
          warning: "var(--status-warning)",
          serious: "var(--status-serious)",
          critical: "var(--status-critical)",
        },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(11,11,11,0.04), 0 8px 24px -8px rgba(11,11,11,0.08)",
        "soft-lg": "0 4px 12px rgba(11,11,11,0.06), 0 24px 48px -16px rgba(11,11,11,0.14)",
        "glow-brand": "0 0 0 1px rgba(42,120,214,0.15), 0 8px 32px -8px rgba(42,120,214,0.35)",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #2a78d6 0%, #4a3aa7 100%)",
        "gradient-radial-brand":
          "radial-gradient(ellipse at top, rgba(42,120,214,0.15), transparent 60%)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s ease-in-out infinite",
        "fade-in": "fade-in 0.4s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
