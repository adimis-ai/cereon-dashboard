import { ControllerRenderProps } from "react-hook-form";
import {
  EnvironmentVariable,
  EnvironmentVariablePicker,
} from "../../env-picker";
import type { FormFieldSchema } from "../interface";

interface EnvironmentVariableField {
  schema: FormFieldSchema;
  field: ControllerRenderProps<EnvironmentVariable, any>;
}

export const EnvironmentVariableField = ({
  schema,
  field,
}: EnvironmentVariableField) => (
  <EnvironmentVariablePicker
    value={field.value}
    onChange={field.onChange}
    className={schema.className}
    disabled={schema.disabled}
  />
);
