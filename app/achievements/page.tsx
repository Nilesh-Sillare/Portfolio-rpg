import { Cinzel, Cormorant_Garamond } from "next/font/google";
import { Crown, Flame, Gem, Hammer } from "lucide-react";
import { resolveAll, summarize } from "@/lib/achievementsState";
import AchCount from "@/components/AchCount";
import AchStyles from "@/components/AchStyles";
import AchTree from "@/components/AchTree";
import AchStage, { At, Panel, u } from "@/components/AchStage";
import AchBottom from "@/components/AchBottom";
import AchSelection from "@/components/AchSelection";
import AchParticles from "@/components/AchParticles";
import { projects } from "@/data/projects";

const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "600", "700"] });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500"], style: ["italic", "normal"] });

const PROJECTS_COMPLETED = projects.filter((p) => p.status === "Completed").length;

// stats card, in mockup pixels (centred on the page: 555 + 500/2 = 805)
const CARD = { x: 555, y: 52, w: 500, h: 84 };

export default function AchievementsPage() {
  const resolved = resolveAll(PROJECTS_COMPLETED);
  const s = summarize(resolved);
  const head = cinzel.style.fontFamily as string;
  const serif = cormorant.style.fontFamily as string;

  const stats = [
    { Icon: Flame, value: s.unlocked, label: "Unlocked\nAchievements", color: "#ff3b4e" },
    { Icon: Gem, value: s.epics, label: "Epic Paths\nCompleted", color: "#a855f7" },
    { Icon: Hammer, value: PROJECTS_COMPLETED, label: "Projects\nCompleted", color: "#f5b942" },
  ];
  const colW = CARD.w / 3;

  return (
    <main>
      <AchStyles />
      <AchStage>
        {/* ---------- header ---------- */}
        <At x={44} y={46} className="ach-rise" style={{ color: "#ff3b4e", fontSize: u(26), textShadow: "0 0 14px rgba(255,40,70,.7)" }}>✦</At>
        <At x={84} y={28} className="ach-rise" style={{ fontFamily: head, color: "#f6e9ee", whiteSpace: "nowrap", letterSpacing: "0.05em", textShadow: "0 0 18px rgba(255,40,70,.55)", animationDelay: ".1s" }}>
          <span style={{ fontSize: u(46) }}>A</span>
          <span style={{ fontSize: u(38) }}>CHIEVEMENT</span>
          <span style={{ fontSize: u(46) }}> </span>
          <span style={{ fontSize: u(46) }}>T</span>
          <span style={{ fontSize: u(38) }}>ree</span>
        </At>
        <At x={84} y={104} w={400} className="ach-rise" style={{ fontFamily: serif, fontStyle: "italic", fontSize: u(17), lineHeight: 1.3, color: "#e4d8e0", textShadow: "0 1px 8px #000", animationDelay: ".2s" }}>
          Every milestone makes the journey.
        </At>
        {/* thin divider with a diamond */}
        <At x={84} y={134} w={290} className="ach-rise" style={{ animationDelay: ".25s" }}>
          <div style={{ height: 1, background: "linear-gradient(90deg, rgba(168,85,247,.9), rgba(168,85,247,.1))" }} />
          <span aria-hidden style={{ position: "absolute", left: "50%", top: 0, width: u(7), height: u(7), background: "#a855f7", transform: "translate(-50%,-50%) rotate(45deg)", boxShadow: "0 0 8px #a855f7" }} />
        </At>

        {/* stats card: pointed ends, one thin frame */}
        <At x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} className="ach-rise" style={{ animationDelay: ".3s" }}>
          <svg viewBox={`0 0 ${CARD.w} ${CARD.h}`} preserveAspectRatio="none" aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
            <defs>
              <linearGradient id="achCardEdge" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#ff3b4e" />
                <stop offset=".5" stopColor="#a855f7" />
                <stop offset="1" stopColor="#ff3b4e" />
              </linearGradient>
            </defs>
            <path d="M20 1H480L499 42L480 83H20L1 42Z" fill="rgba(8,5,12,.84)" stroke="url(#achCardEdge)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
            <path d="M28 7H472L490 42L472 77H28L10 42Z" fill="none" stroke="rgba(255,255,255,.07)" vectorEffect="non-scaling-stroke" />
            <path d="M1 35L8 42L1 49L-6 42Z" fill="#d4375f" />
            <path d="M499 35L506 42L499 49L492 42Z" fill="#d4375f" />
          </svg>
        </At>
        {stats.map(({ Icon, value, label, color }, i) => (
          <At key={label} x={CARD.x + colW * i} y={CARD.y} w={colW} h={CARD.h} className="ach-rise"
            style={{ display: "flex", alignItems: "center", gap: u(10), paddingLeft: u(i === 0 ? 30 : 22), animationDelay: `${0.35 + i * 0.12}s` }}>
            <Icon className="ach-pulse" style={{ width: u(32), height: u(32), color, filter: `drop-shadow(0 0 6px ${color})`, flexShrink: 0 }} strokeWidth={1.6} />
            <div style={{ fontFamily: head, fontSize: u(28), color: "#f6e9ee", lineHeight: 1 }}>
              <AchCount value={value} delay={300 + i * 120} />
            </div>
            <div style={{ fontFamily: head, fontSize: u(8.5), letterSpacing: "0.1em", lineHeight: 1.45, color: "#cbbfc9", whiteSpace: "pre-line", textTransform: "uppercase" }}>{label}</div>
          </At>
        ))}
        {[1, 2].map((i) => (
          <At key={i} x={CARD.x + colW * i} y={CARD.y + 18} w={1} h={CARD.h - 36} style={{ background: "linear-gradient(180deg, transparent, rgba(255,255,255,.22), transparent)" }} />
        ))}

        {/* the tree and the bottom row share one selection */}
        <AchSelection resolved={resolved}>
          {/* embers, sparks and click bursts */}
          <AchParticles resolved={resolved} />

          {/* clusters, hubs, legend and the detail popup */}
          <AchTree resolved={resolved} summary={s} head={head} serif={serif} />

          {/* ---------- epic path (unchanged) ---------- */}
          <Panel x={18} y={672} w={1045} h={263} image="/backgrounds/achievements-epic.webp" dim={0.45} tone="rgba(150,60,200,.5)" />
          <At x={50} y={688} style={{ color: "#a855f7", fontSize: u(24) }}>✦</At>
          <At x={80} y={688} style={{ fontFamily: head, fontSize: u(19), letterSpacing: "0.16em", color: "#f6e9ee" }}>EPIC PATH</At>
          <At x={80} y={714} style={{ fontFamily: serif, fontStyle: "italic", fontSize: u(14), color: "#cbbfc9" }}>
            Complete each path to unlock the legendary achievement.
          </At>

          {/* ---------- legendary (unchanged) ---------- */}
          <Panel x={1077} y={672} w={515} h={263} image="/backgrounds/achievements-legendary.webp" dim={0.4} tone="rgba(150,60,200,.5)" sizes="40vw" />
          <At x={1110} y={690}>
            <Crown style={{ width: u(30), height: u(30), color: "#f5b942" }} strokeWidth={1.5} />
          </At>
          <At x={1162} y={688} style={{ fontFamily: head, fontSize: u(19), letterSpacing: "0.14em", color: "#f6e9ee", whiteSpace: "nowrap" }}>LEGENDARY ACHIEVEMENT</At>
          <At x={1162} y={714} style={{ fontFamily: serif, fontStyle: "italic", fontSize: u(14), color: "#cbbfc9" }}>
            Complete all epic paths to earn the ultimate recognition.
          </At>
          <AchBottom resolved={resolved} summary={s} head={head} serif={serif} />
        </AchSelection>
      </AchStage>
    </main>
  );
}