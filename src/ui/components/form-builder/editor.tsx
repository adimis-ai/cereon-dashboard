import type {
  Condition,
  FormFieldSchema,
  Option,
} from "../data-form/interface";
import { Button } from "../button";
import { Textarea } from "../textarea";
import { Input } from "../input";
import { Checkbox } from "../checkbox";
import { FormField, FormItem, FormLabel, FormControl } from "../form";
import { PlusCircle, Trash } from "lucide-react";
import React from "react";
import { ScrollArea } from "../scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";
import { DefaultValuePicker } from "./default-picker";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../accordion";
import { ConditionEditor } from "./conditional";

interface FieldEditorProps {
  field: FormFieldSchema;
  onChange: (updates: Partial<FormFieldSchema>) => void;
  availableFields: FormFieldSchema[];
  isFirstField?: boolean;
}

export function FieldEditor({
  field,
  onChange,
  availableFields,
  isFirstField = false,
}: FieldEditorProps) {
  const showRangeProps = field.variant === "slider";
  const showFileProps = field.variant === "file" || field.type === "file";
  const showOptions =
    field.variant === "select" || field.variant === "multi-select";
  const [localConditions, setLocalConditions] = React.useState<Condition[]>(
    field.conditionalLogic || []
  );
  const [options, setOptions] = React.useState<Option[]>(
    field.options || [
      {
        label: "Default Option",
        value: "default",
      },
    ]
  );
  const [accordionValue, setAccordionValue] = React.useState<
    string | undefined
  >(undefined);

  React.useEffect(() => {
    if (field.options && field.options.length > 0) {
      setOptions(field.options);
    }
  }, [field.options]);

  React.useEffect(() => {
    setLocalConditions(field.conditionalLogic || []);
  }, [field.conditionalLogic]);

  const handleOptionChange = (index: number, updates: Partial<Option>) => {
    const newOptions = [...options];
    const currentOption = newOptions[index];

    if (!currentOption) {
      return; // Early return if option at index doesn't exist
    }

    // Create new option with updates while ensuring required fields
    const updatedOption: Option = {
      label: updates.label || currentOption.label || `Option ${index + 1}`,
      value:
        updates.value ||
        currentOption.value ||
        updates.label?.toLowerCase().replace(/\s+/g, "_") ||
        `option_${index}`,
      icon: updates.icon ?? currentOption.icon,
    };

    newOptions[index] = updatedOption;
    setOptions(newOptions);
    onChange({ options: newOptions });
  };

  return (
    <div className="space-y-4">
      <FormField
        name="name"
        render={() => (
          <FormItem>
            <FormLabel>Field Name</FormLabel>
            <FormControl>
              <Input
                value={field.name}
                onChange={(e) => onChange({ name: e.target.value })}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        name="label"
        render={() => (
          <FormItem>
            <FormLabel>Label</FormLabel>
            <FormControl>
              <Input
                value={field.label}
                onChange={(e) => onChange({ label: e.target.value })}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        name="description"
        render={() => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                value={field.description}
                onChange={(e) => onChange({ description: e.target.value })}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        name="placeholder"
        render={() => (
          <FormItem>
            <FormLabel>Placeholder</FormLabel>
            <FormControl>
              <Input
                value={
                  typeof field.placeholder === "string" ? field.placeholder : ``
                }
                onChange={(e) => onChange({ placeholder: e.target.value })}
                placeholder="Enter placeholder text"
              />
            </FormControl>
          </FormItem>
        )}
      />

      {!isFirstField && (
        <Accordion
          type="single"
          collapsible
          value={accordionValue}
          onValueChange={setAccordionValue}
          className="w-full"
        >
          <AccordionItem value="conditional-logic">
            <AccordionTrigger>Conditional Logic</AccordionTrigger>
            <AccordionContent>
              <div className="h-[150px]">
                <ScrollArea className="h-full w-full">
                  <ConditionEditor
                    conditions={localConditions}
                    onChange={(conditions) => {
                      setLocalConditions(conditions);
                      onChange({ conditionalLogic: conditions });
                    }}
                    availableFields={availableFields}
                  />
                </ScrollArea>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {(field.variant === "text" ||
        field.variant === "email" ||
        field.variant === "password") && (
        <FormField
          name="autocomplete"
          render={() => (
            <FormItem>
              <FormLabel>Autocomplete</FormLabel>
              <FormControl>
                <Select
                  value={field.autocomplete}
                  onValueChange={(value) =>
                    onChange({
                      autocomplete:
                        value as React.HTMLInputAutoCompleteAttribute,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select autocomplete value" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "off",
                      "on",
                      "name",
                      "given-name",
                      "additional-name",
                      "family-name",
                      "honorific-prefix",
                      "honorific-suffix",
                      "nickname",
                      "email",
                      "tel",
                      "tel-country-code",
                      "tel-national",
                      "tel-area-code",
                      "tel-local",
                      "tel-local-prefix",
                      "tel-local-suffix",
                      "tel-extension",
                      "username",
                      "new-password",
                      "current-password",
                      "one-time-code",
                      "instance",
                      "instance-title",
                      "street-address",
                      "address-line1",
                      "address-line2",
                      "address-line3",
                      "address-level1",
                      "address-level2",
                      "address-level3",
                      "address-level4",
                      "country",
                      "country-name",
                      "postal-code",
                      "cc-name",
                      "cc-given-name",
                      "cc-family-name",
                      "cc-number",
                      "cc-exp",
                      "cc-exp-month",
                      "cc-exp-year",
                      "cc-csc",
                      "cc-type",
                      "transaction-currency",
                      "transaction-amount",
                      "bday",
                      "bday-day",
                      "bday-month",
                      "bday-year",
                      "url",
                      "photo",
                      "language",
                      "job-title",
                      "sex",
                      "gender",
                      "webauthn",
                    ].map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />
      )}

      {showOptions && (
        <FormField
          name="options"
          render={() => (
            <FormItem>
              <FormLabel>Options</FormLabel>
              <ScrollArea className="max-h-[200px]">
                <div className="space-y-2 pr-4">
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Label"
                        value={option.label}
                        onChange={(e) => {
                          handleOptionChange(index, {
                            label: e.target.value,
                            value: option.value || e.target.value,
                          });
                        }}
                      />
                      <Input
                        placeholder="Value"
                        value={option.value}
                        onChange={(e) => {
                          const value = e.target.value.trim();
                          handleOptionChange(index, {
                            value: value || option.label,
                          });
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        icon={<Trash className="h-4 w-4" />}
                        tooltip="Remove option"
                        onClick={() => {
                          const newOptions = options.filter(
                            (_, i) => i !== index
                          );
                          setOptions(newOptions);
                          onChange({ options: newOptions });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <Button
                variant="outline"
                icon={<PlusCircle className="h-4 w-4" />}
                onClick={() => {
                  const newOptions = [
                    ...options,
                    {
                      label: `New Option ${options.length}`,
                      value: `option_${options.length}`,
                    },
                  ];
                  setOptions(newOptions);
                  onChange({ options: newOptions });
                }}
                className="mt-2"
              >
                Add Option
              </Button>
            </FormItem>
          )}
        />
      )}

      <FormField
        name="defaultValue"
        render={() => (
          <FormItem>
            <FormLabel>Default Value</FormLabel>
            <FormControl>
              <DefaultValuePicker
                field={field}
                onChange={(value) => onChange({ defaultValue: value })}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {showFileProps && (
        <>
          <FormField
            name="accept"
            render={() => (
              <FormItem>
                <FormLabel>Accepted File Types</FormLabel>
                <FormControl>
                  <Input
                    value={field.accept}
                    onChange={(e) => onChange({ accept: e.target.value })}
                    placeholder=".jpg,.png,.pdf"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="maxFiles"
            render={() => (
              <FormItem>
                <FormLabel>Max Files</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.maxFiles}
                    onChange={(e) =>
                      onChange({ maxFiles: Number(e.target.value) })
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </>
      )}

      {showRangeProps && (
        <div className="grid grid-cols-3 gap-4">
          <FormField
            name="min"
            render={() => (
              <FormItem>
                <FormLabel>Minimum Value</FormLabel>
                <FormControl>
                  <Input
                    className="w-[100px]"
                    type="number"
                    value={field.min || 0}
                    onChange={(e) => onChange({ min: Number(e.target.value) })}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="max"
            render={() => (
              <FormItem>
                <FormLabel>Maximum Value</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="w-[100px]"
                    value={field.max || 100}
                    onChange={(e) => onChange({ max: Number(e.target.value) })}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          {field.variant === "slider" && (
            <FormField
              name="step"
              render={() => (
                <FormItem>
                  <FormLabel>Step Value</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.step || 0.01}
                      onChange={(e) =>
                        onChange({ step: Number(e.target.value) })
                      }
                      min={0.01}
                      step={0.01}
                      className="w-[100px]"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}
        </div>
      )}

      <div className="flex justify-start items-center gap-2">
        <FormField
          name="required"
          render={() => (
            <FormItem className="flex items-center gap-2 border p-2 rounded">
              <FormControl>
                <Checkbox
                  checked={field.required}
                  onCheckedChange={(checked) =>
                    onChange({ required: checked as boolean })
                  }
                />
              </FormControl>
              <FormLabel>Required</FormLabel>
            </FormItem>
          )}
        />
        <FormField
          name="needUserInput"
          render={() => (
            <FormItem className="flex items-center gap-2 border p-2 rounded">
              <FormControl>
                <Checkbox
                  checked={field.needUserInput}
                  onCheckedChange={(checked) =>
                    onChange({ needUserInput: checked as boolean })
                  }
                />
              </FormControl>
              <FormLabel>Need User Input</FormLabel>
            </FormItem>
          )}
        />
        {(field.variant === "text" ||
          field.variant === "tel" ||
          field.variant === "email" ||
          field.variant === "password" ||
          field.variant === "number" ||
          field.variant === "select") && (
          <FormField
            name="is_secret"
            render={() => (
              <FormItem className="flex items-center gap-2 border p-2 rounded">
                <FormControl>
                  <Checkbox
                    checked={field.is_secret}
                    onCheckedChange={(checked) =>
                      onChange({ is_secret: checked as boolean })
                    }
                  />
                </FormControl>
                <FormLabel>Is Secret</FormLabel>
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );
}
