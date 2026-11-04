"use client";
import { useEffect, useRef } from "react";
import { branches } from "@/data/achievements";
import { clusters, TRUNK } from "@/lib/achievementsLayout";
import type { Resolved } from "@/lib/achievementsState";
import { At } from "@/components/AchStage";
import { useAchSel } from "@/components/AchSelection";

// the tree panel in mockup pixels
const PX = 0, PY = 0, PW = 1610, PH = 665;
const MAX = 260;

type Kind = "ember" | "spark" | "dust" | "burst";
type P = {
  x: number; y: number; vx: number; vy: number; life: number; max: number;
  size: number; color: string; kind: Kind; phase: number; sway: number;
};
type Ring = { x: number; y: number; life: number; max: number; color: string };
type Src = { x: number; y: number; color: string; rate: number };

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

/** where a node or hub sits, and its branch colour */
function locate(id: string) {
  for (const b of branches) {
    const c = clusters[b.id];
    if (b.epic === id) return { x: c.hub.x, y: c.hub.y, color: b.color };
    const i = b.nodes.indexOf(id);
    if (i >= 0) return { x: c.nodes[i].x, y: c.nodes[i].y, color: b.color };
  }
  return null;
}

export default function AchParticles({ resolved }: { resolved: Record<string, Resolved> }) {
  const { sel } = useAchSel();
  const cv = useRef<HTMLCanvasElement>(null);
  const burstQ = useRef<{ x: number; y: number; color: string }[]>([]);

  // queue a burst whenever something gets selected
  useEffect(() => {
    if (!sel) return;
    const at = locate(sel);
    if (at) burstQ.current.push(at);
  }, [sel]);

  useEffect(() => {
    const canvas = cv.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // glowing sources: every hub, plus each unlocked node (more unlocked = more sparks)
    const sources: Src[] = [];
    for (const b of branches) {
      const c = clusters[b.id];
      sources.push({ x: c.hub.x, y: c.hub.y, color: b.color, rate: 1.1 });
      b.nodes.forEach((id, i) => {
        if (resolved[id]?.status === "unlocked") sources.push({ x: c.nodes[i].x, y: c.nodes[i].y, color: b.color, rate: 0.9 });
      });
    }

    const ps: P[] = [];
    const rings: Ring[] = [];
    let scale = 1, w = 0;
    let visible = true, raf = 0, last = performance.now();
    let accAmbient = 0, accDust = 0;
    const accSrc = sources.map(() => Math.random());

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round((w * PH) / PW * dpr);
      scale = canvas.width / PW;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(canvas);

    const add = (p: P) => { if (ps.length < MAX) ps.push(p); };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible || document.hidden) return;

      // ---- spawn ----
      accAmbient += dt * 9;            // embers rising from the trunk
      while (accAmbient >= 1) {
        accAmbient -= 1;
        add({ x: TRUNK.x + rnd(-70, 70) - PX, y: TRUNK.y + rnd(-20, 40) - PY, vx: rnd(-14, 14), vy: rnd(-46, -22),
          life: 0, max: rnd(3, 6), size: rnd(1, 2.4), color: "#ff3b4e", kind: "ember", phase: rnd(0, 6.28), sway: rnd(6, 16) });
      }
      accDust += dt * 5;               // faint dust everywhere
      while (accDust >= 1) {
        accDust -= 1;
        add({x: rnd(30, 1560), y: rnd(150, PH - 40), vx: rnd(-6, 6), vy: rnd(-10, -3),
          life: 0, max: rnd(5, 9), size: rnd(0.8, 1.6), color: "#d8c9d6", kind: "dust", phase: rnd(0, 6.28), sway: rnd(3, 8) });
      }
      sources.forEach((s, i) => {      // sparks from lit nodes and hubs
        accSrc[i] += dt * s.rate;
        while (accSrc[i] >= 1) {
          accSrc[i] -= 1;
          add({ x: s.x - PX + rnd(-8, 8), y: s.y - PY + rnd(-6, 6), vx: rnd(-10, 10), vy: rnd(-34, -14),
            life: 0, max: rnd(1.2, 2.4), size: rnd(1, 2.2), color: s.color, kind: "spark", phase: rnd(0, 6.28), sway: rnd(4, 10) });
        }
      });
      for (const b of burstQ.current.splice(0)) {   // click bursts
        rings.push({ x: b.x - PX, y: b.y - PY, life: 0, max: 0.7, color: b.color });
        for (let k = 0; k < 28; k++) {
          const a = rnd(0, 6.283), sp = rnd(50, 210);
          add({ x: b.x - PX, y: b.y - PY, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
            life: 0, max: rnd(0.6, 1.2), size: rnd(1.2, 2.8), color: b.color, kind: "burst", phase: 0, sway: 0 });
        }
      }

      // ---- update ----
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.life += dt;
        if (p.life >= p.max) { ps.splice(i, 1); continue; }
        if (p.kind === "burst") {
          const drag = Math.pow(0.04, dt);
          p.vx *= drag; p.vy = p.vy * drag + 18 * dt;
        }
        p.x += (p.vx + Math.sin(p.life * 2 + p.phase) * p.sway) * dt;
        p.y += p.vy * dt;
      }
      for (let i = rings.length - 1; i >= 0; i--) {
        rings[i].life += dt;
        if (rings[i].life >= rings[i].max) rings.splice(i, 1);
      }

      // ---- draw ----
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
      ctx.globalCompositeOperation = "lighter";
      for (const p of ps) {
        const t = p.life / p.max;
        const fade = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
        const base = p.kind === "dust" ? 0.35 : p.kind === "burst" ? 0.95 : 0.8;
        const r = p.size * (p.kind === "burst" ? 1 - t * 0.5 : 1);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = fade * base * 0.18;   // soft halo
        ctx.beginPath(); ctx.arc(p.x, p.y, r * 3.2, 0, 6.283); ctx.fill();
        ctx.globalAlpha = fade * base;          // bright core
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.283); ctx.fill();
      }
      for (const g of rings) {
        const t = g.life / g.max;
        ctx.globalAlpha = (1 - t) * 0.85;
        ctx.strokeStyle = g.color;
        ctx.lineWidth = 2.2 * (1 - t) + 0.6;
        ctx.beginPath(); ctx.arc(g.x, g.y, 14 + t * 46, 0, 6.283); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };
    raf = requestAnimationFrame(tick);

    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [resolved]);

  return (
    <At x={PX} y={PY} w={PW} h={PH} style={{ pointerEvents: "none", overflow: "hidden" }}>
      <canvas ref={cv} aria-hidden style={{ display: "block", width: "100%", height: "100%", pointerEvents: "none" }} />
    </At>
  );
}