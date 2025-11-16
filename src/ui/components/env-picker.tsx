import { FC, useCallback, useState } from "react";
import { FieldValues } from "react-hook-form";
import { PlusCircle, Trash2, X, Upload, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/index";
import { Button } from "./button";
import { Input } from "./input";
import { ScrollArea } from "./scroll-area";
import { Alert, AlertDescription } from "./alert";
import { Switch } from "./switch";
import { Badge } from "./badge";
import { Modal } from "./modal";
import {
  FileUploader,
  FileInput,
  FileUploaderContent,
} from "./file-uploader";

export interface EnvironmentVariable extends FieldValues {
  name: string;
  value: string;
  is_secret: boolean;
}

interface EnvironmentVariablePickerProps {
  className?: string;
  value?: EnvironmentVariable[];
  disabled?: boolean;
  onChange?: (value: EnvironmentVariable[]) => void | Promise<void>;
}

interface EnvFileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (variables: EnvironmentVariable[]) => void;
  currentVariables: EnvironmentVariable[];
}

const EnvFileModal: FC<EnvFileModalProps> = ({
  open,
  onOpenChange,
  onImport,
  currentVariables,
}) => {
  const [files, setFiles] = useState<File[] | null>(null);

  const handleFileUpload = async () => {
    const file = files?.[0];
    if (!file) return;

    try {
      const content = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsText(file);
      });

      const variables: EnvironmentVariable[] = content
        .split("\n")
        .filter((line) => line.trim() && !line.startsWith("#"))
        .map((line) => {
          const [name = "", value = ""] = line.split("=").map((part) => part.trim());
          // Only create variables that have both name and value
          if (!name || !value) return null;
          return {
            name,
            value,
            is_secret: true,
          };
        })
        .filter((v): v is EnvironmentVariable => v !== null);

      onImport(variables);
      onOpenChange(false);
    } catch (error) {
      console.error("Error reading env file:", error);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Import Environment File"
      description="Upload an environment file to import variables"
      submitButton={{
        text: "Import",
        icon: <Upload className="size-4" />,
      }}
      onSave={handleFileUpload}
      disableSave={!files}
    >
      <FileUploader
        value={files}
        onValueChange={setFiles}
        dropzoneOptions={{
          accept: {
            "text/plain": [".env", ".txt"],
          },
          maxFiles: 1,
        }}
      >
        <FileInput className="w-full min-h-[150px] flex flex-col items-center justify-center border-2 border-dashed gap-4 p-4">
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-sm text-muted-foreground">
              Drop your environment file here or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Supports .env and .txt files
            </p>
          </div>
        </FileInput>
        <FileUploaderContent />
      </FileUploader>
    </Modal>
  );
};

export const EnvironmentVariablePicker: FC<EnvironmentVariablePickerProps> = ({
  className,
  value = [],
  disabled = false,
  onChange,
}) => {
  const [showFileModal, setShowFileModal] = useState(false);

  const handleAddVariable = useCallback(() => {
    const newVar: EnvironmentVariable = {
      name: "",
      value: "",
      is_secret: true,
    };
    onChange?.([...value, newVar]);
  }, [value, onChange]);

  const handleUpdateVariable = useCallback(
    (index: number, updates: Partial<EnvironmentVariable>) => {
      const newVars = [...value];
      const currentVar = newVars[index];

      if (!currentVar) {
        console.warn(
          `Attempted to update non-existent variable at index ${index}`
        );
        return;
      }

      const updatedVar: EnvironmentVariable = {
        name: updates.name ?? currentVar.name,
        value: updates.value ?? currentVar.value,
        is_secret: updates.is_secret ?? currentVar.is_secret,
      };

      newVars[index] = updatedVar;
      onChange?.(newVars);
    },
    [value, onChange]
  );

  const handleRemoveVariable = useCallback(
    (index: number) => {
      const newVars = value.filter((_, i) => i !== index);
      onChange?.(newVars);
    },
    [value, onChange]
  );

  const handleDownload = useCallback(() => {
    const content = value
      .map((v) => `${v.name}=${v.value}`)
      .join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "environment.env";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [value]);

  const getStats = useCallback(() => {
    const total = value.length;
    const secretCount = value.filter((v) => v.is_secret).length;
    const publicCount = total - secretCount;
    return {
      total,
      secretCount,
      publicCount,
    };
  }, [value]);

  const stats = getStats();

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2 w-full">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChange?.([]);
            }}
            disabled={disabled}
            className="gap-1"
          >
            <X className="size-4" />
            Clear
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddVariable}
            disabled={disabled}
            className="gap-1"
          >
            <PlusCircle className="size-4" />
            Add Variable
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFileModal(true)}
            disabled={disabled}
            className="gap-1"
          >
            <Upload className="size-4" />
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={disabled}
            className="gap-1"
          >
            <Download className="size-4" />
            Export
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-1"></div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="bg-muted/50">
                {stats.total} Variables
              </Badge>
              <Badge variant="secondary">{stats.secretCount} Secret</Badge>
              <Badge variant="secondary">{stats.publicCount} Public</Badge>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[650px] pr-4">
        <AnimatePresence>
          {value.map((variable, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="group relative mb-3 rounded-lg bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex justify-start items-center gap-2">
                <div className="w-full">
                  <label className="text-xs font-medium text-muted-foreground">
                    Name
                  </label>
                  <Input
                    placeholder="VARIABLE_NAME"
                    value={variable.name}
                    onChange={(e) =>
                      handleUpdateVariable(index, { name: e.target.value })
                    }
                    disabled={disabled}
                    className="h-9 w-full"
                  />
                </div>
                <div className="w-full">
                  <label className="text-xs font-medium text-muted-foreground">
                    Value
                  </label>
                  <div className="relative">
                    <Input
                      type={variable.is_secret ? "password" : "text"}
                      placeholder="Variable value"
                      value={variable.value}
                      onChange={(e) =>
                        handleUpdateVariable(index, { value: e.target.value })
                      }
                      disabled={disabled}
                      className="h-9 pr-8 w-full"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 h-9 mt-[1.5rem] w-[100px] p-2 rounded-lg">
                  <Switch
                    checked={variable.is_secret}
                    onCheckedChange={(checked) =>
                      handleUpdateVariable(index, {
                        is_secret: checked,
                      })
                    }
                    disabled={disabled}
                    className="h-4.5"
                  />
                  <span className="text-sm text-muted-foreground">
                    {variable.is_secret ? "Secret" : "Public"}
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="smallCircle"
                  onClick={() => handleRemoveVariable(index)}
                  disabled={disabled}
                  className="mt-6"
                >
                  <Trash2 className="size-5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </ScrollArea>

      {value.length === 0 && (
        <Alert variant="default" className="bg-muted/50">
          <AlertDescription>
            No environment variables added yet. Click "Add Variable" to create
            one.
          </AlertDescription>
        </Alert>
      )}

      <EnvFileModal
        open={showFileModal}
        onOpenChange={setShowFileModal}
        onImport={onChange || (() => {})}
        currentVariables={value}
      />
    </div>
  );
};
