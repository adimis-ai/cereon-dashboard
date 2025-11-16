"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
  Row,
} from "@tanstack/react-table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../card";
import { Plus } from "lucide-react";

import { Button } from "../../button";
import { cn } from "../../../lib/index";
import { DataTable } from "../../data-table/data-table";
import { DataTableToolbar } from "../../data-table/data-table-toolbar";

export interface BaseListRequest {
  limit?: number;
  offset?: number;
  search?: string;
  [key: string]: any;
}

export interface BasePaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ResourceTableState<T> {
  count: number;
  loading: boolean;
  search?: string;
  sorting: "asc" | "desc";
  data: T[];
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
}

export interface ResourceProps<
  T extends { [K in TIdentifier]: string | number },
  TIdentifier extends string = "id",
> {
  title?: string;
  description?: string;
  columns: ColumnDef<T, any>[];
  fetchData: (
    params?: BaseListRequest | undefined
  ) => Promise<BasePaginatedResponse<T> | undefined>;
  createComponent?: React.ComponentType<{
    open: boolean;
    onOpenChange: (val: boolean) => void;
    onSubmit: () => Promise<void>;
  }>;
  createButton?: React.ReactNode;
  onRowClick?: (row: T) => void | Promise<void>;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  defaultSorting?: "asc" | "desc";
  sortField?: string;
  panel?: boolean;
  createButtonLabel?: string;
  createButtonTooltip?: string;
  disableSorting?: boolean;
  /** The field name used as the unique identifier (id, pk, or slug) */
  identifierField?: TIdentifier;
  className?: string;
  additonalHeader?: React.ReactNode;
  renderRowCheckbox?: boolean;
  extraButtons?: React.ReactNode;
  preview?: boolean;
  onRowCheckboxChange?: (selectedRows: T[]) => void | Promise<void>;
  /** Data to use instead of fetching from server */
  data?: T[];
  /** Custom renderer for table rows */
  renderRow?: (row: Row<T>) => React.ReactNode;
  currentView?: "table" | "card";
  disableTableView?: boolean;
  cardColumns?: {
    "2xl": number;
    xl: number;
    lg: number;
    md: number;
    sm: number;
    xs: number;
  };
  renderCard?: (
    item: T,
    selected: boolean,
    onToggleSelect: () => void
  ) => React.ReactNode;
  /** Custom renderer for table body */
  renderBody?: (props: { children: React.ReactNode }) => React.ReactNode;
}

export interface ResourceListParams extends BaseListRequest {
  ordering?: string;
}

export function ResourceLayout<
  T extends { [K in TIdentifier]: string | number },
  TIdentifier extends string = "id",
