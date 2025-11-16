// Chart Utilities - Helper functions for data transformation, colors, and chart configuration
import type {
  ChartData,
  ChartDataPoint,
  AnyChartConfig,
  ChartColorScheme,
  DataSeriesConfig,
  TooltipConfig,
  LegendConfig,
  AxisConfig,
  ChartConfigDefaults,
} from "./types";
import { generateThemeColorPalette, getThemeChartConfig, resolveTheme } from "./theme";

// ========================================
// Color Management
// ========================================

export const DEFAULT_CHART_COLORS: string[] = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--primary)",
  "var(--secondary)",
  "var(--accent)",
  // Rich, saturated palette
  "#0b69ff", // vivid blue
  "#00bfa6", // teal
  "#7c4dff", // purple
  "#ff7a18", // warm orange
  "#ff3860", // strong pink/red
  "#ffd166", // gold
  "#00a3ff", // cyan
  "#2ecc71", // emerald
  "#ff6b6b", // coral
  "#8e44ad", // deep magenta
  "#1e90ff", // dodger
  "#f97316", // amber
];

/**
 * Generate a color palette based on scheme and count
 */
export function generateColorPalette(
  scheme: ChartColorScheme = {},
  count: number = 12,
  theme?: "light" | "dark" | "system"
): string[] {
  // If theme is provided, use the theme-based color generation
  if (theme) {
    return generateThemeColorPalette(theme, scheme, count);
  }

  const colors: string[] = [];

  // Add custom colors first
  if (scheme.custom?.length) {
    colors.push(...scheme.custom);
  }

  // Add semantic colors
  if (scheme.primary) colors.push(scheme.primary);
  if (scheme.secondary) colors.push(scheme.secondary);
  if (scheme.success) colors.push(scheme.success);
  if (scheme.warning) colors.push(scheme.warning);
  if (scheme.danger) colors.push(scheme.danger);
  if (scheme.info) colors.push(scheme.info);

  // Fill with default colors if needed
  while (colors.length < count) {
    const defaultIndex = colors.length % DEFAULT_CHART_COLORS.length;
    const color = DEFAULT_CHART_COLORS[defaultIndex];
    if (color && !colors.includes(color)) {
      colors.push(color);
    } else if (color) {
      // Create variations if we run out of unique colors
      colors.push(
        adjustColorBrightness(
          color,
          0.1 * (colors.length - DEFAULT_CHART_COLORS.length)
        )
      );
    }
  }

  return colors.slice(0, count);
}

// Enhanced palette generator that can optionally return gradient stop pairs.
export function generateColorPaletteWithGradients(
  scheme: ChartColorScheme = {},
  count: number = 12,
  theme?: "light" | "dark" | "system"
): { color: string; stroke: string; fill: string; gradient?: string[] }[] {
  const base = theme ? generateThemeColorPalette(theme, scheme, count) : generateColorPalette(scheme, count, theme);
  const mapped = base
    .map((c) => {
      const stops = generateGradientStops(c);
      // stroke should be a stronger (less transparent) version
      const stroke = withAlpha(c, 1);
      const fill = stops[0] || withAlpha(c, 0.12);
      return { color: c, stroke, fill, gradient: stops } as {
        color: string;
        stroke: string;
        fill: string;
        gradient?: string[];
      };
    })
    .slice(0, count);

  // Guarantee at least one color
  if (mapped.length === 0) {
    const fallback = DEFAULT_CHART_COLORS[0] || "#0b69ff";
    return [
      {
        color: fallback,
        stroke: withAlpha(fallback, 1),
        fill: withAlpha(fallback, 0.12),
        gradient: generateGradientStops(fallback),
      },
    ];
  }

  return mapped;
}

/**
 * Adjust color brightness
 */
export function adjustColorBrightness(color: string, factor: number): string {
  // Simple HSL brightness adjustment for CSS custom properties
  if (color.startsWith("hsl(var(")) {
    return color; // Keep CSS variables as-is for now
  }

  // For hex colors, convert to HSL and adjust
  if (color.startsWith("#")) {
    const { h, s, l } = hexToHsl(color);
    const newL = Math.max(0, Math.min(100, l + factor * 50));
    return `hsl(${h}, ${s}%, ${newL}%)`;
  }

  return color;
}

