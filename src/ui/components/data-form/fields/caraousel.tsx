import { ControllerRenderProps, FieldValues } from "react-hook-form";
import type { FormFieldSchema } from "../interface";
import { CarouselPicker } from "../../carousel-picker";

interface CarouselFieldProps {
  schema: FormFieldSchema;
  field: ControllerRenderProps<FieldValues, any>;
}

export const CarouselField = ({ schema, field }: CarouselFieldProps) => {
  const values = Array.isArray(field.value) ? field.value : [];
  console.log("CarouselField values", values);

  return (
    <CarouselPicker
      value={values}
      onChange={field.onChange}
      className={schema.className}
      disabled={schema.disabled}
    />
  );
};
