"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/index";

/**
 * Fix strategy applied:
 * - Ensure no React hooks run at module scope.
 * - Use forwardRef for Radix primitives (keeps ref passthrough and matches expected component shapes).
 * - Keep all hooks strictly inside function component bodies.
 * - Add small runtime guards for `window`/`localStorage` access inside effects.
 *
 * This file is a drop-in replacement for the user's file.
 */

/* ----------------------------- Styling variants ---------------------------- */

const tabsListVariants = cva("inline-flex items-center justify-center", {
  variants: {
    variant: {
      default: "bg-muted text-muted-foreground h-9 w-fit rounded-lg p-1",
      pills: "bg-transparent gap-2",
      underline: "border-b border-border h-10 w-full gap-4",
      cards: "bg-transparent gap-2",
      segments: "bg-input p-1 rounded-lg gap-0.5",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: [
          "text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground",
          "h-8 rounded-md px-3 text-sm",
          "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
          "data-[state=active]:shadow-sm",
        ],
        pills: [
          "text-muted-foreground data-[state=active]:text-primary",
          "rounded-full px-4 py-2 text-sm",
          "hover:bg-muted/60",
          "data-[state=active]:bg-primary/10 dark:data-[state=active]:bg-primary/20",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        ],
        underline: [
          "text-muted-foreground data-[state=active]:text-foreground",
          "relative h-10 rounded-none border-b-2 border-transparent px-4 text-sm",
          "hover:text-foreground",
          "data-[state=active]:border-primary",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:scale-x-0 after:bg-primary after:transition-transform hover:after:scale-x-100 data-[state=active]:after:scale-x-100",
        ],
        cards: [
          "text-muted-foreground data-[state=active]:text-foreground",
          "rounded-lg border border-transparent px-4 py-2 text-sm shadow-none",
          "hover:bg-muted/40",
          "data-[state=active]:bg-background data-[state=active]:border-border data-[state=active]:shadow-sm",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        ],
        segments: [
          "text-muted-foreground data-[state=active]:text-foreground",
          "h-8 rounded-md px-3 text-sm font-normal",
          "data-[state=active]:bg-background data-[state=active]:shadow-sm",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/* -------------------------------- Components -------------------------------- */

/**
 * Tabs (root)
 * forwardRef ensures correct ref handling for Radix primitives and avoids
 * accidental hook-like behavior outside component bodies.
 */
type TabsProps = React.ComponentProps<typeof TabsPrimitive.Root> & {
  variant?: VariantProps<typeof tabsListVariants>["variant"];
};

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <TabsPrimitive.Root
        // data attribute kept from original file
        data-slot="tabs"
        ref={ref}
        className={cn("flex flex-col", className)}
        {...props}
      />
    );
  }
);
Tabs.displayName = "Tabs";

/**
 * TabsList
 */
type TabsListProps = React.ComponentProps<typeof TabsPrimitive.List> & {
  variant?: VariantProps<typeof tabsListVariants>["variant"];
};

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <TabsPrimitive.List
        data-slot="tabs-list"
        ref={ref}
        className={cn(tabsListVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
TabsList.displayName = "TabsList";

/**
 * TabsTrigger
 */
type TabsTriggerProps = React.ComponentProps<typeof TabsPrimitive.Trigger> & {
  variant?: VariantProps<typeof tabsTriggerVariants>["variant"];
};

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <TabsPrimitive.Trigger
        data-slot="tabs-trigger"
        ref={ref}
        className={cn(tabsTriggerVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";

/**
 * TabsContent
 */
const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      ref={ref}
      className={cn(
        "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  );
});
TabsContent.displayName = "TabsContent";

/* -------------------------------- DynamicTabs -------------------------------- */

interface Tab {
  value: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode | string;
}

interface DynamicTabsProps {
  tabs: Tab[];
  title?: string;
  defaultValue: string;
  className?: string;
  tabNameEditable?: boolean;
  enableAddRemoveTabs?: boolean;
  enableTabReordering?: boolean;
  variant?: "default" | "panel";
  additionalActions?: React.ReactNode;
}

const DynamicTabs: React.FC<DynamicTabsProps> = ({
  tabs,
  title,
  defaultValue,
  className,
  variant = "panel",
  additionalActions,
}) => {
  // Derived storageKey (stable string, no hooks)
  const storageKey = React.useMemo(() => title ? `${title}-tabs` : null, [title]);

  // Active tab state
  const [activeTab, setActiveTab] = React.useState<string>(defaultValue);

  // Hydrate from localStorage (client-only)
  React.useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) setActiveTab(stored);
    } catch {
      // ignore storage access errors
    }
  }, [storageKey]);

  // Persist changes to localStorage (client-only)
  React.useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, activeTab);
    } catch {
      // ignore storage access errors
    }
  }, [storageKey, activeTab]);

  return (
    <Tabs
      {...(title
        ? { value: activeTab, onValueChange: setActiveTab }
        : { defaultValue })}
      className={cn("p-0", className)}
    >
      <div className="flex items-center justify-between">
        <TabsList
          className={cn(
            variant === "default" &&
              "inline-flex h-11 items-center text-muted-foreground w-full justify-start rounded-none bg-transparent"
          )}
        >
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={cn(
                variant === "default" &&
                  "inline-flex items-center justify-center gap-2 whitespace-nowrap py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background relative h-9 rounded-none border-b-2 border-b bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
              )}
            >
              {tab.icon && typeof tab.icon === "string" ? (
                <span className="w-4 h-4">{tab.icon}</span>
              ) : (
                tab.icon
              )}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {additionalActions}
      </div>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className={"p-0"}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent, DynamicTabs };
