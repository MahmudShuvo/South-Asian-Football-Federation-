import type { Metadata, Viewport } from "next";
import { inter, jetbrainsMono } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "SAFF AI Football Hub",
    template: "%s · SAFF AI Football Hub",
  },
  description:
    "AI-powered analytics for South Asian football — Bangladesh, India, Pakistan, Nepal, Bhutan, Maldives and Sri Lanka.",
  applicationName: "SAFF AI Football Hub",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  /* Deliberately NOT setting maximumScale or userScalable: false. Blocking pinch
     zoom fails WCAG 1.4.4 and punishes exactly the mid-range-Android audience we
     are building for. */
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0e14" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    /* `dark` is applied server-side so the first paint is already dark and there
       is no white flash. A user-controlled toggle with persistence arrives on
       Day 5 with the theme provider. */
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={cn(inter.variable, jetbrainsMono.variable)}>{children}</body>
    </html>
  );
}
