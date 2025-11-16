import { ControllerRenderProps, FieldValues } from "react-hook-form";
import { Checkbox } from "../../checkbox";
import type { FormFieldSchema } from "../interface";

interface CheckboxFieldProps {
  schema: FormFieldSchema;
  field: ControllerRenderProps<FieldValues, string>;
}

export const CheckboxField = ({ schema, field }: CheckboxFieldProps) => (
  console.log("CheckboxField", schema, field),
  <Checkbox
    checked={field.value}
    onCheckedChange={field.onChange}
    disabled={schema.disabled}
  />
);
