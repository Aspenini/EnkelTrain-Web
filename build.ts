import { cp, mkdir, rm } from "node:fs/promises";

const OUT_DIR = "dist";

await rm(OUT_DIR, { recursive: true, force: true });

const result = await Bun.build({
  entrypoints: ["./index.html"],
  outdir: OUT_DIR,
  minify: true,
  sourcemap: "linked"
});

if (!result.success) {
  console.error("Build failed:");
  for (const log of result.logs) {
    console.error(log);
  }
  process.exit(1);
}

// libarchive.js needs its worker + wasm served as static, co-located assets.
await mkdir(`${OUT_DIR}/vendor`, { recursive: true });
await cp("node_modules/libarchive.js/dist/worker-bundle.js", `${OUT_DIR}/vendor/worker-bundle.js`);
await cp("node_modules/libarchive.js/dist/libarchive.wasm", `${OUT_DIR}/vendor/libarchive.wasm`);

console.log(`Build complete -> ${OUT_DIR}/`);
