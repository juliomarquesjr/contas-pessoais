import { useEffect, useRef } from "react";

/**
 * Chama `onSuccess` apenas quando surge um NOVO resultado de ação com `ok`.
 * Evita o bug de o modal fechar sozinho ao reabrir (quando o state.ok
 * do envio anterior continua "true").
 */
export function useCloseOnSuccess(
  state: { ok?: boolean } | undefined,
  onSuccess: () => void,
) {
  const prev = useRef(state);
  useEffect(() => {
    if (state !== prev.current) {
      prev.current = state;
      if (state?.ok) onSuccess();
    }
  }, [state, onSuccess]);
}
