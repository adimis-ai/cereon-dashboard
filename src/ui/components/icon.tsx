import React, { FC } from "react";
import * as Icons from "lucide-react";
import { Avatar, AvatarFallback } from "./avatar";
import { cn } from "../lib";

export const LucideReactIcon: FC<{ name: string; className?: string }> = ({
  name,
  className,
}) => {
  return (Icons as any)[name] ? (
    React.createElement((Icons as any)[name], {
      className: cn("size-4 text-muted-foreground", className),
    })
  ) : (
    <Avatar className={cn("size-4", className)}>
      <AvatarFallback>{name.charAt(0)}</AvatarFallback>
    </Avatar>
  );
};
