import Link from "next/link";
import { Award, FolderOpen, Lock, X } from "lucide-react";
import { RANKS, type Skill } from "@/data/skills";
import { HexBadge } from "@/components/SkillIcon";

export function RankPips({ rank }: { rank: number }) {
  return (
    <span className="flex items-center gap-1" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`h-1.5 w-1.5 rounded-full ${
            n <= rank
              ? "bg-[#ff244f] shadow-[0_0_6px_rgba(255,36,79,0.9)]"
              : "bg-[#9b5cff]/25"
          }`}
        />
      ))}
    </span>
  );
}

/*
  SIZE RULE
  On desktop the panel is ALWAYS lg:h-[480px], whatever skill is shown, so it never
  resizes while you hover across skills. Every section below has a fixed or reserved
  height (summary reserves two lines, "Applied in" always renders one row, buttons are
  pinned to the bottom), so content fits without leaving a big empty gap.
  If you add longer content later, overflow-y-auto keeps it scrollable instead of
  growing the panel. On mobile the panel sits in a bottom sheet and sizes to its content.
*/
export default function SkillPanel({
  skill,
  onClose,
}: {
  skill: Skill;
  onClose?: () => void;
}) {
  const locked = !skill.unlocked;
  const rank = locked ? 0 : Math.max(1, skill.rank);

  return (
    <div className="sk-panel relative flex flex-col overflow-y-auto rounded-2xl border border-[#ff244f]/40 bg-[#0b0a12]/95 p-5 lg:h-[480px]">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close skill details"
          className="absolute right-4 top-4 z-10 rounded-md p-1 text-[#b8b0c9] transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#9b5cff]"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      )}

      {/* Header */}
      <div className="relative flex items-center gap-4 pr-8">
        <HexBadge icon={skill.icon} locked={locked} size={64} active />
        <div>
          <h2 className="font-display text-xl tracking-wide text-[#f4f0fa]">{skill.name}</h2>
          <span
            className={`mt-1.5 inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.2em] ${
              skill.kind === "active"
                ? "border-[#ff244f]/50 bg-[#ff244f]/10 text-[#ff7a96]"
                : "border-[#9b5cff]/50 bg-[#9b5cff]/10 text-[#c4b3ee]"
            }`}
          >
            {skill.kind} skill
          </span>
        </div>
      </div>

      {locked ? (
        <div className="relative mt-5 rounded-lg border border-dashed border-[#9b5cff]/30 bg-[#9b5cff]/5 p-4">
          <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.2em] text-[#c4b3ee]">
            <Lock className="h-4 w-4" aria-hidden="true" />
            Not unlocked yet
          </p>
          <p className="mt-2 text-sm text-[#b8b0c9]">On my roadmap.</p>
        </div>
      ) : (
        <div className="relative flex flex-1 flex-col">
          {/* Rank */}
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-sm font-medium uppercase tracking-[0.2em] text-[#f4f0fa]">
              Rank {["", "I", "II", "III", "IV", "V"][rank]} · {RANKS[rank]}
            </span>
            <span className="text-xs text-[#b8b0c9]">{rank}/5</span>
          </div>

          <div className="mt-2.5 flex gap-1.5" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                className={`h-1.5 flex-1 rounded-full ${
                  n <= rank
                    ? "bg-gradient-to-r from-[#ff244f] to-[#9b5cff] shadow-[0_0_8px_rgba(255,36,79,0.7)]"
                    : "bg-[#9b5cff]/20"
                }`}
              />
            ))}
          </div>

          {/* Summary: reserves two lines so short and long summaries take the same space */}
          <p className="mt-3 min-h-[2.75rem] text-sm leading-snug text-[#b8b0c9]">
            {skill.summary}
          </p>

          {/* Topics */}
          {skill.topics.length > 0 && (
            <ul className="mt-3 space-y-2 border-t border-[#9b5cff]/20 pt-4">
              {skill.topics.map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-[#f4f0fa]">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#ff244f] shadow-[0_0_8px_rgba(255,36,79,0.8)]" />
                  {t}
                </li>
              ))}
            </ul>
          )}

          {/* Applied in: always shown, so there is never a hole where it used to be */}
          <div className="mt-4 border-t border-[#9b5cff]/20 pt-4">
            <p className="font-display text-sm tracking-wide text-[#f4f0fa]">Applied in</p>
            {skill.appliedIn.length > 0 ? (
              <ul className="mt-2 flex flex-wrap gap-2">
                {skill.appliedIn.map((p) => (
                  <li
                    key={p}
                    className="flex items-center gap-2 rounded-full border border-[#ff244f]/35 bg-[#ff244f]/5 px-3 py-1 text-xs text-[#d9d2ea]"
                  >
                    <span className="h-1.5 w-1.5 rotate-45 bg-[#ff244f] shadow-[0_0_6px_rgba(255,36,79,0.9)]" />
                    {p}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm italic text-[#b8b0c9]">
                Not in a project yet. Next on the quest log.
              </p>
            )}
          </div>

          {/* Buttons pinned to the bottom */}
          <div className="mt-auto grid grid-cols-2 gap-3 pt-4">
            <Link
              href="/projects"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-[#ff244f]/70 bg-[#ff244f]/5 px-3 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-[#ff7a96] transition hover:bg-[#ff244f]/15 hover:shadow-[0_0_24px_rgba(255,36,79,0.6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9b5cff]"
            >
              <FolderOpen className="h-4 w-4" aria-hidden="true" />
              Projects
            </Link>

            <Link
              href={`/achievements?skill=${skill.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-[#9b5cff]/60 bg-[#9b5cff]/5 px-3 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-[#c4b3ee] transition hover:bg-[#9b5cff]/15 hover:text-white hover:shadow-[0_0_24px_rgba(155,92,255,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9b5cff]"
            >
              <Award className="h-4 w-4" aria-hidden="true" />
              Credentials
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}