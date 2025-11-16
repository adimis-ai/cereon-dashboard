import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from ".";
import { FC, useEffect, useRef, useState, useCallback, useMemo } from "react";
import Editor from "@monaco-editor/react";
import { Save } from "lucide-react";
import { cn, formatToTitleCase } from "../lib";
import { Alert, AlertDescription } from "./alert";
import type { EditorProps } from "@monaco-editor/react";

// Add theme detection helper
const getThemeValue = (theme: "light" | "dark" | "system"): "vs-dark" | "light" => {
  if (theme === "system") {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    console.log("[getThemeValue] system theme detected, isDark:", isDark);
    return isDark ? "vs-dark" : "light";
  }
  console.log("[getThemeValue] explicit theme:", theme);
  return theme === "dark" ? "vs-dark" : "light";
};

interface ValidationState {
  isValid: boolean;
  errors: string[];
  isDirty: boolean;
}

type MonacoEditorComponentProps = Omit<EditorProps, "onChange" | "value"> & {
  theme: "light" | "dark" | "system";
  readOnly: boolean;
  title: string;
  description: string;
  onChange?: (value: string) => void;
  onvalidate?: (value: string) => string[] | undefined;
  debounceMs?: number;
  defaultValue?: string;
  height?: string;
  panel?: boolean;
};

