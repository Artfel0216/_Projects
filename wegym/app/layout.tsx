import "./globals.css";
import { SessionProviderWrapper } from "./components/providers/SessionProviderWrapper";
import { AppShell } from "./components/ui/AppShell";
import { PwaSync } from "./components/PwaSync";
import { ConsentBanner } from "./components/lgpd/ConsentBanner";

export const metadata = {
  title: "WEGYM",
  description: "Plataforma de treinos inteligente — academia, cardio e performance",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "WEGYM",
    statusBarStyle: "black-translucent",
  },
  icons: [
    { rel: "icon", url: "/icon-192.svg" },
    { rel: "apple-touch-icon", url: "/icon-192.svg" },
  ],
};

export const viewport = {
  themeColor: "#ea580c",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#ea580c" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/svg+xml" href="/icon-192.svg" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <meta name="apple-mobile-web-app-title" content="WEGYM" />
        <link rel="preconnect" href="https://ui-avatars.com" />
      </head>
      <body className="overscroll-none touch-callout-none select-none">
        <SessionProviderWrapper>
          <AppShell>{children}</AppShell>
        </SessionProviderWrapper>
        <ConsentBanner />
        <PwaSync />
      </body>
    </html>
  );
}
