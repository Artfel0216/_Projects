import "./globals.css";
import { SessionProviderWrapper } from "./components/providers/SessionProviderWrapper";
import { AppShell } from "./components/ui/AppShell";
import { PwaSync } from "./components/PwaSync";

export const metadata = {
  title: "WEGYM",
  description: "Plataforma de treinos inteligente — academia, cardio e performance",
  manifest: "/manifest.json",
  themeColor: "#ea580c",
  appleWebApp: {
    capable: true,
    title: "WEGYM",
    statusBarStyle: "black-translucent",
  },
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, user-scalable=no",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "msapplication-tap-highlight": "no",
  },
  icons: [
    { rel: "icon", url: "/icon-192.svg" },
    { rel: "apple-touch-icon", url: "/icon-192.svg" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      </head>
      <body className="overscroll-none touch-callout-none select-none">
        <SessionProviderWrapper>
          <AppShell>{children}</AppShell>
        </SessionProviderWrapper>
        <PwaSync />
      </body>
    </html>
  );
}
