import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Link previews need the full web address of the site. Vercel provides it at build time
// (your custom domain once one is connected); locally it stays a relative path.
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "sidequest-site-url",
      transformIndexHtml: (html) => html.replaceAll("__SITE_URL__", siteUrl),
    },
  ],
});
