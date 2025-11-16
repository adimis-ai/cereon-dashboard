// AreaChart Component - Reusable area chart with gradients, stacking, and multiple series
"use client";

import { useMemo, useRef } from "react";
import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Brush,
} from "recharts";
import type { CurveType } from "recharts/types/shape/Curve";

// Map common curve names from config/series to the exact Recharts CurveType union.
function mapCurveToRecharts(curve: string | undefined): CurveType {
  const c = (curve || "natural").toString();
  const allowed: Record<string, CurveType> = {
    basis: "basis",
    basisClosed: "basisClosed",
    basisOpen: "basisOpen",
    bumpX: "bumpX",
    bumpY: "bumpY",
    bump: "bump",
    linear: "linear",
    linearClosed: "linearClosed",
    natural: "natural",
    monotoneX: "monotoneX",
    monotoneY: "monotoneY",
    monotone: "monotone",
    step: "step",
    stepBefore: "stepBefore",
    stepAfter: "stepAfter",
  };

  // Some configs may use alternate names like 'cardinal' or 'catmullRom'
  // which map to the closest available Recharts types. Map them explicitly.
  if (c === "cardinal") return "natural";
  if (c === "catmullRom") return "natural";

  return (allowed[c] as CurveType) || "natural";
}
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "../../ui";
import type {
  AreaChartConfig,
  ChartCardProps,
  AreaChartCardSettings,
  BaseChartProps,
} from "./types";
import {
  normalizeChartData,
  generateColorPalette,
  generateSeriesConfig,
  mergeChartConfig,
  validateChartConfig,
  calculateResponsiveDimensions,
  getResponsiveMargin,
} from "./utils";
import { useDashboard } from "../../contexts/dashboard";

// ========================================
// Area Chart Component
// ========================================

export interface AreaChartProps extends BaseChartProps {
  config: AreaChartConfig;
}

