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
  onSuccess: async () => {
    const { copyFile, mkdir } = await import("fs/promises");
    const path = await import("path");
    
    try {
      await mkdir("dist/components", { recursive: true });
      await copyFile(
        "src/components/DashboardReport.module.css",
        "dist/components/DashboardReport.module.css"
      );
      await mkdir("dist/ui/styles", { recursive: true });
      await copyFile(
        "src/ui/styles/globals.css",
        "dist/ui/styles/globals.css"
      );
      console.log("✓ CSS files copied successfully");
    } catch (error) {
      console.warn("Warning: Could not copy CSS files:", error);
    }
  },
});