export const MonacoEditorComponent: FC<MonacoEditorComponentProps> = (
  props
) => {
  console.log("[MonacoEditorComponent]: props.theme: ", props.theme);
  const [value, setValue] = useState(props.defaultValue || "");
  const [initialValue, setInitialValue] = useState(props.defaultValue || "");
  const [editorTheme, setEditorTheme] = useState(() => getThemeValue(props.theme));
  const [validation, setValidation] = useState<ValidationState>({
    isValid: true,
    errors: [],
    isDirty: false,
  });
  const [isValidating, setIsValidating] = useState(false);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const validationTimeoutRef = useRef<any | null>(null);

  // Memoize validation function
  const validateValue = useCallback(
    (newValue: string) => {
      if (!props.onvalidate) return true;

      setIsValidating(true);
      try {
        const validationResult = props.onvalidate(newValue);
        const errors = Array.isArray(validationResult) ? validationResult : [];
        setValidation({
          isValid: errors.length === 0,
          errors,
          isDirty: newValue !== initialValue,
        });
        return errors.length === 0;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Validation error occurred";
        setValidation({
          isValid: false,
          errors: [errorMessage],
          isDirty: newValue !== initialValue,
        });
        return false;
      } finally {
        setIsValidating(false);
      }
    },
    [props.onvalidate, initialValue]
  );

  // Debounced value change handler
  const handleValueChange = useCallback(
    (newValue: string) => {
      setValue(newValue);

      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }

      validationTimeoutRef.current = setTimeout(() => {
        validateValue(newValue);
      }, props.debounceMs || 300);
    },
    [validateValue, props.debounceMs]
  );

  // Update value when defaultValue prop changes
  useEffect(() => {
    if (props.defaultValue !== undefined) {
      setValue(props.defaultValue);
      setInitialValue(props.defaultValue);
      validateValue(props.defaultValue);
    }
  }, [props.defaultValue, validateValue]);

  // Cleanup validation timeout
  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);

  // Add theme change detection
  useEffect(() => {
    const updateTheme = () => {
      const newTheme = getThemeValue(props.theme);
      console.log("[updateTheme] Setting new theme:", newTheme);
      setEditorTheme(newTheme);
    };

    updateTheme();

    if (props.theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => {
        console.log("[mediaQuery] System theme changed");
        updateTheme();
      };
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [props.theme]);

  const hasChanges = value !== initialValue;
  const canSave = useMemo(
    () => hasChanges && validation.isValid && !props.readOnly && !isValidating,
    [hasChanges, validation.isValid, props.readOnly, isValidating]
  );

  // Handle save action
  const handleSave = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (canSave) {
        props.onChange?.(value);
        setInitialValue(value);
        setValidation((prev) => ({ ...prev, isDirty: false }));
      }
    },
    [canSave, props.onChange, value]
  );

  // Add keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  const { onvalidate, theme: _, ...editorProps } = props;

  if (!props.panel) {
    return (
      <div ref={editorContainerRef} className="h-full flex flex-col">
        {validation.errors.length > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              <ul className="list-disc pl-4">
                {validation.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        <div className="flex-1 min-h-0">
          <Editor
            value={value}
            onChange={((value: string | undefined) => {
              handleValueChange(value ?? "");
            }) as any}
            theme={editorTheme}
            language={props.language}
            height="100%"
            options={{
              minimap: { enabled: true },
              lineNumbers: "on",
              readOnly: props.readOnly,
              scrollBeyondLastLine: true,
              automaticLayout: true,
              cursorStyle: "line",
              cursorBlinking: "blink",
              cursorSmoothCaretAnimation: "on",
              autoIndent: "full",
              contextmenu: true,
              fontFamily: "monospace",
              fontSize: 13,
              lineHeight: 24,
              hideCursorInOverviewRuler: true,
              matchBrackets: "always",
              scrollbar: {
                horizontalSliderSize: 4,
                verticalSliderSize: 18,
                useShadows: true,
                verticalHasArrows: false,
                horizontalHasArrows: false,
                vertical: "visible",
                horizontal: "visible",
              },
              selectOnLineNumbers: true,
              roundedSelection: true,
              wordWrap: "on",
              autoClosingBrackets: "always",
              codeLens: true,
              "semanticHighlighting.enabled": "configuredByTheme",
              autoClosingComments: "always",
              bracketPairColorization: {
                enabled: true,
                independentColorPoolPerBracketType: true,
              },
              copyWithSyntaxHighlighting: true,
              folding: false,
              overviewRulerBorder: false,
              lineDecorationsWidth: 10,
              renderValidationDecorations: "on",
              renderWhitespace: "none",
              acceptSuggestionOnEnter: "on",
              wordWrapBreakBeforeCharacters: " ,.-=+*/",
              wordWrapBreakAfterCharacters: " ,.-=+*/",
              wrappingStrategy: "advanced",
            }}
            {...editorProps}
          />
        </div>
      </div>
    );
  }

  return (
    <Card ref={editorContainerRef}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{formatToTitleCase(props.title)}</CardTitle>
          <CardDescription>{props.description}</CardDescription>
        </div>
        <Button
          label="Save"
          icon={
            <Save className={cn("size-4", isValidating && "animate-spin")} />
          }
          size={"sm"}
          disabled={!canSave}
          onClick={handleSave}
        />
      </CardHeader>
      <CardContent>
        {validation.errors.length > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              <ul className="list-disc pl-4">
                {validation.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        <div
          className={cn(
            "rounded-lg overflow-hidden",
            props.height || "h-[800px]"
          )}
        >
          <Editor
            value={value}
            onChange={((value: string | undefined) => {
              handleValueChange(value ?? "");
            }) as any}
            theme={editorTheme}
            language={props.language}
            height={
              props.height
                ? props.height.replace("h-[", "").replace("]", "")
                : "800px"
            }
            options={{
              minimap: { enabled: true },
              lineNumbers: "on",
              readOnly: props.readOnly,
              scrollBeyondLastLine: true,
              automaticLayout: true,
              cursorStyle: "line",
              cursorBlinking: "blink",
              cursorSmoothCaretAnimation: "on",
              autoIndent: "full",
              contextmenu: true,
              fontFamily: "monospace",
              fontSize: 13,
              lineHeight: 24,
              hideCursorInOverviewRuler: true,
              matchBrackets: "always",
              scrollbar: {
                horizontalSliderSize: 4,
                verticalSliderSize: 18,
                useShadows: true,
                verticalHasArrows: false,
                horizontalHasArrows: false,
                vertical: "visible",
                horizontal: "visible",
              },
              selectOnLineNumbers: true,
              roundedSelection: true,
              wordWrap: "on",
              autoClosingBrackets: "always",
              codeLens: true,
              "semanticHighlighting.enabled": "configuredByTheme",
              autoClosingComments: "always",
              bracketPairColorization: {
                enabled: true,
                independentColorPoolPerBracketType: true,
              },
              copyWithSyntaxHighlighting: true,
              folding: false,
              overviewRulerBorder: false,
              lineDecorationsWidth: 10,
              renderValidationDecorations: "on",
              renderWhitespace: "none",
              acceptSuggestionOnEnter: "on",
              wordWrapBreakBeforeCharacters: " ,.-=+*/",
              wordWrapBreakAfterCharacters: " ,.-=+*/",
              wrappingStrategy: "advanced",
            }}
            {...editorProps}
          />
        </div>
      </CardContent>
    </Card>
  );
};
