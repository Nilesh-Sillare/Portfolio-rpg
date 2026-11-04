"use client";
import { useId, type CSSProperties, type HTMLAttributes } from "react";
import { Check, Lock } from "lucide-react";
import { branches, type BranchId } from "@/data/achievements";
import type { Resolved, Summary } from "@/lib/achievementsState";
import { At, u } from "@/components/AchStage";
import { AchIcon } from "@/components/AchTree";
import { useAchSel } from "@/components/AchSelection";

// order of the emblems, as in the mockup
const ORDER: BranchId[] = ["programming", "backend", "frontend", "projects", "tools", "career"];
const GOLD = "#f5b942";
const LX = 1334.5; // centre of the legendary panel

const css = `
.ach-emblem{transition:transform .3s ease}
.ach-emblem:hover,.ach-emblem.hot{transform:translateY(-4px) scale(1.06)}
@keyframes achBar{from{width:0}}
.ach-bar{animation:achBar 1.1s cubic-bezier(.2,.8,.2,1) .6s both}
@keyframes achAura{0%,100%{opacity:.45;transform:scale(1)}50%{opacity:.95;transform:scale(1.14)}}
.ach-aura{animation:achAura 5s ease-in-out infinite}
@keyframes achSpinSlow{to{transform:rotate(360deg)}}
.ach-spin-slow{animation:achSpinSlow 70s linear infinite}
@keyframes achShine{from{background-position:200% 0}to{background-position:-200% 0}}
.ach-shine{background:linear-gradient(100deg,#9a6a1c 0%,#ffe9a8 28%,#f5b942 50%,#9a6a1c 80%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:achShine 6s linear infinite}
@media (prefers-reduced-motion:reduce){.ach-bar,.ach-aura,.ach-spin-slow,.ach-shine{animation:none}.ach-emblem{transition:none}}
`;

type Hand = HTMLAttributes<HTMLButtonElement>;

function Bar({ x, y, w, pct, color }: { x: number; y: number; w: number; pct: number; color: string }) {
  return (
    <At x={x} y={y} w={w} h={5} style={{ background: "rgba(255,255,255,.1)", borderRadius: 3, overflow: "hidden" }}>
      <div className="ach-bar" style={{ width: `${pct * 100}%`, height: "100%", background: color, boxShadow: `0 0 8px ${color}`, borderRadius: 3 }} />
    </At>
  );
}

function Emblem({ r, color, cx, cy, d, active, done, picked, hot, hand }: {
  r: Resolved; color: string; cx: number; cy: number; d: number; active: boolean; done: boolean;
  picked: boolean; hot: boolean; hand: Hand;
}) {
  return (
    <At x={cx - d / 2} y={cy - d / 2} w={d} h={d}>
      <button type="button" {...hand} className={`ach-emblem${hot ? " hot" : ""}`} title={`${r.name}: ${r.description}`}
        aria-label={`${r.fantasyName}, ${r.status}`} aria-pressed={picked}
        style={{
          pointerEvents: "auto", cursor: "pointer", background: "none", border: "none", padding: 0, display: "block",
          position: "relative", width: "100%", height: "100%", filter: active ? undefined : "saturate(.5) brightness(.75)",
        } as CSSProperties}>
        {/* glow */}
        <div className={done ? "ach-breathe" : undefined}
          style={{ "--c": color, position: "absolute", inset: "14%", borderRadius: "50%", boxShadow: `0 0 ${done ? 30 : 16}px ${color}aa, inset 0 0 14px ${color}55` } as CSSProperties} />
        <svg viewBox="0 0 120 120" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
          <defs>
            <radialGradient id={`eg-${r.id}`} cx="50%" cy="38%" r="70%">
              <stop offset="0" stopColor={color} stopOpacity=".5" />
              <stop offset="1" stopColor="#0a0710" stopOpacity=".95" />
            </radialGradient>
          </defs>
          <circle cx="60" cy="60" r="40" fill={`url(#eg-${r.id})`} />
          <circle cx="60" cy="60" r="52" fill="none" stroke={color} strokeWidth="2.2" />
          <circle cx="60" cy="60" r="40" fill="none" stroke={color} strokeWidth="1.2" opacity=".7" />
          <circle className="ach-spin" cx="60" cy="60" r="46" fill="none" stroke={color} strokeWidth="1.2" strokeDasharray="2 5" opacity=".8"
            style={{ transformBox: "fill-box", transformOrigin: "center" }} />
          {[0, 90, 180, 270].map((a) => (
            <path key={a} d="M60 -6 L65 8 L60 14 L55 8 Z" fill={color} transform={`rotate(${a} 60 60)`} />
          ))}
          {[45, 135, 225, 315].map((a) => (
            <circle key={a} cx="60" cy="2" r="2.6" fill={color} transform={`rotate(${a} 60 60)`} />
          ))}
        </svg>
        {picked && <span style={{ position: "absolute", inset: "-9%", borderRadius: "50%", border: "1.5px solid #fff", boxShadow: `0 0 12px ${color}`, pointerEvents: "none" }} />}
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
          <AchIcon id={r.id} icon={r.icon} size={u(68)} color={color} />
        </div>
      </button>
    </At>
  );
}

