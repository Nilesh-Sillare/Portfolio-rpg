"use client";

import { useEffect, useRef } from "react";

type P = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; hue: number };

// A short trail of embers that follows the mouse. Skipped on touch screens and for reduced motion.
export default function CursorEmbers() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parts: P[] = [];
    let raf = 0;
    let running = false;
    let lastX = -1;
    let lastY = -1;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(host.clientWidth * dpr);
      canvas.height = Math.round(host.clientHeight * dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "lighter";
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life += 1;
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.012;
        p.vx *= 0.99;
        const k = 1 - p.life / p.max;
        if (k <= 0) {
          parts.splice(i, 1);
          continue;
        }
        const r = p.size * k * dpr;
        const g = ctx.createRadialGradient(p.x * dpr, p.y * dpr, 0, p.x * dpr, p.y * dpr, r * 4);
        g.addColorStop(0, `hsla(${p.hue},100%,70%,${0.9 * k})`);
        g.addColorStop(1, `hsla(${p.hue},100%,50%,0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x * dpr, p.y * dpr, r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      if (parts.length) {
        raf = requestAnimationFrame(loop);
      } else {
        running = false;
      }
    };

    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
      const dist = lastX < 0 ? 0 : Math.hypot(x - lastX, y - lastY);
      lastX = x;
      lastY = y;
      const n = Math.min(3, 1 + Math.floor(dist / 18));
      for (let i = 0; i < n && parts.length < 90; i++) {
        parts.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 0.7,
          vy: -0.2 - Math.random() * 0.7,
          life: 0,
          max: 38 + Math.random() * 30,
          size: 1.2 + Math.random() * 1.8,
          hue: Math.random() < 0.75 ? 350 + Math.random() * 12 : 268,
        });
      }
      if (!running && !document.hidden) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 z-30 h-full w-full" />;
}
