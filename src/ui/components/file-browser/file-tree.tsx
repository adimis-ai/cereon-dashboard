"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../context-menu";
import { Button } from "../button";
import { Input } from "../input";
import { ModalForm } from "../modal-form";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../collapsible";
import {
  ChevronRight,
  Edit3,
  File,
  Folder,
  FolderOpen,
  FileText,
  FolderPlus,
  Plus,
  Trash2,
} from "lucide-react";
import type { FileNode, FileBrowserConfig } from "./types";
import { cn } from "../../lib/utils";
import { renderIcon } from "../../lib/icon-utils";
import { Options } from "nuqs";

const createFileSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type CreateFileFormData = z.infer<typeof createFileSchema>;

interface FileTreeProps {
  title: string;
  files: FileNode[];
  onFileSelect: (file: FileNode) => void;
  onFileCreate?: (
    parentPath: string,
    name: string,
    type: "file" | "folder"
  ) => void;
  onFileDelete?: (path: string) => void;
  onFileRename?: (path: string, newName: string) => void;
  selectedFile?: string | null | undefined;
  config?: FileBrowserConfig;
  customRenderer?: (file: FileNode) => React.ReactNode;
  additionalHeaderActions?: React.ReactNode;
  readOnly?: boolean;
  editingFile?: string | null | undefined;
  setEditingFile: React.Dispatch<React.SetStateAction<string | null | undefined>>;
  expandedFolders?: Set<string> | undefined;
  setExpandedFolders: React.Dispatch<React.SetStateAction<Set<string> | undefined>>;
}

