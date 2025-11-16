"use client";

import * as React from "react";
import {
  FieldError,
  FieldErrors,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "../form";
import { Button } from "../button";
import {
  cn,
  formatToTitleCase,
  blobUrlToFile,
} from "../../lib/index";
import type { FormComponentProps, FormFieldOrGroup } from "./interface";
import { FormFieldComponent } from "./field";
import { z } from "zod";
import { Loader } from "../loader";
import { Alert, AlertDescription } from "../alert";

const getNestedErrorMessage = (error: FieldError): string => {
  console.log("getNestedErrorMessage: error", error);
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

export function FormComponent<TSchema extends z.ZodType<any, any>>({
  formFields,
  validationSchema,
  defaultValues,
  onSubmit,
  onInvalid,
  onChange,
  className,
  submitText = "Submit",
  disableForm,
  submitClassName,
  hideSubmitButton,
  loading = false,
  submitIcon,
}: FormComponentProps<TSchema>) {
  const [internalLoading, setInternalLoading] = React.useState(loading);
  const [validationErrors, setValidationErrors] = React.useState<
    FieldErrors<any>
  >({});
  const [defaults, setDefaults] = React.useState<z.TypeOf<TSchema> | undefined>(
    {}
  );

  const processLogoFields = React.useCallback(
    async (data: any) => {
      console.log("[FORM]: Processing logo fields", data);
      const processedData = { ...data };

      // Get all logo fields from formFields
      const logoFields = formFields
        .flat()
        .filter((field) => field.variant === "logo")
        .map((field) => field.name);

      // Process each logo field
      for (const fieldName of logoFields) {
        // Ensure the field exists in processedData
        if (!(fieldName in processedData)) {
          processedData[fieldName] = null;
          continue;
        }

        const value = processedData[fieldName];
        if (!value) {
          processedData[fieldName] = null;
        } else if (typeof value === "string" && value.startsWith("blob:")) {
          try {
            console.log("[FORM]: Processing logo field", fieldName, value);
            processedData[fieldName] = await blobUrlToFile(value);
            console.log(
              "[FORM]: Converted to File object",
              processedData[fieldName]
            );
          } catch (error) {
            console.error(`Error processing logo field ${fieldName}:`, error);
            processedData[fieldName] = null;
          }
        }
        // If it's already a File object, keep it as is
        else if (!(value instanceof File)) {
          processedData[fieldName] = null;
        }
      }

      console.log("[FORM]: Processed logo fields:", processedData);
      return processedData;
    },
    [formFields]
  );

  const sanitizeFileData = React.useCallback(
    (data: any) => {
      const sanitizedData = { ...data };

      // Get all fields that need special handling
      const allFields = formFields.flat();

      // Ensure all form fields are represented in sanitizedData
      allFields.forEach((field) => {
        const fieldName = field.name;
        // If the field isn't in the data, explicitly set it to null
        if (!(fieldName in sanitizedData)) {
          sanitizedData[fieldName] = null;
        }
      });

      // Get all file fields from formFields
      const fileFields = allFields.filter((field) => field.variant === "file");

      // Process each file field
      fileFields.forEach((field) => {
        const value = sanitizedData[field.name];

        // If no value, ensure the field exists with null value
        if (!value) {
          sanitizedData[field.name] = null;
          return;
        }

        // Handle array of files
        if (Array.isArray(value)) {
          const files = value.filter((item) => item instanceof File);
          if (files.length === 0) {
            sanitizedData[field.name] = null;
          } else if (field.maxFiles === 1) {
            sanitizedData[field.name] = files[0];
          } else {
            sanitizedData[field.name] = files;
          }
        }
        // Handle single value
        else if (!(value instanceof File)) {
          sanitizedData[field.name] = null;
        }
      });

      console.log("[FORM]: Sanitized data:", sanitizedData);
      return sanitizedData;
    },
    [formFields]
  );

  const form = useForm({
    defaultValues: defaults,
    resolver: validationSchema ? zodResolver(validationSchema) : undefined,
    mode: hideSubmitButton && onChange ? "onChange" : "onSubmit",
  });

  React.useEffect(() => {
    const fieldDefaults = formFields.reduce(
      (acc, field) => {
        if (Array.isArray(field)) {
          field.forEach((subField) => {
            if (subField.defaultValue !== undefined) {
              acc[subField.name] = subField.defaultValue;
            }
          });
        } else if (field.defaultValue !== undefined) {
          acc[field.name] = field.defaultValue;
        }
        return acc;
      },
      {} as Record<string, any>
    );

    // Merge with defaultValues if they exist
    const mergedDefaults = defaultValues
      ? { ...fieldDefaults, ...defaultValues }
      : fieldDefaults;

    setDefaults(mergedDefaults);

    // Use reset to update form values
    if (Object.keys(mergedDefaults).length > 0) {
      form.reset(mergedDefaults);
    }
  }, [formFields, defaultValues, form]);

  const renderFields = React.useCallback(
    (fields: FormFieldOrGroup[]) => {
      return fields.map((field, index) => {
        if (Array.isArray(field)) {
          return (
            <div key={index} className="grid grid-cols-2 gap-4">
              {field.map((subField, subIndex) => (
                <FormFieldComponent
                  key={`${subField.name}-${subIndex}`}
                  schema={subField}
                  form={form}
                />
              ))}
            </div>
          );
        }
        return (
          <FormFieldComponent
            key={`${field.name}-${index}`}
            schema={field}
            form={form}
          />
        );
      });
    },
    [form]
  );

  const errorDisplay = React.useMemo(() => {
    if (Object.keys(validationErrors).length === 0) return null;

    return (
      <Alert variant="destructive" className="mb-6">
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-semibold">
              Please fix the following{" "}
              {Object.keys(validationErrors).length === 1 ? "error" : "errors"}:
            </p>
            <ul className="list-disc list-inside space-y-1">
              {Object.entries(validationErrors).map(([field, error]) => (
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
  }, [validationErrors]);

  React.useEffect(() => {
    if (!onChange) return;

    const subscription = form.watch(async (data) => {
      setValidationErrors(form.formState.errors);
      console.log("[FORM]: onChange triggered with data", data);
      const processedData = await processLogoFields(data);
      const sanitizedData = sanitizeFileData(processedData);
      onChange(sanitizedData, form.formState.errors);
    });
    return () => subscription.unsubscribe();
  }, [form, onChange, sanitizeFileData, processLogoFields]);

  const onFormSubmit: SubmitHandler<z.TypeOf<TSchema>> = React.useCallback(
    async (data) => {
      try {
        setInternalLoading(true);
        if (!onSubmit) return;
        const processedData = await processLogoFields(data);
        const sanitizedData = sanitizeFileData(processedData);
        await onSubmit(sanitizedData);
      } finally {
        setInternalLoading(false);
      }
    },
    [onSubmit, processLogoFields, sanitizeFileData]
  );

  const renderedFields = React.useMemo(
    () => renderFields(formFields),
    [formFields, renderFields]
  );

  return (
    <Form {...form}>
      {!loading ? (
        <form
          onSubmit={form.handleSubmit(onFormSubmit, onInvalid)}
          className={cn("space-y-4", className)}
        >
          {errorDisplay}
          {renderedFields}
          {!hideSubmitButton && (
            <Button
              type="submit"
              className={cn("mt-3", submitClassName)}
              disabled={disableForm || !form.formState.isDirty}
              icon={submitIcon}
              size={"sm"}
              loading={loading || internalLoading}
            >
              {submitText}
            </Button>
          )}
        </form>
      ) : (
        <div className="flex items-center justify-center h-full p-8">
          <Loader size="xs" />
        </div>
      )}
    </Form>
  );
}
