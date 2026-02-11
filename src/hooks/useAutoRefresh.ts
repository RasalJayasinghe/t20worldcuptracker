"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Calls `fetchFn` every `intervalMs` milliseconds.
 * Skips the initial call since data is now server-rendered.
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
    // No initial fetch – data is already server-rendered.
    // Only set up the periodic refresh.
    const id = setInterval(() => savedFn.current(), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  const refresh = useCallback(() => savedFn.current(), []);

  return refresh;
}
