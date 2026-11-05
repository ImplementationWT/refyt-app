import type { ReactNode } from "react";
import { Link } from "react-router";
import logo from "./assets/refyt-logo.png";
import { UserMenu } from "./UserMenu";

/** The browser tab says Refyt on every screen. */
export const TAB_TITLE = "Refyt";

/**
 * The Refyt header (the dark green bar of the approved design): logo, the app area in the middle,
 * tools on the right and, last, the signed-in user with the admin dropdown.
 */
export function RefytHeader({ children, homeLink = false }: { children: ReactNode; homeLink?: boolean }) {
  const brand = (
    <>
      <span className="mark">
        <img className="rf-logo" src={logo} alt="REFYT" />
      </span>
      <div>
        <b id="emp" spellCheck={false} title="Double click to rename" />
        <small>workspace</small>
      </div>
    </>
  );
  return (
    <header className="top rfx">
      <div className="brand">
        {homeLink ? (
          <Link to="/" aria-label="Go to Refyt">
            {brand}
          </Link>
        ) : (
          brand
        )}
      </div>
      {children}
      <UserMenu />
    </header>
  );
}
