"use client";

import { FC, useState, useEffect, useCallback } from "react";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import MDEditor from "@uiw/react-md-editor";
import { cn } from "../lib";

interface MarkdownEditorProps {
  value: string;
  onChange?: (value?: string) => void;
  height?: number;
  theme?: "light" | "dark" | "system";
  className?: string;
  preview?: "live" | "edit" | "preview";
  hideToolbar?: boolean;
  enableScroll?: boolean;
}

export const MarkdownEditor: FC<MarkdownEditorProps> = ({
  value: initialValue,
  onChange,
  height = 400,
  theme = "system",
  className,
  preview = "live",
  hideToolbar = true,
  enableScroll = true,
}) => {
  const [mounted, setMounted] = useState(false);
  const [editorValue, setEditorValue] = useState(initialValue);
  const [editorReady, setEditorReady] = useState(false);

  // Handle value changes from props
  useEffect(() => {
    if (initialValue !== editorValue) {
      setEditorValue(initialValue);
    }
  }, [initialValue]);

  // Handle editor initialization
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      document
        .querySelector('meta[http-equiv="Content-Security-Policy"]')
        ?.remove();
      setEditorReady(true);
    }
  }, []);

  // Handle editor changes
  const handleEditorChange = useCallback(
    (newValue?: string) => {
      setEditorValue(newValue || "");
      onChange?.(newValue);
    },
    [onChange]
  );

  if (!mounted || !editorReady) {
    return null;
  }

  return (
    <div className="w-md-editor-wrapper" style={{ position: "relative" }}>
      <div
        className={cn("w-full markdown-container", className)}
        data-color-mode={theme}
      >
        <style>{`
          .wmde-markdown ul {
            list-style: disc;
          }
          .wmde-markdown ul li {
            list-style: disc;
          }
          .wmde-markdown ol {
            list-style: decimal;
          }
          .wmde-markdown ol li {
            list-style: decimal;
          }
          .cm-content {
            white-space: pre-wrap !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
            word-break: break-word !important;
            max-width: 100vw;
          }
        `}</style>
        <MDEditor
          value={editorValue}
          onChange={handleEditorChange}
          height={height}
          preview={preview}
          hideToolbar={hideToolbar}
          enableScroll={enableScroll}
          textareaProps={{
            placeholder: "Start typing here...",
            "aria-label": "Markdown editor",
            className: "markdown-textarea",
          }}
        />
      </div>
    </div>
  );
};
