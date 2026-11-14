// Node module hooks for the engine tests (vitest runs them with native import, see vite.config.ts):
// images the engine imports through Vite become their file name.
import { registerHooks } from "node:module";

registerHooks({
  load(url, context, next) {
    if (/\.(png|jpe?g|svg)(\?.*)?$/.test(url)) {
      return { format: "module", shortCircuit: true, source: `export default ${JSON.stringify(url.split("/").pop())};` };
    }
    return next(url, context);
  }
});
