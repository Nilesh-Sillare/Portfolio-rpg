"use client";

import { useEffect, useRef, useState } from "react";
import type {
  CSSProperties,
  FocusEvent,
  KeyboardEvent,
  PointerEvent,
  ReactNode,
} from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

type Props = {
  ids: string[];
  index: number;
  onIndexChange: (index: number, auto?: boolean) => void;
  renderSlide: (id: string, active: boolean) => ReactNode;
  autoPlay?: boolean;
  /** milliseconds for ONE card to pass the front while spinning */
  autoPlayMs?: number;
  label?: string;
  /** colour of the stage light on the front card (any CSS colour) */
  spotlight?: string;
};

const GOLD = "212,168,67";

const css = `
@property --spot{syntax:"<color>";inherits:true;initial-value:#d4a843}

.car-stage{perspective:1400px;perspective-origin:50% 42%;transition:--spot .7s ease}
.car-slide{
  --cut:12px;
  position:absolute;left:50%;top:50%;
  opacity:0;visibility:hidden;pointer-events:none;
  backface-visibility:hidden;will-change:transform,opacity;
}
/* dark veil that dims cards away from the front (value set from JS) */
.car-slide::after{
  content:"";position:absolute;inset:0;pointer-events:none;z-index:5;
  background:#05030a;opacity:var(--dim,0);
  clip-path:polygon(var(--cut) 0,calc(100% - var(--cut)) 0,100% var(--cut),100% calc(100% - var(--cut)),calc(100% - var(--cut)) 100%,var(--cut) 100%,0 calc(100% - var(--cut)),0 var(--cut));
}

/* ---- Spotlight ---- */
/* the cone of light falling from the top star */
.car-beam{
  position:absolute;inset:0;
  background:
    radial-gradient(circle at 50% 0%,color-mix(in srgb,var(--spot) 55%,white) 0,color-mix(in srgb,var(--spot) 30%,transparent) 22px,transparent 150px),
    conic-gradient(from 142deg at 50% 0%,transparent 0deg,color-mix(in srgb,var(--spot) 34%,transparent) 38deg,transparent 76deg,transparent 360deg);
  -webkit-mask-image:linear-gradient(to bottom,#000 0%,#000 45%,transparent 92%);
          mask-image:linear-gradient(to bottom,#000 0%,#000 45%,transparent 92%);
}
/* the pool of light on the floor under the front card */
.car-pool{
  position:absolute;border-radius:50%;filter:blur(4px);
  background:radial-gradient(ellipse at center,color-mix(in srgb,var(--spot) 50%,transparent) 0%,color-mix(in srgb,var(--spot) 16%,transparent) 45%,transparent 70%);
}
/* light washing over the front card */
.car-wash{
  position:absolute;inset:0;mix-blend-mode:screen;
  background:radial-gradient(ellipse 30% 58% at 50% 44%,color-mix(in srgb,var(--spot) 20%,transparent),transparent 72%);
}
/* dark edges so the centre feels lit */
.car-vignette{
  position:absolute;inset:0;
  background:radial-gradient(ellipse 58% 84% at 50% 46%,transparent 40%,rgba(5,3,10,.62) 100%);
}
/* dust floating in the beam */
.car-mote{
  position:absolute;border-radius:9999px;opacity:0;
  background:color-mix(in srgb,var(--spot) 60%,white);
  box-shadow:0 0 6px var(--spot);
}

@media (prefers-reduced-motion: no-preference){
  @keyframes car-breathe{0%,100%{opacity:.75}50%{opacity:1}}
  @keyframes car-mote{0%{transform:translateY(14px);opacity:0}25%{opacity:.85}100%{transform:translateY(-64px);opacity:0}}
  .car-ring{animation:car-breathe 6s ease-in-out infinite}
  .car-beam{animation:car-breathe 5s ease-in-out infinite}
  .car-mote{animation:car-mote var(--t,6s) linear infinite;animation-delay:var(--dl,0s)}
}
`;

const wrap = (i: number, n: number) => ((i % n) + n) % n;
// shortest signed distance on a ring of n slots (works with fractions)
const wrapD = (d: number, n: number) => {
  const w = wrap(d, n);
  return w > n / 2 ? w - n : w;
};

function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 0 14.5 9.5 24 12 14.5 14.5 12 24 9.5 14.5 0 12 9.5 9.5Z"
        fill="#d4a843"
      />
    </svg>
  );
}

