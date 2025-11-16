// RadialChart Component - Reusable radial bar chart and progress indicators
"use client";

import React, { useMemo, useRef } from "react";
import {
  RadialBar,
  RadialBarChart as RechartsRadialBarChart,
  ResponsiveContainer,
  PolarAngleAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "../../ui";
import type { 
  RadialChartConfig, 
  ChartCardProps, 
  RadialChartCardSettings,
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
// Radial Chart Component
// ========================================

export interface RadialChartProps extends BaseChartProps {
  config: RadialChartConfig;
}

export function RadialChart({
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
}: RadialChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Merge with defaults
  const config = useMemo(() => 
    mergeChartConfig(userConfig, "radial", theme),
    [userConfig, theme]
  );

  // Validate configuration
  const { isValid, errors } = useMemo(() => 
    validateChartConfig(config),
    [config]
  );

  // Process and normalize data
  const chartData = useMemo(() => {
    const normalized = normalizeChartData(rawData);
    
    // Transform data for radial chart format
    return normalized.map((item, index) => {
      const transformedItem: any = { ...item };
      
      // Add angle calculations for each series
      config.series.forEach((s, seriesIndex) => {
        const value = Number(item[s.dataKey] || 0);
        transformedItem[s.dataKey] = value;
        
        // Calculate fill based on value for progress indicators
        if (config.variant === "area") {
          transformedItem[`${s.dataKey}_fill`] = `${Math.min(100, (value / 100) * 100)}%`;
        }
      });
      
      return transformedItem;
    });
  }, [rawData, config.series, config.variant]);

  // Generate series configuration if not provided
  const series = useMemo(() => {
    if (config.series?.length > 0) {
      return config.series;
    }
    
    // Auto-generate series from data keys
    const dataKeys = chartData.length > 0 && chartData[0]
      ? Object.keys(chartData[0]).filter(key => 
          key !== "index" && 
          key !== "name" && 
          key !== "category" &&
          !key.endsWith("_fill") &&
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

  // Calculate radial dimensions
  const radialDimensions = useMemo(() => {
    const outerRadius = typeof config.outerRadius === "string" 
      ? parseInt(config.outerRadius.replace("%", "")) 
      : config.outerRadius || 80;
    
    const innerRadius = typeof config.innerRadius === "string" 
      ? parseInt(config.innerRadius.replace("%", "")) 
      : config.innerRadius || 20;
    
    return { outerRadius, innerRadius };
  }, [config.outerRadius, config.innerRadius]);

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
      <ChartContainer config={chartConfig}>
        <RechartsRadialBarChart
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={`${radialDimensions.innerRadius}%`}
          outerRadius={`${radialDimensions.outerRadius}%`}
          startAngle={config.startAngle || 0}
          endAngle={config.endAngle || 360}
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
          {/* Polar Angle Axis */}
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />

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

          {/* Radial Bars */}
          {series.map((s, index) => {
            const barRadius = radialDimensions.innerRadius + 
              (index * ((radialDimensions.outerRadius - radialDimensions.innerRadius) / series.length));
            
            return (
              <RadialBar
                key={s.dataKey}
                dataKey={s.dataKey}
                name={s.name}
                fill={`var(--color-${s.dataKey})`}
                stroke={s.stroke}
                strokeWidth={s.strokeWidth || 0}
                cornerRadius={config.cornerRadius || 0}
                angleAxisId={0}
                label={
                  s.label?.enabled !== false
                    ? // Render a minimal, type-safe SVG label to avoid passing arbitrary CSS props
                      // Recharts accepts a render function for labels which gives us full control.
                      ((props: any) => {
                        const value = props?.value ?? props?.payload?.value ?? "";
                        const formatted = typeof s.label?.formatter === "function"
                          ? s.label.formatter(value)
                          : String(value);

                        // Center the label within the radial bar segment using SVG text anchors
                        const x = props?.cx ?? props?.x ?? 0;
                        const y = props?.cy ?? props?.y ?? 0;

                        return React.createElement(
                          'text',
                          {
                            x,
                            y,
                            textAnchor: 'middle',
                            dominantBaseline: 'middle',
                            className: 'text-xs font-medium',
                            fill: s.label?.style?.color || 'var(--foreground)'
                          },
                          formatted
                        );
                      }) as any
                    : false
                }
                background={{ fill: "var(--muted)" }}
              />
            );
          })}

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
        </RechartsRadialBarChart>
      </ChartContainer>
    </div>
  );
}

// ========================================
// Radial Chart Card Component
// ========================================

export function RadialChartCard({
  reportId,
  card,
  records,
  state,
  params,
  className,
  theme
}: ChartCardProps<RadialChartCardSettings>) {
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
      <RadialChart
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
export default RadialChart;
