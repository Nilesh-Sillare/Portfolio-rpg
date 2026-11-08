"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { BadgeCheck, Check, ExternalLink, RotateCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  issuer: string;
  dateLabel: string;
  categoryLabel: string;
  description: string;
  tags: string[];
  url?: string;
  accent: string;
  rarityLabel: string;
  rarityColor: string;
  Icon: LucideIcon;
  logo: ReactNode;
  flipped: boolean;
  activeTag: string | null;
  onTag: (tag: string) => void;
  onBack: () => void;
};

const css = `
.cb-in{
  position:relative;z-index:1;display:flex;height:100%;min-height:0;
  flex-direction:column;gap:9px;padding:17px 17px 15px;
}
/* etched frame with cut corners */
.cb-etch{
  position:absolute;inset:6px;pointer-events:none;
  border:1px solid color-mix(in srgb,var(--accent) 38%,transparent);
  clip-path:polygon(10px 0,calc(100% - 10px) 0,100% 10px,100% calc(100% - 10px),calc(100% - 10px) 100%,10px 100%,0 calc(100% - 10px),0 10px);
}
/* fine engraved lines */
.cb-engrave{
  position:absolute;inset:0;pointer-events:none;opacity:.55;
  background:repeating-linear-gradient(135deg,rgba(255,255,255,.035) 0 1px,transparent 1px 7px);
}
/* holographic foil that follows the cursor */
.cb-foil{
  position:absolute;inset:0;z-index:2;pointer-events:none;
  mix-blend-mode:screen;opacity:.85;
  background:linear-gradient(115deg,transparent 22%,rgba(255,90,170,.10) 36%,rgba(90,200,255,.12) 50%,rgba(255,224,110,.10) 64%,transparent 78%);
  background-size:230% 230%;
  background-position:var(--mx,50%) var(--my,50%);
}
.cb-cell{
  min-width:0;border-radius:8px;padding:5px 8px;
  border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.03);
}

@media (prefers-reduced-motion: no-preference){
  @keyframes cb-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  @keyframes cb-stamp{
    0%{transform:rotate(-6deg) scale(2.3);opacity:0}
    60%{transform:rotate(-6deg) scale(.92);opacity:1}
    100%{transform:rotate(-6deg) scale(1);opacity:1}
  }
  .cred-item[data-flipped="true"] .cb-row{
    animation:cb-in .5s cubic-bezier(.2,.7,.2,1) both;
    animation-delay:calc(.3s + var(--k,0) * 70ms);
  }
  .cred-item[data-flipped="true"] .cb-stamp{
    animation:cb-stamp .5s cubic-bezier(.2,.8,.2,1) .8s both;
  }
}
`;