export function AreaChart({
  data: rawData,
  config: userConfig,
  width = "100%",
  height = 400,
  className = "",
  loading = false,
  error = null,
  onDataPointClick,
  onDataPointHover,
  onLegendClick,
  theme,
}: AreaChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  // Merge with defaults
  const config = useMemo(
    () => mergeChartConfig(userConfig, "area", theme),
    [userConfig, theme]
  );

  // Validate configuration
  const { isValid, errors } = useMemo(
    () => validateChartConfig(config),
    [config]
  );

  // Process and normalize data
  const chartData = useMemo(() => normalizeChartData(rawData), [rawData]);

  // Generate series configuration if not provided
  const series = useMemo(() => {
    if (config.series?.length > 0) {
      return config.series;
    }

    // Auto-generate series from data keys
    const xAxisKey = (config.xAxis as any)?.dataKey || config.xAxis?.label?.value;
    const dataKeys =
      chartData.length > 0 && chartData[0]
        ? Object.keys(chartData[0]).filter(
            (key) =>
              key !== "index" &&
              key !== xAxisKey &&
              typeof chartData[0]?.[key] === "number"
          )
        : [];

    const colors = generateColorPalette(config.theme?.colors, dataKeys.length, theme);
    return generateSeriesConfig(chartData, dataKeys, colors, theme);
  }, [
    config.series,
    chartData,
    config.theme?.colors,
    config.xAxis,
    theme,
  ]);

  // Create chart configuration for ChartContainer
  const chartConfig = useMemo(() => {
    const configObj: Record<string, any> = {};

    series.forEach((s, index) => {
      configObj[s.dataKey] = {
        label: s.name || s.dataKey,
        color: s.color,
      };
    });

    return configObj;
  }, [series]);

  // Handle responsive dimensions
  const dimensions = useMemo(() => {
    if (typeof width === "number" && typeof height === "number") {
      return calculateResponsiveDimensions(
        { width, height },
        config.aspectRatio,
        300,
        200
      );
    }
    return { width: "100%", height };
  }, [width, height, config.aspectRatio]);

  // Calculate margins
  const margin = useMemo(() => {
    const containerWidth = typeof width === "number" ? width : 800;
    return getResponsiveMargin(containerWidth, config.margin);
  }, [width, config.margin]);

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-32 mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="text-destructive mb-2">Chart Error</div>
          <div className="text-sm text-muted-foreground">{error}</div>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="text-destructive mb-2">Configuration Error</div>
          <div className="text-sm text-muted-foreground">
            {errors.join(", ")}
          </div>
        </div>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="text-center text-muted-foreground">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div ref={chartRef} className={className} style={{ width, height }}>
      <ChartContainer
        config={chartConfig}
        className="h-full w-full aspect-auto"
      >
        <RechartsAreaChart
          data={chartData}
          margin={margin}
          onMouseMove={(state: any) => {
            if (state?.activePayload?.length && onDataPointHover) {
              onDataPointHover(
                state.activePayload[0].payload,
                state.activeTooltipIndex
              );
            }
          }}
          onClick={(state: any) => {
            if (state?.activePayload?.length && onDataPointClick) {
              onDataPointClick(
                state.activePayload[0].payload,
                state.activeTooltipIndex
              );
            }
          }}
        >
          {/* Define gradients for areas */}
          <defs>
            {series.map((s) => (
              <linearGradient
                key={`gradient-${s.dataKey}`}
                id={`fill${s.dataKey}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={`var(--color-${s.dataKey})`}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={`var(--color-${s.dataKey})`}
                  stopOpacity={0.1}
                />
              </linearGradient>
            ))}
          </defs>

          {/* Grid */}
          {config.xAxis?.grid?.enabled !== false &&
            config.yAxis?.grid?.enabled !== false && (
              <CartesianGrid
                stroke={config.theme?.grid?.color || "var(--border)"}
                strokeDasharray={config.theme?.grid?.strokeDasharray || "3 3"}
                opacity={config.theme?.grid?.opacity || 0.5}
                vertical={config.xAxis?.grid?.enabled ?? true}
                horizontal={config.yAxis?.grid?.enabled ?? true}
              />
            )}

          {/* X Axis */}
          {config.xAxis?.enabled !== false && (
            <XAxis
              dataKey={
                (config.xAxis as any)?.dataKey || config.xAxis?.label?.value || Object.keys(chartData[0] || {})[0]
              }
              axisLine={config.xAxis?.line?.enabled !== false}
              tickLine={config.xAxis?.tick !== undefined}
              tick={{
                fontSize: config.xAxis?.tick?.fontSize || 12,
                fill: config.xAxis?.tick?.color || "var(--muted-foreground)",
                ...config.xAxis?.tick,
              }}
              tickFormatter={
                typeof config.xAxis?.tick?.formatter === "function"
                  ? config.xAxis.tick.formatter
                  : undefined
              }
              domain={
                Array.isArray(config.xAxis?.domain)
                  ? (config.xAxis.domain as [any, any])
                  : undefined
              }
              scale={config.xAxis?.scale || "auto"}
            />
          )}

          {/* Y Axis */}
          {config.yAxis?.enabled !== false && (
            <YAxis
              axisLine={config.yAxis?.line?.enabled !== false}
              tickLine={config.yAxis?.tick !== undefined}
              tick={{
                fontSize: config.yAxis?.tick?.fontSize || 12,
                fill: config.yAxis?.tick?.color || "var(--muted-foreground)",
                ...config.yAxis?.tick,
              }}
              tickFormatter={
                typeof config.yAxis?.tick?.formatter === "function"
                  ? config.yAxis.tick.formatter
                  : undefined
              }
              domain={
                Array.isArray(config.yAxis?.domain)
                  ? (config.yAxis.domain as [any, any])
                  : undefined
              }
              scale={config.yAxis?.scale || "auto"}
            />
          )}

          {/* Tooltip */}
          {config.tooltip?.enabled !== false && (
            <ChartTooltip
              cursor={
                config.tooltip?.trigger === "hover"
                  ? { strokeDasharray: "3 3" }
                  : false
              }
              content={
                <ChartTooltipContent
                  hideLabel={config.tooltip?.content?.hideLabel}
                  hideIndicator={config.tooltip?.content?.hideIndicator}
                  indicator="line"
                  labelKey={config.tooltip?.content?.labelKey}
                  formatter={
                    typeof config.tooltip?.formatter?.value === "function"
                      ? (config.tooltip.formatter.value as any)
                      : undefined
                  }
                  labelFormatter={
                    typeof config.tooltip?.formatter?.label === "function"
                      ? config.tooltip.formatter.label
                      : undefined
                  }
                />
              }
            />
          )}

          {/* Areas */}
          {series.map((s) => (
            <Area
              key={s.dataKey}
              dataKey={s.dataKey}
              name={s.name}
              // ensure the value passed to Recharts is a valid CurveType
              type={mapCurveToRecharts(config.curve || s.type || "natural")}
              fill={`url(#fill${s.dataKey})`}
              stroke={`var(--color-${s.dataKey})`}
              strokeWidth={s.strokeWidth || config.strokeWidth || 2}
              strokeDasharray={s.strokeDasharray}
              connectNulls={s.connectNulls !== false}
              stackId={
                config.stacking !== "none" ? s.stackId || "a" : undefined
              }
              dot={
                s.dot?.enabled !== false
                  ? {
                      r: s.dot?.size || 3,
                      fill: `var(--color-${s.dataKey})`,
                      strokeWidth: s.dot?.strokeWidth || 0,
                    }
                  : false
              }
              activeDot={{
                r: (s.dot?.size || 3) + 2,
                stroke: `var(--color-${s.dataKey})`,
                strokeWidth: 2,
                fill: "var(--background)",
              }}
            />
          ))}

          {/* Legend */}
          {config.legend?.enabled !== false && (
            <ChartLegend
              content={
                <ChartLegendContent
                  hideIcon={config.legend?.hideIcon}
                  className={
                    config.legend?.position === "top" ? "pb-3" : "pt-3"
                  }
                />
              }
            />
          )}

          {/* Data Zoom/Brush */}
          {config.responsive && (
            <Brush
              dataKey={(config.xAxis as any)?.dataKey || config.xAxis?.label?.value || Object.keys(chartData[0] || {})[0]}
              height={30}
              stroke="var(--muted-foreground)"
              fill="var(--muted)"
            />
          )}
        </RechartsAreaChart>
      </ChartContainer>
    </div>
  );
}

// ========================================
// Area Chart Card Component
// ========================================

export function AreaChartCard({
  reportId,
  card,
  records,
  state,
  params,
  className,
  theme,
}: ChartCardProps<AreaChartCardSettings>) {
  const { callbacks } = useDashboard();

  // Extract data from records
  const data = useMemo(() => {
    if (!records?.length) return [];

    // Handle different record formats
    const firstRecord = records[0];
    if (firstRecord && Array.isArray((firstRecord as any).data)) {
      return (firstRecord as any).data;
    }

    // Handle single record
    return records as any[];
  }, [records]);

  // Handle data point interactions
  const handleDataPointClick = (dataPoint: any, index: number) => {
    callbacks.onCardStateChange?.(reportId, card.id, {
      error: undefined, // Clear any existing errors, add custom state as needed
    });
  };

  const handleDataPointHover = (dataPoint: any, index: number) => {
    // Optional hover handling
  };

  const handleLegendClick = (data: any) => {
    // Optional legend click handling
  };

  return (
    <div className={`w-full h-full ${className || ""}`}>
      <AreaChart
        data={data}
        config={card.settings.chartConfig}
        width="100%"
        height="100%"
        loading={state?.loadingState === "loading"}
        error={state?.error || null}
        onDataPointClick={handleDataPointClick}
        onDataPointHover={handleDataPointHover}
        onLegendClick={handleLegendClick}
        theme={theme}
        className="w-full h-full"
      />
    </div>
  );
}

// Export both components
export default AreaChart;
