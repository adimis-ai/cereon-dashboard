"use client";

import * as React from "react";
import { z } from "zod";
import { Upload, Download } from "lucide-react";
import { ModalForm } from "../modal-form";
import { Button } from "../button";
import type { FormFieldOrGroup } from "../data-form/interface";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "../dropdown-menu";

// Create validation schema for the upload form
const uploadSchema = z.object({
  config: z.any(),
});

type ConfigActionsProps = {
  title: string;
  onConfigUpload: (config: FormFieldOrGroup[]) => void;
  currentConfig: FormFieldOrGroup[];
};

export const ConfigActions = ({
  onConfigUpload,
  currentConfig,
  title,
}: ConfigActionsProps) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);

  // Handle file upload
  const handleUpload = async (formData: { config?: any }) => {
    try {
      if (!formData.config || !Array.isArray(formData.config) || formData.config.length === 0) {
        console.error("No file provided");
        return;
      }
      const file = formData.config[0] as File;
      const content = await file.text();
      const config = JSON.parse(content);
      onConfigUpload(config);
    } catch (error) {
      console.error("Error uploading config:", error);
    }
  };

  // Handle config download
  const handleDownload = (format: "json" | "yaml") => {
    try {
      let content: string;
      let mimeType: string;
      let extension: string;

      if (format === "json") {
        content = JSON.stringify(currentConfig, null, 2);
        mimeType = "application/json";
        extension = "json";
      } else {
        // Convert to YAML if needed
        // You'll need to add a YAML library like js-yaml to handle YAML conversion
        content = JSON.stringify(currentConfig, null, 2); // Fallback to JSON for now
        mimeType = "application/x-yaml";
        extension = "yaml";
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title ? title.toLowerCase().replace(/\s+/g, '-') : 'form-config'}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading config:", error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <ModalForm
        open={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        title="Upload Configuration"
        description="Upload a JSON or YAML configuration file to update the form builder."
        formProps={{
          formFields: [
            {
              name: "config",
              label: "Configuration File",
              description: "Select a JSON or YAML file to upload",
              variant: "file",
              required: true,
              accept: ".json,.yaml,.yml",
              maxFiles: 1,
            },
          ],
          validationSchema: uploadSchema,
        }}
        onSubmit={handleUpload}
        trigger={{
          icon: <Upload className="size-4" />,
          variant: "outline",
          size: "smallCircle",
          tooltip: "Upload configuration",
        }}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="smallCircle"
            tooltip="Download configuration"
          >
            <Download className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleDownload("json")}>
            Download as JSON
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDownload("yaml")}>
            Download as YAML
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
