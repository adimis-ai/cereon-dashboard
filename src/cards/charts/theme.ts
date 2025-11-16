// Chart Theme Management - Handle theme detection and CSS variable integration
"use client";

import type { ChartColorScheme, ChartThemeConfig } from "./types";

// ========================================
// Theme Detection
// ========================================

/**
 * Get the current theme based on the theme prop and system preferences
 */
export function resolveTheme(theme?: "light" | "dark" | "system"): "light" | "dark" {
  if (theme === "light" || theme === "dark") {
    return theme;
  }
  
  // For "system" or undefined, detect from the document or system preference
  if (typeof window !== "undefined") {
    // Check if dark class is present on document
    if (document.documentElement.classList.contains("dark")) {
      return "dark";
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  }
  
  return "light";
}

// ========================================
// CSS Variable Color Extraction
// ========================================

/**
 * Extract CSS custom property value from the document
 */
function getCSSVariable(variableName: string, fallback: string = "#000000"): string {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return fallback;
  }
  
  try {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(variableName)
      .trim();
    
    if (!value) {
      return fallback;
    }
    
    // Handle OKLCH values by converting to HSL or using fallback
    if (value.startsWith("oklch(")) {
      // For now, we'll use the fallback since OKLCH conversion is complex
      return fallback;
    }
    
    return value;
  } catch {
    return fallback;
  }
}

/**
 * Get theme-based color palette from CSS variables
 */
export function getThemeColorPalette(theme: "light" | "dark"): string[] {
  // Chart-specific colors from CSS variables
  const chartColors = [
    getCSSVariable("--chart-1", theme === "dark" ? "#0ea5e9" : "#3b82f6"),
    getCSSVariable("--chart-2", theme === "dark" ? "#10b981" : "#06b6d4"),
    getCSSVariable("--chart-3", theme === "dark" ? "#8b5cf6" : "#8b5cf6"),
    getCSSVariable("--chart-4", theme === "dark" ? "#f59e0b" : "#f97316"),
    getCSSVariable("--chart-5", theme === "dark" ? "#ef4444" : "#ef4444"),
  ];
  
  // Semantic colors from CSS variables
  const semanticColors = [
    getCSSVariable("--primary", theme === "dark" ? "#0ea5e9" : "#3b82f6"),
    getCSSVariable("--secondary", theme === "dark" ? "#64748b" : "#64748b"),
    getCSSVariable("--accent", theme === "dark" ? "#8b5cf6" : "#8b5cf6"),
  ];
  
  // Combine and filter out empty values
  return [...chartColors, ...semanticColors].filter(color => 
    color && color !== "#000000" && !color.includes("oklch(")
  );
}

/**
 * Get theme-based semantic colors
 */
export function getThemeSemanticColors(theme: "light" | "dark"): ChartColorScheme {
  return {
    primary: getCSSVariable("--primary", theme === "dark" ? "#0ea5e9" : "#3b82f6"),
    secondary: getCSSVariable("--secondary", theme === "dark" ? "#64748b" : "#64748b"),
    success: getCSSVariable("--chart-2", theme === "dark" ? "#10b981" : "#06b6d4"),
    warning: getCSSVariable("--chart-4", theme === "dark" ? "#f59e0b" : "#f97316"),
    danger: getCSSVariable("--chart-5", theme === "dark" ? "#ef4444" : "#ef4444"),
    info: getCSSVariable("--chart-1", theme === "dark" ? "#0ea5e9" : "#3b82f6"),
  };
}

// ========================================
// Theme-based Chart Configuration
// ========================================

/**
 * Get theme-based chart theme configuration
 */
export function getThemeChartConfig(theme: "light" | "dark"): ChartThemeConfig {
  const isDark = theme === "dark";
  
  return {
    colors: getThemeSemanticColors(theme),
    grid: {
      color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      strokeDasharray: "3 3",
      opacity: isDark ? 0.3 : 0.5,
    },
    text: {
      fontSize: 12,
      fontFamily: "Inter, system-ui, sans-serif",
      color: isDark ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.9)",
    },
  };
}

/**
 * Enhanced color generation that respects theme
 */
