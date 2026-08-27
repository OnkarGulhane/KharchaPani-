"use client";

import React, { useState } from "react";
import { usePWA } from "@/hooks/usePWA";
import { X, Smartphone, Share, PlusSquare, Download, CheckCircle2, MoreVertical, Compass, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PWAInstallModal() {
  const { showInstallModal, setShowInstallModal, isIOS, isAndroid, promptInstall } = usePWA();
  const [activeTab, setActiveTab] = useState<"auto" | "android" | "ios">("auto");

  if (!showInstallModal) return null;

  const currentPlatform = activeTab === "auto" ? (isIOS ? "ios" : "android") : activeTab;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowInstallModal(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-sm glass-panel bg-[#111827]/95 border border-emerald-500/30 rounded-3xl p-5 shadow-2xl z-10 overflow-hidden text-gray-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Kharcha Pani ॲप</h3>
                <p className="text-xs text-emerald-400 font-medium">मोबाईल इन्स्टॉल गाइड</p>
              </div>
            </div>
            <button
              onClick={() => setShowInstallModal(false)}
              className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Platform Switcher Tabs */}
          <div className="flex items-center gap-1 bg-gray-900/80 p-1 rounded-xl mt-4 border border-gray-800">
            <button
              onClick={() => setActiveTab("android")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentPlatform === "android"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Android / Chrome</span>
            </button>
            <button
              onClick={() => setActiveTab("ios")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentPlatform === "ios"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>iPhone / Safari</span>
            </button>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="py-4 space-y-3">
            {currentPlatform === "android" ? (
              <>
                <div className="space-y-2.5 bg-gray-900/60 p-3.5 rounded-2xl border border-gray-800 text-xs">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">
                      १
                    </div>
                    <div>
                      <p className="font-semibold text-white flex items-center gap-1">
                        वर ३ डॉट्स <MoreVertical className="w-3.5 h-3.5 inline text-emerald-400" /> वर दाबा
                      </p>
                      <p className="text-gray-400 text-[11px]">
                        ब्राउझरच्या वरच्या उजव्या कोपऱ्यातील मेनू (⋮) उघडा.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">
                      २
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        'Install App' किंवा 'Add to Home screen' निवडा
                      </p>
                      <p className="text-gray-400 text-[11px]">
                        पर्यायांच्या लिस्टमध्ये 'Install app' किंवा 'होम स्क्रीनवर जोडा' वर क्लिक करा.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">
                      ३
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        'Install' वर कन्फर्म करा
                      </p>
                      <p className="text-gray-400 text-[11px]">
                        ॲप तुमच्या मोबाईलच्या ॲप लिस्टमध्ये दिसेल आणि फुल-स्क्रीन सुरू होईल.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    await promptInstall();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>डायरेक्ट इन्स्टॉल ट्राय करा (Try Install)</span>
                </button>
              </>
            ) : (
              <>
                <div className="space-y-2.5 bg-gray-900/60 p-3.5 rounded-2xl border border-gray-800 text-xs">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">
                      १
                    </div>
                    <div>
                      <p className="font-semibold text-white flex items-center gap-1">
                        Share <Share className="w-3.5 h-3.5 inline text-blue-400" /> आयकॉन दाबा
                      </p>
                      <p className="text-gray-400 text-[11px]">
                        Safari च्या खालच्या बारमधील Share चिन्हावर टॅप करा.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">
                      २
                    </div>
                    <div>
                      <p className="font-semibold text-white flex items-center gap-1">
                        <PlusSquare className="w-3.5 h-3.5 inline text-emerald-400" /> 'Add to Home Screen' निवडा
                      </p>
                      <p className="text-gray-400 text-[11px]">
                        खाली स्क्रोल करून Home Screen वर जोडा पर्याय निवडा.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">
                      ३
                    </div>
                    <div>
                      <p className="font-semibold text-white flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 inline text-purple-400" /> वर 'Add' दाबा
                      </p>
                      <p className="text-gray-400 text-[11px]">
                        ॲप लगेच तुमच्या iPhone च्या होम स्क्रीनवर सेव्ह होईल.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowInstallModal(false)}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              समजले (Close)
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
