// components/AchGlyph.tsx
import type { CSSProperties } from "react";
import {
  Atom, Braces, Briefcase, Castle, Check, Cloud, Code, Coffee, Compass, Container, Cpu, Crown,
  Database, FileCode, FlaskConical, Folder, Git, GitBranch, GitPullRequest, Globe, GraduationCap, Hammer,
  HardDrive, Languages, Layers, LayoutTemplate, Leaf, Lock, Monitor, Palette, Puzzle, Rocket,
  ScrollText, Server, ShieldCheck, Sparkles, Terminal, Trophy, Wind, Workflow, Wrench,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  layout: LayoutTemplate, wind: Wind, atom: Atom, castle: Castle, palette: Palette,
  braces: Braces, code: Code, "file-code": FileCode, coffee: Coffee, flask: FlaskConical,
  database: Database, scroll: ScrollText, server: Server, shield: ShieldCheck, leaf: Leaf,
  git: GitBranch, terminal: Terminal, cloud: Cloud, container: Container, workflow: Workflow,
  rocket: Rocket, globe: Globe, layers: Layers, hammer: Hammer, "pull-request": GitPullRequest,
  languages: Languages, puzzle: Puzzle, graduation: GraduationCap, trophy: Trophy, compass: Compass,
  monitor: Monitor, cpu: Cpu, "hard-drive": HardDrive, wrench: Wrench, folder: Folder,
  briefcase: Briefcase, crown: Crown, lock: Lock, check: Check,
};

export default function AchGlyph({
  name, className, style,
}: { name: string; className?: string; style?: CSSProperties }) {
  const Icon = MAP[name] ?? Sparkles;
  return <Icon className={className} style={style} strokeWidth={1.8} aria-hidden />;
}