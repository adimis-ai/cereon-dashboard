"use client";
import {
  useSearchParams,
  NavigateFunction,
} from "react-router-dom";
import { Button } from "../../button";
import { Plus } from "lucide-react";
import { ResourceLayout, ResourceProps, type BaseListRequest } from "./list";

export interface DataResourcePageProps<
  T extends { [K in TIdentifier]: string | number },
  TIdentifier extends string = "id",
> extends ResourceProps<T, TIdentifier> {
  createButtonLabel?: string;
  createButtonTooltip?: string;
  CreateForm?: React.ComponentType;
  DetailView?: React.ComponentType;
  baseUrl: string;
  navigate: NavigateFunction;
}

export function DataResourcePage<T extends { id: string | number }>({
  columns,
  title,
  description,
  fetchData: onFetchData,
  onRowClick,
  baseUrl,
  defaultPageSize = 10,
  pageSizeOptions = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
  defaultSorting = "desc",
  sortField = "createdOn",
  panel = true,
  createButtonLabel = "Add",
  createButtonTooltip = "Add New Item",
  CreateForm,
  DetailView,
  navigate,
  ...rest
}: DataResourcePageProps<T>) {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");

  const handleFetchData = async (params?: BaseListRequest) => {
    return await onFetchData(params);
  };

  const handleRowClick = async (row: T) => {
    if (onRowClick) {
      await onRowClick(row);
    }
    navigate(`${baseUrl}?mode=detail`);
  };

  if (mode === "create" && CreateForm) {
    return <CreateForm />;
  }

  if (mode === "detail" && DetailView) {
    return <DetailView />;
  }

  return (
    <ResourceLayout<T>
      {...rest}
      panel={panel}
      title={title}
      description={description}
      columns={columns}
      defaultPageSize={defaultPageSize}
      pageSizeOptions={pageSizeOptions}
      fetchData={handleFetchData}
      createButtonLabel={createButtonLabel}
      createButtonTooltip={createButtonTooltip}
      onRowClick={handleRowClick}
      defaultSorting={defaultSorting}
      sortField={sortField}
      createButton={
        <Button
          icon={<Plus className="size-4" />}
          label={createButtonLabel}
          tooltip={createButtonTooltip}
          size="sm"
          onClick={() => navigate(`${baseUrl}?mode=create`)}
        />
      }
    />
  );
}
