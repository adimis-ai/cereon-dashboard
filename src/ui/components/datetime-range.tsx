"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "../lib/index";
import { Button } from "./button";
import { Calendar } from "./calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";
import { ScrollArea, ScrollBar } from "./scroll-area";
import { DateRange } from "react-day-picker";

export interface DateTimeRange {
  from?: Date;
  to?: Date;
}

export interface DateTimePickerWithRangeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Current date time range value */
  value?: DateTimeRange;
  /** Callback function when date time range changes */
  onDateTimeRangeChange?: (range: DateTimeRange | undefined) => void;
  /** Custom date format string */
  dateFormat?: string;
  /** Number of months to display in calendar */
  numberOfMonths?: number;
  /** Placeholder text when no date is selected */
  placeholder?: string;
  /** Custom button class name */
  buttonClassName?: string;
  /** Custom calendar class name */
  calendarClassName?: string;
  /** Custom popover content class name */
  popoverContentClassName?: string;
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Minimum selectable hour (0-23) */
  minHour?: number;
  /** Maximum selectable hour (0-23) */
  maxHour?: number;
  /** Minute step interval */
  minuteStep?: number;
  /** Whether to show 24-hour format */
  is24Hour?: boolean;
  /** Whether to align popover to start */
  alignStart?: boolean;
}

export function DateTimePickerWithRange({
  className,
  value,
  onDateTimeRangeChange,
  dateFormat = "MMM dd, yyyy HH:mm",
  numberOfMonths = 2,
  placeholder = "Select date and time range",
  buttonClassName,
  calendarClassName,
  popoverContentClassName,
  disabled = false,
  minHour = 0,
  maxHour = 23,
  minuteStep = 5,
  is24Hour = true,
  alignStart = true,
  ...props
}: DateTimePickerWithRangeProps) {
  const hours = React.useMemo(
    () => Array.from({ length: maxHour - minHour + 1 }, (_, i) => i + minHour),
    [maxHour, minHour]
  );

  const minutes = React.useMemo(
    () =>
      Array.from(
        { length: Math.floor(60 / minuteStep) },
        (_, i) => i * minuteStep
      ),
    [minuteStep]
  );

  const handleDateSelect = (range: DateRange | undefined) => {
    if (!range) {
      onDateTimeRangeChange?.(undefined);
      return;
    }

    const newRange: DateTimeRange = {
      from: range.from ? new Date(range.from) : undefined,
      to: range.to ? new Date(range.to) : undefined,
    };

    if (value?.from && newRange.from) {
      newRange.from.setHours(value.from.getHours());
      newRange.from.setMinutes(value.from.getMinutes());
    }
    if (value?.to && newRange.to) {
      newRange.to.setHours(value.to.getHours());
      newRange.to.setMinutes(value.to.getMinutes());
    }

    onDateTimeRangeChange?.(newRange);
  };

  const handleTimeChange = (
    type: "from" | "to",
    timeType: "hour" | "minute",
    timeValue: number
  ) => {
    if (!value?.[type]) return;

    const newRange = {
      from: value.from ? new Date(value.from) : undefined,
      to: value.to ? new Date(value.to) : undefined,
    };

    if (newRange[type]) {
      if (timeType === "hour") {
        newRange[type]?.setHours(timeValue);
      } else {
        newRange[type]?.setMinutes(timeValue);
      }
    }

    onDateTimeRangeChange?.(newRange);
  };

  const formatDateTimeRange = (range: DateTimeRange | undefined) => {
    if (!range?.from) return placeholder;
    if (!range.to) return format(range.from, dateFormat);
    return `${format(range.from, dateFormat)} - ${format(range.to, dateFormat)}`;
  };

  const TimePickerSection = ({ type }: { type: "from" | "to" }) => (
    <div className="flex flex-col gap-2 p-3 flex-1">
      <div className="text-sm font-medium text-primary/70">
        {type === "from" ? "Start Time" : "End Time"}
      </div>
      <div className="flex gap-2">
        <ScrollArea className="h-[200px] w-[100px] rounded-lg">
          <div className="flex flex-col">
            {hours.map((hour) => (
              <Button
                key={hour}
                variant={
                  value?.[type]?.getHours() === hour ? "default" : "ghost"
                }
                className={cn(
                  "rounded-none transition-colors",
                  value?.[type]?.getHours() === hour
                    ? "bg-primary/20 text-primary hover:bg-primary/30"
                    : "hover:bg-muted/50"
                )}
                onClick={() => handleTimeChange(type, "hour", hour)}
              >
                {is24Hour
                  ? hour.toString().padStart(2, "0")
                  : (hour % 12 || 12) + (hour >= 12 ? " PM" : " AM")}
              </Button>
            ))}
          </div>
          <ScrollBar className="w-2 bg-muted/20" />
        </ScrollArea>
        <ScrollArea className="h-[200px] w-[100px] rounded-lg">
          <div className="flex flex-col">
            {minutes.map((minute) => (
              <Button
                key={minute}
                variant={
                  value?.[type]?.getMinutes() === minute ? "default" : "ghost"
                }
                className={cn(
                  "rounded-none transition-colors",
                  value?.[type]?.getMinutes() === minute
                    ? "bg-primary/20 text-primary hover:bg-primary/30"
                    : "hover:bg-muted/50"
                )}
                onClick={() => handleTimeChange(type, "minute", minute)}
              >
                {minute.toString().padStart(2, "0")}
              </Button>
            ))}
          </div>
          <ScrollBar className="w-2 bg-muted/20" />
        </ScrollArea>
      </div>
    </div>
  );

  return (
    <div className={cn("grid gap-2", className)} {...props}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="datetime-range"
            variant="outline"
            className={cn(
              "w-[350px] justify-start text-left font-normal rounded-xl border-border/50 hover:border-primary/50 transition-all",
              !value && "text-muted-foreground",
              buttonClassName
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-primary/70" />
            {formatDateTimeRange(value)}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            "w-auto p-0 rounded-xl border-border/50 shadow-lg backdrop-blur-sm bg-background/95",
            popoverContentClassName
          )}
          align={alignStart ? "start" : "center"}
        >
          <div className="flex flex-col">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={value?.from}
              selected={{
                from: value?.from ?? undefined,
                to: value?.to ?? undefined,
              }}
              onSelect={handleDateSelect}
              numberOfMonths={numberOfMonths}
              className={cn("rounded-t-xl bg-transparent", calendarClassName)}
            />
            <div className="flex border-t border-border/50 bg-muted/20">
              <TimePickerSection type="from" />
              <div className="w-px bg-border/50" />
              <TimePickerSection type="to" />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
