"use client";

import * as React from "react";
import { type Row } from "@tanstack/react-table";
import { Loader, Trash } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../shadcn-drawer";
import { Checkbox } from "../checkbox";
import { useMediaQuery } from "../../hooks/index";

interface DeleteRowsDialogProps<
  TData extends { id: string | number; [key: string]: any },
> extends React.ComponentPropsWithoutRef<typeof Dialog> {
  rowData: Row<TData>["original"][];
  showTrigger?: boolean;
  onlySoftDelete?: boolean;
  onDelete?: (
    softDelete: boolean,
    ids: Array<string | number>
  ) => void | Promise<void>;
  disableSoftDelete?: boolean;
}

export function DeleteRowsDialog<
  TData extends { id: string | number; [key: string]: any },
>({
  rowData,
  showTrigger = true,
  onDelete,
  disableSoftDelete = false,
  ...props
}: DeleteRowsDialogProps<TData>) {
  const [isDeletePending, setIsDeletePending] = React.useState(false);
  const [isSoftDelete, setIsSoftDelete] = React.useState(!disableSoftDelete);
  const isDesktop = useMediaQuery("(min-width: 640px)");

  async function handleDelete() {
    setIsDeletePending(true);
    if (onDelete) {
      const ids = rowData.map((row) => row.id);
      try {
        await onDelete?.(isSoftDelete, ids);
        toast.success("Operation successful!");
      } catch (error: any) {
        console.error("Error deleting rows:", error);
        toast.error("Failed to process the request.");
      } finally {
        setIsDeletePending(false);
      }
    }
  }

  if (isDesktop) {
    return (
      <Dialog {...props}>
        {showTrigger && (
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Trash className="mr-2 size-4" aria-hidden="true" />
              Delete ({rowData.length})
            </Button>
          </DialogTrigger>
        )}
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="mb-4">Are you sure?</DialogTitle>
            <DialogDescription>
              {disableSoftDelete ? (
                <>
                  This action will{" "}
                  <span className="font-medium">permanently delete</span>{" "}
                  <span className="font-medium">{rowData.length}</span>
                  {rowData.length === 1 ? " row" : " rows"}. This action cannot
                  be undone.
                </>
              ) : (
                <>
                  Instead of permanently deleting, this action will temporarily
                  deactivate{" "}
                  <span className="font-medium">{rowData.length}</span>
                  {rowData.length === 1 ? " row" : " rows"}. This action can be
                  undone later.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {!disableSoftDelete && (
            <div className="flex items-center gap-2 mt-4">
              <Checkbox
                id="softDelete"
                checked={isSoftDelete}
                onChange={() => setIsSoftDelete(!isSoftDelete)}
              />
              <label htmlFor="softDelete" className="text-sm">
                Temporarily deactivate instead of deleting
              </label>
            </div>
          )}
          <DialogFooter className="gap-2 sm:space-x-0">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              aria-label={
                isSoftDelete
                  ? "Deactivate selected rows"
                  : "Delete selected rows"
              }
              variant={isSoftDelete ? "secondary" : "destructive"}
              onClick={handleDelete}
              disabled={isDeletePending}
            >
              {isDeletePending && (
                <Loader
                  className="mr-2 size-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              {isSoftDelete ? "Deactivate" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer {...props}>
      {showTrigger && (
        <DrawerTrigger asChild>
          <Button variant="outline" size="sm">
            <Trash className="mr-2 size-4" aria-hidden="true" />
            Delete ({rowData.length})
          </Button>
        </DrawerTrigger>
      )}
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="mb-2">Are you sure?</DrawerTitle>
          <DrawerDescription>
            {disableSoftDelete ? (
              <>
                This action will{" "}
                <span className="font-medium">permanently delete</span>{" "}
                <span className="font-medium">{rowData.length}</span>
                {rowData.length === 1 ? " row" : " rows"}. This action cannot be
                undone.
              </>
            ) : (
              <>
                Instead of permanently deleting, this action will temporarily
                deactivate <span className="font-medium">{rowData.length}</span>
                {rowData.length === 1 ? " row" : " rows"}. This action can be
                undone later.
              </>
            )}
          </DrawerDescription>
        </DrawerHeader>
        {!disableSoftDelete && (
          <div className="flex items-center gap-2 mt-4">
            <Checkbox
              id="softDelete"
              checked={isSoftDelete}
              onChange={() => setIsSoftDelete(!isSoftDelete)}
            />
            <label htmlFor="softDelete" className="text-sm">
              Temporarily deactivate instead of deleting
            </label>
          </div>
        )}
        <DrawerFooter className="gap-2 sm:space-x-0">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
          <Button
            aria-label={
              isSoftDelete ? "Deactivate selected rows" : "Delete selected rows"
            }
            variant={isSoftDelete ? "secondary" : "destructive"}
            onClick={handleDelete}
            disabled={isDeletePending}
          >
            {isDeletePending && (
              <Loader className="mr-2 size-4 animate-spin" aria-hidden="true" />
            )}
            {isSoftDelete ? "Deactivate" : "Delete"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
