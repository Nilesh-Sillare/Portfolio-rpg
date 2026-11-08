"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

// Positions are fractions of the artwork (x, y). They sit on the castle's lit windows,
// found by looking at the picture, so the flicker lands on real lights.
const LIGHTS = [
  { x: 0.448, y: 0.531, s: 0.7, c: "255,120,220", d: 3.1 },
  { x: 0.469, y: 0.531, s: 0.6, c: "200,120,255", d: 4.3 },
  { x: 0.461, y: 0.544, s: 0.6, c: "255,140,230", d: 2.7 },
  { x: 0.487, y: 0.565, s: 0.9, c: "255,110,200", d: 3.7 },
  { x: 0.4675, y: 0.572, s: 1.0, c: "255,110,200", d: 5.1 },
  { x: 0.4855, y: 0.47, s: 0.6, c: "210,150,255", d: 2.3 },
  { x: 0.4963, y: 0.456, s: 0.9, c: "255,150,240", d: 3.3 },
  { x: 0.521, y: 0.557, s: 0.7, c: "255,120,210", d: 4.7 },
  { x: 0.5296, y: 0.572, s: 0.8, c: "255,110,200", d: 2.9 },
  { x: 0.548, y: 0.547, s: 0.6, c: "200,120,255", d: 3.9 },
  { x: 0.56, y: 0.5356, s: 0.6, c: "255,130,220", d: 5.3 },
  { x: 0.5695, y: 0.547, s: 0.7, c: "210,130,255", d: 2.5 },
] as const;

// Two bolt shapes (viewBox 0 0 100 100), picked at random for each strike
const BOLTS = [
  "M62 0 L50 24 L58 26 L40 54 L48 56 L30 92",
  "M30 0 L42 22 L34 25 L52 50 L44 54 L60 90",
];

const WATERFALL = { x: 0.595, y: 0.63 };

export default function SkyFx() {
  const [strike, setStrike] = useState({ n: 0, bolt: 0, x: 30 });
  const timer = useRef(0);

  // Lightning in the clouds every 7 to 16 seconds
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const next = () => {
      timer.current = window.setTimeout(
        () => {
          if (!document.hidden) {
            setStrike((s) => ({
              n: s.n + 1,
              bolt: Math.floor(Math.random() * BOLTS.length),
              x: 14 + Math.random() * 40,
            }));
          }
          next();
        },
        7000 + Math.random() * 9000,
      );
    };
    timer.current = window.setTimeout(next, 3500);
    return () => window.clearTimeout(timer.current);
  }, []);

  return (
    <>
      {/* Castle windows */}
      {LIGHTS.map((l, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="sky-light absolute rounded-full"
          style={
            {
              left: `${l.x * 100}%`,
              top: `${l.y * 100}%`,
              width: `${l.s}cqw`,
              height: `${l.s}cqw`,
              background: `radial-gradient(circle, rgba(${l.c},.95), rgba(${l.c},.25) 45%, transparent 70%)`,
              "--d": `${l.d}s`,
              animationDelay: `${-i * 0.9}s`,
            } as CSSProperties
          }
        />
      ))}

      {/* Lava falls pulse */}
      <span
        aria-hidden="true"
        className="sky-fall absolute rounded-full"
        style={{
          left: `${WATERFALL.x * 100}%`,
          top: `${WATERFALL.y * 100}%`,
          width: "3.2cqw",
          height: "5cqw",
          background: "radial-gradient(ellipse, rgba(255,36,79,.55), transparent 68%)",
        }}
      />

      {/* Lightning: a wash of light behind the clouds, plus a thin bolt */}
      {strike.n > 0 && (
        <div key={strike.n} aria-hidden="true" className="sky-strike pointer-events-none absolute inset-0">
          <div
            className="absolute"
            style={{
              left: `${strike.x - 12}%`,
              top: "0%",
              width: "46%",
              height: "46%",
              background:
                "radial-gradient(ellipse at 50% 35%, rgba(220,190,255,.55), rgba(140,80,255,.22) 45%, transparent 70%)",
              mixBlendMode: "screen",
            }}
          />
          <svg
            viewBox="0 0 100 100"
            className="absolute"
            style={{ left: `${strike.x}%`, top: "2%", width: "6%", height: "34%" }}
            preserveAspectRatio="none"
          >
            <path
              d={BOLTS[strike.bolt]}
              fill="none"
              stroke="#efe2ff"
              strokeWidth="2.2"
              strokeLinejoin="round"
              style={{ filter: "drop-shadow(0 0 4px #b78bff) drop-shadow(0 0 10px #9b5cff)" }}
            />
          </svg>
        </div>
      )}
    </>
  );
}
