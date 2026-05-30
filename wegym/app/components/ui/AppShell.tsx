"use client";

import React, { useState, Suspense } from "react";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarProvider,
  SidebarMobileDrawer,
  SidebarMobileTrigger,
  useSidebar,
} from "./Sidebar";

const HIDDEN_PREFIXES = ["/LoginPage", "/RegisterPage", "/PaymentPage"];

function shouldHideSidebar(pathname: string | null): boolean {
  if (!pathname) return true;
  if (pathname === "/") return true;
  return HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));
}

function ShellLayout({ children }: { children: React.ReactNode }) {
  const { collapsed, hydrated } = useSidebar();
  const [mobileOpen, setMobileOpen] = useState(false);

  const effectiveCollapsed = hydrated ? collapsed : false;
  const desktopOffsetClass = effectiveCollapsed ? "lg:pl-[72px]" : "lg:pl-64";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="hidden lg:flex fixed inset-y-0 left-0 z-40">
        <Sidebar />
      </div>

      <SidebarMobileTrigger onOpen={() => setMobileOpen(true)} />
      <SidebarMobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className={`${desktopOffsetClass} transition-[padding] duration-200 ease-out min-h-screen`}>
        {children}
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (shouldHideSidebar(pathname)) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <Suspense fallback={null}>
        <ShellLayout>{children}</ShellLayout>
      </Suspense>
    </SidebarProvider>
  );
}
