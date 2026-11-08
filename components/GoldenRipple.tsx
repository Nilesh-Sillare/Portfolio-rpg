// Decorative golden circle in the centre of the page background.
// Pure CSS/SVG, no client JS needed.

const GOLD = "212,168,67";

export default function GoldenRipple() {
  const ticks = Array.from({ length: 48 }, (_, i) => i);

  return (
    <>
      <style>{`
.gr-glow{background:radial-gradient(circle,rgba(${GOLD},.18),rgba(${GOLD},.06) 45%,transparent 70%)}
.gr-ripple{
  position:absolute;inset:14%;border-radius:9999px;
  border:1.5px solid rgba(${GOLD},.55);
  box-shadow:0 0 26px rgba(${GOLD},.28),inset 0 0 26px rgba(${GOLD},.12);
  opacity:.16;
}
@media (prefers-reduced-motion: no-preference){
  @keyframes gr-ripple{
    0%{transform:scale(.35);opacity:0}
    15%{opacity:.6}
    100%{transform:scale(1.18);opacity:0}
  }
  @keyframes gr-spin{to{transform:rotate(360deg)}}
  @keyframes gr-spin-rev{to{transform:rotate(-360deg)}}
  @keyframes gr-breathe{
    0%,100%{opacity:.7;transform:scale(1)}
    50%{opacity:1;transform:scale(1.07)}
  }
  .gr-ripple{animation:gr-ripple 7.5s cubic-bezier(.2,.6,.3,1) infinite;opacity:0}
  .gr-spin{animation:gr-spin 90s linear infinite}
  .gr-spin-rev{animation:gr-spin-rev 60s linear infinite}
  .gr-glow{animation:gr-breathe 6s ease-in-out infinite}
}
      `}</style>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[1] flex items-center justify-center overflow-hidden"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0, transparent 14%, #000 34%)",
          maskImage:
            "linear-gradient(to bottom, transparent 0, transparent 14%, #000 34%)",
        }}
      >
        <div className="relative h-[min(78vmin,760px)] w-[min(78vmin,760px)]">
          {/* Soft golden glow */}
          <span className="gr-glow absolute inset-[16%] rounded-full" />

          {/* Ripples (expand and fade) */}
          <span className="gr-ripple" style={{ animationDelay: "0s" }} />
          <span className="gr-ripple" style={{ animationDelay: "2.5s" }} />
          <span className="gr-ripple" style={{ animationDelay: "5s" }} />

          {/* Static inner rings */}
          <svg
            viewBox="0 0 400 400"
            className="absolute inset-0 h-full w-full"
            fill="none"
          >
            <circle cx="200" cy="200" r="132" stroke={`rgba(${GOLD},.26)`} />
            <circle cx="200" cy="200" r="126" stroke={`rgba(${GOLD},.14)`} />
          </svg>

          {/* Rotating ring with tick marks */}
          <svg
            viewBox="0 0 400 400"
            className="gr-spin absolute inset-0 h-full w-full"
            fill="none"
          >
            <circle
              cx="200"
              cy="200"
              r="178"
              stroke={`rgba(${GOLD},.38)`}
              strokeWidth="1"
            />
            {ticks.map((i) => (
              <line
                key={i}
                x1="200"
                y1="4"
                x2="200"
                y2={i % 4 === 0 ? 20 : 12}
                stroke={`rgba(${GOLD},${i % 4 === 0 ? 0.7 : 0.45})`}
                strokeWidth={i % 4 === 0 ? 1.6 : 1}
                transform={`rotate(${i * 7.5} 200 200)`}
              />
            ))}
          </svg>

          {/* Counter-rotating dashed ring with beads */}
          <svg
            viewBox="0 0 400 400"
            className="gr-spin-rev absolute inset-0 h-full w-full"
            fill="none"
          >
            <circle
              cx="200"
              cy="200"
              r="156"
              stroke={`rgba(${GOLD},.5)`}
              strokeWidth="1.5"
              strokeDasharray="70 20 10 20"
            />
            {[
              [200, 44],
              [356, 200],
              [200, 356],
              [44, 200],
            ].map(([cx, cy]) => (
              <circle
                key={`${cx}-${cy}`}
                cx={cx}
                cy={cy}
                r="3.5"
                fill={`rgba(${GOLD},.85)`}
              />
            ))}
          </svg>
        </div>
      </div>
    </>
  );
}