import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { cn } from "../lib/index";

export interface UserAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  logoUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

export const UserAvatar = React.forwardRef<HTMLDivElement, UserAvatarProps>(
  (
    {
      firstName,
      lastName,
      fullName,
      logoUrl,
      size = "sm",
      className,
      ...props
    },
    ref
  ) => {
    const name = fullName || `${firstName || ""} ${lastName || ""}`.trim();
    const initials = React.useMemo(() => {
      if (!name) return "";
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }, [name]);

    const avatar = (
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {logoUrl && (
          <AvatarPrimitive.Image
            src={logoUrl}
            alt={name}
            className="aspect-square h-full w-full object-cover"
          />
        )}
        <AvatarPrimitive.Fallback
          className={cn(
            "flex h-full w-full items-center justify-center rounded-full bg-primary text-primary-foreground",
            size === "sm" && "text-xs",
            size === "md" && "text-sm",
            size === "lg" && "text-base"
          )}
        >
          {initials}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
    );

    if (!name) {
      return avatar;
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{avatar}</TooltipTrigger>
          <TooltipContent>
            <p>{name}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
);

UserAvatar.displayName = "UserAvatar";
