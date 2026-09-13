"use client";

import { useEffect } from "react";

/* Keep conversation scrollers pinned to their latest entry. When content grows
   while the reader is at (or near) the bottom, follow it; when the reader has
   scrolled up to read history, leave them alone. Applies to every scroller
   matching `selector`, including ones mounted later.

   The routine page (`.rt-page16`) is excluded on purpose: it reuses the
   conversation scroller class but is a document you read from the top, not a
   thread you follow. Sticking it opened the routine part-scrolled. */
export function useStickToLatest(selector = ".t9-scroll, .chat-scroll, .auto-chat-scroll10:not(.rt-page16)") {
  useEffect(() => {
    const NEAR = 48;
    const tracked = new Map<Element, { atBottom: boolean; ro: ResizeObserver }>();
    const attach = (el: Element) => {
      if (tracked.has(el)) return;
      const s = el as HTMLElement;
      const rec = { atBottom: true, ro: new ResizeObserver(() => {
        if (rec.atBottom) s.scrollTop = s.scrollHeight;
      }) };
      s.addEventListener("scroll", () => {
        rec.atBottom = s.scrollHeight - s.clientHeight - s.scrollTop <= NEAR;
      }, { passive: true });
      for (const kid of Array.from(s.children)) rec.ro.observe(kid);
      tracked.set(el, rec);
    };
    const scan = () => document.querySelectorAll(selector).forEach(attach);
    scan();
    const mo = new MutationObserver(() => {
      scan();
      for (const [el, rec] of tracked) {
        if (!el.isConnected) { rec.ro.disconnect(); tracked.delete(el); continue; }
        for (const kid of Array.from(el.children)) rec.ro.observe(kid);
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      for (const rec of tracked.values()) rec.ro.disconnect();
    };
  }, [selector]);
}
