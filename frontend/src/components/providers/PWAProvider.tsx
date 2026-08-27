"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAContextType {
  isInstalled: boolean;
  isInstallable: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isOnline: boolean;
  isUpdateAvailable: boolean;
  showInstallModal: boolean;
  setShowInstallModal: (show: boolean) => void;
  promptInstall: () => Promise<boolean>;
  applyUpdate: () => void;
  dismissBanner: () => void;
  isBannerDismissed: boolean;
}

const PWAContext = createContext<PWAContextType | null>(null);

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(true);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Initial Online status
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // 2. Check if already running in standalone / installed mode
    const isStandaloneMedia = window.matchMedia("(display-mode: standalone)").matches;
    // @ts-expect-error navigator.standalone is iOS Safari specific
    const isStandaloneIOS = window.navigator.standalone === true;
    const isStandalone = isStandaloneMedia || isStandaloneIOS;
    setIsInstalled(isStandalone);

    // If already installed, mark not installable
    if (isStandalone) {
      setIsInstallable(false);
    }

    // 3. Detect Platform
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    const isAndroidDevice = /android/.test(ua);
    setIsIOS(isIosDevice);
    setIsAndroid(isAndroidDevice);

    // 4. Capture native beforeinstallprompt (Android Chrome / Edge / Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 5. Track appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      setShowInstallModal(false);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    // 6. Register Service Worker immediately
    if ("serviceWorker" in navigator && process.env.NODE_ENV !== "test") {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  setIsUpdateAvailable(true);
                  setWaitingWorker(newWorker);
                }
              });
            }
          });
        })
        .catch((err) => {
          console.warn("Service worker registration:", err);
        });
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Trigger installation
  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setIsInstalled(true);
          setIsInstallable(false);
          setDeferredPrompt(null);
          return true;
        }
      } catch (err) {
        console.error("Install prompt error:", err);
        setShowInstallModal(true);
      }
    } else {
      // If native prompt isn't directly triggered by browser event, show detailed guide modal
      setShowInstallModal(true);
    }
    return false;
  }, [deferredPrompt]);

  const applyUpdate = useCallback(() => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    }
    window.location.reload();
  }, [waitingWorker]);

  const dismissBanner = useCallback(() => {
    setIsBannerDismissed(true);
  }, []);

  return (
    <PWAContext.Provider
      value={{
        isInstalled,
        isInstallable,
        isIOS,
        isAndroid,
        isOnline,
        isUpdateAvailable,
        showInstallModal,
        setShowInstallModal,
        promptInstall,
        applyUpdate,
        dismissBanner,
        isBannerDismissed,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA() {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error("usePWA must be used within a PWAProvider");
  }
  return context;
}
