import type { Metadata, Viewport } from "next";
import { Inter, Poppins, Open_Sans, Nunito_Sans } from "next/font/google";
import "./globals.css";
import "./mobile.css"; // Importando estilos específicos para mobile
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "sonner";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

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

if (!process.env.NEXT_PUBLIC_APP_NAME) {
  throw new Error('NEXT_PUBLIC_APP_NAME não está definido no .env')
}

if (!process.env.NEXT_PUBLIC_APP_DESCRIPTION) {
  throw new Error('NEXT_PUBLIC_APP_DESCRIPTION não está definido no .env')
}

const appName = process.env.NEXT_PUBLIC_APP_NAME
const appDescription = process.env.NEXT_PUBLIC_APP_DESCRIPTION

export const metadata: Metadata = {
  title: `${appName} | Plataforma de Gerenciamento`,
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
    title: `${appName} | Plataforma de Gerenciamento`,
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
        {/* Adicionando meta tag para controle de tema */}
        <meta name="color-scheme" content="light dark" />
      </head>
      <body
        className={`${inter.variable} ${poppins.variable} ${openSans.variable} ${nunitoSans.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ServiceWorkerRegister />
          {children}
          <Toaster position="top-right" richColors closeButton />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
