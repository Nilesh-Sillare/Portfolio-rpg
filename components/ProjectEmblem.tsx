import ProjectLogo from "@/components/ProjectLogo";

type Props = {
  icon?: string;
  name: string;
  accent: string;
  size?: number; // plate size in px
  className?: string;
};

const ANIMATED = ["heart-pulse", "file-transfer", "dumbbell", "swords"];

export default function ProjectEmblem({ icon, name, accent, size = 80, className = "" }: Props) {
  // Not one of the animated icons: use the normal logo
  if (!icon || !ANIMATED.includes(icon)) {
    return <ProjectLogo icon={icon} name={name} accent={accent} size="md" className={className} />;
  }

  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center rounded-2xl bg-[#0b0712] ${className}`}
      style={{
        width: size,
        height: size,
        color: accent,
        border: `1.5px solid ${accent}`,
        boxShadow: `0 0 20px ${accent}66, inset 0 0 14px ${accent}22`,
      }}
    >
      {/* viewBox is centred on 0,0 so everything rotates and scales around the middle */}
      <svg viewBox="-32 -32 64 64" width={size * 0.74} height={size * 0.74}>
        {icon === "heart-pulse" && (
          <>
            <circle className="pe-ring" r="15" {...common} strokeWidth={1.5} />
            <g className="pe-beat">
              <path
                d="M0 15 C-20 3 -18 -13 -7 -13 C-3 -13 0 -10 0 -7 C0 -10 3 -13 7 -13 C18 -13 20 3 0 15 Z"
                {...common}
                fill="currentColor"
                fillOpacity={0.2}
              />
            </g>
            <path
              className="pe-ecg"
              pathLength={1}
              d="M-26 2 H-12 L-7 -9 L-1 13 L4 -5 L8 2 H26"
              {...common}
              stroke="#ffffff"
              strokeWidth={2}
            />
          </>
        )}

        {icon === "file-transfer" && (
          <>
            {/* phone */}
            <rect x="-27" y="-11" width="13" height="22" rx="2.5" {...common} />
            <path d="M-22 7 H-19" {...common} />
            {/* screen */}
            <rect x="13" y="-10" width="16" height="12" rx="1.5" {...common} />
            <path d="M10 7 H32" {...common} />
            {/* packets travelling from the phone to the screen */}
            {[-8, -1, 6].map((x, i) => (
              <g key={x} transform={`translate(${x} 0)`}>
                <g className="pe-chev" style={{ animationDelay: `${i * 0.18}s` }}>
                  <path d="M-2 -5 L3 0 L-2 5" {...common} strokeWidth={2.6} />
                </g>
              </g>
            ))}
          </>
        )}

        {icon === "dumbbell" && (
          <>
            <g className="pe-impact">
              <path d="M-27 -10 L-30 -15 M27 -10 L30 -15 M0 -15 L0 -21" {...common} strokeWidth={1.8} />
            </g>
            <g className="pe-lift">
              <rect x="-16" y="-2.2" width="32" height="4.4" rx="2" {...common} />
              <rect x="-21" y="-11" width="6" height="22" rx="2" {...common} fill="currentColor" fillOpacity={0.22} />
              <rect x="15" y="-11" width="6" height="22" rx="2" {...common} fill="currentColor" fillOpacity={0.22} />
              <rect x="-27" y="-6.5" width="5" height="13" rx="2" {...common} />
              <rect x="22" y="-6.5" width="5" height="13" rx="2" {...common} />
            </g>
          </>
        )}

        {icon === "swords" && (
          <>
            <g className="pe-sw-a">
              <path d="M0 -25 L3.5 -19 V10 H-3.5 V-19 Z" {...common} fill="currentColor" fillOpacity={0.18} />
              <path d="M-9 10 H9 M0 10 V19" {...common} />
              <circle cy="21.5" r="2" {...common} strokeWidth={1.6} />
            </g>
            <g className="pe-sw-b">
              <path d="M0 -25 L3.5 -19 V10 H-3.5 V-19 Z" {...common} fill="currentColor" fillOpacity={0.18} />
              <path d="M-9 10 H9 M0 10 V19" {...common} />
              <circle cy="21.5" r="2" {...common} strokeWidth={1.6} />
            </g>
            <g className="pe-spark">
              <path d="M0 -9 V9 M-9 0 H9 M-6 -6 L6 6 M-6 6 L6 -6" {...common} stroke="#ffffff" strokeWidth={1.8} />
            </g>
          </>
        )}
      </svg>

      <style>{`
        /* Resting (still) positions */
        .pe-sw-a { transform: rotate(45deg); }
        .pe-sw-b { transform: rotate(-45deg); }
        .pe-spark, .pe-impact, .pe-ring { opacity: 0; }

        @keyframes pe-beat {
          0%, 100% { transform: scale(1); }
          14% { transform: scale(1.16); }
          28% { transform: scale(1); }
          42% { transform: scale(1.1); }
          70% { transform: scale(1); }
        }
        @keyframes pe-ring {
          0% { transform: scale(1); opacity: .55; }
          70%, 100% { transform: scale(1.9); opacity: 0; }
        }
        @keyframes pe-ecg {
          from { stroke-dashoffset: .4; }
          to { stroke-dashoffset: -1; }
        }
        @keyframes pe-chev {
          0%, 100% { transform: translateX(-2px); opacity: .25; }
          50% { transform: translateX(3px); opacity: 1; }
        }
        @keyframes pe-lift {
          0%, 40%, 100% { transform: translate(0,0) rotate(0); }
          5% { transform: translate(-1.6px, 1px) rotate(-3deg); }
          10% { transform: translate(1.6px, -1px) rotate(3deg); }
          15% { transform: translate(-1.6px, 1px) rotate(-3deg); }
          20% { transform: translate(1.6px, -1px) rotate(3deg); }
          25% { transform: translate(-1.2px, .6px) rotate(-2deg); }
          30% { transform: translate(1.2px, -.6px) rotate(2deg); }
          35% { transform: translate(-.6px, 0) rotate(-1deg); }
        }
        @keyframes pe-impact {
          0%, 40%, 100% { opacity: 0; }
          6%, 28% { opacity: 1; }
        }
        @keyframes pe-sw-a {
          0%, 100% { transform: rotate(100deg); }
          22% { transform: rotate(45deg); }
          30% { transform: rotate(58deg); }
          38%, 68% { transform: rotate(45deg); }
        }
        @keyframes pe-sw-b {
          0%, 100% { transform: rotate(-100deg); }
          22% { transform: rotate(-45deg); }
          30% { transform: rotate(-58deg); }
          38%, 68% { transform: rotate(-45deg); }
        }
        @keyframes pe-spark {
          0%, 18%, 100% { opacity: 0; transform: scale(.3); }
          24% { opacity: 1; transform: scale(1.2); }
          42% { opacity: 0; transform: scale(1.7); }
        }

        /* Animate only while the card is hovered or focused, and never for reduced motion */
        @media (prefers-reduced-motion: no-preference) {
          .pc-card:is(:hover, :focus-visible) .pe-beat { animation: pe-beat 1.1s ease-in-out infinite; }
          .pc-card:is(:hover, :focus-visible) .pe-ring { animation: pe-ring 1.1s ease-out infinite; }
          .pc-card:is(:hover, :focus-visible) .pe-ecg { stroke-dasharray: .4 1; animation: pe-ecg 1.1s linear infinite; }
          .pc-card:is(:hover, :focus-visible) .pe-chev { animation: pe-chev 1s ease-in-out infinite; }
          .pc-card:is(:hover, :focus-visible) .pe-lift { animation: pe-lift 1.8s ease-in-out infinite; }
          .pc-card:is(:hover, :focus-visible) .pe-impact { animation: pe-impact 1.8s ease-in-out infinite; }
          .pc-card:is(:hover, :focus-visible) .pe-sw-a { animation: pe-sw-a 2s ease-in-out infinite; }
          .pc-card:is(:hover, :focus-visible) .pe-sw-b { animation: pe-sw-b 2s ease-in-out infinite; }
          .pc-card:is(:hover, :focus-visible) .pe-spark { animation: pe-spark 2s ease-out infinite; }
        }
      `}</style>
    </span>
  );
}