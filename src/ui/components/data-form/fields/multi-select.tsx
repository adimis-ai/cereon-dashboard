import { ControllerRenderProps, FieldValues } from "react-hook-form";
import { useState, useEffect, useMemo, useCallback } from "react";
import type { FormFieldSchema } from "../interface";
import { useDebounce } from "../../../hooks/use-debounce";
import { Loader } from "../../loader";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "../../multi-select";

interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

interface MultiSelectFieldProps {
  schema: FormFieldSchema & {
    options?: SelectOption[];
    placeholder?: string;
    fetchOptions?: (
      limit: number,
      offset: number,
      search?: string
    ) => Promise<SelectOption[]>;
  };
  field: ControllerRenderProps<FieldValues, any>;
}

export const MultiSelectField = ({ schema, field }: MultiSelectFieldProps) => {
  const [fetchedOptions, setFetchedOptions] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchValue, setSearchValue] = useState("");

  const debouncedSearchValue = useDebounce(searchValue, 300);

  const LIMIT = 10;

  // Use static options if provided, otherwise use fetched options
  const options = useMemo(
    () => schema.options || fetchedOptions,
    [schema.options, fetchedOptions]
  );

  const fetchMoreOptions = useCallback(
    async (search?: string, resetOffset = false) => {
      if (!schema.fetchOptions || (!hasMore && !resetOffset)) return;

      const currentOffset = resetOffset ? 0 : offset;

      setIsLoading(true);
      try {
        const newOptions = await schema.fetchOptions(
          LIMIT,
          currentOffset,
          search
        );
        if (resetOffset) {
          setFetchedOptions(newOptions);
        } else {
          setFetchedOptions((prev) => [...prev, ...newOptions]);
        }
        setHasMore(newOptions.length === LIMIT);
        setOffset(currentOffset + newOptions.length);
      } finally {
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    },
    [schema.fetchOptions, offset, hasMore]
  );

  // Initial load
  useEffect(() => {
    if (schema.fetchOptions && !schema.options && isInitialLoad) {
      fetchMoreOptions();
    }
  }, [schema.fetchOptions, schema.options, isInitialLoad, fetchMoreOptions]);

  console.log("MultiSelectField options", options);

  // Get selected options with their labels
  const selectedOptions = useMemo(() => {
    const vals: any[] = field.value || [];
    return vals.map((value: any) => {
      const option = options.find((opt) => opt.value === value);
      return {
        value: String(value),
        label: option?.label || String(value),
      };
    });
  }, [field.value, options]);

  const handleValuesChange = (newValues: string[]) => {
    // Convert back to original type before updating form
    const convertedValues = newValues.map((val) => {
      const option = options.find((opt: SelectOption) => String(opt.value) === val);
      return option ? option.value : val;
    });
    field.onChange(convertedValues);
  };

  // Effect to handle debounced search
  useEffect(() => {
    if (schema.fetchOptions) {
      setOffset(0);
      setHasMore(true);
      fetchMoreOptions(debouncedSearchValue, true);
    }
  }, [debouncedSearchValue]);

  return (
    <MultiSelector
      values={selectedOptions.map((opt) => opt.value)}
      onValuesChange={handleValuesChange}
      className="w-full"
    >
      <MultiSelectorTrigger className="w-full" options={options}>
        {isLoading && isInitialLoad ? (
          <div className="flex items-center justify-center p-2">
            <Loader size="xs" variant="simple" />
          </div>
        ) : (
          <MultiSelectorInput
            placeholder={schema.placeholder || "Select options..."}
            value={searchValue}
            onValueChange={setSearchValue}
          />
        )}
      </MultiSelectorTrigger>
      <MultiSelectorContent>
        <MultiSelectorList
          onScroll={(e) => {
            const element = e.currentTarget;
            if (
              !isLoading &&
              hasMore &&
              element.scrollTop + element.clientHeight >=
                element.scrollHeight - 20
            ) {
              fetchMoreOptions(debouncedSearchValue);
            }
          }}
        >
          {options.map((option) => (
            <MultiSelectorItem
              key={option.value}
              value={String(option.value)}
              disabled={schema.disabled}
            >
              {option.label}
            </MultiSelectorItem>
          ))}
          {isLoading && !isInitialLoad && (
            <div className="flex items-center justify-center p-2">
              <Loader size="xs" variant="simple" className="mr-2" />
              <span className="text-sm text-muted-foreground">
                Loading more...
              </span>
            </div>
          )}
          {!isLoading && !hasMore && options.length > 0 && (
            <div className="p-2 text-center text-sm text-muted-foreground">
              No more options
            </div>
          )}
          {!isLoading && options.length === 0 && (
            <div className="p-2 text-center text-sm text-muted-foreground">
              No options found
            </div>
          )}
        </MultiSelectorList>
      </MultiSelectorContent>
    </MultiSelector>
  );
};
