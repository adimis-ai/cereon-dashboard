"use client";

import type { Column } from "@tanstack/react-table";
import { Check, PlusCircle } from "lucide-react";

import { cn } from "../../lib/index";
import { Badge } from "../badge";
import { Button } from "../button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../command";
import { Option } from "../data-form/interface";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { Separator } from "../separator";
import { useState } from "react";
import { formatToTitleCase } from "../../lib/index";

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: Option[];
  singleSelect?: boolean;
  value?: string | string[] | undefined;
  onSelect?: (
    value: string | Array<string | number> | number | undefined
  ) => void | Promise<void>;
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
  value,
  singleSelect = true,
  onSelect,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const unknownValue = column?.getFilterValue() || value;

  const selectedValues = new Set(
    Array.isArray(unknownValue) ? unknownValue : []
  );
  const [singleSelectedOption, setSingleSelectedOption] = useState<
    string | number | null
  >(unknownValue as string);

  const handleSelect = async (option: Option, isSelected: boolean) => {
    let filterValue: string | Array<string | number> | undefined;
    const selectedOption = options.find((o) => o.value === option.value);

    if (!selectedOption) {
      return;
    }

    if (singleSelect) {
      filterValue = isSelected ? undefined : [selectedOption.value];
      column?.setFilterValue(filterValue);
      if (!isSelected) {
        setSingleSelectedOption(selectedOption.value);
      } else {
        setSingleSelectedOption(null);
      }
    } else {
      if (isSelected) {
        selectedValues.delete(selectedOption.value);
      } else {
        selectedValues.add(selectedOption.value);
      }
      filterValue = Array.from(selectedValues);
      column?.setFilterValue(filterValue.length ? filterValue : undefined);
    }

    if (onSelect) {
      await onSelect(filterValue);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle className="mr-2 size-4" />
          {title}
          {selectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              {singleSelect ? (
                <Badge
                  variant="secondary"
                  className="rounded-sm px-1 font-normal"
                >
                  {formatToTitleCase(String(singleSelectedOption) || "")}
                </Badge>
              ) : (
                <>
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal lg:hidden"
                  >
                    {selectedValues.size}
                  </Badge>
                  <div className="hidden space-x-1 lg:flex">
                    {selectedValues.size > 2 ? (
                      <Badge
                        variant="secondary"
                        className="rounded-sm px-1 font-normal"
                      >
                        {selectedValues.size} selected
                      </Badge>
                    ) : (
                      options
                        .filter((option) => selectedValues.has(option.value))
                        .map((option) => (
                          <Badge
                            variant="secondary"
                            key={option.value}
                            className="rounded-sm px-1 font-normal"
                          >
                            {option.label}
                          </Badge>
                        ))
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[12.5rem] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList className="max-h-full">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup className="max-h-[18.75rem] overflow-y-auto overflow-x-hidden">
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);

                return (
                  <CommandItem
                    key={option.value}
                    onSelect={async () => {
                      return await handleSelect(option, isSelected);
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex size-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className="size-4" aria-hidden="true" />
                    </div>
                    {option.icon && option.icon}
                    <span>{option.label}</span>
                    {option.count && (
                      <span className="ml-auto flex size-4 items-center justify-center font-mono text-xs">
                        {option.count}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={async () => {
                      column?.setFilterValue(undefined);
                      if (onSelect) {
                        await onSelect(undefined);
                      }
                    }}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