export function generateThemeColorPalette(
  theme?: "light" | "dark" | "system",
  customScheme: ChartColorScheme = {},
  count: number = 12
): string[] {
  const resolvedTheme = resolveTheme(theme);
  
  const colors: string[] = [];
  
  // Add custom colors first if provided
  if (customScheme.custom?.length) {
    colors.push(...customScheme.custom);
  }
  
  // Add semantic colors from custom scheme
  if (customScheme.primary) colors.push(customScheme.primary);
  if (customScheme.secondary) colors.push(customScheme.secondary);
  if (customScheme.success) colors.push(customScheme.success);
  if (customScheme.warning) colors.push(customScheme.warning);
  if (customScheme.danger) colors.push(customScheme.danger);
  if (customScheme.info) colors.push(customScheme.info);
  
  // If we don't have enough colors, fill with theme-based palette
  if (colors.length < count) {
    const themePalette = getThemeColorPalette(resolvedTheme);
    const themeSemanticColors = getThemeSemanticColors(resolvedTheme);
    
    // Add theme semantic colors
    Object.values(themeSemanticColors).forEach(color => {
      if (color && !colors.includes(color)) {
        colors.push(color);
      }
    });
    
    // Add theme chart colors
    themePalette.forEach(color => {
      if (color && !colors.includes(color)) {
        colors.push(color);
      }
    });
  }
  
  // Fill with fallback colors if still not enough
  const fallbackColors = resolvedTheme === "dark" ? DARK_THEME_FALLBACK_COLORS : LIGHT_THEME_FALLBACK_COLORS;
  
  while (colors.length < count) {
    const fallbackIndex = (colors.length - (customScheme.custom?.length || 0)) % fallbackColors.length;
    const fallbackColor = fallbackColors[fallbackIndex];
    if (fallbackColor && !colors.includes(fallbackColor)) {
      colors.push(fallbackColor);
    } else if (fallbackColor) {
      // Create variations if we run out of unique colors
      colors.push(adjustColorBrightness(fallbackColor, 0.1 * (colors.length - fallbackColors.length)));
    } else {
      // Fallback to a safe default
      colors.push(resolvedTheme === "dark" ? "#60a5fa" : "#3b82f6");
    }
  }
  
  return colors.slice(0, count);
}

// ========================================
// Fallback Color Palettes
// ========================================

/**
 * Fallback colors for light theme
 */
const LIGHT_THEME_FALLBACK_COLORS = [
  "#3b82f6", // blue-500
  "#06b6d4", // cyan-500
  "#8b5cf6", // violet-500
  "#f97316", // orange-500
  "#ef4444", // red-500
  "#eab308", // yellow-500
  "#22c55e", // green-500
  "#ec4899", // pink-500
  "#6366f1", // indigo-500
  "#14b8a6", // teal-500
  "#f59e0b", // amber-500
  "#84cc16", // lime-500
];

/**
 * Fallback colors for dark theme
 */
const DARK_THEME_FALLBACK_COLORS = [
  "#60a5fa", // blue-400
  "#22d3ee", // cyan-400
  "#a78bfa", // violet-400
  "#fb923c", // orange-400
  "#f87171", // red-400
  "#fbbf24", // yellow-400
  "#4ade80", // green-400
  "#f472b6", // pink-400
  "#818cf8", // indigo-400
  "#2dd4bf", // teal-400
  "#fbbf24", // amber-400
  "#a3e635", // lime-400
];

// ========================================
// Color Utilities
// ========================================

/**
 * Adjust color brightness for theme variations
 */
export function adjustColorBrightness(color: string, factor: number): string {
  // Simple HSL brightness adjustment
  if (color.startsWith("#")) {
    const { h, s, l } = hexToHsl(color);
    const newL = Math.max(0, Math.min(100, l + factor * 50));
    return `hsl(${h}, ${s}%, ${newL}%)`;
  }
  
  return color;
}

/**
 * Convert color to HSLA with alpha
 */
export function withAlpha(color: string, alpha: number): string {
  if (color.startsWith("#")) {
    const { h, s, l } = hexToHsl(color);
    return `hsla(${h}, ${s}%, ${l}%, ${alpha})`;
  }
  
  if (color.startsWith("hsl(")) {
    return color.replace("hsl(", "hsla(").replace(")", `, ${alpha})`);
  }
  
  return color;
}

/**
 * Convert hex to HSL
 */
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// ========================================
// Theme Context Hook (optional)
// ========================================

/**
 * Hook to get current theme and colors (if using React)
 */
export function useChartTheme(theme?: "light" | "dark" | "system") {
  const resolvedTheme = resolveTheme(theme);
  const colorPalette = getThemeColorPalette(resolvedTheme);
  const semanticColors = getThemeSemanticColors(resolvedTheme);
  const chartConfig = getThemeChartConfig(resolvedTheme);
  
  return {
    theme: resolvedTheme,
    colorPalette,
    semanticColors,
    chartConfig,
  };
}