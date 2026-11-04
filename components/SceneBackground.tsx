import type { CSSProperties } from "react";

export const DEFAULT_BG = "/backgrounds/hall.jpg"; // file goes in public/backgrounds/

type Props = {
  images?: string[]; // all background images used on the page
  index?: number; // which one is showing
  accent?: string; // 6-digit hex tint
  embers?: number;
};

const css = `
@property --tint{syntax:"<color>";inherits:true;initial-value:#ff2d55}
.scene{transition:--tint .8s ease}
.scene-tint{background:radial-gradient(70% 60% at 75% 30%,color-mix(in srgb,var(--tint) 22%,transparent),transparent 70%)}
.ember{position:absolute;bottom:-12px;border-radius:9999px;background:var(--tint);box-shadow:0 0 10px var(--tint);opacity:0;animation-name:ember;animation-timing-function:linear;animation-iteration-count:infinite}
@keyframes ember{0%{transform:translate3d(0,0,0);opacity:0}10%{opacity:.85}100%{transform:translate3d(30px,-110vh,0);opacity:0}}
@media (prefers-reduced-motion:reduce){.ember{display:none}}
`;

export default function SceneBackground({
  images = [DEFAULT_BG],
  index = 0,
  accent = "#ff2d55",
  embers = 14,
}: Props) {
  return (
    <div
      aria-hidden
      className="scene pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#05030a]"
      style={{ "--tint": accent } as CSSProperties}
    >
      <style>{css}</style>
      {images.map((src, k) => (
        <div
          key={src}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
          style={{ backgroundImage: `url(${src})`, opacity: k === index ? 0.7 : 0 }}
        />
      ))}
      <div className="scene-tint absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#05030a]/70 via-[#05030a]/40 to-[#05030a]/90" />
      {Array.from({ length: embers }, (_, i) => (
        <span
          key={i}
          className="ember"
          style={{
            left: `${(i * 37 + 11) % 100}%`,
            width: 2 + (i % 3),
            height: 2 + (i % 3),
            animationDuration: `${9 + (i % 5) * 2}s`,
            animationDelay: `-${(i * 1.7) % 12}s`,
          }}
        />
      ))}
    </div>
  );
}