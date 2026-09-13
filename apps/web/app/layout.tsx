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

/* The shell is rendered per request so the API address below is the one this
   deployment was started with, not the one baked when the image was built.
   Without this, /w prerenders at build time and every environment ships the
   same hardcoded address. */
export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

/* The API address is read at run time, not baked at build time, so one image
   serves test.botinc.ai and botinc.ai without being rebuilt. Unset means the
   design's fixtures drive the screens, which is what keeps the pixel proof
   reproducible. */
function runtimeConfig() {
  const apiURL = (process.env["BOTINC_API_URL"] ?? "").trim();
  return `window.__BOTINC__=${JSON.stringify({ apiURL })}`;
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: runtimeConfig() }} />
        {children}
      </body>
    </html>
  );
}
