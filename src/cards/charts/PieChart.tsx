// PieChart Component - Reusable pie/donut chart with custom labels, legends, and interactive features
"use client";

import React, { useMemo, useRef } from "react";
import {
  Pie,
  PieChart as RechartsPieChart,
  Cell,
  ResponsiveContainer,
  Sector,
  LabelList,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "../../ui";
import type {
  PieChartConfig,
  ChartCardProps,
  PieChartCardSettings,
  BaseChartProps,
} from "./types";
import {
  normalizeChartData,
  generateColorPalette,
  mergeChartConfig,
  validateChartConfig,
  calculateResponsiveDimensions,
  getResponsiveMargin,
} from "./utils";
import { useDashboard } from "../../contexts/dashboard";

// ========================================
// Pie Chart Component
// ========================================

export interface PieChartProps extends BaseChartProps {
  config: PieChartConfig;
}

// Custom active shape for pie segments
const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;

  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <text
        x={cx}
        y={cy}
        dy={8}
        textAnchor="middle"
        fill={fill}
        className="text-sm font-medium"
      >
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="var(--foreground)"
        className="text-sm"
      >
        {`${value}`}
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="var(--muted-foreground)"
        className="text-xs"
      >
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

export function PieChart({
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
}: PieChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = React.useState<number>(-1);

  // Merge with defaults
  const config = useMemo(
    () => mergeChartConfig(userConfig, "pie", theme),
    [userConfig, theme]
  );

  // Validate configuration
  const { isValid, errors } = useMemo(
    () => validateChartConfig(config),
    [config]
  );

  const chartData = useMemo(() => {
    const normalized = normalizeChartData(rawData);

    return normalized
      .map((item, index) => {
        const name =
          config.nameKey && (item as any)[config.nameKey] != null
            ? (item as any)[config.nameKey]
            : config.dataKey &&
                (item as any)[config.dataKey] != null &&
                typeof (item as any)[config.dataKey] !== "number"
              ? (item as any)[config.dataKey]
              : ((item as any).name ?? `Item ${index + 1}`);

        const seriesKey =
          (config as any).series &&
          Array.isArray((config as any).series) &&
          (config as any).series[0]
            ? (config as any).series[0].key
            : undefined;
        const rawValue =
          config.valueKey && (item as any)[config.valueKey] != null
            ? (item as any)[config.valueKey]
            : seriesKey && (item as any)[seriesKey] != null
              ? (item as any)[seriesKey]
              : ((config.dataKey &&
                typeof (item as any)[config.dataKey] === "number"
                  ? (item as any)[config.dataKey]
                  : undefined) ?? (item as any).value);

        const value = Number(rawValue ?? 0);

        return {
          name,
          value,
          _raw: item,
          ...item,
        } as any;
      })
      .filter(
        (item) =>
          typeof item.value === "number" && !isNaN(item.value) && item.value > 0
      );
  }, [rawData, config]);

  // Generate colors
  const colors = useMemo(() => {
    return (
      config.colors ||
      generateColorPalette(config.theme?.colors, chartData.length, theme)
    );
  }, [config.colors, config.theme?.colors, chartData.length, theme]);

  // Create chart configuration for ChartContainer
  const chartConfig = useMemo(() => {
    const configObj: Record<string, any> = {};

    chartData.forEach((item, index) => {
      configObj[item.name] = {
        label: item.name,
        color: colors[index % colors.length],
      };
    });

    return configObj;
  }, [chartData, colors]);

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

  // Handle mouse interactions
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
    if (onDataPointHover) {
      onDataPointHover(chartData[index], index);
    }
  };

  const onPieLeave = () => {
    setActiveIndex(-1);
  };

  const onPieClick = (data: any, index: number) => {
    if (onDataPointClick) {
      onDataPointClick(data, index);
    }
  };

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-32 mb-4"></div>
          <div className="w-64 h-64 bg-muted rounded-full"></div>
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
        <RechartsPieChart margin={margin}>
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
                      ? (config.tooltip.formatter.value as any)
                      : config.tooltipFormatter
                        ? (config.tooltipFormatter as any)
                        : (value: any, name: string) => [value, name]
                  }
                  labelFormatter={
                    typeof config.tooltip?.formatter?.label === "function"
                      ? (config.tooltip.formatter.label as any)
                      : undefined
                  }
                />
              }
            />
          )}

          {/* Pie */}
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={config.labelLine !== false}
            label={
              config.labelPosition === "outside"
                ? config.labelFormatter
                  ? typeof config.labelFormatter === "function"
                    ? config.labelFormatter
                    : true
                  : true
                : false
            }
            outerRadius={config.outerRadius || "80%"}
            innerRadius={
              config.variant === "donut" ? config.innerRadius || "40%" : 0
            }
            fill="var(--chart-1)"
            dataKey="value"
            startAngle={config.startAngle || 0}
            endAngle={config.endAngle || 360}
            paddingAngle={config.paddingAngle || 0}
            cornerRadius={config.cornerRadius || 0}
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            onClick={onPieClick}
          >
            {/* Custom colors for each cell */}
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}

            {/* Inside labels for pie/donut */}
            {config.labelPosition === "inside" && (
              <LabelList
                dataKey="value"
                position="center"
                formatter={
                  config.labelFormatter
                    ? typeof config.labelFormatter === "function"
                      ? config.labelFormatter
                      : undefined
                    : undefined
                }
              />
            )}
          </Pie>

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
        </RechartsPieChart>
      </ChartContainer>
    </div>
  );
}

// ========================================
// Pie Chart Card Component
// ========================================

export function PieChartCard({
  reportId,
  card,
  records,
  state,
  params,
  className,
  theme,
}: ChartCardProps<PieChartCardSettings>) {
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
      <PieChart
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
export default PieChart;
