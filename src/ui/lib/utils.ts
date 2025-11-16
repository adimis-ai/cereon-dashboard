import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(
  date: Date | string | number,
  opts: Intl.DateTimeFormatOptions = {}
) {
  return new Intl.DateTimeFormat("en-US", {
    month: opts.month ?? "long",
    day: opts.day ?? "numeric",
    year: opts.year ?? "numeric",
    ...opts,
  }).format(new Date(date));
}

export function toSentenceCase(str: string) {
  return str
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase())
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * @see https://github.com/radix-ui/primitives/blob/main/packages/core/primitive/src/primitive.tsx
 */
export function composeEventHandlers<E>(
  originalEventHandler?: (event: E) => void,
  ourEventHandler?: (event: E) => void,
  { checkForDefaultPrevented = true } = {}
) {
  return function handleEvent(event: E) {
    originalEventHandler?.(event);

    if (
      checkForDefaultPrevented === false ||
      !(event as unknown as Event).defaultPrevented
    ) {
      return ourEventHandler?.(event);
    }
  };
}

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(price);
};

export const formatNumber = (num: number): string => {
  if (num >= 1e12) {
    return (num / 1e12).toFixed(1) + "T";
  } else if (num >= 1e9) {
    return (num / 1e9).toFixed(1) + "B";
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + "M";
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + "K";
  }
  return num.toString();
};

export const delay = (time: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

/**
 * Helper function to append nested objects to FormData, handling files and file paths specially
 * @param form - The FormData instance to append to
 * @param obj - The object to process
 * @param parentKey - Optional parent key for nested objects
 */
export const appendFormData = (
  form: FormData,
  obj: any,
  parentKey?: string
): void => {
  Object.entries(obj).forEach(([k, v]) => {
    const formKey = parentKey ? `${parentKey}[${k}]` : k;

    // Handle File instances
    if (
      v instanceof File ||
      (v && typeof v === "object" && v.constructor?.name === "File")
    ) {
      form.append(formKey, v as File);
      return;
    }

    // Handle Blob instances
    if (v instanceof Blob) {
      form.append(formKey, v);
      return;
    }

    // Handle arrays
    if (Array.isArray(v)) {
      v.forEach((item, idx) => {
        if (
          item instanceof File ||
          (item &&
            typeof item === "object" &&
            item.constructor?.name === "File")
        ) {
          form.append(`${formKey}[${idx}]`, item as File);
        } else if (item instanceof Blob) {
          form.append(`${formKey}[${idx}]`, item);
        } else if (typeof item === "object" && item !== null) {
          appendFormData(form, item, `${formKey}[${idx}]`);
        } else {
          form.append(`${formKey}[${idx}]`, String(item));
        }
      });
      return;
    }

    // Handle nested objects
    if (typeof v === "object" && v !== null) {
      appendFormData(form, v, formKey);
      return;
    }

    // Handle primitive values
    if (typeof v !== "undefined") {
      form.append(formKey, String(v));
    }
  });
};

/**
 * Creates FormData from an object, properly handling files, blobs, and nested objects
 * @param data - The data object to convert to FormData
 * @returns FormData instance with all data properly appended
 */
export const createFormData = (data: Record<string, any>): FormData => {
  console.log("Creating FormData from data:", data);
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (
      value instanceof File ||
      (value && typeof value === "object" && value.constructor?.name === "File")
    ) {
      formData.append(key, value as File);
    } else if (value instanceof Blob) {
      formData.append(key, value);
    } else if (typeof value === "object" && value !== null) {
      appendFormData(formData, value, key);
    } else {
      formData.append(
        key,
        value === null || value === undefined ? "None" : value
      );
    }
  });
  return formData;
};

/**
 * Format file size in bytes to human readable format
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Convert a blob URL to a File object with proper metadata
 * @param blobUrl - The blob URL (e.g., blob:http://localhost:5173/4c7b4ba0-ecc4-413c-8856-69c00d2639b7)
 * @param defaultFileName - Optional default file name if none can be extracted from the URL
 * @returns Promise<File> - A File object with proper name, path, size, type and extension
 */
export async function blobUrlToFile(
  blobUrl: string,
  defaultFileName: string = "downloaded-file"
): Promise<File> {
  try {
    // Fetch the blob data
    const response = await fetch(blobUrl);
    const blob = await response.blob();

    // Try to extract filename from Content-Disposition header if available
    const contentDisposition = response.headers.get("content-disposition");
    let fileName = defaultFileName;
    if (contentDisposition) {
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
        contentDisposition
      );
      if (matches != null && matches[1]) {
        fileName = matches[1].replace(/['"]/g, "");
      }
    }

    // Get file extension from blob type or fallback to a default
    const fileType = blob.type || "application/octet-stream";
    const fileExtension = fileType.split("/")[1] || "bin";

    // Ensure filename has an extension
    if (!fileName.includes(".")) {
      fileName = `${fileName}.${fileExtension}`;
    }

    // Create a new File object with all the metadata
    const file = new File([blob], fileName, {
      type: fileType,
      lastModified: new Date().getTime(),
    });

    // Add custom properties to help with file handling
    Object.defineProperties(file, {
      path: {
        value: fileName,
        writable: false,
      },
      extension: {
        value: fileExtension,
        writable: false,
      },
    });

    return file;
  } catch (error) {
    console.error("Error converting blob URL to file:", error);
    throw error;
  }
}
