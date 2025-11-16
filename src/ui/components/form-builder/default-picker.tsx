import { Checkbox } from "../checkbox";
import { Input } from "../input";
import { Textarea } from "../textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";
import type {
  FieldVariants,
  FormFieldSchema,
} from "../data-form/interface";
import { Badge } from "../badge";
import { X } from "lucide-react";
import {
  EnvironmentVariable,
  EnvironmentVariablePicker,
} from "../env-picker";
import { Switch } from "../switch";
import { RecordPicker } from "../record-picker";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../alert";

interface DefaultValuePickerProps {
  field: FormFieldSchema;
  onChange: (value: any) => void;
}

const CheckboxPicker = ({ field, onChange }: DefaultValuePickerProps) => (
  <Checkbox
    checked={field.defaultValue as boolean}
    onCheckedChange={(checked) => onChange(checked)}
  />
);

const SelectPicker = ({ field, onChange }: DefaultValuePickerProps) => (
  <Select
    value={field.defaultValue as string}
    onValueChange={(value) => onChange(value)}
  >
    <SelectTrigger className="w-full">
      <SelectValue placeholder="Select default value" />
    </SelectTrigger>
    <SelectContent>
      {field.options?.map((option) => (
        <SelectItem
          key={option.value.toString()}
          value={option.value.toString()}
        >
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

const SliderPicker = ({ field, onChange }: DefaultValuePickerProps) => (
  <div className="space-y-2">
    <Input
      type="number"
      value={
        Array.isArray(field.defaultValue)
          ? Number(field.defaultValue[0])
          : Number(field.defaultValue) || 0
      }
      onChange={(e) => onChange(Number(e.target.value))}
      min={field.min}
      max={field.max}
      step={field.step ?? 0.01}
    />
  </div>
);

const NumberPicker = ({ field, onChange }: DefaultValuePickerProps) => (
  <Input
    type="number"
    value={field.defaultValue as number}
    onChange={(e) => onChange(Number(e.target.value))}
    min={field.min}
    max={field.max}
  />
);

const TextareaPicker = ({ field, onChange }: DefaultValuePickerProps) => (
  <Textarea
    value={field.defaultValue as string}
    onChange={(e) => onChange(e.target.value)}
  />
);

const DefaultInputPicker = ({ field, onChange }: DefaultValuePickerProps) => (
  <Input
    type={field.type}
    value={field.defaultValue as string}
    onChange={(e) => onChange(e.target.value)}
  />
);

const MultiSelectPicker = ({ field, onChange }: DefaultValuePickerProps) => (
  <div className="space-y-2">
    <Select
      value=""
      onValueChange={(value) => {
        const currentValues = (field.defaultValue as string[]) || [];
        if (!currentValues.includes(value)) {
          onChange([...currentValues, value]);
        }
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Add default values" />
      </SelectTrigger>
      <SelectContent>
        {field.options?.map((option) => (
          <SelectItem
            key={option.value.toString()}
            value={option.value.toString()}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    <div className="flex flex-wrap gap-2">
      {((field.defaultValue as string[]) || []).map((value) => {
        const option = field.options?.find(
          (opt) => opt.value.toString() === value
        );
        return (
          <Badge
            key={value}
            variant="secondary"
            className="flex items-center gap-1"
          >
            {option?.label || value}
            <X
              className="h-3 w-3 cursor-pointer"
              onClick={() => {
                const currentValues = (field.defaultValue as string[]) || [];
                onChange(currentValues.filter((v) => v !== value));
              }}
            />
          </Badge>
        );
      })}
    </div>
  </div>
);

const TagsInputPicker = ({ field, onChange }: DefaultValuePickerProps) => (
  <div className="space-y-2">
    <div className="flex gap-2">
      <Input
        placeholder="Add tag and press Enter"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const value = e.currentTarget.value.trim();
            if (value) {
              const currentValues = (field.defaultValue as string[]) || [];
              if (!currentValues.includes(value)) {
                onChange([...currentValues, value]);
              }
              e.currentTarget.value = "";
            }
          }
        }}
      />
    </div>

    <div className="flex flex-wrap gap-2">
      {((field.defaultValue as string[]) || []).map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="flex items-center gap-1"
        >
          {tag}
          <X
            className="h-3 w-3 cursor-pointer"
            onClick={() => {
              const currentValues = (field.defaultValue as string[]) || [];
              onChange(currentValues.filter((v) => v !== tag));
            }}
          />
        </Badge>
      ))}
    </div>
  </div>
);

const FilePicker = ({ field, onChange }: DefaultValuePickerProps) => (
  <div className="space-y-2">
    <Input
      type="text"
      placeholder="Enter file URL or path"
      value={(field.defaultValue as string) || ""}
      onChange={(e) => onChange(e.target.value)}
    />
    <p className="text-xs text-muted-foreground">
      Note: Default value for file inputs should be a URL or file path
    </p>
  </div>
);

const EnvPicker = ({ field, onChange }: DefaultValuePickerProps) => (
  <EnvironmentVariablePicker
    value={
      Array.isArray(field.defaultValue)
        ? typeof field.defaultValue !== "object"
          ? []
          : (field.defaultValue as EnvironmentVariable[])
        : []
    }
    onChange={onChange}
  />
);

const LogoPicker = ({ field, onChange }: DefaultValuePickerProps) => (
  <div className="space-y-2">
    <Input
      type="text"
      placeholder="Enter logo URL or path"
      value={(field.defaultValue as string) || ""}
      onChange={(e) => onChange(e.target.value)}
    />
    <p className="text-xs text-muted-foreground">
      Note: Default value for logo inputs should be a URL or file path
    </p>
  </div>
);

const TogglePicker = ({ field, onChange }: DefaultValuePickerProps) => (
  <div className="flex justify-start items-center space-x-2 mt-1">
    <Switch
      checked={field.defaultValue as boolean}
      onCheckedChange={(checked) => onChange(checked)}
    />
    <p className="text-xs text-muted-foreground">
      {field.label}
      {field.description && (
        <span className="text-xs text-muted-foreground">
          {" "}
          - {field.description}
        </span>
      )}
    </p>
  </div>
);

const CarouselPicker = ({ field, onChange }: DefaultValuePickerProps) => (
  <div className="space-y-2">
    <div className="flex gap-2">
      <Input
        placeholder="Add item and press Enter"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const value = e.currentTarget.value.trim();
            if (value) {
              const currentValues = (field.defaultValue as string[]) || [];
              if (!currentValues.includes(value)) {
                onChange([...currentValues, value]);
              }
              e.currentTarget.value = "";
            }
          }
        }}
      />
    </div>

    <div className="flex flex-wrap gap-2">
      {((field.defaultValue as string[]) || []).map((item, index) => (
        <Badge
          key={index}
          variant="secondary"
          className="flex items-center gap-1"
        >
          {item}
          <X
            className="h-3 w-3 cursor-pointer"
            onClick={() => {
              const currentValues = (field.defaultValue as string[]) || [];
              onChange(currentValues.filter((_, i) => i !== index));
            }}
          />
        </Badge>
      ))}
    </div>
  </div>
);

const RecordFieldPicker = ({ field, onChange }: DefaultValuePickerProps) => (
  <RecordPicker
    value={
      Array.isArray(field.defaultValue)
        ? (field.defaultValue as Record<string, string>[])
        : []
    }
    onChange={onChange}
  />
);

const SeparatorPicker = () => (
  <Alert>
    <AlertTitle>Separator Field</AlertTitle>
    <AlertDescription>
      Separators are used to create visual divisions in forms and do not require
      default values. They can be customized with an optional label that will be
      displayed in the center of the separator line.
    </AlertDescription>
  </Alert>
);

const CustomFieldPicker = () => (
  <Alert>
    <AlertTitle>Custom Field</AlertTitle>
    <AlertDescription>
      Custom fields allow you to use any React component as a form field. You
      can pass the default value as a prop to your custom component. Ensure that
      your custom component handles the default value correctly.
    </AlertDescription>
  </Alert>
);

const DefaultValuePickers: Record<FieldVariants, any> = {
  checkbox: CheckboxPicker,
  select: SelectPicker,
  slider: SliderPicker,
  number: NumberPicker,
  textarea: TextareaPicker,
  text: DefaultInputPicker,
  email: DefaultInputPicker,
  password: DefaultInputPicker,
  file: FilePicker,
  envs: EnvPicker,
  logo: LogoPicker,
  custom: CustomFieldPicker,
  "multi-select": MultiSelectPicker,
  "tags-input": TagsInputPicker,
  "datetime-local": DefaultInputPicker,
  color: DefaultInputPicker,
  button: DefaultInputPicker,
  date: DefaultInputPicker,
  month: DefaultInputPicker,
  week: DefaultInputPicker,
  time: DefaultInputPicker,
  range: SliderPicker,
  image: LogoPicker,
  radio: CheckboxPicker,
  search: DefaultInputPicker,
  url: DefaultInputPicker,
  tel: DefaultInputPicker,
  submit: DefaultInputPicker,
  hidden: DefaultInputPicker,
  reset: DefaultInputPicker,
  toggle: TogglePicker,
  carousel: CarouselPicker,
  separator: SeparatorPicker,
  record: RecordFieldPicker,
} as const;

export type DefaultValuePickerVariant = keyof typeof DefaultValuePickers;

export function DefaultValuePicker({
  field,
  onChange,
}: DefaultValuePickerProps) {
  const variant = (field.variant || "text") as DefaultValuePickerVariant;
  const Picker = DefaultValuePickers[variant] || DefaultInputPicker;

  return <Picker field={field} onChange={onChange} />;
}
