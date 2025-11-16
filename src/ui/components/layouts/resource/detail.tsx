import React from "react";
import { cn } from "../../../lib/utils";
import { NotFound } from "../../not-found";
import { PermissionDenied } from "../../permission-denied";
import { LoadingPage } from "../../pages/loading-page";
import { toast } from "../../sonner";

type BaseLayoutProps<TData> = {
  data: TData | null;
  isLoading?: boolean;
  error?: Error | null;
  className?: string;
  layout?: "default" | "split" | "full-width";
  renderContent: (params: ResourceRenderParams<TData>) => React.ReactNode;
};

type ViewActions<TData> = {
  delete?: {
    disabled?: boolean;
    permissionDenied?: boolean;
    action: (pk: string | number) => Promise<void>;
  };
  update?: {
    disabled?: boolean;
    permissionDenied?: boolean;
    action: (
      pk: string | number,
      data: Partial<TData>
    ) => Promise<TData | null>;
  };
  retrieve?: {
    disabled?: boolean;
    permissionDenied?: boolean;
    action: (pk: string | number) => Promise<TData | null>;
  };
};

type CreateActions<TData> = {
  create: {
    disabled?: boolean;
    permissionDenied?: boolean;
    action: (data: TData) => Promise<TData | void>;
  };
};

type ResourceRenderParams<TData> = {
  data: TData | null;
  isLoading?: boolean;
  mode: "view" | "create";
  actions: ViewActions<TData> | CreateActions<TData>;
};

type ViewModeProps<TData> = BaseLayoutProps<TData> & {
  mode: "view";
  actions: ViewActions<TData>;
};

type CreateModeProps<TData> = BaseLayoutProps<TData> & {
  mode: "create";
  actions: CreateActions<TData>;
};

export type ResourceDetailLayoutProps<TData extends Record<string, any>> =
  | ViewModeProps<TData>
  | CreateModeProps<TData>;

export function ResourceDetailLayout<TData extends Record<string, any>>({
  data,
  isLoading = false,
  error = null,
  mode,
  actions,
  renderContent,
  className,
  layout = "default",
}: ResourceDetailLayoutProps<TData>) {
  const renderParams: ResourceRenderParams<TData> = {
    data,
    actions,
    isLoading,
    mode,
  };

  // Wrap actions to handle permission denied cases
  if (mode === "view" && "update" in actions && actions.update) {
    const originalUpdateAction = actions.update.action;
    actions.update.action = async (
      pk: string | number,
      data: Partial<TData>
    ) => {
      if (actions.update?.permissionDenied) {
        toast.error("Permission Denied", {
          description: "You don't have permission to update this resource.",
        });
        return null;
      }
      return originalUpdateAction(pk, data);
    };
  }

  if (mode === "view" && "delete" in actions && actions.delete) {
    const originalDeleteAction = actions.delete.action;
    actions.delete.action = async (pk: string | number) => {
      if (actions.delete?.permissionDenied) {
        toast.error("Permission Denied", {
          description: "You don't have permission to delete this resource.",
        });
        return;
      }
      return originalDeleteAction(pk);
    };
  }

  // Handle loading state
  if (isLoading) {
    return <LoadingPage message="Loading resource..." />;
  }

  // Handle error state
  if (error) {
    return (
      <NotFound
        title="Error"
        subtitle={error.name}
        description={error.message}
        buttonText="Go Back"
      />
    );
  }

  // Handle permission denied for create mode
  if (
    mode === "create" &&
    "create" in actions &&
    actions.create.permissionDenied
  ) {
    return (
      <PermissionDenied
        heading="Create Permission Denied"
        message="You don't have permission to create this resource."
      />
    );
  }

  // Handle permission denied for view mode retrieve action
  if (
    mode === "view" &&
    "retrieve" in actions &&
    actions.retrieve?.permissionDenied
  ) {
    return (
      <PermissionDenied
        heading="View Permission Denied"
        message="You don't have permission to view this resource."
      />
    );
  }

  // Handle null data in view mode (not found)
  if (mode === "view" && data === null && !isLoading) {
    return (
      <NotFound
        title="404"
        subtitle="Resource Not Found"
        description="The requested resource could not be found."
        buttonText="Go Back"
      />
    );
  }

  return (
    <div
      className={cn(
        "container mx-auto p-4 bg-background",
        layout === "full-width" ? "max-w-none" : "max-w-7xl",
        className
      )}
    >
      <main className="space-y-6">{renderContent(renderParams)}</main>
    </div>
  );
}
