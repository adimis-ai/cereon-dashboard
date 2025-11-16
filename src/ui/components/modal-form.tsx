import * as React from "react";
import { z } from "zod";
import type { FormComponentProps } from "./data-form/interface";
import { FormComponent } from "./data-form/form";
import { Modal, ModalProps } from "./modal";
import { FieldErrors } from "react-hook-form";
import { ErrorDisplay } from "./error-display";

export interface ModalFormProps<TSchema extends z.ZodType<any, any>>
  extends Omit<ModalProps, "children" | "onSave"> {
  formProps: Omit<
    FormComponentProps<TSchema>,
    "hideSubmitButton" | "onChange" | "onSubmit"
  >;
  onSubmit?: (data: z.infer<TSchema>) => void | Promise<void>;
}

export function ModalForm<TSchema extends z.ZodType<any, any>>({
  formProps,
  onSubmit,
  disableSave: propDisableSave,
  open,
  onOpenChange,
  ...modalProps
}: ModalFormProps<TSchema>) {
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
    if (!formData || hasErrors) {
      return;
    }

    try {
      await onSubmit?.(formData);
      onOpenChange?.(false);
    } catch (error) {
      console.error("[ModalForm] Error submitting form:", error);
    }
  }, [formData, hasErrors, onSubmit, onOpenChange]);

  return (
    <Modal
      {...modalProps}
      onSave={handleSave}
      open={open}
      onOpenChange={onOpenChange}
      disableSave={propDisableSave || hasErrors}
    >
      <ErrorDisplay errors={formErrors} />
      <FormComponent {...formProps} hideSubmitButton onChange={handleChange} />
    </Modal>
  );
}
