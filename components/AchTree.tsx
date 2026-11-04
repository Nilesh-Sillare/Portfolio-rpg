"use client";
import { useEffect, useId, useRef, useState, type CSSProperties, type HTMLAttributes, type PointerEvent as ReactPointerEvent } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronDown, ChevronRight, Lock } from "lucide-react";
import { branches, type BranchId } from "@/data/achievements";
import type { Resolved, Summary } from "@/lib/achievementsState";
import { clusters, HUB, NODE, TRUNK } from "@/lib/achievementsLayout";
import AchGlyph from "@/components/AchGlyph";
import { At, u, W } from "@/components/AchStage";
import { useAchSel } from "@/components/AchSelection";

const GOLD = "#f5b942";
const colorOf = (b?: BranchId) => branches.find((x) => x.id === b)?.color ?? GOLD;
const STATUS_TEXT = { unlocked: "Unlocked", progress: "In progress", available: "Available", locked: "Locked" };
const RING_MASK = "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1.5px))";

// icon sizes in mockup pixels: tune here
const HUB_ICON = 46;
const NODE_ICON = 27;
const DETAIL_ICON = 50;

// ---- popup placement (mockup px) ----
const P_W = 412, PH = 547;   // panel size
const SPLIT = 805;           // icons left of this open the panel on their right, icons right of it open it on their left
const GAP = 38;              // space between the icon and the panel
const Y_MIN = 52, Y_MAX = 103; // the panel always stays inside the art strip

type Side = "left" | "right";
type Place = { x: number; y: number; cx: number; cy: number; d: number; side: Side };

/** where the clicked icon is, and where its popup goes */
function placeFor(id: string): Place | null {
  for (const b of branches) {
    const c = clusters[b.id];
    let cx: number, cy: number, d: number;
    if (b.epic === id) { cx = c.hub.x; cy = c.hub.y; d = HUB; }
    else {
      const i = b.nodes.indexOf(id);
      if (i < 0) continue;
      cx = c.nodes[i].x; cy = c.nodes[i].y; d = NODE;
    }
    const side: Side = cx < SPLIT ? "right" : "left";
    const raw = side === "right" ? cx + d / 2 + GAP : cx - d / 2 - GAP - P_W;
    const x = Math.min(Math.max(raw, 14), W - 14 - P_W);
    const y = Math.min(Math.max(cy - 270, Y_MIN), Y_MAX);
    return { x, y, cx, cy, d, side };
  }
  return null;
}

// ---- panel ornaments ----
// Your images go in /public/achievements/ornaments/ as corner.png, crystal.png, compass.png (and optionally edge.png).
// Best: neutral white/silver on pure black (or transparent). The browser turns brightness into a shape and fills it with the
// path colour, so one image fits every palette. A missing corner/crystal/compass shows nothing; a missing edge.png shows a drawn strip.
const ORN = "/achievements/ornaments";
const BLACK_CUT = 0.11;   // brightness below this becomes fully transparent. Raise if you still see a faint box.
const CORNER_PX = 64;     // size of one corner piece
const EDGE_PX = 22;       // thickness of the side strip
const CRYSTAL_BOX: CSSProperties = { left: "50%", top: u(-34), width: u(48), height: u(56), transform: "translateX(-50%)" };
const COMPASS_BOX: CSSProperties = { left: "50%", bottom: u(-17), width: u(160), height: u(35), transform: "translateX(-50%)" };

type Mask = { base: string; hi: string } | null; // null = no such file
const maskDone = new Map<string, Mask>();
const maskPending = new Map<string, Promise<Mask>>();

