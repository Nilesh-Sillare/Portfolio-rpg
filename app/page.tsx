import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { landing } from "@/data/site";
import Dialogue from "@/components/Dialogue";

// ---- Tuning knobs (all in % of the image width) ---------------------
const BG = "/landing.png";
const SIGIL_IMG_SRC = "/sigil.png"; // your sigil artwork (public/sigil.png)
const RING = { cx: 77.9, cy: 20.0, r: 14.0 }; // rune ring: centre + outer radius
const SIGIL = { cx: 77.9, cy: 18.2, size: 13 }; // red glow behind the sigil
const SIGIL_IMG = { cx: 77.9, cy: 19.0, size: 14 }; // sigil.png placement + size
const MOON = { cx: 45.2, cy: 11.4, size: 9 }; // moon glow
const SIGIL_CLICK = { cx: 77.9, cy: 19.0, size: 11 }; // clickable area over the sigil
// ---------------------------------------------------------------------

// Fixed values (no randomness) so server and browser render the same thing
const embers = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  size: 2 + (i % 3),
  delay: (i * 1.9) % 13,
  duration: 9 + ((i * 5) % 8),
  drift: ((i * 17) % 50) - 25,
  violet: i % 4 === 0,
}));

// Ring-shaped cut-out, with a gap where the sigil's spike passes through
const ringMask =
  "radial-gradient(circle closest-side, transparent 66%, #000 70%, #000 96%, transparent 100%)";
const bandMask =
  "linear-gradient(to right, #000 0%, #000 41%, transparent 45%, transparent 55%, #000 59%, #000 100%)";

export default function Home() {
  return (
    <section
      className="landing relative isolate flex h-[calc(100svh-4rem)] min-h-[560px] items-end justify-center overflow-hidden md:justify-end"
      style={{ containerType: "size" }}
    >
      {/* Stage: always 16:9 and always covers the section */}
      <div
        className="absolute left-1/2 top-1/2 -z-20 aspect-video -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "max(100cqw, calc(100cqh * 16 / 9))",
          containerType: "inline-size",
        }}
      >
        <div className="zoom-drift absolute inset-0">
          {/* Background artwork */}
          <Image
            src={BG}
            alt=""
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover"
          />

          {/* Moon glow */}
          <div
            aria-hidden="true"
            className="moon-glow absolute rounded-full"
            style={{
              left: `${MOON.cx - MOON.size / 2}cqw`,
              top: `${MOON.cy - MOON.size / 2}cqw`,
              width: `${MOON.size}cqw`,
              height: `${MOON.size}cqw`,
              background:
                "radial-gradient(circle, rgba(185,165,232,0.55), transparent 65%)",
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
              background:
                "radial-gradient(circle, rgba(255,36,79,0.6), transparent 65%)",
            }}
          />

          {/* Rotating runes: a rotated copy of the artwork, cut to the ring */}
          <div
            aria-hidden="true"
            className="absolute"
            style={{
              left: `${RING.cx - RING.r}cqw`,
              top: `${RING.cy - RING.r}cqw`,
              width: `${RING.r * 2}cqw`,
              height: `${RING.r * 2}cqw`,
              WebkitMaskImage: `${ringMask}, ${bandMask}`,
              maskImage: `${ringMask}, ${bandMask}`,
              WebkitMaskComposite: "source-in",
              maskComposite: "intersect",
            }}
          >
            <div
              className="rune-spin h-full w-full"
              style={{
                backgroundImage: `url(${BG})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "100cqw auto",
                backgroundPosition: `${RING.r - RING.cx}cqw ${RING.r - RING.cy}cqw`,
              }}
            />
          </div>

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
            <Image
              src={SIGIL_IMG_SRC}
              alt=""
              fill
              unoptimized
              sizes="20vw"
              className="sigil-img object-contain"
            />
          </div>
        </div>
      </div>

      {/* Drifting embers */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
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

      {/* Soft shade so the text stays readable */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-void/80 via-transparent to-void/20"
      />

      {/* Click layer: same stage geometry, sits above the overlays */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 aspect-video -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "max(100cqw, calc(100cqh * 16 / 9))",
          containerType: "inline-size",
        }}
      >
        <Link
          href="/home"
          aria-label="Enter the portfolio"
          className="sigil-link pointer-events-auto absolute block cursor-pointer rounded-full transition-transform duration-300 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet"
          style={{
            left: `${SIGIL_CLICK.cx - SIGIL_CLICK.size / 2}cqw`,
            top: `${SIGIL_CLICK.cy - SIGIL_CLICK.size / 2}cqw`,
            width: `${SIGIL_CLICK.size}cqw`,
            height: `${SIGIL_CLICK.size}cqw`,
          }}
        />
      </div>

      {/* RPG dialogue box (typewriter intro, portrait, skip) */}
      <Dialogue />

      {/* Name + tagline */}
      <div className="rise-in w-full px-5 pb-56 text-center md:w-[46%] md:pb-20 md:pr-8 lg:pr-12">
        <h1
          className="font-display text-2xl uppercase tracking-[0.28em] text-[#f0dcf7] sm:text-3xl lg:text-[48px]"
          style={{ textShadow: "0 0 24px rgba(255,36,79,0.45)" }}
        >
          {landing.name}
        </h1>

        <p className="mt-6 flex items-center justify-center gap-3 text-[11px] tracking-[0.35em] text-lavender sm:gap-4 sm:text-xs">
          <span className="hidden h-px w-10 bg-gradient-to-r from-transparent to-lavender/50 sm:block" />
          {landing.words.map((word, i) => (
            <span key={word} className="flex items-center gap-3 sm:gap-4">
              {i > 0 && <span className="text-lavender/60">/</span>}
              <span>{word.toUpperCase()}</span>
            </span>
          ))}
          <span className="hidden h-px w-10 bg-gradient-to-l from-transparent to-lavender/50 sm:block" />
        </p>

        <div
          aria-hidden="true"
          className="mx-auto mt-6 flex max-w-xs items-center gap-3"
        >
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-crimson/70" />
          <span className="h-2.5 w-2.5 rotate-45 border border-crimson bg-crimson/30 shadow-[0_0_10px_rgba(255,36,79,0.8)]" />
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-crimson/70" />
        </div>
      </div>
    </section>
  );
}