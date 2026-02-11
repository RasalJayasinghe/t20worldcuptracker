"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Calls `fetchFn` on mount and then every `intervalMs` milliseconds.
 * Returns a manual trigger so the user can also refresh on demand.
 */
export function useAutoRefresh(
  fetchFn: () => Promise<void>,
  intervalMs: number = 300_000, // default 5 min
) {
  const savedFn = useRef(fetchFn);

  useEffect(() => {
    savedFn.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    // Initial fetch
    savedFn.current();

    const id = setInterval(() => savedFn.current(), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  const refresh = useCallback(() => savedFn.current(), []);

  return refresh;
}
