import * as React from "react";
import type { FormFieldSchema } from "../interface";
import { Control, FieldValues, UseFormReturn } from "react-hook-form";
import clsx from "clsx";

export interface FieldWrapperProps {
  schema: FormFieldSchema;
  children: React.ReactNode;
  form: UseFormReturn<FieldValues, any, FieldValues>;
}

export const FieldWrapper = ({ schema, children, form }: FieldWrapperProps) => {
  const hasTopComponents =
    schema.components?.top ||
    schema.components?.topLeft ||
    schema.components?.topRight;

  const hasBottomComponents =
    schema.components?.bottom ||
    schema.components?.bottomLeft ||
    schema.components?.bottomRight;

  const renderComponent = (Component: any) => {
    if (!Component) return null;
    if (typeof Component === "function") {
      return (
        <Component schema={schema} form={form}>
          {children}
        </Component>
      );
    }
    return Component;
  };

  const renderTop = () => {
    if (!hasTopComponents) return null;

    return (
      <div className="flex items-center justify-between mb-2 gap-2">
        {schema.components?.topLeft && (
          <div className="flex-shrink-0">
            {renderComponent(schema.components.topLeft)}
          </div>
        )}
        {schema.components?.top && (
          <div className="flex-grow">
            {renderComponent(schema.components.top)}
          </div>
        )}
        {schema.variant !== "password" && schema.components?.topRight && (
          <div className="flex-shrink-0">
            {renderComponent(schema.components.topRight)}
          </div>
        )}
      </div>
    );
  };

  const renderBottom = () => {
    if (!hasBottomComponents) return null;

    return (
      <div className="flex items-center justify-between mt-2 gap-2">
        {schema.components?.bottomLeft && (
          <div className="flex-shrink-0">
            {renderComponent(schema.components.bottomLeft)}
          </div>
        )}
        {schema.components?.bottom && (
          <div className="flex-grow">
            {renderComponent(schema.components.bottom)}
          </div>
        )}
        {schema.components?.bottomRight && (
          <div className="flex-shrink-0">
            {renderComponent(schema.components.bottomRight)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={clsx("relative", schema.className)}>
      {renderTop()}
      {children}
      {renderBottom()}
    </div>
  );
};
