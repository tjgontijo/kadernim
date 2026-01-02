import type { Metadata, Viewport } from "next";
import { Inter, Poppins, Open_Sans, Nunito_Sans } from "next/font/google";
import "./globals.css";
import "./mobile.css"; // Importando estilos específicos para mobile
import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister";
import { ReactQueryProvider } from "@/providers/react-query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";

// Fonte Principal: Inter (para títulos e logos)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Fonte Principal alternativa: Poppins
const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

// Fonte Secundária: Open Sans (para textos de corpo)
const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  display: "swap",
});

// Fonte Secundária alternativa: Nunito Sans
const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  display: "swap",
});

// Env vars com valores padrão (evita erro de prerender)
const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Kadernim'
const appDescription = process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'App de bolso para toda professora moderna.'

export const metadata: Metadata = {
  title: appName,
  description: appDescription,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: appName,
  },
  // Configurações de OpenGraph para compartilhamento em redes sociais
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: appName,
    title: appName,
    description: appDescription,
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/images/system/og-kadernim.jpg`,
        width: 1200,
        height: 630,
        alt: appName,
      },
    ],
  },
  // Configurações para o Twitter (agora X)
  twitter: {
    card: 'summary_large_image',
    title: appName,
    description: appDescription,
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/images/system/og-kadernim.jpg`],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" }
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body
        className={`${inter.variable} ${poppins.variable} ${openSans.variable} ${nunitoSans.variable} antialiased`} suppressHydrationWarning>
        <ServiceWorkerRegister />
        <ThemeProvider>
          <ReactQueryProvider>
            {children}
            <Toaster />
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
