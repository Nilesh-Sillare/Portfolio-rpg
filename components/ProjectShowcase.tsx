"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useState, type CSSProperties, type MouseEvent } from "react";
import ProjectLogo from "@/components/ProjectLogo";
import SceneBackground, { DEFAULT_BG } from "@/components/SceneBackground";
import { statusStyles, type Project, type ProjectLink } from "@/data/projects";

const PALETTE = ["#ff2d55", "#a855f7", "#22d3ee", "#f59e0b", "#34d399"];
const NAV_H = "4rem"; // height of your navbar; use "0px" if it does not stay fixed at the top

const accentOf = (p: Project, i: number) => p.accent ?? PALETTE[i % PALETTE.length];

const goTo = (slug: string) =>
  document.getElementById(slug)?.scrollIntoView({ behavior: "smooth", block: "start" });

function LinkButton({ link, building }: { link: ProjectLink; building: boolean }) {
  const base = "inline-flex items-center rounded-lg px-7 py-3 text-sm font-medium";
  if (!link.url) {
    return (
      <span className={`${base} cursor-not-allowed border border-zinc-700 text-zinc-500`}>
        {link.primary && building ? "Currently building" : `${link.label} (coming soon)`}
      </span>
    );
  }
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} transition-colors focus-visible:outline-2 focus-visible:outline-rose-500 ${
        link.primary
          ? "bg-rose-600 text-white hover:bg-rose-500"
          : "border border-white/20 text-zinc-100 hover:border-rose-500"
      }`}
    >
      View {link.label} →
    </a>
  );
}

function DeviceFrame({ project, accent }: { project: Project; accent: string }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const live = project.links?.find((l) => l.primary && l.url)?.url;
  const address = live ? live.replace(/^https?:\/\//, "").replace(/\/$/, "") : project.name;

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: -py * 10, y: px * 12 });
  };

  const corner = "absolute h-5 w-5";

  return (
    <div onMouseMove={onMove} onMouseLeave={() => setTilt({ x: 0, y: 0 })} className="relative">
      <div
        className="relative transition-transform duration-300 ease-out motion-reduce:transform-none"
        style={{ transform: `perspective(1400px) rotateX(${tilt.x + 2}deg) rotateY(${tilt.y - 6}deg)` }}
      >
        <div
          className="overflow-hidden rounded-2xl border bg-[#0a0612]"
          style={{
            borderColor: `${accent}55`,
            boxShadow: `0 30px 80px -20px ${accent}66, 0 0 0 6px rgba(255,255,255,0.03)`,
          }}
        >
          <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
            <span className="ml-3 flex-1 truncate rounded-md bg-black/40 px-3 py-1 text-xs text-zinc-500">
              {address}
            </span>
          </div>
          <div className="relative aspect-[16/10] max-h-[40vh] w-full overflow-hidden">
            {project.screenshot ? (
              <img
                src={project.screenshot}
                alt={`${project.name} homescreen`}
                className="h-full w-full object-cover object-top"
              />
            ) : (
              <div
                className="absolute inset-0 p-6"
                style={{ background: `linear-gradient(160deg, ${accent}26, transparent 65%)` }}
              >
                <div className="h-3 w-1/3 rounded bg-white/10" />
                <div className="mt-3 h-2 w-1/2 rounded bg-white/5" />
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[0, 1, 2].map((k) => (
                    <div key={k} className="h-16 rounded-lg border border-white/10 bg-white/[0.03]" />
                  ))}
                </div>
                <span className="absolute inset-0 flex items-center justify-center text-xs uppercase tracking-[0.3em] text-zinc-500">
                  Homescreen coming soon
                </span>
              </div>
            )}
          </div>
        </div>
        <span aria-hidden className={`${corner} -left-2 -top-2 border-l-2 border-t-2`} style={{ borderColor: accent }} />
        <span aria-hidden className={`${corner} -right-2 -top-2 border-r-2 border-t-2`} style={{ borderColor: accent }} />
        <span aria-hidden className={`${corner} -bottom-2 -left-2 border-b-2 border-l-2`} style={{ borderColor: accent }} />
        <span aria-hidden className={`${corner} -bottom-2 -right-2 border-b-2 border-r-2`} style={{ borderColor: accent }} />
      </div>
    </div>
  );
}

export default function ProjectShowcase({
  projects,
  initialSlug,
}: {
  projects: Project[];
  initialSlug: string;
}) {
  const [active, setActive] = useState(initialSlug);

  useEffect(() => {
    // jump to the chosen project first, then start tracking which one is on screen
    document
      .getElementById(initialSlug)
      ?.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "start" });

    const sections = projects
      .map((p) => document.getElementById(p.slug))
      .filter((el): el is HTMLElement => !!el);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActive(e.target.id);
            window.history.replaceState(null, "", `/projects/${e.target.id}`);
          }
        }
      },
      { threshold: 0.6 },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [initialSlug, projects]);

  const activeIdx = Math.max(0, projects.findIndex((p) => p.slug === active));
  const activeProject = projects[activeIdx];
  const images = Array.from(new Set(projects.map((p) => p.background || DEFAULT_BG)));
  const bgIndex = images.indexOf(activeProject.background || DEFAULT_BG);

  return (
    <>
      {/* one-screen-per-project snapping, with the page scrollbar hidden while this page is open */}
      <style>{`html{scroll-snap-type:y mandatory;scrollbar-width:none}html::-webkit-scrollbar{display:none}`}</style>

      <SceneBackground images={images} index={bgIndex} accent={accentOf(activeProject, activeIdx)} />

      <nav
        aria-label="Projects"
        className="fixed right-5 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-end gap-4 md:flex"
      >
        {projects.map((p, i) => {
          const on = p.slug === active;
          const accent = accentOf(p, i);
          return (
            <a
              key={p.slug}
              href={`#${p.slug}`}
              aria-label={p.name}
              aria-current={on ? "true" : undefined}
              onClick={(e) => {
                e.preventDefault();
                goTo(p.slug);
              }}
              className="group flex items-center gap-3"
            >
              <span
                className={`text-xs tracking-widest transition-opacity ${
                  on ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
                style={{ color: on ? accent : "#a1a1aa" }}
              >
                {p.name}
              </span>
              <span
                className="block rounded-full transition-all duration-300"
                style={{ width: 8, height: on ? 28 : 8, background: on ? accent : "#3f3f46" }}
              />
            </a>
          );
        })}
      </nav>

      <main className="relative z-10">
        {projects.map((p, i) => {
          const accent = accentOf(p, i);
          const on = p.slug === active;
          const building = p.status === "In development";
          const extra = (p.sections ?? []).filter((s) => s.items.length > 0);
          const columns = [
            { title: "Tech Stack", items: p.tech, bullet: "chips" as const },
            ...extra.map((s) => ({ ...s, bullet: "check" as const })),
          ];

          return (
            <section
              key={p.slug}
              id={p.slug}
              className="relative flex snap-start snap-always items-center overflow-hidden"
              style={{ minHeight: `calc(100svh - ${NAV_H})`, scrollMarginTop: NAV_H }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute right-10 top-4 select-none font-serif text-[12rem] leading-none"
                style={{ color: "transparent", WebkitTextStroke: `1px ${accent}33` }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <div
                className={`relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 transition-all duration-700 ease-out motion-reduce:transition-none sm:px-10 lg:px-14 ${
                  on ? "translate-y-0 opacity-100" : "translate-y-6 opacity-30 motion-reduce:translate-y-0"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Link href="/projects" className="text-sm text-rose-500 hover:text-rose-400">
                    ← Back to Projects
                  </Link>
                  <span className="text-xs tracking-[0.3em] text-zinc-500">
                    {String(i + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
                  </span>
                </div>

                <div className="grid items-center gap-12 lg:grid-cols-2">
                  <div>
                    <div className="mb-6 flex items-center gap-4">
                      <ProjectLogo icon={p.icon} name={p.name} accent={accent} size="md" />
                      <div className="flex flex-wrap gap-2">
                        <span className={`rounded-full border px-3 py-1 text-xs ${statusStyles[p.status]}`}>
                          {p.status}
                        </span>
                        {p.category && (
                          <span
                            className="rounded-full border px-3 py-1 text-xs"
                            style={{ color: accent, borderColor: `${accent}66`, background: `${accent}14` }}
                          >
                            {p.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <h2
                      className="font-serif text-5xl text-zinc-50 sm:text-6xl"
                      style={{ textShadow: `0 0 40px ${accent}55` }}
                    >
                      {p.name}
                    </h2>
                    <p className="mt-4 text-xl text-zinc-200">{p.tagline}</p>
                    <p className="mt-5 max-w-xl text-lg leading-relaxed text-zinc-400">{p.description}</p>
                    {p.links && p.links.length > 0 && (
                      <div className="mt-8 flex flex-wrap gap-4">
                        {p.links.map((l) => (
                          <LinkButton key={l.label} link={l} building={building} />
                        ))}
                      </div>
                    )}
                  </div>

                  <DeviceFrame project={p} accent={accent} />
                </div>

                <div
                  style={{ "--cols": columns.length } as CSSProperties}
                  className="grid gap-8 border-t border-white/10 pt-8 md:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]"
                >
                  {columns.map((c, j) => (
                    <div key={c.title} className={j > 0 ? "md:border-l md:border-white/10 md:pl-8" : ""}>
                      <h3 className="mb-4 text-lg font-medium text-zinc-200">{c.title}</h3>
                      {c.bullet === "chips" ? (
                        <div className="flex flex-wrap gap-2">
                          {c.items.map((item) => (
                            <span
                              key={item}
                              className="rounded-lg border px-3 py-1.5 text-sm text-zinc-200"
                              style={{ borderColor: `${accent}44`, background: `${accent}12` }}
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <ul className="space-y-3 text-zinc-300">
                          {c.items.map((item, k) => (
                            <li key={k} className="flex gap-3">
                              <span className="text-rose-500">✓</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </main>
    </>
  );
}