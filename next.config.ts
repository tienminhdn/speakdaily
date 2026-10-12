import type { NextConfig } from "next";

// GitHub Pages serves the site under /<repo>; the deploy workflow sets PAGES_BASE_PATH.
// Locally it is empty, so `npm run dev` still runs at http://localhost:3000.
const basePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Fully static site: every page is prerendered and all state lives in the browser.
  output: "export",
  basePath,
  // "/giao-trinh/ngay-1/" → "giao-trinh/ngay-1/index.html", which static hosts serve directly.
  trailingSlash: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
