// components/AchievementsTree.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as RPointerEvent } from "react";
import { branches, type BranchId } from "@/data/achievements";
import type { Resolved, Summary } from "@/lib/achievementsState";
import { IMAGE, curves as baseCurves, bez, nodeT, type Curve, type Pos } from "@/lib/achievementsLayout";
import AchGlyph from "./AchGlyph";
import AchievementPanel from "./AchievementPanel";
import AchParticles from "./AchParticles";

const GOLD = "#f5b942";
const ANCHOR_Y = 0.1; // how much of the cropped height is removed from the top (the rest comes off the bottom)
const H = (100 * IMAGE.h) / IMAGE.w;
const NODE = "clamp(30px, calc(var(--u) * 2.9), 52px)";
const HUB = "clamp(46px, calc(var(--u) * 4.6), 78px)";
const serif = { fontFamily: "Cinzel, serif" } as const;
const rank = (s: Resolved["status"]) => (s === "unlocked" ? 2 : s === "progress" ? 1 : 0);
const round1 = (n: number) => Math.round(n * 10) / 10;
const clampPct = (n: number) => Math.min(100, Math.max(0, n));

function segPath(c: Curve, t0: number, t1: number) {
  const n = 10;
  let d = "";
  for (let i = 0; i <= n; i++) {
    const [x, y] = bez(c, t0 + ((t1 - t0) * i) / n);
    d += `${i ? "L" : "M"}${x.toFixed(2)} ${((y * H) / 100).toFixed(2)} `;
  }
  return d;
}

function labelStyle(side: Curve["label"]): CSSProperties {
  switch (side) {
    case "right": return { left: "100%", top: "50%", transform: "translateY(-50%)", marginLeft: 8, textAlign: "left" };
    case "left": return { right: "100%", top: "50%", transform: "translateY(-50%)", marginRight: 8, textAlign: "right" };
    case "above": return { bottom: "100%", left: "50%", transform: "translateX(-50%)", marginBottom: 4 };
    default: return { top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: 4 };
  }
}

