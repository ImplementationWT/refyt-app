// Tipos de lo que la app React usa del motor de Refyt (el motor está en JavaScript).

/** La sesión real que limita Refyt: apps según permisos refyt.*, roles de Refyt del usuario. */
export interface RefytAuth {
  userId: string;
  /** Códigos de app del motor: dir, com, acc, ret, del. */
  apps: string[];
  /** Códigos de rol del motor (sad, ass, aap, dsg, dap, inc, oap, pap, sit, hse, com, acc, dir). */
  roles: string[];
  /** refyt.view_as: puede ver Refyt como cualquier rol. */
  viewAs: boolean;
}

/** Dibuja Refyt en los contenedores de RefytWorkspace (#appsw, #tools, #main, #layer, #toast). */
export function mount(auth?: RefytAuth): void;
/** Cierra los paneles flotantes del motor al salir de Refyt. */
export function unmount(): void;
