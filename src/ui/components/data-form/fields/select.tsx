import { ControllerRenderProps, FieldValues } from "react-hook-form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../select";
import type { FormFieldSchema } from "../interface";
import { useEffect, useMemo, useState } from "react";
import { cn, formatToTitleCase } from "../../../lib/index";
import { Loader2Icon } from "lucide-react";
import { Loader } from "../../loader";

interface SelectFieldProps {
  schema: FormFieldSchema;
  field: ControllerRenderProps<FieldValues, string> & {
    setFirstItemAsOption?: boolean;
  };
}

export const SelectField = ({ schema, field }: SelectFieldProps) => {
  const [fetchedOptions, setFetchedOptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Use static options if provided, otherwise use fetched options
  const options = useMemo(
    () => schema.options || fetchedOptions,
    [schema.options, fetchedOptions]
  );

  // Set first item as selected if setFirstItemAsOption is true and no value is selected
  useEffect(() => {
    if (
      schema.setFirstItemAsOption &&
      options &&
      options.length > 0 &&
      (field.value === undefined || field.value === null || field.value === "")
    ) {
      field.onChange(options[0].value);
    }
    // Only run when options change or field.value changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, schema.setFirstItemAsOption]);

  // Only fetch if fetchOptions is provided and there are no static options
  useEffect(() => {
    if (schema.fetchOptions && !schema.options && isInitialLoad) {
      setIsLoading(true);
      schema
        .fetchOptions(10, 0)
        .then((newOptions) => {
          setFetchedOptions(newOptions);
        })
        .finally(() => {
          setIsLoading(false);
          setIsInitialLoad(false);
        });
    }
  }, [schema.fetchOptions, schema.options, isInitialLoad]);

  const selectedOption = useMemo(
    () => options?.find((opt) => opt.value === field.value),
    [options, field.value]
  );

  // Inline rendering logic
  if (schema.inline) {
    return (
      <Select
        key={selectedOption?.value}
        onValueChange={field.onChange}
        value={field.value}
        defaultValue={field.value}
        disabled={schema.disabled}
      >
        <SelectTrigger
          className={cn(
            "w-full px-0 py-0 h-auto min-h-0 bg-transparent border-none shadow-none focus:ring-0 focus:outline-none text-inherit",
            schema.className
          )}
          style={{ boxShadow: "none", background: "none", border: "none" }}
        >
          {isLoading && isInitialLoad ? (
            <div className="flex items-center gap-2">
              <Loader2Icon className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            <SelectValue
              placeholder={
                typeof schema.placeholder === "string" ? schema.placeholder : ""
              }
            >
              {selectedOption && (
                <div className="flex items-center gap-2">
                  {selectedOption.icon &&
                    (typeof selectedOption.icon === "string" ? (
                      <img
                        src={selectedOption.icon}
                        alt={
                          selectedOption.label ||
                          formatToTitleCase(selectedOption.value.toString())
                        }
                        className="w-5 h-5 object-contain"
                      />
                    ) : (
                      selectedOption.icon
                    ))}
                  {selectedOption.label}
                </div>
              )}
            </SelectValue>
          )}
        </SelectTrigger>
        <SelectContent>
          {isLoading && !isInitialLoad ? (
            <div className="flex items-center justify-center p-4 ">
              <Loader size="xs" />
            </div>
          ) : (
            options
              ?.filter((option) => option.value.toString().trim() !== "")
              .map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  <div className="flex items-center gap-2">
                    {option.icon &&
                      (typeof option.icon === "string" ? (
                        <img
                          src={option.icon}
                          alt={option.label || option.value.toString()}
                          className="w-5 h-5 object-contain"
                        />
                      ) : (
                        option.icon
                      ))}
                    {schema.renderSelectItem
                      ? schema.renderSelectItem(
                          option,
                          options || [],
                          options?.find((opt) => opt.value === field.value) ||
                            option
                        )
                      : option.label}
                  </div>
                </SelectItem>
              ))
          )}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Select
      key={selectedOption?.value}
      onValueChange={field.onChange}
      value={field.value}
      defaultValue={field.value}
      disabled={schema.disabled}
    >
      <SelectTrigger className={cn("w-full")}>
        {isLoading && isInitialLoad ? (
          <div className="flex items-center gap-2">
            <Loader2Icon className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </div>
        ) : (
          <SelectValue
            placeholder={
              typeof schema.placeholder === "string" ? schema.placeholder : ""
            }
          >
            {selectedOption && (
              <div className="flex items-center gap-2">
                {selectedOption.icon &&
                  (typeof selectedOption.icon === "string" ? (
                    <img
                      src={selectedOption.icon}
                      alt={
                        selectedOption.label ||
                        formatToTitleCase(selectedOption.value.toString())
                      }
                      className="w-5 h-5 object-contain"
                    />
                  ) : (
                    selectedOption.icon
                  ))}
                {selectedOption.label}
              </div>
            )}
          </SelectValue>
        )}
      </SelectTrigger>
      <SelectContent>
        {isLoading && !isInitialLoad ? (
          <div className="flex items-center justify-center p-4 ">
            <Loader size="xs" />
          </div>
        ) : (
          options
            ?.filter((option) => option.value.toString().trim() !== "")
            .map((option) => (
              <SelectItem key={option.value} value={String(option.value)}>
                <div className="flex items-center gap-2">
                  {option.icon &&
                    (typeof option.icon === "string" ? (
                      <img
                        src={option.icon}
                        alt={option.label || option.value.toString()}
                        className="w-5 h-5 object-contain"
                      />
                    ) : (
                      option.icon
                    ))}
                  {schema.renderSelectItem
                    ? schema.renderSelectItem(
                        option,
                        options || [],
                        options?.find((opt) => opt.value === field.value) ||
                          option
                      )
                    : option.label}
                </div>
              </SelectItem>
            ))
        )}
      </SelectContent>
    </Select>
  );
};
