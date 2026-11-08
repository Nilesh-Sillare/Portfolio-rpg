import type { Metadata } from "next";
import { Award, BadgeCheck, Building2 } from "lucide-react";
import SceneBackground from "@/components/SceneBackground";
import GoldenRipple from "@/components/GoldenRipple";
import CredentialsExplorer from "@/components/CredentialsExplorer";
import CountUp from "@/components/CountUp";
import { credentials } from "@/data/credentials";

export const metadata: Metadata = {
  title: "Credentials",
};

export default function CredentialsPage() {
  const stats = [
    { label: "Total certificates", value: credentials.length, Icon: Award },
    {
      label: "Verified credentials",
      value: credentials.filter((c) => c.url).length,
      Icon: BadgeCheck,
    },
    {
      label: "Issuers",
      value: new Set(credentials.map((c) => c.issuer)).size,
      Icon: Building2,
    },
  ];

  return (
    <div className="relative lg:h-[100dvh] lg:overflow-hidden">
      <SceneBackground
        images={["/backgrounds/Credential.png"]}
        accent="#ff2d55"
        embers={22}
      />

      {/* Soft crimson glow at the top of the page */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[420px] bg-[radial-gradient(ellipse_at_80%_0%,rgba(255,36,79,0.18),transparent_60%)]"
      />

      {/* Golden halo behind the carousel */}
      <GoldenRipple />

      <div className="relic-scroll relative z-10 mx-auto flex w-full max-w-[1400px] flex-col px-5 pb-6 pt-24 md:px-8 lg:h-full lg:overflow-y-auto lg:overflow-x-hidden lg:pt-[88px]">
        <header className="flex shrink-0 flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-3 text-[11px] tracking-[0.35em] text-mist">
              <span aria-hidden="true" className="h-px w-8 bg-mist/60" />
              CREDENTIAL
            </p>
            <h1 className="mt-2 font-display text-4xl font-medium tracking-[0.04em] text-ink md:text-5xl">
              THE VAULT OF BADGES
            </h1>
            <p className="mt-2 text-base text-mist md:text-lg">
              Every certificate is proof of a step taken: earned, verified and
              kept.
            </p>
          </div>

          <ul className="grid grid-cols-3 overflow-hidden rounded-xl border border-white/10 bg-charcoal/70 backdrop-blur-md">
            {stats.map(({ label, value, Icon }) => (
              <li
                key={label}
                className="flex items-center gap-3 border-l border-white/10 px-3 py-3 transition-colors first:border-l-0 hover:bg-crimson/10 md:px-4"
              >
                <Icon size={22} className="shrink-0 text-crimson" />
                <span className="flex flex-col">
                  <span className="font-display text-xl text-ink">
                    <CountUp value={value} />
                  </span>
                  <span className="text-[10px] tracking-[0.08em] text-mist">
                    {label}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </header>

        {/* The explorer fills the remaining height, with a minimum so the carousel always fits */}
        <div className="mt-6 lg:min-h-[620px] lg:flex-1">
          <CredentialsExplorer />
        </div>
      </div>
    </div>
  );
}