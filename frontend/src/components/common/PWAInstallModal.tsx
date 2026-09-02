"use client";

import React, { useState, useEffect } from "react";
import { usePWA } from "@/hooks/usePWA";
import {
  X,
  Smartphone,
  Share,
  PlusSquare,
  Download,
  CheckCircle2,
  MoreVertical,
  QrCode,
  Globe,
  Copy,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function PWAInstallModal() {
  const { showInstallModal, setShowInstallModal, isIOS, isInstalled, promptInstall } = usePWA();
  const [activeTab, setActiveTab] = useState<"install" | "qr" | "ios">("install");
  const [currentUrl, setCurrentUrl] = useState("http://192.168.0.126:3000");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = window.location.href;
      // If on localhost on PC, suggest the local Wi-Fi IP so phone can open it
      if (url.includes("localhost") || url.includes("127.0.0.1")) {
        setCurrentUrl(`http://192.168.0.126:3000`);
      } else {
        setCurrentUrl(url);
      }
      if (isIOS) {
        setActiveTab("ios");
      }
    }
  }, [isIOS, showInstallModal]);

  if (!showInstallModal) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    toast.success("Mobile link copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    currentUrl
  )}&bgcolor=11-18-27&color=16-185-129`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowInstallModal(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md glass-panel bg-[#111827]/95 border border-emerald-500/35 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl z-10 max-h-[90dvh] overflow-y-auto overscroll-contain text-gray-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 flex-shrink-0">
                <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white">Install Kharcha Pani</h3>
                <p className="text-[11px] sm:text-xs text-emerald-400 font-medium">Mobile & Desktop Progressive Web App</p>
              </div>
            </div>
            <button
              onClick={() => setShowInstallModal(false)}
              className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-gray-900/90 p-1 rounded-xl mt-3 sm:mt-4 border border-gray-800">
            <button
              onClick={() => setActiveTab("install")}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold transition-all ${
                activeTab === "install"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Download className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Android / PC</span>
            </button>
            <button
              onClick={() => setActiveTab("qr")}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold transition-all ${
                activeTab === "qr"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <QrCode className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Scan QR</span>
            </button>
            <button
              onClick={() => setActiveTab("ios")}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold transition-all ${
                activeTab === "ios"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Share className="w-3.5 h-3.5 flex-shrink-0" />
              <span>iPhone / iOS</span>
            </button>
          </div>

          {/* Tab 1: Android / PC */}
          {activeTab === "install" && (
            <div className="py-4 space-y-3">
              <div className="space-y-2.5 bg-gray-900/60 p-3.5 rounded-2xl border border-gray-800 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-white flex items-center gap-1">
                      Click the <span className="text-emerald-400 font-bold">'Install App'</span> button below
                    </p>
                    <p className="text-gray-400 text-[11px]">
                      The official browser install prompt will appear instantly.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-white flex items-center gap-1">
                      Or tap Chrome menu <MoreVertical className="w-3 h-3 text-emerald-400 inline" />
                    </p>
                    <p className="text-gray-400 text-[11px]">
                      Select <span className="text-white font-medium">'Install app'</span> or <span className="text-white font-medium">'Add to Home screen'</span>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      Confirm 'Install'
                    </p>
                    <p className="text-gray-400 text-[11px]">
                      Kharcha Pani will launch as a fast standalone app on your home screen.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={async () => {
                  await promptInstall();
                }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Install Now</span>
              </button>
            </div>
          )}

          {/* Tab 2: QR Code Scan for Mobile */}
          {activeTab === "qr" && (
            <div className="py-4 space-y-3 text-center">
              <p className="text-xs text-gray-300">
                Scan this QR code with your phone camera to open Kharcha Pani:
              </p>

              {/* QR Code Container */}
              <div className="w-48 h-48 mx-auto bg-gray-900 p-2 rounded-2xl border border-emerald-500/30 flex items-center justify-center shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrImageUrl}
                  alt="Scan to open on mobile"
                  className="w-full h-full rounded-xl object-contain"
                  onError={(e) => {
                    // Fallback to text link if offline
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>

              <div className="flex items-center gap-2 bg-gray-900/80 p-2 rounded-xl border border-gray-800">
                <Globe className="w-4 h-4 text-emerald-400 flex-shrink-0 ml-1" />
                <span className="text-xs text-emerald-300 font-mono truncate flex-1 text-left">
                  {currentUrl}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors"
                  title="Copy URL"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <p className="text-[11px] text-gray-400">
                (Ensure your phone and computer are on the same Wi-Fi network)
              </p>
            </div>
          )}

          {/* Tab 3: iPhone (Safari) */}
          {activeTab === "ios" && (
            <div className="py-4 space-y-3">
              <div className="space-y-2.5 bg-gray-900/60 p-3.5 rounded-2xl border border-gray-800 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-white flex items-center gap-1">
                      Tap the Share <Share className="w-3 h-3 text-blue-400 inline" /> button
                    </p>
                    <p className="text-gray-400 text-[11px]">
                      Tap the Share icon at the bottom of Safari on your iPhone.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-white flex items-center gap-1">
                      <PlusSquare className="w-3.5 h-3.5 text-emerald-400 inline" /> Select 'Add to Home Screen'
                    </p>
                    <p className="text-gray-400 text-[11px]">
                      Scroll down in the share sheet and tap Add to Home Screen.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-white flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 inline" /> Tap 'Add' in top right
                    </p>
                    <p className="text-gray-400 text-[11px]">
                      The app will be installed directly to your iPhone home screen.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="text-center pt-1 border-t border-gray-800/80">
            <button
              onClick={() => setShowInstallModal(false)}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
