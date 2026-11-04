"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Award,
  BadgeCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Code2,
  Crown,
  Database,
  ExternalLink,
  LayoutGrid,
  Link2,
  Lock,
  PenTool,
  RotateCw,
  Star,
  X,
  ZoomIn,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  categories,
  credentials,
  plannedCredentials,
  type Credential,
  type CredentialCategory,
  type CredentialRarity,
} from "@/data/credentials";
import CertificateCarousel from "@/components/CertificateCarousel";

type Filter = "all" | CredentialCategory;
type Sort = "newest" | "oldest" | "rarity";

const ICONS: Record<Filter, LucideIcon> = {
  all: LayoutGrid,
  development: Code2,
  database: Database,
  cloud: Cloud,
  design: PenTool,
  others: Star,
};

// One colour per category (sidebar, card borders, big panel)
const ACCENTS: Record<Filter, string> = {
  all: "#ff244f",
  development: "#ff244f",
  database: "#9b5cff",
  cloud: "#5aa9ff",
  design: "#d66bff",
  others: "#d4a843",
};

const RARITY: Record<
  CredentialRarity,
  { label: string; color: string; rank: number }
> = {
  common: { label: "COMMON", color: "#9aa3b8", rank: 1 },
  rare: { label: "RARE", color: "#3dd6d0", rank: 2 },
  epic: { label: "EPIC", color: "#c04bff", rank: 3 },
  legendary: { label: "LEGENDARY", color: "#ffcc4d", rank: 4 },
};

const rarityOf = (c: Credential) => RARITY[c.rarity ?? "common"];

const labelOf = (id: CredentialCategory) =>
  categories.find((c) => c.id === id)?.label ?? "";

