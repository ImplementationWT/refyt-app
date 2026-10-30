import { ArrowLeft, List, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { useSession } from "../auth/session";
import { WillDooChat } from "../components/willdoo/WillDoo";
import { WillDooBasic } from "../components/willdoo/WillDooBasic";
import { visibleNavGroups } from "../navigation";
import { RefytHeader, TAB_TITLE } from "./RefytHeader";

/**
 * Administration (Usuarios, Roles, Integraciones…) inside the Refyt shell: the same header and
 * sidebar as the teams' apps, with the app's own screens in the content area.
 */
export function AdminLayout() {
  const { can, hasFeature } = useSession();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const groups = visibleNavGroups(can, hasFeature);

  useEffect(() => {
    document.title = TAB_TITLE;
  }, []);
  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <div className="shell rf-admin">
      <RefytHeader homeLink>
        <nav className="appsw" aria-label="Apps">
          <button type="button" className="rf-hb rf-menu" aria-label="Menu" onClick={() => setMenuOpen((value) => !value)}>
            <List size={17} aria-hidden />
          </button>
          <span className="rf-appdd static">
            <span className="rf-ai">
              <Settings size={16} aria-hidden />
            </span>
            <span className="rf-adn">
              <b>Administration</b>
              <small>Users, roles and integrations</small>
            </span>
          </span>
        </nav>
        <div className="tools">
          <Link to="/" className="rf-hb wide">
            <ArrowLeft size={14} aria-hidden />
            Back to Refyt
          </Link>
        </div>
      </RefytHeader>
      <div className="main">
        <div className={`oapp${menuOpen ? " sbopen" : ""}`}>
          <aside className="sb rfx" aria-label="Main navigation">
            {groups.map((group) => (
              <div key={group.id}>
                <div className="sb-sec">{group.label}</div>
                {group.items.map((item) => {
                  const active = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
                  const Icon = item.icon;
                  return (
                    <Link key={item.to} to={item.to} className="nav" aria-current={active ? "true" : undefined}>
                      <span className="ni">
                        <Icon size={17} aria-hidden />
                      </span>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </aside>
          <div className="op" key={location.pathname}>
            <Outlet />
          </div>
        </div>
      </div>
      {/* Will Doo + Claude (chat) or Will Doo solo (quick queries); the backend decides. */}
      {hasFeature("willdoo-ai") ? <WillDooChat /> : hasFeature("willdoo") ? <WillDooBasic /> : null}
    </div>
  );
}
