import type { ReactNode } from "react";
import { Link } from "react-router";
import { UserMenu } from "./UserMenu";

/** The browser tab says Refyt on every screen. */
export const TAB_TITLE = "Refyt";

/**
 * The Refyt header (the dark blue bar of the approved design): the REFYT wordmark, the app area in
 * the middle, tools on the right and, last, the signed-in user with the admin dropdown.
 * brand: "engine" is the v5 button the engine handles (back to Overview), "link" goes to Refyt from
 * the admin screens, "static" is just the wordmark.
 */
export function RefytHeader({ children, brand = "static" }: { children: ReactNode; brand?: "engine" | "link" | "static" }) {
  return (
    <header className="top rfx">
      <div className="brand">
        {brand === "engine" ? (
          <button className="v5-brand" data-act="v5home" title="Go to Overview" aria-label="REFYT, go to Overview">
            REFYT
          </button>
        ) : brand === "link" ? (
          <Link className="v5-brand" to="/" aria-label="REFYT, go to Refyt">
            REFYT
          </Link>
        ) : (
          <span className="v5-brand">REFYT</span>
        )}
        <div>
          <b id="emp" spellCheck={false} title="Double click to rename" />
          <small>workspace</small>
        </div>
      </div>
      {children}
      <UserMenu />
    </header>
  );
}
