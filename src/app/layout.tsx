import type { Metadata, Viewport } from "next";
import { Inter, Poppins, Open_Sans, Nunito_Sans } from "next/font/google";
import "./globals.css";
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
  applicationName: appName,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: appName,
    startupImage: [
      {
        url: "/pwa/apple-splash-1320-2868.png",
        media: "(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3)", // iPhone 16 Pro Max
      },
      {
        url: "/pwa/apple-splash-1290-2796.png",
        media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)", // iPhone 15 Pro Max, 14 Pro Max
      },
      {
        url: "/pwa/apple-splash-1179-2556.png",
        media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)", // iPhone 16 Pro, 15 Pro, 14 Pro, 15
      },
      {
        url: "/pwa/apple-splash-1170-2532.png",
        media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)", // iPhone 13 Pro, 13, 12 Pro, 12
      },
      {
        url: "/pwa/apple-splash-828-1792.png",
        media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)", // iPhone 11, XR
      },
    ],
  },
  icons: {
    apple: "/pwa/apple-icon-180.png",
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

import { AppSplashScreen } from "@/components/pwa/AppSplashScreen";

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
        <AppSplashScreen />
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
