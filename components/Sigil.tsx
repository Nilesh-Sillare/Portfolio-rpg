// The crimson sigil used as the logo. Reusable at any size.
type SigilProps = {
  size?: number;
  className?: string;
};

export default function Sigil({ size = 32, className = "" }: SigilProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={className}
      style={{ filter: "drop-shadow(0 0 6px rgba(255,36,79,0.55))" }}
    >
      {/* central blade */}
      <path d="M24 2 L28.5 20 L24 44 L19.5 20 Z" fill="#ff244f" />
      {/* curved prongs */}
      <path
        d="M24 25 C15 25 9.5 19 8.5 8 C13.5 14.5 18.5 16.5 24 17.5 C29.5 16.5 34.5 14.5 39.5 8 C38.5 19 33 25 24 25 Z"
        fill="#ff244f"
        fillOpacity="0.85"
      />
      {/* small base diamond */}
      <path d="M24 38 L27 42 L24 46 L21 42 Z" fill="#ff244f" fillOpacity="0.7" />
    </svg>
  );
}