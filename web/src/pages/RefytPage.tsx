import { useEffect, useRef } from "react";

/** Built by Vite from web/refyt/index.html (second entry in vite.config.ts). */
export const REFYT_SRC = "/refyt/index.html";
const DEFAULT_TITLE = "Refyt";

/**
 * Refyt, the client-approved interface, full screen. It runs as its own page, unchanged
 * (styles, interactions, logo and fonts), inside a same-origin frame so the app's styles never
 * touch it; this route adds the session guard. The tab shows the title Refyt sets.
 */
export function RefytPage() {
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const previous = document.title;
    document.title = DEFAULT_TITLE;
    let observer: MutationObserver | null = null;

    const syncTitle = () => {
      const doc = frame.current?.contentDocument;
      if (!doc) return;
      const update = () => {
        if (doc.title) document.title = doc.title;
      };
      update();
      observer?.disconnect();
      observer = new MutationObserver(update);
      observer.observe(doc.head ?? doc, { subtree: true, childList: true, characterData: true });
    };

    const element = frame.current;
    element?.addEventListener("load", syncTitle);
    return () => {
      element?.removeEventListener("load", syncTitle);
      observer?.disconnect();
      document.title = previous;
    };
  }, []);

  return (
    <iframe
      ref={frame}
      src={REFYT_SRC}
      title={DEFAULT_TITLE}
      className="fixed inset-0 block h-svh w-full border-0 bg-white"
    />
  );
}