export default function CertificateCarousel({
  ids,
  index,
  onIndexChange,
  renderSlide,
  autoPlay = true,
  autoPlayMs = 3500,
  label = "Certificates",
  spotlight = "#d4a843",
}: Props) {
  const n = ids.length;
  const idsKey = ids.join("|");

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const slideEls = useRef<(HTMLDivElement | null)[]>([]);
  const dragged = useRef(false);
  const dragOff = useRef<(() => void) | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [userPaused, setUserPaused] = useState(false);

  // Everything that changes every frame lives here (no re-renders)
  const st = useRef({
    pos: index, // fractional position of the ring (the card at the front)
    target: null as number | null, // where the ring is easing to
    goal: null as number | null, // set by clicks/arrows: report only the end
    manual: false, // true while the visitor is interacting
    pressed: false,
    dragging: false,
    touch: false,
    onScreen: true,
    reported: index,
    startX: 0,
    startPos: 0,
    lastApplied: Number.NaN,
    lastInput: 0,
    snapTimer: 0,
    holdTimer: 0,
  });

  // ---- Geometry (a cylinder: cards stand on a circle of radius R) ----
  const ready = size.w > 0 && size.h > 0;
  const cardW0 = Math.min(size.w * 0.6, 270);
  const cardH = Math.max(260, Math.min(size.h * 0.88, cardW0 * 1.5, 440));
  const cardW = Math.min(cardW0, cardH * 0.74);
  // at least 12 slots: neighbours sit 30 degrees apart (gentler angles)
  const slots = Math.max(n, 12);
  const step = 360 / slots;
  const R = (cardW * 1.06) / 2 / Math.tan(Math.PI / slots);
  const perCard = Math.max(120, R * Math.sin((step * Math.PI) / 180));
  const ringW = Math.min(size.w * 0.98, perCard * 2 + cardW * 1.3);
  const ringH = ringW * 0.1;
  const cy = size.h / 2;

  const live = useRef({
    index,
    n,
    onIndexChange,
    autoPlay,
    autoPlayMs,
    userPaused,
    R,
    step,
    perCard,
  });

  useEffect(() => {
    if (live.current.R !== R || live.current.step !== step) {
      st.current.lastApplied = Number.NaN; // force a re-layout
    }
    live.current = {
      index,
      n,
      onIndexChange,
      autoPlay,
      autoPlayMs,
      userPaused,
      R,
      step,
      perCard,
    };
  });

    // Measure the stage
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() =>
      setSize({ w: el.clientWidth, h: el.clientHeight }),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // Don't animate while scrolled out of view
  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => {
      st.current.onScreen = entry.isIntersecting;
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The list of cards changed (filter / tag): jump straight to the new front card
  useEffect(() => {
    const s = st.current;
    s.pos = live.current.index;
    s.target = null;
    s.goal = null;
    s.reported = live.current.index;
    s.lastApplied = Number.NaN;
  }, [idsKey]);

  // The parent picked a card (sidebar, shared link, lightbox): ease to it
  useEffect(() => {
    const s = st.current;
    if (n < 1 || index === s.reported) return;
    if (s.dragging || performance.now() - s.lastInput < 400) return;
    if (index === wrap(Math.round(s.pos), n)) {
      s.reported = index;
      return;
    }
    s.reported = index;
    s.goal = index;
    const base = Math.round(s.pos);
    s.target = base + wrapD(index - base, n);
  }, [index, n]);

  // Horizontal or vertical wheel / trackpad scroll turns the ring
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const L = live.current;
      if (L.n < 2) return;
      let d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (!d) return;
      if (e.deltaMode === 1) d *= 16;
      else if (e.deltaMode === 2) d *= 300;
      d = Math.max(-400, Math.min(400, d));
      e.preventDefault();
      const s = st.current;
      s.manual = true;
      s.touch = false;
      s.goal = null;
      s.lastInput = performance.now();
      s.target = (s.target ?? s.pos) + d / (L.perCard * 1.2);
      window.clearTimeout(s.snapTimer);
      s.snapTimer = window.setTimeout(() => {
        if (!s.dragging) s.target = Math.round(s.target ?? s.pos);
      }, 140);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // The animation loop
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const apply = (pos: number) => {
      const { n: count, R: radius, step: deg } = live.current;
      for (let i = 0; i < count; i++) {
        const el = slideEls.current[i];
        if (!el) continue;
        const d = wrapD(i - pos, count);
        const a = d * deg;
        const abs = Math.abs(a);
        // fully visible up to ~36 degrees, gone by 58: no edge-on slivers
        const op = Math.max(0, Math.min(1, (58 - abs) / 22));
        el.style.transform = `translateZ(${-radius}px) rotateY(${a}deg) translateZ(${radius}px)`;
        el.style.opacity = String(op);
        el.style.visibility = op > 0.02 ? "visible" : "hidden";
        el.style.pointerEvents = abs <= 50 ? "auto" : "none";
        el.style.zIndex = String(Math.round(1000 - abs * 4));
        el.style.setProperty("--dim", String(Math.min(1, Math.abs(d)) * 0.32));
        // Used by the cards: moving light + seal parallax
        el.style.setProperty(
          "--d",
          Math.max(-1.5, Math.min(1.5, d)).toFixed(3),
        );
        // Continuous card animations only run on the front card and its neighbours
        const near = Math.abs(d) < 1.6 ? "true" : "false";
        if (el.dataset.near !== near) el.dataset.near = near;
      }
    };

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(64, t - last);
      last = t;
      const s = st.current;
      const L = live.current;
      if (L.n < 1 || !s.onScreen) return;

      if (s.dragging) {
        // pos is driven by the pointer
      } else if (s.target !== null) {
        const diff = s.target - s.pos;
        if (reduced.matches || Math.abs(diff) < 0.002) {
          s.pos = s.target;
          s.target = null;
          s.goal = null;
        } else {
          s.pos += diff * (1 - Math.exp(-dt / 120));
        }
      } else if (
        L.autoPlay &&
        !L.userPaused &&
        L.n >= 4 &&
        !s.manual &&
        !s.pressed &&
        !reduced.matches
      ) {
        s.pos += dt / L.autoPlayMs; // the continuous spin
      }

      if (s.pos !== s.lastApplied) {
        s.lastApplied = s.pos;
        apply(s.pos);
      }

      // Tell the parent which card is at the front (skipped on the way to a clicked card)
      if (s.goal === null) {
        const front = wrap(Math.round(s.pos), L.n);
        if (front !== s.reported) {
          s.reported = front;
          L.onIndexChange(front, !s.manual && !s.dragging);
        }
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(st.current.snapTimer);
      window.clearTimeout(st.current.holdTimer);
      dragOff.current?.();
    };
  }, []);

  // Touch has no "cursor leaves", so spinning resumes after a short hold
  const armHold = () => {
    const s = st.current;
    window.clearTimeout(s.holdTimer);
    if (s.touch) {
      s.holdTimer = window.setTimeout(() => {
        s.manual = false;
      }, 3000);
    }
  };

  const go = (to: number) => {
    if (n < 1) return;
    const s = st.current;
    s.manual = true;
    armHold();
    const next = wrap(to, n);
    const base = Math.round(s.pos);
    s.target = base + wrapD(next - base, n);
    s.goal = next;
    s.reported = next;
    onIndexChange(next, false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(index - 1);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(index + 1);
    }
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const s = st.current;
    s.pressed = true;
    s.dragging = false;
    s.touch = e.pointerType !== "mouse";
    s.startX = e.clientX;
    s.startPos = s.pos;
    dragged.current = false;

    const move = (ev: globalThis.PointerEvent) => {
      const dx = ev.clientX - s.startX;
      if (!s.dragging && Math.abs(dx) > 8) {
        s.dragging = true;
        dragged.current = true;
        s.manual = true;
        s.target = null;
        s.goal = null;
      }
      if (s.dragging) {
        s.pos = s.startPos - dx / live.current.perCard;
        s.lastInput = performance.now();
      }
    };
    const up = () => {
      off();
      s.pressed = false;
      if (s.dragging) {
        s.dragging = false;
        s.target = Math.round(s.pos);
        armHold();
        if (!s.touch && !rootRef.current?.matches(":hover")) s.manual = false;
      }
    };
    const off = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      dragOff.current = null;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    dragOff.current = off;
  };

  const onFocus = (e: FocusEvent<HTMLDivElement>) => {
    // keyboard focus only (a mouse click should not stop the spin)
    if ((e.target as HTMLElement).matches(":focus-visible")) {
      st.current.manual = true;
    }
  };

  const onBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    if (!rootRef.current?.matches(":hover")) st.current.manual = false;
  };

  const ring = (top: number, width: number, color: string): CSSProperties => ({
    position: "absolute",
    left: "50%",
    top,
    width,
    height: ringH,
    transform: "translateX(-50%)",
    borderRadius: "50%",
    border: `1px solid ${color}`,
    boxShadow: `0 0 18px ${color}, inset 0 0 14px ${color}`,
  });

  const btn =
    "flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-mist transition-colors hover:border-crimson/60 hover:text-ink";

  return (
    <div
      ref={rootRef}
      className="flex h-full flex-col"
      onPointerEnter={(e) => {
        st.current.touch = e.pointerType !== "mouse";
      }}
      onPointerLeave={(e) => {
        const s = st.current;
        if (e.pointerType === "mouse" && !s.pressed && !s.dragging) {
          s.manual = false; // cursor left the area: spin again
        }
      }}
    >
      <style>{css}</style>

      <div
        ref={stageRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onFocus={onFocus}
        onBlur={onBlur}
        style={{ touchAction: "pan-y", "--spot": spotlight } as CSSProperties}
        className="car-stage relative min-h-0 flex-1 select-none overflow-hidden rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-crimson/60"
      >
        {ready && (
          <>
            {/* Behind the cards: light beam, floor pool, rings, centre line */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <span className="car-beam" />
              <span
                className="absolute inset-y-0 left-1/2 w-px"
                style={{
                  background: `linear-gradient(to bottom, transparent, rgba(${GOLD},.6) 12%, rgba(${GOLD},.6) 88%, transparent)`,
                  boxShadow: `0 0 12px rgba(${GOLD},.4)`,
                }}
              />
              <Star className="absolute left-1/2 top-[2%] h-5 w-5 -translate-x-1/2 drop-shadow-[0_0_8px_#d4a843]" />
              <Star className="absolute bottom-[2%] left-1/2 h-5 w-5 -translate-x-1/2 drop-shadow-[0_0_8px_#d4a843]" />
              <span
                className="car-pool"
                style={{
                  left: "50%",
                  top: cy + cardH / 2 - ringH * 0.85,
                  width: cardW * 1.9,
                  height: ringH * 1.5,
                  transform: "translateX(-50%)",
                }}
              />
              <span
                className="car-ring"
                style={ring(cy - cardH / 2 - ringH * 0.55, ringW, `rgba(${GOLD},.6)`)}
              />
              <span
                className="car-ring"
                style={ring(cy - cardH / 2 - ringH * 0.2, ringW * 0.93, "rgba(255,226,150,.42)")}
              />
              <span
                className="car-ring"
                style={ring(cy + cardH / 2 - ringH * 0.45, ringW, `rgba(${GOLD},.6)`)}
              />
            </div>

            {/* Cards: positions are written by the animation loop */}
            <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
              {ids.map((id, i) => (
                <div
                  key={id}
                  ref={(el) => {
                    slideEls.current[i] = el;
                  }}
                  className="car-slide"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${n}`}
                  onClickCapture={(e) => {
                    if (dragged.current) {
                      e.stopPropagation();
                      e.preventDefault();
                      dragged.current = false;
                    }
                  }}
                  onClick={() => go(i)}
                  style={{
                    width: cardW,
                    height: cardH,
                    marginLeft: -cardW / 2,
                    marginTop: -cardH / 2,
                  }}
                >
                  {renderSlide(id, i === index)}
                </div>
              ))}
            </div>

            {/* In front of the cards: dark edges, light on the card, floating dust */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <span className="car-vignette" />
              <span className="car-wash" />
              {Array.from({ length: 9 }, (_, i) => {
                const x = (((i * 47) % 100) - 50) / 50;
                const s = 2 + (i % 3);
                return (
                  <i
                    key={i}
                    className="car-mote"
                    style={
                      {
                        left: `calc(50% + ${(x * cardW * 0.6).toFixed(0)}px)`,
                        top: `${20 + ((i * 29) % 58)}%`,
                        width: s,
                        height: s,
                        "--t": `${5 + (i % 4)}s`,
                        "--dl": `${(-i * 0.9).toFixed(1)}s`,
                      } as CSSProperties
                    }
                  />
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Only announce slide changes when the ring is not spinning by itself */}
      <p
        className="sr-only"
        aria-live={userPaused || !autoPlay ? "polite" : "off"}
      >
        {label}: {index + 1} of {n}
      </p>

      {/* Controls */}
      {n > 1 && (
        <div className="mt-2 flex h-10 shrink-0 items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous certificate"
            className={btn}
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center">
            {ids.map((id, i) => (
              <button
                key={id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to certificate ${i + 1}`}
                aria-current={i === index}
                className="p-1.5"
              >
                <span
                  className={`block h-2 w-2 rotate-45 transition-all ${
                    i === index
                      ? "scale-125 bg-gold shadow-[0_0_8px_#d4a843]"
                      : "border border-white/30"
                  }`}
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next certificate"
            className={btn}
          >
            <ChevronRight size={18} />
          </button>

          {autoPlay && (
            <button
              type="button"
              onClick={() => setUserPaused((p) => !p)}
              aria-label={userPaused ? "Resume rotation" : "Pause rotation"}
              aria-pressed={userPaused}
              className={btn}
            >
              {userPaused ? <Play size={14} /> : <Pause size={14} />}
            </button>
          )}
        </div>
      )}
    </div>
  );
}