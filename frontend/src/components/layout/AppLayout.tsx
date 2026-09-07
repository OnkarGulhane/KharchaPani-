"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import HamburgerMenu from "@/components/layout/HamburgerMenu";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { KharchaGuruChat } from "@/components/ai/KharchaGuruChat";
import { Loader2 } from "lucide-react";

const AUTH_PATHS = ["/login", "/register", "/forgot-password", "/reset-password", "/access"];

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const isAuthPage = AUTH_PATHS.some((path) => pathname.startsWith(path));

  useEffect(() => {
    if (!isAuthenticated && !isAuthPage) {
      router.replace("/login");
    } else if (isAuthenticated && isAuthPage) {
      router.replace("/");
    }
  }, [isAuthenticated, isAuthPage, router]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <HamburgerMenu />
        <main className="flex-1 p-3.5 sm:p-6 md:p-8 pb-28 sm:pb-28 md:pb-8 max-w-7xl w-full mx-auto safe-top min-w-0">
          {children}
        </main>
      </div>
      <MobileBottomNav />
      {/* Global Kharcha Guru AI Assistant */}
      <KharchaGuruChat />
    </div>
  );
};
