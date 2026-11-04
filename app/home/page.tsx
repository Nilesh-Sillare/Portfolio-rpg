import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight, Mail } from "lucide-react";
import { home } from "@/data/home";

// ---- Lightning tuning knobs -----------------------------------------
// left = % across the section, height = % of section height,
// delay/duration in seconds (different durations keep bolts out of sync).
// Kept in the open sky: left of the warrior's head and over the far right.
const BOLTS = [
  { left: 50, height: 38, delay: 1.0, duration: 7, flip: false, variant: 0 },
  { left: 60, height: 32, delay: 3.8, duration: 10, flip: true, variant: 1 },
  { left: 91, height: 24, delay: 6.2, duration: 12, flip: false, variant: 1 },
];
const BOLT_PATHS = [
  {
    main: "M55 0 L46 32 L58 36 L40 78 L52 82 L34 126 L44 130 L30 170 L36 200",
    branch: "M40 78 L24 96 L30 100 L16 128 M34 126 L48 146 L42 150 L54 176",
  },
  {
    main: "M45 0 L56 30 L47 34 L62 74 L52 78 L66 120 L58 124 L70 160 L64 200",
    branch: "M62 74 L78 90 L72 94 L86 118 M66 120 L52 140 L58 144 L46 172",
  },
];
// ---------------------------------------------------------------------

// Fixed values (no randomness) so server and browser render the same thing
const embers = Array.from({ length: 18 }, (_, i) => ({
  left: 40 + ((i * 29 + 7) % 58),
  size: 2 + (i % 3),
  delay: (i * 1.7) % 11,
  duration: 8 + ((i * 3) % 7),
  drift: ((i * 13) % 60) - 30,
  violet: i % 3 === 0,
}));

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function MailIcon() {
  return <Mail className="h-6 w-6" aria-hidden="true" />;
}

const socials = [
  { label: "GitHub", href: home.socials.github, Icon: GithubIcon },
  { label: "LinkedIn", href: home.socials.linkedin, Icon: LinkedinIcon },
  { label: "Email", href: home.socials.email, Icon: MailIcon },
];

