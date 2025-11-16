import React, {
  useMemo,
  useCallback,
  useEffect,
  useState,
  useRef,
} from "react";
import { motion } from "framer-motion";
import { Layout, Responsive, WidthProvider } from "react-grid-layout";
import { DashboardReportSpec } from "../types";
import { CardGridPosition } from "../types";
import { useDashboard } from "../contexts/dashboard";
import { cn } from "../ui/lib";
import {
  saveLayoutToStorage,
  loadLayoutFromStorage,
  createDebouncedSave,
  isStorageAvailable,
  type PersistedLayout,
} from "../utils/layout-persistence";

import "react-grid-layout/css/styles.css";
import "./DashboardReport.module.css";
import { DashboardCard } from "./DashboardCard";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardReportProps {
  dashboardId: string;
  report: DashboardReportSpec;
  className?: string;
  onLayoutChange?: (layout: Layout[]) => void;
  enableLayoutPersistence?: boolean;
}

const DEFAULT_LAYOUT_CONFIG = {
  columns: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
  breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
  rowHeight: 60,
  margin: [16, 16] as [number, number],
  containerPadding: [16, 16] as [number, number],
  compactType: "vertical" as "vertical" | "horizontal" | null,
  preventCollision: false,
  allowOverlap: false,
  autoSize: true,
  isDraggable: true,
  isResizable: true,
  isBounded: false,
  useCSSTransforms: true,
  transformScale: 1,
};

const CARD_SIZE_CONSTRAINTS = {
  minW: 2,
  minH: 3,
  maxW: 12,
  maxH: 20,
};

const getEffectiveHeight = (cardKind: string, h: number) => {
  return cardKind === "number" ? h : h * 3;
};

const getDefaultCardSize = (cardKind: string) => {
  const defaults = {
    number: { w: 3, h: 4 },
    chart: { w: 6, h: 8 },
    table: { w: 8, h: 10 },
    markdown: { w: 6, h: 6 },
    iframe: { w: 8, h: 10 },
  };
  return defaults[cardKind as keyof typeof defaults] || { w: 4, h: 6 };
};

