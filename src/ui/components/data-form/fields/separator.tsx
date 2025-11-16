import { FormFieldSchema } from "../interface";
import { ControllerRenderProps, FieldValues } from "react-hook-form";
import { ReactNode } from "react";

interface CheckboxFieldProps {
  schema: FormFieldSchema & {
    icon?: string | ReactNode;
  };
  field: ControllerRenderProps<FieldValues, string>;
}

export function SeparatorField({ schema }: CheckboxFieldProps) {
  const renderIcon = () => {
    if (!schema.icon) return null;

    if (typeof schema.icon === "string") {
      return <img src={schema.icon} alt="" className="size-8 mr-3" />;
    }

    return <div className="mr-3">{schema.icon}</div>;
  };

  return (
    <div className="relative my-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center">
          {(schema.icon || schema.label) && (
            <div className="flex items-center">
              {renderIcon()}
              <div className="text-sm font-semibold text-foreground">
                {schema.label && (
                  <span className="text-sm font-bold pr-2 text-accent-foreground uppercase">
                    {schema.label}
                  </span>
                )}
                {schema.description && (
                  <p className="text-sm text-muted-foreground">
                    {schema.description}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        <span className="w-full border-t border-border mt-1" />
      </div>
    </div>
  );
}
