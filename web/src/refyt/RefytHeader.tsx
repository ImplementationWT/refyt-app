import type { ReactNode } from "react";
import { Link } from "react-router";
import { UserMenu } from "./UserMenu";

/** The browser tab says Refyt on every screen. */
export const TAB_TITLE = "Refyt";

/**
 * The Refyt header (the dark blue bar of the approved design): the REFYT wordmark, the sections in
 * the middle, tools on the right and, last, the signed-in user with the admin dropdown.
 * In the workspace the wordmark opens the Overview (the engine's v5home); elsewhere it links to "/".
 */
export function RefytHeader({ children, homeLink = false }: { children: ReactNode; homeLink?: boolean }) {
  return (
    <header className="top rfx">
      <div className="brand">
        {homeLink ? (
          <Link to="/" className="v5-brand" aria-label="REFYT, go to Refyt">
            REFYT
          </Link>
        ) : (
          <button type="button" className="v5-brand" data-act="v5home" title="Go to Overview" aria-label="REFYT, go to Overview">
            REFYT
          </button>
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