/** brightness -> transparency. `base` is the shape (filled with the path colour), `hi` the brightest parts (filled white). */
function loadMask(url: string): Promise<Mask> {
  const hit = maskPending.get(url);
  if (hit) return hit;
  const p = new Promise<Mask>((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const s = Math.min(1, 640 / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.max(1, Math.round(img.naturalWidth * s));
        const h = Math.max(1, Math.round(img.naturalHeight * s));
        const base = document.createElement("canvas");
        base.width = w; base.height = h;
        const hi = document.createElement("canvas");
        hi.width = w; hi.height = h;
        const bc = base.getContext("2d", { willReadFrequently: true });
        const hc = hi.getContext("2d");
        if (!bc || !hc) return resolve(null);
        bc.drawImage(img, 0, 0, w, h);
        const src = bc.getImageData(0, 0, w, h);
        const px = src.data;
        const out = hc.createImageData(w, h);
        let clear = 0; // does the file have real transparency?
        for (let i = 3; i < px.length; i += 388) if (px[i] < 200) clear++;
        const useAlpha = clear > 20;
        for (let i = 0; i < px.length; i += 4) {
          const l = Math.max(px[i], px[i + 1], px[i + 2]) / 255;
          const a0 = useAlpha ? px[i + 3] / 255 : Math.min(1, Math.max(0, (l - BLACK_CUT) / (1 - BLACK_CUT)));
          const t = Math.min(1, Math.max(0, (l - 0.72) / 0.26));
          px[i] = px[i + 1] = px[i + 2] = 255;
          px[i + 3] = Math.round(Math.pow(a0, 0.85) * 255);
          out.data[i] = out.data[i + 1] = out.data[i + 2] = 255;
          out.data[i + 3] = Math.round(t * t * (3 - 2 * t) * a0 * 0.85 * 255);
        }
        bc.putImageData(src, 0, 0);
        hc.putImageData(out, 0, 0);
        resolve({ base: base.toDataURL("image/png"), hi: hi.toDataURL("image/png") });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
  maskPending.set(url, p);
  p.then((m) => maskDone.set(url, m));
  return p;
}

/** undefined while loading, null if the file does not exist */
function useMask(file: string): Mask | undefined {
  const url = `${ORN}/${file}`;
  const [m, setM] = useState<Mask | undefined>(() => maskDone.get(url));
  useEffect(() => {
    let on = true;
    loadMask(url).then((v) => { if (on) setM(v); });
    return () => { on = false; };
  }, [url]);
  return m;
}

const maskLayer = (url: string, bg: string, extra?: CSSProperties): CSSProperties => ({
  position: "absolute", inset: 0, background: bg,
  WebkitMaskImage: `url("${url}")`, maskImage: `url("${url}")`,
  WebkitMaskSize: "contain", maskSize: "contain",
  WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat",
  WebkitMaskPosition: "center", maskPosition: "center",
  ...extra,
});

const useUid = () => useId().replace(/:/g, "");

// your own node icons: /public/achievements/icons/{id}.jpg (or .png / .webp). Falls back to the lucide glyph.
const EXTS = ["jpg", "png", "webp"];
export function AchIcon({ id, icon, size, color }: { id: string; icon: string; size: string; color: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLImageElement>(null);
  const next = () => setN((k) => (k === n ? k + 1 : k));
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) next();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);
  if (n >= EXTS.length) return <AchGlyph name={icon} style={{ width: size, height: size, color }} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img key={n} ref={ref} src={`/achievements/icons/${id}.${EXTS[n]}`} alt="" onError={next}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", mixBlendMode: "screen" }} />
  );
}

type Hand = HTMLAttributes<HTMLButtonElement>;

/** One round node. Used for the six hubs (hub=true) and the 30 small nodes. */
function Orb({ r, color, cx, cy, d, iconPx, hub, arc, on, picked, delay, i, hand, serif }: {
  r: Resolved; color: string; cx: number; cy: number; d: number; iconPx: number; hub?: boolean; arc?: number;
  on: boolean; picked: boolean; delay: number; i: number; hand: Hand; serif: string;
}) {
  const st = hub ? "unlocked" : r.status;
  const locked = st === "locked";
  const border = st === "unlocked" ? color : st === "progress" ? "#f4f1ff" : st === "available" ? color : `${color}66`;
  const bg =
    st === "unlocked" ? `radial-gradient(circle at 50% 30%, ${color}66, #0a0710 78%)`
    : st === "progress" ? "radial-gradient(circle at 50% 30%, rgba(255,255,255,.18), #0a0710 78%)"
    : st === "available" ? `radial-gradient(circle at 50% 30%, ${color}22, #0a0710 78%)`
    : `radial-gradient(circle at 50% 28%, ${color}24, #07060b 82%)`;
  const cls = st === "unlocked" ? "ach-breathe" : st === "available" ? "ach-ready" : st === "progress" ? "ach-white" : "";
  const iconColor = st === "unlocked" ? color : st === "progress" ? "#fff" : `${color}bb`;

  return (
    <At x={cx - d / 2} y={cy - d / 2} w={d} h={d} className="ach-grow" style={{ animationDelay: `${delay}s` }}>
      <button
        type="button" aria-label={`${r.fantasyName}, ${STATUS_TEXT[r.status]}`} {...hand} className={cls}
        style={{
          "--c": color, pointerEvents: "auto", position: "relative", width: "100%", height: "100%", borderRadius: "50%",
          cursor: "pointer", background: bg, border: `${hub ? 2 : 1.5}px solid ${border}`, display: "grid", placeItems: "center",
          transition: "transform .2s, filter .2s, box-shadow .25s", transform: on ? "scale(1.2)" : undefined,
          filter: on ? "brightness(1.25)" : undefined,
          boxShadow: locked ? (on ? `0 0 14px ${color}77, inset 0 0 8px ${color}33` : `inset 0 0 8px ${color}22`) : undefined,
        } as CSSProperties}
      >
        {st === "unlocked" && (
          <>
            <span className="ach-spin-fast" style={{ position: "absolute", inset: u(-4), borderRadius: "50%", background: `conic-gradient(from 0deg, transparent 0 55%, ${color} 100%)`, WebkitMask: RING_MASK, mask: RING_MASK }} />
            <span className="ach-ripple" style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `1.5px solid ${color}`, animationDelay: `${i * 0.45}s` }} />
            {!hub && <span className="ach-twinkle" style={{ position: "absolute", top: u(-6), right: u(-3), fontSize: u(9), color, animationDelay: `${i * 0.7}s` }}>✦</span>}
          </>
        )}
        {st === "progress" && <span className="ach-spin-fast" style={{ position: "absolute", inset: u(-4), borderRadius: "50%", border: "1.5px dashed rgba(255,255,255,.85)" }} />}
        {hub && <span className="ach-spin" style={{ position: "absolute", inset: u(-7), borderRadius: "50%", border: `1.5px dashed ${color}99` }} />}
        {locked && <span aria-hidden style={{ position: "absolute", inset: u(-4), borderRadius: "50%", border: `1px dashed ${color}${on ? "88" : "44"}`, transition: "border-color .25s" }} />}
        {(hub || st === "progress") && (
          <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
            <circle cx="50" cy="50" r="46" fill="none" stroke={hub ? color : "#fff"} strokeWidth={hub ? 5 : 6} strokeLinecap="round" strokeDasharray="289"
              strokeDashoffset={289 * (1 - (arc ?? r.progress))} transform="rotate(-90 50 50)" opacity=".95" />
          </svg>
        )}
        {picked && <span style={{ position: "absolute", inset: u(hub ? -11 : -8), borderRadius: "50%", border: "1.5px solid #fff", boxShadow: `0 0 10px ${color}` }} />}

        {locked && !hub ? (
          <>
            <span style={{ display: "grid", opacity: on ? 0.6 : 0.3, filter: "grayscale(.5)", transition: "opacity .25s" }}>
              <AchIcon id={r.id} icon={r.icon} size={u(iconPx)} color={`${color}99`} />
            </span>
            <span style={{ position: "absolute", right: u(-4), bottom: u(-4), width: u(15), height: u(15), borderRadius: "50%", background: "#0b0813", border: `1px solid ${color}99`, display: "grid", placeItems: "center", boxShadow: `0 0 6px ${color}55` }}>
              <Lock style={{ width: u(9), height: u(9), color: `${color}e6` }} strokeWidth={2.4} />
            </span>
          </>
        ) : (
          <AchIcon id={r.id} icon={r.icon} size={u(iconPx)} color={iconColor} />
        )}

        {st === "unlocked" && !hub && (
          <span style={{ position: "absolute", right: u(-3), bottom: u(-3), width: u(12), height: u(12), borderRadius: "50%", background: "#22c55e", display: "grid", placeItems: "center" }}>
            <Check style={{ width: u(8), height: u(8), color: "#04120a" }} strokeWidth={3.5} />
          </span>
        )}

        {on && (
          <span style={{ position: "absolute", top: "118%", left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap", textAlign: "center", fontFamily: serif, textShadow: "0 1px 6px #000, 0 0 10px #000", pointerEvents: "none", zIndex: 5 }}>
            <span style={{ display: "block", fontSize: u(13), color: "#fff" }}>{r.fantasyName}</span>
            <span style={{ display: "block", fontSize: u(11), color }}>{STATUS_TEXT[r.status]}</span>
          </span>
        )}
      </button>
    </At>
  );
}

const FLOW_CSS = `
@keyframes achtFlow{from{stroke-dashoffset:0}to{stroke-dashoffset:-100}}
.acht-flow{stroke-dasharray:7 93;animation:achtFlow 2.8s linear infinite}
/* branching glow: one pulse runs hub -> end, link after link (each link starts 0.6s after the one before) */
@keyframes achtChain{0%{stroke-dashoffset:34}20%{stroke-dashoffset:-100}100%{stroke-dashoffset:-100}}
.acht-chain{stroke-dasharray:34 166;animation:achtChain 3s linear infinite both}
@keyframes achtIn{from{opacity:0}}
.acht-lit{animation:achtIn .5s ease both}
@media (prefers-reduced-motion:reduce){.acht-flow,.acht-chain,.acht-lit{animation:none}.acht-flow,.acht-chain{opacity:0}}
`;

export default function AchTree({ resolved, summary, head, serif }: {
  resolved: Record<string, Resolved>; summary: Summary; head: string; serif: string;
}) {
  const { sel, hov, setSel, setHov, focus, hotBranch } = useAchSel();
  const focusBranch = branches.find((b) => b.id === focus);

  // keep the popup mounted for a moment after closing so it can shrink back into its icon
  const [view, setView] = useState<{ id: string; closing: boolean } | null>(null);
  useEffect(() => {
    if (sel) { setView({ id: sel, closing: false }); return; }
    setView((v) => (v ? { ...v, closing: true } : v));
    const t = setTimeout(() => setView(null), 300);
    return () => clearTimeout(t);
  }, [sel]);
  const place = view ? placeFor(view.id) : null;
  const shown = view && place ? resolved[view.id] : null;

  // Esc closes the popup
  useEffect(() => {
    if (!sel) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setSel(null); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [sel, setSel]);

  const hand = (id: string): Hand => ({
    onMouseEnter: () => setHov(id), onMouseLeave: () => setHov(null),
    onFocus: () => setHov(id), onBlur: () => setHov(null),
    onClick: () => setSel((s) => (s === id ? null : id)),
  });

  return (
    <>
      <style>{FLOW_CSS}</style>

      {/* clicking empty art closes the popup (nodes sit above this, so they stay clickable) */}
      <At x={0} y={0} w={W} h={665} style={{ pointerEvents: sel ? "auto" : "none" }}>
        <div onClick={() => setSel(null)} aria-hidden style={{ position: "absolute", inset: 0 }} />
      </At>

      {/* ---------- links between nodes ---------- */}
      <svg viewBox="0 0 1610 977" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        {branches.map((b, bi) => {
          const c = clusters[b.id];
          const pts = [c.hub, ...c.nodes];
          const dim = focus && focus !== b.id ? 0.25 : 1;
          const hot = hotBranch === b.id;
          const active = hot || focus === b.id; // hovered or selected path: its links light up
          return (
            <g key={b.id} style={{ opacity: dim, transition: "opacity .3s" }}>
              {pts.slice(1).map((p, i) => {
                const a = pts[i];
                const st = resolved[b.nodes[i]].status;
                const lit = st === "unlocked";
                const d = c.vertical
                  ? `M${a.x} ${a.y} C${a.x} ${(a.y + p.y) / 2} ${p.x} ${(a.y + p.y) / 2} ${p.x} ${p.y}`
                  : `M${a.x} ${a.y} C${(a.x + p.x) / 2} ${a.y} ${(a.x + p.x) / 2} ${p.y} ${p.x} ${p.y}`;
                const delay = `${(i * 0.6).toFixed(2)}s`;
                return (
                  <g key={i}>
                    <path d={d} fill="none" stroke={lit ? b.color : st === "progress" ? "#ffffff" : hot ? b.color : "#8d8d9c"}
                      strokeWidth={(lit ? 2.2 : 1.4) + (hot ? 0.8 : 0)} strokeDasharray={lit ? undefined : "3 6"} strokeLinecap="round"
                      opacity={lit ? 0.95 : hot ? 0.85 : 0.55}
                      style={lit || hot ? { filter: `drop-shadow(0 0 ${hot ? 6 : 4}px ${b.color})`, transition: "opacity .3s, stroke-width .3s" } : undefined} />
                    {lit && !active && (
                      <path d={d} pathLength={100} className="acht-flow" fill="none" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" opacity=".9"
                        style={{ animationDelay: `${(bi * 0.5 + i * 0.4).toFixed(2)}s` }} />
                    )}
                    {active && (
                      <g className="acht-lit">
                        {/* steady soft glow along the link, in the path colour */}
                        <path d={d} fill="none" stroke={b.color} strokeWidth={10} strokeOpacity={0.1} strokeLinecap="round" />
                        <path d={d} fill="none" stroke={b.color} strokeWidth={5} strokeOpacity={0.22} strokeLinecap="round" />
                        {/* the travelling light: a wide coloured glow with a white core */}
                        <path d={d} pathLength={100} className="acht-chain" fill="none" stroke={b.color} strokeWidth={8} strokeOpacity={0.55} strokeLinecap="round" style={{ animationDelay: delay }} />
                        <path d={d} pathLength={100} className="acht-chain" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" style={{ animationDelay: delay }} />
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* ---------- six path clusters ---------- */}
      {branches.map((b, bi) => {
        const c = clusters[b.id];
        const stat = summary.stats[b.id];
        const epic = resolved[b.epic];
        const dim = focus && focus !== b.id ? 0.35 : 1;
        const xs = [c.hub.x, ...c.nodes.map((n) => n.x)], ys = [c.hub.y, ...c.nodes.map((n) => n.y)];
        const x0 = Math.min(...xs) - 60, x1 = Math.max(...xs) + 60, y0 = Math.min(...ys) - 60, y1 = Math.max(...ys) + 60;
        const glow = hotBranch === b.id || focus === b.id;
        return (
          <div key={b.id} style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: dim, transition: "opacity .3s" }}>
            <At x={x0} y={y0} w={x1 - x0} h={y1 - y0} style={{ background: "radial-gradient(closest-side, rgba(4,3,8,.55), rgba(4,3,8,0))" }} />
            <At x={x0 - 50} y={y0 - 50} w={x1 - x0 + 100} h={y1 - y0 + 100}
              style={{ background: `radial-gradient(closest-side, ${b.color}38, transparent)`, mixBlendMode: "screen", opacity: glow ? 1 : 0, transition: "opacity .45s" }} />

            <Orb r={epic} color={b.color} cx={c.hub.x} cy={c.hub.y} d={HUB} iconPx={HUB_ICON} hub arc={stat.unlocked / stat.total}
              on={hov === b.epic} picked={sel === b.epic} delay={0.2 + bi * 0.1} i={bi} hand={hand(b.epic)} serif={serif} />

            {c.nodes.map((n, i) => {
              const r = resolved[b.nodes[i]];
              return (
                <Orb key={r.id} r={r} color={b.color} cx={n.x} cy={n.y} d={NODE} iconPx={NODE_ICON}
                  on={hov === r.id} picked={sel === r.id} delay={0.45 + bi * 0.1 + i * 0.08} i={i} hand={hand(r.id)} serif={serif} />
              );
            })}
          </div>
        );
      })}

      {/* ---------- caption on the trunk: "My Path", or the selected path (click to clear) ---------- */}
      <At x={TRUNK.x - 140} y={572} w={280} style={{ pointerEvents: "none" }}>
        <button type="button" onClick={() => setSel(null)} disabled={!focus} aria-label="Show all paths"
          style={{
            pointerEvents: "auto", display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: u(5),
            background: "radial-gradient(closest-side, rgba(4,3,8,.62), transparent)", border: "none", padding: `${u(8)} 0`,
            cursor: focus ? "pointer" : "default", color: focusBranch?.color ?? "#f1e6ee", fontFamily: head,
            textShadow: "0 1px 10px #000, 0 0 14px #000", transition: "color .3s",
          }}>
          <span style={{ display: "flex", alignItems: "center", gap: u(10), width: "100%", fontSize: u(14), letterSpacing: "0.34em", textTransform: "uppercase" }}>
            <span aria-hidden style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, currentColor)", opacity: 0.7 }} />
            <span style={{ whiteSpace: "nowrap" }}>
              {focusBranch ? focusBranch.pathName : "My Path"}
              {focus && <span style={{ marginLeft: u(8), opacity: 0.8 }}>✕</span>}
            </span>
            <span aria-hidden style={{ flex: 1, height: 1, background: "linear-gradient(270deg, transparent, currentColor)", opacity: 0.7 }} />
          </span>
          <span aria-hidden style={{ width: u(7), height: u(7), background: "currentColor", transform: "rotate(45deg)", boxShadow: "0 0 8px currentColor" }} />
        </button>
      </At>

      {/* ---------- legend + hint ---------- */}
      <At x={40} y={632} style={{ display: "flex", gap: u(20), fontFamily: serif, fontSize: u(12.5), color: "#d8ccd6", alignItems: "center", textShadow: "0 1px 6px #000" }}>
        {[["#22c55e", "Unlocked", false], ["#ffffff", "In Progress", false], ["#8a8a9a", "Locked", true]].map(([col, t, ring]) => (
          <span key={t as string} style={{ display: "flex", alignItems: "center", gap: u(6) }}>
            <span style={{ width: u(11), height: u(11), borderRadius: "50%", background: ring ? "transparent" : (col as string), border: ring ? `1.5px solid ${col}` : undefined, boxShadow: `0 0 6px ${col}` }} />
            {t}
          </span>
        ))}
      </At>
      <At x={1582} y={632} style={{ transform: "translateX(-100%)", fontFamily: serif, fontStyle: "italic", fontSize: u(13), color: "#cbbfc4", textShadow: "0 1px 6px #000", opacity: view ? 0 : 0.85, transition: "opacity .3s", pointerEvents: "none", whiteSpace: "nowrap" }}>
        Try clicking on any icon.
      </At>

      {shown && place && view && (
        <Detail key={view.id} r={shown} place={place} closing={view.closing} onClose={() => setSel(null)} head={head} serif={serif} />
      )}
    </>
  );
}

/* ====================== detail popup ====================== */
const DETAIL_CSS = `
@keyframes achdIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes achdGlow{0%,100%{opacity:.45}50%{opacity:1}}
@keyframes achdPulse{0%,100%{opacity:1}50%{opacity:.8}}
@keyframes achdBreathe{0%,100%{opacity:.55}50%{opacity:1}}
@keyframes achdCue{0%,100%{transform:translate(-50%,0);opacity:.45}50%{transform:translate(-50%,5px);opacity:1}}
/* one smooth ease-out grow from the icon, and a soft shrink back into it */
@keyframes achdPop{0%{opacity:0;transform:scale(.25)}55%{opacity:1}100%{opacity:1;transform:scale(1)}}
@keyframes achdPopOut{from{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(.4)}}
@keyframes achdLine{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}
@keyframes achdLineRun{from{stroke-dashoffset:26}to{stroke-dashoffset:-100}}
.achd-pop{animation:achdPop .55s cubic-bezier(.16,1,.3,1) both;will-change:transform,opacity}
.achd-popout{animation:achdPopOut .28s cubic-bezier(.5,0,.75,0) both;will-change:transform,opacity}
.achd-line{stroke-dasharray:100;animation:achdLine .55s .1s cubic-bezier(.3,0,.2,1) both}
.achd-linepulse{stroke-dasharray:26 174;animation:achdLineRun 1.9s linear .7s infinite both}
.achd-in{animation:achdIn .4s cubic-bezier(.2,.8,.2,1) both}
.achd-glow{animation:achdGlow 3.2s ease-in-out infinite}
.achd-orn{animation:achdPulse 3.4s ease-in-out infinite}
.achd-breathe{animation:achdBreathe 4.2s ease-in-out infinite}
.achd-cue{animation:achdCue 1.8s ease-in-out infinite}
.achd-row{transition:background .2s}
.achd-row:hover{background:rgba(255,255,255,.04)!important}
.achd-chev{transition:transform .25s}
.achd-link{transition:filter .25s}
.achd-link:hover{filter:brightness(1.3)}
.achd-noscroll{scrollbar-width:none;-ms-overflow-style:none;outline:none}
.achd-noscroll::-webkit-scrollbar{display:none}
/* close seal: the cross turns a quarter turn on hover and lands on itself */
.achd-close{transition:transform .3s cubic-bezier(.2,.8,.2,1),filter .25s}
.achd-close .achd-x{transition:transform .55s cubic-bezier(.2,.8,.2,1)}
.achd-close:hover,.achd-close:focus-visible{transform:scale(1.1);filter:brightness(1.25)}
.achd-close:hover .achd-x,.achd-close:focus-visible .achd-x{transform:rotate(90deg)}
.achd-close:active{transform:scale(.92)}
.achd-close:focus-visible{outline:2px solid #fff;outline-offset:3px}
.achd-thumb{transition:width .2s,filter .2s}
@media (prefers-reduced-motion:reduce){.achd-in,.achd-glow,.achd-orn,.achd-breathe,.achd-cue,.achd-pop,.achd-popout,.achd-line,.achd-linepulse{animation:none}}
`;
const SCROLL_MASK = "linear-gradient(to bottom, transparent 0, #000 18px, #000 calc(100% - 38px), transparent 100%)";

type Evidence = NonNullable<Resolved["ranks"][number]["evidence"]>;
type Row = { done: boolean; active: boolean; title: string; sub: string; ev?: Evidence };

function Dia({ s, color, style }: { s: number; color: string; style: CSSProperties }) {
  return (
    <span aria-hidden style={{
      position: "absolute", width: u(s), height: u(s), border: `1px solid ${color}`, background: "#05030a",
      transform: "translate(-50%,-50%) rotate(45deg)", boxShadow: `0 0 6px ${color}88`, pointerEvents: "none", ...style,
    }} />
  );
}

/** drawn side strip, used until you supply edge.png: a glowing line with diamond studs and curls. `gap` leaves room for the crystal / compass. */
function EdgeArt({ color, w, gap }: { color: string; w: number; gap?: boolean }) {
  const k = useUid();
  return (
    <svg aria-hidden viewBox={`0 0 ${w} ${EDGE_PX}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", filter: `drop-shadow(0 0 3px ${color})` }}>
      <defs>
        <pattern id={`p${k}`} patternUnits="userSpaceOnUse" width="52" height="22">
          <path d="M0 11H52" stroke={color} strokeWidth="1.2" />
          <path d="M0 8.5H52M0 13.5H52" stroke={color} strokeOpacity=".25" strokeWidth=".5" />
          <path d="M26 5.5L31 11 26 16.5 21 11Z" fill="#0a0612" stroke={color} />
          <circle cx="26" cy="11" r="1.6" fill="#fff" />
          <path d="M7 11C9 6 15 6 15 10M7 11C9 16 15 16 15 12M45 11C43 6 37 6 37 10M45 11C43 16 37 16 37 12" stroke={color} strokeWidth=".9" fill="none" />
        </pattern>
        <linearGradient id={`f${k}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".08" stopColor="#fff" /><stop offset=".92" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={`m${k}`}>
          <rect width={w} height="22" fill={`url(#f${k})`} />
          {gap && <rect x={w / 2 - 38} width="76" height="22" fill="#000" />}
        </mask>
      </defs>
      <g mask={`url(#m${k})`}><rect width={w} height="22" fill={`url(#p${k})`} /></g>
    </svg>
  );
}

/** a panel piece from your image: brightness -> shape, filled with the path colour, brightest parts white. Nothing is drawn if the file is missing. */
function Orn({ file, color, dim, box }: { file: string; color: string; dim: number; box: CSSProperties }) {
  const m = useMask(file);
  if (!m) return null;
  return (
    <div aria-hidden className="achd-orn" style={{ position: "absolute", pointerEvents: "none", filter: `brightness(${dim}) drop-shadow(0 0 6px ${color}) drop-shadow(0 0 14px ${color}88)`, ...box }}>
      <div style={maskLayer(m.base, color)} />
      <div style={maskLayer(m.hi, "#fff")} />
    </div>
  );
}

/** the four side strips (edge.png if it exists, otherwise the drawn strip) */
function Edges({ color, dim }: { color: string; dim: number }) {
  const m = useMask("edge.png");
  const hw = P_W - 2 * CORNER_PX, vw = PH - 2 * CORNER_PX, c = u(CORNER_PX);
  const spots: { w: number; gap: boolean; style: CSSProperties }[] = [
    { w: hw, gap: true, style: { left: c, top: 0, transform: "translateY(-50%)" } },
    { w: hw, gap: true, style: { left: c, top: "100%", transform: "translateY(-50%)" } },
    { w: vw, gap: false, style: { left: 0, top: c, transformOrigin: "0 0", transform: "rotate(90deg) translateY(-50%)" } },
    { w: vw, gap: false, style: { left: "100%", top: c, transformOrigin: "0 0", transform: "rotate(90deg) translateY(-50%)" } },
  ];
  const rep: CSSProperties = { WebkitMaskRepeat: "repeat-x", maskRepeat: "repeat-x", WebkitMaskSize: "auto 100%", maskSize: "auto 100%" };
  if (m === undefined) return null;
  return (
    <>
      {spots.map((s, i) => (
        <div key={i} aria-hidden className="achd-orn" style={{
          position: "absolute", width: u(s.w), height: u(EDGE_PX), pointerEvents: "none",
          filter: m ? `brightness(${dim}) drop-shadow(0 0 5px ${color})` : `brightness(${dim})`, ...s.style,
        }}>
          {m ? (
            <>
              <div style={maskLayer(m.base, color, rep)} />
              <div style={maskLayer(m.hi, "#fff", rep)} />
            </>
          ) : (
            <EdgeArt color={color} w={s.w} gap={s.gap} />
          )}
        </div>
      ))}
    </>
  );
}

function SectionHead({ label, color, head }: { label: string; color: string; head: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: u(9), fontFamily: head, fontSize: u(12), letterSpacing: "0.24em", color: "#ece3ea" }}>
      <span aria-hidden style={{ color, fontSize: u(11) }}>✦</span>{label}
    </div>
  );
}

const hair: CSSProperties = { height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,.16) 20%, rgba(255,255,255,.16) 80%, transparent)", flexShrink: 0 };

function cornerBox(rot: number): CSSProperties {
  const o = u(-8);
  const pos = [{ top: o, left: o }, { top: o, right: o }, { bottom: o, right: o }, { bottom: o, left: o }][rot];
  return { ...pos, width: u(CORNER_PX), height: u(CORNER_PX), transform: `rotate(${rot * 90}deg)` };
}

/** the close button: a round seal on the panel's top-right corner. Its cross is two crystal blades and turns a quarter turn on hover. */
function CloseSeal({ color, onClose }: { color: string; onClose: () => void }) {
  const k = useUid();
  return (
    <button type="button" onClick={onClose} aria-label="Close details" title="Close" className="achd-close"
      style={{
        position: "absolute", top: u(-17), right: u(-17), width: u(36), height: u(36), borderRadius: "50%", padding: 0, cursor: "pointer", zIndex: 4,
        border: `1.5px solid ${color}`, background: `radial-gradient(circle at 50% 35%, ${color}44, #0a0710 72%)`,
        boxShadow: `0 0 14px ${color}88, inset 0 0 8px ${color}44`, display: "grid", placeItems: "center",
      }}>
      <span className="ach-spin" aria-hidden style={{ position: "absolute", inset: u(-5), borderRadius: "50%", border: `1px dashed ${color}99`, pointerEvents: "none" }} />
      <svg aria-hidden viewBox="-20 -20 40 40" style={{ position: "relative", width: "78%", height: "78%", overflow: "visible", filter: `drop-shadow(0 0 3px ${color})` }}>
        <defs>
          <linearGradient id={`x${k}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" /><stop offset=".55" stopColor={color} /><stop offset="1" stopColor={color} stopOpacity=".5" />
          </linearGradient>
        </defs>
        <g className="achd-x" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          <g transform="rotate(45)"><path d="M0 -13L2.2 0 0 13 -2.2 0Z" fill={`url(#x${k})`} stroke={color} strokeWidth=".5" /></g>
          <g transform="rotate(-45)"><path d="M0 -13L2.2 0 0 13 -2.2 0Z" fill={`url(#x${k})`} stroke={color} strokeWidth=".5" /></g>
          <circle r="2.6" fill="#0a0612" stroke="#fff" strokeWidth=".8" />
        </g>
      </svg>
    </button>
  );
}

/** the panel's scrollbar: a thin glowing rail with a pointed crystal thumb. Drag the thumb, or click the rail to jump. Hidden when nothing scrolls. */
function ScrollRail({ color, scRef, top, view, all }: {
  color: string; scRef: { current: HTMLDivElement | null }; top: number; view: number; all: number;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState(false);
  const span = all - view;
  if (span <= 4) return null;
  const thumbPct = Math.max(14, (view / all) * 100);
  const topPct = (Math.min(top, span) / span) * (100 - thumbPct);

  const onThumbDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = scRef.current, tr = rail.current;
    if (!el || !tr) return;
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY, startTop = el.scrollTop;
    const trackPx = tr.clientHeight, thumbPx = (trackPx * thumbPct) / 100;
    const move = (ev: PointerEvent) => { el.scrollTop = startTop + ((ev.clientY - startY) * span) / Math.max(1, trackPx - thumbPx); };
    const up = () => { setDrag(false); window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    setDrag(true);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  const onTrackDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = scRef.current, tr = rail.current;
    if (!el || !tr) return;
    const r = tr.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    el.scrollTo({ top: f * span, behavior: "smooth" });
  };

  return (
    <div ref={rail} aria-hidden onPointerDown={onTrackDown}
      style={{ position: "absolute", right: u(8), top: u(40), bottom: u(46), width: u(14), cursor: "pointer", zIndex: 2, touchAction: "none" }}>
      {/* the rail itself fades out at both ends */}
      <span style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, transform: "translateX(-50%)", background: `linear-gradient(180deg, transparent, ${color}77 14%, ${color}77 86%, transparent)` }} />
      <span style={{ position: "absolute", left: "50%", top: 0, width: u(5), height: u(5), border: `1px solid ${color}`, background: "#05030a", transform: "translate(-50%,-50%) rotate(45deg)", boxShadow: `0 0 5px ${color}` }} />
      <span style={{ position: "absolute", left: "50%", bottom: 0, width: u(5), height: u(5), border: `1px solid ${color}`, background: "#05030a", transform: "translate(-50%,50%) rotate(45deg)", boxShadow: `0 0 5px ${color}` }} />
      {/* the thumb: a pointed crystal with a bright core */}
      <div onPointerDown={onThumbDown} className="achd-thumb"
        style={{
          position: "absolute", left: "50%", top: `${topPct}%`, height: `${thumbPct}%`, width: drag ? u(9) : u(7), transform: "translateX(-50%)",
          cursor: drag ? "grabbing" : "grab", filter: `drop-shadow(0 0 ${drag ? 9 : 5}px ${color}) drop-shadow(0 0 ${drag ? 16 : 8}px ${color}88)`,
        }}>
        <div style={{
          position: "absolute", inset: 0, clipPath: "polygon(50% 0, 100% 9%, 100% 91%, 50% 100%, 0 91%, 0 9%)",
          background: `linear-gradient(180deg, #fff 0%, ${color} 24%, ${color} 74%, ${color}88 100%)`,
        }}>
          <span style={{ position: "absolute", left: "50%", top: "12%", bottom: "12%", width: 1, transform: "translateX(-50%)", background: "rgba(255,255,255,.75)" }} />
        </div>
      </div>
    </div>
  );
}

function Detail({ r, place, closing, onClose, head, serif }: {
  r: Resolved; place: Place; closing: boolean; onClose: () => void; head: string; serif: string;
}) {
  const [open, setOpen] = useState<number | null>(null);

  // scroll metrics for the themed scrollbar
  const scRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [sc, setSc] = useState({ top: 0, view: 1, all: 1 });
  useEffect(() => {
    const el = scRef.current;
    if (!el) return;
    const read = () => setSc({ top: el.scrollTop, view: el.clientHeight, all: el.scrollHeight });
    read();
    el.addEventListener("scroll", read, { passive: true });
    const ro = new ResizeObserver(read);
    ro.observe(el);
    if (innerRef.current) ro.observe(innerRef.current);
    return () => { el.removeEventListener("scroll", read); ro.disconnect(); };
  }, []);
  const canScroll = sc.all - sc.view > 4;

  const c = colorOf(r.branch);
  const normal = r.tier === "normal";
  const firstOpen = r.ranks.findIndex((k) => !k.done);
  const rows: Row[] = normal
    ? r.ranks.map((k, i) => {
        const active = i === firstOpen && r.status === "progress";
        return { done: k.done, active, title: k.requirement, sub: k.done ? "Completed" : active ? "In progress" : "Not yet earned", ev: k.done ? k.evidence : undefined };
      })
    : r.requires.map((q) => ({ done: q.done, active: false, title: q.name, sub: q.done ? "Completed" : "Not yet earned" }));
  const needs = normal ? r.requires.filter((q) => !q.done) : [];
  const doneN = normal ? r.ranks.filter((k) => k.done).length : r.requires.filter((q) => q.done).length;
  const totalN = normal ? r.ranks.length : r.requires.length;
  const hasProof = normal && r.ranks.some((k) => k.done && k.evidence);

  const live = r.status === "unlocked";
  const lit = r.status !== "locked";
  const pct = totalN ? doneN / totalN : 0;
  const edge = c;
  const dimOrn = lit ? 1 : 0.75;
  const sc2 = r.status === "unlocked" ? "#3be07f" : r.status === "progress" ? "#ffffff" : r.status === "available" ? c : "#8a8a9a";
  const nameSize = r.name.length > 18 ? 24 : r.name.length > 13 ? 27 : 30;
  const noun = normal ? "REQUIREMENTS" : "ACHIEVEMENTS";

  // the popup grows out of the icon: scale origin = the icon's position inside the panel
  const ox = ((place.cx - place.x) / P_W) * 100;
  const oy = ((place.cy - place.y) / PH) * 100;

  // connector from the icon's edge to the panel's edge (coordinates relative to the panel)
  const right = place.side === "right";
  const sx = (right ? place.cx + place.d / 2 + 3 : place.cx - place.d / 2 - 3) - place.x;
  const sy = place.cy - place.y;
  const ex = right ? 0 : P_W;
  const ey = Math.min(Math.max(sy, 40), PH - 40);
  const mx = (sx + ex) / 2;
  const line = `M${sx} ${sy} C${mx} ${sy} ${mx} ${ey} ${ex} ${ey}`;

  return (
    <At x={place.x} y={place.y} w={P_W} h={PH} style={{ pointerEvents: closing ? "none" : "auto" }}>
      <style>{DETAIL_CSS}</style>

      <div className={closing ? "achd-popout" : "achd-pop"}
        style={{ position: "absolute", inset: 0, transformOrigin: `${ox}% ${oy}%` }}>

        {/* connector to the icon, with a light running along it */}
        <svg aria-hidden viewBox={`0 0 ${P_W} ${PH}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", pointerEvents: "none" }}>
          <path d={line} fill="none" stroke={c} strokeWidth="5" strokeOpacity=".14" strokeLinecap="round" />
          <path d={line} pathLength={100} className="achd-line" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${c})` }} />
          <path d={line} pathLength={100} className="achd-linepulse" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          <circle cx={sx} cy={sy} r="2.6" fill={c} />
          <rect x={ex - 3.5} y={ey - 3.5} width="7" height="7" transform={`rotate(45 ${ex} ${ey})`} fill={c} style={{ filter: `drop-shadow(0 0 4px ${c})` }} />
        </svg>

        {/* frame: a still border with a softly breathing glow */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, border: `1px solid ${c}${live ? "99" : "66"}`,
          background: "linear-gradient(180deg, rgba(18,10,30,.94), rgba(6,4,10,.96) 50%)",
          boxShadow: `inset 0 0 44px ${c}1c`,
        }} />
        <div aria-hidden className="achd-breathe" style={{ position: "absolute", inset: 0, pointerEvents: "none", boxShadow: `0 0 42px ${c}${live ? "77" : "44"}, inset 0 0 30px ${c}33` }} />

        {/* the whole panel scrolls; its scrollbar is the themed rail below */}
        <div ref={scRef} tabIndex={0} aria-label="Achievement details" className="achd-noscroll" style={{
          position: "absolute", inset: 0, overflowY: "auto", overscrollBehavior: "contain", fontFamily: serif,
          padding: `${u(32)} ${u(30)} ${u(46)}`, WebkitMaskImage: SCROLL_MASK, maskImage: SCROLL_MASK,
        }}>
          <div ref={innerRef} style={{ display: "flex", flexDirection: "column" }}>

            {/* title */}
            <div className="achd-in" style={{ display: "flex", alignItems: "center", gap: u(12) }}>
              <span aria-hidden style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${edge}aa)` }} />
              <span style={{ fontFamily: head, fontSize: u(12), letterSpacing: "0.3em", color: "#ece3ea", whiteSpace: "nowrap" }}>ACHIEVEMENT DETAILS</span>
              <span aria-hidden style={{ flex: 1, height: 1, background: `linear-gradient(270deg, transparent, ${edge}aa)` }} />
            </div>

            {/* emblem + name + status */}
            <div className="achd-in" style={{ display: "flex", gap: u(18), alignItems: "center", marginTop: u(20), animationDelay: ".04s" }}>
              <div style={{ position: "relative", width: u(76), height: u(76), flexShrink: 0, marginLeft: u(4) }}>
                {live && <div className="achd-glow" style={{ position: "absolute", inset: u(-10), borderRadius: "50%", background: `radial-gradient(circle, ${c}44, transparent 68%)` }} />}
                <span className="ach-spin" aria-hidden style={{ position: "absolute", inset: u(-6), borderRadius: "50%", border: `1px dashed ${c}${lit ? "88" : "55"}` }} />
                <div style={{
                  position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${edge}`, overflow: "hidden", display: "grid", placeItems: "center",
                  background: `radial-gradient(circle at 50% 35%, ${c}44, #0a0710 75%)`, boxShadow: `0 0 ${lit ? 18 : 10}px ${c}${lit ? "99" : "66"}, inset 0 0 14px ${c}44`,
                  filter: lit ? undefined : "saturate(.6) brightness(.85)",
                }}>
                  <AchIcon id={r.id} icon={r.icon} size={u(DETAIL_ICON)} color={c} />
                </div>
                <Dia s={7} color={edge} style={{ left: "50%", top: 0 }} />
                <Dia s={7} color={edge} style={{ left: 0, top: "50%" }} />
                <Dia s={7} color={edge} style={{ left: "50%", top: "100%" }} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: u(nameSize), fontWeight: 500, color: "#f6eeea", lineHeight: 1.05, textShadow: live ? `0 0 14px ${c}55` : undefined }}>{r.name}</div>
                <div style={{ fontSize: u(17), color: c, fontStyle: "italic", marginTop: u(4), filter: "brightness(1.35)" }}>{r.fantasyName}</div>
                <span style={{ display: "inline-flex", alignItems: "center", gap: u(7), marginTop: u(9), height: u(24), padding: `0 ${u(14)}`, borderRadius: 999, border: `1px solid ${sc2}77`, background: `${sc2}16`, fontFamily: head, fontSize: u(10.5), letterSpacing: "0.16em", color: sc2, whiteSpace: "nowrap", textTransform: "uppercase" }}>
                  <span style={{ width: u(6), height: u(6), borderRadius: "50%", background: sc2, boxShadow: `0 0 6px ${sc2}` }} />
                  {STATUS_TEXT[r.status]}
                </span>
              </div>
            </div>

            {/* progress */}
            <div className="achd-in" style={{ marginTop: u(20), animationDelay: ".08s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: head, fontSize: u(11.5), letterSpacing: "0.2em", color: "#d6cbd8" }}>
                <span>PROGRESS</span><span>{doneN}/{totalN}</span>
              </div>
              <div style={{ height: u(6), marginTop: u(7), background: "rgba(255,255,255,.12)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${pct * 100}%`, height: "100%", background: `linear-gradient(90deg, ${c}88, ${c})`, boxShadow: `0 0 8px ${c}`, borderRadius: 3 }} />
              </div>
              <div style={{ marginTop: u(7), fontFamily: head, fontSize: u(9.5), letterSpacing: "0.12em", color: c, filter: "brightness(1.3)" }}>
                {doneN} OF {totalN} {noun} COMPLETED
              </div>
            </div>

            <div style={{ ...hair, marginTop: u(16) }} />

            {/* the challenge */}
            <div className="achd-in" style={{ marginTop: u(14), animationDelay: ".12s" }}>
              <SectionHead label="THE CHALLENGE" color={edge} head={head} />
              <div style={{ marginTop: u(8), fontSize: u(15.5), lineHeight: 1.38, color: "#cfc4d2" }}>{r.description}</div>
            </div>

            <div style={{ ...hair, marginTop: u(14) }} />

            {/* requirements */}
            <div className="achd-in" style={{ marginTop: u(14), animationDelay: ".16s" }}>
              <SectionHead label={noun} color={edge} head={head} />
              <div style={{ marginTop: u(4) }}>
                {rows.map((row, i) => (
                  <div key={i} style={{ borderBottom: "1px solid rgba(255,255,255,.08)" }}>
                    <button type="button" className="achd-row" onClick={() => row.ev && setOpen(open === i ? null : i)}
                      style={{ display: "flex", width: "100%", gap: u(13), alignItems: "center", padding: `${u(10)} ${u(4)}`, background: "none", border: "none", textAlign: "left", color: "inherit", fontFamily: serif, cursor: row.ev ? "pointer" : "default" }}>
                      <span style={{
                        width: u(24), height: u(24), flexShrink: 0, borderRadius: "50%", display: "grid", placeItems: "center",
                        border: row.done ? "2px solid #22c55e" : `1.5px solid ${row.active ? "#fff" : "#77779a"}`,
                        background: row.done ? "rgba(34,197,94,.14)" : "transparent",
                        boxShadow: row.done ? "0 0 10px rgba(34,197,94,.6)" : row.active ? "0 0 9px rgba(255,255,255,.35)" : undefined,
                      }}>
                        {row.done && <Check style={{ width: u(14), height: u(14), color: "#3be07f" }} strokeWidth={3} />}
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: "block", fontSize: u(15), color: "#fff", lineHeight: 1.2 }}>{row.title}</span>
                        <span style={{ display: "block", fontSize: u(12.5), color: "#a99fb4", marginTop: u(2) }}>{row.sub}</span>
                      </span>
                      {row.ev && <ChevronRight className="achd-chev" style={{ width: u(16), height: u(16), flexShrink: 0, color: "#b9aec4", transform: open === i ? "rotate(90deg)" : undefined }} />}
                    </button>
                    {open === i && row.ev && (
                      <div className="achd-in" style={{ padding: `0 ${u(4)} ${u(11)} ${u(41)}`, fontSize: u(13.5), color: "#b9aec4", lineHeight: 1.35 }}>
                        <div style={{ color: "#fff" }}>{row.ev.title}</div>
                        <div>{[row.ev.issuer, row.ev.date].filter(Boolean).join(" · ")}</div>
                        {row.ev.url && (
                          <a href={row.ev.url} target="_blank" rel="noopener noreferrer" style={{ color: c, filter: "brightness(1.3)", textDecoration: "underline" }}>View credential →</a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {needs.length > 0 && (
                  <div style={{ marginTop: u(9), fontSize: u(13.5), color: "#f0b555" }}>◆ Needs first: {needs.map((q) => q.name).join(", ")}</div>
                )}
                {hasProof && (
                  <Link href="/credentials" className="achd-link" style={{ display: "inline-flex", alignItems: "center", gap: u(6), marginTop: u(10), fontSize: u(14), color: c, filter: "brightness(1.3)" }}>
                    Inspect credentials <ArrowRight style={{ width: u(14), height: u(14) }} strokeWidth={1.8} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* themed scrollbar, and a cue that more is below (gone once you scroll) */}
        <ScrollRail color={c} scRef={scRef} top={sc.top} view={sc.view} all={sc.all} />
        {canScroll && sc.top < 8 && (
          <button type="button" className="achd-cue" aria-label="Scroll down" onClick={() => scRef.current?.scrollBy({ top: sc.view * 0.8, behavior: "smooth" })}
            style={{ position: "absolute", left: "50%", bottom: u(28), background: "none", border: "none", padding: 0, cursor: "pointer", color: c, filter: `drop-shadow(0 0 5px ${c})`, zIndex: 2 }}>
            <ChevronDown style={{ width: u(22), height: u(22) }} strokeWidth={2} />
          </button>
        )}

        {/* ornaments sit on top of the scrolling content and grow with the panel */}
        <Edges color={edge} dim={dimOrn} />
        {[0, 1, 2, 3].map((i) => (
          <Orn key={i} file="corner.png" color={edge} dim={dimOrn} box={cornerBox(i)} />
        ))}
        <Orn file="crystal.png" color={edge} dim={dimOrn} box={CRYSTAL_BOX} />
        <Orn file="compass.png" color={edge} dim={dimOrn} box={COMPASS_BOX} />

        {/* close seal */}
        <CloseSeal color={c} onClose={onClose} />
      </div>
    </At>
  );
}