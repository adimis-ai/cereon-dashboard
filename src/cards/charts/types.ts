// packages/cereon-dashboard/src/cards/charts/types.ts
import React from "react";
import type {
  CommonCardSettings,
  BaseDashboardCardRecord,
  QueryMeta,
} from "../../types";

export type ChartType =
  | "area"
  | "bar"
  | "line"
  | "pie"
  | "radar"
  | "radial"
  | "network";

export type ChartDataPoint = Record<string, any>;
export type ChartData = ChartDataPoint[];

export interface ChartColorScheme {
  primary?: string;
  secondary?: string;
  success?: string;
  warning?: string;
  danger?: string;
  info?: string;
  custom?: string[];
}

export interface ChartThemeConfig {
  colors?: ChartColorScheme;
  grid?: {
    color?: string;
    strokeDasharray?: string;
    opacity?: number;
  };
  text?: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
  };
}

export interface TooltipConfig {
  enabled?: boolean;
  trigger?: "hover" | "click" | "focus" | "none";
  position?: "auto" | "top" | "bottom" | "left" | "right";
  formatter?: {
    label?: string | ((label: any, payload: any[]) => string);
    value?: string | ((value: any, name: string, props: any) => string);
  };
  style?: {
    backgroundColor?: string;
    border?: string;
    borderRadius?: number;
    padding?: string;
    fontSize?: number;
    fontWeight?: string | number;
    color?: string;
    boxShadow?: string;
  };
  content?: {
    hideLabel?: boolean;
    hideIndicator?: boolean;
    showValue?: boolean;
    showName?: boolean;
    separator?: string;
    labelKey?: string;
    valueKey?: string;
  };
  animation?: {
    duration?: number;
    easing?: string;
  };
}

export interface LegendConfig {
  enabled?: boolean;
  position?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  orientation?: "horizontal" | "vertical";
  style?: {
    fontSize?: number;
    fontWeight?: string | number;
    color?: string;
    gap?: number;
  };
  itemStyle?: {
    width?: number;
    height?: number;
    borderRadius?: number;
    marginRight?: number;
  };
  hideIcon?: boolean;
  formatter?: string | ((value: string, entry: any) => string);
  onClick?: boolean;
  onHover?: boolean;
}

export interface AxisConfig {
  enabled?: boolean;
  position?: "top" | "bottom" | "left" | "right" | "inside" | "outside";
  scale?:
    | "auto"
    | "linear"
    | "pow"
    | "sqrt"
    | "log"
    | "identity"
    | "time"
    | "band"
    | "point"
    | "ordinal"
    | "quantile"
    | "quantize"
    | "utc"
    | "sequential"
    | "threshold";
  domain?: [any, any] | "auto" | "dataMin" | "dataMax";
  range?: [number, number];
  tickCount?: number;
  tickSize?: number;
  tickMargin?: number;
  tick?: {
    fontSize?: number;
    fontWeight?: string | number;
    color?: string;
    angle?: number;
    textAnchor?: "start" | "middle" | "end";
    formatter?: string | ((value: any, index: number) => string);
  };
  label?: {
    value?: string;
    position?: "inside" | "outside" | "top" | "bottom" | "left" | "right";
    offset?: number;
    style?: React.CSSProperties;
  };
  grid?: {
    enabled?: boolean;
    stroke?: string;
    strokeDasharray?: string;
    opacity?: number;
  };
  line?: {
    enabled?: boolean;
    stroke?: string;
    strokeWidth?: number;
  };
}

export interface AnimationConfig {
  enabled?: boolean;
  duration?: number;
  easing?: "ease" | "ease-in" | "ease-out" | "ease-in-out" | "linear";
  delay?: number;
  onEntry?: boolean;
  onUpdate?: boolean;
  onExit?: boolean;
}

export interface DataSeriesConfig {
  dataKey: string;
  name?: string;
  color?: string;
  opacity?: number;
  strokeWidth?: number;
  strokeDasharray?: string;
  fill?: string | "url(#gradient)" | "none";
  stroke?: string;
  connectNulls?: boolean;
  dot?: {
    enabled?: boolean;
    size?: number;
    color?: string;
    strokeWidth?: number;
  };
  label?: {
    enabled?: boolean;
    position?:
      | "top"
      | "bottom"
      | "left"
      | "right"
      | "center"
      | "topLeft"
      | "topRight"
      | "bottomLeft"
      | "bottomRight";
    formatter?: string | ((value: any) => string);
    style?: React.CSSProperties;
  };
  // Stack group for stacked charts
  stackId?: string;
  // Area-specific
  gradient?: {
    enabled?: boolean;
    colors?: string[];
    stops?: number[];
  };
  // Line-specific
  type?:
    | "linear"
    | "monotone"
    | "basis"
    | "cardinal"
    | "catmullRom"
    | "step"
    | "stepBefore"
    | "stepAfter";
  // Bar-specific
  radius?: number | [number, number, number, number];
  minPointSize?: number;
  maxBarSize?: number;
}

