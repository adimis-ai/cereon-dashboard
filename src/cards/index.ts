// Export all card components and their types
export * from "./number";
export * from "./table";
export * from "./charts";
export * from "./html";
export * from "./iframe";
export * from "./markdown";

// Export card components for registration
export { NumberCard } from "./number";
export { TableCard } from "./table";
export { HtmlCard } from "./html";
export { IframeCard } from "./iframe";
export { MarkdownCard } from "./markdown";
export {
  AreaChartCard,
  BarChartCard,
  LineChartCard,
  PieChartCard,
  RadarChartCard,
  RadialChartCard,
} from "./charts";

// Card component registry for dashboard
export const CARD_COMPONENTS = {
  number: () => import("./number").then((m) => m.NumberCard),
  table: () => import("./table").then((m) => m.TableCard),
  html: () => import("./html").then((m) => m.HtmlCard),
  iframe: () => import("./iframe").then((m) => m.IframeCard),
  markdown: () => import("./markdown").then((m) => m.MarkdownCard),
  area: () => import("./charts").then((m) => m.AreaChartCard),
  bar: () => import("./charts").then((m) => m.BarChartCard),
  line: () => import("./charts").then((m) => m.LineChartCard),
  pie: () => import("./charts").then((m) => m.PieChartCard),
  radar: () => import("./charts").then((m) => m.RadarChartCard),
  radial: () => import("./charts").then((m) => m.RadialChartCard),
} as const;

// Direct component registry (for non-lazy loading)
export const DIRECT_CARD_COMPONENTS = {
  number: async () => (await import("./number")).NumberCard,
  table: async () => (await import("./table")).TableCard,
  html: async () => (await import("./html")).HtmlCard,
  iframe: async () => (await import("./iframe")).IframeCard,
  markdown: async () => (await import("./markdown")).MarkdownCard,
  area: async () => (await import("./charts")).AreaChartCard,
  bar: async () => (await import("./charts")).BarChartCard,
  line: async () => (await import("./charts")).LineChartCard,
  pie: async () => (await import("./charts")).PieChartCard,
  radar: async () => (await import("./charts")).RadarChartCard,
  radial: async () => (await import("./charts")).RadialChartCard,
} as const;

export type CardType = keyof typeof CARD_COMPONENTS;
