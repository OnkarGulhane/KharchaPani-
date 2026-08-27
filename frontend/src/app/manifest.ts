import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kharcha Pani — Personal Expense Tracker",
    short_name: "KharchaPani",
    description: "Smart expense tracking, category analytics, and budget monitoring.",
    start_url: "/?source=pwa",
    display: "standalone",
    background_color: "#0b0f19",
    theme_color: "#0b0f19",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Dashboard",
        url: "/?source=pwa_shortcut",
        description: "View monthly dashboard",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Expenses",
        url: "/expenses?source=pwa_shortcut",
        description: "Manage expenses",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Access Key",
        url: "/access?source=pwa_shortcut",
        description: "Access Key Settings",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
    ],
  };
}
