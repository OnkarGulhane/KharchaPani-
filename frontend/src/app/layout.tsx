import type { Metadata, Viewport } from "next";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import { CurrencyProvider } from "@/components/providers/CurrencyProvider";
import { PWAProvider } from "@/components/providers/PWAProvider";
import { GoogleProvider } from "@/components/providers/GoogleProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import PWAInstallBanner from "@/components/common/PWAInstallBanner";
import PWAInstallModal from "@/components/common/PWAInstallModal";
import OfflineIndicator from "@/components/common/OfflineIndicator";
import { Toaster } from "sonner";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#070b14",
};

export const metadata: Metadata = {
  title: "Kharcha Pani — Personal Expense Tracker",
  description: "Secure multi-user expense tracking, category analytics, and budget monitoring.",
  manifest: "/manifest.json",
  applicationName: "Kharcha Pani",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Kharcha Pani",
    startupImage: ["/icons/icon-512x512.png"],
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('kharcha_theme') || 'dark';
                var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                document.documentElement.classList.toggle('dark', isDark);
                document.documentElement.classList.toggle('light', !isDark);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-background text-foreground antialiased min-h-screen selection:bg-emerald-500/30 selection:text-emerald-300">
        <ThemeProvider>
          <PWAProvider>
            <QueryProvider>
              <CurrencyProvider>
                <GoogleProvider>
                  <AuthProvider>
                    <OfflineIndicator />
                    <AppLayout>{children}</AppLayout>
                    <PWAInstallBanner />
                    <PWAInstallModal />
                    <Toaster position="top-right" richColors />
                  </AuthProvider>
                </GoogleProvider>
              </CurrencyProvider>
            </QueryProvider>
          </PWAProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
