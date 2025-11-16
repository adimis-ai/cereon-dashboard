"use client";

import React, { useMemo } from "react";
import { BaseCardProps } from "../../types";
import {
  BaseDashboardCardRecord,
  CommonCardSettings,
  QueryMeta,
} from "../../types";
import { cn } from "../../ui";
import { FileText, AlertTriangle, GripVertical } from "lucide-react";
import MarkdownPreview from "@uiw/react-markdown-preview";
import "../../ui/styles/globals.css";

/**
 * Settings for Markdown cards
 */
export interface DashboardMarkdownSettings extends CommonCardSettings {
  /** Default markdown content */
  defaultContent?: string;
  /** Enable syntax highlighting for code blocks */
  enableCodeHighlight?: boolean;
  /** Theme for markdown rendering */
  markdownTheme?: "light" | "dark" | "auto";
  /** Maximum height for scrollable content */
  maxHeight?: string;
  /** Enable table rendering */
  enableTables?: boolean;
  /** Enable task lists (checkboxes) */
  enableTaskLists?: boolean;
  /** Enable strikethrough text */
  enableStrikethrough?: boolean;
  /** Custom CSS classes for markdown container */
  containerClasses?: string;
  /** Skip HTML sanitization (use with caution) */
  skipSanitization?: boolean;
  /** Enable line numbers for code blocks */
  showLineNumbers?: boolean;
}

/**
 * Record payload for Markdown cards
 */
export interface DashboardMarkdownCardRecord extends BaseDashboardCardRecord {
  kind: "markdown";
  /** Markdown content to render */
  content?: string;
  /** Raw markdown from external source */
  rawMarkdown?: string;
  /** Additional CSS for custom styling */
  styles?: string;
}

export interface MarkdownCardProps
  extends BaseCardProps<
    "markdown",
    { markdown: DashboardMarkdownSettings },
    { markdown: DashboardMarkdownCardRecord }
  > {}

/**
 * Markdown card component for displaying formatted markdown content
 */
export function MarkdownCard({
  card,
  records,
  className,
  theme,
}: MarkdownCardProps) {
  const settings = card.settings as DashboardMarkdownSettings;
  const record = records?.[0] as DashboardMarkdownCardRecord | undefined;

  // Process markdown content and options
  const { markdownContent, hasContent } = useMemo(() => {
    const recordContent = record?.content;
    const recordRawMarkdown = record?.rawMarkdown;
    const defaultContent = settings?.defaultContent;

    // Determine content source
    const finalContent = recordContent || recordRawMarkdown || defaultContent;

    if (!finalContent) {
      return {
        markdownContent: null,
        hasContent: false,
        theme: "light" as const,
      };
    }

    // Determine theme
    let resolvedTheme: "light" | "dark" = "light";
    if (settings?.markdownTheme === "auto") {
      // Try to detect system theme
      if (typeof window !== "undefined") {
        resolvedTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
      }
    } else {
      resolvedTheme = settings?.markdownTheme || "light";
    }

    return {
      markdownContent: finalContent,
      hasContent: true,
      theme: resolvedTheme,
    };
  }, [record, settings]);

  // Prepare markdown preview options
  const markdownOptions = useMemo(() => {
    const baseOptions = {
      skipHtml: !settings?.skipSanitization,
      allowElement: (element: any) => {
        // Allow basic HTML elements for markdown
        const allowedElements = [
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "p",
          "div",
          "span",
          "br",
          "hr",
          "strong",
          "em",
          "u",
          "s",
          "del",
          "ul",
          "ol",
          "li",
          "a",
          "img",
          "blockquote",
          "pre",
          "code",
          "table",
          "thead",
          "tbody",
          "tr",
          "th",
          "td",
          "input", // For task lists
        ];

        if (
          settings?.enableTables === false &&
          ["table", "thead", "tbody", "tr", "th", "td"].includes(
            element.tagName
          )
        ) {
          return false;
        }

        if (
          settings?.enableTaskLists === false &&
          element.tagName === "input" &&
          element.properties?.type === "checkbox"
        ) {
          return false;
        }

        return allowedElements.includes(element.tagName);
      },
    };

    return baseOptions;
  }, [settings]);

  // Container styles
  const containerStyles = useMemo(() => {
    const styles: React.CSSProperties = {};

    if (settings?.maxHeight) {
      styles.maxHeight = settings?.maxHeight;
    }
    styles.overflowY = "auto";

    return styles;
  }, [settings?.maxHeight]);

  // No content available
  if (!hasContent) {
    return (
      <div className={cn("h-full flex items-center justify-center", className)}>
        <div className="text-center p-4">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted/50 text-muted-foreground mb-2">
            <FileText className="w-4 h-4" />
          </div>
          <p className="text-sm text-muted-foreground">No markdown content</p>
          <p className="text-xs text-muted-foreground mt-1">
            Provide markdown content or configure default content
          </p>
        </div>
      </div>
    );
  }

  // Error state for invalid content
  if (markdownContent === null) {
    return (
      <div className={cn("h-full flex items-center justify-center", className)}>
        <div className="text-center p-4">
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
          <p className="text-sm font-medium">Invalid markdown content</p>
          <p className="text-xs text-muted-foreground mt-1">
            Check the markdown syntax
          </p>
        </div>
      </div>
    );
  }

  /* inside MarkdownCard return, replace the <div className="markdown-content ..."> ... <MarkdownPreview ... /> ... </div> */
  return (
    <div className={cn("h-full mt-4 pb-4", className)}>
      <div
        className={cn(
          "h-full bg-card rounded-lg relative",
          settings?.containerClasses
        )}
      >
        {record?.styles && (
          <style dangerouslySetInnerHTML={{ __html: record.styles }} />
        )}

        {/* new wrapper that applies the CSS variables exactly */}
        <div
          className="markdown-preview-root w-full h-full"
          style={{
            background: "var(--card)",
            color: "var(--card-foreground)",
          }}
          data-color-mode={theme}
        >
          <div
            className={cn(
              "markdown-content w-full h-full prose prose-sm max-w-none",
              theme === "dark" ? "prose-invert" : "",
              // Responsive typography (keep existing prose classes)
              "prose-headings:font-semibold prose-headings:text-foreground",
              "prose-p:text-foreground prose-p:leading-relaxed",
              "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
              "prose-strong:text-foreground prose-em:text-foreground",
              "prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
              "prose-pre:bg-muted prose-pre:border prose-pre:rounded-lg",
              "prose-blockquote:border-l-primary prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:text-muted-foreground",
              "prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground",
              "prose-table:text-foreground prose-th:text-foreground prose-td:text-foreground",
              "prose-hr:border-border"
            )}
            style={containerStyles}
          >
            {/* Pass className + inline style to the component to maximize compatibility */}
            <MarkdownPreview
              className="uiw-markdown-preview"
              source={markdownContent}
              style={{
                background: "transparent", // wrapper already sets card background
                color: "inherit", // inherit var(--card-foreground)
              }}
              {...markdownOptions}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MarkdownCard;
