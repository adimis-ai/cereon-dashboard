import { ControllerRenderProps, FieldValues } from "react-hook-form";
import {
  PasswordFieldHeader,
  PasswordStrengthMeter,
} from "../../input";
import type { FormFieldSchema } from "../interface";
import { InputField } from "./input";

interface PasswordFieldProps {
  schema: FormFieldSchema;
  field: ControllerRenderProps<FieldValues, string>;
}

export const PasswordField = ({ schema, field }: PasswordFieldProps) => (
  <>
    <PasswordFieldHeader
      schema={schema}
      required={schema.required}
      setPassword={field.onChange}
    />
    <InputField schema={schema} field={field} isPasswordField />
    <PasswordStrengthMeter schema={schema} password={field.value} />
  </>
);