export default function CertificateBack({
  title,
  issuer,
  dateLabel,
  categoryLabel,
  description,
  tags,
  url,
  accent,
  rarityLabel,
  rarityColor,
  Icon,
  logo,
  flipped,
  activeTag,
  onTag,
  onBack,
}: Props) {
  const verified = Boolean(url);
  const stampColor = verified ? "#34d399" : "#d4a843";
  const row = (k: number, extra?: CSSProperties) =>
    ({ "--k": k, ...extra }) as CSSProperties;

  return (
    <div className="cred-face cred-back cred-plate" aria-hidden={!flipped}>
      <style>{css}</style>
      <span className="cred-plate-in">
        <span aria-hidden="true" className="cred-shine" />
        <span aria-hidden="true" className="cb-engrave" />
        <span aria-hidden="true" className="cb-etch" />

        {/* Watermark seal */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-7 -right-7 flex h-44 w-44 items-center justify-center opacity-[0.10]"
          style={{ color: accent }}
        >
          <svg
            viewBox="0 0 100 100"
            className="cred-spin absolute inset-0"
            fill="none"
          >
            <circle
              cx="50"
              cy="50"
              r="48"
              stroke="currentColor"
              strokeDasharray="2 5"
            />
            <circle cx="50" cy="50" r="38" stroke="currentColor" />
          </svg>
          <Icon size={56} strokeWidth={1.2} />
        </span>

        <span aria-hidden="true" className="cb-foil" />

        <span className="cb-in">
          {/* Header: category medallion + rarity */}
          <span
            className="cb-row flex items-center justify-between gap-2"
            style={row(0)}
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border"
                style={{
                  color: accent,
                  borderColor: `${accent}88`,
                  background: `${accent}14`,
                  boxShadow: `0 0 12px ${accent}44`,
                }}
              >
                <Icon size={14} />
              </span>
              <span className="truncate text-[10px] tracking-[0.2em] text-mist">
                {categoryLabel.toUpperCase()}
              </span>
            </span>
            <span
              className="flex shrink-0 items-center gap-1.5 text-[10px] tracking-[0.2em]"
              style={{ color: rarityColor }}
            >
              <span
                aria-hidden="true"
                className="inline-block h-1.5 w-1.5 rotate-45"
                style={{
                  background: rarityColor,
                  boxShadow: `0 0 6px ${rarityColor}`,
                }}
              />
              {rarityLabel}
            </span>
          </span>

          {/* Title with ornamental divider */}
          <span className="cb-row block text-center" style={row(1)}>
            <span className="block text-[9px] tracking-[0.35em] text-mist">
              CERTIFICATE
            </span>
            <span className="mt-1 line-clamp-2 block font-display text-[15px] leading-tight text-ink">
              {title}
            </span>
            <span className="mx-auto mt-2 flex items-center justify-center gap-2">
              <span
                className="h-px w-10"
                style={{
                  background: `linear-gradient(90deg, transparent, ${accent})`,
                }}
              />
              <span
                className="h-1.5 w-1.5 rotate-45"
                style={{
                  background: accent,
                  boxShadow: `0 0 8px ${accent}`,
                }}
              />
              <span
                className="h-px w-10"
                style={{
                  background: `linear-gradient(270deg, transparent, ${accent})`,
                }}
              />
            </span>
          </span>

          {/* Description with the stamp over it */}
          <span
            className="cb-row relative block min-h-0 flex-1"
            style={row(2)}
          >
            <span
              className="absolute inset-0 overflow-hidden border-l-2 pl-2.5 text-[11.5px] leading-relaxed text-mist"
              style={
                {
                  borderColor: rarityColor,
                  WebkitMaskImage:
                    "linear-gradient(to bottom, #000 70%, transparent)",
                  maskImage: "linear-gradient(to bottom, #000 70%, transparent)",
                } as CSSProperties
              }
            >
              {description}
            </span>
            <span
              className="cb-stamp absolute bottom-0 right-0 flex items-center gap-1 rounded-md border-2 px-2 py-0.5 text-[10px] font-bold tracking-[0.25em]"
              style={{
                color: stampColor,
                borderColor: stampColor,
                background: "rgba(5,3,10,.6)",
                boxShadow: `0 0 14px ${stampColor}55, inset 0 0 8px ${stampColor}33`,
                transform: "rotate(-6deg)",
              }}
            >
              {verified ? <BadgeCheck size={12} /> : <Check size={12} />}
              {verified ? "VERIFIED" : "COMPLETED"}
            </span>
          </span>

          {/* Ledger */}
          <span className="cb-row grid grid-cols-2 gap-1.5" style={row(3)}>
            <span className="cb-cell block">
              <span className="block text-[9px] tracking-[0.25em] text-mist">
                ISSUER
              </span>
              <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-ink">
                {logo}
                <span className="truncate">{issuer}</span>
              </span>
            </span>
            <span className="cb-cell block">
              <span className="block text-[9px] tracking-[0.25em] text-mist">
                ISSUED
              </span>
              <span className="mt-0.5 block truncate text-xs text-ink">
                {dateLabel}
              </span>
            </span>
          </span>

          {/* Skills (click to filter) */}
          {tags.length > 0 && (
            <ul className="cb-row flex flex-wrap gap-1" style={row(4)}>
              {tags.slice(0, 4).map((t) => (
                <li key={t}>
                  <button
                    type="button"
                    tabIndex={flipped ? 0 : -1}
                    onClick={() => onTag(t)}
                    aria-pressed={activeTag === t}
                    className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-ink transition-colors hover:border-[var(--accent)]"
                    style={
                      activeTag === t
                        ? { borderColor: accent, background: `${accent}26` }
                        : undefined
                    }
                  >
                    #{t}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Actions */}
          <span className="cb-row flex items-center gap-2" style={row(5)}>
            {url ? (
              <Link
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={flipped ? 0 : -1}
                className="flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs text-ink transition-all hover:brightness-125"
                style={{
                  borderColor: `${accent}cc`,
                  background: `linear-gradient(180deg, ${accent}38, ${accent}12)`,
                  boxShadow: `0 0 14px ${accent}33`,
                }}
              >
                <ExternalLink size={13} />
                View credential
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="flex min-h-9 flex-1 cursor-not-allowed items-center justify-center gap-1.5 rounded-lg border border-white/10 px-3 text-xs text-mist opacity-60"
              >
                <BadgeCheck size={13} />
                Link not added yet
              </span>
            )}
            <button
              type="button"
              tabIndex={flipped ? 0 : -1}
              onClick={onBack}
              aria-label="Flip the card back"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-mist transition-colors hover:border-[var(--accent)] hover:text-ink"
            >
              <RotateCw size={14} />
            </button>
          </span>
        </span>
      </span>
    </div>
  );
}