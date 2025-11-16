import { cn } from "../../lib/index";
import { Loader } from "../loader";

interface LoadingPageProps {
  height?: string;
  width?: string;
  className?: string;
  message?: string;
  loaderSize?: "sm" | "md" | "lg";
  loaderVariant?: "default" | "simple";
  children?: React.ReactNode;
}

export function LoadingPage({
  height = "h-[calc(100vh-12vh)]",
  width = "max-w-screen",
  className,
  message = "Just a moment",
  loaderSize = "md",
  loaderVariant = "default",
  children,
}: LoadingPageProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-lg",
        // "bg-gradient-to-br from-background via-background/90 to-background/80 backdrop-blur-sm ",
        height,
        width,
        className
      )}
    >
      {/* Background gradient orbs */}
      {/* <div className="absolute -left-4 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -right-4 bottom-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" /> */}

      <div className="flex flex-col items-center gap-8">
        <Loader size={loaderSize} variant={loaderVariant} />

        {/* Loading text with animations */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-base font-medium text-primary animate-pulse">
            {message}
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
