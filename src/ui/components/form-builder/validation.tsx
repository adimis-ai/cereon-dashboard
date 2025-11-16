import { z } from "zod";
import { FormFieldOrGroup } from "../data-form/interface";

export const generateValidationSchema = (fields: FormFieldOrGroup[]) => {
  const schemaObject: Record<string, z.ZodType<any>> = {};

  fields.forEach((field) => {
    if (!Array.isArray(field)) {
      let fieldSchema: z.ZodType;

      // Set base type
      switch (field.variant) {
        case "number":
          fieldSchema = z.number();
          break;
        case "checkbox":
          fieldSchema = z.boolean();
          break;
        case "email":
          fieldSchema = z.string().email();
          break;
        case "envs":
          fieldSchema = z.array(
            z.object({
              name: z.string().min(1),
              value: z.string().optional(),
              is_secret: z.boolean().optional(),
            })
          );
          break;
        case "password":
          fieldSchema = z.string();
          if (field.evaluatePasswordCriteria) {
            fieldSchema = fieldSchema.refine(
              (value) => field.evaluatePasswordCriteria!(value).length === 0,
              (value) => ({
                message: field.evaluatePasswordCriteria!(value).join(", "),
              })
            );
          }
          break;
        case "tags":
          fieldSchema = z.array(z.string().trim().min(1));
          if (field.min !== undefined) {
            fieldSchema = fieldSchema.refine(
              (tags: string[]) => tags.length >= (field.min || 0),
              (tags) => ({
                message: `At least ${field.min} tags are required`,
              })
            );
          }
          if (field.max !== undefined) {
            fieldSchema = fieldSchema.refine(
              (tags: string[]) => tags.length <= (field.max || 0),
              (tags) => ({
                message: `No more than ${field.max} tags are allowed`,
              })
            );
          }
          if (field.min || field.max || field.pattern) {
            fieldSchema = fieldSchema.refine(
              (tags: string[]) =>
                tags.every((tag: string) => {
                  if (field.min && tag.length < field.min) return false;
                  if (field.max && tag.length > field.max) return false;
                  if (field.pattern && !field.pattern.test(tag)) return false;
                  return true;
                }),
              (tags) => ({
                message: "One or more tags do not meet the required format",
              })
            );
          }
          break;
        case "select":
          if (field.options) {
            fieldSchema = z
              .union([z.string(), z.number()])
              .refine(
                (value) => field.options!.some((opt) => opt.value === value),
                "Please select a valid option"
              );
          } else {
            fieldSchema = z.string();
          }
          break;
        case "carousel":
          fieldSchema = z.array(z.string());
          break;
        default:
          fieldSchema = z.string();
          break;
      }

      // Handle required fields with default values
      if (field.required && field.defaultValue !== undefined) {
        fieldSchema = fieldSchema.refine(
          (value) => {
            if (typeof value === "string" && value.trim() === "") {
              return false;
            }
            if (value === null || value === undefined) {
              return false;
            }
            if (Array.isArray(value) && value.length === 0) {
              return false;
            }
            return true;
          },
          {
            message: `${field.label || field.name} is required`,
          }
        );
      }

      // Handle optional fields
      if (!field.required) {
        fieldSchema = fieldSchema.optional();
      }

      // Add the field schema to the schema object
      schemaObject[field.name] = fieldSchema;
    }
  });

  return z.object(schemaObject);
};
