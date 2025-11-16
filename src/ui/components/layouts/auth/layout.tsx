"use client";

import * as React from "react";
import { cn } from "../../../lib/index";
import { FormComponent } from "../../data-form/form";
import type { FormComponentProps } from "../../data-form/interface";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../card";
import { GalleryVerticalEnd } from "lucide-react";
import { z } from "zod";

type AuthLayoutBaseProps = {
  /** Title of the auth form */
  heading?: string;
  /** Optional subtitle for additional context */
  subheading?: string;
  /** Footer content below the form */
  footer?: React.ReactNode;
  /** Additional class names for the layout container */
  className?: string;
  /** Width of the form container */
  width?: string;
  /** Brand name displayed at the top of the auth form */
  brandName?: string;
  /** Logo component or image */
  logo?: React.ReactNode;
  /** Schema for form fields */
  schema?: any[];
  /** Class name for the form wrapper */
  formClassName?: string;
  /** Legal text shown at the bottom */
  legalText?: React.ReactNode;
};

type AuthLayoutWithFormProps<TSchema extends z.ZodType<any, any>> =
  AuthLayoutBaseProps &
    Omit<FormComponentProps<TSchema>, "className"> & {
      children?: never;
      loading?: boolean;
    };

type AuthLayoutWithChildrenProps = AuthLayoutBaseProps & {
  children: React.ReactNode;
  formFields?: never;
  onSubmit?: never;
  onInvalid?: never;
  onChange?: never;
  validationSchema?: never;
  defaultValues?: never;
  submitText?: never;
  submitClassName?: never;
  hideSubmitButton?: never;
  loading?: never;
};

export type AuthLayoutProps<TSchema extends z.ZodType<any, any>> =
  | AuthLayoutWithFormProps<TSchema>
  | AuthLayoutWithChildrenProps;

export function AuthLayout<TSchema extends z.ZodType<any, any>>({
  heading,
  subheading,
  formFields,
  children,
  footer,
  logo,
  className,
  formClassName,
  submitText = "Submit",
  submitClassName,
  hideSubmitButton,
  onSubmit,
  onInvalid,
  onChange,
  loading,
  defaultValues,
  legalText,
  validationSchema,
  width = "max-w-sm",
  brandName = "Cereon OS",
  schema,
}: AuthLayoutProps<TSchema>) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className={cn("flex w-full flex-col gap-2", width)}>
        <a href="/" className="flex items-center self-center font-medium">
          <img
            src={"/cereon.png"}
            alt="Cereon OS Logo"
            className={cn(
              "rounded-full object-contain border-none shadow-none",
              "size-10"
            )}
            style={{ background: "none" }}
          />
          <h1 className="text-xl font-bold">{brandName}</h1>
        </a>

        <div className={cn("flex flex-col gap-4", className)}>
          {children ?? (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{heading}</CardTitle>
                {subheading && <CardDescription>{subheading}</CardDescription>}
              </CardHeader>
              <CardContent>
                <FormComponent
                  className={formClassName}
                  formFields={schema || formFields || []}
                  onSubmit={onSubmit}
                  onInvalid={onInvalid}
                  onChange={onChange}
                  validationSchema={validationSchema}
                  defaultValues={defaultValues}
                  submitText={submitText}
                  submitClassName={submitClassName}
                  hideSubmitButton={hideSubmitButton}
                  loading={loading}
                />
              </CardContent>
              {footer && (
                <CardFooter>
                  <div className="w-full">{footer}</div>
                </CardFooter>
              )}
            </Card>
          )}
          {legalText && (
            <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
              {legalText}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
