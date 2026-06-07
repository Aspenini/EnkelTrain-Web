import index from "./index.html";

const WORKER_BUNDLE = "node_modules/libarchive.js/dist/worker-bundle.js";
const WASM_BINARY = "node_modules/libarchive.js/dist/libarchive.wasm";

const server = Bun.serve({
  hostname: process.env.HOST ?? "127.0.0.1",
  port: Number(process.env.PORT ?? 5173),
  // HMR is disabled because Bun 1.3.14's HMR runtime panics on Windows.
  // Dev mode still re-bundles on every request, so a browser refresh
  // picks up source changes.
  development: { hmr: false, console: true },
  routes: {
    "/": index,
    // libarchive.js ships an Emscripten worker that resolves its `.wasm`
    // relative to its own URL, so both files must be served side by side.
    "/vendor/worker-bundle.js": new Response(Bun.file(WORKER_BUNDLE)),
    "/vendor/libarchive.wasm": new Response(Bun.file(WASM_BINARY))
  }
});

console.log(`EnkelTrain dev server running at ${server.url}`);
