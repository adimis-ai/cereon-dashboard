import { z } from "zod";
import { ReactNode } from "react";
import {
  DeepPartial,
  FieldErrors,
  SubmitErrorHandler,
  SubmitHandler,
} from "react-hook-form";
import { FieldWrapperProps } from "./fields/wrapper";
import { EnvironmentVariable } from "../env-picker";

// types.ts
export type Operator =
  | "strict_equals"
  | "not_strict_equals"
  | "equals"
  | "not_equals"
  | "greater_than"
  | "greater_than_or_equals"
  | "less_than"
  | "less_than_or_equals"
  | "includes"
  | "not_includes";

export type Condition = {
  field: string;
  operator: Operator;
  value: any;
  relation?: "or" | "and";
};

export interface Option {
  icon?: string | ReactNode;
  label: string;
  value: string | number;
  [key: string]: any;
}

export type FieldVariants =
  | "text"
  | "email"
  | "password"
  | "number"
  | "select"
  | "checkbox"
  | "logo"
  | "textarea"
  | "file"
  | "multi-select"
  | "tags-input"
  | "envs"
  | "slider"
  | "toggle"
  | "carousel"
  | "record"
  | "slider"
  | "separator"
  | "custom"
  | React.HTMLInputTypeAttribute;

export interface CustomFieldProps<T = any> {
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
  className?: string;
  [key: string]: any;
}

export interface FormFieldSchema {
  name: string;
  label: string;
  icon?: string | ReactNode;
  pattern?: RegExp;
  patternErrorMessage?: string;
  disableLabelDescription?: boolean;
  renderSelectItem?: (
    item: Option,
    options: Option[],
    selectedOption: Option
  ) => ReactNode;
  renderSliderFooter?: (
    value: number,
    min: number,
    max: number,
    step: number
  ) => ReactNode;
  renderSliderHeader?: (
    value: number,
    min: number,
    max: number,
    step: number
  ) => ReactNode;
  type?: React.HTMLInputTypeAttribute;
  variant?: FieldVariants;
  accept?: string;
  placeholder?: string | { key?: string; value?: string };
  recordValueType?: "string" | "number";
  disableKey?: boolean;
  disableAddDelete?: boolean;
  description?: string;
  disabled?: boolean;
  options?: Option[];
  logoVariant?: "default" | "rectangle";
  step?: number;
  required?: boolean;
  requiredErrorMessage?: string;
  min?: number;
  max?: number;
  conditionalLogic?: Condition[];
  maxFiles?: number;
  className?: string;
  needUserInput?: boolean;
  is_secret?: boolean;
  autocomplete?: React.HTMLInputAutoCompleteAttribute;
  fetchOptions?: (
    limit: number,
    offset: number,
    inputValue?: string
  ) => Promise<Option[]>;
  evaluatePasswordCriteria?: (password: string) => string[];
  generatePassword?: () => string;
  components?: {
    top?: (props: FieldWrapperProps) => ReactNode;
    topRight?: (props: FieldWrapperProps) => ReactNode;
    topLeft?: (props: FieldWrapperProps) => ReactNode;
    bottomLeft?: (props: FieldWrapperProps) => ReactNode;
    bottomRight?: (props: FieldWrapperProps) => ReactNode;
    bottom?: (props: FieldWrapperProps) => ReactNode;
  };
  defaultValue?:
    | string
    | number
    | boolean
    | Date
    | string[]
    | number[]
    | boolean[]
    | Date[]
    | EnvironmentVariable[];
  customComponent?: React.ComponentType<CustomFieldProps>;
  customProps?: Record<string, any>;
  setFirstItemAsOption?: boolean;
  inline?: boolean;
}

export type FormFieldOrGroup = FormFieldSchema | FormFieldSchema[];

export type FormComponentProps<TSchema extends z.ZodType<any, any>> = {
  formFields: FormFieldOrGroup[];
  validationSchema?: TSchema;
  defaultValues?: Partial<z.infer<TSchema>>;
  onSubmit?: SubmitHandler<z.infer<TSchema>>;
  onInvalid?: SubmitErrorHandler<z.infer<TSchema>>;
  onChange?: (
    data: DeepPartial<z.infer<TSchema>>,
    errors: FieldErrors<
      z.infer<
        | TSchema
        | z.ZodEffects<
            z.ZodObject<
              any,
              z.UnknownKeysParam,
              z.ZodTypeAny,
              { [x: string]: any },
              { [x: string]: any }
            >
          >
      >
    >
  ) => void;
  className?: string;
  submitText?: string;
  submitIcon?: ReactNode;
  disableForm?: boolean;
  submitClassName?: string;
  hideSubmitButton?: boolean;
  loading?: boolean;
};
