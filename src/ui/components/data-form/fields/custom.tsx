import { ControllerRenderProps, FieldValues } from "react-hook-form";
import type { FormFieldSchema } from "../interface";

interface CustomFieldProps {
  schema: FormFieldSchema;
  field: ControllerRenderProps<FieldValues, any>;
}

export const CustomField = ({ schema, field }: CustomFieldProps) => {
  if (!schema.customComponent) {
    return null;
  }

  const CustomComponent = schema.customComponent;
  
  return (
    <CustomComponent
      value={field.value}
      onChange={field.onChange}
      disabled={schema.disabled}
      placeholder={typeof schema.placeholder === "string" ? schema.placeholder : ""}
      required={schema.required}
      className={schema.className}
      {...schema.customProps}
    />
  );
};