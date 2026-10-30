// Refyt: entrada de la página aprobada por el cliente (web/refyt/index.html).
// Los estilos (refyt.css) y la lógica (refyt.js) son copia exacta de "Refyt, demo v3.20.html".
// Lo único que cambia respecto al original es de dónde salen las fuentes: la CSP del servidor
// solo permite recursos propios, así que Sora, Manrope, Figtree y Fraunces se sirven desde la
// app (paquetes @fontsource) en lugar de Google Fonts, con los mismos nombres de familia que
// usa refyt.css. jsPDF se cargaba del CDN pero la página no lo usa, así que no se incluye.
import "./fonts.js";
import "./refyt.css";
import "./refyt.js";
