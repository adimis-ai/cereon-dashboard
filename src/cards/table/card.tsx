"use client";

import React, { useEffect, useMemo, useState } from "react";
import { BaseCardProps } from "../../types";
import { BaseDashboardCardRecord, CommonCardSettings } from "../../types";
import { cn } from "../../ui";
import { Table2, AlertTriangle } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableContainer,
  Pagination,
  useStorageHook,
} from "../../ui";

/**
 * Column configuration for table cards
 */
export interface DashboardTableColumn {
  /** Column identifier/key */
  key: string;
  /** Display header */
  header: string;
  /** Column type for formatting */
  type?: "text" | "number" | "date" | "boolean" | "badge" | "badges";
  /** Column width */
  width?: number;
  /** Whether column is sortable */
  sortable?: boolean;
  /** Whether column is hidden */
  hidden?: boolean;
  /** Custom cell renderer */
  render?: (value: any, row: any) => React.ReactNode;
}

/**
 * Settings for table cards
 */
export interface DashboardTableSettings extends CommonCardSettings {
  /** Column definitions */
  columns?: DashboardTableColumn[];
  /** Compact table display */
  compact?: boolean;
  /** Show row numbers */
  showRowNumbers?: boolean;
  /** Maximum height for scrolling */
  maxHeight?: number;
  /** Enable pagination defaults to true*/
  enablePagination?: boolean;
  /** Rows per page */
  pageSize?: number;
  /** Options for rows per page */
  pageSizeOptions?: number[];
  /** Column to use as index (unique identifier) default to id */
  indexColumn?: string;
}

/**
 * Record payload for table cards
 */
export interface DashboardTableCardRecord extends BaseDashboardCardRecord {
  kind: "table";
  /** Array of row data */
  rows?: Record<string, any>[];
  /** Total count for pagination */
  totalCount?: number;
  /** Column headers (if different from settings) */
  columns?: string[];
}

export interface TableCardProps
  extends BaseCardProps<
    "table",
    { table: DashboardTableSettings },
    { table: DashboardTableCardRecord }
  > {}

