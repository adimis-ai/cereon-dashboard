import * as React from "react";
import { ControllerRenderProps, FieldValues } from "react-hook-form";
import type { FormFieldSchema } from "../interface";
import { cn } from "../../../lib/index";
import { LogoPicker } from "../../logo-picker";

interface LogoFieldProps {
  schema: FormFieldSchema;
  field: ControllerRenderProps<FieldValues, string>;
}

export const LogoField = React.memo(({ schema, field }: LogoFieldProps) => {
  return (
    <div className={cn("flex flex-col items-center space-y-3", schema.className)}>
      {!schema.disableLabelDescription && (
        <div className="flex justify-center items-center gap-2">
          {schema.label && (
            <p className="text-center text-sm text-foreground font-semibold">
              {schema.label}{" "}
              {schema.required && <span className="text-red-500">*</span>}
            </p>
          )}
        </div>
      )}
      
      <LogoPicker
        value={field.value}
        onChange={field.onChange}
        disabled={schema.disabled}
        variant={schema.logoVariant}
      />

      {schema.description && (
        <p className="text-center text-sm text-muted-foreground">
          {schema.description}
        </p>
      )}
    </div>
  );
});

LogoField.displayName = "LogoField";