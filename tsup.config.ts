import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  outDir: "dist",
  splitting: true,
  clean: true,
  publicDir: false,
  loader: {
    ".css": "copy",
  },
  external: [
    "react",
    "react-dom",
    "framer-motion",
    "react-grid-layout",
    "react-grid-layout/css/styles.css",
  ],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";',
    };
  },
  // Handle CSS files by copying them to dist
  onSuccess: async () => {
    // Copy CSS files manually since tsup doesn't handle CSS imports well
    const { copyFile, mkdir } = await import("fs/promises");
    const path = await import("path");
    
    try {
      // Ensure the components directory exists
      await mkdir("dist/components", { recursive: true });
      // Copy the CSS file
      await copyFile(
        "src/components/DashboardReport.module.css",
        "dist/components/DashboardReport.module.css"
      );
      console.log("✓ CSS files copied successfully");
    } catch (error) {
      console.warn("Warning: Could not copy CSS files:", error);
    }
  },
});