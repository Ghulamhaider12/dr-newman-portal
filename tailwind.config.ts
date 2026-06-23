import type { Config } from "tailwindcss";

/**
 * Theme mapped directly to the Dr. Newman design tokens.
 * See design-system/tokens/* for the source of truth.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2C5F8A",
          light: "#EBF3FA",
          hover: "#244E73",
        },
        accent: {
          DEFAULT: "#4A90A4",
          hover: "#3D7A8B",
        },
        success: {
          DEFAULT: "#3A7D44",
          hover: "#316839",
        },
        warning: "#B87333",
        surface: "#F7F9FC",
        ink: {
          DEFAULT: "#1A1A2E",
          muted: "#5A6778",
        },
        border: {
          DEFAULT: "#DDE3ED",
          strong: "#C3CCDB",
        },
        // Category colour-coding
        cat: {
          medical: "#2C5F8A",
          art: "#4A90A4",
          other: "#5A6778",
          "medical-bg": "#EBF3FA",
          "art-bg": "#E5F0F2",
          "other-bg": "#EEF1F5",
        },
      },
      fontFamily: {
        serif: ["var(--font-lora)", "Lora", "Georgia", "serif"],
        sans: ["var(--font-inter)", "Inter", "-apple-system", "sans-serif"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.4" }],
        sm: ["0.875rem", { lineHeight: "1.5" }],
        base: ["1rem", { lineHeight: "1.6" }],
        lg: ["1.125rem", { lineHeight: "1.6" }],
        xl: ["1.375rem", { lineHeight: "1.35" }],
        "2xl": ["1.75rem", { lineHeight: "1.25" }],
        "3xl": ["2.25rem", { lineHeight: "1.2" }],
        "4xl": ["3rem", { lineHeight: "1.1" }],
      },
      borderRadius: {
        card: "6px",
        control: "4px",
        badge: "4px",
      },
      maxWidth: {
        container: "1140px",
        narrow: "760px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(26,26,46,0.04), 0 1px 3px rgba(26,26,46,0.06)",
        "card-hover": "0 2px 6px rgba(26,26,46,0.08), 0 4px 12px rgba(26,26,46,0.06)",
        overlay: "0 4px 16px rgba(26,26,46,0.12)",
      },
      transitionTimingFunction: {
        standard: "cubic-bezier(0.2, 0, 0.2, 1)",
      },
      ringColor: {
        focus: "rgba(44,95,138,0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