const SORTS: { id: Sort; label: string }[] = [
  { id: "newest", label: "NEWEST" },
  { id: "oldest", label: "OLDEST" },
  { id: "rarity", label: "RARITY" },
];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Styles and animations for this page only (animations respect reduced motion)
const css = `
@property --cred-ang{syntax:"<angle>";inherits:false;initial-value:0deg}

@media (prefers-reduced-motion: no-preference){
  @keyframes cred-rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
  @keyframes cred-swap{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:none}}
  @keyframes cred-spin{to{transform:rotate(360deg)}}
  @keyframes cred-sweep{from{transform:translateX(-120%)}to{transform:translateX(120%)}}
  @keyframes cred-orbit{to{transform:rotate(360deg)}}
  @keyframes cred-pulse{0%{transform:scale(.55);opacity:.75}100%{transform:scale(1.55);opacity:0}}
  @keyframes cred-pop{0%{transform:scale(1)}35%{transform:scale(1.2)}100%{transform:scale(1)}}
  @keyframes cred-glint{from{transform:translateX(-130%)}to{transform:translateX(130%)}}
  @keyframes cred-spark{0%{transform:translateY(0) scale(.6);opacity:0}15%{opacity:1}100%{transform:translateY(-80px) scale(1);opacity:0}}
  @keyframes cred-border{to{--cred-ang:360deg}}

  .cred-rise{animation:cred-rise .7s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(var(--i,0) * 70ms)}
  .cred-swap{animation:cred-swap .55s cubic-bezier(.2,.7,.2,1) both}
  .cred-spin{animation:cred-spin 48s linear infinite}
  .cred-sweep::after{
    content:"";position:absolute;inset:0;
    background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.16) 50%,transparent 65%);
    animation:cred-sweep 1.1s .3s ease-out both;
  }

  /* rarity effects */
  .cred-orbit{animation:cred-orbit 9s linear infinite}
  .cred-pulse{animation:cred-pulse 2.6s ease-out infinite}
  .cred-spark{animation:cred-spark 2.8s ease-in infinite}
  .cred-gold{animation:cred-border 5s linear infinite}

  /* a card arrives at the front: icon pops, light sweeps the hero */
  .cred-item[data-active="true"] .cred-core{animation:cred-pop .9s cubic-bezier(.2,.7,.2,1) both}
  .cred-item[data-active="true"] .cred-hero::after{animation:cred-glint 1.1s .15s ease-out both}

  /* hover shine */
  .cred-plate:hover .cred-plate-in::after{transform:translateX(130%);transition:transform .9s ease}

  /* tilt + flip */
  .cred-tilt{transition:transform .25s ease-out}
  .cred-front{transition:transform .7s cubic-bezier(.2,.7,.2,1)}
  .cred-back{transition:transform .7s cubic-bezier(.2,.7,.2,1),visibility 0s .35s}
  .cred-item[data-flipped="true"] .cred-back{transition-delay:0s,0s}
}

/* animations only run on the front card and its neighbours */
.cred-gate{animation-play-state:paused}
.car-slide[data-near="true"] .cred-gate{animation-play-state:running}

/* ---- Carousel card ---- */
.cred-item{
  --accent:#9b5cff;position:relative;width:100%;height:100%;
  filter:drop-shadow(0 0 8px color-mix(in srgb,var(--accent) 28%,transparent));
  transition:filter .35s ease;
}
.cred-item[data-active="true"]{
  filter:drop-shadow(0 0 18px color-mix(in srgb,var(--accent) 55%,transparent));
}

.cred-tilt{
  position:absolute;inset:0;
  transform:perspective(900px) rotateX(calc(var(--rx,0) * 1deg)) rotateY(calc(var(--ry,0) * 1deg));
}

/* the two faces of the flip card */
.cred-face{position:absolute;inset:0;backface-visibility:hidden}
.cred-front{transform:perspective(1000px) rotateY(0deg)}
.cred-back{transform:perspective(1000px) rotateY(180deg);visibility:hidden}
.cred-item[data-flipped="true"] .cred-front{transform:perspective(1000px) rotateY(-180deg)}
.cred-item[data-flipped="true"] .cred-back{transform:perspective(1000px) rotateY(0deg);visibility:visible}

/* chamfered shape + glowing border in the card's own colour */
.cred-plate,.cred-plate-in{
  --cut:12px;
  clip-path:polygon(var(--cut) 0,calc(100% - var(--cut)) 0,100% var(--cut),100% calc(100% - var(--cut)),calc(100% - var(--cut)) 100%,var(--cut) 100%,0 calc(100% - var(--cut)),0 var(--cut));
}
.cred-plate{
  display:block;width:100%;height:100%;padding:1.5px;text-align:left;cursor:pointer;
  background:color-mix(in srgb,var(--accent) 70%,transparent);
  transition:background .3s;
}
.cred-plate:hover,
.cred-item[data-active="true"] .cred-plate{background:var(--accent)}
.cred-item .cred-plate.cred-gold{
  background:conic-gradient(from var(--cred-ang),#ffcc4d,#8a6212,#ffe08a,#8a6212,#ffcc4d);
}
.cred-item.cred-locked .cred-plate{
  background:repeating-linear-gradient(135deg,rgba(255,255,255,.3) 0 6px,transparent 6px 11px);
  cursor:default;
}

.cred-plate-in{
  --cut:10.5px;
  position:relative;display:flex;flex-direction:column;width:100%;height:100%;overflow:hidden;
  background:linear-gradient(180deg,color-mix(in srgb,var(--accent) 9%,#0d0a17),#0a0812 70%);
  box-shadow:inset 0 0 0 transparent;
  transition:box-shadow .35s ease;
}
.cred-plate:hover .cred-plate-in,
.cred-item[data-active="true"] .cred-plate-in{
  box-shadow:inset 0 0 26px color-mix(in srgb,var(--accent) 14%,transparent);
}
/* cursor-following glow */
.cred-plate-in::before{
  content:"";position:absolute;inset:0;z-index:2;pointer-events:none;
  opacity:0;transition:opacity .3s;
  background:radial-gradient(200px circle at var(--mx,50%) var(--my,50%),color-mix(in srgb,var(--accent) 22%,transparent),transparent 70%);
}
.cred-plate:hover .cred-plate-in::before{opacity:1}
/* hover shine */
.cred-plate-in::after{
  content:"";position:absolute;inset:0;z-index:3;pointer-events:none;
  background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.08) 50%,transparent 60%);
  transform:translateX(-130%);
}
/* light that slides across the card as the ring turns */
.cred-shine{
  position:absolute;inset:0;z-index:2;pointer-events:none;will-change:transform;
  background:linear-gradient(105deg,transparent 38%,rgba(255,255,255,.10) 50%,transparent 62%);
  transform:translateX(calc(var(--d,0) * -70%));
}
/* hero: light that sweeps when the card arrives at the front */
.cred-hero::after{
  content:"";position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.18) 50%,transparent 65%);
  transform:translateX(-130%);
}
.cred-hint{opacity:0;transition:opacity .25s}
.cred-item[data-active="true"]:hover .cred-hint{opacity:1}
`;

// "2026-10" -> "Oct 2026"
function formatDate(date: string) {
  const [year, month] = date.split("-");
  const name = MONTHS[Number(month) - 1];
  return name ? `${name} ${year}` : year;
}

const sortClass = (active: boolean) =>
  `min-h-9 rounded-full border px-4 text-[11px] tracking-[0.14em] transition-colors lg:min-h-8 ${
    active
      ? "border-crimson/60 bg-crimson/15 text-ink"
      : "border-white/10 text-mist hover:border-crimson/40 hover:text-ink"
  }`;

