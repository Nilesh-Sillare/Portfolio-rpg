"use client";

import { useEffect, useState, type CSSProperties } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+<>/";

type Props = {
  text: string;
  delay?: number; // ms before decoding starts
  duration?: number; // ms the whole decode takes
  className?: string;
  style?: CSSProperties;
};

// Letters flicker through random glyphs, then lock into the real text one by one.
export default function DecodeText({ text, delay = 0, duration = 1500, className, style }: Props) {
  const [p, setP] = useState(1); // 1 = finished (also what the server renders)
  const [seed, setSeed] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let last = 0;
    const t0 = performance.now();
    setP(-1);
    const loop = (now: number) => {
      const k = (now - t0 - delay) / duration;
      if (k >= 1) {
        setP(1);
        return;
      }
      if (now - last > 45) {
        last = now;
        setP(Math.max(k, 0));
        setSeed((s) => s + 1);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [text, delay, duration]);

  const n = [...text].length;
  const words = text.split(" ");
  // index of each word's first character within the whole text
  const offsets = words.map((_, w) => words.slice(0, w).reduce((a, x) => a + [...x].length + 1, 0));

  return (
    <span className={className} style={style} aria-label={text}>
      {words.map((word, w) => (
        <span key={w}>
          {w > 0 && " "}
          {/* a word never breaks in the middle */}
          <span className="inline-block whitespace-nowrap">
            {[...word].map((ch, k) => {
              const i = offsets[w] + k;
              const start = (i / n) * 0.7;
              const done = p >= 1 || p >= start + 0.3;
              const shown = done
                ? ch
                : p >= start
                  ? GLYPHS[(i * 7 + seed * 13 + ((i * seed) % 11)) % GLYPHS.length]
                  : "";
              return (
                <span key={i} aria-hidden="true" className="relative inline-block">
                  <span style={{ opacity: 0 }}>{ch}</span>
                  <span
                    className="absolute inset-0 text-center"
                    style={done ? undefined : { color: "#ff6a86", textShadow: "0 0 14px rgba(255,36,79,.9)" }}
                  >
                    {shown}
                  </span>
                </span>
              );
            })}
          </span>
        </span>
      ))}
    </span>
  );
}
