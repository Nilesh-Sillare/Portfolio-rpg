import type { BranchId } from "@/data/achievements";

export interface Cluster {
  hub: { x: number; y: number };
  nodes: { x: number; y: number }[]; // 5 nodes, in order from the hub outward
  label: { dx: number; dy: number; center?: boolean }; // unused now, kept so nothing else breaks
  vertical?: boolean; // links curve vertically (for the zigzag chain)
}

// Sizes in mockup pixels (1610 x 977)
export const HUB = 66;
export const NODE = 32;
// the trunk is the centre of the page (the art is stretched so its trunk lands here)
export const TRUNK = { x: 805, y: 520 };

export const clusters: Record<BranchId, Cluster> = {
  programming: { hub: { x: 129, y: 226 }, label: { dx: 0, dy: 0 },
    nodes: [{ x: 222, y: 268 }, { x: 315, y: 280 }, { x: 403, y: 303 }, { x: 488, y: 302 }, { x: 579, y: 330 }] },
  frontend: { hub: { x: 129, y: 478 }, label: { dx: 0, dy: 0 },
    nodes: [{ x: 227, y: 505 }, { x: 323, y: 520 }, { x: 416, y: 534 }, { x: 507, y: 518 }, { x: 594, y: 542 }] },
  backend: { hub: { x: 630, y: 196 }, label: { dx: 0, dy: 0 }, vertical: true,
    nodes: [{ x: 695, y: 238 }, { x: 764, y: 254 }, { x: 793, y: 290 }, { x: 731, y: 317 }, { x: 753, y: 375 }] },
  // Software Craftsman
  projects: { hub: { x: 1062, y: 445 }, label: { dx: 0, dy: 0 },
    nodes: [{ x: 1166, y: 436 }, { x: 1240, y: 418 }, { x: 1300, y: 460 }, { x: 1359, y: 480 }, { x: 1450, y: 460 }] },
  // DevOps Practitioner
  tools: { hub: { x: 938, y: 370 }, label: { dx: 0, dy: 0 },
    nodes: [{ x: 1040, y: 320 }, { x: 1120, y: 328 }, { x: 1200, y: 324 }, { x: 1284, y: 321 }, { x: 1370, y: 309 }] },
  career: { hub: { x: 959, y: 540 }, label: { dx: 0, dy: 0 },
    nodes: [{ x: 1078, y: 568 }, { x: 1170, y: 625 }, { x: 1266, y: 626 }, { x: 1358, y: 590 }, { x: 1365, y: 595 }] },
};