/**
 * Return an HSLA string from an HSL string with the provided alpha.
 * If input is a CSS variable like `var(--chart-1))` we fall back to returning a
 * semi-transparent CSS variable using `hsla(var(...), alpha)` which works in modern browsers.
 */
export function withAlpha(hslOrVar: string, alpha: number): string {
  if (!hslOrVar) return `rgba(0,0,0,${alpha})`;

  // If it's already an hsl(...) produced by adjustColorBrightness, convert to hsla(..., alpha)
  if (hslOrVar.startsWith("hsl(")) {
    return hslOrVar.replace(/^hsl\(/, "hsla(").replace(/\)$/, `, ${alpha})`);
  }

  // If it's a CSS variable form like var(--chart-1)) -> hsla(var(--chart-1), alpha)
  const varMatch = /^hsl\(var\((.+)\)\)/.exec(hslOrVar);
  if (varMatch) {
    return `hsla(var(${varMatch[1]}), ${alpha})`;
  }

  // If it's a hex or other color, try to convert to HSL then to HSLA
  if (hslOrVar.startsWith("#")) {
    const { h, s, l } = hexToHsl(hslOrVar);
    return `hsla(${h}, ${s}%, ${l}%, ${alpha})`;
  }

  // Fallback: append alpha to rgba() if possible
  return hslOrVar;
}

/**
 * Generate a pair of gradient stop colors for a given base color.
 * Returns an array [startColor, endColor] suitable for area fills or gradients.
 */
