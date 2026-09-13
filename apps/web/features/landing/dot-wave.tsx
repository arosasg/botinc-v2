"use client";

import { useEffect, useRef } from "react";

/* Live dot field. A fixed-pitch grid of small dots that displace away from the
   pointer and spring back, plus a click ripple that expands outward in a ring.
   Ported from the design's <dot-wave> custom element; same numbers, same feel. */

type Props = {
  gap?: number;
  dot?: number;
  color?: string;
  force?: number;
  radius?: number;
  speed?: number;
  band?: number;
  life?: number;
  opacity?: number;
  className?: string;
};

type Pt = { x: number; y: number; dx: number; dy: number; vx: number; vy: number; g: number };
type Ripple = { x: number; y: number; t: number };

function rgb(raw: string): [number, number, number] {
  const s = raw.trim();
  if (s[0] === "#") {
    let h = s.slice(1);
    if (h.length === 3) h = h[0]! + h[0] + h[1] + h[1] + h[2] + h[2];
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const p = s.split(/[\s,]+/).map(Number).filter((v) => Number.isFinite(v));
  return p.length >= 3 ? [p[0]!, p[1]!, p[2]!] : [255, 255, 255];
}

export function DotWave({
  gap = 20,
  dot = 1.1,
  color = "255,255,255",
  force = 26,
  radius = 118,
  speed = 560,
  band = 96,
  life = 1.9,
  opacity = 0.5,
  className,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const host = canvas.parentElement!;
    const ctx = canvas.getContext("2d")!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const col = rgb(color);
    let pts: Pt[] = [];
    let ripples: Ripple[] = [];
    const pointer = { x: -9999, y: -9999, on: false };
    let w = 0;
    let h = 0;
    let sized = false;
    let visible = true;
    let raf = 0;
    let last = performance.now();

    const local = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const pad = 80;
      return { x, y, inside: x > -pad && y > -pad && x < r.width + pad && y < r.height + pad };
    };
    const onMove = (e: PointerEvent) => {
      const p = local(e);
      pointer.x = p.x;
      pointer.y = p.y;
      pointer.on = p.inside;
    };
    const onLeave = () => {
      pointer.on = false;
    };
    const onDown = (e: PointerEvent) => {
      const p = local(e);
      if (!p.inside) return;
      ripples.push({ x: p.x, y: p.y, t: 0 });
      if (ripples.length > 5) ripples.shift();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerleave", onLeave, { passive: true });

    const io = new IntersectionObserver((es) => (visible = es.some((x) => x.isIntersecting)), { rootMargin: "140px" });
    io.observe(host);
    const ro = new ResizeObserver(() => (sized = false));
    ro.observe(host);

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = host.clientWidth;
      h = host.clientHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const next: Pt[] = [];
      const ox = ((w % gap) + gap) / 2;
      const oy = ((h % gap) + gap) / 2;
      for (let y = oy; y <= h; y += gap) for (let x = ox; x <= w; x += gap) next.push({ x, y, dx: 0, dy: 0, vx: 0, vy: 0, g: 0 });
      pts = next;
      sized = true;
    };

    const step = (dt: number) => {
      if (!sized || canvas.width === 0 || pts.length === 0) layout();
      for (const r of ripples) r.t += dt;
      ripples = ripples.filter((r) => r.t < life);
      ctx.clearRect(0, 0, w, h);
      const px = pointer.x;
      const py = pointer.y;
      const on = pointer.on && !reduced;
      for (const p of pts) {
        let tx = 0;
        let ty = 0;
        let glow = 0;
        if (on) {
          const dx = p.x - px;
          const dy = p.y - py;
          const d = Math.hypot(dx, dy);
          if (d < radius && d > 0.001) {
            const f = (1 - d / radius) ** 2;
            tx += (dx / d) * f * force;
            ty += (dy / d) * f * force;
            glow = Math.max(glow, f * 0.8);
          }
        }
        for (const r of ripples) {
          const dx = p.x - r.x;
          const dy = p.y - r.y;
          const d = Math.hypot(dx, dy) || 0.001;
          const off = Math.abs(d - r.t * speed);
          if (off < band) {
            const ring = Math.cos((off / band) * Math.PI * 0.5) ** 2;
            const decay = (1 - r.t / life) ** 1.6;
            const amp = ring * decay * (force * 1.5);
            tx += (dx / d) * amp;
            ty += (dy / d) * amp;
            glow = Math.max(glow, ring * decay);
          }
        }
        if (reduced) {
          p.dx = 0;
          p.dy = 0;
        } else {
          p.vx += (tx - p.dx) * 0.16;
          p.vy += (ty - p.dy) * 0.16;
          p.vx *= 0.84;
          p.vy *= 0.84;
          p.dx += p.vx;
          p.dy += p.vy;
        }
        p.g += (glow - p.g) * 0.2;
        const rad = dot * (1 + p.g * 1.1);
        const a = Math.min(1, opacity * (1 + p.g * 1.6));
        ctx.beginPath();
        ctx.fillStyle = `rgba(${col[0]}, ${col[1]}, ${col[2]}, ${a})`;
        ctx.arc(p.x + p.dx, p.y + p.dy, rad, 0, 6.2832);
        ctx.fill();
      }
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!visible) return;
      step(dt);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [gap, dot, color, force, radius, speed, band, life, opacity]);

  return (
    <div className={className} style={{ position: "absolute", inset: 0, pointerEvents: "none", isolation: "isolate" }}>
      <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
