"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../lib/index";
import { Button, ButtonProps } from "./button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { cva } from "class-variance-authority";

export interface ProgressButtonProps extends ButtonProps {
  status?: "pending" | "in_progress" | "completed" | "failed" | "canceled";
  progress?: number;
  progressExplanation?: string;
  onTaskCancel?: () => Promise<void>;
}

const progressRingVariants = cva(
  "absolute inset-0 rounded-md transition-all duration-300",
  {
    variants: {
      status: {
        pending: "border-2 border-dashed border-primary/30",
        in_progress: "border-2 border-primary/50",
        completed: "border-2 border-primary",
        failed: "border-2 border-destructive",
        canceled: "border-2 border-muted",
      },
    },
    defaultVariants: {
      status: "pending",
    },
  }
);

export const ProgressButton = React.forwardRef<
  HTMLButtonElement,
  ProgressButtonProps
>(
  (
    {
      className,
      variant = "default",
      size = "default",
      status = "pending",
      progress = 0,
      progressExplanation,
      icon,
      label,
      onTaskCancel,
      onClick,
      ...props
    },
    ref
  ) => {
    const [isLoading, setIsLoading] = React.useState(false);
    const isCancelable = onTaskCancel && status === "in_progress";

    // Calculate progress ring gradient
    const gradientStyle = React.useMemo(() => {
      if (!progress || status !== "in_progress") return {};

      const angle = (progress * 360) / 100;
      return {
        background: `conic-gradient(from 0deg, hsl(var(--primary)) ${angle}deg, transparent ${angle}deg)`,
      };
    }, [progress, status]);

    const handleClick = async (
      e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>
    ) => {
      if (isCancelable) {
        setIsLoading(true);
        try {
          await onTaskCancel();
        } finally {
          setIsLoading(false);
        }
      } else if (onClick) {
        onClick(e);
      }
    };

    const buttonContent = (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          status === "in_progress" && "animate-pulse",
          className
        )}
        onClick={async (e) => {
          e.stopPropagation();
          await handleClick(e);
        }}
        icon={isCancelable ? <X className="h-4 w-4" /> : icon}
        label={isCancelable ? "Cancel" : label}
        loading={isLoading}
        {...props}
      >
        <div
          className={progressRingVariants({ status })}
          style={gradientStyle}
        />
      </Button>
    );

    if (progressExplanation) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
            <TooltipContent>
              <div className="flex flex-col gap-1">
                {status === "in_progress" && (
                  <div className="text-xs font-medium">
                    {progress}% Complete
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  {progressExplanation}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return buttonContent;
  }
);

ProgressButton.displayName = "ProgressButton";
