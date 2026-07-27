"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * sw-killer — Unregisters all service workers and clears all caches.
 *
 * The browser may have a stale Vite-PWA service worker registered from a
 * previous build of this app. That worker intercepts every request and tries
 * to load Vite-specific paths (/@vite/client, /src/main.tsx, …) which Next.js
 * does not serve, causing a blank page / 404 loop.
 *
 * Navigate to /sw-killer ONCE in the affected browser to clean up, then you
 * will be automatically redirected to the home page.
 */
export default function SwKillerPage() {
  const router = useRouter();

  useEffect(() => {
    async function killAll() {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((r) => r.unregister()));
        console.log(`[sw-killer] Unregistered ${registrations.length} service worker(s).`);
      }

      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
        console.log(`[sw-killer] Deleted ${keys.length} cache bucket(s).`);
      }

      // Hard-reload to / so the browser re-fetches everything fresh
      window.location.replace("/");
    }

    killAll();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
        background: "#f8fafc",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          border: "4px solid #e2e8f0",
          borderTop: "4px solid #3b82f6",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>
        Clearing stale service workers &amp; cache…
      </p>
      <p style={{ color: "#94a3b8", fontSize: 12, margin: 0 }}>
        You will be redirected automatically.
      </p>
    </div>
  );
}
