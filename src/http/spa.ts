import fastifyStatic from "@fastify/static";
import type { FastifyInstance } from "fastify";

function isApiPath(url: string): boolean {
  return /^\/(api|health)(\/|\?|$)/.test(url);
}

/**
 * Serves the built SPA from the same origin. Unknown GET routes outside
 * /api and /health fall back to index.html (client-side routing); everything
 * else gets a JSON 404.
 */
export function installSpa(app: FastifyInstance, webRoot: string | null) {
  if (webRoot) {
    app.register(fastifyStatic, {
      root: webRoot,
      wildcard: false,
      setHeaders(res, path) {
        // Vite fingerprints everything under /assets.
        res.header(
          "cache-control",
          path.includes("/assets/") ? "public, max-age=31536000, immutable" : "no-cache"
        );
      }
    });
  }

  app.setNotFoundHandler((request, reply) => {
    if (webRoot && (request.method === "GET" || request.method === "HEAD") && !isApiPath(request.url)) {
      return reply.header("cache-control", "no-cache").sendFile("index.html");
    }
    return reply.code(404).send({ error: "not_found" });
  });
}