export interface AreaChartConfig {
  type: "area";
  data: ChartData;
  series: DataSeriesConfig[];
  stacking?: "normal" | "expand" | "none";
  curve?: "linear" | "natural" | "monotone" | "step";
  gradient?: boolean;
  fillOpacity?: number;
  strokeWidth?: number;
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  tooltip?: TooltipConfig;
  legend?: LegendConfig;
  animation?: AnimationConfig;
  theme?: ChartThemeConfig;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  aspectRatio?: number;
  responsive?: boolean;
}

export interface BarChartConfig {
  type: "bar";
  data: ChartData;
  series: DataSeriesConfig[];
  orientation?: "horizontal" | "vertical";
  grouping?: "grouped" | "stacked" | "stacked100";
  barSize?: number;
  maxBarSize?: number;
  barGap?: number;
  barCategoryGap?: number;
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  tooltip?: TooltipConfig;
  legend?: LegendConfig;
  animation?: AnimationConfig;
  theme?: ChartThemeConfig;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  aspectRatio?: number;
  responsive?: boolean;
}

export interface LineChartConfig {
  type: "line";
  data: ChartData;
  series: DataSeriesConfig[];
  curve?:
    | "linear"
    | "monotone"
    | "basis"
    | "cardinal"
    | "catmullRom"
    | "step"
    | "stepBefore"
    | "stepAfter";
  strokeWidth?: number;
  dots?: boolean;
  dotSize?: number;
  connectNulls?: boolean;
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  tooltip?: TooltipConfig;
  legend?: LegendConfig;
  animation?: AnimationConfig;
  theme?: ChartThemeConfig;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  aspectRatio?: number;
  responsive?: boolean;
}

export interface PieChartConfig {
  type: "pie";
  data: ChartData;
  dataKey: string;
  nameKey?: string;
  valueKey?: string;
  variant?: "pie" | "donut";
  innerRadius?: number | string;
  outerRadius?: number | string;
  startAngle?: number;
  endAngle?: number;
  paddingAngle?: number;
  cornerRadius?: number;
  labelLine?: boolean;
  labelPosition?: "inside" | "outside";
  labelFormatter?: string | ((entry: any) => string);
  tooltipFormatter?:
    | string
    | ((value: any, name: string, entry: any) => string);
  tooltip?: TooltipConfig;
  legend?: LegendConfig;
  animation?: AnimationConfig;
  theme?: ChartThemeConfig;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  aspectRatio?: number;
  responsive?: boolean;
  colors?: string[];
}

export interface RadarChartConfig {
  type: "radar";
  data: ChartData;
  series: DataSeriesConfig[];
  polarGrid?: {
    enabled?: boolean;
    gridType?: "polygon" | "circle";
    radialLines?: boolean;
    stroke?: string;
    strokeDasharray?: string;
    fill?: string;
    fillOpacity?: number;
  };
  polarAngleAxis?: Omit<AxisConfig, "position"> & {
    tickCount?: number;
    tick?: AxisConfig["tick"] & {
      fontSize?: number;
      radius?: number;
    };
  };
  polarRadiusAxis?: Omit<AxisConfig, "position"> & {
    angle?: number;
    orientation?: "left" | "right" | "middle";
  };
  tooltip?: TooltipConfig;
  legend?: LegendConfig;
  animation?: AnimationConfig;
  theme?: ChartThemeConfig;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  aspectRatio?: number;
  responsive?: boolean;
}

export interface RadialChartConfig {
  type: "radial";
  data: ChartData;
  series: DataSeriesConfig[];
  variant?: "bar" | "area";
  innerRadius?: number | string;
  outerRadius?: number | string;
  startAngle?: number;
  endAngle?: number;
  clockwise?: boolean;
  cornerRadius?: number;
  tooltip?: TooltipConfig;
  legend?: LegendConfig;
  animation?: AnimationConfig;
  theme?: ChartThemeConfig;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  aspectRatio?: number;
  responsive?: boolean;
}

