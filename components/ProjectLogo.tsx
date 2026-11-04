/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";

const ICONS: Record<string, ReactNode> = {
  "heart-pulse": (
    <>
      <path d="M12 20.5C6 16 3 12.8 3 9a4.5 4.5 0 0 1 9-1.5A4.5 4.5 0 0 1 21 9c0 3.8-3 7-9 11.5Z" />
      <path d="M5 12h3.5l1.7-3 2.6 6 1.8-3H19" />
    </>
  ),
  dumbbell: (
    <>
      <path d="M7 12h10" />
      <rect x="4" y="8" width="3" height="8" rx="1" />
      <rect x="17" y="8" width="3" height="8" rx="1" />
      <path d="M2 10v4M22 10v4" />
    </>
  ),
  "file-transfer": (
    <>
      <rect x="2" y="6" width="7" height="12" rx="1.5" />
      <rect x="15" y="6" width="7" height="12" rx="1.5" />
      <path d="M10 9h4m-1.5-1.5L14 9l-1.5 1.5M14 15h-4m1.5-1.5L10 15l1.5 1.5" />
    </>
  ),
  swords: (
    <>
      <path d="M5 19L19 5M5.5 14.5l4 4" />
      <path d="M19 19L5 5M14.5 18.5l4-4" />
    </>
  ),
  code: <path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 6l-3 12" />,
};

type Props = {
  icon?: string;
  name: string;
  accent: string;
  size?: "md" | "lg";
  className?: string;
};

export default function ProjectLogo({ icon, name, accent, size = "lg", className = "" }: Props) {
  const lg = size === "lg";
  const isImage = !!icon && (icon.startsWith("/") || icon.startsWith("http"));
  const isText = !!icon && !isImage && !ICONS[icon] && [...icon].length <= 2;
  const paths = icon && !isImage && !isText ? (ICONS[icon] ?? ICONS.code) : null;

  return (
    <div
      className={`flex shrink-0 items-center justify-center border ${
        lg ? "h-28 w-28 rounded-3xl" : "h-14 w-14 rounded-2xl"
      } ${className}`}
      style={{ background: `${accent}1f`, borderColor: `${accent}55`, boxShadow: `0 0 40px ${accent}33` }}
    >
      {isImage ? (
        <img src={icon} alt={`${name} logo`} className="h-3/4 w-3/4 object-contain" />
      ) : paths ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke={accent}
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className={lg ? "h-14 w-14" : "h-7 w-7"}
          style={{ filter: `drop-shadow(0 0 6px ${accent}aa)` }}
        >
          {paths}
        </svg>
      ) : (
        <span className={`${lg ? "text-5xl" : "text-2xl"} font-semibold`} style={{ color: accent }}>
          {isText ? icon : name[0]}
        </span>
      )}
    </div>
  );
}