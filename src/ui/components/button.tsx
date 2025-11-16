import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader, ChevronDown } from "lucide-react";

import { cn } from "../lib/index";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./dropdown-menu";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground",
        destructive:
          "bg-background border border-border text-destructive hover:bg-background/40",
        outline:
          "border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground",
        accent:
          "bg-accent text-accent-foreground hover:bg-secondary hover:text-secondary-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        circle: "rounded-full h-10 w-10 p-2",
        bigCircle: "rounded-full h-12 w-12 p-3",
        smallCircle: "rounded-full h-8 w-8 p-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends Omit<
      React.ButtonHTMLAttributes<HTMLButtonElement | HTMLDivElement>,
      "ref"
    >,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  tooltip?: string;
  icon?: React.ReactNode;
  label?: string;
  options?: Array<{
    label: string | React.ReactNode;
    value: string | number;
  }>;
  position?: {
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
  };
  onClick?: (
    e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>,
    value?: string | number
  ) => void;
}

const Button = React.forwardRef<
  HTMLButtonElement | HTMLDivElement,
  ButtonProps
>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      tooltip,
      icon,
      label,
      children,
      options,
      position,
      onClick,
      role,
      ...props
    },
    ref
  ) => {
    // Use div instead of button when it's being used as a drag handle
    const Comp = asChild ? Slot : role === "button" ? "div" : "button";
    const [internalLoading, setInternalLoading] = React.useState(loading);

    const handleItemClick =
      (value: string | number) => (e: React.MouseEvent) => {
        e.preventDefault();
        try {
          setInternalLoading(true);
          onClick?.(
            e as React.MouseEvent<HTMLButtonElement | HTMLDivElement>,
            value
          );
        } finally {
          setInternalLoading(false);
        }
      };

    const renderButton = (withDropdown = false) => (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          (loading || internalLoading) && "cursor-wait",
          options && !withDropdown && "pr-3"
        )}
        ref={ref as any}
        disabled={loading || internalLoading || props.disabled}
        onClick={
          options
            ? undefined
            : (e) =>
                onClick?.(
                  e as React.MouseEvent<HTMLButtonElement | HTMLDivElement>
                )
        }
        role={role}
        {...props}
      >
        {loading || internalLoading ? (
          <Loader className="animate-spin h-5 w-5" />
        ) : (
          <>
            {icon && <span className={cn(label && "mr-2")}>{icon}</span>}
            {label ? <span>{label}</span> : children}
            {options && !withDropdown && (
              <ChevronDown className="ml-2 h-4 w-4" />
            )}
          </>
        )}
      </Comp>
    );

    const buttonWithDropdown =
      options && !(loading || internalLoading) ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {renderButton(true)}
          </DropdownMenuTrigger>
          <DropdownMenuContent position={position}>
            {options.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={handleItemClick(option.value)}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        renderButton()
      );

    if (tooltip) {
      const triggerElement =
        loading || internalLoading || props.disabled ? (
          <div className="inline-block">{buttonWithDropdown}</div>
        ) : (
          buttonWithDropdown
        );

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{triggerElement}</TooltipTrigger>
            <TooltipContent>{tooltip}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return buttonWithDropdown;
  }
);

Button.displayName = "Button";

//eslint-disable-next-line
export { Button, buttonVariants };
