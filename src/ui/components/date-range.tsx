"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "../lib/index";
import { Button } from "./button";
import { Calendar } from "./calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";

export interface DatePickerWithRangeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Initial date range */
  initialDateRange?: DateRange;
  /** Callback function when date range changes */
  onDateRangeChange?: (dateRange: DateRange | undefined) => void;
  /** Custom date format string (default: 'LLL dd, y') */
  dateFormat?: string;
  /** Number of months to display in calendar (default: 2) */
  numberOfMonths?: number;
  /** Placeholder text when no date is selected */
  placeholder?: string;
  /** Custom button class name */
  buttonClassName?: string;
  /** Custom calendar class name */
  calendarClassName?: string;
  /** Custom popover content class name */
  popoverContentClassName?: string;
  /** Whether the date picker is disabled */
  disabled?: boolean;
  /** Whether to align popover to start (default: true) */
  alignStart?: boolean;
}

export function DatePickerWithRange({
  className,
  initialDateRange,
  onDateRangeChange,
  dateFormat = "LLL dd, y",
  numberOfMonths = 2,
  placeholder = "Pick a date",
  buttonClassName,
  calendarClassName,
  popoverContentClassName,
  disabled = false,
  alignStart = true,
  ...props
}: DatePickerWithRangeProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(
    initialDateRange
  );

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
    onDateRangeChange?.(newDate);
  };

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) return placeholder;
    if (!range.to) return format(range.from, dateFormat);
    return `${format(range.from, dateFormat)} - ${format(range.to, dateFormat)}`;
  };

  return (
    <div className={cn("grid gap-2", className)} {...props}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground",
              buttonClassName
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange(date)}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn("w-auto p-0", popoverContentClassName)}
          align={alignStart ? "start" : "center"}
        >
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={numberOfMonths}
            className={calendarClassName}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