export default function HomePage() {
  return (
    <section className="relative isolate flex min-h-[calc(100vh-4rem)] items-center overflow-hidden bg-[#050509]">
      {/* Artwork, anchored right, with a slow breathing zoom */}
      <div
        aria-hidden="true"
        className="hp-drift absolute inset-0 -z-20 bg-cover bg-right bg-no-repeat"
        style={{ backgroundImage: `url('${home.heroImage}')` }}
      />

      {/* Stormy sky: soft violet pulse + big flash */}
      <div
        aria-hidden="true"
        className="hp-sky-pulse pointer-events-none absolute inset-0"
        style={{ zIndex: -16 }}
      />
      <div
        aria-hidden="true"
        className="hp-sky-flash pointer-events-none absolute inset-0"
        style={{ zIndex: -15 }}
      />

      {/* Fade into the dark on the left */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-[#050509] via-[#050509]/85 to-transparent md:via-[#050509]/60 md:to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-[#050509] to-transparent"
      />

      {/* Rising embers */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ zIndex: -7 }}
      >
        {embers.map((e, i) => (
          <span
            key={i}
            className={`hp-ember ${e.violet ? "hp-ember-violet" : ""}`}
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

      {/* Lightning: glowing forked bolts that strike, flicker and fade out */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ zIndex: -5 }}
      >
        {BOLTS.map((b, i) => {
          const p = BOLT_PATHS[b.variant];
          return (
            <div
              key={i}
              className="hp-bolt absolute top-0"
              style={
                {
                  left: `${b.left}%`,
                  height: `${b.height}%`,
                  width: "auto",
                  aspectRatio: "1 / 2",
                  "--dur": `${b.duration}s`,
                  "--delay": `${b.delay}s`,
                } as CSSProperties
              }
            >
              {/* Light the bolt throws on the clouds */}
              <div className="hp-halo absolute -left-[120%] -top-[20%] h-[90%] w-[340%]" />
              {/* The bolt itself, fading out toward its tip */}
              <div
                className="absolute inset-0"
                style={{
                  transform: b.flip ? "scaleX(-1)" : undefined,
                  WebkitMaskImage: "linear-gradient(to bottom, #000 55%, transparent 100%)",
                  maskImage: "linear-gradient(to bottom, #000 55%, transparent 100%)",
                }}
              >
                <svg
                  viewBox="0 0 100 200"
                  className="hp-bolt-svg h-full w-full overflow-visible"
                  fill="none"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                >
                  {/* wide violet glow */}
                  <path className="hp-stroke" pathLength={1} d={p.main} stroke="#9b5cff" strokeWidth="9" opacity="0.55" />
                  <path className="hp-stroke" pathLength={1} d={p.branch} stroke="#9b5cff" strokeWidth="6" opacity="0.45" />
                  {/* lavender body */}
                  <path className="hp-stroke" pathLength={1} d={p.main} stroke="#b9a5e8" strokeWidth="3.6" />
                  <path className="hp-stroke" pathLength={1} d={p.branch} stroke="#b9a5e8" strokeWidth="2.2" />
                  {/* white-hot core */}
                  <path className="hp-stroke" pathLength={1} d={p.main} stroke="#ffffff" strokeWidth="1.4" />
                  <path className="hp-stroke" pathLength={1} d={p.branch} stroke="#ffffff" strokeWidth="0.9" />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mx-auto w-full max-w-6xl px-8 py-16 md:px-12">
        {/* No width cap here, so the name can stay on one line */}
        <div className="hp-rise">
          <p
            className="text-lg tracking-[0.35em] text-[#b9a5e8]"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            {home.eyebrow}
          </p>

          <h1
            className="mt-3 whitespace-nowrap text-xl leading-tight tracking-[0.1em] text-[#f4f0fa] min-[400px]:text-2xl sm:text-4xl lg:text-5xl xl:text-6xl"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            <span className="bg-gradient-to-r from-[#f4f0fa] to-[#9b5cff] bg-clip-text text-transparent">
              {home.titleLight}
            </span>{" "}
            <span className="hp-title-glow text-[#ff244f]">{home.titleAccent}</span>
          </h1>

          <p className="mt-6 text-lg text-[#f4f0fa]">{home.tagline}</p>

          <p className="mt-6 max-w-md leading-relaxed text-[#a39bb5]">{home.intro}</p>

          <div className="mt-10 flex max-w-xl flex-wrap items-center gap-x-10 gap-y-6">
            {/* Explore My Work: pulsing glow, light sweep, lift on hover */}
            <div className="group relative">
              <span
                aria-hidden="true"
                className="hp-btn-halo absolute -inset-2 rounded-xl bg-[#ff244f]/40 blur-xl"
              />
              <Link
                href={home.primaryCta.href}
                className="hp-btn relative inline-flex items-center gap-3 overflow-hidden rounded-md border border-[#ff244f] bg-[#12060e] px-8 py-4 text-sm font-medium uppercase tracking-[0.2em] text-[#f4f0fa] transition-transform duration-300 hover:-translate-y-0.5 hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9b5cff]"
              >
                <span
                  aria-hidden="true"
                  className="hp-sweep pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                />
                <span className="relative">{home.primaryCta.label}</span>
                <ArrowRight
                  className="hp-arrow relative h-4 w-4 text-[#ff244f]"
                  aria-hidden="true"
                />
              </Link>
            </div>

            <a
              href={home.secondaryCta.href}
              className="border-b border-[#9b5cff]/60 pb-1 text-sm font-medium uppercase tracking-[0.2em] text-[#9b8cff] transition hover:border-[#9b5cff] hover:text-[#b9a5e8] hover:[text-shadow:0_0_14px_rgba(155,92,255,0.8)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9b5cff]"
            >
              {home.secondaryCta.label}
            </a>
          </div>

          {/* Bigger social buttons with glow */}
          <ul className="mt-14 flex max-w-xl flex-wrap items-center gap-x-8 gap-y-5 border-t border-[#9b5cff]/25 pt-8">
            {socials.map(({ label, href, Icon }, i) => (
              <li
                key={label}
                className="hp-float"
                style={{ "--d": `${i * 0.6}s` } as CSSProperties}
              >
                <a
                  href={href}
                  className="group flex items-center gap-3.5 text-base text-[#c9c0dc] transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9b5cff]"
                >
                  <span className="hp-social-icon flex h-12 w-12 items-center justify-center rounded-full border border-[#9b5cff]/50 bg-[#9b5cff]/10 text-[#b9a5e8] transition duration-300 group-hover:scale-110 group-hover:border-[#ff244f] group-hover:bg-[#ff244f]/15 group-hover:text-white group-hover:shadow-[0_0_22px_rgba(255,36,79,0.7)]">
                    <Icon />
                  </span>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <style>{`
        @keyframes hp-rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        .hp-rise { animation: hp-rise 0.9s ease-out both; }

        /* Slow breathing zoom on the artwork */
        @keyframes hp-drift { from { transform: scale(1); } to { transform: scale(1.07); } }
        .hp-drift { animation: hp-drift 22s ease-in-out infinite alternate; transform-origin: 70% 30%; }

        /* Ambient storm glow that breathes */
        @keyframes hp-pulse { 0%,100% { opacity: .25; } 50% { opacity: .6; } }
        .hp-sky-pulse {
          mix-blend-mode: screen;
          background: radial-gradient(ellipse 60% 45% at 75% 0%, rgba(155,92,255,0.35), transparent 70%);
          animation: hp-pulse 5s ease-in-out infinite;
        }

        /* Whole-sky flash with a quick double flicker */
        @keyframes hp-flash {
          0%   { opacity: 0; }
          1.5% { opacity: 1; }
          3%   { opacity: .15; }
          4.5% { opacity: .9; }
          7%   { opacity: .1; }
          10%  { opacity: 0; }
          100% { opacity: 0; }
        }
        .hp-sky-flash {
          opacity: 0;
          mix-blend-mode: screen;
          background:
            radial-gradient(ellipse 70% 55% at 62% 0%, rgba(185,165,232,0.6), rgba(155,92,255,0.25) 40%, transparent 72%),
            radial-gradient(ellipse 40% 30% at 90% 8%, rgba(255,36,79,0.18), transparent 70%);
          animation: hp-flash 7s linear 1s infinite;
        }

        /* Bolts: wrapper flickers, stroke draws in like a strike */
        .hp-bolt {
          opacity: 0;
          animation: hp-flash var(--dur, 8s) linear var(--delay, 0s) infinite;
        }
        .hp-bolt-svg {
          filter: drop-shadow(0 0 4px #b9a5e8) drop-shadow(0 0 10px #9b5cff) drop-shadow(0 0 24px #9b5cff);
        }
        @keyframes hp-draw {
          0%   { stroke-dashoffset: 1; }
          2%   { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 0; }
        }
        .hp-stroke {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: hp-draw var(--dur, 8s) linear var(--delay, 0s) infinite;
        }
        .hp-halo {
          background: radial-gradient(ellipse at 50% 20%, rgba(185,165,232,0.55), rgba(155,92,255,0.22) 40%, transparent 70%);
          mix-blend-mode: screen;
        }

        /* Explore My Work button */
        @keyframes hp-btn-glow {
          0%,100% { box-shadow: 0 0 14px rgba(255,36,79,0.45), 0 0 34px rgba(255,36,79,0.25), inset 0 0 14px rgba(255,36,79,0.18); }
          50%     { box-shadow: 0 0 26px rgba(255,36,79,0.85), 0 0 62px rgba(255,36,79,0.45), inset 0 0 22px rgba(255,36,79,0.32); }
        }
        .hp-btn { animation: hp-btn-glow 2.6s ease-in-out infinite; }
        @keyframes hp-btn-halo { 0%,100% { opacity: .35; transform: scale(.97); } 50% { opacity: .9; transform: scale(1.06); } }
        .hp-btn-halo { animation: hp-btn-halo 2.6s ease-in-out infinite; }
        @keyframes hp-sweep { 0% { left: -45%; } 55%,100% { left: 130%; } }
        .hp-sweep { animation: hp-sweep 3.6s ease-in-out infinite; }
        @keyframes hp-nudge { 0%,100% { transform: translateX(0); } 50% { transform: translateX(5px); } }
        .hp-arrow { animation: hp-nudge 1.4s ease-in-out infinite; }

        /* Title accent glow */
        @keyframes hp-title { 0%,100% { text-shadow: 0 0 10px rgba(255,36,79,.35); } 50% { text-shadow: 0 0 26px rgba(255,36,79,.9), 0 0 50px rgba(255,36,79,.4); } }
        .hp-title-glow { animation: hp-title 3.2s ease-in-out infinite; }

        /* Social icons: gentle float + glow breathing */
        @keyframes hp-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        .hp-float { animation: hp-float 4s ease-in-out var(--d, 0s) infinite; }
        @keyframes hp-icon { 0%,100% { box-shadow: 0 0 6px rgba(155,92,255,.25); } 50% { box-shadow: 0 0 18px rgba(155,92,255,.65); } }
        .hp-social-icon { animation: hp-icon 3s ease-in-out infinite; }

        /* Embers */
        @keyframes hp-ember {
          0%   { transform: translate(0, 0); opacity: 0; }
          10%  { opacity: .9; }
          100% { transform: translate(var(--dx, 0px), -80vh); opacity: 0; }
        }
        .hp-ember {
          position: absolute; bottom: -10px; border-radius: 9999px;
          background: #ff244f; box-shadow: 0 0 8px 2px rgba(255,36,79,.7);
          opacity: 0; animation: hp-ember var(--dur, 10s) linear var(--delay, 0s) infinite;
        }
        .hp-ember-violet { background: #9b5cff; box-shadow: 0 0 8px 2px rgba(155,92,255,.7); }

        @media (prefers-reduced-motion: reduce) {
          .hp-rise, .hp-drift, .hp-sky-pulse, .hp-sky-flash, .hp-bolt, .hp-stroke,
          .hp-btn, .hp-btn-halo, .hp-sweep, .hp-arrow, .hp-title-glow,
          .hp-float, .hp-social-icon, .hp-ember { animation: none; }
          .hp-sky-flash, .hp-bolt, .hp-ember { opacity: 0; }
          .hp-stroke { stroke-dashoffset: 0; }
        }
      `}</style>
    </section>
  );
}