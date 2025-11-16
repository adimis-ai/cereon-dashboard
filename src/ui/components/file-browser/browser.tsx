"use client";

import * as React from "react";
import { cn } from "../../lib/utils";
import { CodeEditor } from "./code-editor";
import { EditorTabs } from "./editor-tabs";
import { FileTree } from "./file-tree";
import type { FileNode, FileBrowserProps, CodeEditorProps } from "./types";
import { useStorageHook } from "../../hooks/use-storage";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../resizable";

const defaultConfig = {
  theme: {
    background: "bg-background",
    textColor: "text-foreground",
    accentColor: "text-primary",
    borderColor: "border-border",
    selectedBackground: "bg-accent",
    hoverBackground: "hover:bg-accent/50",
    glassEffect: true,
    darkMode: true,
    highlightColor: "text-primary",
    secondaryBackground: "bg-secondary",
    scrollbarColor: "bg-muted/30",
    scrollbarHoverColor: "bg-muted/50",
  },
  showHiddenFiles: false,
  sortBy: "name" as const,
  sortDirection: "asc" as const,
  fileTypes: [],
};

export default function FileBrowser({
  title = "Repository",
  initialFiles = [],
  config = defaultConfig,
  onFileOpen,
  onFileCreate,
  onFileDelete,
  onFileRename,
  onFileSave,
  onError,
  readOnly = false,
  customRenderer,
  className,
  activeFile: externalActiveFile,
  onFileBrowserChange,
  renderFileContent,
  additionalHeaderActions,
  customEditors,
}: FileBrowserProps) {

  const { storedValue: activeFile, setValue: setActiveFile } =
    useStorageHook<FileNode | null>(
      "sessionStorage",
      `${title}-active-file`,
      null
    );

  const { storedValue: editingFile, setValue: setEditingFile } = useStorageHook<
    string | null
  >("sessionStorage", `${title}-editing-file`, null);

  const { storedValue: expandedFolders, setValue: setExpandedFolders } =
    useStorageHook<Set<string>>(
      "sessionStorage",
      `${title}-expanded-folders`,
      new Set([""]),
      "expandedFoldersChanged"
    );

  const { storedValue: openFiles, setValue: setOpenFiles } = useStorageHook<
    FileNode[]
  >("sessionStorage", `${title}-open-files`, []);

  const { storedValue: selectedFile, setValue: setSelectedFile } =
    useStorageHook<string>("sessionStorage", `${title}-selected-folders`, "");

  const [files, setFiles] = React.useState<FileNode[]>([]);
  const [content, setContent] = React.useState("");
  const [isDirty, setIsDirty] = React.useState(false);

  const findFileByPath = React.useCallback(
    (files: FileNode[], path: string): FileNode | null => {
      for (const file of files) {
        if (file.path === path) {
          return file;
        }
        if (file.children) {
          const found = findFileByPath(file.children, path);
          if (found) return found;
        }
      }
      return null;
    },
    []
  );

  React.useEffect(() => {
    console.log("Initializing FileBrowser with initial files:", initialFiles);
    setFiles(initialFiles);
  }, [initialFiles]);

  React.useEffect(() => {
    if (initialFiles && initialFiles.length > 0) {
      // If there's an active file, find its updated version in the new files
      if (activeFile) {
        const updatedActiveFile = findFileByPath(initialFiles, activeFile.path);
        if (updatedActiveFile) {
          setActiveFile(updatedActiveFile);
          if (updatedActiveFile.content !== undefined) {
            setContent(updatedActiveFile.content || "");
          }
        }
      }

      // Update editing file state if the file still exists
      if (editingFile) {
        const fileStillExists = findFileByPath(initialFiles, editingFile);
        if (!fileStillExists) {
          setEditingFile(null);
        }
      }

      // Update expanded folders - only keep expanded folders that still exist
      if (expandedFolders) {
        const newExpandedFolders = new Set<string>();
        expandedFolders.forEach((path) => {
          const folderExists = findFileByPath(initialFiles, path);
          if (folderExists && folderExists.type === "folder") {
            newExpandedFolders.add(path);
          }
        });
        setExpandedFolders(newExpandedFolders);
      }

      // Update selected file if it still exists
      if (selectedFile) {
        const selectedFileExists = findFileByPath(initialFiles, selectedFile);
        if (!selectedFileExists) {
          setSelectedFile("");
        }
      }

      // Update open files list - keep only files that still exist
      if ((openFiles ?? []).length > 0) {
        const updatedOpenFiles = (openFiles ?? []).filter((file) => {
          return findFileByPath(initialFiles, file.path);
        });
        setOpenFiles(updatedOpenFiles);
      }
    }
  }, [initialFiles]);

  const mergedConfig = React.useMemo(
    () => ({ ...defaultConfig, ...config }),
    [config]
  );

  React.useEffect(() => {
    if (externalActiveFile) {
      setActiveFile(externalActiveFile);
    }
  }, [externalActiveFile]);

  const sortFiles = React.useCallback(
    (files: FileNode[]): FileNode[] => {
      const sorted = [...files].sort((a, b) => {
        if (mergedConfig.sortBy === "type") {
          if (a.type === b.type) {
            return a.name.localeCompare(b.name);
          }
          return a.type === "folder" ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

      if (mergedConfig.sortDirection === "desc") {
        sorted.reverse();
      }

      return sorted.map((file) => ({
        ...file,
        children: file.children ? sortFiles(file.children) : undefined,
      }));
    },
    [mergedConfig.sortBy, mergedConfig.sortDirection]
  );

  const updateFileContent = React.useCallback(
    (files: FileNode[], path: string, content: string): FileNode[] => {
      return files.map((file) => {
        if (file.path === path) {
          return { ...file, content };
        }
        if (file.children) {
          return {
            ...file,
            children: updateFileContent(file.children, path, content),
          };
        }
        return file;
      });
    },
    []
  );

  const handleFileSelect = React.useCallback(
    (file: FileNode) => {
      try {
        setSelectedFile(file.path);
        if (file.type === "file") {
          const currentOpen = openFiles ?? [];
          const isAlreadyOpen = currentOpen.some((f) => f.path === file.path);
          if (!isAlreadyOpen) {
            setOpenFiles((prev) => [...(prev ?? []), file]);
          }
          setActiveFile(file);
          onFileOpen?.(file);
        }
      } catch (error) {
        onError?.(error as Error);
      }
    },
    [openFiles, onFileOpen, onError]
  );

  const handleFileClose = React.useCallback(
    (file: FileNode) => {
      setOpenFiles((prev) => (prev ?? []).filter((f) => f.path !== file.path));
      if (activeFile?.path === file.path) {
        const currentOpen = openFiles ?? [];
        const fallback = currentOpen[currentOpen.length - 2] || null;
        setActiveFile((prev) =>
          prev && prev.path === file.path ? fallback : prev
        );
      }
    },
    [activeFile, openFiles]
  );

  const handleFileSave = React.useCallback(
    async (path: string, content: string) => {
      try {
        const file = findFileByPath(files, path);
        if (file) {
          const updatedFiles = updateFileContent(files, path, content);
          setFiles(updatedFiles);
          setIsDirty(false);

          if (onFileSave) {
            await onFileSave(file, content);
          }

          if (onFileBrowserChange) {
            await onFileBrowserChange(updatedFiles);
          }
        }
      } catch (error) {
        onError?.(error as Error);
      }
    },
    [
      files,
      findFileByPath,
      updateFileContent,
      onFileSave,
      onFileBrowserChange,
      onError,
    ]
  );

  const insertIntoPath = React.useCallback(
    (files: FileNode[], parentPath: string, newFile: FileNode): FileNode[] => {
      if (parentPath === "") {
        return [...files, newFile];
      }

      return files.map((file) => {
        if (file.path === parentPath && file.type === "folder") {
          return {
            ...file,
            children: [...(file.children || []), newFile],
          };
        }
        if (file.children) {
          return {
            ...file,
            children: insertIntoPath(file.children, parentPath, newFile),
          };
        }
        return file;
      });
    },
    []
  );

  const handleFileCreate = React.useCallback(
    async (parentPath: string, name: string, type: "file" | "folder") => {
      try {
        const newPath = parentPath
          ? `${parentPath}${name}${type === "folder" ? "/" : ""}`
          : name;
        const newFile: FileNode = {
          id: newPath,
          name,
          type,
          path: newPath,
          content: type === "file" ? "" : undefined,
          children: type === "folder" ? [] : undefined,
        };

        const updatedFiles = insertIntoPath(files, parentPath, newFile);
        const sortedUpdatedFiles = sortFiles(updatedFiles);
        setFiles(sortedUpdatedFiles);

        if (onFileCreate) {
          await onFileCreate(newFile);
        }

        if (onFileBrowserChange) {
          await onFileBrowserChange(sortedUpdatedFiles);
        }
      } catch (error) {
        onError?.(error as Error);
      }
    },
    [
      insertIntoPath,
      sortFiles,
      onFileCreate,
      onFileBrowserChange,
      files,
      onError,
    ]
  );

  const handleFileDelete = React.useCallback(
    async (path: string) => {
      try {
        const fileToDelete = findFileByPath(files, path);
        if (!fileToDelete) return;

        const deleteFileFromArray = (files: FileNode[]): FileNode[] => {
          return files.filter((file) => {
            if (file.path === path) return false;
            if (file.children) {
              file.children = deleteFileFromArray(file.children);
            }
            return true;
          });
        };

        const updatedFiles = deleteFileFromArray(files);
        setFiles(updatedFiles);

        if ((openFiles ?? []).some((f) => f.path === path)) {
          handleFileClose(fileToDelete);
        }

        if (onFileDelete) {
          await onFileDelete(fileToDelete);
        }

        if (onFileBrowserChange) {
          await onFileBrowserChange(updatedFiles);
        }
      } catch (error) {
        onError?.(error as Error);
      }
    },
    [
      files,
      openFiles,
      findFileByPath,
      handleFileClose,
      onFileDelete,
      onFileBrowserChange,
      onError,
    ]
  );

  const handleFileRename = React.useCallback(
    async (path: string, newName: string) => {
      try {
        const renameFileInArray = (files: FileNode[]): FileNode[] => {
          return files.map((file) => {
            if (file.path === path) {
              const oldName = file.name;
              const extension = oldName.includes(".")
                ? oldName.split(".").pop()
                : "";
              const newPath = path.replace(oldName, newName);

              // If this is a folder, update all child paths
              if (file.children) {
                const updateChildPaths = (
                  children: FileNode[],
                  oldPath: string,
                  newPath: string
                ): FileNode[] => {
                  return children.map((child) => ({
                    ...child,
                    path: child.path.replace(oldPath, newPath),
                    metadata: {
                      ...child.metadata,
                      oldPath: child.path,
                    },
                    children: child.children
                      ? updateChildPaths(child.children, oldPath, newPath)
                      : undefined,
                  }));
                };

                file.children = updateChildPaths(file.children, path, newPath);
              }

              return {
                ...file,
                name: newName,
                path: newPath,
                metadata: {
                  ...file.metadata,
                  oldPath: path,
                },
              };
            }

            if (file.children) {
              return {
                ...file,
                children: renameFileInArray(file.children),
              };
            }

            return file;
          });
        };

        const updatedFiles = renameFileInArray(files);
        setFiles(updatedFiles);

        // Update path in open files
        setOpenFiles((prev) =>
          (prev ?? []).map((file) => {
            if (file.path === path) {
              return {
                ...file,
                name: newName,
                path: file.path.replace(file.name, newName),
                metadata: {
                  ...file.metadata,
                  oldPath: file.path,
                },
              };
            }
            return file;
          })
        );

        // If this was the active file, update it
        if (activeFile && activeFile.path === path) {
          setActiveFile((prev) =>
            prev
              ? {
                  ...prev,
                  name: newName,
                  path: prev.path.replace(prev.name, newName),
                  metadata: {
                    ...prev.metadata,
                    oldPath: prev.path,
                  },
                }
              : null
          );
        }

        if (onFileRename) {
          await onFileRename(path, newName);
        }

        if (onFileBrowserChange) {
          await onFileBrowserChange(updatedFiles);
        }
      } catch (error) {
        onError?.(error as Error);
      }
    },
    [files, activeFile, onFileRename, onFileBrowserChange, onError]
  );

  const sortedFiles = React.useMemo(() => sortFiles(files), [files, sortFiles]);

  React.useEffect(() => {
    if (activeFile) {
      setContent(activeFile.content || "");
      setIsDirty(false);
    }
  }, [activeFile]);

  const handleContentChange = (value: string) => {
    if (!config?.readOnly) {
      setContent(value);
      setIsDirty(true);
    }
  };

  // Provide a Dispatch-compatible handler so callers expecting
  // React.Dispatch<SetStateAction<string>> can pass either a string
  // or an updater function.
  const handleContentChangeDispatch: React.Dispatch<React.SetStateAction<string>> = (
    value
  ) => {
    if (typeof value === "function") {
      // value is an updater function (prev => new)
      setContent((prev) => {
        const newVal = (value as (prev: string) => string)(prev);
        setIsDirty(true);
        return newVal;
      });
    } else {
      // value is a plain string
      if (!config?.readOnly) {
        setContent(value);
        setIsDirty(true);
      }
    }
  };

  const handleSave = () => {
    if (activeFile && isDirty) {
      handleFileSave(activeFile.path, content);
      setIsDirty(false);
    }
  };

  // Add keyboard shortcut handler for Ctrl+S
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (activeFile && isDirty) {
          handleFileSave(activeFile.path, content);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeFile, isDirty, content]);

  const renderCodeEditor = () => {
    // Check for custom editor for the active file
    if (customEditors && activeFile) {
      const customEditor = customEditors.find((editor) => editor.path === activeFile.path);
      if (customEditor) {
        return customEditor.renderEditor({
          file: activeFile,
          config: mergedConfig,
          content,
          readOnly,
          onContentChange: handleContentChangeDispatch,
          renderFileContent,
        });
      }
    }
    return (
      <CodeEditor
        file={activeFile || null}
        config={mergedConfig}
        content={content}
        readOnly={readOnly}
        onContentChange={handleContentChangeDispatch}
        renderFileContent={renderFileContent}
      />
    );
  };

  return (
    <div className="h-[calc(100vh-12vh)] w-full overflow-hidden">
      <ResizablePanelGroup
        direction="horizontal"
        className={cn(
          mergedConfig.theme?.background,
          mergedConfig.theme?.textColor,
          className
        )}
      >
        <ResizablePanel defaultSize={30}>
          <FileTree
            title={title}
            files={sortedFiles}
            onFileSelect={handleFileSelect}
            onFileCreate={!readOnly ? handleFileCreate : undefined}
            onFileDelete={!readOnly ? handleFileDelete : undefined}
            onFileRename={!readOnly ? handleFileRename : undefined}
            selectedFile={selectedFile}
            config={mergedConfig}
            customRenderer={customRenderer}
            additionalHeaderActions={additionalHeaderActions}
            readOnly={readOnly}
            expandedFolders={expandedFolders ?? undefined}
            setExpandedFolders={(value) => {
              if (typeof value === 'function') {
                setExpandedFolders((prev) => {
                  const result = value(prev === null ? undefined : prev);
                  return result === undefined ? null : result;
                });
              } else {
                setExpandedFolders(value === undefined ? null : value);
              }
            }}
            editingFile={editingFile}
            setEditingFile={setEditingFile}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={70}>
          <EditorTabs
            openFiles={openFiles}
            activeFile={activeFile || null}
            onFileSelect={handleFileSelect}
            onFileClose={handleFileClose}
            config={mergedConfig}
            onSave={handleSave}
            isDirty={isDirty}
            content={content}
          />
          {renderCodeEditor()}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
