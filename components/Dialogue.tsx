"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { sfx } from "@/lib/sfx";

// ---- Edit your intro here (3 lines: who you are / your aim / your education)
const SPEAKER = "The Programmer";
const PORTRAIT = "/pfp2.png";
const LINES = [
  "Greetings, traveler. I am Nilesh S. Sillare, a developer who turns ideas into software that works.",
  "My aim is simple: keep learning, keep building, and craft products that people actually use.",
  "My training began with a degree in [YOUR DEGREE] at [YOUR COLLEGE]. The learning never stopped.",
];
const HINT = "or press the glowing sigil";
// Choices shown when the last line is finished (they work as navigation)
const CHOICES = [
  { label: "Skills", href: "/skills" },
  { label: "Projects", href: "/projects" },
  { label: "Achievements", href: "/achievements" },
];
const START_DELAY_MS = 2400; // wait for the opening sequence before speaking
// -------------------------------------------------------------------------

const SPEED_MS = 26;

export default function Dialogue() {
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  const [ready, setReady] = useState(false);
  const ticks = useRef(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(() => setReady(true), reduce ? 0 : START_DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  const line = LINES[i];
  const typing = n < line.length;
  const last = i === LINES.length - 1;
  const finished = last && !typing;

  // Typewriter
  useEffect(() => {
    if (!typing || !ready) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setN(line.length);
      return;
    }
    const t = setInterval(() => {
      if (++ticks.current % 2 === 0) sfx.tick();
      setN((v) => Math.min(v + 1, line.length));
    }, SPEED_MS);
    return () => clearInterval(t);
  }, [i, typing, ready, line.length]);

  const advance = useCallback(() => {
    if (!ready) return;
    sfx.click();
    if (typing) {
      setN(line.length);
    } else if (!last) {
      setI((v) => v + 1);
      setN(0);
    }
  }, [ready, typing, last, line.length]);

  const skip = useCallback(() => {
    setI(LINES.length - 1);
    setN(LINES[LINES.length - 1].length);
  }, []);

  const replay = useCallback(() => {
    setI(0);
    setN(0);
  }, []);

  // Enter / Space advance the dialogue (unless a button or link has focus)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const el = e.target as HTMLElement | null;
      if (el?.closest("a,button,input,textarea,select")) return;
      e.preventDefault();
      advance();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance]);

  return (
    <div className="dialogue-in pointer-events-auto absolute inset-x-4 bottom-4 z-20 md:inset-x-auto md:bottom-8 md:left-[3%] md:w-[min(54%,760px)]">
      {/* Nameplate */}
      <div className="relative ml-24 w-fit border border-b-0 border-crimson/60 bg-void/90 px-5 py-1.5 font-display text-[11px] uppercase tracking-[0.3em] text-[#f0dcf7] shadow-[0_0_18px_rgba(255,36,79,0.25)] sm:ml-32 sm:text-xs">
        {SPEAKER}
      </div>

      <div className="relative flex gap-4 border border-crimson/60 bg-void/85 p-3 shadow-[0_0_40px_rgba(255,36,79,0.2),inset_0_0_30px_rgba(120,60,200,0.12)] backdrop-blur-md sm:gap-5 sm:p-4">
        {/* Corner diamonds */}
        <span aria-hidden="true" className="absolute -left-1.5 -top-1.5 h-2.5 w-2.5 rotate-45 border border-crimson bg-void" />
        <span aria-hidden="true" className="absolute -right-1.5 -top-1.5 h-2.5 w-2.5 rotate-45 border border-crimson bg-void" />
        <span aria-hidden="true" className="absolute -bottom-1.5 -left-1.5 h-2.5 w-2.5 rotate-45 border border-crimson bg-void" />
        <span aria-hidden="true" className="absolute -bottom-1.5 -right-1.5 h-2.5 w-2.5 rotate-45 border border-crimson bg-void" />

        {/* Portrait: overlaps the top-left like an RPG dialogue frame */}
        <div className={`portrait-frame ${ready && typing ? "portrait-talk" : "portrait-idle"} relative -mt-12 h-20 w-20 shrink-0 overflow-hidden border-2 border-crimson/80 bg-void shadow-[0_0_22px_rgba(255,36,79,0.45)] sm:-mt-16 sm:h-28 sm:w-28`}>
          <Image
            src={PORTRAIT}
            alt={`${SPEAKER} portrait`}
            fill
            unoptimized
            sizes="112px"
            className="object-cover object-top"
          />
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 shadow-[inset_0_0_14px_rgba(0,0,0,0.7)]" />
        </div>

        {/* Text */}
        <div
          className="min-w-0 flex-1 cursor-pointer select-none"
          onClick={advance}
          role="button"
          tabIndex={0}
          aria-label="Advance dialogue"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              advance();
            }
          }}
        >
          {/* Screen readers get the full line at once */}
          <p className="sr-only" aria-live="polite">
            {line}
          </p>

          <p
            aria-hidden="true"
            className="dlg-text min-h-[4.75rem] leading-snug text-[#f1e6f8] sm:min-h-[5.75rem]"
          >
            {line.slice(0, n)}
            {typing && <span className="caret" />}
          </p>

          <div className="mt-2 flex items-end justify-between gap-3 text-[10px] uppercase tracking-[0.25em] sm:text-[11px]">
            {/* Progress dots */}
            <span className="flex items-center gap-1.5" aria-hidden="true">
              {LINES.map((_, d) => (
                <span
                  key={d}
                  className={`h-1.5 w-1.5 rotate-45 border border-crimson ${
                    d <= i ? "bg-crimson shadow-[0_0_6px_rgba(255,36,79,0.8)]" : "bg-transparent"
                  }`}
                />
              ))}
            </span>

            {finished ? (
              <span className="flex flex-wrap items-center justify-end gap-2">
                {CHOICES.map((c, k) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    onClick={(e) => e.stopPropagation()}
                    onPointerEnter={() => sfx.hover()}
                    className="choice-in group border border-crimson/60 bg-void/70 px-3 py-1.5 text-[#f4e9f7] transition-colors hover:bg-crimson/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
                    style={{ animationDelay: `${k * 0.12}s` }}
                  >
                    <span aria-hidden="true" className="mr-1.5 text-crimson transition-transform group-hover:translate-x-0.5">&#9654;</span>
                    {c.label}
                  </Link>
                ))}
                <span className="hint-pulse hidden text-lavender/80 lg:inline">{HINT}</span>
              </span>
            ) : !typing && ready ? (
              <span className="continue-cue text-lavender" aria-hidden="true">
                &#9660; Continue
              </span>
            ) : (
              <span />
            )}
          </div>
        </div>

        {/* Skip / Replay */}
        <button
          type="button"
          onClick={finished ? replay : skip}
          className="absolute right-3 top-2 text-[10px] uppercase tracking-[0.25em] text-lavender/60 transition-colors hover:text-lavender focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
        >
          {finished ? "Replay" : "Skip"}
        </button>
      </div>
    </div>
  );
}