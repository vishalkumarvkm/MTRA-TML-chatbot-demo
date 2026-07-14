"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-screen bg-gradient-mesh overflow-hidden relative">
      {/* Main Content Section */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-16 lg:p-24 bg-transparent z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-white/95 backdrop-blur-md p-10 sm:p-16 rounded-[2rem] border border-brand-grey/40 shadow-ambient max-w-xl w-full text-center"
        >
          <div className="flex justify-center mb-8">
            <img
              src="/assets/images/logo_lockup.jpg"
              alt="Healthy ME | Life @ Montefiore"
              className="h-16 sm:h-20 object-contain"
            />
          </div>

          <div className="flex justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-10 py-4 rounded-xl font-bold text-[16px] hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl active:scale-95 group w-full sm:w-auto"
            >
              Login to Platform
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {/* Subtle decorative element */}
        <div className="absolute bottom-12">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              Systems Secure & Active
            </span>
          </div>
        </div>
      </div>

      <FooterDisclaimer />
    </main>
  );
}

function FooterDisclaimer() {
  return (
    <footer className="w-full shrink-0 z-50">
      <div
        className="w-full text-center text-[11px] font-semibold flex items-center justify-center gap-1.5"
        style={{
          backgroundColor: "#F59E0B",
          color: "#003769",
          padding: "6px 12px",
          fontFamily: "Arial, sans-serif",
          fontWeight: 600,
        }}
      >
        <span className="text-xs">⚠️</span>
        <span>DEMO BUILD — Sandbox environment. Data is for testing only.</span>
      </div>
    </footer>
  );
}
