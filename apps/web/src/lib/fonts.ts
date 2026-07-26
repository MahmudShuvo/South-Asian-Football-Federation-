import { Inter, JetBrains_Mono } from "next/font/google";

/**
 * Self-hosted at build time by next/font: no request to Google at runtime, no
 * layout shift, and one fewer third-party origin to allow in the CSP.
 */
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/* Numerals only in practice, so the subset stays minimal. */
export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});
