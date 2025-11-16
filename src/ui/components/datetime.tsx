"use client";

import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
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

export interface DateTimePickerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Initial date value */
  initialDate?: Date;
  /** Callback function when date changes */
  onDateChange?: (date: Date | undefined) => void;
  /** Custom date format string (default: 'MM/dd/yyyy HH:mm') */
  dateFormat?: string;
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
  /** Minute step interval (default: 5) */
  minuteStep?: number;
  /** Whether to show 24-hour format (default: true) */
  is24Hour?: boolean;
}

export function DateTimePicker({
  initialDate,
  onDateChange,
  dateFormat = "MM/dd/yyyy HH:mm",
  placeholder = "MM/DD/YYYY HH:mm",
  buttonClassName,
  calendarClassName,
  popoverContentClassName,
  disabled = false,
  minHour = 0,
  maxHour = 23,
  minuteStep = 5,
  is24Hour = true,
  className,
  ...props
}: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(initialDate);
  const [isOpen, setIsOpen] = React.useState(false);

  const hours = Array.from(
    { length: maxHour - minHour + 1 },
    (_, i) => i + minHour
  );
  const minutes = Array.from(
    { length: Math.floor(60 / minuteStep) },
    (_, i) => i * minuteStep
  );

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const newDate = date ? new Date(date) : new Date();
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setDate(newDate);
      onDateChange?.(newDate);
    }
  };

  const handleTimeChange = (type: "hour" | "minute", value: string) => {
    if (!date) {
      const newDate = new Date();
      if (type === "hour") {
        newDate.setHours(parseInt(value));
      } else {
        newDate.setMinutes(parseInt(value));
      }
      setDate(newDate);
      onDateChange?.(newDate);
    } else {
      const newDate = new Date(date);
      if (type === "hour") {
        newDate.setHours(parseInt(value));
      } else {
        newDate.setMinutes(parseInt(value));
      }
      setDate(newDate);
      onDateChange?.(newDate);
    }
  };

  const formatDisplayDate = (date: Date | undefined) => {
    if (!date) return placeholder;
    return format(date, dateFormat);
  };

  return (
    <div className={className} {...props}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              buttonClassName
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDisplayDate(date)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn("w-auto p-0", popoverContentClassName)}>
          <div className="sm:flex">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              initialFocus
              className={calendarClassName}
            />
            <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
              <ScrollArea className="w-64 sm:w-auto">
                <div className="flex sm:flex-col p-2">
                  {hours.reverse().map((hour) => (
                    <Button
                      key={hour}
                      size="icon"
                      variant={
                        date && date.getHours() === hour ? "default" : "ghost"
                      }
                      className="sm:w-full shrink-0 aspect-square"
                      onClick={() => handleTimeChange("hour", hour.toString())}
                    >
                      {is24Hour
                        ? hour.toString().padStart(2, "0")
                        : (hour % 12 || 12) + (hour >= 12 ? " PM" : " AM")}
                    </Button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="sm:hidden" />
              </ScrollArea>
              <ScrollArea className="w-64 sm:w-auto">
                <div className="flex sm:flex-col p-2">
                  {minutes.map((minute) => (
                    <Button
                      key={minute}
                      size="icon"
                      variant={
                        date && date.getMinutes() === minute
                          ? "default"
                          : "ghost"
                      }
                      className="sm:w-full shrink-0 aspect-square"
                      onClick={() =>
                        handleTimeChange("minute", minute.toString())
                      }
                    >
                      {minute.toString().padStart(2, "0")}
                    </Button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="sm:hidden" />
              </ScrollArea>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
