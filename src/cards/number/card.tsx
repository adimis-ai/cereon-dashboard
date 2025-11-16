"use client";

import React, { useMemo } from "react";
import { cn } from "../../ui";
import { Badge } from "../../ui";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Hash,
  AlertTriangle,
  GripVertical,
} from "lucide-react";
import {
  BaseCardProps,
  BaseDashboardCardRecord,
  CommonCardSettings,
  QueryMeta,
} from "../../types";

/* ----------------------------- Types & Interfaces ---------------------------- */

export interface DashboardNumberSettings extends CommonCardSettings {
  defaultValue?: number;
  format?: "number" | "currency" | "percentage" | "bytes" | "compact";
  currency?: string;
  decimals?: number;
  showTrend?: boolean;
  unit?: string;
  valueColor?: "default" | "primary" | "success" | "warning" | "destructive";
  large?: boolean;
}

export type TrendDirection = "up" | "down" | "neutral";

export interface DashboardNumberCardRecord extends BaseDashboardCardRecord {
  kind: "number";
  value?: number;
  previousValue?: number;
  trend?: TrendDirection;
  trendPercentage?: number;
  label?: string;
  meta?: QueryMeta & { unit?: string; format?: string; [k: string]: any };
}

export interface NumberCardProps
  extends BaseCardProps<
    "number",
    { number: DashboardNumberSettings },
    { number: DashboardNumberCardRecord }
  > {}

/* --------------------------------- Helpers ---------------------------------- */

const DEFAULT_LOCALE = "en-US";

function parseMeta(meta?: any): Record<string, any> | undefined {
  if (!meta) return undefined;
  if (typeof meta === "string") {
    try {
      return JSON.parse(meta);
    } catch {
      return undefined;
    }
  }
  return meta;
}

function formatBytes(value: number, decimals: number) {
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  if (value === 0) return `0 B`;
  const i = Math.floor(Math.log(Math.abs(value)) / Math.log(1024));
  const adjusted = value / Math.pow(1024, i);
  return `${adjusted.toFixed(decimals)} ${sizes[Math.min(i, sizes.length - 1)]}`;
}

