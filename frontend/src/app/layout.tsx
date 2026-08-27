import type { Metadata, Viewport } from "next";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import { CurrencyProvider } from "@/components/providers/CurrencyProvider";
import { PWAProvider } from "@/components/providers/PWAProvider";
import Sidebar from "@/components/layout/Sidebar";
import HamburgerMenu from "@/components/layout/HamburgerMenu";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import PWAInstallBanner from "@/components/common/PWAInstallBanner";
import PWAInstallModal from "@/components/common/PWAInstallModal";
import PWAUpdateBanner from "@/components/common/PWAUpdateBanner";
import OfflineIndicator from "@/components/common/OfflineIndicator";
import { Toaster } from "sonner";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0b0f19",
};

export const metadata: Metadata = {
  title: "Kharcha Pani — Personal Expense Tracker",
  description: "Dynamic expense tracking, category analytics, and budget monitoring.",
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
    <html lang="en" className="dark">
      <body className="bg-background text-gray-100 antialiased min-h-screen">
        <PWAProvider>
          <QueryProvider>
            <CurrencyProvider>
              <OfflineIndicator />
              <div className="flex flex-col md:flex-row min-h-screen">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0">
                  <HamburgerMenu />
                  <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-7xl w-full mx-auto safe-top">
                    {children}
                  </main>
                </div>
              </div>
              <MobileBottomNav />
              <PWAInstallBanner />
              <PWAInstallModal />
              <PWAUpdateBanner />
              <Toaster theme="dark" position="top-right" richColors />
            </CurrencyProvider>
          </QueryProvider>
        </PWAProvider>
      </body>
    </html>
  );
}
