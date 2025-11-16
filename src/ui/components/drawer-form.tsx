import * as React from "react";
import { z } from "zod";
import type { FormComponentProps } from "./data-form/interface";
import { FormComponent } from "./data-form/form";
import { DrawerComponent, DrawerProps } from "./drawer";
import { FieldErrors } from "react-hook-form";
import { ErrorDisplay } from "./error-display";

export interface DrawerFormProps<TSchema extends z.ZodType<any, any>>
  extends Omit<DrawerProps, "children" | "onSave"> {
  formProps: Omit<
    FormComponentProps<TSchema>,
    "hideSubmitButton" | "onChange" | "onSubmit"
  >;
  onSubmit?: (data: z.infer<TSchema>) => void | Promise<void>;
}

export function DrawerForm<TSchema extends z.ZodType<any, any>>({
  formProps,
  onSubmit,
  disableSave: propDisableSave,
  ...drawerProps
}: DrawerFormProps<TSchema>) {
  const [formData, setFormData] = React.useState<z.infer<TSchema> | null>(null);
  const [formErrors, setFormErrors] = React.useState<FieldErrors<any>>({});
  const hasErrors = Object.keys(formErrors).length > 0;

  const handleChange = React.useCallback(
    (data: Partial<z.infer<TSchema>>, errors: FieldErrors<any>) => {
      setFormData(data as z.infer<TSchema>);
      setFormErrors(errors);
    },
    []
  );

  const handleSave = React.useCallback(async () => {
    if (formData && !hasErrors) {
      await onSubmit?.(formData);
    }
  }, [formData, hasErrors, onSubmit]);

  return (
    <DrawerComponent
      {...drawerProps}
      onSave={handleSave}
      disableSave={propDisableSave || hasErrors}
    >
      <ErrorDisplay errors={formErrors} />
      <FormComponent {...formProps} hideSubmitButton onChange={handleChange} />
    </DrawerComponent>
  );
}