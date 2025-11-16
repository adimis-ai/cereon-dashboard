import * as React from "react";
import { ControllerRenderProps, FieldValues } from "react-hook-form";
import { Badge } from "../../badge";
import { Input } from "../../input";
import { X } from "lucide-react";
import type { FormFieldSchema } from "../interface";

interface TagsInputFieldProps {
  schema: FormFieldSchema;
  field: ControllerRenderProps<FieldValues, any>;
}

export const TagsInputField = ({ schema, field }: TagsInputFieldProps) => {
  const [inputValue, setInputValue] = React.useState("");
  const [tags, setTags] = React.useState<string[]>([]);

  // Sync with field value changes
  React.useEffect(() => {
    if (Array.isArray(field.value)) {
      setTags(field.value);
    }
  }, [field.value]);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      const newTags = [...tags, trimmedTag];
      setTags(newTags);
      field.onChange(newTags);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    field.onChange(newTags);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag(inputValue);
          }
        }}
        onBlur={() => {
          if (inputValue) {
            addTag(inputValue);
          }
        }}
        placeholder={
          typeof schema.placeholder === "string"
            ? schema.placeholder
            : "Press Enter to add tags"
        }
      />
    </div>
  );
};
