import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@botinc/brand/styles/fonts.css";
import "@botinc/brand/styles/workspace.css";
import "@botinc/brand/styles/landing.css";
import "@botinc/brand/styles/overrides.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "BotInc",
  description:
    "Coding agents that never stop. Fixes that never ship unreviewed. Every run uses all your subscriptions, hands off at the limit, and keeps going in the cloud.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