export default function AchievementsTree({
  items, summary, defaultId,
}: { items: Record<string, Resolved>; summary: Summary; defaultId: string }) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [curves, setCurves] = useState<Record<BranchId, Curve>>(baseCurves);
  const [calibrate, setCalibrate] = useState(false);
  const [dim, setDim] = useState<{ w: number; h: number } | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: BranchId; k: number } | null>(null);

  useEffect(() => {
    setCalibrate(new URLSearchParams(window.location.search).has("calibrate"));
  }, []);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setDim({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // "cover" the box with the tree image, keeping the top and cropping mostly the bottom
  const geo = useMemo(() => {
    if (!dim || dim.w < 10 || dim.h < 10) return null;
    const s = Math.max(dim.w / IMAGE.w, dim.h / IMAGE.h);
    const sw = IMAGE.w * s, sh = IMAGE.h * s;
    return { sw, sh, left: (dim.w - sw) / 2, top: -(sh - dim.h) * ANCHOR_Y, u: sw / 100 };
  }, [dim]);

  const placed = useMemo(() => {
    const m: Record<string, Pos> = {};
    for (const b of branches) {
      m[b.epic] = bez(curves[b.id], 0);
      b.nodes.forEach((id, i) => { m[id] = bez(curves[b.id], nodeT(i)); });
    }
    return m;
  }, [curves]);

  const focusId = hoverId ?? pinnedId;
  const focusBranch: BranchId | null = (focusId && items[focusId]?.branch) || null;
  const active = items[focusId ?? defaultId] ?? items[defaultId];

  const levels = Object.fromEntries(
    branches.map((b) => [b.id, summary.legendary ? 1 : summary.stats[b.id].level]),
  ) as Record<BranchId, number>;

  const L = items["successful"];
  const lDone = L.status === "unlocked";

  const onMove = (e: RPointerEvent) => {
    const d = drag.current;
    if (!calibrate || !d || !stage.current) return;
    const r = stage.current.getBoundingClientRect();
    const x = clampPct(((e.clientX - r.left) / r.width) * 100);
    const y = clampPct(((e.clientY - r.top) / r.height) * 100);
    setCurves((prev) => {
      const c = prev[d.id];
      const pts = c.pts.map((p, i) => (i === d.k ? ([round1(x), round1(y)] as Pos) : p)) as Curve["pts"];
      return { ...prev, [d.id]: { ...c, pts } };
    });
  };

  const hover = (id: string | null) => ({
    onMouseEnter: () => setHoverId(id),
    onMouseLeave: () => setHoverId(null),
    onFocus: () => setHoverId(id),
    onBlur: () => setHoverId(null),
  });

  const renderNode = (id: string, hub: boolean, order: number) => {
    const r = items[id];
    const b = branches.find((x) => x.id === r.branch)!;
    const color = b.color;
    const [x, y] = placed[id];
    const st = r.status;
    const unlocked = st === "unlocked";
    const dimmed = focusBranch && focusBranch !== r.branch;
    const stat = summary.stats[b.id];

    return (
      <div key={id} className="absolute" style={{ left: `${x}%`, top: `${y}%`, width: hub ? HUB : NODE, height: hub ? HUB : NODE, transform: "translate(-50%, -50%)", zIndex: hub ? 24 : 22 }}>
        <div className="ach-in ach-node group relative h-full w-full" style={{ animationDelay: `${300 + order * 70}ms` }}>
          {hub && (
            <svg className="ach-spin pointer-events-none absolute -inset-[18%] h-[136%] w-[136%]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="48" fill="none" stroke={color} strokeWidth="1.4" strokeDasharray="3 6" strokeOpacity={unlocked ? 0.8 : st === "progress" ? 0.55 : 0.3} />
            </svg>
          )}
          {!hub && st === "progress" && (
            <svg className="ach-spin pointer-events-none absolute -inset-[16%] h-[132%] w-[132%]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="48" fill="none" stroke={color} strokeWidth="3" strokeDasharray="10 12" strokeOpacity="0.85" />
            </svg>
          )}
          {unlocked && (
            <span className="ach-ripple pointer-events-none absolute inset-0 rounded-full" style={{ border: `1px solid ${color}`, animationDelay: `${(order % 7) * 0.45}s` }} />
          )}
          <button
            type="button"
            aria-label={`${r.fantasyName} - ${st}`}
            className="absolute inset-0 grid place-items-center rounded-full outline-none transition duration-200 hover:scale-[1.18] focus-visible:scale-[1.18]"
            style={{
              border: `2px solid ${color}${unlocked ? "" : st === "progress" ? "cc" : st === "available" ? "77" : "33"}`,
              background: unlocked ? `radial-gradient(circle at 30% 25%, ${color}66, #0a0610 78%)` : "#0a0610ee",
              boxShadow: unlocked ? `0 0 ${hub ? 26 : 16}px ${color}aa, inset 0 0 12px ${color}44` : st === "progress" ? `0 0 12px ${color}55` : "none",
              filter: st === "locked" ? "grayscale(.8)" : "none",
              opacity: dimmed ? 0.4 : st === "locked" ? 0.85 : 1,
            }}
            onClick={() => setPinnedId((p) => (p === id ? null : id))}
            {...hover(id)}
          >
            <AchGlyph name={r.icon} className="h-[54%] w-[54%]" style={{ color: unlocked || st === "progress" ? color : st === "available" ? `${color}aa` : "#6b6475" }} />
            {unlocked && (
              <span className="absolute -bottom-[8%] -right-[8%] grid h-[36%] w-[36%] place-items-center rounded-full bg-emerald-400 text-black">
                <AchGlyph name="check" className="h-[70%] w-[70%]" />
              </span>
            )}
            {st === "locked" && (
              <span className="absolute -bottom-[8%] -right-[8%] grid h-[36%] w-[36%] place-items-center rounded-full bg-black/85 text-white/60">
                <AchGlyph name="lock" className="h-[65%] w-[65%]" />
              </span>
            )}
          </button>

          {hub ? (
            <div className="pointer-events-none absolute whitespace-nowrap uppercase" style={{ ...labelStyle(curves[b.id].label), color, fontSize: "clamp(8px, calc(var(--u) * 0.72), 12px)", letterSpacing: ".14em", textShadow: "0 1px 8px #000, 0 0 12px #000", opacity: dimmed ? 0.4 : 1 }}>
              {b.pathName}
              <br /><span className="text-white/70">{stat.unlocked} / {stat.total}</span>
            </div>
          ) : (
            <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-black/85 px-2 py-0.5 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100" style={{ border: `1px solid ${color}55` }}>
              {r.fantasyName}
            </span>
          )}
        </div>
      </div>
    );
  };

  const out = `export const curves: Record<BranchId, Curve> = {\n${branches
    .map((b) => `  ${b.id}: { pts: ${JSON.stringify(curves[b.id].pts)}, label: "${curves[b.id].label}" },`)
    .join("\n")}\n};`;

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-2">
      {/* title row with the single legendary achievement */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base uppercase tracking-[0.3em] md:text-lg" style={serif}>✦ The Ascension Tree</h2>
          <p className="text-sm text-white/60">Hover or tap an achievement to see what it takes and the proof behind it.</p>
        </div>
        <button
          type="button"
          onClick={() => setPinnedId((p) => (p === "successful" ? null : "successful"))}
          {...hover("successful")}
          className="flex items-center gap-3 rounded-xl border bg-[#0b0610]/85 px-4 py-2 text-left backdrop-blur transition hover:scale-[1.02]"
          style={{ borderColor: lDone ? GOLD : `${GOLD}44`, boxShadow: lDone ? `0 0 28px ${GOLD}66` : "none" }}
        >
          <span
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 ${lDone ? "ach-aura" : ""}`}
            style={{ borderColor: lDone ? GOLD : `${GOLD}55`, background: lDone ? `radial-gradient(circle, ${GOLD}44, #0a0610 70%)` : "#0a0610", "--c": `${GOLD}aa` } as CSSProperties}
          >
            <AchGlyph name="crown" className="h-5 w-5" style={{ color: lDone ? GOLD : `${GOLD}88` }} />
          </span>
          <span>
            <span className="block text-[10px] uppercase tracking-[0.25em] text-white/50">Legendary achievement</span>
            <span className="block text-base leading-tight text-white" style={serif}>Successful · The Crowned Warrior</span>
            <span className="mt-1 flex items-center gap-2">
              <span className="h-1.5 w-40 overflow-hidden rounded-full bg-white/10">
                <span className="ach-grow block h-full rounded-full" style={{ width: `${(summary.epics / 6) * 100}%`, background: GOLD, boxShadow: `0 0 8px ${GOLD}` }} />
              </span>
              <span className="text-xs text-white/70">{summary.epics} / 6</span>
            </span>
          </span>
        </button>
      </div>

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1fr)_330px] lg:grid-rows-[minmax(0,1fr)]">
        {/* ---------- desktop tree ---------- */}
        <div ref={box} className="relative hidden min-h-[380px] overflow-hidden rounded-xl border border-[#ff2a4d]/25 bg-[#06030a] lg:block">
          {geo && (
            <div
              ref={stage}
              className="absolute select-none"
              style={{ left: geo.left, top: geo.top, width: geo.sw, height: geo.sh, "--u": `${geo.u}px` } as CSSProperties}
              onPointerMove={onMove}
              onPointerUp={() => { drag.current = null; }}
            >
              {/* cold base tree */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMAGE.src} alt="" aria-hidden draggable={false} className="absolute inset-0 h-full w-full" style={{ filter: "saturate(.3) brightness(.6)" }} />

              {/* branch glow: bloom + bright core, breathing high and low */}
              {branches.map((b, i) => {
                const lvl = levels[b.id];
                const isF = focusBranch === b.id;
                const faded = focusBranch && !isF;
                const k = (isF ? 1.4 : 1) * (faded ? 0.5 : 1);
                const lo = Math.min(1, (0.12 + 0.5 * lvl) * k);
                const hi = Math.min(1, (0.3 + 0.7 * lvl) * k);
                const dur = `${(5.6 - 2 * lvl + (i % 3) * 0.6).toFixed(1)}s`;
                const mask = (f: string): CSSProperties => ({
                  WebkitMaskImage: `url(/ach-masks/${f}.png)`, maskImage: `url(/ach-masks/${f}.png)`,
                  WebkitMaskSize: "100% 100%", maskSize: "100% 100%", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat",
                });
                return (
                  <div key={b.id} className="pointer-events-none absolute inset-0">
                    <div className="ach-glow absolute inset-0" style={{ background: b.color, mixBlendMode: "screen", ...mask(`${b.id}-glow`), "--lo": lo * 0.55, "--hi": hi * 0.7, "--dur": dur, animationDelay: `${i * 0.8}s` } as CSSProperties} />
                    <div className="ach-glow absolute inset-0" style={{ ...mask(b.id), "--lo": lo, "--hi": hi, "--dur": dur, animationDelay: `${i * 0.8}s` } as CSSProperties}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={IMAGE.src} alt="" aria-hidden draggable={false} className="h-full w-full" style={{ filter: "saturate(1.7) brightness(1.7)" }} />
                    </div>
                  </div>
                );
              })}

              {/* short curved links between nodes, following each branch */}
              <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" style={{ zIndex: 10 }}>
                {branches.map((b) => {
                  const c = curves[b.id];
                  const ids = b.nodes;
                  const dimmed = focusBranch && focusBranch !== b.id;
                  return (
                    <g key={b.id} style={{ opacity: dimmed ? 0.35 : 1, transition: "opacity .3s" }}>
                      {ids.map((id, i) => {
                        const t0 = i === 0 ? 0 : nodeT(i - 1);
                        const t1 = nodeT(i);
                        const lit = rank(items[id].status);
                        const d = segPath(c, t0, t1);
                        return (
                          <g key={id}>
                            <path d={d} fill="none" stroke={b.color} strokeOpacity={0.28} strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
                            {lit > 0 && (
                              <path d={d} fill="none" stroke={b.color} strokeWidth={lit === 2 ? 2.4 : 1.6} strokeOpacity={lit === 2 ? 0.95 : 0.6}
                                strokeDasharray={lit === 2 ? undefined : "4 5"} vectorEffect="non-scaling-stroke" style={{ filter: `drop-shadow(0 0 4px ${b.color})` }} />
                            )}
                          </g>
                        );
                      })}
                    </g>
                  );
                })}
              </svg>

              <AchParticles width={geo.sw} height={geo.sh} curves={curves} levels={levels} focus={focusBranch} />

              {branches.map((b, bi) => (
                <div key={b.id}>
                  {renderNode(b.epic, true, bi * 6)}
                  {b.nodes.map((id, i) => renderNode(id, false, bi * 6 + i + 1))}
                </div>
              ))}

              {calibrate &&
                branches.flatMap((b) =>
                  curves[b.id].pts.map((p, k) => (
                    <div
                      key={`${b.id}-${k}`}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        drag.current = { id: b.id, k };
                        e.currentTarget.setPointerCapture(e.pointerId);
                      }}
                      className="absolute grid h-5 w-5 cursor-grab place-items-center rounded-sm border text-[9px] font-bold text-black"
                      style={{ left: `${p[0]}%`, top: `${p[1]}%`, transform: "translate(-50%, -50%)", background: b.color, borderColor: "#fff", zIndex: 40, touchAction: "none" }}
                    >
                      {["H", "C", "E"][k]}
                    </div>
                  )),
                )}
            </div>
          )}

          {/* blend the image edges into the page */}
          <div className="pointer-events-none absolute inset-0" style={{ zIndex: 18, background: "radial-gradient(ellipse at 50% 42%, transparent 60%, rgba(6,3,10,.92) 100%)" }} />

          {calibrate && (
            <div className="absolute bottom-2 left-2 z-50 w-[440px] rounded-lg border border-yellow-400/40 bg-black/85 p-2 text-[11px] text-yellow-200">
              Drag H (hub), C (curve bend) and E (inner end) for each path, then paste this over <code>curves</code> in lib/achievementsLayout.ts
              <textarea readOnly className="mt-1 h-24 w-full rounded bg-black p-1.5 font-mono text-[10px] text-white" value={out} />
            </div>
          )}
        </div>

        {/* ---------- mobile list ---------- */}
        <div className="space-y-3 lg:hidden">
          {branches.map((b) => (
            <div key={b.id} className="rounded-xl border bg-[#0b0610]/85 p-3" style={{ borderColor: `${b.color}44` }}>
              <p className="mb-2 text-xs uppercase tracking-widest" style={{ color: b.color }}>
                {b.pathName} · {summary.stats[b.id].unlocked}/{summary.stats[b.id].total}
              </p>
              <div className="grid grid-cols-6 gap-2">
                {[b.epic, ...b.nodes].map((id) => {
                  const r = items[id];
                  return (
                    <button key={id} type="button" aria-label={r.fantasyName} onClick={() => setPinnedId(id)}
                      className="grid aspect-square place-items-center rounded-full border-2"
                      style={{ borderColor: `${b.color}${r.status === "unlocked" ? "" : r.status === "progress" ? "cc" : "44"}`, background: r.status === "unlocked" ? `${b.color}33` : "#0a0610", opacity: r.status === "locked" ? 0.6 : 1 }}>
                      <AchGlyph name={r.icon} className="h-1/2 w-1/2" style={{ color: r.status === "locked" ? "#6b6475" : b.color }} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="min-h-0 lg:h-full">
          <AchievementPanel item={active} />
        </div>
      </div>
    </section>
  );
}