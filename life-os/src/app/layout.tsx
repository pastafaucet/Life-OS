import type { Metadata } from "next";
import "./globals.css";
import { EnhancedDataProvider } from '../lib/ai/enhanced-data-context';
import { OnboardingProvider } from '../components/OnboardingProvider';

export const metadata: Metadata = {
  title: "Life OS - AI-Powered Life Management System",
  description: "Tesla-style AI-powered life operating system for legal professionals with intelligent task management, deadline tracking, and automation.",
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
  keywords: [
    "life management",
    "AI assistant", 
    "legal practice",
    "task management",
    "deadline tracking",
    "productivity",
    "automation",
    "Tesla UI"
  ],
  authors: [{ name: "Life OS Team" }],
  creator: "Life OS",
  publisher: "Life OS",
  applicationName: "Life OS",
  generator: "Next.js",
  category: "productivity",
  classification: "Business Application",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover"
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Life OS",
    startupImage: [
      {
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
        url: "/icons/apple-touch-startup-image-640x1136.png"
      },
      {
        media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)",
        url: "/icons/apple-touch-startup-image-750x1334.png"
      },
      {
        media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)",
        url: "/icons/apple-touch-startup-image-828x1792.png"
      }
    ]
  },
  openGraph: {
    type: "website",
    siteName: "Life OS",
    title: "Life OS - AI-Powered Life Management System",
    description: "Tesla-style AI-powered life operating system for legal professionals",
    url: "https://lifeos.app",
    images: [
      {
        url: "/icons/og-image.png",
        width: 1200,
        height: 630,
        alt: "Life OS Dashboard"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Life OS - AI-Powered Life Management System",
    description: "Tesla-style AI-powered life operating system for legal professionals",
    images: ["/icons/twitter-image.png"]
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
    shortcut: "/icons/icon-192x192.png"
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "msapplication-TileColor": "#0f172a",
    "msapplication-TileImage": "/icons/ms-icon-144x144.png",
    "msapplication-config": "/browserconfig.xml"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Life OS" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Life OS" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#0f172a" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#3b82f6" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/touch-icon-ipad.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/touch-icon-iphone-retina.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/touch-icon-ipad-retina.png" />

        {/* Favicons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://api.openai.com" />
        <link rel="dns-prefetch" href="https://api.openai.com" />
      </head>
      <body
        className="font-sans antialiased bg-slate-900 text-white"
      >
        <EnhancedDataProvider>
          <OnboardingProvider>
            {children}
          </OnboardingProvider>
        </EnhancedDataProvider>
      </body>
    </html>
  );
}
