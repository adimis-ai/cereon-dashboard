import * as React from "react";
import { ControllerRenderProps, FieldValues } from "react-hook-form";
import { Slider } from "../../slider";
import type { FormFieldSchema } from "../interface";
import { cn } from "../../../lib/index";

interface SliderFieldProps {
  schema: FormFieldSchema;
  field: ControllerRenderProps<FieldValues, string>;
}

export const SliderField = ({ schema, field }: SliderFieldProps) => {
  const value = React.useMemo(() => {
    if (Array.isArray(field.value)) {
      return field.value.map(Number);
    }
    return [Number(field.value) || schema.min || 0];
  }, [field.value, schema.min]);

  const min = schema.min ?? 0;
  const max = schema.max ?? 100;
  const currentValue = value[0];

  return (
    <div className="space-y-3">
      {schema?.renderSliderHeader?.(field.value, min, max, schema.step ?? 0.01)}
      <Slider
        {...field}
        value={value}
        onValueChange={(values) => field.onChange(values[0])}
        min={min}
        max={max}
        step={schema.step ?? 0.01}
        disabled={schema.disabled}
        className={cn("mt-3")}
      />
      {schema.renderSliderFooter ? (
        schema.renderSliderFooter(field.value, min, max, schema.step ?? 0.01)
      ) : (
        <div className="flex items-center justify-between text-sm">
          <div className="flex flex-row gap-1 items-center">
            <span className="text-muted-foreground">Min</span>
            <span className="font-medium">{min}</span>
          </div>
          <div className="flex flex-row gap-1 items-center">
            <span className="text-muted-foreground">Current</span>
            <span className="font-medium text-primary">{currentValue}</span>
          </div>
          <div className="flex flex-row gap-1 items-center">
            <span className="text-muted-foreground">Max</span>
            <span className="font-medium">{max}</span>
          </div>
        </div>
      )}
    </div>
  );
};
