import type { ComponentType } from "react";
import {
  Boxes, Network, PenTool, Webhook, Layers, Database, FlaskConical, Repeat,
  Workflow, Cloud, ShieldAlert, KeyRound, Lock,
  Swords, Eye, Wand, Cog, Shield,
} from "lucide-react";
import { FaHtml5, FaCss3Alt, FaJava, FaPython, FaReact, FaNodeJs } from "react-icons/fa";
import { TbBrandJavascript, TbBrandTypescript } from "react-icons/tb";
import {
  SiCplusplus, SiTailwindcss, SiNextdotjs,
  SiPostgresql, SiMongodb, SiSupabase,
} from "react-icons/si";
import type { EmblemKey, IconKey } from "@/data/skills";

type Ico = ComponentType<{ className?: string }>;

const ICONS: Record<IconKey, { Icon: Ico; color: string }> = {
  javascript: { Icon: TbBrandJavascript, color: "#f7df1e" }, // was lavender, now JS yellow
  typescript: { Icon: TbBrandTypescript, color: "#3b82f6" },
  python: { Icon: FaPython, color: "#e8963a" }, // nudged toward orange so it differs from JS
  java: { Icon: FaJava, color: "#ff7a45" },
  cpp: { Icon: SiCplusplus, color: "#5b9cff" },
  oop: { Icon: Boxes, color: "#ff244f" },
  dsa: { Icon: Network, color: "#b9a5e8" },
  html: { Icon: FaHtml5, color: "#ff5a2c" },
  css: { Icon: FaCss3Alt, color: "#4a8cff" },
  tailwind: { Icon: SiTailwindcss, color: "#38bdf8" },
  react: { Icon: FaReact, color: "#61dafb" },
  nextjs: { Icon: SiNextdotjs, color: "#f4f0fa" },
  uiux: { Icon: PenTool, color: "#ff6ad5" },
  nodejs: { Icon: FaNodeJs, color: "#7ed957" },
  rest: { Icon: Webhook, color: "#ff244f" },
  dbdesign: { Icon: Layers, color: "#b9a5e8" },
  sql: { Icon: Database, color: "#4fd1c5" },
  postgres: { Icon: SiPostgresql, color: "#6ba5ff" },
  mongodb: { Icon: SiMongodb, color: "#4fd16b" },
  supabase: { Icon: SiSupabase, color: "#3ecf8e" },
  testing: { Icon: FlaskConical, color: "#ff9f43" },
  cicd: { Icon: Repeat, color: "#9b5cff" },
  systemdesign: { Icon: Workflow, color: "#b9a5e8" },
  cloud: { Icon: Cloud, color: "#7cc4ff" },
  cyber: { Icon: ShieldAlert, color: "#ff244f" },
  auth: { Icon: KeyRound, color: "#ff8fa3" },
};

export const EMBLEMS: Record<EmblemKey, Ico> = {
  sword: Swords,
  eye: Eye,
  staff: Wand,
  gear: Cog,
  shield: Shield,
};

const OCT =
  "polygon(30% 0, 70% 0, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0 70%, 0 30%)";

export function HexBadge({
  icon,
  locked,
  size = 76,
  active = false,
}: {
  icon: IconKey;
  locked: boolean;
  size?: number;
  active?: boolean;
}) {
  const { Icon, color } = ICONS[icon];
  const iconPx = Math.round(size * 0.42);
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{
        width: size,
        height: size,
        filter: locked ? undefined : `drop-shadow(0 0 ${active ? 16 : 8}px ${color}b0)`,
        transition: "filter .3s",
      }}
    >
      {/* frame */}
      <span
        className="absolute inset-0"
        style={{
          clipPath: OCT,
          background: locked ? "rgba(155,92,255,0.22)" : active ? color : `${color}99`,
        }}
      />
      {/* inner fill */}
      <span
        className="absolute inset-[1.5px]"
        style={{
          clipPath: OCT,
          background: locked ? "#0b0a12" : `radial-gradient(circle, ${color}26, #0b0a12 72%)`,
        }}
      />
      <span
        className="relative flex items-center justify-center"
        style={{ color: locked ? "#4b4560" : color, width: iconPx, height: iconPx }}
      >
        <Icon className="h-full w-full" />
      </span>
      {locked && (
        <span className="absolute bottom-[8%] right-[8%] flex h-5 w-5 items-center justify-center rounded-full bg-[#0b0a12] text-[#b8b0c9] ring-1 ring-[#9b5cff]/40">
          <Lock className="h-3 w-3" aria-hidden="true" />
        </span>
      )}
    </span>
  );
}