"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import ProjectEmblem from "@/components/ProjectEmblem";
import { statusStyles, type Project } from "@/data/projects";

const PALETTE = ["#ff2d55", "#a855f7", "#22d3ee", "#f59e0b", "#34d399"];

type Props = {
  projects: Project[];
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  visible?: { base?: number; sm?: number; lg?: number }; // cards shown per breakpoint
  maxTech?: number; // tech chips shown before "+N"
};

function getMetrics(track: HTMLElement) {
  const card = track.firstElementChild as HTMLElement | null;
  const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
  const step = (card?.offsetWidth ?? 1) + gap;
  const maxScroll = track.scrollWidth - track.clientWidth;
  return { gap, step, maxScroll };
}

export default function ProjectsCarousel({
  projects,
  title = "The Hall of Creations",
  subtitle = "Each project is a step in my journey of learning, building and growing.",
  eyebrow = "Projects",
  visible = {},
  maxTech = 5,
}: Props) {
  const v = { base: 1, sm: 2, lg: 3, ...visible };
  const trackRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ atStart: true, atEnd: true, active: 0, pages: 1, visible: 1 });

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const { gap, step, maxScroll } = getMetrics(track);
    const pages = Math.max(1, Math.round(maxScroll / step) + 1);
    const shown = Math.max(1, Math.round((track.clientWidth + gap) / step));
    const atStart = track.scrollLeft <= 4;
    const atEnd = track.scrollLeft >= maxScroll - 4;
    const active = atEnd ? pages - 1 : Math.min(pages - 1, Math.round(track.scrollLeft / step));
    setView({ atStart, atEnd, active, pages, visible: shown });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [measure, projects.length]);

  const scrollToPage = (i: number) => {
    const track = trackRef.current;
    if (track) track.scrollTo({ left: i * getMetrics(track).step, behavior: "smooth" });
  };

  const scrollByCard = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (track) track.scrollBy({ left: dir * getMetrics(track).step, behavior: "smooth" });
  };

  const spotlight = (e: MouseEvent<HTMLAnchorElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  const canScroll = !(view.atStart && view.atEnd);
  const first = view.active + 1;
  const last = Math.min(view.active + view.visible, projects.length);

  const arrow =
    "flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-lg text-zinc-200 transition-colors hover:border-rose-500 hover:text-rose-400 focus-visible:outline-2 focus-visible:outline-rose-500 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/15 disabled:hover:text-zinc-200";

  return (
    <section>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          {eyebrow && (
            <p className="mb-3 flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-zinc-500">
              <span className="h-px w-8 bg-rose-600" />
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-4xl uppercase tracking-wide text-zinc-50 sm:text-5xl">{title}</h1>
          {subtitle && <p className="mt-4 max-w-2xl text-lg text-zinc-400">{subtitle}</p>}
        </div>
        {canScroll && (
          <div className="flex items-center gap-4">
            <span className="text-sm tabular-nums text-zinc-500">
              {first}–{last} of {projects.length}
            </span>
            <button type="button" aria-label="Previous project" disabled={view.atStart} onClick={() => scrollByCard(-1)} className={arrow}>
              ←
            </button>
            <button type="button" aria-label="Next project" disabled={view.atEnd} onClick={() => scrollByCard(1)} className={arrow}>
              →
            </button>
          </div>
        )}
      </div>

      <div
        ref={trackRef}
        onScroll={measure}
        style={
          {
            "--gap": "2rem",
            "--v-base": v.base,
            "--v-sm": v.sm,
            "--v-lg": v.lg,
            "--card-w": "calc((100% - (var(--visible) - 1) * var(--gap)) / var(--visible))",
            gap: "var(--gap)",
          } as CSSProperties
        }
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth px-1 py-3 [--visible:var(--v-base)] sm:[--visible:var(--v-sm)] lg:[--visible:var(--v-lg)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {projects.map((p, i) => {
          const accent = p.accent ?? PALETTE[i % PALETTE.length];
          const extra = p.tech.length - maxTech;
          return (
            <Link
              key={p.slug}
              href={`/projects/${p.slug}`}
              onMouseMove={spotlight}
              style={{
                flex: "0 0 var(--card-w)",
                borderColor: `${accent}b3`, // always-visible border in the project's colour
                boxShadow: `0 0 22px ${accent}26`,
              }}
              className="pc-card group relative flex snap-start snap-always flex-col overflow-hidden rounded-3xl border-2 bg-[#0d0817] transition-transform duration-300 hover:-translate-y-1 motion-reduce:transform-none"
            >
              <div className="relative">
                <div
                  className="relative aspect-[16/10] overflow-hidden"
                  style={{
                    background: `radial-gradient(120% 90% at 20% 0%, ${accent}55, transparent 60%), linear-gradient(160deg, #1a0d2e, #0b0712)`,
                  }}
                >
                  {p.screenshot ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.screenshot}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ProjectEmblem icon={p.icon} name={p.name} accent={accent} size={96} />
                    </div>
                  )}
                  <span
                    className={`absolute left-5 top-5 rounded-full border bg-[#0b0712]/90 px-3 py-1 text-xs ${statusStyles[p.status]}`}
                  >
                    {p.status}
                  </span>
                </div>

                {/* Animated logo: straddles the edge between the screenshot and the text */}
                {p.screenshot && (
                  <ProjectEmblem
                    icon={p.icon}
                    name={p.name}
                    accent={accent}
                    size={80}
                    className="absolute bottom-0 right-6 z-10 translate-y-1/2"
                  />
                )}
              </div>

              <div className="flex flex-1 flex-col px-7 pb-7 pt-8">
                <h2 className="text-2xl font-semibold text-zinc-50">{p.name}</h2>
                {p.category ? (
                  <span
                    className="mt-3 w-fit rounded-full border px-3 py-1 text-xs"
                    style={{ color: accent, borderColor: `${accent}66`, background: `${accent}14` }}
                  >
                    {p.category}
                  </span>
                ) : (
                  <p className="mt-1 text-sm text-zinc-500">{p.tagline}</p>
                )}
                <p className="mt-4 text-base leading-relaxed text-zinc-400">{p.cardDescription}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {p.tech.slice(0, maxTech).map((t) => (
                    <span key={t} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                      {t}
                    </span>
                  ))}
                  {extra > 0 && (
                    <span className="rounded-lg border border-white/10 px-3 py-1 text-xs text-zinc-500">+{extra}</span>
                  )}
                </div>
                <span className="mt-auto pt-8 text-base font-medium" style={{ color: accent }}>
                  View Project{" "}
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none">
                    →
                  </span>
                </span>
              </div>

              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(450px circle at var(--mx, 50%) var(--my, 0%), ${accent}2e, transparent 45%)`,
                }}
              />
              {/* brighter border on hover */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-3xl border-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ borderColor: accent, boxShadow: `0 0 28px ${accent}59` }}
              />
            </Link>
          );
        })}
      </div>

      {canScroll && view.pages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: view.pages }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to position ${i + 1}`}
              onClick={() => scrollToPage(i)}
              className={`h-2 rounded-full transition-all ${
                i === view.active ? "w-8 bg-rose-500" : "w-2 bg-zinc-700 hover:bg-zinc-500"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}