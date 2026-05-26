import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

// Reads public/content.json at build time and substitutes %SEO_*% placeholders
// in index.html so SEO + Open Graph + Twitter Card meta tags are admin-editable.
// (Meta tags must live in the static HTML — social-link scrapers don't run JS.)
function seoMetaPlugin(): Plugin {
  const escape = (s: string) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  return {
    name: "seo-meta-substitution",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        let settings: Record<string, string> = {};
        try {
          const contentPath = path.resolve(__dirname, "public/content.json");
          const raw = fs.readFileSync(contentPath, "utf-8");
          settings = JSON.parse(raw).settings ?? {};
        } catch {
          // build proceeds with empty settings → placeholders fall back to defaults
        }
        const defaults: Record<string, string> = {
          SEO_TITLE: "Cake Rush",
          SEO_DESCRIPTION:
            "Cake Rush — a cake atelier where every slice tells a story.",
          SEO_AUTHOR: "Cake Rush",
          SEO_OG_TITLE: "Cake Rush",
          SEO_OG_DESCRIPTION:
            "A cake atelier where every slice tells a story.",
          SEO_OG_IMAGE_URL: "/gallery/cake_strawberry_v2_enhanced.png",
          SEO_OG_SITE_NAME: "Cake Rush",
          SEO_OG_URL: "https://cakerush.in",
        };
        return html.replace(/%([A-Z_]+)%/g, (_match, key: string) => {
          const settingKey = key.toLowerCase();
          const value = settings[settingKey] ?? defaults[key] ?? "";
          return escape(value);
        });
      },
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    seoMetaPlugin(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
