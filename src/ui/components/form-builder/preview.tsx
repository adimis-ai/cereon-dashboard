import type { FormFieldOrGroup } from "../data-form/interface";
import { FormComponent } from "../data-form/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../card";
import { generateValidationSchema } from "./validation";

interface FormPreviewProps {
  schema: FormFieldOrGroup[];
  renderPreview?: (schema: FormFieldOrGroup[]) => React.ReactNode;
}

export function FormPreview({ schema, renderPreview }: FormPreviewProps) {
  return renderPreview ? (
    renderPreview(schema)
  ) : (
    <Card className="py-6">
      <CardHeader>
        <CardTitle>Preview</CardTitle>
        <CardDescription className="text-muted-foreground text-sm max-w-md">
          This is how the form will look like when rendered, for the user, make
          sure that the form is user friendly and easy for the user to fill out.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormComponent
          formFields={schema}
          validationSchema={generateValidationSchema(schema)}
          hideSubmitButton
        />
      </CardContent>
    </Card>
  );
}