export function generateGradientStops(color: string): string[] {
  // Prefer HSL adjustments for reliable perceptual changes.
  const lighter = adjustColorBrightness(color, 0.18);
  const darker = adjustColorBrightness(color, -0.12);
  // Use semi-transparent versions for area fills to give a gentle gradient feel
  const start = withAlpha(lighter, 0.18);
  const end = withAlpha(darker, 0.03);
  return [start, end];
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
// Data Transformation
// ========================================

/**
 * Normalize data for chart consumption
 */
export function normalizeChartData(rawData: ChartData | any): ChartDataPoint[] {
  // Accept either an array or a nodes/edges record and always return an array
  const arr: any[] = Array.isArray(rawData)
    ? rawData
    : rawData && typeof rawData === "object"
      ? ((rawData as any).nodes ?? (rawData as any).edges ?? [])
      : [];

  const data = arr.map((item, index) => {
    if (item === null || item === undefined) {
      return { index, value: null } as ChartDataPoint;
    }

    if (typeof item === "object" && !Array.isArray(item)) {
      return { ...item } as ChartDataPoint;
    }

    if (typeof item === "number" || typeof item === "string") {
      return { index, value: item } as ChartDataPoint;
    }

    return { index, value: String(item) } as ChartDataPoint;
  });
  return data
}

/**
 * Extract unique keys from data for series configuration
 */
export function extractDataKeys(data: ChartData): string[] {
  const keys = new Set<string>();
  const arr: ChartDataPoint[] = Array.isArray(data)
    ? data
    : data && typeof data === "object"
      ? ((data as any).nodes ?? (data as any).edges ?? [])
      : [];

  arr.forEach((item) => {
    if (typeof item === "object" && item !== null) {
      Object.keys(item).forEach((key) => {
        if (key !== "index" && typeof (item as any)[key] !== "object") {
          keys.add(key);
        }
      });
    }
  });

  return Array.from(keys);
}

/**
 * Group data by series field
 */
export function groupDataBySeries(
  data: ChartData,
  seriesField: string
): Record<string, ChartDataPoint[]> {
  const groups: Record<string, ChartDataPoint[]> = {};
  const arr: ChartDataPoint[] = Array.isArray(data)
    ? data
    : data && typeof data === "object"
      ? ((data as any).nodes ?? (data as any).edges ?? [])
      : [];

  arr.forEach((item) => {
    const seriesValue = String((item as any)[seriesField] || "default");
    if (!groups[seriesValue]) {
      groups[seriesValue] = [];
    }
    groups[seriesValue].push(item);
  });

  return groups;
}

/**
 * Calculate data bounds for axis configuration
 */
export function calculateDataBounds(
  data: ChartData,
  field: string
): { min: number; max: number } {
  const arr: ChartDataPoint[] = Array.isArray(data)
    ? data
    : data && typeof data === "object"
      ? ((data as any).nodes ?? (data as any).edges ?? [])
      : [];

  const values = arr
    .map((item) => (item as any)[field])
    .filter((value) => typeof value === "number" && !isNaN(value));

  if (values.length === 0) {
    return { min: 0, max: 100 };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  // Add some padding
  const padding = (max - min) * 0.1 || 1;

  return {
    min: min - padding,
    max: max + padding,
  };
}

/**
 * Format data for specific chart types
 */
export function formatDataForChart(
  data: ChartData,
  chartType: string,
  config: {
    xField?: string;
    yField?: string;
    valueField?: string;
    nameField?: string;
  }
): ChartDataPoint[] {
  const arr: ChartDataPoint[] = Array.isArray(data)
    ? data
    : data && typeof data === "object"
      ? ((data as any).nodes ?? (data as any).edges ?? [])
      : [];

  const {
    xField = "x",
    yField = "y",
    valueField = "value",
    nameField = "name",
  } = config;

  switch (chartType) {
    case "pie":
      return arr.map((item) => ({
        name: (item as any)[nameField] || (item as any)[xField] || "Unknown",
        value: Number(
          (item as any)[valueField] ||
            (item as any)[yField] ||
            (item as any).value ||
            0
        ),
        ...item,
      }));

    case "bar":
    case "line":
    case "area":
      return arr.map((item) => ({
        [xField as string]:
          (item as any)[xField] || (item as any).name || (item as any).category,
        [yField as string]: Number(
          (item as any)[yField] || (item as any).value || 0
        ),
        ...item,
      }));

    case "radar":
      return arr.map((item) => {
        const formatted: ChartDataPoint = {};
        Object.keys(item).forEach((key) => {
          const val = (item as any)[key];
          if (typeof val === "number") {
            (formatted as any)[key] = val;
          } else if (typeof val === "string" && !isNaN(Number(val))) {
            (formatted as any)[key] = Number(val);
          } else {
            (formatted as any)[key] = val;
          }
        });
        return formatted;
      });

    default:
      return arr;
  }
}

// ========================================
// Configuration Helpers
// ========================================

/**
 * Default configurations for different chart types
 */
export const chartConfigDefaults: ChartConfigDefaults = {
  area: {
    type: "area",
    data: [],
    series: [],
    curve: "monotone",
    fillOpacity: 0.4,
    strokeWidth: 2,
    responsive: true,
    aspectRatio: 16 / 9,
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    animation: {
      enabled: true,
      duration: 300,
      easing: "ease-in-out",
    },
  },
  bar: {
    type: "bar",
    data: [],
    series: [],
    orientation: "vertical",
    grouping: "grouped",
    responsive: true,
    aspectRatio: 16 / 9,
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    animation: {
      enabled: true,
      duration: 300,
      easing: "ease-in-out",
    },
  },
  line: {
    type: "line",
    data: [],
    series: [],
    curve: "monotone",
    strokeWidth: 2,
    dots: true,
    dotSize: 4,
    responsive: true,
    aspectRatio: 16 / 9,
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    animation: {
      enabled: true,
      duration: 300,
      easing: "ease-in-out",
    },
  },
  pie: {
    type: "pie",
    data: [],
    dataKey: "value",
    nameKey: "name",
    variant: "pie",
    outerRadius: "80%",
    startAngle: 0,
    endAngle: 360,
    responsive: true,
    aspectRatio: 1,
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    animation: {
      enabled: true,
      duration: 300,
      easing: "ease-in-out",
    },
  },
  radar: {
    type: "radar",
    data: [],
    series: [],
    polarGrid: {
      enabled: true,
      gridType: "polygon",
      radialLines: true,
    },
    responsive: true,
    aspectRatio: 1,
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    animation: {
      enabled: true,
      duration: 300,
      easing: "ease-in-out",
    },
  },
  radial: {
    type: "radial",
    data: [],
    series: [],
    variant: "bar",
    innerRadius: "20%",
    outerRadius: "80%",
    startAngle: 0,
    endAngle: 360,
    responsive: true,
    aspectRatio: 1,
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    animation: {
      enabled: true,
      duration: 300,
      easing: "ease-in-out",
    },
  },
  multiLayer: {
    type: "multi-layer",
    layers: [],
    responsive: true,
    aspectRatio: 16 / 9,
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    globalAnimation: {
      enabled: true,
      duration: 300,
      easing: "ease-in-out",
    },
  },
};

/**
 * Merge user config with defaults
 */
export function mergeChartConfig<T extends AnyChartConfig>(
  userConfig: Partial<T>,
  chartType: keyof ChartConfigDefaults,
  theme?: "light" | "dark" | "system"
): T {
  const defaults = chartConfigDefaults[chartType];
  
  // Get theme-based defaults if theme is provided
  let themeDefaults: any = {};
  if (theme) {
    const themeConfig = getThemeChartConfig(resolveTheme(theme));
    themeDefaults = {
      theme: themeConfig,
    };
  }
  
  const merged = {
    ...defaults,
    ...themeDefaults,
    ...userConfig,
    // Deep merge for nested objects
    animation: {
      ...((defaults as any)?.animation || {}),
      ...((userConfig as any)?.animation || {}),
    },
    margin: {
      ...((defaults as any)?.margin || {}),
      ...((userConfig as any)?.margin || {}),
    },
    tooltip: {
      ...((defaults as any)?.tooltip || {}),
      ...((userConfig as any)?.tooltip || {}),
    },
    legend: {
      ...((defaults as any)?.legend || {}),
      ...((userConfig as any)?.legend || {}),
    },
    theme: {
      ...((defaults as any)?.theme || {}),
      ...((themeDefaults as any)?.theme || {}),
      ...((userConfig as any)?.theme || {}),
    },
  } as T;
  // Backwards-compatibility: allow series entries to use `key` instead of `dataKey`.
  if ((merged as any).series && Array.isArray((merged as any).series)) {
    (merged as any).series = (merged as any).series.map((s: any) => {
      if (s && !s.dataKey && s.key) {
        return { ...s, dataKey: s.key };
      }
      return s;
    });
  }

  return merged as T;
}

/**
 * Generate series configuration from data
 */
export function generateSeriesConfig(
  data: ChartData,
  fields: string[],
  colors?: string[],
  theme?: "light" | "dark" | "system"
): DataSeriesConfig[] {
  // If caller provided a colors array of strings, convert to gradient objects
  let paletteObjects: {
    color: string;
    stroke: string;
    fill: string;
    gradient?: string[];
  }[];
  
  if (colors && colors.length) {
    paletteObjects = colors.map((c) => {
      const stops = generateGradientStops(c);
      const fill = stops[0] || withAlpha(c, 0.12);
      return { color: c, stroke: withAlpha(c, 1), fill, gradient: stops } as {
        color: string;
        stroke: string;
        fill: string;
        gradient?: string[];
      };
    });
  } else {
    // Use theme-based color generation if theme is provided
    const themeColors = theme 
      ? generateThemeColorPalette(theme, {}, fields.length)
      : generateColorPalette({}, fields.length, theme);
    paletteObjects = generateColorPaletteWithGradients({ custom: themeColors }, fields.length, theme);
  }

  if (!paletteObjects || paletteObjects.length === 0) {
    const fallbackColors = theme 
      ? generateThemeColorPalette(theme, {}, fields.length)
      : generateColorPalette({}, fields.length, theme);
    paletteObjects = generateColorPaletteWithGradients({ custom: fallbackColors }, fields.length, theme);
  }

  return fields.map((field, index) => {
    const p =
      paletteObjects[index % paletteObjects.length] || paletteObjects[0];
    const p0 = p!;

    return {
      dataKey: field,
      name: field.charAt(0).toUpperCase() + field.slice(1),
      color:
        p0.color ||
        DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length] ||
        DEFAULT_CHART_COLORS[0],
      stroke:
        p0.stroke ||
        p0.color ||
        DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length] ||
        DEFAULT_CHART_COLORS[0],
      fill:
        p0.fill ||
        p0.color ||
        DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length] ||
        DEFAULT_CHART_COLORS[0],
      strokeWidth: 2,
      gradient: p0.gradient,
      dot: {
        enabled: true,
        size: 4,
        color:
          p0.stroke ||
          p0.color ||
          DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length] ||
          DEFAULT_CHART_COLORS[0],
      },
    } as DataSeriesConfig;
  });
}

