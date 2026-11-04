"use client";
import { createContext, useContext, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type { Resolved } from "@/lib/achievementsState";

type Ctx = {
  sel: string | null; // clicked id: dims the other branches
  hov: string | null; // hovered id: previews only
  setSel: Dispatch<SetStateAction<string | null>>;
  setHov: Dispatch<SetStateAction<string | null>>;
  focus: Resolved["branch"] | undefined; // branch of the clicked id
  hotBranch: Resolved["branch"] | undefined; // branch of the hovered id
};

const AchCtx = createContext<Ctx | null>(null);

export function useAchSel() {
  const c = useContext(AchCtx);
  if (!c) throw new Error("useAchSel must be used inside <AchSelection>");
  return c;
}

export default function AchSelection({ resolved, children }: { resolved: Record<string, Resolved>; children: ReactNode }) {
  const [sel, setSel] = useState<string | null>(null);
  const [hov, setHov] = useState<string | null>(null);
  const focus = sel ? resolved[sel]?.branch : undefined;
  const hotBranch = hov ? resolved[hov]?.branch : undefined;
  const value = useMemo(() => ({ sel, hov, setSel, setHov, focus, hotBranch }), [sel, hov, focus, hotBranch]);
  return <AchCtx.Provider value={value}>{children}</AchCtx.Provider>;
}