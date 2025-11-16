import { Button } from "../button";
import { Card } from "../card";
import {
  Condition,
  Operator,
  FormFieldSchema,
} from "../data-form/interface";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../select";
import { Input } from "../input";
import { PlusCircle, Trash } from "lucide-react";
import { Switch } from "../switch";
import React from "react";

interface ConditionEditorProps {
  conditions: Condition[];
  onChange: (conditions: Condition[]) => void;
  availableFields: FormFieldSchema[];
}

const ALL_OPERATORS: Operator[] = [
  "equals",
  "not_equals",
  "strict_equals",
  "not_strict_equals",
  "greater_than",
  "greater_than_or_equals",
  "less_than",
  "less_than_or_equals",
  "includes",
  "not_includes",
];

const OPERATOR_LABELS: Record<Operator, string> = {
  equals: "Equals",
  not_equals: "Not Equals",
  greater_than: "Greater Than",
  greater_than_or_equals: "Greater Than or Equals",
  less_than: "Less Than",
  less_than_or_equals: "Less Than or Equals",
  includes: "Includes",
  not_includes: "Not Includes",
  strict_equals: "Strictly Equals",
  not_strict_equals: "Strictly Not Equals",
};

const ConditionValueInput = ({
  field,
  value,
  onChange,
}: {
  field: FormFieldSchema;
  value: any;
  onChange: (value: any) => void;
}) => {
  switch (field.variant) {
    case "checkbox":
    case "toggle":
      return <Switch checked={value === true} onCheckedChange={onChange} className="size-8"/>;

    case "select":
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger size="sm">
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem
                key={option.value.toString()}
                value={option.value.toString()}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "number":
    case "slider":
      return (
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={field.min}
          max={field.max}
          step={field.step}
          className="h-8"
        />
      );

    default:
      return (
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter value"
          className="h-8"
        />
      );
  }
};

export function ConditionEditor({
  conditions = [],
  onChange,
  availableFields,
}: ConditionEditorProps) {
  const addCondition = () => {
    const newCondition: Condition = {
      field: availableFields[0]?.name || "",
      operator: "equals",
      value: "",
      relation: conditions.length > 0 ? "and" : undefined,
    };

    onChange([...conditions, newCondition]);
  };

  const updateCondition = (index: number, updates: Partial<Condition>) => {
    const updatedConditions = [...conditions];
    const currentCondition = updatedConditions[index];

    if (!currentCondition) return;

    const updatedCondition: Condition = {
      field: updates.field ?? currentCondition.field,
      operator: updates.operator ?? currentCondition.operator,
      value: "value" in updates ? updates.value : currentCondition.value,
      relation: updates.relation ?? currentCondition.relation,
    };

    if ("field" in updates) {
      updatedCondition.value = "";
    }

    updatedConditions[index] = updatedCondition;
    onChange(updatedConditions);
  };

  const removeCondition = (index: number) => {
    onChange(conditions.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {" "}
      {/* Reduced space-y from 4 to 2 */}
      <div className="rounded-md border">
        <table className="w-full text-xs">
          {" "}
          {/* Added text-xs for smaller text */}
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-1 text-left">Relation</th>{" "}
              {/* Reduced padding from p-2 to p-1 */}
              <th className="p-1 text-left">Field</th>
              <th className="p-1 text-left">Operator</th>
              <th className="p-1 text-left">Value</th>
              <th className="w-[40px] p-1"></th>{" "}
            </tr>
          </thead>
          <tbody>
            {conditions.map((condition, index) => {
              const targetField = availableFields.find(
                (f) => f.name === condition.field
              );

              return (
                <tr key={index} className="border-b">
                  <td className="p-1">
                    {index > 0 && (
                      <Select
                        value={condition.relation}
                        onValueChange={(value) =>
                          updateCondition(index, {
                            relation: value as "and" | "or",
                          })
                        }
                      >
                        <SelectTrigger className="w-[80px]" size="sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="and">AND</SelectItem>
                          <SelectItem value="or">OR</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </td>
                  <td className="p-1">
                    <Select
                      value={condition.field}
                      onValueChange={(value) =>
                        updateCondition(index, { field: value })
                      }
                    >
                      <SelectTrigger size="sm">
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableFields.map((field) => (
                          <SelectItem key={field.name} value={field.name}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-1">
                    <Select
                      value={condition.operator}
                      onValueChange={(value) =>
                        updateCondition(index, { operator: value as Operator })
                      }
                    >
                      <SelectTrigger size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ALL_OPERATORS.map((op) => (
                          <SelectItem key={op} value={op}>
                            {OPERATOR_LABELS[op]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-1">
                    {targetField && (
                      <ConditionValueInput
                        field={targetField}
                        value={condition.value}
                        onChange={(value) => updateCondition(index, { value })}
                      />
                    )}
                  </td>
                  <td className="p-1">
                    <Button
                      variant="ghost"
                      size="smallCircle"
                      onClick={() => removeCondition(index)}
                      icon={<Trash className="size-3" />}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={addCondition}
        icon={<PlusCircle className="size-3 mr-1" />}
        className="h-7 text-xs"
      >
        Add Condition
      </Button>
    </div>
  );
}
