"use client";

import { useState, useEffect } from "react";
import { Button } from "./button";
import { X } from "lucide-react";
import { cn } from "../lib/index";

export interface DrawerProps {
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
  height?: string;
  footer?: React.ReactNode | ((props: { isOpen: boolean; toggleDrawer: () => void }) => React.ReactNode);
}

export function DrawerComponent({
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
  footer,
}: DrawerProps) {
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
          {footer ? (
            typeof footer === 'function' ? 
              footer({ isOpen, toggleDrawer }) : 
              footer
          ) : (
            !disableSave && (
              <div className="border-t border-border p-4">
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={toggleDrawer}>
                    Cancel
                  </Button>
                  <Button
                    onClick={async (e) => {
                      e.preventDefault();
                      await handleSave();
                    }}
                    loading={loading}
                    tooltip="Save current changes"
                  >
                    Save changes
                  </Button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
