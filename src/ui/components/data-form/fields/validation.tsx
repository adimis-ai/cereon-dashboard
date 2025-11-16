import { FormFieldSchema } from "../interface";

export const getValidationRules = (schema: FormFieldSchema) => {
  const rules: Record<string, any> = {
    ...(schema.required && {
      required: schema.requiredErrorMessage || `${schema.label} is required`,
    }),
  };

  switch (schema.variant) {
    case "email":
      rules.pattern = {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: "Invalid email address",
      };
      break;

    case "number":
      rules.pattern = {
        value: /^[0-9]*$/,
        message: "Please enter a valid number",
      };
      if (schema.min !== undefined) {
        rules.min = {
          value: schema.min,
          message: `Minimum value is ${schema.min}`,
        };
      }
      if (schema.max !== undefined) {
        rules.max = {
          value: schema.max,
          message: `Maximum value is ${schema.max}`,
        };
      }
      break;

    case "envs":
      rules.validate = {
        validateEnvs: (value: any[]) => {
          if (!Array.isArray(value)) {
            return "Must be an array of environment variables";
          }

          const errors = value
            .map((item, index) => {
              if (!item.name) {
                return `Environment variable #${index + 1}: Name is required`;
              }

              return null;
            })
            .filter(Boolean);

          return errors.length === 0 || errors.join(", ");
        },
      };
      break;

    case "password":
      rules.validate = {
        strength: (value: string) => {
          if (schema.evaluatePasswordCriteria) {
            const errors = schema.evaluatePasswordCriteria(value);
            return errors.length === 0 || errors.join(", ");
          }
          return true;
        },
      };
      break;

    case "tags":
      rules.validate = {
        validateTags: (value: string[]) => {
          if (!Array.isArray(value)) {
            return "Must be an array of tags";
          }

          // Check minimum tags if specified
          if (typeof schema.min === "number" && value.length < schema.min) {
            return `Please add at least ${schema.min} tag${schema.min > 1 ? "s" : ""}`;
          }

          // Check maximum tags if specified
          if (typeof schema.max === "number" && value.length > schema.max) {
            return `Cannot add more than ${schema.max} tag${schema.max > 1 ? "s" : ""}`;
          }

          // Validate individual tags
          const errors = value
            .map((tag, index) => {
              // Check for empty tags
              if (!tag.trim()) {
                return `Tag #${index + 1} cannot be empty`;
              }

              // Check tag length if specified
              if (typeof schema.min === "number" && tag.length < schema.min) {
                return `Tag #${index + 1} must be at least ${schema.min} characters`;
              }

              if (typeof schema.max === "number" && tag.length > schema.max) {
                return `Tag #${index + 1} cannot exceed ${schema.max} characters`;
              }

              // Check tag format if pattern is specified
              if (schema.pattern && !schema.pattern.test(tag)) {
                return schema.patternErrorMessage ?? `Tag #${index + 1} has invalid format`;
              }

              return null;
            })
            .filter(Boolean);

          return errors.length === 0 || errors.join(", ");
        },
      };
      break;

    case "select":
      if (schema.options) {
        rules.validate = {
          validOption: (value: string | number) => {
            const isValid = schema.options?.some((opt) => opt.value === value);
            return isValid || "Please select a valid option";
          },
        };
      }
      break;
  }

  return rules;
};
