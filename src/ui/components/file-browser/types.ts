import { ReactNode } from "react";

export interface FileNodeMetadata {
  oldPath?: string;
  [key: string]: any;
}

export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  content?: string;
  path: string;
  icon?: string;
  metadata?: FileNodeMetadata;
}

export interface CustomCodeEditor {
  path: string;
  renderEditor: (props: CodeEditorProps) => ReactNode;
}

export interface FileBrowserTheme {
  background?: string;
  textColor?: string;
  accentColor?: string;
  borderColor?: string;
  selectedBackground?: string;
  hoverBackground?: string;
  glassEffect?: boolean;
  darkMode?: boolean;
  highlightColor?: string;
  secondaryBackground?: string;
  scrollbarColor?: string;
  scrollbarHoverColor?: string;
}

export interface FileTypeConfig {
  icon?: React.ReactNode;
  color?: string;
  extensions: string[];
}

export interface FileBrowserConfig {
  theme?: FileBrowserTheme;
  fileTypes?: FileTypeConfig[];
  showHiddenFiles?: boolean;
  allowedFileTypes?: string[];
  sortBy?: "name" | "type" | "size" | "modified";
  sortDirection?: "asc" | "desc";
  readOnly?: boolean;
}

export interface CodeEditorProps {
  file: FileNode | null;
  config?: FileBrowserConfig;
  content: string;
  onContentChange: React.Dispatch<React.SetStateAction<string>>;
  renderFileContent?: (
    props: Omit<CodeEditorProps, "renderFileContent"> & {
      getLanguage: () => string;
    }
  ) => React.ReactNode;
  readOnly?: boolean;
}

export interface FileBrowserProps {
  title?: string;
  initialFiles?: FileNode[];
  config?: FileBrowserConfig;
  onFileOpen?: (file: FileNode) => void | Promise<void>;
  onFileCreate?: (file: FileNode) => void | Promise<void>;
  onFileDelete?: (file: FileNode) => void | Promise<void>;
  onFileRename?: (oldPath: string, newPath: string) => void | Promise<void>;
  onFileSave?: (file: FileNode, content: string) => void | Promise<void>;
  onError?: (error: Error) => void;
  readOnly?: boolean;
  customRenderer?: (file: FileNode) => React.ReactNode;
  className?: string;
  activeFile?: FileNode | null;
  onFileBrowserChange?: (data: FileNode[]) => Promise<void>;
  renderFileContent?: (
    props: Omit<CodeEditorProps, "renderFileContent"> & {
      getLanguage: () => string;
    }
  ) => React.ReactNode;
  additionalHeaderActions?: React.ReactNode;
  customEditors?: CustomCodeEditor[];
}
