import { existsSync, readFileSync, writeFileSync } from "node:fs";

/**
 * Bun 1.3's bundler mishandles array-form `sideEffects` in `@tensorflow/tfjs-core`
 * and `@tensorflow/tfjs-backend-webgl`: it tree-shakes their side-effect-only flag
 * modules even though those files are listed as having side effects. The dropped
 * registrations make the WebGPU/WebGL backends throw "Cannot evaluate flag ...:
 * no evaluation function found" at module-evaluation time.
 *
 * Forcing `sideEffects: true` on these packages keeps the flag registrations.
 * This runs as a `postinstall` step so it survives fresh installs (including CI).
 * `bun patch` would be the idiomatic tool, but its --commit step currently errors
 * with EPERM on Windows.
 */
const targets = [
  "node_modules/@tensorflow/tfjs-core/package.json",
  "node_modules/@tensorflow/tfjs-backend-webgl/package.json"
];

for (const path of targets) {
  if (!existsSync(path)) {
    continue;
  }
  const pkg = JSON.parse(readFileSync(path, "utf8")) as { name: string; sideEffects?: unknown };
  if (pkg.sideEffects !== true) {
    pkg.sideEffects = true;
    writeFileSync(path, `${JSON.stringify(pkg, null, 2)}\n`);
    console.log(`Forced sideEffects:true for ${pkg.name}`);
  }
}
