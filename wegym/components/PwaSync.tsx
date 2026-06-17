"use client";

import { useEffect } from "react";
import { useRegisterSW } from "@/hooks/use-pwa-install";

export function PwaSync() {
  useRegisterSW();

  useEffect(() => {
    if ("connection" in navigator) {
      const conn = (navigator as Navigator & { connection: { effectiveType: string; addEventListener: (e: string, cb: () => void) => void } }).connection;
      if (conn?.effectiveType === "slow-2g") {
        document.documentElement.classList.add("slow-connection");
      }
    }
  }, []);

  return null;
}
