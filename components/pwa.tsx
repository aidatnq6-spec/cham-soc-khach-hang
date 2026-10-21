"use client";
import { useEffect } from "react";
export function Pwa() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !window.isSecureContext) return;
    void navigator.serviceWorker
      .register("/service-worker.js", { updateViaCache: "none" })
      .catch(() => {
        /* App remains usable without installation support. */
      });
  }, []);
  return null;
}
