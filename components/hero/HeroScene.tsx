"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { landing } from "@/data/site";
import { sfx } from "@/lib/sfx";
import Dialogue from "@/components/Dialogue";
import CloakWind from "./CloakWind";
import CursorEmbers from "./CursorEmbers";
import DecodeText from "./DecodeText";
import RuneRing from "./RuneRing";
import SkyFx from "./SkyFx";

// ---- Tuning knobs (all in % of the image width) ---------------------
const BG = "/landing.png";
const SIGIL_IMG_SRC = "/sigil.png"; // public/sigil.png
const RING = { cx: 77.9, cy: 20.0, r: 14.0 }; // rune ring: centre + outer radius
const SIGIL = { cx: 77.9, cy: 18.2, size: 13 }; // red glow behind the sigil
const SIGIL_IMG = { cx: 77.9, cy: 19.0, size: 14 }; // sigil.png placement + size
const MOON = { cx: 45.2, cy: 11.4, size: 9 }; // moon glow
const SIGIL_CLICK = { cx: 77.9, cy: 19.0, size: 11 }; // clickable area over the sigil
// ---------------------------------------------------------------------

// Fixed values (no randomness) so server and browser render the same thing
const embers = Array.from({ length: 28 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  size: 2 + (i % 3),
  delay: (i * 1.9) % 13,
  duration: 9 + ((i * 5) % 8),
  drift: ((i * 17) % 50) - 25,
  violet: i % 4 === 0,
}));

export type HeroStats = {
  projects: number;
  unlocked: number;
  total: number;
  quest: string;
};

