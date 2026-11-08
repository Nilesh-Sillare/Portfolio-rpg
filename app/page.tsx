import { landing } from "@/data/site";
import { projects } from "@/data/projects";
import { resolveAll, summarize } from "@/lib/achievementsState";
import HeroScene from "@/components/hero/HeroScene";

export default function Home() {
  const done = projects.filter((p) => p.status === "Completed").length;
  const s = summarize(resolveAll(done));

  return (
    <HeroScene
      stats={{ projects: done, unlocked: s.unlocked, total: s.total, quest: landing.quest }}
    />
  );
}
