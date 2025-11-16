"use client";

import { FieldValues, useFormContext, UseFormReturn } from "react-hook-form";
import { ConditionalField } from "./conditional";
import type {
  FieldVariants,
  FormFieldSchema,
} from "./interface";
import {
  BaseFieldLayout,
  FieldWrapper,
  InputField,
  PasswordField,
  SelectField,
  CheckboxField,
  getValidationRules,
} from "./fields/index";
import { FormField } from "../form";
import { LogoField } from "./fields/logo";
import { TextareaField } from "./fields/textarea";
import { SliderField } from "./fields/slider";
import { FileField } from "./fields/file";
import { MultiSelectField } from "./fields/multi-select";
import { TagsInputField } from "./fields/tags-input";
import { EnvironmentVariableField } from "./fields/envs";
import { SwitchField } from "./fields/switch";
import { CarouselField } from "./fields/caraousel";
import { RecordField } from "./fields/record";
import { SeparatorField } from "./fields/separator";
import { CustomField } from "./fields/custom";

const FieldComponents: Record<FieldVariants, any> = {
  text: InputField,
  email: InputField,
  number: InputField,
  password: PasswordField,
  select: SelectField,
  checkbox: CheckboxField,
  logo: LogoField,
  textarea: TextareaField,
  slider: SliderField,
  file: FileField,
  envs: EnvironmentVariableField,
  "multi-select": MultiSelectField,
  "tags-input": TagsInputField,
  "datetime-local": InputField,
  color: InputField,
  button: InputField,
  date: InputField,
  month: InputField,
  week: InputField,
  time: InputField,
  range: SliderField,
  image: LogoField,
  radio: CheckboxField,
  search: InputField,
  url: InputField,
  tel: InputField,
  submit: InputField,
  hidden: InputField,
  reset: InputField,
  toggle: SwitchField,
  carousel: CarouselField,
  record: RecordField,
  separator: SeparatorField,
  custom: CustomField,
} as const;

type SupportedFieldVariant = keyof typeof FieldComponents;

export function FormFieldComponent({
  schema,
  form,
}: {
  schema: FormFieldSchema;
  form: UseFormReturn<FieldValues, unknown, FieldValues>;
}) {
  const { control } = useFormContext();

  const renderFormField = () => {
    // If there's a custom component, use the custom field type
    const variant = schema.customComponent
      ? "custom"
      : ((schema.variant || "text") as SupportedFieldVariant);
    const type = (schema.type || "text") as React.HTMLInputTypeAttribute;
    const key: FieldVariants =
      variant === "text" && type ? type : variant || type;
    const FieldComponent = FieldComponents[key] || InputField;

    return (
      <FormField
        control={control}
        name={schema.name}
        rules={getValidationRules(schema)}
        render={({ field }) => (
          <BaseFieldLayout
            schema={schema}
            isCheckbox={schema.variant === "checkbox"}
            isPassword={schema.variant === "password"}
            isLogo={schema.variant === "logo"}
            isEnvs={schema.variant === "envs"}
            isToggle={schema.variant === "toggle"}
          >
            <FieldComponent schema={schema} field={field} />
          </BaseFieldLayout>
        )}
      />
    );
  };

  return (
    <ConditionalField conditions={schema.conditionalLogic}>
      <FieldWrapper form={form} schema={schema}>
        {renderFormField()}
      </FieldWrapper>
    </ConditionalField>
  );
}
