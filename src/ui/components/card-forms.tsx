import { FormComponentProps } from "./data-form/interface";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { Alert, AlertDescription } from "./alert";
import { cn } from "../lib";
import { z } from "zod";
import { FormComponent } from "./data-form/form";
import { FieldErrors } from "react-hook-form";

type FormItem = {
  title: string;
  description?: string;
  form: FormComponentProps<z.ZodType<any, any>>;
  className?: string;
  errors?: FieldErrors<any>;
};

export interface CardFormsProps {
  forms: FormItem[];
  columns?: {
    large: number;
    medium: number;
    small: number;
  };
  className?: string;
}

export function CardForms({
  forms,
  columns = {
    large: 3,
    medium: 2,
    small: 1,
  },
  className,
}: CardFormsProps) {
  return (
    <div
      className={cn(
        "grid gap-6",
        `grid-cols-${columns.small}`,
        `sm:grid-cols-${columns.medium}`,
        `lg:grid-cols-${columns.large}`,
        className
      )}
    >
      {forms.map((formItem, index) => (
        <Card key={index} className={cn(formItem.className)}>
          <CardHeader>
            <CardTitle>{formItem.title}</CardTitle>
            {formItem.description && (
              <CardDescription>{formItem.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {formItem.errors && Object.keys(formItem.errors).length > 0 && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  <ul className="list-disc pl-4">
                    {Object.entries(formItem.errors).map(([field, error]) => (
                      <li key={field}>{error?.message as string}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            <FormComponent<z.ZodType<any, any>> {...formItem.form} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
