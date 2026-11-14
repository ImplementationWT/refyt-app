// Node module hooks for the engine tests (vitest runs them with native import, see vite.config.ts):
// images and "?url" assets the engine imports through Vite become their file name.
import { registerHooks } from "node:module";

registerHooks({
  // Vite's "?url" imports (the pdf.js worker) become the file name too.
  resolve(specifier, context, next) {
    if (specifier.endsWith("?url")) {
      const name = specifier.slice(0, -4).split("/").pop();
      return { url: `data:text/javascript,export default ${encodeURIComponent(JSON.stringify(name))};`, shortCircuit: true };
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (/\.(png|jpe?g|svg)(\?.*)?$/.test(url)) {
      return { format: "module", shortCircuit: true, source: `export default ${JSON.stringify(url.split("/").pop())};` };
    }
    return next(url, context);
  }
});
