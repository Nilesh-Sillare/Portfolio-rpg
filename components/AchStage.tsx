import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

export const W = 1610;
export const H = 977;
export const NAV = 64; // navbar height in px

// 1 mockup pixel as a size that scales with the stage (never stretches text)
export const u = (n: number) => `${((n / W) * 100).toFixed(4)}cqw`;

export function At({ x, y, w, h, className, style, children }: {
  x: number; y: number; w?: number; h?: number;
  className?: string; style?: CSSProperties; children?: ReactNode;
}) {
  return (
    <div
      className={className}
      style={{
        position: "absolute",
        left: `${(x / W) * 100}%`,
        top: `${(y / H) * 100}%`,
        width: w !== undefined ? `${(w / W) * 100}%` : undefined,
        height: h !== undefined ? `${(h / H) * 100}%` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

const CORNERS: CSSProperties[] = [
  { top: -1, left: -1, borderTopWidth: 2, borderLeftWidth: 2 },
  { top: -1, right: -1, borderTopWidth: 2, borderRightWidth: 2 },
  { bottom: -1, left: -1, borderBottomWidth: 2, borderLeftWidth: 2 },
  { bottom: -1, right: -1, borderBottomWidth: 2, borderRightWidth: 2 },
];

// used by the two bottom panels (epic path + legendary)
export function Panel({ x, y, w, h, image, dim = 0.5, tone = "rgba(176,56,120,0.55)", fill = "transparent", sizes = "70vw" }: {
  x: number; y: number; w: number; h: number;
  image?: string; dim?: number; tone?: string; fill?: string; sizes?: string;
}) {
  return (
    <At
      x={x} y={y} w={w} h={h}
      style={{ border: `1px solid ${tone}`, background: fill, boxShadow: "inset 0 0 40px rgba(0,0,0,.55), 0 0 18px rgba(140,30,90,.15)" }}
    >
      {image && (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <Image src={image} alt="" fill sizes={sizes} className="object-cover" />
          <div style={{ position: "absolute", inset: 0, background: `rgba(5,4,10,${dim})` }} />
        </div>
      )}
      {CORNERS.map((c, i) => (
        <span key={i} style={{ position: "absolute", width: u(14), height: u(14), borderStyle: "solid", borderWidth: 0, borderColor: "#d4375f", ...c }} />
      ))}
    </At>
  );
}

const ART_H = 665; // the art strip: header + tree. The bottom row starts at 672.
const STRETCH = 1.095; // art is stretched sideways so the trunk sits on the page centre (x = 805)

// sky lightning: the only thing that moves. Delete the <style> and the two .ach-bolt divs for a fully still scene.
const BOLT_CSS = `
@keyframes achBolt{0%,58%,100%{opacity:0}59%{opacity:.9}60%{opacity:.1}61.5%{opacity:.75}65%{opacity:0}}
.ach-bolt{animation:achBolt 9s linear infinite}
@media (prefers-reduced-motion:reduce){.ach-bolt{animation:none}}
`;

export default function AchStage({ children }: { children: ReactNode }) {
  return (
    <div className="w-full bg-[#05040a]">
      <div
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: `${W} / ${H}`,
          containerType: "inline-size",
          background: "#05040a",
        }}
      >
        <At
          x={0} y={0} w={W} h={ART_H}
          style={{
            WebkitMaskImage: "linear-gradient(to bottom,#000 90%,transparent)",
            maskImage: "linear-gradient(to bottom,#000 90%,transparent)",
            overflow: "hidden",
          }}
        >
          {/* the art is wider than the stage (cropped on the right), so the trunk lands at x = 805 */}
          <div style={{ position: "absolute", left: 0, top: 0, width: `${STRETCH * 100}%`, height: `${(805 / ART_H) * 100}%` }}>
            <Image src="/backgrounds/achievements-top.webp" alt="" fill priority sizes="110vw" className="object-fill" />
          </div>
          <div style={{ position: "absolute", inset: 0, background: "rgba(5,4,10,.38)" }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 52%, transparent 55%, rgba(3,2,7,.7) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(5,4,10,.8), rgba(5,4,10,0) 24%)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(5,4,10,.7), rgba(5,4,10,0) 30%)" }} />
          <style>{BOLT_CSS}</style>
          <div className="ach-bolt" aria-hidden style={{ position: "absolute", inset: 0, opacity: 0, mixBlendMode: "screen", pointerEvents: "none", background: "radial-gradient(26% 38% at 83% 8%, rgba(255,90,110,.55), transparent 70%)" }} />
          <div className="ach-bolt" aria-hidden style={{ position: "absolute", inset: 0, opacity: 0, mixBlendMode: "screen", pointerEvents: "none", animationDelay: "4.6s", background: "radial-gradient(22% 34% at 68% 6%, rgba(200,120,255,.4), transparent 70%)" }} />
        </At>
        {children}
      </div>
    </div>
  );
}