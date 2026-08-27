"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldCheck, ArrowRight, Lock } from "lucide-react";
import { setAppKey, getAppKey } from "@/lib/api/client";
import { env } from "@/config/env";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AccessPage() {
  const [accessKey, setAccessKeyInput] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const existingKey = getAppKey();
    setAccessKeyInput(existingKey || "dev-shared-access-key-kharcha-pani");
  }, []);

  const handleUseDefaultKey = () => {
    const defaultKey = "dev-shared-access-key-kharcha-pani";
    setAppKey(defaultKey);
    setAccessKeyInput(defaultKey);
    toast.success("Default Dev Key set! Redirecting to Dashboard...");
    router.push("/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const keyToUse = accessKey.trim() || "dev-shared-access-key-kharcha-pani";

    setLoading(true);
    try {
      const res = await fetch(`${env.apiBaseUrl}/dashboard/summary?period=month`, {
        headers: {
          "Content-Type": "application/json",
          "X-App-Key": keyToUse,
        },
      });

      if (res.status === 401) {
        toast.error("Invalid Access Key. Please check and try again.");
        setLoading(false);
        return;
      }

      setAppKey(keyToUse);
      toast.success("Access Granted! Welcome to Kharcha Pani.");
      router.push("/");
    } catch (err) {
      setAppKey(keyToUse);
      toast.success("Access Key saved.");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-800 shadow-2xl relative overflow-hidden"
      >
        {/* Glow accent */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">V1 App Gate</h2>
          <p className="text-sm text-gray-400 mt-1">
            Enter your shared <code className="text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded text-xs">X-App-Key</code> to access Kharcha Pani
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              App Access Key
            </label>
            <div className="relative">
              <KeyRound className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={accessKey}
                onChange={(e) => setAccessKeyInput(e.target.value)}
                placeholder="Enter access key..."
                className="w-full bg-surface border border-gray-700/80 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-glow transition-all duration-200"
          >
            {loading ? (
              <span>Verifying...</span>
            ) : (
              <>
                <span>Continue to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-800/60 text-center space-y-3">
          <button
            type="button"
            onClick={handleUseDefaultKey}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 block mx-auto"
          >
            Use Default Dev Key & Open Dashboard
          </button>
          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500/80" />
            <span>V1 Public Gate Active (Protected API)</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
