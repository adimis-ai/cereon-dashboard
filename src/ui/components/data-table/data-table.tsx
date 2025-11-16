"use client";

import * as React from "react";
import {
  flexRender,
  type Table as TanstackTable,
  type Row,
} from "@tanstack/react-table";
import { useMediaQuery } from "../../hooks/use-media-query";

import { getCommonPinningStyles } from "../../lib/index";
import { cn } from "../../lib/index";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableContainer,
} from "../table";
import { Loader } from "../loader";
import { DataTableSkeleton } from "./data-table-skeleton";
import { DataTablePagination } from "./data-table-pagination";
import { Checkbox } from "../checkbox";

export interface DataTableProps<
  TData extends { [K in TIdentifier]: string | number },
  TIdentifier extends string = "id",
> extends React.HTMLAttributes<HTMLDivElement> {
  table: TanstackTable<TData>;
  count: number;
  disableTableView?: boolean;
  floatingBar?: React.ReactNode | null;
  onRowClick?: (row: TData) => void | Promise<void>;
  renderCard?: (
    item: TData,
    selected: boolean,
    onToggleSelect: () => void
  ) => React.ReactNode;
  pageSizeOptions?: number[];
  loading?: boolean;
  currentView?: "table" | "card";
  cardColumns?: {
    "2xl": number;
    xl: number;
    lg: number;
    md: number;
    sm: number;
    xs: number;
  };
  identifierField?: TIdentifier;
  preview?: boolean;
  data?: TData[];
  renderRow?: (row: Row<TData>) => React.ReactNode;
  renderBody?: (props: { children: React.ReactNode }) => React.ReactNode;
  renderRowCheckbox?: boolean;
  onRowCheckboxChange?: (selectedRows: TData[]) => void | Promise<void>;
}

export function DataTable<
  TData extends { [K in TIdentifier]: string | number },
  TIdentifier extends string = "id",
