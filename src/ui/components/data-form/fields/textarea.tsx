import { Textarea } from "../../textarea";
import { ControllerRenderProps, FieldValues } from "react-hook-form";
import type { FormFieldSchema } from "../interface";

interface TextareaFieldProps {
  schema: FormFieldSchema;
  field: ControllerRenderProps<FieldValues, string>;
}

export const TextareaField = ({ schema, field }: TextareaFieldProps) => (
  <Textarea
    {...field}
    value={field.value}
    onChange={field.onChange}
    disabled={schema.disabled}
  />
);
