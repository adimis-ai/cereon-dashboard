"use client";

import React, { useMemo } from "react";
import { BaseCardProps } from "../../types";
import {
  BaseDashboardCardRecord,
  CommonCardSettings,
  QueryMeta,
} from "../../types";
import { cn } from "../../ui";
import { Code, AlertTriangle, GripVertical } from "lucide-react";

/**
 * Settings for HTML cards
 */
export interface DashboardHtmlSettings extends CommonCardSettings {
  /** Enable HTML sanitization for security */
  sanitize?: boolean;
  /** Allow specific HTML tags (only if sanitize is true) */
  allowedTags?: string[];
  /** Allow specific HTML attributes (only if sanitize is true) */
  allowedAttributes?: Record<string, string[]>;
  /** Enable CSS styling */
  enableStyling?: boolean;
  /** Custom CSS classes to apply to container */
  containerClasses?: string;
  /** Default HTML content */
  defaultContent?: string;
  /** Enable scrolling for overflow content */
  enableScroll?: boolean;
  /** Maximum height for scrollable content */
  maxHeight?: string;
}

/**
 * Record payload for HTML cards
 */
export interface DashboardHtmlCardRecord extends BaseDashboardCardRecord {
  kind: "html";
  /** HTML content to display */
  content?: string;
  /** Raw HTML without sanitization (use with caution) */
  rawHtml?: string;
  /** Additional CSS styles to inject */
  styles?: string;
}

export interface HtmlCardProps
  extends BaseCardProps<
    "html",
    { html: DashboardHtmlSettings },
    { html: DashboardHtmlCardRecord }
  > {}

/**
 * HTML card component for displaying rich HTML content
 */
export function HtmlCard({ card, records, className, theme }: HtmlCardProps) {
  const settings = card.settings as DashboardHtmlSettings;
  const record = records?.[0] as DashboardHtmlCardRecord | undefined;

  // Resolve theme for consistent theming
  const resolvedTheme = theme === "system" 
    ? (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : (theme || "light");

  // Process HTML content
  const { processedHtml, hasContent, styles } = useMemo(() => {
    const recordContent = record?.content;
    const recordRawHtml = record?.rawHtml;
    const defaultContent = settings?.defaultContent;
    const recordStyles = record?.styles;

    // Determine content source
    let rawContent = recordContent || recordRawHtml || defaultContent;

    if (!rawContent) {
      return {
        processedHtml: null,
        hasContent: false,
        styles: null,
      };
    }

    let finalHtml: string;

    // Basic HTML validation and sanitization
    if (settings.sanitize !== false) {
      // Simple HTML sanitization - remove script tags and dangerous attributes
      finalHtml = rawContent
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/on\w+\s*=/gi, "")
        .replace(/javascript:/gi, "")
        .replace(/data:/gi, "");

      // Validate basic HTML structure
      try {
        // Simple validation - check for unclosed tags
        const parser = new DOMParser();
        const doc = parser.parseFromString(finalHtml, "text/html");
        if (doc.querySelector("parsererror")) {
          throw new Error("Invalid HTML structure");
        }
      } catch (error) {
        console.warn("HTML validation failed:", error);
        finalHtml = `<div class="text-destructive">Invalid HTML content</div>`;
      }
    } else {
      // Use raw HTML (potentially unsafe)
      finalHtml = rawContent;
    }

    return {
      processedHtml: finalHtml,
      hasContent: true,
      styles: recordStyles,
    };
  }, [record, settings]);

  // No content available
  if (!hasContent) {
    return (
      <div className={cn("h-full flex items-center justify-center", className)}>
        <div className="text-center p-4">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted/50 text-muted-foreground mb-2">
            <Code className="w-4 h-4" />
          </div>
          <p className="text-sm text-muted-foreground">No HTML content</p>
          <p className="text-xs text-muted-foreground mt-1">
            Provide HTML content or configure default content
          </p>
        </div>
      </div>
    );
  }

  // Error state for invalid content
  if (processedHtml === null) {
    return (
      <div className={cn("h-full flex items-center justify-center", className)}>
        <div className="text-center p-4">
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
          <p className="text-sm font-medium">Invalid HTML content</p>
          <p className="text-xs text-muted-foreground mt-1">
            Check the HTML syntax or sanitization settings
          </p>
        </div>
      </div>
    );
  }

  const containerStyles = useMemo(() => {
    const baseStyles: React.CSSProperties = {};

    if (settings?.enableScroll && settings?.maxHeight) {
      baseStyles.maxHeight = settings?.maxHeight;
      baseStyles.overflowY = "auto";
    }

    return baseStyles;
  }, [settings?.enableScroll, settings?.maxHeight]);

  return (
    <div className={cn("h-full", className)}>
      {/* HTML Content Container */}
      <div
        className={cn(
          "h-full bg-card relative",
          settings?.enableScroll && "overflow-hidden",
          settings?.containerClasses
        )}
      >
        {/* Inject custom styles if provided */}
        {styles && settings.enableStyling && (
          <style dangerouslySetInnerHTML={{ __html: styles }} />
        )}

        {/* HTML Content */}
        <div
          className={cn(
            "html-content w-full h-full",
            settings?.enableScroll && "overflow-y-auto pr-2"
          )}
          style={containerStyles}
          dangerouslySetInnerHTML={{ __html: processedHtml }}
        />
      </div>
    </div>
  );
}

export default HtmlCard;
