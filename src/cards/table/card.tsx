"use client";

import React, { useEffect, useMemo } from "react";
import { BaseCardProps } from "../../types";
import {
  BaseDashboardCardRecord,
  CommonCardSettings,
} from "../../types";
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
  useStorageHook
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
  /** Enable search/filtering */
  enableSearch?: boolean;
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
  /** Columns to include in search if * then all columns should be searchable*/
  searchableColumns?: string[] | "*";
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
  const isHttpCard = card.query?.variant === "http";
  const settings = card.settings as DashboardTableSettings;
  const storageKey = useMemo(
    () => `table-card-${reportId}-${card.id}-page`,
    [reportId, card.id]
  );

  // current page persisted in sessionStorage
  const { storedValue: storedPage, setValue: setStoredPage } = useStorageHook<number>(
    "sessionStorage",
    storageKey,
    1
  );
  const currentPage = Number(storedValueToNumber(storedPage, 1));
  // wrapper so existing code can call setCurrentPage
  const setCurrentPage = (p: number) => setStoredPage(Number(p));

  // helper to normalize stored values
  function storedValueToNumber(v: any, fallback: number) {
    if (typeof v === "number") return v;
    if (typeof v === "string") return Number(v) || fallback;
    return fallback;
  }

  // Persisted keys for collected streaming state
  const rowsKey = useMemo(
    () => `table-card-${reportId}-${card.id}-rows`,
    [reportId, card.id]
  );
  const colsKey = useMemo(
    () => `table-card-${reportId}-${card.id}-cols`,
    [reportId, card.id]
  );
  const totalKey = useMemo(
    () => `table-card-${reportId}-${card.id}-total`,
    [reportId, card.id]
  );

  // Persist collected records across streaming updates (stored in sessionStorage)
  const { storedValue: collectedRows, setValue: setCollectedRows } = useStorageHook<
    Record<string, any>[]
  >("sessionStorage", rowsKey, []);
  const { storedValue: collectedColumns, setValue: setCollectedColumns } = useStorageHook<
    string[] | undefined
  >("sessionStorage", colsKey, undefined);
  const { storedValue: collectedTotal, setValue: setCollectedTotal } = useStorageHook<
    number | undefined
  >("sessionStorage", totalKey, undefined);

  const seenKeysRef = React.useRef<Set<string>>(new Set());

  // Accumulate incoming records (streaming). We avoid re-adding rows we've already seen
  // by checking a stable key (id fields or JSON fallback). Header records (no rows)
  // are used to set total/columns if provided.
  useEffect(() => {
    console.log("[TableCard] Incoming records:", records);
    if (!records || records.length === 0) return;
    // Fast-path for HTTP variant: records represent final page(s)
    if (isHttpCard) {
      // Flatten rows across all records and use as authoritative set
      const flatRows: Record<string, any>[] = [];
      let headerCols: string[] | undefined = undefined;
      let headerTotal: number | undefined = undefined;

      for (const record of records) {
        if (Array.isArray(record.rows)) {
          flatRows.push(...record.rows);
        }
        if (headerCols == null && Array.isArray(record.columns)) {
          headerCols = record.columns;
        }
        if (headerTotal == null && typeof record.totalCount === "number") {
          headerTotal = record.totalCount;
        }
      }

      // Replace collected storage with authoritative HTTP response
      setCollectedRows(flatRows);
      if (headerCols !== undefined) setCollectedColumns(headerCols);
      if (headerTotal !== undefined) setCollectedTotal(headerTotal);

      // Clear streaming dedup state to avoid mixing modes
      seenKeysRef.current = new Set();
      return;
    }

    let addedRows: Record<string, any>[] = [];

    for (const record of records) {
      if (Array.isArray(record.rows)) {
        if (record.rows.length === 0 && record.totalCount != null) {
          if (collectedTotal == null) setCollectedTotal(record.totalCount);
          if (Array.isArray(record.columns) && collectedColumns == null) {
            setCollectedColumns(record.columns);
          }
        } else {
          for (const row of record.rows) {
            const key = String(
              (row &&
                (row.id || row["id"] || row["Crime ID"] || row["crime_id"])) ||
                JSON.stringify(row)
            );
            if (!seenKeysRef.current.has(key)) {
              seenKeysRef.current.add(key);
              addedRows.push(row);
            }
          }
        }
      }

      if (collectedTotal == null && record.totalCount != null) {
        setCollectedTotal(record.totalCount);
      }
    }

    if (addedRows.length > 0) {
      setCollectedRows((prev: Record<string, any>[] | null | undefined) => [
        ...(Array.isArray(prev) ? prev : []),
        ...addedRows,
      ]);
    }
    // we intentionally do not reset seenKeysRef on records change to preserve history
  }, [records]);

  // Extract and merge rows from all records
  // normalize nullable stored values into safe locals
  const rowsArray: Record<string, any>[] = Array.isArray(collectedRows)
    ? collectedRows
    : [];
  const colsArray: string[] | undefined = Array.isArray(collectedColumns)
    ? collectedColumns
    : undefined;
  const totalVal: number | undefined = typeof collectedTotal === "number" ? collectedTotal : undefined;

  const { mergedRows, columns, totalCount } = useMemo(() => {
    // Use persisted collected rows/columns/total when available; fall back to incoming data
    const allRows = rowsArray.length > 0 ? rowsArray : [];
    const total = totalVal;
    const headerColumns = colsArray;

    // Determine columns in this order of preference:
    // 1. settings.columns, 2. headerColumns (from header record), 3. derive from data in arrival order
    let finalColumns: DashboardTableColumn[];
    if (settings?.columns && settings.columns.length > 0) {
      finalColumns = settings.columns.filter((col) => !col.hidden);
    } else if (headerColumns && headerColumns.length > 0) {
      finalColumns = headerColumns.map((key: string) => ({
        key,
        header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
        type: "text" as const,
        sortable: true,
      }));
    } else {
      // Preserve insertion order of keys as they appear in rows
      const seen = new Set<string>();
      const keysInOrder: string[] = [];
      for (const row of allRows) {
        Object.keys(row).forEach((k) => {
          if (!seen.has(k)) {
            seen.add(k);
            keysInOrder.push(k);
          }
        });
      }
      finalColumns = keysInOrder.map((key) => ({
        key,
        header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
        type: "text" as const,
        sortable: true,
      }));
    }

    return {
      mergedRows: allRows,
      columns: finalColumns,
      // Prefer header totalCount when present; fallback to number of rows
      totalCount: total ?? allRows.length,
    };
  }, [rowsArray, colsArray, totalVal, settings?.columns]);

  // Pagination settings (declare before effects that use them)
  const pageSize = settings?.pageSize || 10;
  const enablePagination = (settings?.enablePagination ?? true) !== false;

  // Ensure current page stays in range as streamed totalCount/rows change
  useEffect(() => {
    const pages = Math.max(
      1,
      Math.ceil((totalCount || mergedRows.length) / pageSize)
    );
    if (currentPage > pages) {
      setCurrentPage(pages);
    }
  }, [totalCount, mergedRows.length, pageSize, currentPage]);

  // Calculate paginated data
  const paginatedRows = useMemo(() => {
    if (!enablePagination) return mergedRows;
    const startIndex = (currentPage - 1) * pageSize;
    return mergedRows.slice(startIndex, startIndex + pageSize);
  }, [mergedRows, currentPage, pageSize, enablePagination]);

  // Format cell value based on column type
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
  if (mergedRows.length === 0) {
    return (
      <div
        className={cn("h-full flex items-center justify-center", className)}
      >
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
                  {columns.map((column) => (
                    <TableHead
                      key={column.key}
                      style={{
                        width: column.width ? `${column.width}px` : undefined,
                      }}
                      className={cn(
                        column.sortable && "cursor-pointer hover:bg-muted/50",
                        "font-medium"
                      )}
                    >
                      {column.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRows.map((row, rowIndex) => {
                  const globalRowIndex = enablePagination
                    ? (currentPage - 1) * pageSize + rowIndex + 1
                    : rowIndex + 1;

                  // Stable key: prefer explicit id fields when streaming; fallback to global index
                  const rowKey =
                    (row &&
                      (row.id ||
                        row["id"] ||
                        row["Crime ID"] ||
                        row["crime_id"])) ||
                    `row-${globalRowIndex}`;

                  return (
                    <TableRow key={String(rowKey)} isOdd={rowIndex % 2 === 1}>
                      {settings?.showRowNumbers && (
                        <TableCell className="font-mono text-muted-foreground">
                          {globalRowIndex}
                        </TableCell>
                      )}
                      {columns.map((column) => (
                        <TableCell key={column.key}>
                          {column.render
                            ? column.render(row[column.key], row)
                            : formatCellValue(row[column.key], column)}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        {enablePagination && mergedRows.length > pageSize && (
          <div className="border-t p-4">
            <Pagination
              page={currentPage}
              count={totalCount}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
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
