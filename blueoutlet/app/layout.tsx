import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  preload: true,
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://freitasoutlet.com.br"),
  title: {
    default: "Freitas Outlet | Calçados e Moda Masculina de Alta Qualidade",
    template: "%s | Freitas Outlet",
  },
  description:
    "Descubra sapatos sociais, casuais e esportivos premium com preços exclusivos de outlet na Freitas Outlet. Estilo e conforto em cada passo.",
  keywords: ["calçados masculinos", "outlet de sapatos", "moda masculina", "freitas outlet", "sapatos sociais"],
  authors: [{ name: "Freitas Outlet" }],
  creator: "Freitas Outlet",
  publisher: "Freitas Outlet",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://freitasoutlet.com.br",
    siteName: "Freitas Outlet",
    title: "Freitas Outlet | Calçados e Moda Masculina",
    description: "Os melhores calçados com os melhores preços. Qualidade premium direto para você.",
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
    title: "Freitas Outlet | Moda Masculina",
    description: "Qualidade premium em calçados masculinos com preços de outlet.",
    images: ["/og-image.jpg"],
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
    <html 
      lang="pt-BR" 
      className={`scroll-smooth ${inter.variable}`} 
      suppressHydrationWarning
    >
      <body
        className="min-h-screen bg-black text-white font-sans antialiased selection:bg-white/20"
      >
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}