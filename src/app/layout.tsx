import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans, Caveat } from "next/font/google";
import "./globals.css";

import { ReactQueryProvider } from "@/providers/react-query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const fraunces = Fraunces({
  variable: "--font-display-custom",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-hand-custom",
  weight: ["400", "500", "600", "700"],
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

  icons: {
    icon: [
      { url: '/images/icons/apple-icon.png', sizes: '1024x1024', type: 'image/png' }
    ],
    apple: [
      { url: "/images/icons/apple-icon.png", sizes: '1024x1024', type: 'image/png' }
    ],
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
  themeColor: "#ffffff",
};




export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light" />
      </head>
      <body
        className={`${fraunces.variable} ${instrumentSans.variable} ${caveat.variable} antialiased`} suppressHydrationWarning>

        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            {children}
            <Toaster />
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
