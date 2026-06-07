const OUT_DIR = "dist";

const server = Bun.serve({
  hostname: process.env.HOST ?? "127.0.0.1",
  port: Number(process.env.PORT ?? 4173),
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname === "/" ? "/index.html" : url.pathname;
    const file = Bun.file(`${OUT_DIR}${path}`);
    if (await file.exists()) {
      return new Response(file);
    }
    return new Response(Bun.file(`${OUT_DIR}/index.html`));
  }
});

console.log(`EnkelTrain preview running at ${server.url}`);
