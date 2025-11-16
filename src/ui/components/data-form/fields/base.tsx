import * as React from "react";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../form";
import { cn } from "../../../lib";
import type { FormFieldSchema } from "../interface";

interface BaseFieldLayoutProps {
  schema: FormFieldSchema;
  children: React.ReactNode;
  isCheckbox?: boolean;
  isPassword?: boolean;
  isLogo?: boolean;
  isEnvs?: boolean;
  isToggle?: boolean;
}

export const BaseFieldLayout = ({
  schema,
  children,
  isCheckbox = false,
  isPassword = false,
  isLogo = false,
  isToggle = false,
  isEnvs,
}: BaseFieldLayoutProps) => (
  <FormItem
    className={cn(
      isCheckbox && "flex flex-row items-start space-x-3 space-y-0"
    )}
  >
    {!isCheckbox &&
      !isPassword &&
      !isLogo &&
      !isEnvs &&
      !isToggle &&
      schema.variant !== "separator" &&
      !schema.disableLabelDescription && (
        <FormLabel>
          {schema.label}
          {schema.required && <span className="text-red-500">*</span>}
        </FormLabel>
      )}
    <FormControl>{children}</FormControl>
    {isCheckbox &&
      !isToggle &&
      !isLogo &&
      !isEnvs &&
      schema.variant !== "separator" &&
      !schema.disableLabelDescription && (
        <div className="space-y-1 leading-none">
          <FormLabel>
            {schema.label}
            {schema.required && <span className="text-red-500">*</span>}
          </FormLabel>
          {schema.description && (
            <FormDescription>{schema.description}</FormDescription>
          )}
        </div>
      )}
    {!isCheckbox &&
      !isLogo &&
      !isEnvs &&
      !isToggle &&
      schema.variant !== "separator" &&
      schema.description &&
      !schema.disableLabelDescription && (
        <FormDescription>{schema.description}</FormDescription>
      )}
    <FormMessage />
  </FormItem>
);
