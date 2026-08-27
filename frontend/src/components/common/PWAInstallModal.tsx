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
    toast.success("मोबाईल लिंक कॉपी केली! (Link copied)");
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
          className="relative w-full max-w-md glass-panel bg-[#111827]/95 border border-emerald-500/35 rounded-3xl p-5 sm:p-6 shadow-2xl z-10 overflow-hidden text-gray-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Kharcha Pani ॲप इन्स्टॉल</h3>
                <p className="text-xs text-emerald-400 font-medium">मोबाईल & डेस्कटॉप PWA</p>
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
          <div className="flex items-center gap-1 bg-gray-900/90 p-1 rounded-xl mt-4 border border-gray-800">
            <button
              onClick={() => setActiveTab("install")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "install"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Android / PC</span>
            </button>
            <button
              onClick={() => setActiveTab("qr")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "qr"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>फोनवर स्कॅन करा</span>
            </button>
            <button
              onClick={() => setActiveTab("ios")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "ios"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Share className="w-3.5 h-3.5" />
              <span>iPhone (Safari)</span>
            </button>
          </div>

          {/* Tab 1: Android / PC */}
          {activeTab === "install" && (
            <div className="py-4 space-y-3">
              <div className="space-y-2.5 bg-gray-900/60 p-3.5 rounded-2xl border border-gray-800 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">
                    १
                  </div>
                  <div>
                    <p className="font-semibold text-white flex items-center gap-1">
                      खालील <span className="text-emerald-400 font-bold">'इन्स्टॉल करा'</span> बटणावर दाबा
                    </p>
                    <p className="text-gray-400 text-[11px]">
                      ब्राउझरचा अधिकृत Install डायलॉग लगेच ओपन होईल.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">
                    २
                  </div>
                  <div>
                    <p className="font-semibold text-white flex items-center gap-1">
                      किंवा Chrome मध्ये वर ३ डॉट्स <MoreVertical className="w-3 h-3 text-emerald-400 inline" /> दाबा
                    </p>
                    <p className="text-gray-400 text-[11px]">
                      मेनूमधून <span className="text-white font-medium">'Install app'</span> किंवा <span className="text-white font-medium">'Add to Home screen'</span> निवडा.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">
                    ३
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      'Install' कन्फर्म करा
                    </p>
                    <p className="text-gray-400 text-[11px]">
                      ॲप तुमच्या फोनच्या स्क्रीनवर ॲप म्हणून सुरू होईल.
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
                <span>आत्ताच ॲप इन्स्टॉल करा (Install Now)</span>
              </button>
            </div>
          )}

          {/* Tab 2: QR Code Scan for Mobile */}
          {activeTab === "qr" && (
            <div className="py-4 space-y-3 text-center">
              <p className="text-xs text-gray-300">
                तुमच्या मोबाईलच्या कॅमेऱ्याने खालील QR कोड स्कॅन करा आणि लिंक उघडा:
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
                (तुमचा फोन आणि कॉम्प्युटर एकाच Wi-Fi नेटवर्कवर असायला हवेत)
              </p>
            </div>
          )}

          {/* Tab 3: iPhone (Safari) */}
          {activeTab === "ios" && (
            <div className="py-4 space-y-3">
              <div className="space-y-2.5 bg-gray-900/60 p-3.5 rounded-2xl border border-gray-800 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">
                    १
                  </div>
                  <div>
                    <p className="font-semibold text-white flex items-center gap-1">
                      खालचे Share <Share className="w-3 h-3 text-blue-400 inline" /> बटण दाबा
                    </p>
                    <p className="text-gray-400 text-[11px]">
                      iPhone Safari मधील खालील Share आयकॉनवर टॅप करा.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">
                    २
                  </div>
                  <div>
                    <p className="font-semibold text-white flex items-center gap-1">
                      <PlusSquare className="w-3.5 h-3.5 text-emerald-400 inline" /> 'Add to Home Screen' निवडा
                    </p>
                    <p className="text-gray-400 text-[11px]">
                      खाली स्क्रोल करून Home Screen वर जोडा हा पर्याय निवडा.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">
                    ३
                  </div>
                  <div>
                    <p className="font-semibold text-white flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 inline" /> वर 'Add' दाबा
                    </p>
                    <p className="text-gray-400 text-[11px]">
                      ॲप थेट तुमच्या iPhone च्या होम स्क्रीनवर सेव्ह होईल.
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
              बंद करा (Close)
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
