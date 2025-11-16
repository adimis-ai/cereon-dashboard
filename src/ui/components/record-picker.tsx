import { Plus, X } from "lucide-react";
import { memo, ReactNode, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "../lib/utils";
import { Button } from "./button";
import { Input } from "./input";
import { Slider } from "./slider";
import { ScrollArea } from "./scroll-area";
import { Alert, AlertDescription } from "./alert";

interface RecordPickerProps {
  value?: Record<string, string | number>[];
  onChange: (value: Record<string, string | number>[]) => void;
  disabled?: boolean;
  disableKey?: boolean;
  disableAddDelete?: boolean;
  placeholder?: {
    key?: string;
    value?: string;
  };
  maxItems?: number;
  className?: string;
  valueType?: "string" | "number";
  minIntValue?: number;
  maxIntValue?: number;
  sliderStep?: number;
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
}

const RecordItem = memo(
  ({
    item,
    index,
    disabled,
    disableKey,
    placeholder,
    onRemove,
    onChange,
    valueType = "string",
    minIntValue,
    maxIntValue,
    sliderStep,
    renderSliderFooter,
    renderSliderHeader,
  }: {
    item: Record<string, string | number>;
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
    index: number;
    disabled?: boolean;
    disableKey?: boolean;
    placeholder: { key?: string; value?: string };
    onRemove: (index: number) => void;
    onChange: (
      index: number,
      field: "key" | "value",
      value: string | number
    ) => void;
    valueType?: "string" | "number";
    minIntValue?: number;
    maxIntValue?: number;
    sliderStep?: number;
  }) => {
    const key = Object.keys(item)[0] ?? "";
    const [localKey, setLocalKey] = useState(key);
    const [localValue, setLocalValue] = useState(
      key ? String(item[key] || "") : ""
    );

    useEffect(() => {
      const timer = setTimeout(() => {
        if (localKey !== key) {
          onChange(index, "key", localKey);
        }
      }, 300);
      return () => clearTimeout(timer);
    }, [localKey, key, index, onChange]);

    useEffect(() => {
      const timer = setTimeout(() => {
        if (localValue !== String(key ? item[key] || "" : "")) {
          const processedValue =
            valueType === "number"
              ? localValue === ""
                ? ""
                : Number(localValue)
              : localValue;
          onChange(index, "value", processedValue);
        }
      }, 300);
      return () => clearTimeout(timer);
    }, [localValue, key, item, index, onChange, valueType]);

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (valueType === "number") {
        if (newValue === "" || /^\d*\.?\d*$/.test(newValue)) {
          setLocalValue(newValue);
        }
      } else {
        setLocalValue(newValue);
      }
    };

    const handleSliderChange = (value: number[]) => {
      setLocalValue(String(value[0]));
    };

    const renderSlider =
      valueType === "number" &&
      typeof maxIntValue === "number" &&
      typeof minIntValue === "number" &&
      typeof sliderStep === "number";

    return (
      <div className={cn(index > 0 && "mt-2", "flex items-center gap-1 group")}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2 w-full"
        >
          <div className="flex items-center gap-2 w-full">
            <div className={cn("w-[140px]", renderSlider && "flex-1", "shrink-0")}>
              <Input
                value={localKey}
                onChange={(e) => setLocalKey(e.target.value)}
                placeholder={placeholder.key}
                disabled={disabled || disableKey}
                className={cn(renderSlider ? "h-12" : "h-9")}
              />
            </div>
            {renderSlider ? (
              <div className="flex-1 min-w-0 space-y-3">
                {renderSliderHeader?.(
                    Number(localValue),
                    minIntValue,
                    maxIntValue,
                    sliderStep ?? 0.01
                )}
                <Slider
                  value={[Number(localValue) || minIntValue]}
                  onValueChange={handleSliderChange}
                  min={minIntValue}
                  max={maxIntValue}
                  step={sliderStep}
                  disabled={disabled}
                  className="mt-3"
                />
                {renderSliderFooter ? (
                  renderSliderFooter(
                    Number(localValue),
                    minIntValue,
                    maxIntValue,
                    sliderStep ?? 0.01
                  )
                ) : (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex flex-row gap-1 items-center">
                      <span className="text-muted-foreground">Min</span>
                      <span className="font-medium">{minIntValue}</span>
                    </div>
                    <div className="flex flex-row gap-1 items-center">
                      <span className="text-muted-foreground">Current</span>
                      <span className="font-medium text-primary">
                        {Number(localValue) || minIntValue}
                      </span>
                    </div>
                    <div className="flex flex-row gap-1 items-center">
                      <span className="text-muted-foreground">Max</span>
                      <span className="font-medium">{maxIntValue}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Input
                value={localValue}
                onChange={handleValueChange}
                type={valueType === "number" ? "number" : "text"}
                placeholder={placeholder.value}
                disabled={disabled}
                className="h-9 flex-1"
              />
            )}
            <Button
              type="button"
              variant="outline"
              size="smallCircle"
              onClick={() => onRemove(index)}
              disabled={disabled}
              className={cn("opacity-100 hover:bg-destructive hover:text-destructive-foreground shrink-0", renderSlider && "ml-2" )}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }
);

RecordItem.displayName = "RecordItem";

export function RecordPicker({
  value = [],
  onChange,
  disabled = false,
  disableKey = false,
  disableAddDelete = false,
  placeholder = { key: "Enter key", value: "Enter value" },
  maxItems,
  className,
  valueType = "string",
  maxIntValue,
  minIntValue,
  sliderStep,
  renderSliderFooter,
  renderSliderHeader,
}: RecordPickerProps) {
  const handleAdd = () => {
    if (maxItems && value.length >= maxItems) return;
    onChange([...value, { "": "" }]);
  };

  const handleRemove = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  const handleRemoveAll = () => {
    onChange([]);
  };

  const handleChange = (
    index: number,
    field: "key" | "value",
    newValue: string | number
  ) => {
    const newArray = [...value];
    const entry = { ...newArray[index] };

    if (field === "key") {
      const oldKey = Object.keys(entry)[0] || "";
      const oldValue = entry[oldKey];
      delete entry[oldKey];
      entry[newValue as string] = oldValue ?? "";
    } else {
      const key = Object.keys(entry)[0] || "";
      entry[key] = newValue;
    }

    newArray[index] = entry;
    onChange(newArray);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <ScrollArea className={cn("pr-4 pb-4", value.length > 0 && "h-[250px]")}>
        <AnimatePresence mode="popLayout">
          {value.length > 0 ? (
            value.map((item, index) => (
              <RecordItem
                key={index}
                item={item}
                index={index}
                disabled={disabled}
                disableKey={disableKey}
                placeholder={placeholder}
                onRemove={handleRemove}
                onChange={handleChange}
                valueType={valueType}
                maxIntValue={maxIntValue}
                minIntValue={minIntValue}
                sliderStep={sliderStep}
                renderSliderFooter={renderSliderFooter}
                renderSliderHeader={renderSliderHeader}
              />
            ))
          ) : (
            <div className="flex items-center justify-center">
              <Alert variant="default" className="bg-muted/50 mt-2">
                <AlertDescription>
                  No Records added yet, Please add one.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </AnimatePresence>
      </ScrollArea>
      {!disableAddDelete && (
        <div className="flex items-center justify-start gap-2">
          {value.length > 0 && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemoveAll}
              disabled={disabled}
              className="max-w-sm"
            >
              <X className="h-4 w-4 mr-2" />
              Remove All Records
            </Button>
          )}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAdd}
            disabled={disabled || (maxItems ? value.length >= maxItems : false)}
            className="max-w-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </Button>
        </div>
      )}
    </div>
  );
}
