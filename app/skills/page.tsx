import type { CSSProperties } from "react";
import type { Metadata } from "next";
import SkillsExplorer from "@/components/SkillsExplorer";
import BackArrow from "@/components/BackArrow";
import SceneBackground from "@/components/SceneBackground";
import { skills } from "@/data/skills";

export const metadata: Metadata = {
  title: "Skills | The Anonymous Coder",
};

// Fixed values (no randomness) so server and browser render the same thing
const embers = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 37 + 9) % 100,
  size: 2 + (i % 3),
  delay: (i * 1.6) % 10,
  duration: 9 + ((i * 5) % 8),
  drift: ((i * 17) % 60) - 30,
  violet: i % 3 === 0,
}));

export default function SkillsPage() {
  const total = skills.length;
  const unlocked = skills.filter((s) => s.unlocked).length;
  const pct = Math.round((unlocked / total) * 100);

  return (
    <section className="sp-root relative isolate min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Background image + tint (its own embers are off, the page keeps its hand-made ones below) */}
      <SceneBackground images={["/backgrounds/skills.jpg"]} accent="#9b5cff" embers={0} />

      {/* Drifting storm glows */}
      <div aria-hidden="true" className="sp-glow-a absolute -right-24 -top-24 z-0 h-[420px] w-[420px] rounded-full" />
      <div aria-hidden="true" className="sp-glow-b absolute -bottom-32 -left-24 z-0 h-[380px] w-[380px] rounded-full" />

      {/* Rising embers */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {embers.map((e, i) => (
          <span
            key={i}
            className={`sp-ember ${e.violet ? "sp-ember-violet" : ""}`}
            style={
              {
                left: `${e.left}%`,
                width: e.size,
                height: e.size,
                "--dx": `${e.drift}px`,
                "--dur": `${e.duration}s`,
                "--delay": `${e.delay}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <BackArrow fallback="/home" />

      {/* py-10 / mt-8 (was py-14 / mt-10) so header + tabs + panel fit on one screen */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-10 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="sp-rise">
            <p className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-[#b8b0c9]">
              <span className="sp-diamond h-2.5 w-2.5 rotate-45 bg-[#ff244f]" />
              Skills
            </p>
            <h1 className="sp-title mt-3 font-display text-4xl uppercase tracking-[0.12em] text-[#f4f0fa] md:text-5xl">
              The Arsenal
            </h1>
            <p className="mt-3 max-w-xl text-[#b8b0c9]">
              Tools, technologies and skills I&apos;m currently working with, and the ones still
              waiting to be unlocked.
            </p>
          </div>

          {/* Overall progress */}
          <div className="sp-rise w-full max-w-xs rounded-xl border border-[#9b5cff]/25 bg-[#0b0a12]/70 p-4 sm:w-64">
            <div className="flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-[0.25em] text-[#b8b0c9]">Unlocked</span>
              <span className="font-display text-xl text-[#f4f0fa]">
                {unlocked}
                <span className="text-sm text-[#b8b0c9]"> / {total}</span>
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#9b5cff]/15">
              <div
                className="sp-fill h-full rounded-full bg-gradient-to-r from-[#ff244f] to-[#9b5cff] shadow-[0_0_10px_rgba(255,36,79,0.8)]"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <SkillsExplorer />
        </div>
      </div>

      <style>{`
        /* No visible scrollbars on this page (page + the skill detail panel); wheel, touch and keys still scroll */
        html { scrollbar-width: none; }
        html::-webkit-scrollbar { display: none; }
        .sp-root * { scrollbar-width: none; }
        .sp-root *::-webkit-scrollbar { display: none; }

        @keyframes sp-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        .sp-rise { animation: sp-rise .8s ease-out both; }

        @keyframes sp-drift { from { transform: translate(0,0) scale(1); } to { transform: translate(-40px, 30px) scale(1.15); } }
        .sp-glow-a { background: radial-gradient(circle, rgba(155,92,255,.22), transparent 68%); animation: sp-drift 14s ease-in-out infinite alternate; }
        .sp-glow-b { background: radial-gradient(circle, rgba(255,36,79,.14), transparent 68%); animation: sp-drift 18s ease-in-out infinite alternate-reverse; }

        @keyframes sp-title { 0%,100% { text-shadow: 0 0 10px rgba(155,92,255,.25); } 50% { text-shadow: 0 0 26px rgba(255,36,79,.55), 0 0 48px rgba(155,92,255,.35); } }
        .sp-title { animation: sp-title 4s ease-in-out infinite; }

        @keyframes sp-diamond { 0%,100% { box-shadow: 0 0 6px rgba(255,36,79,.6); } 50% { box-shadow: 0 0 16px rgba(255,36,79,1); } }
        .sp-diamond { animation: sp-diamond 2s ease-in-out infinite; }

        @keyframes sp-fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .sp-fill { transform-origin: left; animation: sp-fill 1.4s ease-out .3s both; }

        @keyframes sp-ember {
          0% { transform: translate(0,0); opacity: 0; }
          10% { opacity: .9; }
          100% { transform: translate(var(--dx, 0px), -85vh); opacity: 0; }
        }
        .sp-ember {
          position: absolute; bottom: -10px; border-radius: 9999px;
          background: #ff244f; box-shadow: 0 0 8px 2px rgba(255,36,79,.7);
          opacity: 0; animation: sp-ember var(--dur, 10s) linear var(--delay, 0s) infinite;
        }
        .sp-ember-violet { background: #9b5cff; box-shadow: 0 0 8px 2px rgba(155,92,255,.7); }

        @media (prefers-reduced-motion: reduce) {
          .sp-rise, .sp-glow-a, .sp-glow-b, .sp-title, .sp-diamond, .sp-fill, .sp-ember { animation: none; }
          .sp-ember { opacity: 0; }
        }
      `}</style>
    </section>
  );
}