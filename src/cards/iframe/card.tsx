"use client";

import React, { useState, useCallback } from "react";
import { BaseCardProps } from "../../types";
import {
  BaseDashboardCardRecord,
  CommonCardSettings,
  QueryMeta,
} from "../../types";
import { cn } from "../../ui";
import {
  Monitor,
  AlertTriangle,
  Loader,
  GripVertical,
  RefreshCw,
} from "lucide-react";
import { Button } from "../../ui";

/**
 * Settings for Iframe cards
 */
export interface DashboardIframeSettings extends CommonCardSettings {
  /** Default URL to load */
  defaultUrl?: string;
  /** Enable sandbox attributes for security */
  sandbox?: string[];
  /** Allow fullscreen */
  allowFullscreen?: boolean;
  /** Referrer policy */
  referrerPolicy?:
    | "no-referrer"
    | "no-referrer-when-downgrade"
    | "origin"
    | "origin-when-cross-origin"
    | "same-origin"
    | "strict-origin"
    | "strict-origin-when-cross-origin"
    | "unsafe-url";
  /** Loading strategy */
  loading?: "eager" | "lazy";
  /** Show loading indicator */
  showLoader?: boolean;
  /** Show refresh button */
  showRefresh?: boolean;
  /** Frame title for accessibility */
  frameTitle?: string;
  /** Custom frame attributes */
  frameAttributes?: Record<string, string>;
  /** Enable responsive sizing */
  responsive?: boolean;
}

/**
 * Record payload for Iframe cards
 */
export interface DashboardIframeCardRecord extends BaseDashboardCardRecord {
  kind: "iframe";
  /** URL to load in iframe */
  url?: string;
  /** Iframe title */
  title?: string;
  /** Iframe width */
  width?: string | number;
  /** Iframe height */
  height?: string | number;
}

export interface IframeCardProps
  extends BaseCardProps<
    "iframe",
    { iframe: DashboardIframeSettings },
    { iframe: DashboardIframeCardRecord }
  > {}

/**
 * Iframe card component for embedding external content
 */
export function IframeCard({ card, records, className, theme }: IframeCardProps) {
  const settings = card.settings as DashboardIframeSettings;
  const record = records?.[0] as DashboardIframeCardRecord | undefined;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Determine the URL to use
  const url = record?.url || settings?.defaultUrl;
  const frameTitle =
    record?.title || settings.frameTitle || card.title || "Iframe content";

  // Handle iframe load events
  const handleLoad = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  const handleError = useCallback(() => {
    setLoading(false);
    setError("Failed to load content");
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setLoading(true);
    setError(null);
    setRefreshKey((prev) => prev + 1);
  }, []);

  // No URL available
  if (!url) {
    return (
      <div className={cn("h-full flex items-center justify-center", className)}>
        <div className="text-center p-4">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted/50 text-muted-foreground mb-2">
            <Monitor className="w-4 h-4" />
          </div>
          <p className="text-sm text-muted-foreground">No iframe URL</p>
          <p className="text-xs text-muted-foreground mt-1">
            Provide a URL or configure default URL
          </p>
        </div>
      </div>
    );
  }

  // Validate URL
  let validUrl: URL;
  try {
    validUrl = new URL(url);
    // Security check - only allow http/https protocols
    if (!["http:", "https:"].includes(validUrl.protocol)) {
      throw new Error("Only HTTP and HTTPS URLs are allowed");
    }
  } catch (urlError) {
    return (
      <div className={cn("h-full flex items-center justify-center", className)}>
        <div className="text-center p-4">
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
          <p className="text-sm font-medium">Invalid URL</p>
          <p className="text-xs text-muted-foreground mt-1">
            Please provide a valid HTTP or HTTPS URL
          </p>
        </div>
      </div>
    );
  }

  // Prepare sandbox attributes
  const sandboxValue = settings.sandbox
    ? settings.sandbox.join(" ")
    : "allow-same-origin allow-scripts allow-popups allow-forms";

  // Prepare iframe attributes
  const iframeProps: React.IframeHTMLAttributes<HTMLIFrameElement> = {
    src: validUrl.href,
    title: frameTitle,
    loading: settings.loading || "lazy",
    referrerPolicy:
      settings.referrerPolicy || "strict-origin-when-cross-origin",
    sandbox: sandboxValue,
    allowFullScreen: settings.allowFullscreen,
    width: record?.width || "100%",
    height: record?.height || "100%",
    onLoad: handleLoad,
    onError: handleError,
    ...settings.frameAttributes,
    className: cn(
      "w-full h-full border-0 rounded-lg",
      settings.responsive && "max-w-full"
    ),
  };

  return (
    <div className={cn("h-full", className)}>
      {/* Iframe Container */}
      <div className="relative h-full bg-card overflow-hidden">
        {/* Loading state */}
        {loading && settings.showLoader !== false && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <div className="text-center">
              <Loader className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Loading content...
              </p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <div className="text-center p-4">
              <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
              <p className="text-sm font-medium">Failed to load content</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
              {settings.showRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="mt-2"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Retry
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Iframe */}
        <iframe key={refreshKey} {...iframeProps} />
      </div>
    </div>
  );
}

export default IframeCard;