function formatNumberValue(
  value: number,
  format: DashboardNumberSettings["format"],
  decimals: number,
  currency: string,
  unit?: string
): string {
  try {
    switch (format) {
      case "currency":
        return new Intl.NumberFormat(DEFAULT_LOCALE, {
          style: "currency",
          currency,
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(value);
      case "percentage":
        return new Intl.NumberFormat(DEFAULT_LOCALE, {
          style: "percent",
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(value);
      case "compact":
        return new Intl.NumberFormat(DEFAULT_LOCALE, {
          notation: "compact",
          compactDisplay: "short",
          minimumFractionDigits: 0,
          maximumFractionDigits: Math.max(0, decimals),
        }).format(value);
      case "bytes":
        return formatBytes(value, decimals);
      default:
        return `${new Intl.NumberFormat(DEFAULT_LOCALE, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(value)}${unit ? ` ${unit}` : ""}`;
    }
  } catch {
    // Fallback: simple string with optional unit
    return `${String(value)}${unit && format !== "currency" && format !== "percentage" ? ` ${unit}` : ""}`;
  }
}

function calculateTrend(
  finalValue: number,
  record?: DashboardNumberCardRecord,
  showTrend?: boolean
): { trend: TrendDirection | null; trendPercentage: number | null } {
  if (!showTrend) return { trend: null, trendPercentage: null };

  if (record?.trend) {
    return {
      trend: record.trend,
      trendPercentage: record.trendPercentage ?? null,
    };
  }

  const previous = record?.previousValue;
  if (previous === undefined || previous === null)
    return { trend: null, trendPercentage: null };

  if (finalValue > previous) {
    const pct =
      previous === 0
        ? null
        : ((finalValue - previous) / Math.abs(previous)) * 100;
    return { trend: "up", trendPercentage: pct };
  }
  if (finalValue < previous) {
    const pct =
      previous === 0
        ? null
        : ((previous - finalValue) / Math.abs(previous)) * 100;
    return { trend: "down", trendPercentage: pct };
  }
  return { trend: "neutral", trendPercentage: 0 };
}

function trendIcon(dir?: TrendDirection | null) {
  switch (dir) {
    case "up":
      return <TrendingUp className={"w-4 h-4"} />;
    case "down":
      return <TrendingDown className={"w-4 h-4"} />;
    case "neutral":
      return <Minus className={"w-4 h-4"} />;
    default:
      return null;
  }
}

function trendColorClasses(dir?: TrendDirection | null) {
  switch (dir) {
    case "up":
      return "text-success";
    case "down":
      return "text-destructive";
    case "neutral":
      return "text-warning";
    default:
      return "text-muted-foreground";
  }
}

function valueColorClass(token?: string) {
  switch (token) {
    case "primary":
      return "text-primary";
    case "success":
      return "text-success";
    case "warning":
      return "text-warning";
    case "destructive":
      return "text-destructive";
    default:
      return "text-foreground";
  }
}

/* -------------------------------- Component --------------------------------- */

export function NumberCard({ card, records, className }: NumberCardProps) {
  const settingsRaw = (card.settings || {}) as any;
  const settings: DashboardNumberSettings = (settingsRaw.number ??
    settingsRaw) as DashboardNumberSettings;
  const record = (records?.[0] ??
    (undefined as DashboardNumberCardRecord | undefined)) as
    | DashboardNumberCardRecord
    | undefined;

  const parsedMeta = useMemo(() => parseMeta(record?.meta), [record?.meta]);

  const { value, formattedValue, trend, trendPercentage, hasData } =
    useMemo(() => {
      const recordValue = record?.value;
      const defaultValue = settings?.defaultValue ?? 0;
      const finalValue = recordValue ?? defaultValue;

      if (finalValue === undefined || finalValue === null) {
        return {
          value: null,
          formattedValue: null,
          trend: null,
          trendPercentage: null,
          hasData: false,
        };
      }

      const format =
        parsedMeta?.format ??
        (record?.meta as any)?.format ??
        settings.format ??
        "number";
      const decimals = settings.decimals ?? 0;
      const currency = settings.currency ?? "USD";
      const unit =
        parsedMeta?.unit ?? (record?.meta as any)?.unit ?? settings.unit;

      const formatted = formatNumberValue(
        finalValue,
        format,
        decimals,
        currency,
        unit
      );

      const { trend: t, trendPercentage: tp } = calculateTrend(
        finalValue,
        record,
        settings.showTrend
      );

      return {
        value: finalValue,
        formattedValue: formatted,
        trend: t,
        trendPercentage: tp,
        hasData: true,
      };
    }, [record, settings, parsedMeta]);

  if (!hasData) {
    return (
      <div className={cn("h-full flex items-center justify-center", className)}>
        <div className="text-center p-4">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted/50 text-muted-foreground mb-2">
            <Hash className={"w-4 h-4"} />
          </div>
          <p className="text-sm text-muted-foreground">No numeric data</p>
          <p className="text-xs text-muted-foreground mt-1">
            Configure a default value or provide data
          </p>
        </div>
      </div>
    );
  }

  if (value === null || formattedValue === null) {
    return (
      <div className={cn("h-full flex items-center justify-center", className)}>
        <div className="text-center p-4">
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
          <p className="text-sm font-medium">Invalid number data</p>
          <p className="text-xs text-muted-foreground mt-1">
            Check the number format or value
          </p>
        </div>
      </div>
    );
  }

  // Effective color selection
  const serverColor =
    (parsedMeta?.valueColor as DashboardNumberSettings["valueColor"]) ??
    (record as any)?.meta?.valueColor ??
    settings.valueColor;

  const valueClass = valueColorClass(serverColor);

  const isLarge = settings.large ?? true;
  const label = record?.label ?? card.title;

  return (
    <div className={cn("space-y-2 pt-4", className)}>
      <div className="flex justify-start items-center gap-1">
        <div className="card-drag-handle cursor-move rounded flex-shrink-0">
          <GripVertical className="text-muted-foreground size-4" />
        </div>
        {label && (
          <div className="text-sm font-medium text-muted-foreground leading-tight">
            {label}
          </div>
        )}
      </div>

      <div
        className={cn(
          "font-bold leading-tight px-1 mt-2",
          isLarge ? "text-2xl lg:text-3xl" : "text-xl lg:text-2xl",
          valueClass
        )}
      >
        {formattedValue}
      </div>

      {trend && (
        <div className="flex items-center px-1 gap-1">
          <div
            className={cn(
              "flex items-center gap-1 text-xs",
              trendColorClasses(trend)
            )}
          >
            {trendIcon(trend)}
            {trendPercentage !== null && (
              <span>{Math.abs(trendPercentage).toFixed(1)}%</span>
            )}
          </div>

          {trendPercentage !== null && (
            <Badge
              variant="secondary"
              className={cn(
                "text-xs px-1.5 py-0 h-auto",
                trendColorClasses(trend)
              )}
            >
              {trend === "up" ? "+" : trend === "down" ? "-" : ""}
              {Math.abs(trendPercentage).toFixed(1)}%
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

export default NumberCard;
