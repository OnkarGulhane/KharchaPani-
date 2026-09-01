"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import HamburgerMenu from "@/components/layout/HamburgerMenu";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { Loader2 } from "lucide-react";

const AUTH_PATHS = ["/login", "/register", "/forgot-password", "/reset-password", "/access"];

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const isAuthPage = AUTH_PATHS.some((path) => pathname.startsWith(path));

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !isAuthPage) {
        router.push("/login");
      } else if (isAuthenticated && isAuthPage) {
        router.push("/");
      }
    }
  }, [isAuthenticated, isLoading, isAuthPage, router]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-slate-300 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        <p className="text-sm font-medium text-slate-400">Loading your Kharcha Pani workspace...</p>
      </div>
    );
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
    </div>
  );
};
