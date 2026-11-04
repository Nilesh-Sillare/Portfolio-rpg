"use client";

import { useEffect, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { classes, skills, RANKS, type ClassId } from "@/data/skills";
import { EMBLEMS, HexBadge } from "@/components/SkillIcon";
import SkillPanel, { RankPips } from "@/components/SkillPanel";

export default function SkillsExplorer() {
  const [classId, setClassId] = useState<ClassId>("programming");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const cls = classes.find((c) => c.id === classId)!;
  const classSkills = skills.filter((s) => s.classId === classId);
  const fallback = classSkills.find((s) => s.unlocked) ?? classSkills[0];
  const active = classSkills.find((s) => s.id === selectedId) ?? fallback;

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheetOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheetOpen]);

  function selectClass(id: ClassId) {
    setClassId(id);
    setSelectedId(null);
    setSheetOpen(false);
  }

  // Arrow keys / Home / End move between class tabs
  function onTabKeyDown(e: ReactKeyboardEvent<HTMLDivElement>) {
    const i = classes.findIndex((c) => c.id === classId);
    let next = i;
    if (e.key === "ArrowRight") next = (i + 1) % classes.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + classes.length) % classes.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = classes.length - 1;
    else return;
    e.preventDefault();
    selectClass(classes[next].id);
    document.getElementById(`tab-${classes[next].id}`)?.focus();
  }

  return (
    <div>
      {/* Class tabs: all five always visible, no scrolling */}
      <div
        role="tablist"
        aria-label="Skill classes"
        onKeyDown={onTabKeyDown}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      >
        {classes.map((c) => {
          const Emblem = EMBLEMS[c.emblem];
          const total = skills.filter((s) => s.classId === c.id).length;
          const open = skills.filter((s) => s.classId === c.id && s.unlocked).length;
          const pct = total ? (open / total) * 100 : 0;
          const selected = c.id === classId;
          return (
            <button
              key={c.id}
              id={`tab-${c.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="skills-tabpanel"
              tabIndex={selected ? 0 : -1}
              onClick={() => selectClass(c.id)}
              className={`group relative flex min-w-0 items-center gap-3 overflow-hidden rounded-xl border px-3 py-3 text-left transition duration-300 last:col-span-2 sm:last:col-span-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9b5cff] ${
                selected
                  ? "sk-tab-on border-[#ff244f]/70 bg-[#ff244f]/10"
                  : "border-[#9b5cff]/25 bg-[#0b0a12]/70 hover:border-[#9b5cff]/60 hover:shadow-[0_0_18px_rgba(155,92,255,0.25)]"
              }`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition duration-300 ${
                  selected
                    ? "border-[#ff244f]/60 text-[#ff244f] shadow-[0_0_14px_rgba(255,36,79,0.6)]"
                    : "border-[#9b5cff]/40 text-[#c4b3ee]"
                }`}
              >
                <Emblem className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium leading-snug tracking-wide text-[#f4f0fa]">
                  {c.label}
                </span>
                <span className="block text-[11px] uppercase tracking-[0.16em] text-[#b8b0c9]">
                  {c.fantasyName} · {open}/{total}
                </span>
              </span>
              {/* unlocked progress along the bottom edge */}
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#ff244f] to-[#9b5cff] shadow-[0_0_8px_rgba(255,36,79,0.8)]"
                style={{ width: `${pct}%` }}
              />
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-sm italic text-[#b8b0c9]">{cls.tagline}</p>

      {/* lg:min-h-[480px] matches the panel height, so switching classes never moves the page */}
      <div className="mt-5 grid gap-8 lg:min-h-[480px] lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Skill grid */}
        <div
          key={classId}
          id="skills-tabpanel"
          role="tabpanel"
          aria-labelledby={`tab-${classId}`}
          className="grid grid-cols-2 content-start gap-2 min-[480px]:grid-cols-3 md:grid-cols-4 xl:grid-cols-5"
        >
          {classSkills.map((s, i) => {
            const rank = s.unlocked ? Math.max(1, s.rank) : 0;
            const isActive = active.id === s.id;
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={isActive}
                aria-label={`${s.name}, ${s.unlocked ? RANKS[rank] : "locked"}`}
                onClick={() => {
                  setSelectedId(s.id);
                  setSheetOpen(true);
                }}
                onPointerEnter={(e) => e.pointerType === "mouse" && setSelectedId(s.id)}
                onFocus={() => setSelectedId(s.id)}
                style={{ animationDelay: `${i * 70}ms` }}
                className={`sk-pop flex flex-col items-center gap-2 rounded-xl border px-2 py-4 text-center transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9b5cff] ${
                  isActive
                    ? s.unlocked
                      ? "border-[#ff244f]/50 bg-[#ff244f]/[0.07] shadow-[0_0_26px_rgba(255,36,79,0.22)]"
                      : "border-[#9b5cff]/40 bg-[#9b5cff]/10"
                    : "border-transparent hover:bg-[#9b5cff]/5"
                }`}
              >
                <span className="relative flex items-center justify-center">
                  {s.unlocked && (
                    <span
                      aria-hidden="true"
                      className="sk-spin pointer-events-none absolute -inset-2 rounded-full border border-dashed border-[#9b5cff]/40"
                    />
                  )}
                  <HexBadge icon={s.icon} locked={!s.unlocked} active={isActive} />
                </span>
                <span
                  className={`mt-1 text-sm font-medium ${
                    s.unlocked ? "text-[#f4f0fa]" : "text-[#9a92b0]"
                  }`}
                >
                  {s.name}
                </span>
                <RankPips rank={rank} />
                <span className="text-xs uppercase tracking-[0.14em] text-[#b8b0c9]">
                  {s.unlocked ? RANKS[rank] : "Locked"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Desktop side panel */}
        <aside className="hidden lg:block" aria-live="polite">
          <div className="sticky top-24">
            <SkillPanel skill={active} />
          </div>
        </aside>
      </div>

      {/* Mobile bottom sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="Close skill details"
            onClick={() => setSheetOpen(false)}
            className="absolute inset-0 bg-black/70"
          />
          <div className="sk-sheet absolute inset-x-0 bottom-0 max-h-[85svh] overflow-y-auto p-3">
            <SkillPanel skill={active} onClose={() => setSheetOpen(false)} />
          </div>
        </div>
      )}

      <style>{`
        /* Skills fade in once when a class opens */
        @keyframes sk-pop { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .sk-pop { animation: sk-pop .45s ease-out both; }

        @keyframes sk-sheet { from { transform: translateY(100%); } to { transform: none; } }
        .sk-sheet { animation: sk-sheet .3s ease-out both; }

        /* Slowly turning rune ring around unlocked skills */
        @keyframes sk-spin { to { transform: rotate(360deg); } }
        .sk-spin { animation: sk-spin 16s linear infinite; }

        /* Selected tab: breathing red glow */
        @keyframes sk-tabglow {
          0%,100% { box-shadow: 0 0 14px rgba(255,36,79,.30), inset 0 0 12px rgba(255,36,79,.08); }
          50% { box-shadow: 0 0 28px rgba(255,36,79,.60), inset 0 0 18px rgba(255,36,79,.16); }
        }
        .sk-tab-on { animation: sk-tabglow 2.8s ease-in-out infinite; }

        /* Side panel: slow glow only */
        @keyframes sk-panelglow {
          0%,100% { box-shadow: 0 0 26px rgba(255,36,79,.12), inset 0 0 26px rgba(155,92,255,.05); }
          50% { box-shadow: 0 0 46px rgba(255,36,79,.28), inset 0 0 34px rgba(155,92,255,.10); }
        }
        .sk-panel { animation: sk-panelglow 3.4s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .sk-pop, .sk-sheet, .sk-spin, .sk-tab-on, .sk-panel { animation: none; }
        }
      `}</style>
    </div>
  );
}