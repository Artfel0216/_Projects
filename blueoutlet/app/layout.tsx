import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
  description: "Encontre os melhores sapatos sociais, casuais e esportivos com preços de outlet. Qualidade e estilo para homens, mulheres e crianças.",
  keywords: ["calçados", "outlet", "tênis", "sapato social", "moda masculina", "freitas outlet"],
  authors: [{ name: "Freitas Outlet Team" }],
  creator: "Freitas Outlet",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://freitasoutlet.com.br"),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://freitasoutlet.com.br",
    title: "Freitas Outlet Calçados",
    description: "Loja de Calçados online com preços imperdíveis.",
    siteName: "Freitas Outlet",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Freitas Outlet Calçados",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Freitas Outlet Calçados",
    description: "Os melhores calçados com preços de outlet.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body
        className={`${inter.variable} antialiased min-h-screen bg-black text-white selection:bg-white selection:text-black`}
      >
        {children}
      </body>
    </html>
  );
}