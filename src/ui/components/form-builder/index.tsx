"use client";

import * as React from "react";
import { FormBuilder } from "./builder";
import { FormPreview } from "./preview";
import type { FormFieldOrGroup } from "../data-form/interface";
import { cn } from "../../lib/index";

export function FormBuilderComponent({
  title,
  onChange,
  onSubmit,
  renderPreview,
  initialSchema,
  className,
  disableCreateDelete,
}: {
  title: string;
  className?: string;
  initialSchema?: FormFieldOrGroup[];
  onChange?: (schema: FormFieldOrGroup[]) => void;
  renderPreview?: (schema: FormFieldOrGroup[]) => React.ReactNode;
  onSubmit?: (schema: FormFieldOrGroup[]) => void | Promise<void>;
  disableCreateDelete?: boolean;
}) {
  const [schema, setSchema] = React.useState<FormFieldOrGroup[]>([]);

  React.useEffect(() => {
    if (initialSchema && schema.length === 0 && initialSchema.length > 0) {
      setSchema(initialSchema);
    }
  }, [initialSchema]);

  return (
    <div className={cn("container mx-auto grid grid-cols-10 gap-2", className)}>
      <div className="col-span-6">
        <FormBuilder
          title={title}
          onSubmit={onSubmit}
          initialSchema={schema}
          disableCreateDelete={disableCreateDelete}
          onChange={(schema) => {
            setSchema(schema);
            onChange?.(schema);
          }}
        />
      </div>
      <div className="col-span-4">
        <FormPreview schema={schema} renderPreview={renderPreview} />
      </div>
    </div>
  );
}
