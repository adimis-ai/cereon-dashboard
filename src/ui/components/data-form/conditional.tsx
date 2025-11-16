"use client";

import * as React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Condition } from "./interface";
import { motion, AnimatePresence } from "framer-motion";

interface ConditionalFieldProps {
  children: React.ReactNode;
  conditions?: Condition[];
}

const animationConfig = {
  initial: { opacity: 0, height: 0, scale: 0.95 },
  animate: { opacity: 1, height: "auto", scale: 1 },
  exit: { opacity: 0, height: 0, scale: 0.95 },
  // framer-motion expects easing to be an array or function; use predefined cubic bezier
  transition: { duration: 0.2, ease: [0.42, 0, 0.58, 1] as any },
};

const evaluateCondition = (condition: Condition, value: any): boolean => {
  switch (condition.operator) {
    case "equals":
      return value == condition.value;
    case "not_equals":
      return value != condition.value;
    case "strict_equals":
      return value === condition.value;
    case "not_strict_equals":
      return value !== condition.value;
    case "greater_than":
      return Number(value) > Number(condition.value);
    case "greater_than_or_equals":
      return Number(value) >= Number(condition.value);
    case "less_than":
      return Number(value) < Number(condition.value);
    case "less_than_or_equals":
      return Number(value) <= Number(condition.value);
    case "includes":
      return Array.isArray(value) && value.includes(condition.value);
    case "not_includes":
      return Array.isArray(value) && !value.includes(condition.value);
    default:
      return false;
  }
};

export function ConditionalField({ children, conditions }: ConditionalFieldProps) {
  const { control } = useFormContext();

  // If no conditions, always render
  if (!conditions?.length) {
    return <>{children}</>;
  }

  // Watch all fields referenced in conditions
  const fields = conditions.map((c) => c.field);
  const values = useWatch({ control, name: fields });
  const fieldValues = Object.fromEntries(
    fields.map((field, i) => [field, values[i]])
  );

  const isVisible = conditions.reduce((result, condition, index) => {
    const fieldValue = fieldValues[condition.field];
    const matches = evaluateCondition(condition, fieldValue);

    if (index === 0) return matches;
    return condition.relation === "or" ? result || matches : result && matches;
  }, false);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={animationConfig.initial}
          animate={animationConfig.animate}
          exit={animationConfig.exit}
          transition={animationConfig.transition}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}