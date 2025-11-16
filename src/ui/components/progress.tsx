"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "../lib/index"

interface ProgressProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  status?: string;
}

function Progress({
  className,
  value,
  status,
  ...props
}: ProgressProps) {
  // Map status to color class
  const statusColor = status
    ? {
        success: "bg-success",
        destructive: "bg-destructive",
        warning: "bg-warning",
        outline: "bg-muted",
        pending: "bg-muted",
        secondary: "bg-primary",
      }[status] || "bg-primary"
    : "bg-primary";
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(statusColor, "h-full w-full flex-1 transition-all")}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress }
