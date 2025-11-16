import * as React from "react";
import { FileUploader } from "./file-uploader";
import { Button } from "./button";
import { Check, X } from "lucide-react";
import { cn } from "../lib/index";

export interface LogoPickerProps {
  value?: string | File | null;
  onChange?: (value: string | File | null) => void;
  className?: string;
  disabled?: boolean;
  showConfirmation?: boolean;
  variant?: "default" | "rectangle";
}

export const LogoPicker = React.memo(
  ({
    value,
    onChange,
    className,
    disabled,
    showConfirmation = true,
    variant = "default",
  }: LogoPickerProps) => {
    const [preview, setPreview] = React.useState<string | null>(null);
    const [isPending, setIsPending] = React.useState(false);

    // Convert string URL to File object for FileUploader
    const fileValue = React.useMemo(() => {
      if (value instanceof File) {
        return [value];
      }
      return null;
    }, [value]);

    React.useEffect(() => {
      if (value instanceof File) {
        const objectUrl = URL.createObjectURL(value);
        setPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
      } else if (typeof value === "string") {
        setPreview(value);
      } else {
        setPreview(null);
      }
    }, [value]);

    const filePreviewUrl = React.useMemo(() => {
      if (value instanceof File) {
        return URL.createObjectURL(value);
      }
      return preview || null;
    }, [value, preview]);

    const handleFileChange = React.useCallback(
      (files: File | File[] | null) => {
        if (files) {
          const fileArray = Array.isArray(files) ? files : [files];
          if (fileArray.length > 0 && fileArray[0] instanceof File) {
            const objectUrl = URL.createObjectURL(fileArray[0]);
            setPreview(objectUrl);
            setIsPending(showConfirmation);
            if (!showConfirmation) {
              console.log("handleFileChange: fileArray", fileArray[0]);
              onChange?.(fileArray[0]);
            }
          } else {
            setPreview(null);
            setIsPending(false);
            onChange?.(null);
          }
        } else {
          setPreview(null);
          setIsPending(false);
          onChange?.(null);
        }
      },
      [onChange, showConfirmation]
    );

    const containerClasses = React.useMemo(() => {
      if (variant === "rectangle") {
        return "relative flex flex-col items-center justify-center bg-transparent border border-dashed rounded-lg w-full h-[200px] p-0 hover:ring hover:ring-primary focus:ring focus:ring-primary transition";
      }
      return "relative flex flex-col items-center justify-center bg-transparent border border-dashed rounded-full w-36 h-36 p-0 hover:ring hover:ring-primary focus:ring focus:ring-primary transition";
    }, [variant]);

    const imageClasses = React.useMemo(() => {
      if (variant === "rectangle") {
        return "w-full h-full object-contain max-h-[200px]";
      }
      return "rounded-full w-full h-full object-cover";
    }, [variant]);

    return (
      <div className={cn("flex flex-col items-center space-y-3", className)}>
        <FileUploader
          value={fileValue}
          onValueChange={handleFileChange}
          dropzoneOptions={{
            accept: { "image/*": [] },
            maxFiles: 1,
            disabled,
          }}
          className={containerClasses}
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files) {
                handleFileChange(Array.from(e.target.files));
              }
            }}
            className="absolute inset-0 z-10 w-full h-full cursor-pointer opacity-0"
            disabled={disabled}
          />
          <div className="flex flex-col items-center justify-center space-y-2">
            {filePreviewUrl ? (
              <img
                src={filePreviewUrl}
                alt="Selected logo"
                className={imageClasses}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
            )}
          </div>
        </FileUploader>
        {filePreviewUrl && (
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="destructive"
              className="size-8 rounded-full shadow-md"
              onClick={(e) => {
                e.stopPropagation();
                setPreview(null);
                setIsPending(false);
                onChange?.(null);
              }}
              disabled={disabled}
              aria-label="Remove logo"
            >
              <X className="h-4 w-4" />
            </Button>
            {isPending && (
              <Button
                size="icon"
                variant="default"
                className="size-8 rounded-full shadow-md bg-primary text-primary-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange?.(filePreviewUrl);
                  setIsPending(false);
                }}
                disabled={disabled}
                aria-label="Confirm logo"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
);

LogoPicker.displayName = "LogoPicker";
