"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./button";
import { cn } from "../lib/index";

function Drawer({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  );
}

function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          "group/drawer-content bg-background fixed z-50 flex h-auto flex-col",
          "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b",
          "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t",
          "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm",
          "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm",
          className
        )}
        {...props}
      >
        <div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

interface DynamicDrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  trigger?: {
    label?: string;
    icon?: React.ReactNode;
    size?:
      | "default"
      | "sm"
      | "lg"
      | "icon"
      | "bigCircle"
      | "smallCircle"
      | null
      | undefined;
    variant?:
      | "link"
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | null
      | undefined;
    className?: string;
    triggerChildren?: React.ReactNode;
    tooltip?: string;
  } | null;
  width?: string;
  header?: React.ReactNode;
  onSave?: () => void | Promise<void>;
  disableSave?: boolean;
  className?: string;
  submitButton?: {
    text?: string;
    icon?: React.ReactNode;
    size?:
      | "default"
      | "sm"
      | "lg"
      | "icon"
      | "bigCircle"
      | "smallCircle"
      | null
      | undefined;
    variant?:
      | "link"
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | null
      | undefined;
    className?: string;
  };
}

function DynamicDrawer({
  open = false,
  onOpenChange,
  title,
  description,
  children,
  trigger,
  width = "max-w-md",
  header,
  onSave,
  disableSave = false,
  className,
  submitButton,
}: DynamicDrawerProps) {
  const [isOpen, setIsOpen] = useState(open);
  const [loading, setLoading] = useState(false);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
    if (onOpenChange) onOpenChange(!isOpen);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave?.();
      toggleDrawer();
    } catch (error) {
      console.error("[Drawer] Error saving data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        if (onOpenChange) onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onOpenChange]);

  return (
    <div className="bg-card text-card-foreground">
      {trigger && (
        <Button
          variant={trigger.variant || "outline"}
          size={trigger.size || "default"}
          onClick={toggleDrawer}
          className={trigger.className}
        >
          {trigger.icon && trigger.icon}
          {trigger.label || trigger.triggerChildren}
        </Button>
      )}

      <div
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleDrawer}
        aria-hidden="true"
      />

      <div
        className={`fixed inset-y-0 right-0 z-50 w-full ${width} border-l transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col overflow-y-scroll bg-card text-card-foreground shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <h2 className="text-lg font-semibold">{title}</h2>
            <div className="flex items-center">
              {header}
              <Button variant="ghost" size="icon" onClick={toggleDrawer}>
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>
          <div className={cn("flex-1 overflow-y-auto p-4", className)}>
            {description && (
              <p className="mb-4 text-sm text-muted-foreground">
                {description}
              </p>
            )}
            {children}
          </div>
          {!disableSave && (
            <div className="border-t border-border p-4">
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={toggleDrawer}>
                  Cancel
                </Button>
                <Button
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    await handleSave();
                  }}
                  loading={loading}
                  tooltip="Save current changes"
                  variant={submitButton?.variant || "default"}
                  size={submitButton?.size || "default"}
                  icon={submitButton?.icon}
                  label={submitButton?.text}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DynamicDrawer,
  type DynamicDrawerProps,
};
