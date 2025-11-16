import { FieldError, FieldErrors } from "react-hook-form";
import { Alert, AlertDescription } from "./alert";
import { formatToTitleCase } from "../lib/index";

const getNestedErrorMessage = (error: FieldError): string => {
  if (typeof error.message === "string") {
    return error.message;
  }
  if (error.type === "object" && typeof error.message === "object") {
    return Object.values(error.message)
      .map((err) => (err as FieldError).message)
      .filter(Boolean)
      .join(", ");
  }
  return "Invalid value";
};

export function ErrorDisplay({ errors }: { errors: FieldErrors<any> }) {
  if (Object.keys(errors).length === 0) return null;

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertDescription>
        <div className="space-y-2">
          <p className="font-semibold">
            Please fix the following{" "}
            {Object.keys(errors).length === 1 ? "error" : "errors"}:
          </p>
          <ul className="list-disc list-inside space-y-1">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field} className="text-sm">
                <span className="font-medium">
                  {formatToTitleCase(field.replace(/\./g, " › "))}:
                </span>{" "}
                {getNestedErrorMessage(error as FieldError)}
              </li>
            ))}
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  );
}