/* ---------- Small pieces ---------- */

// Rotating dashed "seal" with an icon in the middle
function Seal({
  color,
  size = 88,
  spinClass = "cred-spin",
  children,
}: {
  color: string;
  size?: number;
  spinClass?: string;
  children: ReactNode;
}) {
  const core = Math.round(size * 0.58);
  return (
    <span
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className={`${spinClass} absolute inset-0`}
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="50"
          cy="50"
          r="48"
          stroke={color}
          strokeOpacity="0.55"
          strokeDasharray="2 5"
        />
        <circle cx="50" cy="50" r="40" stroke={color} strokeOpacity="0.25" />
      </svg>
      <span
        className="cred-core flex items-center justify-center rounded-full border"
        style={{
          width: core,
          height: core,
          color,
          borderColor: `${color}88`,
          background: `${color}14`,
          boxShadow: `0 0 24px ${color}44`,
        }}
      >
        {children}
      </span>
    </span>
  );
}

// Dark preview background with a faint grid and a coloured glow
function PreviewArt({
  accent,
  children,
}: {
  accent: string;
  children: ReactNode;
}) {
  return (
    <span
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      style={{
        background: `radial-gradient(120% 100% at 25% 0%, ${accent}38, transparent 62%), linear-gradient(160deg, #150f26, #0a0812)`,
      }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      {children}
    </span>
  );
}

// Extra life around the seal, depending on rarity
function RarityFX({
  rarity,
  color,
}: {
  rarity: CredentialRarity;
  color: string;
}) {
  const orbit = rarity === "rare" || rarity === "legendary";
  const pulse = rarity === "epic" || rarity === "legendary";
  return (
    <>
      {orbit && (
        <span
          aria-hidden="true"
          className="cred-orbit cred-gate absolute left-1/2 top-1/2"
          style={{ width: 112, height: 112, marginLeft: -56, marginTop: -56 }}
        >
          <i
            className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full"
            style={{ background: color, boxShadow: `0 0 8px ${color}` }}
          />
          <i
            className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full"
            style={{ background: color, boxShadow: `0 0 6px ${color}` }}
          />
        </span>
      )}
      {pulse &&
        [0, -1.3].map((delay) => (
          <span
            key={delay}
            aria-hidden="true"
            className="cred-pulse cred-gate absolute left-1/2 top-1/2 rounded-full border"
            style={{
              width: 84,
              height: 84,
              marginLeft: -42,
              marginTop: -42,
              borderColor: color,
              animationDelay: `${delay}s`,
            }}
          />
        ))}
      {rarity === "legendary" &&
        [0, 1, 2, 3, 4].map((i) => (
          <i
            key={i}
            aria-hidden="true"
            className="cred-spark cred-gate absolute bottom-3 h-1 w-1 rounded-full"
            style={{
              left: `${16 + i * 17}%`,
              background: color,
              boxShadow: `0 0 6px ${color}`,
              animationDelay: `${i * 0.55}s`,
            }}
          />
        ))}
    </>
  );
}

// Platform logo shown at the bottom of each certificate card
function PlatformLogo({
  issuer,
  size = 24,
}: {
  issuer: string;
  size?: number;
}) {
  const name = issuer.toLowerCase();

  if (name.includes("hackerrank")) {
    return (
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        role="img"
        aria-label="HackerRank"
        className="shrink-0"
      >
        <title>HackerRank</title>
        <path d="M16 2.5 28 9.25v13.5L16 29.5 4 22.75V9.25z" fill="#2ec866" />
        <path d="M12 9.5h2v5h4v-5h2v13h-2v-6h-4v6h-2z" fill="#0b0a12" />
      </svg>
    );
  }

  if (name.includes("freecodecamp")) {
    return (
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        role="img"
        aria-label="freeCodeCamp"
        className="shrink-0"
      >
        <title>freeCodeCamp</title>
        <path
          d="M16 3c1 4 6 7 6 13a6 6 0 0 1-12 0c0-2 1-3.5 2-5 .3 1.7 1.2 2.7 2.2 3C14 11 14.5 6.5 16 3z"
          fill="#f1be32"
        />
        <path
          d="M16 15c1.5 1.3 2.5 2.5 2.5 4a2.5 2.5 0 0 1-5 0c0-1.5 1-2.7 2.5-4z"
          fill="#0b0a12"
        />
      </svg>
    );
  }

  return (
    <span title={issuer} className="flex shrink-0 text-mist">
      <Award size={size - 4} aria-label={issuer} />
    </span>
  );
}

function RarityTag({ color, label }: { color: string; label: string }) {
  return (
    <span
      className="flex items-center gap-1.5 text-[10px] tracking-[0.2em]"
      style={{ color }}
    >
      <span
        aria-hidden="true"
        className="inline-block h-1.5 w-1.5 rotate-45"
        style={{ background: color, boxShadow: `0 0 6px ${color}` }}
      />
      {label}
    </span>
  );
}

function StatusPill({ verified }: { verified: boolean }) {
  return verified ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald/60 bg-black/55 px-2.5 py-0.5 text-[11px] text-emerald">
      <BadgeCheck size={12} />
      Verified
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/55 px-2.5 py-0.5 text-[11px] text-ink">
      <Check size={12} />
      Completed
    </span>
  );
}