export default function HeroScene({ stats }: { stats: HeroStats }) {
  const router = useRouter();
  const root = useRef<HTMLElement>(null);
  const [burst, setBurst] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [sound, setSound] = useState(false);
  const lastBurst = useRef(0);

  // Mouse parallax: smooth --mx / --my (-1..1) on the section, read by the CSS
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    let running = false;
    const loop = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      el.style.setProperty("--mx", cx.toFixed(3));
      el.style.setProperty("--my", cy.toFixed(3));
      if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) {
        raf = requestAnimationFrame(loop);
      } else {
        running = false;
      }
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
      ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
      if (!running && !document.hidden) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    setSound(sfx.load());
  }, []);

  const fire = useCallback(() => {
    const now = performance.now();
    if (now - lastBurst.current < 1400) return;
    lastBurst.current = now;
    setBurst((b) => b + 1);
  }, []);

  const toggleSound = () => {
    const next = !sound;
    sfx.setOn(next);
    setSound(next);
  };

  // Click the sigil or the button: a shockwave and a portal flash, then the portfolio
  const enter = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    if (leaving) return;
    sfx.whoosh();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      router.push("/home");
      return;
    }
    lastBurst.current = 0;
    fire();
    setLeaving(true);
    window.setTimeout(() => router.push("/home"), 750);
  };

  const hover = () => {
    fire();
    sfx.hover();
  };

  const xp = stats.total ? Math.round((stats.unlocked / stats.total) * 100) : 0;

  return (
    <section
      ref={root}
      className="landing relative isolate flex h-[calc(100svh-4rem)] min-h-[560px] items-end justify-center overflow-hidden md:justify-end"
      style={{ containerType: "size" }}
    >
      {/* Stage: always 16:9 and always covers the section */}
      <div
        className="absolute left-1/2 top-1/2 -z-20 aspect-video -translate-x-1/2 -translate-y-1/2"
        style={{ width: "max(100cqw, calc(100cqh * 16 / 9))", containerType: "inline-size" }}
      >
        <div className="zoom-drift absolute inset-0">
          <div className="px-art absolute inset-0">
            {/* Background artwork */}
            <Image src={BG} alt="" fill priority unoptimized sizes="100vw" className="object-cover" />

            {/* Cloak: a GPU wind warp laid exactly over the knight's cloak */}
            <CloakWind />

            {/* Castle lights, lava glow and lightning */}
            <SkyFx />

            {/* Moon glow */}
            <div
              aria-hidden="true"
              className="moon-glow absolute rounded-full"
              style={{
                left: `${MOON.cx - MOON.size / 2}cqw`,
                top: `${MOON.cy - MOON.size / 2}cqw`,
                width: `${MOON.size}cqw`,
                height: `${MOON.size}cqw`,
                background: "radial-gradient(circle, rgba(185,165,232,0.55), transparent 65%)",
              }}
            />

            {/* Sigil glow */}
            <div
              aria-hidden="true"
              className="sigil-glow absolute rounded-full"
              style={{
                left: `${SIGIL.cx - SIGIL.size / 2}cqw`,
                top: `${SIGIL.cy - SIGIL.size / 2}cqw`,
                width: `${SIGIL.size}cqw`,
                height: `${SIGIL.size}cqw`,
                background: "radial-gradient(circle, rgba(255,36,79,0.6), transparent 65%)",
              }}
            />

            {/* The living rune ring */}
            <RuneRing bg={BG} cx={RING.cx} cy={RING.cy} r={RING.r} burst={burst} />

            {/* Sigil artwork (public/sigil.png), sits on top of the ring */}
            <div
              aria-hidden="true"
              className="absolute"
              style={{
                left: `${SIGIL_IMG.cx - SIGIL_IMG.size / 2}cqw`,
                top: `${SIGIL_IMG.cy - SIGIL_IMG.size / 2}cqw`,
                width: `${SIGIL_IMG.size}cqw`,
                height: `${SIGIL_IMG.size}cqw`,
              }}
            >
              <Image src={SIGIL_IMG_SRC} alt="" fill unoptimized sizes="20vw" className="sigil-img object-contain" />
            </div>
          </div>
        </div>
      </div>

      {/* Drifting embers (parallax: they move against the artwork) */}
      <div aria-hidden="true" className="px-far pointer-events-none absolute -inset-4 -z-10 overflow-hidden">
        {embers.map((e, i) => (
          <span
            key={i}
            className={`ember ${e.violet ? "ember-violet" : ""}`}
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

      {/* Fog */}
      <div aria-hidden="true" className="fog -z-10" />

      {/* Soft shade so the text stays readable, plus a vignette */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-void/85 via-transparent to-void/20"
      />
      <div aria-hidden="true" className="hero-vignette pointer-events-none absolute inset-0 -z-10" />

      {/* Click layer: same stage geometry, sits above the overlays */}
      <div
        className="px-art pointer-events-none absolute left-1/2 top-1/2 aspect-video -translate-x-1/2 -translate-y-1/2"
        style={{ width: "max(100cqw, calc(100cqh * 16 / 9))", containerType: "inline-size" }}
      >
        <Link
          href="/home"
          aria-label="Enter the portfolio"
          onClick={enter}
          onPointerEnter={hover}
          className="sigil-link pointer-events-auto absolute block cursor-pointer rounded-full transition-transform duration-300 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet"
          style={{
            left: `${SIGIL_CLICK.cx - SIGIL_CLICK.size / 2}cqw`,
            top: `${SIGIL_CLICK.cy - SIGIL_CLICK.size / 2}cqw`,
            width: `${SIGIL_CLICK.size}cqw`,
            height: `${SIGIL_CLICK.size}cqw`,
          }}
        />
      </div>

      {/* Ember trail that follows the cursor */}
      <CursorEmbers />

      {/* RPG dialogue box (typewriter intro, portrait, choices) */}
      <Dialogue />

      {/* Name, tagline, call to action, quest log */}
      <div className="relative z-10 w-full px-5 pb-56 text-center md:w-[48%] md:pb-14 md:pr-8 lg:pr-10">
        <h1
          className="font-display uppercase tracking-[0.24em] text-[#f6ecfb]"
          style={{
            fontSize: "clamp(1.5rem, 2.7cqw, 3.4rem)",
            fontWeight: 600,
            textShadow: "0 0 26px rgba(255,36,79,0.55), 0 0 60px rgba(155,92,255,0.35)",
          }}
        >
          <DecodeText text={landing.name} delay={800} duration={1700} />
        </h1>

        <p className="mt-5 flex items-center justify-center gap-3 text-[11px] tracking-[0.35em] text-lavender sm:gap-4 sm:text-sm">
          <span className="hero-rise hidden h-px w-10 bg-gradient-to-r from-transparent to-lavender/50 sm:block" style={{ animationDelay: "2.3s" }} />
          {landing.words.map((word, i) => (
            <span key={word} className="hero-rise flex items-center gap-3 sm:gap-4" style={{ animationDelay: `${2.3 + i * 0.22}s` }}>
              {i > 0 && <span className="text-lavender/60">/</span>}
              <span>{word.toUpperCase()}</span>
            </span>
          ))}
          <span className="hero-rise hidden h-px w-10 bg-gradient-to-l from-transparent to-lavender/50 sm:block" style={{ animationDelay: "2.3s" }} />
        </p>

        <div aria-hidden="true" className="hero-rise mx-auto mt-5 flex max-w-xs items-center gap-3" style={{ animationDelay: "2.6s" }}>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-crimson/70" />
          <span className="h-2.5 w-2.5 rotate-45 border border-crimson bg-crimson/30 shadow-[0_0_10px_rgba(255,36,79,0.8)]" />
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-crimson/70" />
        </div>

        <div className="hero-rise" style={{ animationDelay: "2.9s" }}>
          <Link
            href="/home"
            onClick={enter}
            onPointerEnter={() => sfx.hover()}
            className="cta group relative mt-7 inline-flex items-center gap-3 overflow-hidden border border-crimson/80 bg-void/55 px-7 py-3 font-display text-[11px] uppercase tracking-[0.38em] text-[#fbeff4] backdrop-blur-sm transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 sm:text-xs"
          >
            <span aria-hidden="true" className="cta-sweep absolute inset-y-0 -left-1/2 w-1/2" />
            <span className="relative">Begin the Quest</span>
            <span aria-hidden="true" className="relative text-crimson transition-transform duration-300 group-hover:translate-x-1">&#9654;</span>
          </Link>
        </div>

        {/* Quest log: real numbers from your data */}
        <div className="hero-rise mx-auto mt-6 hidden max-w-md flex-col gap-3 md:flex" style={{ animationDelay: "3.2s" }}>
          <div className="flex items-center justify-center gap-6 text-[11px] uppercase tracking-[0.22em] text-mist">
            <span>
              <span className="mr-1.5 text-crimson">&#9670;</span>
              <span className="text-ink">{stats.projects}</span> Projects Done
            </span>
            <span>
              <span className="mr-1.5 text-violet">&#9670;</span>
              <span className="text-ink">{stats.unlocked}</span> Achievements
            </span>
          </div>
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-lavender/80">
            <span className="shrink-0">XP</span>
            <span className="xp-track relative h-1.5 flex-1 overflow-hidden border border-crimson/40 bg-void/60">
              <span className="xp-fill absolute inset-y-0 left-0" style={{ "--xp": `${xp}%` } as CSSProperties} />
            </span>
            <span className="shrink-0 tabular-nums">{stats.unlocked}/{stats.total}</span>
          </div>
          <p className="text-[11px] italic tracking-[0.12em] text-lavender/70">
            <span className="not-italic text-crimson">Current quest:</span> {stats.quest}
          </p>
        </div>
      </div>

      {/* Sound toggle */}
      <button
        type="button"
        onClick={toggleSound}
        aria-pressed={sound}
        aria-label={sound ? "Turn sound off" : "Turn sound on"}
        className="absolute right-4 top-4 z-30 flex h-9 w-9 items-center justify-center border border-line bg-void/60 text-lavender backdrop-blur-sm transition-colors hover:border-crimson/70 hover:text-ink"
      >
        {sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>

      {/* Opening curtain: fades in from black */}
      <div aria-hidden="true" className="hero-curtain pointer-events-none absolute inset-0 z-40 bg-void" />

      {/* Portal flash while entering the portfolio */}
      {leaving && (
        <div
          aria-hidden="true"
          className="hero-portal pointer-events-none absolute inset-0 z-50"
          style={{ transformOrigin: `${SIGIL_CLICK.cx}% ${SIGIL_CLICK.cy * 1.6}%` }}
        />
      )}
    </section>
  );
}