>({
  title,
  description,
  columns,
  fetchData,
  createComponent: CreateComponent,
  createButtonLabel,
  onRowClick,
  defaultPageSize = 10,
  pageSizeOptions = [10, 20, 30, 40, 50],
  defaultSorting = "desc",
  sortField = "created_at",
  panel = true,
  preview = false,
  createButtonTooltip,
  disableSorting = false,
  className,
  data,
  renderRow,
  renderBody,
  additonalHeader,
  createButton,
  renderRowCheckbox = false,
  onRowCheckboxChange,
  extraButtons,
  renderCard,
  currentView = "table",
  disableTableView,
  cardColumns = {
    "2xl": 4,
    xl: 3,
    lg: 2,
    md: 2,
    sm: 1,
    xs: 1,
  },
}: ResourceProps<T, TIdentifier>) {
  const [mounted, setMounted] = useState(false);
  const [tableState, setTableState] = useState<ResourceTableState<T>>({
    count: 0,
    loading: false,
    search: undefined,
    sorting: defaultSorting,
    data: [],
    pagination: {
      pageIndex: 0,
      pageSize: defaultPageSize,
    },
  });

  const [modalOpen, setModalOpen] = useState(false);

  const handleFetchData = useCallback(
    async (params?: {
      limit?: number;
      offset?: number;
      search?: string;
      sort?: "asc" | "desc";
    }) => {
      setTableState((prev) => ({ ...prev, loading: true }));
      try {
        const response = await fetchData({
          limit: params?.limit || tableState.pagination.pageSize,
          offset:
            params?.offset !== undefined
              ? params.offset
              : tableState.pagination.pageIndex *
                tableState.pagination.pageSize,
          search: params?.search,
          ordering: params?.sort === "desc" ? `-${sortField}` : sortField,
        });

        if (!response) {
          setTableState((prev) => ({ ...prev, loading: false }));
          return;
        }

        const limit = params?.limit || tableState.pagination.pageSize;
        const offset =
          params?.offset !== undefined
            ? params.offset
            : tableState.pagination.pageIndex * limit;
        const pageIndex = Math.floor(offset / limit);

        setTableState((prev) => ({
          ...prev,
          data: response.results,
          count: response.count,
          pagination: {
            ...prev.pagination,
            pageIndex,
            pageSize: limit,
          },
          search: params?.search || prev.search,
          sorting: params?.sort || prev.sorting,
          loading: false,
        }));
      } catch (error) {
        setTableState((prev) => ({ ...prev, loading: false }));
      }
    },
    [
      fetchData,
      sortField,
      tableState.pagination.pageSize,
      tableState.pagination.pageIndex,
    ]
  );

  const handleSearchChange = useCallback(
    (search: string) => {
      setTableState((prev) => ({ ...prev, search }));
      handleFetchData({
        search,
        sort: tableState.sorting,
        limit: tableState.pagination.pageSize,
        offset: 0,
      });
    },
    [handleFetchData, tableState.sorting, tableState.pagination.pageSize]
  );

  const handleSortChange = useCallback(
    (sorting: "asc" | "desc") => {
      setTableState((prev) => ({ ...prev, sorting }));
      handleFetchData({
        search: tableState.search,
        sort: sorting,
        limit: tableState.pagination.pageSize,
        offset:
          tableState.pagination.pageIndex * tableState.pagination.pageSize,
      });
    },
    [handleFetchData, tableState]
  );

  const table = useReactTable({
    data: tableState.data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(tableState.count / tableState.pagination.pageSize),
    state: {
      pagination: tableState.pagination,
      sorting: [
        {
          id: sortField,
          desc: tableState.sorting === "desc",
        },
      ],
    },
    onPaginationChange: async (updater) => {
      let newPagination;
      if (typeof updater === "function") {
        newPagination = updater(tableState.pagination);
      } else {
        newPagination = updater;
      }

      setTableState((prev) => ({
        ...prev,
        pagination: newPagination,
      }));

      await handleFetchData({
        search: tableState.search,
        sort: tableState.sorting,
        limit: newPagination.pageSize,
        offset: newPagination.pageIndex * newPagination.pageSize,
      });
    },
  });

  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      handleFetchData({
        limit: defaultPageSize,
        offset: 0,
        sort: defaultSorting,
      });
    }
  }, [mounted, handleFetchData, defaultPageSize, defaultSorting]);

  if (!panel) {
    return (
      <div className={className}>
        {additonalHeader}
        <DataTable<T, TIdentifier>
          table={table}
          cardColumns={cardColumns}
          renderCard={renderCard}
          disableTableView={disableTableView}
          currentView={currentView}
          count={tableState.count}
          loading={tableState.loading}
          pageSizeOptions={pageSizeOptions}
          onRowClick={onRowClick}
          data={data}
          renderRow={renderRow}
          renderBody={renderBody}
          renderRowCheckbox={renderRowCheckbox}
          onRowCheckboxChange={onRowCheckboxChange}
          preview={preview}
        >
          <DataTableToolbar
            table={table}
            simpleSort
            onSearchChange={handleSearchChange}
            onSimpleSortChange={handleSortChange}
            disableSort={disableSorting || preview}
            disableViewColumns={disableTableView || preview}
            hidden={preview}
          >
            {CreateComponent ? (
              <CreateComponent
                open={modalOpen}
                onOpenChange={setModalOpen}
                onSubmit={async () => {
                  await handleFetchData({
                    limit: tableState.pagination.pageSize,
                    offset:
                      tableState.pagination.pageIndex *
                      tableState.pagination.pageSize,
                    sort: tableState.sorting,
                    search: tableState.search,
                  });
                }}
              />
            ) : null}
          </DataTableToolbar>
        </DataTable>
      </div>
    );
  }

  return (
    <Card className={cn("border-none shadow-none bg-background", className)}>
      {(title || description || CreateComponent || createButton) && (
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="max-w-3xl">
            {title && <CardTitle>{title}</CardTitle>}
            {description && (
              <CardDescription className="mt-0.5">
                {description}
              </CardDescription>
            )}
          </div>
          {additonalHeader}
        </CardHeader>
      )}
      <CardContent>
        <DataTable<T, TIdentifier>
          table={table}
          count={tableState.count}
          cardColumns={cardColumns}
          renderCard={renderCard}
          disableTableView={disableTableView}
          currentView={currentView}
          loading={tableState.loading}
          pageSizeOptions={pageSizeOptions}
          onRowClick={onRowClick}
          data={data}
          renderRow={renderRow}
          renderBody={renderBody}
          preview={preview}
          renderRowCheckbox={renderRowCheckbox}
          onRowCheckboxChange={onRowCheckboxChange}
        >
          <DataTableToolbar
            table={table}
            simpleSort
            onSearchChange={handleSearchChange}
            onSimpleSortChange={handleSortChange}
            disableSort={disableSorting}
            extraButtons={extraButtons}
            CreateComponent={CreateComponent}
          >
            {CreateComponent ? (
              <Button
                icon={<Plus className="size-4" />}
                label={createButtonLabel || `Add New ${title}`}
                tooltip={createButtonTooltip || `Add ${title}`}
                size="sm"
                variant="secondary"
                onClick={() => setModalOpen(true)}
              />
            ) : undefined}
            {createButton}
          </DataTableToolbar>
        </DataTable>
      </CardContent>
      {CreateComponent && (
        <CreateComponent
          open={modalOpen}
          onOpenChange={setModalOpen}
          onSubmit={async () => {
            await handleFetchData({
              limit: tableState.pagination.pageSize,
              offset:
                tableState.pagination.pageIndex *
                tableState.pagination.pageSize,
              sort: tableState.sorting,
              search: tableState.search,
            });
          }}
        />
      )}
    </Card>
  );
}
