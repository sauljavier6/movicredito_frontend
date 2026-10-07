import { useEffect, useRef } from "react";

export function useAutoRefresh(
  callback: () => void | Promise<void>,
  intervalMs = 15000,
) {
  const callbackRef = useRef(callback);
  const runningRef = useRef(false);

  callbackRef.current = callback;

  useEffect(() => {
    const run = async () => {
      if (document.visibilityState !== "visible" || runningRef.current) return;
      runningRef.current = true;
      try {
        await callbackRef.current();
      } finally {
        runningRef.current = false;
      }
    };

    const timer = window.setInterval(() => void run(), intervalMs);
    const onFocus = () => void run();
    const onVisibility = () => {
      if (document.visibilityState === "visible") void run();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [intervalMs]);
}
