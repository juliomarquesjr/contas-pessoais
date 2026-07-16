"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * `false` no servidor e durante a hidratação; `true` depois.
 *
 * Serve para conteúdo que só existe no cliente — na prática, os portais de
 * Sheet/ConfirmDialog. Guardar com `typeof document === "undefined"` dava
 * hydration mismatch (servidor não renderiza portal, cliente renderiza já no
 * primeiro passe), e `useState` + `useEffect` esbarra na regra
 * react-hooks/set-state-in-effect. useSyncExternalStore resolve os dois:
 * o snapshot do servidor é `false` e o do cliente, `true`.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
