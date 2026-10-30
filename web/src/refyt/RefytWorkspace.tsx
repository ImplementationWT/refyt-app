import { Lock } from "lucide-react";
import { memo, useEffect, useMemo } from "react";
import { useSession } from "../auth/session";
import { RefytHeader } from "./RefytHeader";
import { refytAuth } from "./roles";

const VIEWS = ["home", "dir", "com", "acc", "ret", "del", "tsk"] as const;

/**
 * The containers the engine draws into (the same markup as the approved page). React renders them
 * once and never updates them: the engine owns their content.
 */
const EngineMarkup = memo(function EngineMarkup() {
  return (
    <>
      <RefytHeader>
        <nav className="appsw" id="appsw" aria-label="Apps" />
        <div className="tools" id="tools" />
      </RefytHeader>
      <div className="main" id="main">
        {VIEWS.map((view) => (
          <section key={view} className="view" id={`v-${view}`} hidden>
            <div className="oapp" id={`a-${view}`} />
          </section>
        ))}
        <section className="view" id="v-db" hidden>
          <div id="dbview" />
        </section>
      </div>
      <div id="layer" />
      <div className="toast" id="toast" role="status" aria-live="polite" />
    </>
  );
});

/** Refyt: the teams' apps (Director, Commercial, Accounts, Retrofit, Delivery), at "/". */
export function RefytWorkspace() {
  const { session } = useSession();
  const auth = useMemo(() => (session ? refytAuth(session) : null), [session]);
  const authKey = JSON.stringify(auth);

  useEffect(() => {
    if (!auth || !auth.apps.length) return;
    let active = true;
    let unmount: (() => void) | null = null;
    // Loaded on demand: login and administration do not carry the engine.
    void import("./engine/index.js").then((engine) => {
      if (!active) return;
      engine.mount(auth);
      unmount = engine.unmount;
    });
    return () => {
      active = false;
      unmount?.();
    };
    // Re-mount only when what the user may see changes (authKey holds auth).
  }, [authKey]);

  if (auth && !auth.apps.length) return <NoAccess />;
  return (
    <div className="shell rfx" data-testid="refyt-workspace">
      <EngineMarkup />
    </div>
  );
}

/** Signed in, but no Refyt app: the roles of this user do not open any yet. */
function NoAccess() {
  return (
    <div className="shell rfx">
      <RefytHeader>
        <nav className="appsw" aria-label="Apps" />
        <div className="tools" />
      </RefytHeader>
      <div className="main">
        <div className="rf-noacc">
          <span className="rf-ai">
            <Lock size={20} aria-hidden />
          </span>
          <h1>You do not have access to Refyt yet</h1>
          <p>
            Your user has no Refyt role. Ask an administrator to assign you one in Users (for example Assessor,
            Install coordinator or Director).
          </p>
        </div>
      </div>
    </div>
  );
}