/** the legendary medallion: rotating sunburst rays, a metallic double ring, gems, a moving highlight and a dark inner disc */
function Medallion({ done, icon }: { done: boolean; icon: string }) {
  const k = useId().replace(/:/g, "");
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", filter: done ? undefined : "saturate(.75) brightness(.85)" }}>
      <div className="ach-aura" style={{ position: "absolute", inset: "-45%", borderRadius: "50%", background: `radial-gradient(circle, ${GOLD}55, transparent 62%)` }} />
      <svg viewBox="0 0 200 200" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
        <defs>
          <linearGradient id={`g1${k}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff1c2" /><stop offset=".28" stopColor="#f5b942" /><stop offset=".55" stopColor="#8a5a14" /><stop offset=".78" stopColor="#e0a83a" /><stop offset="1" stopColor="#6b4410" />
          </linearGradient>
          <linearGradient id={`g2${k}`} x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff1c2" /><stop offset=".4" stopColor="#b9801f" /><stop offset="1" stopColor="#f5b942" />
          </linearGradient>
          <radialGradient id={`g3${k}`} cx="50%" cy="36%" r="72%">
            <stop offset="0" stopColor="#2d1d3d" /><stop offset=".55" stopColor="#0e0816" /><stop offset="1" stopColor="#04020a" />
          </radialGradient>
          <radialGradient id={`g4${k}`}>
            <stop offset="0" stopColor="#ffd978" stopOpacity=".3" /><stop offset="1" stopColor="#ffd978" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* sunburst rays, turning very slowly */}
        <g className="ach-spin-slow" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          {Array.from({ length: 24 }, (_, i) => (
            <path key={i} d={i % 2 ? "M100 10L102.6 21 97.4 21Z" : "M100 3L104.4 21 95.6 21Z"} fill={`url(#g1${k})`} opacity={i % 2 ? 0.55 : 0.95} transform={`rotate(${i * 15} 100 100)`} />
          ))}
        </g>

        {/* metallic double ring */}
        <circle cx="100" cy="100" r="80" fill="none" stroke={`url(#g2${k})`} strokeWidth="1" opacity=".8" />
        <circle cx="100" cy="100" r="76" fill="none" stroke={`url(#g1${k})`} strokeWidth="6" />
        <circle cx="100" cy="100" r="71.5" fill="none" stroke="#2a1a05" strokeWidth="1.2" />

        {/* gems: four diamonds with a ruby core, four pearls between them */}
        {[45, 135, 225, 315].map((a) => (
          <circle key={a} cx={100 + 76 * Math.cos((a * Math.PI) / 180)} cy={100 + 76 * Math.sin((a * Math.PI) / 180)} r="3" fill="#fff3c8" stroke="#8a5a14" strokeWidth=".8" />
        ))}
        {[0, 90, 180, 270].map((a) => (
          <g key={a} transform={`rotate(${a} 100 100)`}>
            <path d="M100 17.5L105.6 24.5 100 33 94.4 24.5Z" fill="#ffe9a8" stroke="#7a4e10" strokeWidth=".9" />
            <circle cx="100" cy="24.5" r="1.4" fill="#e8344e" />
          </g>
        ))}

        {/* highlight that travels round the ring */}
        <circle className="ach-spin" cx="100" cy="100" r="76" fill="none" stroke="#fff" strokeOpacity=".75" strokeWidth="1.8" strokeDasharray="26 452" strokeLinecap="round"
          style={{ transformBox: "fill-box", transformOrigin: "center" }} />

        {/* dark inner disc */}
        <circle cx="100" cy="100" r="66" fill={`url(#g3${k})`} stroke="#3a2608" strokeWidth="1.4" />
        <circle cx="100" cy="100" r="63" fill="none" stroke={GOLD} strokeOpacity=".45" strokeWidth="1" />
        <circle cx="100" cy="100" r="58" fill={`url(#g4${k})`} />
        <path d="M44 78A60 60 0 0 1 100 40" fill="none" stroke="#fff" strokeOpacity=".12" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        <AchIcon id="successful" icon={icon} size={u(64)} color={GOLD} />
      </div>
    </div>
  );
}