>({
  table,
  floatingBar = null,
  children,
  className,
  onRowClick,
  renderCard,
  currentView = "table",
  pageSizeOptions,
  count = 0,
  loading = false,
  preview = false,
  disableTableView = false,
  cardColumns = {
    "2xl": 4,
    xl: 3,
    lg: 2,
    md: 2,
    sm: 1,
    xs: 1,
  },
  identifierField = "id" as TIdentifier,
  renderBody,
  renderRow,
  renderRowCheckbox = false,
  onRowCheckboxChange,
  ...props
}: DataTableProps<TData, TIdentifier>) {
  const [loadingRow, setLoadingRow] = React.useState<string | null>(null);
  const [selectedRows, setSelectedRows] = React.useState<TData[]>([]);
  const is2xl = useMediaQuery("(min-width: 1536px)");
  const isXl = useMediaQuery("(min-width: 1280px)");
  const isLg = useMediaQuery("(min-width: 1024px)");
  const isMd = useMediaQuery("(min-width: 768px)");
  const isSm = useMediaQuery("(min-width: 640px)");

  const handleRowClick = async (
    row: TData,
    event: React.MouseEvent<HTMLTableRowElement>
  ) => {
    if (!onRowClick) return;
    if (event.ctrlKey) return;

    try {
      const rowId = row[identifierField].toString();
      setLoadingRow(rowId);
      await onRowClick(row);
    } finally {
      setLoadingRow(null);
    }
  };

  const handleSelectAllRows = React.useCallback(() => {
    const currentPageRows = table.getRowModel().rows.map((row) => row.original);
    if (selectedRows.length === currentPageRows.length) {
      setSelectedRows([]);
      onRowCheckboxChange?.([]);
    } else {
      setSelectedRows(currentPageRows);
      onRowCheckboxChange?.(currentPageRows);
    }
  }, [table, selectedRows, onRowCheckboxChange]);

  const handleRowSelect = React.useCallback(
    (row: TData) => {
      setSelectedRows((prev) => {
        const isSelected = prev.some(
          (r) => r[identifierField] === row[identifierField]
        );
        const newSelection = isSelected
          ? prev.filter((r) => r[identifierField] !== row[identifierField])
          : [...prev, row];
        onRowCheckboxChange?.(newSelection);
        return newSelection;
      });
    },
    [identifierField, onRowCheckboxChange]
  );

  return (
    <div
      className={cn("w-full space-y-2.5 overflow-auto", className)}
      {...props}
    >
      {children}
      {!loading ? (
        <React.Fragment>
          {currentView === "card" && renderCard ? (
            <div
              style={{
                display: "grid",
                gap: "0.7rem",
                gridTemplateColumns: `repeat(${
                  is2xl
                    ? cardColumns["2xl"]
                    : isXl
                      ? cardColumns.xl
                      : isLg
                        ? cardColumns.lg
                        : isMd
                          ? cardColumns.md
                          : isSm
                            ? cardColumns.sm
                            : cardColumns.xs
                }, minmax(0, 1fr))`,
                alignItems: "stretch",
              }}
            >
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => {
                  const selected = row.getIsSelected();
                  const toggleSelect = () => row.toggleSelected(!selected);

                  return (
                    <div
                      key={row.original[identifierField]}
                      onClick={async (event) => {
                        toggleSelect();
                        if (event instanceof MouseEvent && event.ctrlKey) {
                          return;
                        }
                        if (onRowClick) {
                          await onRowClick(row.original);
                        }
                      }}
                      style={{
                        cursor: "pointer",
                        width: "auto",
                      }}
                    >
                      {renderCard(row.original, selected, toggleSelect)}
                    </div>
                  );
                })
              ) : (
                <div
                  style={{
                    height: "6rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.375rem",
                  }}
                >
                  No results.
                </div>
              )}
            </div>
          ) : !disableTableView ? (
            <div className="rounded-md border">
              <TableContainer>
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {renderRowCheckbox && (
                          <TableHead
                            style={{
                              width: "48px",
                              minWidth: "48px",
                              maxWidth: "48px",
                            }}
                          >
                            <Checkbox
                              checked={
                                table.getRowModel().rows.length > 0 &&
                                selectedRows.length ===
                                  table.getRowModel().rows.length
                              }
                              onCheckedChange={handleSelectAllRows}
                              aria-label="Select all rows"
                            />
                          </TableHead>
                        )}
                        {headerGroup.headers.map((header) => (
                          <TableHead
                            key={header.id}
                            colSpan={header.colSpan}
                            style={{
                              ...getCommonPinningStyles({
                                column: header.column,
                              }),
                            }}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.length ? (
                      table.getRowModel().rows.map((row) => {
                        const id = row.original[identifierField];
                        const isRowLoading =
                          id !== undefined && loadingRow === id.toString();

                        if (renderRow) {
                          return renderRow(row);
                        }

                        return (
                          <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                            onClick={(e) => handleRowClick(row.original, e)}
                            className={cn(
                              onRowClick && "cursor-pointer",
                              isRowLoading && "opacity-70"
                            )}
                          >
                            {renderRowCheckbox && (
                              <TableCell
                                style={{
                                  width: "48px",
                                  minWidth: "48px",
                                  maxWidth: "48px",
                                }}
                              >
                                <Checkbox
                                  checked={selectedRows.some(
                                    (r) =>
                                      r[identifierField] ===
                                      row.original[identifierField]
                                  )}
                                  onCheckedChange={() =>
                                    handleRowSelect(row.original)
                                  }
                                  aria-label={`Select row ${row.original[identifierField]}`}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </TableCell>
                            )}
                            {row.getVisibleCells().map((cell) => {
                              const content = flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              );

                              if (
                                cell === row.getVisibleCells()[0] &&
                                isRowLoading
                              ) {
                                return (
                                  <TableCell
                                    key={cell.id}
                                    style={{
                                      ...getCommonPinningStyles({
                                        column: cell.column,
                                      }),
                                    }}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Loader
                                        variant="simple"
                                        className="shrink-0 size-4"
                                      />
                                      {content}
                                    </div>
                                  </TableCell>
                                );
                              }

                              return (
                                <TableCell
                                  key={cell.id}
                                  style={{
                                    ...getCommonPinningStyles({
                                      column: cell.column,
                                    }),
                                  }}
                                >
                                  {content}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={table.getAllColumns().length}
                          className="h-24 text-center"
                        >
                          No results.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          ) : (
            <div className="h-24 flex items-center justify-center">
              Table view is disabled.
            </div>
          )}
        </React.Fragment>
      ) : (
        <DataTableSkeleton
          columnCount={preview ? 3 : table.getAllColumns().length}
          rowCount={preview ? 3 : 10}
          cellWidths={["10rem", "10rem", "10rem", "10rem", "10rem", "10rem"]}
          shrinkZero
          cardColumns={cardColumns}
          currentView={currentView}
          hideHeader
          withPagination={!preview}
        />
      )}
      {!preview && (
        <div className="flex flex-col gap-2.5">
          <DataTablePagination<TData, TIdentifier>
            table={table}
            pageSizeOptions={pageSizeOptions}
            count={count}
          />
          {table.getFilteredSelectedRowModel().rows.length > 0 && floatingBar}
        </div>
      )}
    </div>
  );
}
