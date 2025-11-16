"use client";

import * as React from "react";
import { ArrowDownUp, Check, X } from "lucide-react";
import { useQueryState } from "nuqs";
import type { DataTableFilterField, ExtendedSortingState } from "./types";
import type { Table } from "@tanstack/react-table";

import { cn } from "../../lib/index";
import { Input } from "../input";
import { Button } from "../button";
import { useDebouncedCallback } from "../../hooks/index";
import { DataTableSortList } from "./data-table-sort-list";
import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { Command, CommandGroup, CommandItem } from "../command";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";

interface DataTableToolbarProps<TData>
  extends React.HTMLAttributes<HTMLDivElement> {
  table: Table<TData>;
  filterFields?: DataTableFilterField<TData>[];
  debounceMs?: number;
  shallow?: boolean;
  searchTerm?: string;
  onSearchChange?: (searchTerm: string) => void;
  onFilterChange?: (
    value: Record<string, string> | Record<string, string[]> | undefined
  ) => void | Promise<void>;
  onSortChange?: (sorting: ExtendedSortingState<TData>) => void;
  onReset?: () => void;
  disableViewColumns?: boolean;
  disableSort?: boolean;
  simpleSort?: boolean;
  onSimpleSortChange?: (sorting: "asc" | "desc") => void;
  extraButtons?: React.ReactNode;
  hidden?: boolean;
  CreateComponent?: React.ComponentType<{
    open: boolean;
    onOpenChange: (val: boolean) => void;
    onSubmit: () => Promise<void>;
  }>;
}

export function DataTableToolbar<TData>({
  table,
  filterFields = [],
  children,
  className,
  debounceMs = 300,
  shallow = true,
  onFilterChange,
  onSortChange,
  onReset,
  searchTerm,
  onSearchChange,
  disableViewColumns = false,
  disableSort = false,
  simpleSort = false,
  hidden = false,
  onSimpleSortChange,
  extraButtons,
  CreateComponent,
  ...props
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  const [filters, setFilters] = useQueryState("filters", {
    clearOnDefault: true,
    shallow: true,
    parse(value) {
      try {
        return value ? JSON.parse(value) : {};
      } catch (e) {
        console.error("Failed to parse filters from URL", e);
        return {};
      }
    },
    serialize(value) {
      return JSON.stringify(value);
    },
  });

  const debouncedSetFilters = useDebouncedCallback(setFilters, debounceMs);

  const { searchableColumns, filterableColumns } = React.useMemo(
    () => ({
      searchableColumns: filterFields.filter(
        (field) => !field.options || field.onChange
      ),
      filterableColumns: filterFields.filter((field) => field.options),
    }),
    [filterFields]
  );

  React.useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
    //eslint-disable-next-line
  }, [filters]);

  return (
    !hidden && (
      <div className={cn("flex flex-col gap-3", className)} {...props}>
        <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <Input
              placeholder="Search..."
              value={searchTerm ?? ""}
              onChange={(event) => onSearchChange?.(event.target.value)}
              className="h-8 w-44"
            />
            {searchableColumns.map(
              (column) =>
                table.getColumn(column.id) && (
                  <Input
                    key={String(column.id)}
                    placeholder={column.placeholder}
                    value={filters[column.id] || ""}
                    onChange={(event) => {
                      const newFilters = {
                        ...filters,
                        [column.id]: event.target.value,
                      };
                      debouncedSetFilters(newFilters);
                    }}
                    style={{ width: column.width || "300px" }}
                    className={cn("h-8")}
                  />
                )
            )}
            {filterableColumns.map((column) => {
              if (!column || !column.id) return null;
              const tableColumn = table.getColumn(column.id);

              if (!tableColumn || !column.options?.length) return null;
              return (
                <DataTableFacetedFilter
                  key={String(column.id)}
                  column={tableColumn}
                  title={column.label || "Unnamed"}
                  value={(column?.id && filters?.[column.id]) || []}
                  options={column.options}
                  singleSelect={column.singleSelect}
                  onSelect={(value) => {
                    const newFilters = { ...filters, [column.id]: value };
                    setFilters(newFilters);
                  }}
                />
              );
            })}

            {isFiltered && (
              <Button
                aria-label="Reset filters"
                variant="ghost"
                className="h-8 px-2 lg:px-3"
                onClick={() => {
                  table.resetColumnFilters();
                  setFilters({});
                  onReset?.();
                }}
              >
                Reset
                <X className="ml-2 size-4" aria-hidden="true" />
              </Button>
            )}
            {!disableSort && !simpleSort && (
              <DataTableSortList
                table={table}
                debounceMs={debounceMs}
                shallow={shallow}
                onSort={onSortChange}
              />
            )}
          </div>
          <div className="flex items-center space-x-2">
            {extraButtons}
            {!disableSort && simpleSort && onSimpleSortChange && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 justify-between"
                  >
                    <ArrowDownUp className="mr-2 size-4" />
                    Sort
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-[200px] p-0">
                  <Command>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => onSimpleSortChange("asc")}
                        className="flex items-center justify-between"
                      >
                        <span>Ascending</span>
                        {table.getState().sorting?.[0]?.desc === false && (
                          <Check className="size-4" />
                        )}
                      </CommandItem>
                      <CommandItem
                        onSelect={() => onSimpleSortChange("desc")}
                        className="flex items-center justify-between"
                      >
                        <span>Descending</span>
                        {table.getState().sorting?.[0]?.desc === true && (
                          <Check className="size-4" />
                        )}
                      </CommandItem>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
            {!disableViewColumns && <DataTableViewOptions table={table} />}
            {children}
          </div>
        </div>
      </div>
    )
  );
}