export default function AchBottom({ resolved, summary, head, serif }: {
  resolved: Record<string, Resolved>; summary: Summary; head: string; serif: string;
}) {
  const legendary = resolved["successful"];
  const lDone = summary.legendary;
  const { sel, setSel, setHov, focus, hotBranch } = useAchSel();

  const hand = (id: string): Hand => ({
    onMouseEnter: () => setHov(id), onMouseLeave: () => setHov(null),
    onFocus: () => setHov(id), onBlur: () => setHov(null),
    onClick: () => setSel((s) => (s === id ? null : id)),
  });

  return (
    <>
      <style>{css}</style>

      {/* ---------- six epic emblems ---------- */}
      {ORDER.map((id, i) => {
        const b = branches.find((x) => x.id === id)!;
        const st = summary.stats[id];
        const epic = resolved[b.epic];
        const cx = 125 + i * 170.6;
        const dim = focus && focus !== id ? 0.4 : 1;
        return (
          <div key={id} style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: dim, transition: "opacity .3s" }}>
            <Emblem r={epic} color={b.color} cx={cx} cy={795} d={104} active={st.unlocked > 0} done={st.epicDone}
              picked={sel === b.epic} hot={hotBranch === id} hand={hand(b.epic)} />
            <At x={cx - 85} y={849} w={170} style={{ textAlign: "center", fontFamily: head, fontSize: u(12.5), letterSpacing: "0.05em", color: b.color, textShadow: `0 0 10px ${b.color}66`, textTransform: "uppercase" }}>
              {b.pathName}
            </At>
            <At x={cx - 85} y={868} w={170} style={{ textAlign: "center", fontFamily: serif, fontSize: u(15), color: "#f0e6ee" }}>
              {st.unlocked}/{st.total}
            </At>
            <Bar x={cx - 59} y={892} w={118} pct={st.unlocked / st.total} color={b.color} />
          </div>
        );
      })}

      {/* ---------- legendary ---------- */}
      {/* warm light behind the medallion */}
      <At x={LX - 190} y={788 - 130} w={380} h={260} style={{ background: `radial-gradient(closest-side, ${GOLD}${lDone ? "38" : "1c"}, transparent)`, pointerEvents: "none" }} />

      <At x={LX - 52} y={736} w={104} h={104}>
        <Medallion done={lDone} icon={legendary.icon} />
      </At>

      {/* title with a shimmer, flanked by two rules */}
      <At x={1077} y={846} w={515} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: u(12), pointerEvents: "none" }}>
        <span aria-hidden style={{ width: u(62), height: 1, background: `linear-gradient(90deg, transparent, ${GOLD}aa)` }} />
        <span className="ach-shine" title={legendary.fantasyName}
          style={{ fontFamily: head, fontSize: u(18), letterSpacing: "0.24em", textTransform: "uppercase", filter: `drop-shadow(0 0 10px ${GOLD}55)` }}>
          {legendary.name}
        </span>
        <span aria-hidden style={{ width: u(62), height: 1, background: `linear-gradient(270deg, transparent, ${GOLD}aa)` }} />
      </At>

      {/* status + count */}
      <At x={1077} y={873} w={515} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: u(7), fontFamily: serif, fontSize: u(13), color: lDone ? "#3be07f" : "#cbbfc9" }}>
        {lDone ? <Check style={{ width: u(12), height: u(12) }} /> : <Lock style={{ width: u(12), height: u(12) }} />}
        <span>{lDone ? "Unlocked" : "Locked"}</span>
        <span aria-hidden style={{ opacity: 0.5 }}>·</span>
        <span>{summary.epics}/6 epic paths completed</span>
      </At>

      {/* six gems, one per path: each lights up in its own colour when that epic is done */}
      <At x={LX - 100} y={893} w={200} h={14} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span aria-hidden style={{ position: "absolute", left: u(7), right: u(7), top: "50%", height: 1, background: "linear-gradient(90deg, transparent, rgba(245,185,66,.4) 15%, rgba(245,185,66,.4) 85%, transparent)" }} />
        {ORDER.map((id) => {
          const b = branches.find((x) => x.id === id)!;
          const on = summary.stats[id].epicDone;
          return (
            <span key={id} title={`${b.pathName}${on ? " ✓" : ""}`}
              style={{
                position: "relative", width: u(11), height: u(11), transform: "rotate(45deg)",
                background: on ? b.color : "#0a0612", border: `1px solid ${on ? "#ffffffcc" : `${b.color}88`}`,
                boxShadow: on ? `0 0 10px ${b.color}` : undefined,
              }} />
          );
        })}
      </At>

      <At x={1077} y={914} w={515} style={{ textAlign: "center", fontFamily: serif, fontStyle: "italic", fontSize: u(12), color: "#9d93a6" }}>
        The journey is the reward. The success is the result.
      </At>
    </>
  );
}