"use client";
import { useState, useCallback, type ReactNode, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, Menu } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip";
import { Button } from "../button";
import { Separator } from "../separator";
import { cn } from "../../lib";

// Types
interface TabItem<T extends string> {
  id: T;
  label?: string;
  icon?: ReactNode;
  content?: ReactNode;
  isSeparator?: boolean;
}

interface SettingsLayoutProps<T extends string> {
  tabs: TabItem<T>[];
  defaultTab?: T;
  className?: string;
  sidebarClassName?: string;
  contentClassName?: string;
  renderContent?: (activeTab?: T) => ReactNode;
  renderHeader?: (options: {
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    activeTab?: T;
  }) => ReactNode;
  onTabChange?: (tab: T) => void;
  disableSidebarCollapser?: boolean;
}

interface SidebarProps<T extends string> {
  tabs: TabItem<T>[];
  activeTab?: T;
  onTabChange: (tab: T) => void;
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  disableSidebarCollapser?: boolean;
}

// Sidebar Component
function SettingsSidebar<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  className,
  isCollapsed,
  onToggleCollapse,
  disableSidebarCollapser,
}: SidebarProps<T>) {
  return (
    <div
      className={cn(
        "relative w-full transition-all duration-300 ease-in-out",
        isCollapsed ? "md:w-11" : "md:w-64",
        className
      )}
    >
      <div className="sticky top-6">
        <nav className="flex flex-col space-y-1 relative">
          {!disableSidebarCollapser && (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <div className="w-full">
                  <Button
                    onClick={onToggleCollapse}
                    variant="secondary"
                    size="sm"
                    className="flex justify-start items-center gap-2 w-full"
                  >
                    {isCollapsed ? (
                      <Menu className="h-5 w-5" />
                    ) : (
                      <>
                        <ChevronLeft className="h-4 w-4" />
                        <span>Collapse Sidebar</span>
                      </>
                    )}
                  </Button>
                  <Separator className="my-2" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                Press Shift+B to toggle sidebar
              </TooltipContent>
            </Tooltip>
          )}

          {tabs.map((tab) => {
            if (tab.isSeparator) {
              return tab.label ? (
                <div key={tab.id} className={cn("flex items-center gap-2 py-2", !isCollapsed ? "pl-1" : "")}>
                  <span className="text-xs text-muted-foreground font-bold">{tab.label}</span>
                  <Separator className="flex-1" />
                </div>
              ) : (
                <Separator key={tab.id} className="my-2" />
              );
            }

            return (
              <Tooltip key={tab.id} delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    {tab.icon && (
                      <div className={cn("flex-shrink-0", "size-4 mb-1")}>
                        {tab.icon}
                      </div>
                    )}
                    {!isCollapsed && tab.label}
                  </button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right" sideOffset={10}>
                    {tab.label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

// Main Settings Component
export function SettingsLayout<T extends string>({
  tabs,
  defaultTab,
  className,
  sidebarClassName,
  contentClassName,
  renderContent,
  renderHeader,
  onTabChange,
  disableSidebarCollapser,
}: SettingsLayoutProps<T>) {
  const [activeTab, setActiveTab] = useState<T | undefined>();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "B") {
        setIsCollapsed((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Set active tab from URL query param or default
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab") as T;
    if (tabFromUrl && tabs.some((tab) => tab.id === tabFromUrl)) {
      setActiveTab(tabFromUrl);
      onTabChange?.(tabFromUrl);
    } else if (defaultTab) {
      setActiveTab(defaultTab);
      updateQueryParam(defaultTab);
    } else if (tabs && tabs.length > 0 && tabs[0]) {
      setActiveTab(tabs[0].id);
      updateQueryParam(tabs[0].id);
    }
  }, [defaultTab, tabs]);

  const updateQueryParam = useCallback(
    (tab: T) => {
      setSearchParams({ tab }, { replace: true });
    },
    [setSearchParams]
  );

  const handleTabChange = useCallback(
    (tab: T) => {
      setActiveTab(tab);
      updateQueryParam(tab);
      onTabChange?.(tab);
    },
    [onTabChange, updateQueryParam]
  );

  return (
    <div className={cn("bg-background pt-5", className)}>
      <div className="flex flex-col gap-6 md:flex-row md:gap-10">
        <SettingsSidebar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          className={sidebarClassName}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
          disableSidebarCollapser={disableSidebarCollapser}
        />
        <div className={cn("flex-1", contentClassName)}>
          {renderHeader?.({
            isCollapsed,
            onToggleCollapse: () => setIsCollapsed((prev) => !prev),
            activeTab,
          })}
          {renderContent?.(activeTab) ??
            tabs.find((tab) => tab.id === activeTab)?.content}
        </div>
      </div>
    </div>
  );
}
