"use client";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { DynamicTabs } from "../ui";
import { Badge } from "../ui";
import { RotateCw } from "lucide-react";
import { cn } from "../ui";
import { useDashboard } from "../contexts/dashboard";
import { NumberCard } from "../cards/number";
import { TableCard } from "../cards/table";
import { HtmlCard } from "../cards/html";
import { IframeCard } from "../cards/iframe";
import { MarkdownCard } from "../cards/markdown";
import {
  AreaChartCard,
  BarChartCard,
  LineChartCard,
  PieChartCard,
  RadarChartCard,
  RadialChartCard,
} from "../cards/charts";
import { DashboardReport } from "./DashboardReport";
import "../ui/styles/globals.css";

/**
 * Main Dashboard component that renders the complete dashboard system.
 * Features:
 * - Tabbed report navigation
 * - Resizable and draggable cards
 * - High-performance rendering with minimal re-renders
 * - Theme support
 * - Keyboard shortcuts
 * - Accessibility features
 */
export function Dashboard({
  className,
  style,
  singleReport = false,
  registerDefaultCards = true,
}: {
  className?: string;
  singleReport?: boolean;
  style?: React.CSSProperties;
  registerDefaultCards?: boolean;
}) {
  const {
    spec,
    activeReportId,
    setActiveReportId,
    theme,
    animations,
    reportStates,
    registerCard,
    registeredCards,
  } = useDashboard();

  useEffect(() => {
    if (!registerDefaultCards) return;
    try {
      if (registerCard) {
        if (!registeredCards?.number) registerCard("number", NumberCard as any);
        if (!registeredCards?.table) registerCard("table", TableCard as any);
        if (!registeredCards?.html) registerCard("html", HtmlCard as any);
        if (!registeredCards?.iframe) registerCard("iframe", IframeCard as any);
        if (!registeredCards?.markdown)
          registerCard("markdown", MarkdownCard as any);
        if (!registeredCards?.area) registerCard("area", AreaChartCard as any);
        if (!registeredCards?.bar) registerCard("bar", BarChartCard as any);
        if (!registeredCards?.line) registerCard("line", LineChartCard as any);
        if (!registeredCards?.pie) registerCard("pie", PieChartCard as any);
        if (!registeredCards?.radar)
          registerCard("radar", RadarChartCard as any);
        if (!registeredCards?.radial)
          registerCard("radial", RadialChartCard as any);
      }
    } catch (e) {
      console.warn("Failed to register default dashboard cards", e);
    }
  }, [registerDefaultCards]);

  if (!spec) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <div className="text-lg font-medium">No dashboard configuration</div>
          <div className="text-sm">
            Please provide a valid dashboard specification
          </div>
        </div>
      </div>
    );
  }

  const currentReportId = activeReportId ?? spec.reports[0]?.id;

  const animationVariants = {
    none: { duration: 0 },
    subtle: { duration: 0.15, ease: "easeOut" as const },
    smooth: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
    dynamic: { duration: 0.5, ease: "backOut" as const },
  };

  const getReportLoadingState = (reportId: string) => {
    const reportState = reportStates[reportId];
    return reportState?.isLoading ?? false;
  };

  const getReportCardCount = (reportId: string) => {
    const report = spec.reports.find((r) => r.id === reportId);
    return report?.reportCards?.length ?? 0;
  };

  useEffect(() => {
    const handleUrlChange = () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const urlReportId = params.get("dashboard-tabs");
        if (
          urlReportId &&
          urlReportId !== activeReportId &&
          spec.reports.find((r) => r.id === urlReportId)
        ) {
          setActiveReportId(urlReportId);
        }
      }
    };

    // Listen for URL changes
    window.addEventListener("popstate", handleUrlChange);

    // Initial sync
    handleUrlChange();

    return () => {
      window.removeEventListener("popstate", handleUrlChange);
    };
  }, [activeReportId, setActiveReportId, spec.reports]);

  const tabs = spec.reports.map((report) => ({
    value: report.id,
    label: report.title,
    icon: getReportLoadingState(report.id) ? (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
        className="w-3 h-3"
      >
        <RotateCw className="w-3 h-3 text-muted-foreground" />
      </motion.div>
    ) : (
      <Badge variant="secondary" className="text-xs h-4 px-1.5 mr-1.5">
        {getReportCardCount(report.id)}
      </Badge>
    ),
    content: (
      <motion.div
        initial={animations !== "none" ? { opacity: 0, y: 10 } : undefined}
        animate={{ opacity: 1, y: 0 }}
        exit={animations !== "none" ? { opacity: 0, y: -10 } : undefined}
        transition={animationVariants[animations]}
        className="h-full"
      >
        <DashboardReport
          report={report}
          dashboardId={spec.id}
          enableLayoutPersistence={true}
        />
      </motion.div>
    ),
  }));

  // const additionalActions = (
  //   <div className="flex items-center gap-2 ml-5">
  //     <ButtonGroup>
  //       <Button
  //         variant="outline"
  //         size="icon"
  //         onClick={(e) => {
  //           e.preventDefault();
  //           if (!spec || !currentReportId) return;
  //           const reportSpec = spec.reports.find(
  //             (r) => r.id === currentReportId
  //           );
  //           if (!reportSpec) return;
  //           // Derive original positions from spec (gridPosition or settings.gridPosition) fallback defaults
  //           const originalPositions = reportSpec.reportCards.map(
  //             (card, index) => {
  //               const pos = card.gridPosition ??
  //                 card.settings?.gridPosition ?? {
  //                   x: (index * 4) % 12,
  //                   y: Math.floor((index * 4) / 12),
  //                   w: 4,
  //                   h: 3,
  //                   minW: 2,
  //                   minH: 2,
  //                   isDraggable: true,
  //                   isResizable: true,
  //                 };
  //               return pos;
  //             }
  //           );
  //           updateReportLayout(currentReportId, originalPositions);
  //           setReRenderTrigger((prev) => prev + 1);
  //         }}
  //         title="Refresh Dashboard"
  //       >
  //         <RefreshCcw className="w-4 h-4" />
  //       </Button>
  //     </ButtonGroup>
  //   </div>
  // );

  return (
    <div
      className={cn(
        // "dashboard-container flex flex-col h-full bg-background",
        className
      )}
      style={style}
      data-theme={theme}
      data-animations={animations}
    >
      <div className="bg-background">
        {singleReport ? (
          <div className="h-full">{tabs[0]?.content}</div>
        ) : (
          <DynamicTabs
            tabs={tabs}
            title="dashboard"
            variant="default"
            defaultValue={currentReportId || spec.reports[0]?.id || ""}
            // additionalActions={additionalActions}
            className="w-full"
          />
        )}
      </div>
    </div>
  );
}
