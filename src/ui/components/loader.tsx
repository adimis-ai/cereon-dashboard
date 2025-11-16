import { cn } from "../lib/index";

interface LoaderProps {
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "default" | "simple";
  className?: string;
}

export function Loader({
  size = "md",
  variant = "default",
  className,
}: LoaderProps) {
  const sizeClasses = {
    xs: "h-8 w-8",
    sm: "h-12 w-12",
    md: "h-16 w-16",
    lg: "h-20 w-20",
  };

  if (variant === "simple") {
    return (
      <div className={cn("relative", sizeClasses[size], className)}>
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-xl" />
      <div className="relative h-full w-full">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <div className="absolute inset-0 animate-ping rounded-full border-2 border-primary/30 delay-150" />
        <div className="absolute inset-2 animate-spin rounded-full border-4 border-primary/40 border-b-transparent delay-300" />
      </div>
    </div>
  );
}