function Lightbox({
  src,
  alt,
  caption,
  onClose,
  onPrev,
  onNext,
}: {
  src: string;
  alt: string;
  caption: string;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  // Focus + page-scroll lock (runs once)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);

  // Keyboard: Esc closes, arrows move between certificates
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev?.();
      if (e.key === "ArrowRight") onNext?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  const arrow =
    "absolute top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-void/60 text-ink transition-colors hover:border-crimson/60 hover:bg-crimson/20";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-void/90 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close preview"
        className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-ink transition-colors hover:border-crimson/60 hover:bg-crimson/20"
      >
        <X size={22} />
      </button>

      {onPrev && (
        <button
          type="button"
          aria-label="Previous certificate"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className={`${arrow} left-4`}
        >
          <ChevronLeft size={24} />
        </button>
      )}
      {onNext && (
        <button
          type="button"
          aria-label="Next certificate"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className={`${arrow} right-4`}
        >
          <ChevronRight size={24} />
        </button>
      )}

      <div
        className="relative h-[80vh] w-full max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          key={src}
          src={src}
          alt={alt}
          fill
          sizes="100vw"
          className="cred-swap object-contain"
        />
      </div>
      <p className="absolute bottom-5 left-0 right-0 text-center text-sm tracking-[0.1em] text-ink">
        {caption}
      </p>
    </div>
  );
}

/* ---------- Main component ---------- */

