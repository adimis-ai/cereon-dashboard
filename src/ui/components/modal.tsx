import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./dialog";
import { Button } from "./button";
import { cn } from "../lib/index";
import { Separator } from "./separator";

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
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
  maxWidth?: string;
  header?: React.ReactNode;
  onSave?: () => Promise<boolean | void> | void;
  disableSave?: boolean;
  submitButton?: {
    text?: string;
    icon?: React.ReactNode;
    variant?: string;
    size?: "default" | "sm" | "lg" | "icon" | "bigCircle" | "smallCircle";
  };
  hideCancelButton?: boolean;
  hideSave?: boolean;
  footer?:
    | React.ReactNode
    | ((props: {
        isOpen: boolean;
        toggleModal: () => void;
      }) => React.ReactNode);
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  trigger,
  header,
  width = "min-w-sm",
  maxWidth = "max-w-lg",
  onSave,
  disableSave = false,
  submitButton,
  hideCancelButton = false,
  hideSave = false,
  footer,
}) => {
  const [loading, setLoading] = React.useState(false);

  const handleSave = async () => {
    if (!onSave) {
      onOpenChange?.(false);
      return;
    }

    setLoading(true);
    try {
      const result = await onSave();
      // Close the modal if the save was successful or if no specific result was returned
      if (result !== false) {
        onOpenChange?.(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleModal = () => {
    // Only allow closing the modal if it's not in a loading state
    if (!loading) {
      onOpenChange?.(!open);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger?.triggerChildren ? (
            trigger.triggerChildren
          ) : (
            <Button
              variant={trigger?.variant || undefined}
              size={trigger?.size || "sm"}
              tooltip={trigger.tooltip}
              className={cn(trigger?.className, "font-extrabold text-md")}
            >
              {trigger?.icon} {trigger?.label}
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent
        className={cn(
          "bg-card text-card-foreground px-0 border-none",
          width,
          maxWidth
        )}
      >
        <DialogHeader className="w-full">
          <div className="w-full flex gap-2 items-center justify-start px-6">
            {header && <div className="mt-1">{header}</div>}
            <div>
              <DialogTitle className="text-card-foreground text-2xl">
                {title}
              </DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="px-6 overflow-auto">{children}</div>
        {footer
          ? typeof footer === "function"
            ? footer({ isOpen: open, toggleModal })
            : footer
          : !disableSave && (
              <DialogFooter>
                <div className="flex justify-end space-x-2 px-6">
                  {!hideCancelButton && (
                    <Button
                      variant="outline"
                      onClick={() => onOpenChange?.(false)}
                      size="sm"
                    >
                      Cancel
                    </Button>
                  )}
                  {!hideSave && (
                    <Button
                      onClick={handleSave}
                      loading={loading}
                      tooltip="Save current changes"
                      variant={submitButton?.variant as any}
                      icon={submitButton?.icon}
                      label={submitButton?.text || "Save"}
                      size={submitButton?.size || "sm"}
                    />
                  )}
                </div>
              </DialogFooter>
            )}
      </DialogContent>
    </Dialog>
  );
};