export interface ChartLayerConfig {
  id: string;
  type: ChartType;
  config:
    | AreaChartConfig
    | BarChartConfig
    | LineChartConfig
    | PieChartConfig
    | RadarChartConfig
    | RadialChartConfig;
  zIndex?: number;
  opacity?: number;
  blend?: "normal" | "multiply" | "screen" | "overlay" | "darken" | "lighten";
}

export interface MultiLayerChartConfig {
  type: "multi-layer";
  layers: ChartLayerConfig[];
  globalTooltip?: TooltipConfig;
  globalLegend?: LegendConfig;
  globalAnimation?: AnimationConfig;
  globalTheme?: ChartThemeConfig;
  sharedAxes?: {
    xAxis?: AxisConfig;
    yAxis?: AxisConfig;
  };
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  aspectRatio?: number;
  responsive?: boolean;
}

export type AnyChartConfig =
  | AreaChartConfig
  | BarChartConfig
  | LineChartConfig
  | PieChartConfig
  | RadarChartConfig
  | RadialChartConfig
  | MultiLayerChartConfig;

export interface BaseChartCardSettings extends CommonCardSettings {
  chartConfig: AnyChartConfig;
  dataMapping?: {
    xField?: string;
    yField?: string;
    categoryField?: string;
    valueField?: string;
    seriesField?: string;
  };
  refreshInterval?: number;
  enableExport?: boolean;
  exportFormats?: ("png" | "jpg" | "pdf" | "svg")[];
  enableFullscreen?: boolean;
  enableDataZoom?: boolean;
  enableBrush?: boolean;
  loadingIndicator?: {
    type?: "spinner" | "skeleton" | "pulse";
    message?: string;
  };
  errorHandling?: {
    showErrorMessage?: boolean;
    enableRetry?: boolean;
    fallbackMessage?: string;
  };
}

export interface AreaChartCardSettings extends BaseChartCardSettings {
  chartConfig: AreaChartConfig;
}

export interface BarChartCardSettings extends BaseChartCardSettings {
  chartConfig: BarChartConfig;
}

export interface LineChartCardSettings extends BaseChartCardSettings {
  chartConfig: LineChartConfig;
}

export interface PieChartCardSettings extends BaseChartCardSettings {
  chartConfig: PieChartConfig;
}

export interface RadarChartCardSettings extends BaseChartCardSettings {
  chartConfig: RadarChartConfig;
}

export interface RadialChartCardSettings extends BaseChartCardSettings {
  chartConfig: RadialChartConfig;
}

export interface ChartCardRecord extends BaseDashboardCardRecord {
  data: ChartData;
}

export interface BaseChartProps {
  data: ChartData;
  config: AnyChartConfig;
  width?: number | string;
  height?: number | string;
  className?: string;
  loading?: boolean;
  error?: string | null;
  onDataPointClick?: (data: any, index: number) => void;
  onDataPointHover?: (data: any, index: number) => void;
  onLegendClick?: (data: any) => void;
  theme?: "light" | "dark" | "system";
}

export interface ChartCardProps<
  T extends BaseChartCardSettings = BaseChartCardSettings,
> {
  reportId: string;
  card: {
    id: string;
    title: string;
    description?: string;
    kind: string;
    settings: T;
    query?: any;
    hideHeader?: boolean;
    hideFooter?: boolean;
    className?: string;
  };
  records: ChartCardRecord[];
  state?: any;
  params?: Record<string, any>;
  className?: string;
  theme?: "light" | "dark" | "system";
}

export type ChartConfigValidator<T extends AnyChartConfig> = (
  config: T
) => boolean;

export interface ChartConfigDefaults {
  area: Partial<AreaChartConfig>;
  bar: Partial<BarChartConfig>;
  line: Partial<LineChartConfig>;
  pie: Partial<PieChartConfig>;
  radar: Partial<RadarChartConfig>;
  radial: Partial<RadialChartConfig>;
  multiLayer: Partial<MultiLayerChartConfig>;
}

export type AnyChartCardSettings =
  | AreaChartCardSettings
  | BarChartCardSettings
  | LineChartCardSettings
  | PieChartCardSettings
  | RadarChartCardSettings
  | RadialChartCardSettings;
