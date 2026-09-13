// Compare two PNGs; write a diff image and print the mismatch ratio plus the rows with most difference.
import fs from "node:fs";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
const [, , a, b, out] = process.argv;
const A = PNG.sync.read(fs.readFileSync(a));
const B = PNG.sync.read(fs.readFileSync(b));
const w = Math.min(A.width, B.width), h = Math.min(A.height, B.height);
const crop = (p) => { const o = new PNG({ width: w, height: h }); PNG.bitblt(p, o, 0, 0, w, h, 0, 0); return o; };
const ca = crop(A), cb = crop(B);
const diff = new PNG({ width: w, height: h });
const n = pixelmatch(ca.data, cb.data, diff.data, w, h, { threshold: 0.1, includeAA: false });
fs.writeFileSync(out, PNG.sync.write(diff));
// per-band summary (every 100px)
const bands = [];
for (let y = 0; y < h; y += 100) {
  let c = 0;
  for (let yy = y; yy < Math.min(y + 100, h); yy++) for (let x = 0; x < w; x++) { const i = (yy * w + x) * 4; if (diff.data[i] === 255 && diff.data[i + 1] === 0) c++; }
  bands.push([y, c]);
}
console.log(`size A ${A.width}x${A.height} B ${B.width}x${B.height} compared ${w}x${h} mismatched ${n} (${(100 * n / (w * h)).toFixed(3)}%)`);
console.log("bands with most diff:", bands.sort((p, q) => q[1] - p[1]).slice(0, 12).map(([y, c]) => `${y}:${c}`).join(" "));