export function DashboardReport({
  report,
  className,
  onLayoutChange,
  dashboardId,
  enableLayoutPersistence = true,
}: DashboardReportProps) {
  const { animations, updateReportLayout, getCardState } = useDashboard();

  const layoutRef = useRef<Layout[]>([]);
  const [isLayoutInitialized, setIsLayoutInitialized] = useState(false);
  const [dragStartTime, setDragStartTime] = useState<number>(0);
  const [savedLayout, setSavedLayout] = useState<PersistedLayout | null>(null);

  const debouncedSave = useMemo(() => createDebouncedSave(1000), []);
  useEffect(() => {
    if (enableLayoutPersistence && isStorageAvailable()) {
      const loaded = loadLayoutFromStorage({
        dashboardId: dashboardId,
        reportId: report.id,
        reportTitle: report.title,
      });
      setSavedLayout(loaded);
    }
  }, [dashboardId, report.id, report.title, enableLayoutPersistence]);

  const layoutConfig = useMemo(() => {
    const config = report.layout;
    return {
      ...DEFAULT_LAYOUT_CONFIG,
      columns: config?.columns
        ? {
            lg: config.columns,
            md: Math.max(config.columns - 2, 6),
            sm: Math.max(config.columns - 4, 4),
            xs: Math.max(config.columns - 6, 2),
            xxs: 2,
          }
        : DEFAULT_LAYOUT_CONFIG.columns,
      rowHeight: config?.rowHeight || DEFAULT_LAYOUT_CONFIG.rowHeight,
      margin: config?.margin || DEFAULT_LAYOUT_CONFIG.margin,
      containerPadding:
        config?.containerPadding || DEFAULT_LAYOUT_CONFIG.containerPadding,
      preventCollision: false,
      isDraggable: config?.enableDragDrop ?? DEFAULT_LAYOUT_CONFIG.isDraggable,
      isResizable: config?.enableResize ?? DEFAULT_LAYOUT_CONFIG.isResizable,
      compactType: "vertical" as "vertical",
    };
  }, [report.layout]);

  const layouts = useMemo(() => {
    if (!report.reportCards?.length)
      return {
        lg: [],
        md: [],
        sm: [],
        xs: [],
        xxs: [],
      };

    const generateLayoutForBreakpoint = (cols: number): Layout[] => {
      const existingPositions = new Set<string>();

      return report.reportCards.map((card, index) => {
        const cardState = getCardState(report.id, card.id);

        const persistedPosition = savedLayout?.[card.id];
        const savedPosition =
          persistedPosition || cardState.gridPosition || card.gridPosition;
        const defaultSize = getDefaultCardSize(card.kind);

        let position: CardGridPosition;

        if (
          savedPosition &&
          !existingPositions.has(`${savedPosition.x}-${savedPosition.y}`)
        ) {
          position = {
            ...savedPosition,
            w: Math.min(savedPosition.w || defaultSize.w, cols),
            ...CARD_SIZE_CONSTRAINTS,
          };
          existingPositions.add(`${position.x}-${position.y}`);
        } else {
          let x = 0;
          let y = 0;
          const w = Math.min(defaultSize.w, cols);
          const rawH = defaultSize.h;
          const h = getEffectiveHeight(card.kind, rawH);

          while (existingPositions.has(`${x}-${y}`) && y < 1000) {
            x += w;
            if (x + w > cols) {
              x = 0;
              y += 1;
            }
          }

          position = {
            x,
            y,
            w,
            h,
            ...CARD_SIZE_CONSTRAINTS,
            // ensure maxH is at least the effective height so it won't be constrained
            maxH: Math.max(CARD_SIZE_CONSTRAINTS.maxH, h),
            maxW: cols,
          };
          existingPositions.add(`${x}-${y}`);
        }

        return {
          i: card.id,
          x: position.x,
          y: position.y,
          w: position.w,
          h: position.h,
          minW: position.minW || CARD_SIZE_CONSTRAINTS.minW,
          maxW: position.maxW || Math.min(CARD_SIZE_CONSTRAINTS.maxW, cols),
          minH: position.minH || CARD_SIZE_CONSTRAINTS.minH,
          maxH:
            position.maxH || Math.max(CARD_SIZE_CONSTRAINTS.maxH, position.h),
          static: position.static || false,
          isDraggable:
            position.isDraggable ??
            card.isDraggable ??
            layoutConfig.isDraggable,
          isResizable:
            position.isResizable ??
            card.isResizable ??
            layoutConfig.isResizable,
          // if this specific card is not resizable, explicitly set empty handles
          // react-grid-layout expects a specific ResizeHandle[] type; cast to any
          resizeHandles:
            (position.isResizable ??
            card.isResizable ??
            layoutConfig.isResizable)
              ? undefined
              : ([] as unknown as any),
        };
      });
    };

    return {
      lg: generateLayoutForBreakpoint(layoutConfig.columns.lg),
      md: generateLayoutForBreakpoint(layoutConfig.columns.md),
      sm: generateLayoutForBreakpoint(layoutConfig.columns.sm),
      xs: generateLayoutForBreakpoint(layoutConfig.columns.xs),
      xxs: generateLayoutForBreakpoint(layoutConfig.columns.xxs),
    };
  }, [report.reportCards, report.id, getCardState, layoutConfig, savedLayout]);

  const handleLayoutChange = useCallback(
    (currentLayout: Layout[], allLayouts: { [key: string]: Layout[] }) => {
      if (!isLayoutInitialized) {
        setIsLayoutInitialized(true);
        return;
      }

      layoutRef.current = currentLayout;

      updateReportLayout(
        report.id,
        currentLayout.map((item) => ({
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
          minW: item.minW,
          maxW: item.maxW,
          minH: item.minH,
          maxH: item.maxH,
          static: item.static,
          isDraggable: item.isDraggable,
          isResizable: item.isResizable,
        }))
      );

      if (enableLayoutPersistence && isStorageAvailable()) {
        debouncedSave(currentLayout, {
          dashboardId: dashboardId,
          reportId: report.id,
          reportTitle: report.title,
        });
      }

      onLayoutChange?.(currentLayout);
    },
    [
      isLayoutInitialized,
      report.id,
      report.title,
      updateReportLayout,
      onLayoutChange,
      enableLayoutPersistence,
      dashboardId,
      debouncedSave,
    ]
  );

  const rectanglesOverlap = useCallback((rect1: any, rect2: any): boolean => {
    return !(
      rect1.x + rect1.w <= rect2.x ||
      rect2.x + rect2.w <= rect1.x ||
      rect1.y + rect1.h <= rect2.y ||
      rect2.y + rect2.h <= rect1.y
    );
  }, []);

  const compactLayoutVertically = useCallback(
    (layout: Layout[]): Layout[] => {
      if (!layout || layout.length === 0) return layout;

      const workingLayout = [...layout].map((item, index) => ({
        ...item,
        originalIndex: index,
      }));

      workingLayout.sort((a, b) => {
        if (a.y !== b.y) return a.y - b.y;
        if (a.x !== b.x) return a.x - b.x;
        return (a.originalIndex || 0) - (b.originalIndex || 0);
      });

      const compacted: Layout[] = [];

      for (const item of workingLayout) {
        let bestY = 0;
        let foundPosition = false;

        for (let testY = 0; testY <= item.y + 10; testY++) {
          const hasCollision = compacted.some((other) =>
            rectanglesOverlap(
              { x: item.x, y: testY, w: item.w, h: item.h },
              { x: other.x, y: other.y, w: other.w, h: other.h }
            )
          );

          if (!hasCollision) {
            bestY = testY;
            foundPosition = true;
            break;
          }
        }

        if (!foundPosition) {
          const conflictingItems = compacted.filter((other) =>
            rectanglesOverlap(
              { x: item.x, y: item.y, w: item.w, h: item.h },
              { x: other.x, y: other.y, w: other.w, h: other.h }
            )
          );

          if (conflictingItems.length > 0) {
            bestY = Math.max(
              ...conflictingItems.map((other) => other.y + other.h)
            );
          } else {
            bestY = item.y;
          }
        }

        const { originalIndex, ...cleanItem } = item;
        compacted.push({
          ...cleanItem,
          y: bestY,
        });
      }

      return compacted;
    },
    [rectanglesOverlap]
  );

  const handleDragStart = useCallback(() => {
    setDragStartTime(Date.now());
  }, []);

  const handleDragStop = useCallback(
    (layout: Layout[]) => {
      const dragDuration = Date.now() - dragStartTime;

      const compactedLayout = compactLayoutVertically(layout);

      if (dragDuration < 100) {
        setTimeout(() => {
          handleLayoutChange(compactedLayout, {});
        }, 50);
      } else {
        handleLayoutChange(compactedLayout, {});
      }
    },
    [dragStartTime, handleLayoutChange, compactLayoutVertically]
  );

  const handleResize = useCallback(
    (
      layout: Layout[],
      oldItem: Layout,
      newItem: Layout,
      placeholder: Layout
    ) => {
      handleLayoutChange(layout, {});
    },
    [handleLayoutChange]
  );

  const handleResizeStop = useCallback(
    (layout: Layout[]) => {
      // Compact the layout to remove any gaps or overlaps created by resizing
      const compactedLayout = compactLayoutVertically(layout);
      handleLayoutChange(compactedLayout, {});
    },
    [handleLayoutChange, compactLayoutVertically]
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.target === e.currentTarget) {
      switch (e.key) {
        case "ArrowDown":
        case "ArrowUp":
        case "ArrowLeft":
        case "ArrowRight":
          e.preventDefault();
          // Focus next/previous card (basic implementation)
          const cards = Array.from(
            e.currentTarget.querySelectorAll('[tabindex="0"]')
          );
          const currentIndex = cards.indexOf(e.target as Element);
          let nextIndex = currentIndex;

          switch (e.key) {
            case "ArrowDown":
            case "ArrowRight":
              nextIndex = Math.min(currentIndex + 1, cards.length - 1);
              break;
            case "ArrowUp":
            case "ArrowLeft":
              nextIndex = Math.max(currentIndex - 1, 0);
              break;
          }

          (cards[nextIndex] as HTMLElement)?.focus();
          break;
      }
    }
  }, []);

  const shouldVirtualize = report.reportCards?.length > 50;

  useEffect(() => {
    if (
      !layoutConfig.isDraggable &&
      !layoutConfig.isResizable &&
      !enableLayoutPersistence
    )
      return;

    const saveInterval = setInterval(() => {
      if (
        layoutRef.current.length > 0 &&
        enableLayoutPersistence &&
        isStorageAvailable()
      ) {
        // Backup save (in case debounced save was missed)
        console.debug("Backup auto-save for layout:", report.id);
        saveLayoutToStorage(layoutRef.current, {
          dashboardId: dashboardId,
          reportId: report.id,
          reportTitle: report.title,
        });
      }
    }, 30000); // Save every 30 seconds

    return () => clearInterval(saveInterval);
  }, [
    report.id,
    report.title,
    layoutConfig.isDraggable,
    layoutConfig.isResizable,
    enableLayoutPersistence,
    dashboardId,
  ]);

  if (!report.reportCards?.length) {
    return (
      <div
        className={cn(
          "dashboard-report w-full h-full flex items-center justify-center",
          "text-muted-foreground",
          className
        )}
      >
        <div className="text-center">
          <div className="text-lg mb-2">No cards configured</div>
          <div className="text-sm">
            Add cards to this report to get started.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "dashboard-report w-full h-full",
        "focus-within:outline-none",
        className
      )}
      onKeyDown={handleKeyDown}
      role="grid"
      aria-label={`Dashboard report: ${report.title || report.id}`}
      tabIndex={-1}
    >
      <motion.div
        initial={animations !== "none" ? { opacity: 0, y: 20 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration:
            animations === "subtle" ? 0.2 : animations === "smooth" ? 0.4 : 0.6,
          ease: "easeOut",
        }}
        className="h-full"
      >
        <ResponsiveGridLayout
          className={cn("layout", shouldVirtualize && "virtualized-layout")}
          layouts={layouts}
          breakpoints={layoutConfig.breakpoints}
          cols={layoutConfig.columns}
          rowHeight={layoutConfig.rowHeight}
          margin={layoutConfig.margin}
          containerPadding={layoutConfig.containerPadding}
          compactType={layoutConfig.compactType}
          preventCollision={false}
          allowOverlap={false}
          autoSize={layoutConfig.autoSize}
          isDraggable={layoutConfig.isDraggable}
          isResizable={layoutConfig.isResizable}
          isBounded={layoutConfig.isBounded}
          useCSSTransforms={layoutConfig.useCSSTransforms}
          transformScale={layoutConfig.transformScale}
          onLayoutChange={handleLayoutChange}
          onDragStart={handleDragStart}
          onDragStop={handleDragStop}
          onResizeStop={handleResizeStop}
          onResize={handleResize}
          draggableHandle=".card-drag-handle"
          measureBeforeMount={false}
          verticalCompact={true}
          resizeHandles={["e", "n", "ne", "nw", "s", "se", "sw", "w"]}
        >
          {report.reportCards.map((card, index) => {
            const cardState = getCardState(report.id, card.id);
            const savedPosition = cardState.gridPosition || card.gridPosition;
            const defaultSize = getDefaultCardSize(card.kind);
            const rawH = savedPosition?.h ?? defaultSize.h;
            const effectiveH = savedPosition?.h
              ? rawH
              : getEffectiveHeight(card.kind, rawH);

            const layoutProps = {
              i: card.id,
              x:
                savedPosition?.x ??
                (index * defaultSize.w) % layoutConfig.columns.lg,
              y:
                savedPosition?.y ??
                Math.floor((index * defaultSize.w) / layoutConfig.columns.lg),
              w: savedPosition?.w ?? defaultSize.w,
              h: effectiveH,
              ...CARD_SIZE_CONSTRAINTS,
              maxH: Math.max(CARD_SIZE_CONSTRAINTS.maxH, effectiveH),
              isDraggable:
                savedPosition?.isDraggable ??
                card.isDraggable ??
                layoutConfig.isDraggable,
              isResizable:
                savedPosition?.isResizable ??
                card.isResizable ??
                layoutConfig.isResizable,
              resizeHandles:
                (savedPosition?.isResizable ??
                card.isResizable ??
                layoutConfig.isResizable)
                  ? undefined
                  : ([] as unknown as any),
            };

            return (
              <div
                key={card.id}
                data-grid={layoutProps}
                className={cn(
                  "dashboard-card-container",
                  "transition-all duration-200 ease-out",
                  animations !== "none" && "motion-safe:transition-transform",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                )}
                role="gridcell"
                aria-label={`Card ${index + 1}: ${card.title || card.id}`}
                tabIndex={0}
              >
                <motion.div
                  layout={animations !== "none"}
                  transition={{
                    duration:
                      animations === "subtle"
                        ? 0.15
                        : animations === "smooth"
                          ? 0.25
                          : 0.4,
                    ease: "easeInOut",
                  }}
                  className="h-full w-full"
                >
                  <DashboardCard
                    card={card}
                    reportId={report.id}
                    className="h-full w-full"
                  />
                </motion.div>
              </div>
            );
          })}
        </ResponsiveGridLayout>
      </motion.div>

      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {isLayoutInitialized &&
          `Layout updated for ${report.title || "dashboard report"}`}
      </div>

      {shouldVirtualize && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
          Large dataset: {report.reportCards.length} cards
        </div>
      )}
    </div>
  );
}
