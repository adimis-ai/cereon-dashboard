import { ControllerRenderProps, FieldValues } from "react-hook-form";
import { Input } from "../../input";
import type { FormFieldSchema } from "../interface";
import { cn } from "../../../lib/index";

interface InputFieldProps {
  schema: FormFieldSchema;
  field: ControllerRenderProps<FieldValues, string>;
  isPasswordField?: boolean;
}

export const InputField = ({
  schema,
  field,
  isPasswordField,
}: InputFieldProps) => (
  <Input
    type={isPasswordField ? "password" : schema.type}
    placeholder={
      typeof schema.placeholder === "string" ? schema.placeholder : ""
    }
    disabled={schema.disabled}
    autoComplete={schema.autocomplete}
    className={cn(schema.className)}
    {...field}
  />
);
