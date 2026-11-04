// lib/achievementsState.ts
import { achievements, branches, type BranchId, type Evidence, type Tier } from "@/data/achievements";

export type Status = "unlocked" | "progress" | "available" | "locked";

export interface Resolved {
  id: string;
  name: string;
  fantasyName: string;
  description: string;
  icon: string;
  tier: Tier;
  branch?: BranchId;
  status: Status;
  progress: number; // 0..1
  ranks: { label: string; requirement: string; done: boolean; evidence?: Evidence }[];
  requires: { id: string; name: string; done: boolean }[];
}

export interface BranchStat {
  unlocked: number;
  inProgress: number;
  total: number;
  level: number; // 0..1, drives the colour of the branch in the tree
  epicDone: boolean;
}

export interface Summary {
  total: number;
  unlocked: number;
  epics: number;
  legendary: boolean;
  stats: Record<BranchId, BranchStat>;
}

const byId = new Map(achievements.map((a) => [a.id, a]));

export function resolveAll(projectsCompleted: number): Record<string, Resolved> {
  const memo = new Map<string, boolean[]>();

  const ranksOf = (id: string): boolean[] => {
    const hit = memo.get(id);
    if (hit) return hit;
    const a = byId.get(id);
    if (!a) return [];
    memo.set(id, []); // cycle guard
    const res = a.ranks.map((r) => {
      if (r.evidence) return true;
      if (r.auto?.type === "projectsCompleted") return projectsCompleted >= r.auto.count;
      if (r.auto?.type === "requiresUnlocked") return (a.requires ?? []).every(isUnlocked);
      return false;
    });
    memo.set(id, res);
    return res;
  };
  const isUnlocked = (id: string) => {
    const r = ranksOf(id);
    return r.length > 0 && r.every(Boolean);
  };

  const out: Record<string, Resolved> = {};
  for (const a of achievements) {
    const done = ranksOf(a.id);
    const doneCount = done.filter(Boolean).length;
    const tier: Tier = a.tier ?? "normal";
    const requires = (a.requires ?? []).map((id) => ({ id, name: byId.get(id)?.name ?? id, done: isUnlocked(id) }));

    let status: Status;
    let progress: number;
    if (isUnlocked(a.id)) {
      status = "unlocked";
      progress = 1;
    } else if (tier !== "normal") {
      const n = requires.filter((r) => r.done).length;
      progress = requires.length ? n / requires.length : 0;
      status = n > 0 ? "progress" : "locked";
    } else {
      const flagged = !!a.inProgress || a.ranks.some((r) => r.inProgress);
      progress = doneCount > 0 ? doneCount / a.ranks.length : flagged ? 0.4 : 0;
      if (doneCount > 0 || flagged) status = "progress";
      else status = requires.every((r) => r.done) ? "available" : "locked";
    }

    out[a.id] = {
      id: a.id,
      name: a.name,
      fantasyName: a.fantasyName,
      description: a.description,
      icon: a.icon,
      tier,
      branch: a.branch,
      status,
      progress,
      ranks: a.ranks.map((r, i) => ({ label: r.label, requirement: r.requirement, done: done[i] ?? false, evidence: r.evidence })),
      requires,
    };
  }
  return out;
}

export function summarize(res: Record<string, Resolved>): Summary {
  const all = Object.values(res);
  const stats = {} as Record<BranchId, BranchStat>;
  for (const b of branches) {
    const normals = b.nodes.map((id) => res[id]);
    const u = normals.filter((r) => r.status === "unlocked").length;
    const p = normals.filter((r) => r.status === "progress").length;
    stats[b.id] = {
      unlocked: u,
      inProgress: p,
      total: b.nodes.length,
      level: Math.min(1, (u + 0.4 * p) / b.nodes.length),
      epicDone: res[b.epic].status === "unlocked",
    };
  }
  return {
    total: all.length,
    unlocked: all.filter((r) => r.status === "unlocked").length,
    epics: all.filter((r) => r.tier === "epic" && r.status === "unlocked").length,
    legendary: res["successful"].status === "unlocked",
    stats,
  };
}