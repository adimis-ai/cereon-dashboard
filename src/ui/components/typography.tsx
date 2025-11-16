import React from "react";
import { cn } from "../lib/utils";

type TypographyProps = {
  variant:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "p"
    | "blockquote"
    | "table"
    | "list"
    | "inlineCode"
    | "lead"
    | "large"
    | "small"
    | "muted";
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export const Typography: React.FC<TypographyProps> = ({
  variant,
  children,
  className,
  style,
}) => {
  switch (variant) {
    case "h1":
      return (
        <h1
          className={cn(
            "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
            className
          )}
          style={style}
        >
          {children}
        </h1>
      );
    case "h2":
      return (
        <h2
          className={cn(
            "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
            className
          )}
          style={style}
        >
          {children}
        </h2>
      );
    case "h3":
      return (
        <h3
          className={cn(
            "scroll-m-20 text-2xl font-semibold tracking-tight",
            className
          )}
          style={style}
        >
          {children}
        </h3>
      );
    case "h4":
      return (
        <h4
          className={cn(
            "scroll-m-20 text-xl font-semibold tracking-tight",
            className
          )}
          style={style}
        >
          {children}
        </h4>
      );
    case "h5":
      return (
        <h5
          className={cn(
            "scroll-m-20 text-lg font-semibold tracking-tight",
            className
          )}
          style={style}
        >
          {children}
        </h5>
      );
    case "h6":
      return (
        <h6
          className={cn(
            "scroll-m-20 text-base font-semibold tracking-tight",
            className
          )}
          style={style}
        >
          {children}
        </h6>
      );
    case "p":
      return (
        <p
          className={cn("leading-7 [&:not(:first-child)]:mt-4", className)}
          style={style}
        >
          {children}
        </p>
      );
    case "blockquote":
      return (
        <blockquote
          className={cn("mt-6 border-l-2 pl-6 italic", className)}
          style={style}
        >
          {children}
        </blockquote>
      );
    case "list":
      return (
        <ul
          className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)}
          style={style}
        >
          {children}
        </ul>
      );
    case "inlineCode":
      return (
        <code
          className={cn(
            "relative rounded bg-accent px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
            className
          )}
          style={style}
        >
          {children}
        </code>
      );
    case "lead":
      return (
        <p
          className={cn("text-xl text-muted-foreground", className)}
          style={style}
        >
          {children}
        </p>
      );
    case "large":
      return (
        <div className={cn("text-lg font-semibold", className)} style={style}>
          {children}
        </div>
      );
    case "small":
      return (
        <small
          className={cn("text-sm font-medium leading-none", className)}
          style={style}
        >
          {children}
        </small>
      );
    case "muted":
      return (
        <p
          className={cn("text-sm text-muted-foreground", className)}
          style={style}
        >
          {children}
        </p>
      );
    default:
      return <p className={className}>{children}</p>;
  }
};
