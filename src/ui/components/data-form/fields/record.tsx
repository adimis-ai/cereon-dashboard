import { ControllerRenderProps, FieldValues } from "react-hook-form";
import type { FormFieldSchema } from "../interface";
import { RecordPicker } from "../../record-picker";

interface RecordFieldProps {
  schema: FormFieldSchema;
  field: ControllerRenderProps<FieldValues, any>;
}

export const RecordField = ({ schema, field }: RecordFieldProps) => (
  <RecordPicker
    value={field.value}
    onChange={field.onChange}
    className={schema.className}
    disabled={schema.disabled}
    maxItems={schema.max}
    valueType={schema.recordValueType}
    disableKey={schema.disableKey}
    disableAddDelete={schema.disableAddDelete}
    maxIntValue={schema.max}
    minIntValue={schema.min}
    sliderStep={schema.step}
    renderSliderHeader={schema.renderSliderHeader}
    renderSliderFooter={schema.renderSliderFooter}
    placeholder={
      typeof schema.placeholder === "object"
        ? {
            key: schema.placeholder.key,
            value: schema.placeholder.value,
          }
        : undefined
    }
  />
);