export function FileTree({
  title,
  files,
  onFileSelect,
  onFileCreate,
  onFileDelete,
  onFileRename,
  selectedFile,
  config,
  readOnly,
  customRenderer,
  additionalHeaderActions,
  editingFile,
  setEditingFile,
  expandedFolders,
  setExpandedFolders,
}: FileTreeProps) {
  const [editingName, setEditingName] = React.useState("");
  const [createModal, setCreateModal] = React.useState<{
    open: boolean;
    type: "file" | "folder";
    parentPath: string;
  }>({
    open: false,
    type: "file",
    parentPath: "",
  });

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const handleRename = (path: string, currentName: string) => {
    setEditingFile(path);
    setEditingName(currentName);
  };

  const confirmRename = () => {
    if (editingFile && editingName.trim() && onFileRename) {
      const oldPath = editingFile;
      onFileRename(oldPath, editingName.trim());
    }
    setEditingFile(null);
    setEditingName("");
  };

  const cancelRename = () => {
    setEditingFile(null);
    setEditingName("");
  };

  const getFileIcon = (node: FileNode) => {
    if (node.icon) return renderIcon(node.icon);

    if (node.type === "folder") {
      return expandedFolders?.has(node.path) ? (
        <FolderOpen
          className={cn("size-4", config?.theme?.accentColor || "text-primary")}
        />
      ) : (
        <Folder
          className={cn("size-4", config?.theme?.accentColor || "text-primary")}
        />
      );
    }

    const fileType = config?.fileTypes?.find((type) =>
      type.extensions.some((ext) => node.name.toLowerCase().endsWith(ext))
    );

    if (fileType?.icon) return fileType.icon;

    return (
      <File
        className={cn("size-4", fileType?.color || "text-muted-foreground")}
      />
    );
  };

  const shouldShowFile = (node: FileNode) => {
    if (!config?.showHiddenFiles && node.name.startsWith(".")) return false;
    if (config?.allowedFileTypes && node.type === "file") {
      return config.allowedFileTypes.some((ext) =>
        node.name.toLowerCase().endsWith(ext)
      );
    }
    return true;
  };

  const renderFileNode = (node: FileNode, depth = 0) => {
    if (!shouldShowFile(node)) return null;

    const isExpanded = expandedFolders?.has(node.path) || false;
    const isSelected = selectedFile === node.path;
    const isEditing = editingFile === node.path;

    if (customRenderer) {
      return customRenderer(node);
    }

    return (
      <motion.div
        key={node.id}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        transition={{ duration: 0.2 }}
      >
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 cursor-pointer group rounded-lg mx-1",
                "transition-all duration-200 ease-in-out",
                config?.theme?.hoverBackground || "hover:bg-accent",
                isSelected &&
                  (config?.theme?.selectedBackground || "bg-accent"),
                config?.theme?.glassEffect && "backdrop-blur-sm"
              )}
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
            >
              {node.type === "folder" ? (
                <Collapsible
                  open={isExpanded}
                  onOpenChange={() => toggleFolder(node.path)}
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="size-4 p-0">
                      <ChevronRight
                        className={cn(
                          "size-4 transition-transform",
                          isExpanded && "rotate-90"
                        )}
                      />
                    </Button>
                  </CollapsibleTrigger>
                </Collapsible>
              ) : (
                <div className="w-4" />
              )}

              <div className="flex items-center gap-2 flex-1 min-w-0">
                {getFileIcon(node)}

                {isEditing ? (
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={confirmRename}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") confirmRename();
                      if (e.key === "Escape") cancelRename();
                    }}
                    className="h-6 text-sm"
                    autoFocus
                  />
                ) : (
                  <span
                    className="text-sm truncate flex-1"
                    onClick={() => {
                      if (node.type === "file") {
                        onFileSelect(node);
                      } else {
                        toggleFolder(node.path);
                      }
                    }}
                  >
                    {node.name}
                  </span>
                )}
              </div>

              {!config?.readOnly && node.type === "folder" && !readOnly && (
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      openCreateModal("file", node.path);
                    }}
                    tooltip="Add New File"
                  >
                    <FileText className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      openCreateModal("folder", node.path);
                    }}
                    tooltip="Add New Folder"
                  >
                    <FolderPlus className="size-4" />
                  </Button>
                </div>
              )}
            </div>
          </ContextMenuTrigger>
          {!config?.readOnly && !readOnly && (
            <ContextMenuContent>
              <ContextMenuItem
                onClick={() => handleRename(node.path, node.name)}
              >
                <Edit3 className="size-4 mr-2" />
                Rename
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => onFileDelete?.(node.path)}
                className="text-red-600"
              >
                <Trash2 className="size-4 mr-2" />
                Delete
              </ContextMenuItem>
              {node.type === "folder" && !readOnly && (
                <>
                  {" "}
                  <ContextMenuItem
                    onClick={() => openCreateModal("file", node.path)}
                  >
                    <File className="size-4 mr-2" />
                    New File
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() => openCreateModal("folder", node.path)}
                  >
                    <Folder className="size-4 mr-2" />
                    New Folder
                  </ContextMenuItem>
                </>
              )}
            </ContextMenuContent>
          )}
        </ContextMenu>

        {node.type === "folder" && node.children && isExpanded && (
          <Collapsible open={isExpanded}>
            <CollapsibleContent>
              {node.children.map((child) => renderFileNode(child, depth + 1))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </motion.div>
    );
  };

  const handleCreateSubmit = async (data: CreateFileFormData) => {
    if (onFileCreate) {
      onFileCreate(createModal.parentPath, data.name, createModal.type);
    }
  };

  const openCreateModal = (type: "file" | "folder", parentPath: string) => {
    setCreateModal({
      open: true,
      type,
      parentPath,
    });
  };

  return (
    <div className="h-full overflow-auto">
      <div className={cn("p-2", config?.theme?.borderColor || "border-b")}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">{title}</h3>
          {!config?.readOnly && (
            <div className="flex items-center gap-1">
              {!readOnly && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => openCreateModal("file", "")}
                    tooltip="Add New File"
                  >
                    <FileText className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => openCreateModal("folder", "")}
                    tooltip="Add New Folder"
                  >
                    <FolderPlus className="size-4" />
                  </Button>
                </>
              )}
              {additionalHeaderActions}
            </div>
          )}
        </div>
      </div>
      <div className="py-2">{files.map((file) => renderFileNode(file))}</div>

      <ModalForm
        open={createModal.open}
        onOpenChange={(open) => setCreateModal((prev) => ({ ...prev, open }))}
        title={`Create new ${createModal.type}`}
        description={`Enter a name for the new ${createModal.type}`}
        formProps={{
          formFields: [
            {
              name: "name",
              label: "Name",
              type: "text",
              placeholder: `Enter ${createModal.type} name`,
              required: true,
              requiredErrorMessage: "Name is required",
            },
          ],
          validationSchema: createFileSchema,
          defaultValues: {
            name: "",
          },
        }}
        onSubmit={handleCreateSubmit}
      />
    </div>
  );
}
