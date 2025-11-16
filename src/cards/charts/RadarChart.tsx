// RadarChart Component - Reusable radar chart with customizable grids, multiple data series, and fill options
"use client";

import React, { useMemo, useRef } from "react";
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "../../ui";
import type { 
  RadarChartConfig, 
  ChartCardProps, 
  RadarChartCardSettings,
  BaseChartProps 
} from "./types";
import { 
  normalizeChartData, 
  generateColorPalette, 
  generateSeriesConfig,
  mergeChartConfig,
  validateChartConfig,
  calculateResponsiveDimensions,
  getResponsiveMargin
} from "./utils";
import { useDashboard } from "../../contexts/dashboard";

// ========================================
// Radar Chart Component
// ========================================

export interface RadarChartProps extends BaseChartProps {
  config: RadarChartConfig;
}

export function RadarChart({
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
}: RadarChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Merge with defaults
  const config = useMemo(() => 
    mergeChartConfig(userConfig, "radar", theme),
    [userConfig, theme]
  );

  // Validate configuration
  const { isValid, errors } = useMemo(() => 
    validateChartConfig(config),
    [config]
  );

  // Process and normalize data
  const chartData = useMemo(() => 
    normalizeChartData(rawData),
    [rawData]
  );

  // Generate series configuration if not provided
  const series = useMemo(() => {
    if (config.series?.length > 0) {
      return config.series;
    }
    
    // Auto-generate series from data keys (excluding category field)
    const dataKeys = chartData.length > 0 && chartData[0]
      ? Object.keys(chartData[0]).filter(key => 
          key !== "index" && 
          key !== "subject" && 
          key !== "category" &&
          typeof chartData[0]?.[key] === "number"
        )
      : [];
    
    const colors = generateColorPalette(config.theme?.colors, dataKeys.length, theme);
    return generateSeriesConfig(chartData, dataKeys, colors, theme);
  }, [config.series, chartData, config.theme?.colors, theme]);

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
        300
      );
    }
    return { width: "100%", height };
  }, [width, height, config.aspectRatio]);

  // Calculate margins
  const margin = useMemo(() => {
    const containerWidth = typeof width === "number" ? width : 400;
    return getResponsiveMargin(containerWidth, config.margin);
  }, [width, config.margin]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-32 mb-4"></div>
          <div className="w-64 h-64 bg-muted rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <div className="text-center">
          <div className="text-destructive mb-2">Chart Error</div>
          <div className="text-sm text-muted-foreground">{error}</div>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
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
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <div className="text-center text-muted-foreground">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div ref={chartRef} className={className} style={{ width, height }}>
      <ChartContainer config={chartConfig} className="h-full w-full aspect-auto">
        <RechartsRadarChart
          data={chartData}
          margin={margin}
          onMouseMove={(state: any) => {
            if (state?.activePayload?.length && onDataPointHover) {
              onDataPointHover(state.activePayload[0].payload, state.activeTooltipIndex);
            }
          }}
          onClick={(state: any) => {
            if (state?.activePayload?.length && onDataPointClick) {
              onDataPointClick(state.activePayload[0].payload, state.activeTooltipIndex);
            }
          }}
        >
          {/* Polar Grid */}
          {config.polarGrid?.enabled !== false && (
            <PolarGrid
              gridType={config.polarGrid?.gridType || "polygon"}
              radialLines={config.polarGrid?.radialLines !== false}
              stroke={config.polarGrid?.stroke || config.theme?.grid?.color || "var(--border)"}
              strokeDasharray={config.polarGrid?.strokeDasharray || config.theme?.grid?.strokeDasharray}
              fill={config.polarGrid?.fill}
              fillOpacity={config.polarGrid?.fillOpacity || 0}
            />
          )}

          {/* Polar Angle Axis (categories) */}
          <PolarAngleAxis
            dataKey="subject"
            tick={{
              fontSize: config.polarAngleAxis?.tick?.fontSize || 12,
              fill: config.polarAngleAxis?.tick?.color || "var(--muted-foreground)",
              radius: config.polarAngleAxis?.tick?.radius || 10,
              ...config.polarAngleAxis?.tick
            }}
            tickFormatter={
              typeof config.polarAngleAxis?.tick?.formatter === "function"
                ? config.polarAngleAxis.tick.formatter
                : undefined
            }
          />

          {/* Polar Radius Axis (values) */}
          {config.polarRadiusAxis?.enabled !== false && (
            <PolarRadiusAxis
              angle={config.polarRadiusAxis?.angle || 90}
              domain={
                Array.isArray(config.polarRadiusAxis?.domain) 
                  ? config.polarRadiusAxis.domain as [any, any]
                  : undefined
              }
              tick={{
                fontSize: config.polarRadiusAxis?.tick?.fontSize || 10,
                fill: config.polarRadiusAxis?.tick?.color || "var(--muted-foreground)",
                ...config.polarRadiusAxis?.tick
              }}
              tickFormatter={
                typeof config.polarRadiusAxis?.tick?.formatter === "function"
                  ? config.polarRadiusAxis.tick.formatter
                  : undefined
              }
              orientation={config.polarRadiusAxis?.orientation || "left"}
            />
          )}

          {/* Tooltip */}
          {config.tooltip?.enabled !== false && (
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel={config.tooltip?.content?.hideLabel}
                  hideIndicator={config.tooltip?.content?.hideIndicator}
                  indicator="dot"
                  labelKey={config.tooltip?.content?.labelKey}
                  formatter={
                    typeof config.tooltip?.formatter?.value === "function"
                      ? config.tooltip.formatter.value as any
                      : undefined
                  }
                  labelFormatter={
                    typeof config.tooltip?.formatter?.label === "function"
                      ? config.tooltip.formatter.label as any
                      : undefined
                  }
                />
              }
            />
          )}

          {/* Radar Areas */}
          {series.map((s) => (
            <Radar
              key={s.dataKey}
              name={s.name}
              dataKey={s.dataKey}
              stroke={`var(--color-${s.dataKey})`}
              strokeWidth={s.strokeWidth || 2}
              fill={`var(--color-${s.dataKey})`}
              fillOpacity={s.opacity || 0.3}
              strokeDasharray={s.strokeDasharray}
              connectNulls={s.connectNulls !== false}
              dot={
                s.dot?.enabled !== false
                  ? {
                      r: s.dot?.size || 3,
                      fill: `var(--color-${s.dataKey})`,
                      strokeWidth: s.dot?.strokeWidth || 0,
                    }
                  : false
              }
            />
          ))}

          {/* Legend */}
          {config.legend?.enabled !== false && (
            <ChartLegend
              content={
                <ChartLegendContent
                  hideIcon={config.legend?.hideIcon}
                  className={config.legend?.position === "top" ? "pb-3" : "pt-3"}
                />
              }
            />
          )}
        </RechartsRadarChart>
      </ChartContainer>
    </div>
  );
}

// ========================================
// Radar Chart Card Component
// ========================================

export function RadarChartCard({
  reportId,
  card,
  records,
  state,
  params,
  className,
  theme
}: ChartCardProps<RadarChartCardSettings>) {
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
      error: undefined // Clear any existing errors, add custom state as needed
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
      <RadarChart
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
export default RadarChart;
