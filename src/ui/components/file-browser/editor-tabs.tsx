"use client";

import { X } from "lucide-react";
import { Button } from "../button";
import { cn } from "../../lib/utils";
import type { FileNode, FileBrowserConfig } from "./types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../alert-dialog";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip";

interface EditorTabsProps {
  openFiles?: FileNode[] | null;
  activeFile: FileNode | null;
  onFileSelect: (file: FileNode) => void;
  onFileClose: (file: FileNode) => void;
  config?: FileBrowserConfig;
  // onSave can be a function that saves current active file; make optional
  onSave?: () => void;
  isDirty?: boolean;
  content?: string;
}

export function EditorTabs({
  openFiles,
  activeFile,
  onFileSelect,
  onFileClose,
  config,
  onSave,
  isDirty,
  content,
}: EditorTabsProps) {
  const [fileToClose, setFileToClose] = useState<FileNode | null>(null);

  const handleCloseTab = (file: FileNode, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDirty && file.path === activeFile?.path) {
      setFileToClose(file);
    } else {
      onFileClose(file);
    }
  };

  const handleConfirmClose = (save: boolean) => {
    if (fileToClose) {
      if (save && activeFile && content && onSave) {
        onSave();
      }
      onFileClose(fileToClose);
      setFileToClose(null);
    }
  };

  if (!openFiles || openFiles.length === 0) {
    return null;
  }

  return (
    <>
      <div
        className={cn(
          "border-b relative",
          config?.theme?.background || "bg-background",
          config?.theme?.glassEffect && "backdrop-blur-md"
        )}
      >
        <div className="flex overflow-x-auto scrollbar-thin">
          {openFiles.map((file) => {
            const isActive = activeFile?.path === file.path;
            const isFileUnsaved = isActive && isDirty;

            return (
              <div
                key={file.path}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 cursor-pointer group min-w-0",
                  "transition-all duration-200 ease-in-out",
                  "relative",
                  config?.theme?.hoverBackground || "hover:bg-accent",
                  isActive &&
                    cn(
                      config?.theme?.selectedBackground || "bg-accent",
                      "after:absolute after:bottom-0 after:left-0 after:right-0",
                      "after:h-0.5 after:bg-current",
                      config?.theme?.accentColor || "after:bg-primary"
                    )
                )}
                onClick={() => onFileSelect(file)}
              >
                <span className="text-sm truncate max-w-32 flex items-center gap-2">
                  {file.name}
                  {isFileUnsaved && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        className="bg-background border text-foreground"
                      >
                        Press Ctrl+S to save changes
                      </TooltipContent>
                    </Tooltip>
                  )}
                </span>
                {!config?.readOnly && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
                    onClick={(e) => handleCloseTab(file, e)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <AlertDialog open={!!fileToClose} onOpenChange={() => setFileToClose(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in {fileToClose?.name}. Do you want to save them before closing?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleConfirmClose(false)}>
              Don't Save
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleConfirmClose(true)}>
              Save & Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
