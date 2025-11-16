import * as React from "react";
import { ControllerRenderProps, FieldValues } from "react-hook-form";
import {
  FileUploader,
  FileInput,
  FileUploaderContent,
  FileUploaderItem,
} from "../../file-uploader";
import type { FormFieldSchema } from "../interface";
import { FileIcon, UploadCloud } from "lucide-react";

interface FileFieldProps {
  schema: FormFieldSchema;
  field: ControllerRenderProps<FieldValues, string>;
}

export const FileField = ({ schema, field }: FileFieldProps) => {
  const handleFileChange = React.useCallback(
    async (files: File[] | null) => {
      console.log("[FILE_UPLOADER]: [handleFileChange]", files);
      field.onChange(files);
    },
    [field]
  );

  const files = React.useMemo(() => {
    return field.value
      ? Array.isArray(field.value)
        ? field.value
        : [field.value]
      : [];
  }, [field.value]);

  return (
    <FileUploader
      value={files}
      onValueChange={handleFileChange}
      dropzoneOptions={{
        accept: schema.accept ? { [schema.accept]: [] } : undefined,
        maxFiles: schema.maxFiles || 1,
        multiple: (schema.maxFiles || 1) > 1,
      }}
    >
      <FileInput className="w-full min-h-[150px] border-2 border-dashed rounded-lg transition-colors duration-200 ease-in-out bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="flex flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="rounded-full p-3 bg-primary/10">
            <UploadCloud className="w-6 h-6 text-primary" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">
              Drop your file{(schema.maxFiles || 1) > 1 ? "s" : ""} here or
              click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              {schema.accept
                ? `Accepts ${schema.accept}`
                : "All file types supported"}
              {schema.maxFiles
                ? ` (Max ${schema.maxFiles} file${schema.maxFiles > 1 ? "s" : ""})`
                : ""}
            </p>
          </div>
        </div>
      </FileInput>

      {files.length > 0 && (
        <FileUploaderContent className="mt-4">
          <div className="space-y-2">
            {files.map((file, index) => (
              <FileUploaderItem key={index} index={index} className="w-full">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-md bg-primary/10">
                    <FileIcon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </FileUploaderItem>
            ))}
          </div>
        </FileUploaderContent>
      )}
    </FileUploader>
  );
};