/**
 * Validate chart configuration
 */
export function validateChartConfig(config: AnyChartConfig): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Basic validation
  if (!config.type) {
    errors.push("Chart type is required");
  }

  if (config.type !== "multi-layer") {
    if (!(config as any).data || !Array.isArray((config as any).data)) {
      errors.push("Data must be an array");
    }
  }

  // Type-specific validation
  switch (config.type) {
    case "area":
    case "line":
    case "bar":
    case "radar":
    case "radial":
      if (
        !config.series ||
        !Array.isArray(config.series) ||
        config.series.length === 0
      ) {
        errors.push(`${config.type} chart requires at least one series`);
      }
      break;

    case "pie":
      if (!config.dataKey) {
        errors.push("Pie chart requires dataKey property");
      }
      break;

    case "multi-layer":
      if (
        !config.layers ||
        !Array.isArray(config.layers) ||
        config.layers.length === 0
      ) {
        errors.push("Multi-layer chart requires at least one layer");
      }
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ========================================
// Responsive Helpers
// ========================================

/**
 * Calculate responsive dimensions
 */
export function calculateResponsiveDimensions(
  container: { width: number; height: number },
  aspectRatio: number = 16 / 9,
  minWidth: number = 300,
  minHeight: number = 200
): { width: number; height: number } {
  let width = Math.max(container.width, minWidth);
  let height = Math.max(container.height, minHeight);

  // Maintain aspect ratio
  const calculatedHeight = width / aspectRatio;
  const calculatedWidth = height * aspectRatio;

  if (calculatedHeight <= height) {
    height = calculatedHeight;
  } else {
    width = calculatedWidth;
  }

  return { width, height };
}

/**
 * Get responsive margin based on container size
 */
export function getResponsiveMargin(
  containerWidth: number,
  baseMargin: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  } = {}
): Required<{ top: number; right: number; bottom: number; left: number }> {
  const scale = Math.max(0.5, Math.min(1, containerWidth / 800));

  return {
    top: (baseMargin.top || 20) * scale,
    right: (baseMargin.right || 20) * scale,
    bottom: (baseMargin.bottom || 20) * scale,
    left: (baseMargin.left || 20) * scale,
  };
}

// ========================================
// Export Utilities
// ========================================

/**
 * Convert chart to data URL for export
 */
export function chartToDataURL(
  chartElement: HTMLElement,
  format: "png" | "jpg" | "svg" = "png",
  quality: number = 1
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      if (format === "svg") {
        const svgElement = chartElement.querySelector("svg");
        if (!svgElement) {
          reject(new Error("No SVG element found"));
          return;
        }

        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);
        const dataURL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
        resolve(dataURL);
        return;
      }

      // For PNG/JPG, use html2canvas or similar
      // This is a placeholder - you'd need to install and use html2canvas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not create canvas context"));
        return;
      }

      // Simple placeholder implementation
      canvas.width = chartElement.offsetWidth;
      canvas.height = chartElement.offsetHeight;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const dataURL = canvas.toDataURL(`image/${format}`, quality);
      resolve(dataURL);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Download chart as file
 */
export function downloadChart(
  chartElement: HTMLElement,
  filename: string,
  format: "png" | "jpg" | "svg" = "png"
): void {
  chartToDataURL(chartElement, format)
    .then((dataURL) => {
      const link = document.createElement("a");
      link.download = `${filename}.${format}`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
    .catch((error) => {
      console.error("Error downloading chart:", error);
    });
}
