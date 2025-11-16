"use client";

import { Switch } from "../../switch";
import { ControllerRenderProps, FieldValues } from "react-hook-form";
import type { FormFieldSchema } from "../interface";
import { FormDescription, FormLabel } from "../../form";
export function SwitchField({
  field,
  schema,
}: {
  field: ControllerRenderProps<FieldValues, any>;
  schema: FormFieldSchema;
}) {
  return (
    <div className="flex justify-start items-center space-x-3 border rounded-lg shadow-md p-4">
      <Switch
        checked={field.value}
        onCheckedChange={field.onChange}
        disabled={schema.disabled}
        aria-label={schema.label}
      />
      <div className="space-y-1 leading-none ml-2">
        <FormLabel>
          {schema.label}
          {schema.required && <span className="text-red-500">*</span>}
        </FormLabel>
        {schema.description && (
          <FormDescription>{schema.description}</FormDescription>
        )}
      </div>
    </div>
  );
}
