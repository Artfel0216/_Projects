import "./globals.css";
import { SessionProviderWrapper } from "./components/providers/SessionProviderWrapper";
import { AppShell } from "./components/ui/AppShell";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <SessionProviderWrapper>
          <AppShell>{children}</AppShell>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}