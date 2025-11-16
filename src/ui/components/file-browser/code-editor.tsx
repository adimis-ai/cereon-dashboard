"use client";

import { cn } from "../../lib/utils";
import { CodeEditorProps } from "./types";
import { MonacoEditorComponent } from "../monaco";

export function CodeEditor({
  file,
  config,
  content,
  readOnly,
  onContentChange,
  renderFileContent,
}: CodeEditorProps) {
  const theme = config?.theme?.darkMode ? "dark" : "light";

  if (!file) {
    return (
      <div
        className={cn(
          "flex-1 flex items-center justify-center h-full",
          config?.theme?.textColor || "text-muted-foreground"
        )}
      >
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No file selected</h3>
          <p className="text-sm">Select a file from the explorer</p>
        </div>
      </div>
    );
  }

  const getLanguage = () => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    const fileName = file.name.toLowerCase();

    // Special cases for specific file names
    if (fileName === "dockerfile" || fileName.endsWith(".dockerfile"))
      return "dockerfile";
    if (fileName === ".env" || fileName.endsWith(".env")) return "ini";
    if (fileName === "makefile") return "makefile";

    switch (ext) {
      // Infrastructure as Code
      case "tf":
      case "tfvars":
      case "hcl":
        return "terraform";
      case "tfstate":
        return "json";

      // Web technologies
      case "js":
      case "jsx":
        return "javascript";
      case "ts":
      case "tsx":
        return "typescript";
      case "html":
      case "htm":
        return "html";
      case "css":
        return "css";
      case "scss":
      case "sass":
        return "scss";
      case "less":
        return "less";

      // Configuration files
      case "json":
      case "jsonc":
        return "json";
      case "yaml":
      case "yml":
        return "yaml";
      case "toml":
        return "toml";
      case "ini":
        return "ini";

      // Infrastructure and automation
      case "sh":
      case "bash":
        return "shell";
      case "ps1":
        return "powershell";
      case "bat":
      case "cmd":
        return "bat";

      // Programming languages
      case "py":
        return "python";
      case "java":
        return "java";
      case "cs":
        return "csharp";
      case "cpp":
      case "cc":
      case "cxx":
        return "cpp";
      case "c":
        return "c";
      case "go":
        return "go";
      case "rs":
        return "rust";
      case "rb":
        return "ruby";
      case "php":
        return "php";
      case "pl":
        return "perl";
      case "kt":
      case "kts":
        return "kotlin";
      case "swift":
        return "swift";

      // Markup and documentation
      case "md":
      case "mdx":
        return "markdown";
      case "xml":
        return "xml";
      case "svg":
        return "xml";
      case "vue":
        return "vue";

      // Database
      case "sql":
        return "sql";

      // Other
      case "r":
        return "r";
      case "dart":
        return "dart";
      case "lua":
        return "lua";
      case "gradle":
        return "gradle";

      default:
        // Try to detect if it's a dot file (like .gitignore, .npmrc)
        if (fileName.startsWith(".")) {
          if (fileName === ".gitignore") return "ini";
          if (fileName === ".dockerignore") return "ini";
          return "ini";
        }
        return "plaintext";
    }
  };

  return (
    <div
      className={cn(
        "flex-1 flex flex-col h-full w-full min-w-0 overflow-hidden",
        config?.theme?.glassEffect && "backdrop-blur-md"
      )}
    >
      <div className="flex-1 min-h-0 min-w-0 relative">
        {renderFileContent ? (
          renderFileContent({
            file,
            config,
            content,
            onContentChange,
            getLanguage: getLanguage,
            readOnly: readOnly,
          })
        ) : (
          <MonacoEditorComponent
            defaultValue={content}
            onChange={onContentChange}
            theme={theme}
            title={file.name}
            description={`Editing ${file.name}`}
            language={getLanguage()}
            readOnly={config?.readOnly || false}
            height="100%"
            options={{
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              fontSize: 14,
              lineNumbers: "on",
              renderLineHighlight: "all",
              automaticLayout: true,
              readOnly: readOnly,
              wordWrap: "on",
            }}
            panel={false}
          />
        )}
      </div>
    </div>
  );
}
