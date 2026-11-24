"use client";

import { useEffect } from "react";

/**
 * Suppresses synthetic DOM/WebSocket Event objects from bubbling up to
 * the Next.js local development overlay as "Runtime Error: [object Event]".
 *
 * Real JavaScript Error instances are preserved.
 */
export function DevErrorHandler() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    function onError(event: ErrorEvent) {
      // If error is missing or is a raw Event object rather than an Error instance
      if (!event.error || !(event.error instanceof Error)) {
        event.stopImmediatePropagation();
      }
    }

    function onUnhandledRejection(event: PromiseRejectionEvent) {
      if (!event.reason || !(event.reason instanceof Error)) {
        event.stopImmediatePropagation();
      }
    }

    window.addEventListener("error", onError, true);
    window.addEventListener("unhandledrejection", onUnhandledRejection, true);

    return () => {
      window.removeEventListener("error", onError, true);
      window.removeEventListener("unhandledrejection", onUnhandledRejection, true);
    };
  }, []);

  return null;
}
