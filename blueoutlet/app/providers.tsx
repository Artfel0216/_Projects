'use client';

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { ReactNode, useMemo } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const toasterConfig = useMemo(() => ({
    style: {
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: '#fff',
      borderRadius: '16px',
    },
    className: "font-sans uppercase tracking-widest text-[10px] font-black",
  }), []);

  return (
    <SessionProvider 
      refetchInterval={5 * 60} 
      refetchOnWindowFocus={true}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        {children}
        <Toaster 
          position="bottom-right" 
          toastOptions={toasterConfig}
          closeButton
          richColors
        />
      </ThemeProvider>
    </SessionProvider>
  );
}