export function TableCard({
  card,
  records,
  className,
  reportId,
}: TableCardProps) {
  const settings = card.settings as DashboardTableSettings;
  const isHttp = card.query?.variant === "http";

  useEffect(() => {
    console.log(
      `TableCard records for report ${reportId} - card ${card.id}:`,
      JSON.stringify(records)
    );
  }, [records]);

  const formatCellValue = (value: any, column: DashboardTableColumn) => {
    if (value == null) return "";

    switch (column.type) {
      case "number":
        return typeof value === "number"
          ? value.toLocaleString()
          : String(value);
      case "date":
        return value instanceof Date
          ? value.toLocaleDateString()
          : String(value);
      case "boolean":
        return value ? "Yes" : "No";
      case "badge":
        return (
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
            {String(value)}
          </span>
        );
      case "badges":
        const badges = Array.isArray(value) ? value : [value];
        return (
          <div className="flex flex-wrap gap-1">
            {badges.map((badge, index) => (
              <span
                key={index}
                className="inline-flex items-center rounded-full bg-secondary/10 px-2 py-1 text-xs font-medium text-secondary-foreground"
              >
                {String(badge)}
              </span>
            ))}
          </div>
        );
      default:
        return String(value);
    }
  };

  // No data available
  // We'll accumulate rows across streaming records (when not http)
  const indexColumn = settings?.indexColumn || "id";

  // Merge incoming records into a map to dedupe by indexColumn
  const mergedRows = useMemo(() => {
    const map = new Map<any, Record<string, any>>();
    // If the source was http, records array likely contains a single record with all rows
    for (const rec of records) {
      const rows = Array.isArray(rec.rows) ? rec.rows : [];
      for (const row of rows) {
        const rawKey = row?.[indexColumn];
        if (typeof rawKey !== "undefined" && rawKey !== null) {
          const keyStr = String(rawKey);
          // Keep latest occurrence (streaming will update existing key)
          const existing = map.get(keyStr) as Record<string, any> | undefined;
          map.set(keyStr, { ...(existing || {}), ...row });
        } else {
          // For rows without indexColumn, use a stable JSON key so duplicates merge
          const stableKey = JSON.stringify(row);
          const existing = map.get(stableKey) as
            | Record<string, any>
            | undefined;
          map.set(stableKey, { ...(existing || {}), ...row });
        }
      }
    }
    return Array.from(map.values());
  }, [records, indexColumn]);

  if (mergedRows.length === 0) {
    return (
      <div className={cn("h-full flex items-center justify-center", className)}>
        <div className="text-center p-4">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted/50 text-muted-foreground mb-2">
            <Table2 className="w-4 h-4" />
          </div>
          <p className="text-sm text-muted-foreground">No table data</p>
          <p className="text-xs text-muted-foreground mt-1">
            Configure table data or provide rows
          </p>
        </div>
      </div>
    );
  }

  // Determine columns: prefer settings.columns (with keys), else from record.columns, else infer from first row
  const columnDefs: DashboardTableColumn[] = useMemo(() => {
    if (settings?.columns && settings.columns.length > 0) {
      return settings.columns;
    }

    // Try to find columns from incoming records
    for (const rec of records) {
      if (Array.isArray(rec.columns) && rec.columns.length > 0) {
        return rec.columns.map((c: string) => ({ key: c, header: c }));
      }
    }

    // Fallback to keys of first merged row
    const first = mergedRows[0] || {};
    return Object.keys(first).map((k) => ({ key: k, header: k }));
  }, [settings?.columns, records, mergedRows]);

  // Pagination: persist page and pageSize per card via useStorageHook
  const storageKeyBase = `cereon.table.${reportId}.${card.id}`;
  const { storedValue: storedPage, setValue: setPage } = useStorageHook<number>(
    "localStorage",
    `${storageKeyBase}.page`,
    1
  );
  const { storedValue: storedPageSize, setValue: setPageSize } =
    useStorageHook<number>(
      "localStorage",
      `${storageKeyBase}.pageSize`,
      settings?.pageSize || 10
    );

  const page =
    typeof storedPage === "number" && storedPage > 0 ? storedPage : 1;
  const pageSize =
    typeof storedPageSize === "number" && storedPageSize > 0
      ? storedPageSize
      : settings?.pageSize || 10;

  // Clamp page when mergedRows changes
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(mergedRows.length / pageSize));
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [mergedRows.length, page, pageSize, setPage]);

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const visibleRows =
    settings?.enablePagination === false
      ? mergedRows
      : mergedRows.slice(start, end);

  // Final deduplication pass: ensure visibleRows contain unique rows by indexColumn
  const dedupedVisibleRows = useMemo(() => {
    console.log("[TableCard] Deduping visible rows:", visibleRows);
    const seen = new Set<string>();
    const out: Record<string, any>[] = [];
    for (const r of visibleRows) {
      const rawKey = r?.[indexColumn];
      const key = typeof rawKey !== "undefined" && rawKey !== null ? String(rawKey) : JSON.stringify(r);
      if (!seen.has(key)) {
        seen.add(key);
        out.push(r);
      }
    }
    console.log("[TableCard] Deduped visible rows:", out);
    return out;
  }, [visibleRows, indexColumn]);

  try {
    return (
      <div className={cn("h-full bg-card flex flex-col", className)}>
        <div
          className="flex-1 overflow-hidden"
          style={{
            maxHeight: settings?.maxHeight
              ? `${settings.maxHeight}px`
              : undefined,
          }}
        >
          <TableContainer className="h-full">
            <Table className={cn(settings?.compact && "text-sm")}>
              <TableHeader>
                <TableRow>
                  {settings?.showRowNumbers && (
                    <TableHead className="w-12">#</TableHead>
                  )}
                  {columnDefs.map((col) => (
                    <TableHead
                      key={col.key}
                      className={col.width ? undefined : ""}
                    >
                      {col.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {dedupedVisibleRows.map((row, rowIndex) => (
                  <TableRow
                    key={row[indexColumn] ?? rowIndex}
                    isOdd={rowIndex % 2 === 1}
                  >
                    {settings?.showRowNumbers && (
                      <TableCell className="w-12">
                        {start + rowIndex + 1}
                      </TableCell>
                    )}
                    {columnDefs.map((col) => (
                      <TableCell key={col.key}>
                        {col.render
                          ? col.render(row[col.key], row)
                          : formatCellValue(row[col.key], col)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        {settings?.enablePagination !== false && (
          <div className="p-2 border-t bg-muted/25">
            <Pagination
              page={page}
              count={mergedRows.length}
              pageSize={pageSize}
              onPageChange={(p) => setPage(p)}
              align="right"
            />
          </div>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div className={cn("h-full flex items-center justify-center", className)}>
        <div className="text-center p-4">
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
          <p className="text-sm font-medium">Failed to render table</p>
          <p className="text-xs text-muted-foreground mt-1">
            Check the table data format or column configuration
          </p>
        </div>
      </div>
    );
  }
}

export default TableCard;