export default function CredentialsExplorer() {
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [tag, setTag] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoomedId, setZoomedId] = useState<string | null>(null);
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const [lockedId, setLockedId] = useState<string | null>(null);
  const featuredRef = useRef<HTMLDivElement>(null);

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "All Certificates" },
    ...categories,
  ];

  const totalSlots = credentials.length + plannedCredentials.length;

  const counts = useMemo(() => {
    const map: Record<Filter, number> = {
      all: credentials.length,
      development: 0,
      database: 0,
      cloud: 0,
      design: 0,
      others: 0,
    };
    for (const c of credentials) map[c.category] += 1;
    return map;
  }, []);

  // Open with a shared link: /credentials?cert=<id>
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("cert");
    if (id && credentials.some((c) => c.id === id)) setSelectedId(id);
  }, []);

  const visible = useMemo(() => {
    let list =
      filter === "all"
        ? credentials
        : credentials.filter((c) => c.category === filter);
    if (tag) {
      list = list.filter((c) =>
        c.tags.some((t) => t.toLowerCase() === tag.toLowerCase()),
      );
    }
    const rank = (c: Credential) => rarityOf(c).rank;
    return [...list].sort((a, b) => {
      if (sort === "oldest") return a.date.localeCompare(b.date);
      if (sort === "rarity")
        return rank(b) - rank(a) || b.date.localeCompare(a.date);
      return b.date.localeCompare(a.date);
    });
  }, [filter, tag, sort]);

  // Locked relic slots only show when no tag filter is active
  const locked = useMemo(
    () =>
      tag
        ? []
        : plannedCredentials.filter(
            (p) => filter === "all" || p.category === filter,
          ),
    [filter, tag],
  );

  const featured =
    visible.find((c) => c.id === selectedId) ??
    visible.find((c) => c.featured) ??
    visible[0];

  const fc = featured ? ACCENTS[featured.category] : "#ff244f";
  const fr = featured ? rarityOf(featured) : null;
  const FeaturedIcon = featured ? ICONS[featured.category] : Award;

  // Certificates that have a picture, for the fullscreen viewer
  const viewable = visible.filter((c) => c.image && !failed[c.id]);
  const zoomIndex = viewable.findIndex((c) => c.id === zoomedId);
  const zoomed = zoomIndex >= 0 ? viewable[zoomIndex] : null;
  const stepZoom = (dir: number) =>
    setZoomedId(
      viewable[(zoomIndex + dir + viewable.length) % viewable.length].id,
    );

  const commit = (id: string) => {
    setSelectedId(id);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("cert", id);
      window.history.replaceState(window.history.state, "", url);
    } catch {
      /* ignore */
    }
  };

  const closeZoom = () => {
    if (zoomedId) commit(zoomedId);
    setZoomedId(null);
  };

  const copyLink = async () => {
    if (!featured) return;
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("cert", featured.id);
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard not available */
    }
  };

  // ---- Carousel wiring ----
  const slideIds = [...visible.map((c) => c.id), ...locked.map((p) => p.id)];
  const activeId =
    lockedId && locked.some((p) => p.id === lockedId)
      ? lockedId
      : featured?.id;
  const activeIndex = Math.max(0, slideIds.indexOf(activeId ?? ""));

  // A flipped card turns back as soon as another card comes to the front
  useEffect(() => {
    if (flippedId && flippedId !== activeId) setFlippedId(null);
  }, [activeId, flippedId]);

  const onSlideChange = (i: number, auto?: boolean) => {
    const id = slideIds[i];
    if (!id) return;
    if (credentials.some((c) => c.id === id)) {
      setLockedId(null);
      if (auto) setSelectedId(id);
      else commit(id);
    } else {
      setLockedId(id);
    }
  };

  // Cursor glow (every card) + tilt (front card only)
  const moveCard = (e: ReactPointerEvent<HTMLDivElement>, tilt: boolean) => {
    if (e.pointerType !== "mouse") return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    el.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
    if (tilt) {
      el.style.setProperty("--rx", ((0.5 - y) * 9).toFixed(2));
      el.style.setProperty("--ry", ((x - 0.5) * 11).toFixed(2));
    }
  };

  const resetCard = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty("--rx", "0");
    e.currentTarget.style.setProperty("--ry", "0");
  };

  const renderSlide = (id: string, active: boolean) => {
    const c = credentials.find((x) => x.id === id);

    if (c) {
      const Icon = ICONS[c.category];
      const accent = ACCENTS[c.category];
      const r = rarityOf(c);
      const flipped = active && flippedId === c.id;
      const shownTags = c.tags.slice(0, 2);
      const extra = c.tags.length - shownTags.length;

      return (
        <div
          className="cred-item"
          data-active={active}
          data-flipped={flipped}
          style={{ "--accent": accent } as CSSProperties}
          onPointerMove={(e) => moveCard(e, active)}
          onPointerLeave={resetCard}
        >
          <div className="cred-tilt">
            {/* ---------- FRONT ---------- */}
            <button
              type="button"
              tabIndex={active && !flipped ? 0 : -1}
              aria-label={
                active
                  ? `${c.title}, ${c.issuer}. Press to flip the card`
                  : `Show ${c.title}`
              }
              aria-pressed={active ? flipped : undefined}
              onClick={() => {
                if (active) setFlippedId(flipped ? null : c.id);
              }}
              className={`cred-face cred-front cred-plate${
                c.rarity === "legendary" ? " cred-gold cred-gate" : ""
              }`}
            >
              <span className="cred-plate-in">
                <span aria-hidden="true" className="cred-shine" />

                {/* Hero: spinning seal + rarity effects (no picture) */}
                <span className="cred-hero relative z-[1] block min-h-0 flex-1 overflow-hidden">
                  <PreviewArt accent={accent}>
                    <RarityFX rarity={c.rarity ?? "common"} color={r.color} />
                    <span
                      className="relative"
                      style={{ transform: "translateX(calc(var(--d, 0) * 6px))" }}
                    >
                      <Seal
                        color={accent}
                        size={72}
                        spinClass="cred-spin cred-gate"
                      >
                        <Icon size={22} />
                      </Seal>
                    </span>
                  </PreviewArt>
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0b0913] to-transparent"
                  />
                  <span className="absolute left-3 top-3">
                    <StatusPill verified={Boolean(c.url)} />
                  </span>
                  <span
                    className="absolute right-3 top-3 rounded-full border bg-black/55 px-2.5 py-0.5"
                    style={{ borderColor: `${r.color}66` }}
                  >
                    <RarityTag color={r.color} label={r.label} />
                  </span>
                  <span
                    aria-hidden="true"
                    className="cred-hint absolute inset-x-0 bottom-2 flex items-center justify-center gap-1.5 text-[10px] tracking-[0.2em] text-ink/80"
                  >
                    <RotateCw size={11} />
                    FLIP
                  </span>
                </span>

                <span className="relative z-[1] flex shrink-0 flex-col gap-2 px-4 pb-3.5 pt-3">
                  <span className="line-clamp-2 text-[15px] font-semibold leading-tight text-ink">
                    {c.title}
                  </span>
                  <span
                    className="w-fit rounded-md border px-2.5 py-0.5 text-xs"
                    style={{
                      color: accent,
                      borderColor: `${accent}66`,
                      backgroundColor: `${accent}14`,
                    }}
                  >
                    {labelOf(c.category)}
                  </span>
                  <span className="flex flex-wrap gap-1.5">
                    {shownTags.map((t) => (
                      <span
                        key={t}
                        className="rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-ink"
                      >
                        {t}
                      </span>
                    ))}
                    {extra > 0 && (
                      <span className="rounded-lg border border-white/10 px-2 py-0.5 text-xs text-mist">
                        +{extra}
                      </span>
                    )}
                  </span>
                  <span className="flex items-center justify-between gap-3 pt-1">
                    <span className="text-xs text-mist">
                      {c.issuer} · {formatDate(c.date)}
                    </span>
                    <PlatformLogo issuer={c.issuer} />
                  </span>
                </span>
              </span>
            </button>

            {/* ---------- BACK ---------- */}
            <div
              className="cred-face cred-back cred-plate"
              aria-hidden={!flipped}
            >
              <span className="cred-plate-in">
                <span aria-hidden="true" className="cred-shine" />
                <span className="relative z-[1] flex h-full min-h-0 flex-col gap-2 p-3.5">
                  <span className="flex items-center justify-between gap-2">
                    <span
                      className="rounded-md border px-2 py-0.5 text-[11px]"
                      style={{
                        color: accent,
                        borderColor: `${accent}66`,
                        backgroundColor: `${accent}14`,
                      }}
                    >
                      {labelOf(c.category)}
                    </span>
                    <RarityTag color={r.color} label={r.label} />
                  </span>

                  <span className="line-clamp-2 text-[15px] font-semibold leading-tight text-ink">
                    {c.title}
                  </span>

                  <span className="line-clamp-5 min-h-0 text-xs leading-relaxed text-mist">
                    {c.description}
                  </span>

                  <ul className="flex flex-wrap gap-1.5">
                    {c.tags.map((t) => (
                      <li key={t}>
                        <button
                          type="button"
                          tabIndex={flipped ? 0 : -1}
                          onClick={() => setTag(tag === t ? null : t)}
                          className="rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-ink transition-colors hover:border-[var(--accent)]"
                        >
                          #{t}
                        </button>
                      </li>
                    ))}
                  </ul>

                  <span className="mt-auto flex flex-wrap items-center gap-2">
                    {c.url && (
                      <Link
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        tabIndex={flipped ? 0 : -1}
                        className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs text-ink transition-all hover:bg-white/5"
                        style={{ borderColor: `${accent}b3` }}
                      >
                        <ExternalLink size={13} />
                        View Certificate
                      </Link>
                    )}
                    <button
                      type="button"
                      tabIndex={flipped ? 0 : -1}
                      onClick={() => setFlippedId(null)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-mist transition-colors hover:border-[var(--accent)] hover:text-ink"
                    >
                      <RotateCw size={13} />
                      Back
                    </button>
                  </span>
                </span>
              </span>
            </div>
          </div>
        </div>
      );
    }

    const p = plannedCredentials.find((x) => x.id === id);
    if (!p) return null;
    return (
      <div
        className="cred-item cred-locked"
        data-active={active}
        style={{ "--accent": "#6b6b80" } as CSSProperties}
        onPointerMove={(e) => moveCard(e, false)}
      >
        <div className="cred-tilt">
          <div className="cred-face cred-plate" aria-label="Locked certificate">
            <span className="cred-plate-in">
              <span aria-hidden="true" className="cred-shine" />
              <span className="cred-hero relative z-[1] block min-h-0 flex-1 overflow-hidden">
                <PreviewArt accent="#6b6b80">
                  <span
                    className="relative opacity-60 grayscale"
                    style={{ transform: "translateX(calc(var(--d, 0) * 6px))" }}
                  >
                    <Seal
                      color="#6b6b80"
                      size={72}
                      spinClass="cred-spin cred-gate"
                    >
                      <Lock size={22} />
                    </Seal>
                  </span>
                </PreviewArt>
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0b0913] to-transparent"
                />
                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/55 px-2.5 py-0.5 text-[11px] text-mist">
                  <Lock size={11} />
                  Locked
                </span>
              </span>

              <span className="relative z-[1] flex shrink-0 flex-col gap-2 px-4 pb-3.5 pt-3">
                <span className="text-[15px] font-semibold leading-tight tracking-[0.3em] text-mist">
                  ???
                </span>
                <span className="w-fit rounded-md border border-white/15 px-2.5 py-0.5 text-xs text-mist">
                  Next quest · {p.hint}
                </span>
                <span className="flex items-center gap-1.5 pt-1 text-xs text-mist">
                  <Lock size={12} />
                  Not yet earned
                </span>
              </span>
            </span>
          </div>
        </div>
      </div>
    );
  };

  const showImage = featured?.image && !failed[featured.id];

  return (
    <>
      <style>{css}</style>

      <div className="grid gap-6 lg:h-full lg:min-h-0 lg:grid-cols-[260px_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]">
        {/* Sidebar (chips on mobile) */}
        <nav
          aria-label="Credential categories"
          className="h-fit rounded-2xl border border-white/10 bg-[#0d0a17]/75 p-3 backdrop-blur-md lg:p-4"
        >
          <div className="mb-4 hidden items-center gap-4 border-b border-white/10 pb-5 lg:flex">
            <span className="relative flex h-14 w-14 shrink-0 items-center justify-center">
              <svg
                viewBox="0 0 56 56"
                className="cred-spin absolute inset-0"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="28"
                  cy="28"
                  r="26"
                  stroke="#d4a843"
                  strokeOpacity="0.7"
                  strokeWidth="1.5"
                  strokeDasharray="3 5"
                />
              </svg>
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/60 text-gold">
                <Crown size={22} />
              </span>
            </span>
            <p className="text-[11px] leading-relaxed tracking-[0.25em] text-mist">
              GROWTH IS A COLLECTION OF PROOF.
            </p>
          </div>

          <ul className="no-scrollbar flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {filters.map((f) => {
              const Icon = ICONS[f.id];
              const active = filter === f.id;
              const color = ACCENTS[f.id];
              return (
                <li key={f.id} className="shrink-0 lg:shrink">
                  <button
                    type="button"
                    onClick={() => setFilter(f.id)}
                    aria-pressed={active}
                    className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-sm whitespace-nowrap transition-all duration-300 hover:translate-x-0.5 ${
                      active
                        ? "border-crimson/50 bg-gradient-to-r from-crimson/20 to-transparent text-ink shadow-[0_0_18px_rgba(255,36,79,0.18)]"
                        : "border-transparent text-mist hover:bg-white/5 hover:text-ink"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={18} style={{ color }} />
                      {f.label}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        active ? "bg-crimson/25 text-ink" : "bg-white/5"
                      }`}
                    >
                      {counts[f.id]}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Relics collected tracker */}
          <div className="mt-4 hidden border-t border-white/10 pt-4 lg:block">
            <p className="text-[10px] tracking-[0.25em] text-mist">
              RELICS COLLECTED
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {Array.from({ length: totalSlots }, (_, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className={`h-2.5 w-2.5 rotate-45 ${
                    i < credentials.length
                      ? "bg-gold shadow-[0_0_8px_#d4a843]"
                      : "border border-white/25"
                  }`}
                />
              ))}
            </div>
            <p className="mt-3 text-sm text-ink">
              {credentials.length}
              <span className="text-mist"> of {totalSlots}</span>
            </p>
          </div>
        </nav>

        {/* Main column */}
        <div className="flex min-w-0 flex-col lg:min-h-0">
          {/* Active tag filter chip (click to clear) */}
          {tag && (
            <div className="mb-4 shrink-0">
              <button
                type="button"
                onClick={() => setTag(null)}
                aria-label={`Remove tag filter ${tag}`}
                className="flex min-h-10 items-center gap-2 rounded-full border border-crimson/60 bg-crimson/10 px-4 text-sm text-ink transition-colors hover:bg-crimson/20"
              >
                #{tag}
                <X size={14} />
              </button>
            </div>
          )}

          {credentials.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-[#0d0a17]/75 p-10 text-center backdrop-blur-md">
              <Award size={40} className="mx-auto text-crimson/70" />
              <p className="mt-4 font-display text-xl text-ink">
                Credentials are on the way
              </p>
              <p className="mt-2 text-sm text-mist">
                Certificates will appear here as I earn them.
              </p>
            </div>
          )}

          {credentials.length > 0 && visible.length === 0 && (
            <div className="shrink-0 rounded-2xl border border-white/10 bg-[#0d0a17]/75 p-10 text-center text-sm text-mist backdrop-blur-md">
              No credentials match your filters.
            </div>
          )}

          {/* Featured panel */}
          {featured && fr && (
            <div
              ref={featuredRef}
              className="relative shrink-0 scroll-mt-24 overflow-hidden rounded-2xl border bg-[#0d0a17]/80 p-3 backdrop-blur-md transition-[border-color,box-shadow] duration-500 md:p-4"
              style={
                {
                  "--accent": fc,
                  borderColor: `${fc}99`,
                  boxShadow: `0 0 36px ${fc}2e`,
                } as CSSProperties
              }
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full blur-3xl"
                style={{ background: `${fc}30` }}
              />

              {/* key = restart the slide-in animation when the certificate changes */}
              <div
                key={featured.id}
                className="cred-swap relative grid items-center gap-5 md:grid-cols-[minmax(0,3fr)_minmax(0,8fr)]"
              >
                <div
                  className="relative aspect-[3/2] overflow-hidden rounded-xl border"
                  style={{ borderColor: `${fc}66` }}
                >
                  {showImage ? (
                    <button
                      type="button"
                      onClick={() => setZoomedId(featured.id)}
                      aria-label="Enlarge certificate image"
                      className="group relative block h-full w-full bg-deep/60"
                    >
                      <Image
                        src={featured.image as string}
                        alt={`Certificate: ${featured.title}`}
                        fill
                        sizes="(min-width: 768px) 25vw, 100vw"
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                        onError={() =>
                          setFailed((f) => ({ ...f, [featured.id]: true }))
                        }
                      />
                      <span className="pointer-events-none absolute inset-0 flex items-end justify-end bg-gradient-to-t from-void/70 via-transparent to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                        <span className="flex items-center gap-2 text-xs text-ink">
                          <ZoomIn size={14} />
                          Click to enlarge
                        </span>
                      </span>
                    </button>
                  ) : (
                    <PreviewArt accent={fc}>
                      <Seal color={fc} size={92}>
                        <FeaturedIcon size={26} />
                      </Seal>
                    </PreviewArt>
                  )}
                  <span
                    aria-hidden="true"
                    className="cred-sweep pointer-events-none absolute inset-0 overflow-hidden"
                  />
                </div>

                <div className="flex min-w-0 flex-col justify-center">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className="w-fit rounded-full border px-3 py-0.5 text-[10px] tracking-[0.25em]"
                      style={{
                        color: fc,
                        borderColor: `${fc}99`,
                        backgroundColor: `${fc}1a`,
                      }}
                    >
                      {featured.featured
                        ? "FEATURED"
                        : labelOf(featured.category).toUpperCase()}
                    </span>
                    <RarityTag color={fr.color} label={fr.label} />
                  </div>
                  <h2 className="mt-2 font-display text-xl text-ink md:text-2xl">
                    {featured.title}
                  </h2>
                  <p className="mt-1 text-sm text-mist">
                    {featured.issuer} · {formatDate(featured.date)}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-mist">
                    {featured.description}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <ul className="flex flex-wrap gap-2">
                      {featured.tags.map((t) => (
                        <li key={t}>
                          <button
                            type="button"
                            onClick={() => setTag(tag === t ? null : t)}
                            aria-pressed={tag === t}
                            className="min-h-9 rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-ink transition-colors hover:border-[var(--accent)]"
                            style={
                              tag === t
                                ? {
                                    borderColor: fc,
                                    backgroundColor: `${fc}26`,
                                  }
                                : undefined
                            }
                          >
                            #{t}
                          </button>
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap gap-2">
                      {featured.url && (
                        <Link
                          href={featured.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-10 items-center gap-2 rounded-lg border px-4 py-2 text-sm text-ink transition-all hover:bg-white/5 hover:shadow-[0_0_20px_var(--accent)]"
                          style={{ borderColor: `${fc}b3` }}
                        >
                          <ExternalLink size={16} />
                          View Certificate
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={copyLink}
                        className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-mist transition-colors hover:border-[var(--accent)] hover:text-ink"
                      >
                        {copied ? <Check size={16} /> : <Link2 size={16} />}
                        {copied ? "Link copied" : "Copy link"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* All certificates: 3D revolving carousel */}
          {slideIds.length > 0 && (
            <div className="mt-6 flex flex-col lg:min-h-0 lg:flex-1">
              <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-3">
                <h2 className="flex items-center gap-3 text-xs tracking-[0.3em] text-ink">
                  <span
                    aria-hidden="true"
                    className="inline-block h-2 w-2 rotate-45 bg-crimson"
                  />
                  ALL CERTIFICATES
                </h2>

                <div
                  role="group"
                  aria-label="Sort certificates"
                  className="flex flex-wrap gap-1.5"
                >
                  {SORTS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSort(s.id)}
                      aria-pressed={sort === s.id}
                      className={sortClass(sort === s.id)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 h-[500px] lg:h-auto lg:min-h-[400px] lg:flex-1">
                <CertificateCarousel
                  ids={slideIds}
                  index={activeIndex}
                  onIndexChange={onSlideChange}
                  renderSlide={renderSlide}
                  autoPlay={!zoomed && !flippedId}
                  autoPlayMs={3500}
                  label="Certificates"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {zoomed && (
        <Lightbox
          src={zoomed.image as string}
          alt={`Certificate: ${zoomed.title}`}
          caption={`${zoomed.title} · ${zoomed.issuer}`}
          onClose={closeZoom}
          onPrev={viewable.length > 1 ? () => stepZoom(-1) : undefined}
          onNext={viewable.length > 1 ? () => stepZoom(1) : undefined}
        />
      )}
    </>
  );
}