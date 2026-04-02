import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Freitas Outlet Calçados | O melhor da moda masculina",
    template: "%s | Freitas Outlet",
  },
  description:
    "Encontre os melhores sapatos sociais, casuais e esportivos com preços de outlet.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="scroll-smooth" data-scroll-behavior="smooth">
      <body
        className={`${inter.variable} antialiased min-h-screen bg-black text-white`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}