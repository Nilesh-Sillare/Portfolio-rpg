// scripts/make-masks.mjs
// Cuts one soft mask per branch out of the tree image, using colour (hue) plus a rough region.
// Run from the project root:  node scripts/make-masks.mjs
import sharp from "sharp";
import fs from "node:fs";

const SRC = "public/achievements-tree.webp";
const OUT = "public/ach-masks";
const MAX_W = 1600;
const FEATHER = 0.04; // softness of the region edges (0..1 of the image size)

// hue = [from, to] in degrees (red wraps around 0). region = [x0, y0, x1, y1] in 0..1.
const BRANCHES = {
  frontend:    { hue: [95, 170],  region: [0.0, 0.3, 0.46, 0.62],  minSat: 0.25, minVal: 0.18 },
  programming: { hue: [340, 22],  region: [0.0, 0.46, 0.48, 0.76], minSat: 0.3,  minVal: 0.2 },
  backend:     { hue: [255, 315], region: [0.0, 0.0, 0.5, 0.5],    minSat: 0.25, minVal: 0.2 },
  tools:       { hue: [195, 240], region: [0.5, 0.0, 1.0, 0.52],   minSat: 0.25, minVal: 0.2 },
  projects:    { hue: [28, 58],   region: [0.3, 0.0, 0.7, 0.5],    minSat: 0.35, minVal: 0.22 },
  career:      { silver: true,    region: [0.52, 0.4, 1.0, 0.78],  minSat: 0,    minVal: 0.45 },
};

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

function hueWeight(h, [a, b]) {
  const inside = a <= b ? h >= a && h <= b : h >= a || h <= b;
  if (inside) return 1;
  const d = (x, y) => Math.min(Math.abs(x - y), 360 - Math.abs(x - y));
  return clamp(1 - Math.min(d(h, a), d(h, b)) / 14);
}

function regionWeight(x, y, [x0, y0, x1, y1]) {
  const f = FEATHER;
  return smooth(x0 - f, x0 + f, x) * smooth(x1 + f, x1 - f, x) * smooth(y0 - f, y0 + f, y) * smooth(y1 + f, y1 - f, y);
}

async function writeMask(alpha8, w, h, file, sigma, gain) {
  let img = sharp(Buffer.from(alpha8), { raw: { width: w, height: h, channels: 1 } });
  if (sigma > 0) img = img.blur(sigma);
  if (gain !== 1) img = img.linear(gain, 0);
  const g = await img.raw().toBuffer();
  const rgba = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    rgba[i * 4] = 255;
    rgba[i * 4 + 1] = 255;
    rgba[i * 4 + 2] = 255;
    rgba[i * 4 + 3] = g[i];
  }
  await sharp(rgba, { raw: { width: w, height: h, channels: 4 } }).png({ compressionLevel: 9 }).toFile(file);
}

const { data, info } = await sharp(SRC)
  .resize({ width: MAX_W, withoutEnlargement: true })
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width: W, height: H } = info;
fs.mkdirSync(OUT, { recursive: true });

for (const [id, cfg] of Object.entries(BRANCHES)) {
  const alpha = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 3;
      const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
      const v = max, s = max === 0 ? 0 : d / max;
      let hue = 0;
      if (d > 0) {
        if (max === r) hue = ((g - b) / d) % 6;
        else if (max === g) hue = (b - r) / d + 2;
        else hue = (r - g) / d + 4;
        hue = (hue * 60 + 360) % 360;
      }
      const reg = regionWeight(x / W, y / H, cfg.region);
      if (reg <= 0) continue;
      let w;
      if (cfg.silver) {
        w = (1 - smooth(0.16, 0.34, s)) * smooth(cfg.minVal, cfg.minVal + 0.25, v);
      } else {
        w = hueWeight(hue, cfg.hue) * smooth(cfg.minSat, cfg.minSat + 0.2, s) * smooth(cfg.minVal, cfg.minVal + 0.25, v);
      }
      alpha[y * W + x] = Math.round(clamp(w * reg * 1.7) * 255);
    }
  }
  await writeMask(alpha, W, H, `${OUT}/${id}.png`, 1.2, 1);       // tight mask: the branch itself
  await writeMask(alpha, W, H, `${OUT}/${id}-glow.png`, 16, 2.2); // soft mask: the bloom around it
  console.log("wrote", id);
}
console.log(`Done. Masks are in ${OUT}/`);