"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";

export function SessionProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={600} refetchOnWindowFocus={false}>
      {children}
    </SessionProvider>
  );
}
