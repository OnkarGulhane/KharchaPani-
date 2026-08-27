import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import Sidebar from "@/components/layout/Sidebar";
import HamburgerMenu from "@/components/layout/HamburgerMenu";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Kharcha Pani — Personal Expense Tracker",
  description: "Dynamic expense tracking, category analytics, and budget monitoring.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-gray-100 antialiased min-h-screen">
        <QueryProvider>
          <div className="flex flex-col md:flex-row min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <HamburgerMenu />
              <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
            </div>
          </div>
          <Toaster theme="dark" position="top-right" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
