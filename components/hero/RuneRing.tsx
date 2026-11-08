"use client";

import type { CSSProperties } from "react";

type Props = {
  bg: string; // the landing artwork (the rune layers are rotated copies of it)
  cx: number; // ring centre, in cqw
  cy: number;
  r: number; // ring outer radius, in cqw
  burst: number; // change this number to fire a shockwave
};

// Ring-shaped cut-out, with a gap where the sigil's spike passes through
const ringMask =
  "radial-gradient(circle closest-side, transparent 66%, #000 70%, #000 96%, transparent 100%)";
const bandMask =
  "linear-gradient(to right, #000 0%, #000 41%, transparent 45%, transparent 55%, #000 59%, #000 100%)";
const ringMasks: CSSProperties = {
  WebkitMaskImage: `${ringMask}, ${bandMask}`,
  maskImage: `${ringMask}, ${bandMask}`,
  WebkitMaskComposite: "source-in",
  maskComposite: "intersect",
};

// A sweeping wedge: bright leading edge, fading tail
const wedge =
  "conic-gradient(from 0deg, transparent 0deg, transparent 240deg, rgba(0,0,0,.35) 300deg, #000 352deg, transparent 360deg)";

// Thin ring band used for the comet arcs
// (ends in transparent so the square's corners, beyond the circle, stay empty)
const band = (inner: number) =>
  `radial-gradient(circle closest-side, transparent ${inner - 1}%, #000 ${inner + 0.5}%, #000 100%, transparent 100.6%)`;

const comets = [
  { r: 1.04, dur: 6, dir: "normal", color: "255,36,79", w: 300 },
  { r: 0.6, dur: 9, dir: "reverse", color: "155,92,255", w: 280 },
  { r: 1.12, dur: 14, dir: "normal", color: "214,190,255", w: 320 },
  { r: 0.8, dur: 11, dir: "reverse", color: "255,36,79", w: 330 },
] as const;

export default function RuneRing({ bg, cx, cy, r, burst }: Props) {
  const artwork = (extra?: CSSProperties): CSSProperties => ({
    backgroundImage: `url(${bg})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "100cqw auto",
    backgroundPosition: `${r - cx}cqw ${r - cy}cqw`,
    ...extra,
  });

  return (
    <div
      aria-hidden="true"
      className="rune-rig absolute"
      style={{
        left: `${cx - r}cqw`,
        top: `${cy - r}cqw`,
        width: `${r * 2}cqw`,
        height: `${r * 2}cqw`,
      }}
    >
      {/* 1. The runes themselves, turning steadily */}
      <div className="absolute inset-0" style={ringMasks}>
        <div className="rr-spin h-full w-full" style={artwork()} />
      </div>

      {/* 2. Scanner: a sweep that lights each rune as it passes */}
      <div className="absolute inset-0" style={ringMasks}>
        <div
          className="rr-sweep absolute inset-0"
          style={{ WebkitMaskImage: wedge, maskImage: wedge }}
        >
          <div
            className="rr-sweep-inner h-full w-full"
            style={artwork({
              filter: "brightness(2.6) saturate(1.6) drop-shadow(0 0 5px #b78bff)",
            })}
          />
        </div>
      </div>

      {/* Everything below leans a little toward the cursor */}
      <div className="rr-tilt absolute inset-0">
        {/* 3. Inner and outer decorative rings */}
        <svg
          viewBox="-120 -120 240 240"
          className="absolute overflow-visible"
          style={{ inset: "-10%", width: "120%", height: "120%" }}
        >
          <g className="rr-ccw-slow">
            <circle r="58" fill="none" stroke="rgba(185,165,232,.45)" strokeWidth="0.7" strokeDasharray="1.5 4.5" />
          </g>
          <g className="rr-cw-mid">
            <circle r="52" fill="none" stroke="rgba(155,92,255,.35)" strokeWidth="0.6" strokeDasharray="14 6 2 6" />
          </g>
          <g className="rr-cw-slow">
            <circle r="106" fill="none" stroke="rgba(185,165,232,.5)" strokeWidth="1.1" strokeDasharray="1 8" />
          </g>
          <g className="rr-ccw-mid">
            <circle r="110" fill="none" stroke="rgba(255,36,79,.55)" strokeWidth="0.9" strokeDasharray="26 70" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 3px #ff244f)" }} />
          </g>
          <g className="rr-cw-fast">
            <circle r="102" fill="none" stroke="rgba(155,92,255,.7)" strokeWidth="0.9" strokeDasharray="10 110" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 3px #9b5cff)" }} />
          </g>
        </svg>

        {/* 4. Comet arcs: a glowing head with a fading tail */}
        {comets.map((c, i) => {
          const inset = `${(1 - c.r) * 50}%`;
          return (
            <div
              key={i}
              className="rr-comet absolute"
              style={
                {
                  inset,
                  "--dur": `${c.dur}s`,
                  "--dir": c.dir,
                } as CSSProperties
              }
            >
              <div
                className="absolute inset-0"
                style={{
                  background: `conic-gradient(from 0deg, transparent 0deg, transparent ${360 - c.w / 4}deg, rgba(${c.color},.9) 358deg, transparent 360deg)`,
                  WebkitMaskImage: band(98),
                  maskImage: band(98),
                  transform: c.dir === "reverse" ? "scaleX(-1)" : undefined, // tail always trails the head
                }}
              />
              <span
                className="absolute left-1/2 top-0 h-[0.7cqw] w-[0.7cqw] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  background: `rgb(${c.color})`,
                  boxShadow: `0 0 1.2cqw 0.3cqw rgba(${c.color},.85)`,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* 5. Shockwave (fires on hover / click) */}
      {burst > 0 && (
        <>
          <span key={`a${burst}`} className="rr-shock absolute inset-0 rounded-full" />
          <span key={`b${burst}`} className="rr-shock rr-shock-2 absolute inset-0 rounded-full" />
        </>
      )}
    </div>
  );
}
