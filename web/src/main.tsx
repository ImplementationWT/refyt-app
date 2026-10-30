import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { App } from "./App";
import { registerFonts } from "./refyt/fonts";
import "./index.css";

// Refyt is light only, and its fonts are served by the app (see src/refyt/fonts.ts).
document.documentElement.dataset.theme = "light";
registerFonts();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
