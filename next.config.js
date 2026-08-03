/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Ensure browsers never cache a stale service-worker script served by Next.js.
  // This prevents old Vite-PWA workers from being re-used after switching frameworks.
  async headers() {
    return [
      {
        source: "/(.*\\.js)",
        headers: [
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
      {
        // Prevent caching of SW-related paths
        source: "/(sw\\.js|dev-sw\\.js|workbox-.*\\.js|manifest\\.webmanifest)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
