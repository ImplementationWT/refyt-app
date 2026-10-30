import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// The Refyt engine draws real pages into the DOM with timers and global listeners; the app tests
// only check that "/" mounts it (src/refyt/RefytWorkspace.tsx).
vi.mock("../refyt/engine/index.js", () => ({ mount: vi.fn(), unmount: vi.fn() }));
