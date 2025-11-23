// apps/cereon-demo-client/dashboard/components/DashboardCard.tsx
import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import { CardTitle, CardDescription } from "../ui";
import { Button } from "../ui";
import { ButtonGroup } from "../ui";
import { Spinner } from "../ui";
import {
  AlertTriangle,
  Check,
  Download,
  GripVertical,
  RefreshCw,
} from "lucide-react";
import { DynamicDropdownMenu } from "../ui";
import { cn } from "../ui/lib";
import {
  CardSettingsMap,
  CardRecordMap,
  DashboardReportCardSpec,
  BaseCardProps,
  AnyCardRecord,
  PreProcessor,
  PostProcessor,
  DashboardParameters,
} from "../types";
import { useDashboard } from "../contexts/dashboard";
import { Filter } from "lucide-react";
import { useCardVisibility } from "../hooks/useCardVisibility";
import { ModalForm } from "../ui";
import { useDashboardRecord } from "../contexts/dashboard-record";
import {
  CardExecutionProvider,
  useCardExecution,
} from "../contexts/card-execution";

export interface DashboardCardProps<
  K extends string,
  M extends CardSettingsMap,
  R extends CardRecordMap = CardRecordMap,
> {
  reportId: string;
  card: DashboardReportCardSpec<K, M, R>;
  className?: string;
  runtimeParams?: DashboardParameters | null;
  filterState?: Record<string, unknown>;
  setFilterState?: React.Dispatch<
    React.SetStateAction<Record<string, unknown>>
  >;
}

type DownloadFormat = "json" | "csv";

function slugify(input: string, fallback = "data"): string {
  const s = (input || fallback)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
  return s || fallback;
}

function tsStamp(date = new Date()): string {
  const pad = (n: number) => `${n}`.padStart(2, "0");
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${y}${m}${d}_${hh}${mm}${ss}`;
}

function buildFilename(params: {
  title: string;
  reportId: string;
  cardId: string;
  ext: DownloadFormat;
}): string {
  const base = `${slugify(params.title)}_${params.reportId}_${params.cardId}_${tsStamp()}`;
  return `${base}.${params.ext}`;
}

function normalizeRecords(records: unknown[]): {
  rows: any[];
  headerOrder?: string[];
} {
  if (!Array.isArray(records)) return { rows: [] };
  const first = records[0] as any;
  if (
    first &&
    typeof first === "object" &&
    "rows" in first &&
    Array.isArray(first.rows)
  ) {
    const header =
      (Array.isArray(first.columns) &&
        first.columns.map((c: any) =>
          typeof c === "string" ? c : (c?.key ?? c?.name)
        )) ||
      (Array.isArray(first.headers) &&
        first.headers.map((h: any) =>
          typeof h === "string" ? h : (h?.key ?? h?.name)
        )) ||
      undefined;
    const shapedRows = Array.isArray(first.rows)
      ? first.rows.map((r: any) => {
          if (Array.isArray(r)) {
            if (header && header.length) {
              const obj: Record<string, any> = {};
              r.forEach((v, i) => {
                obj[header[i] ?? `c${i + 1}`] = v;
              });
              return obj;
            }
            const obj: Record<string, any> = {};
            r.forEach((v, i) => (obj[`c${i + 1}`] = v));
            return obj;
          }
          return r;
        })
      : [];
    return { rows: shapedRows, headerOrder: header };
  }
  if (
    records.every(
      (r) => r === null || ["string", "number", "boolean"].includes(typeof r)
    )
  ) {
    return { rows: records.map((v) => ({ value: v })) };
  }
  return { rows: records as any[] };
}

function toCsv(records: unknown[]): string {
  const { rows, headerOrder } = normalizeRecords(records);
  if (rows.length === 0) return "";
  const keySet = new Set<string>();
  if (headerOrder?.length) headerOrder.forEach((k) => keySet.add(k));
  rows.forEach((row) => {
    if (row && typeof row === "object" && !Array.isArray(row)) {
      Object.keys(row).forEach((k) => keySet.add(k));
    } else {
      keySet.add("value");
    }
  });
  const headers = Array.from(keySet);
  const escape = (val: any): string => {
    const s =
      val === null || val === undefined
        ? ""
        : typeof val === "string"
          ? val
          : typeof val === "number" || typeof val === "boolean"
            ? String(val)
            : JSON.stringify(val);
    if (/[",\n\r]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const lines: string[] = [];
  lines.push(headers.map(escape).join(","));
  for (const row of rows) {
    if (row && typeof row === "object" && !Array.isArray(row)) {
      lines.push(headers.map((h) => escape((row as any)[h])).join(","));
    } else {
      lines.push(
        headers.map((h) => (h === "value" ? escape(row) : "")).join(",")
      );
    }
  }
  return lines.join("\r\n");
}

function triggerDownload({
  data,
  mime,
  filename,
}: {
  data: string | BlobPart[];
  mime: string;
  filename: string;
}) {
  if (typeof window === "undefined") return;
  const blob = new Blob(Array.isArray(data) ? data : [data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function DashboardCardInternal<
  K extends string,
  M extends CardSettingsMap,
  R extends CardRecordMap = CardRecordMap,
>({
  reportId,
  card,
  className,
  runtimeParams,
  filterState,
  setFilterState,
}: DashboardCardProps<K, M, R>) {
  const { getCardState, setCardState, animations, registeredCards, theme } =
    useDashboard();
  const { cardRef, setFocus } = useCardVisibility(reportId, card.id);
  const [records] = useDashboardRecord(reportId, card.id);
  const { executeQuery, state } = useCardExecution(reportId, card.id);

  const cardState = getCardState(reportId, card.id);

  const handleRefresh = useCallback(async () => {
    if (state.loadingState === "loading") return;

    try {
      // Use card execution context for query execution
      await executeQuery({
        filters: filterState,
      });
    } catch (error) {
      // Error handling is managed by the CardExecutionProvider
      console.error("Error executing query:", error);
    }
  }, [state.loadingState, executeQuery, filterState]);

  useEffect(() => {
    // Auto-refresh on filter change
    void handleRefresh();
  }, [filterState]);

  const canDownload =
    cardState.loadingState === "success" &&
    Array.isArray(records) &&
    records.length > 0;

  const handleDownload = useCallback(
    (format: DownloadFormat) => {
      if (!canDownload) return;
      const filename = buildFilename({
        title: card.title ?? "data",
        reportId,
        cardId: card.id,
        ext: format,
      });
      if (format === "json") {
        const json = JSON.stringify(records, null, 2);
        triggerDownload({
          data: json,
          mime: "application/json;charset=utf-8",
          filename,
        });
        return;
      }
      const csv = toCsv(records);
      triggerDownload({ data: csv, mime: "text/csv;charset=utf-8", filename });
    },
    [canDownload, records, card.title, reportId, card.id]
  );

  const autoRefreshedRef = useRef(false);
  useEffect(() => {
    if (cardState.loadingState === "idle" && !autoRefreshedRef.current) {
      autoRefreshedRef.current = true;
      queueMicrotask(() => {
        void handleRefresh();
      });
    }
  }, [cardState.loadingState, handleRefresh]);

  const cardClasses = cn(
    "bg-card text-card-foreground rounded-xl border shadow-sm md:min-w-0 flex flex-col transition-all duration-200 ease-out",
    cardState.loadingState === "error" && "border-destructive",
    className
  );

  const renderFilterContent = () => {
    const filterSchema = card.settings?.filters;
    if (!filterSchema) return null;
    if (!setFilterState) return null;
    const [open, setOpen] = useState(false);

    return (
      <ModalForm
        open={open}
        onOpenChange={setOpen}
        width={filterSchema?.width ?? "min-w-2xl"}
        maxWidth={filterSchema?.maxWidth ?? "max-w-lg"}
        trigger={{
          icon: <Filter className="size-3" />,
          variant: "outline",
          size: "sm",
        }}
        title={card.title ? `${card.title} - Filters` : "Filters"}
        description={card.description ?? "Adjust filters for this card"}
        formProps={{
          formFields: filterSchema?.schema ?? [],
          disableForm: filterSchema?.disabled,
          className: filterSchema?.className,
          validationSchema: (filterSchema as any).validationSchema,
          defaultValues: filterState ?? (filterSchema as any).defaultValues,
        }}
        onSubmit={async (values: any) => {
          setFilterState((prev) => ({ ...(prev || {}), ...(values || {}) }));
        }}
      />
    );
  };

  const renderCardHeaderContent = () => {
    return (
      <div className="border-b">
        <div className="flex items-center justify-start pr-3">
          <div className="card-drag-handle cursor-move rounded flex-shrink-0">
            <GripVertical
              className={cn(
                "mr-2 text-muted-foreground",
                card.description ? "size-6" : "size-4"
              )}
            />
          </div>
          <div className="flex justify-between items-center w-full">
            <div className="flex flex-col gap-0.5">
              <CardTitle
                className={cn(
                  "font-medium leading-tight flex-1 min-w-0",
                  card.description ? "text-sm" : "text-base"
                )}
              >
                {card.title}
              </CardTitle>
              {card.description && (
                <CardDescription className="text-xs text-muted-foreground mr-2">
                  {card.description}
                </CardDescription>
              )}
            </div>
            <ButtonGroup>
              <Button
                tooltip="Refresh Dashboard"
                variant={"outline"}
                size={"sm"}
                onClick={async (e) => {
                  e.preventDefault();
                  await handleRefresh();
                }}
                icon={
                  <RefreshCw
                    className={cn(
                      "size-3",
                      state.loadingState === "loading" && "animate-spin"
                    )}
                  />
                }
              />
              {renderFilterContent()}
              <DynamicDropdownMenu
                trigger={
                  <Button
                    tooltip={
                      canDownload ? "Download data" : "No data to download"
                    }
                    variant={"outline"}
                    size={"sm"}
                    disabled={!canDownload}
                    icon={<Download className="size-3" />}
                  />
                }
                items={[
                  {
                    label: "Download JSON",
                    icon: <Check className="size-3" />,
                    onClick: () => handleDownload("json"),
                    disabled: !canDownload,
                  },
                  {
                    label: "Download CSV",
                    icon: <Download className="size-3" />,
                    onClick: () => handleDownload("csv"),
                    disabled: !canDownload,
                  },
                ]}
              />
            </ButtonGroup>
          </div>
        </div>
        <div className="mb-2" />
      </div>
    );
  };

  const renderCardFooterContent = () => {
    switch (card.kind) {
      default:
        return <></>;
    }
  };

  return (
    <Fragment key={`${reportId}-${card.id}-report-card`}>
      <div
        ref={cardRef as React.RefObject<HTMLDivElement>}
        className={cardClasses}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        tabIndex={0}
        aria-label={card.title || "Dashboard card"}
      >
        {!card.hideHeader && card.kind !== "number" && (
          <div className="px-2 pt-2">{renderCardHeaderContent()}</div>
        )}
        <div className="flex-1 overflow-hidden px-4">
          <div className={cn("h-full relative")}>
            <motion.div
              initial={animations !== "none" ? { opacity: 0, y: 10 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full flex flex-col"
            >
              {(() => {
                // Loading state
                if (cardState.loadingState === "loading") {
                  return (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Spinner className="w-6 h-6 mb-2 mx-auto" />
                        <p className="text-xs text-muted-foreground">
                          Loading data...
                        </p>
                      </div>
                    </div>
                  );
                }

                // Error state
                if (cardState.loadingState === "error") {
                  return (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <AlertTriangle className="w-6 h-6 mb-2 text-destructive mx-auto" />
                        <p className="text-xs font-medium">
                          Error loading data
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {cardState.error || "Unknown error occurred"}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRefresh}
                          className="mt-2 h-7 px-2 text-xs"
                        >
                          Try Again
                        </Button>
                      </div>
                    </div>
                  );
                }

                // Success state: use registered component
                if (cardState.loadingState === "success") {
                  // If a custom renderCard callback is provided on the card spec,
                  // call it directly with the full BaseCardProps and render its result.
                  if (typeof card.renderCard === "function") {
                    try {
                      return card.renderCard({
                        reportId,
                        state: cardState,
                        params: (runtimeParams as DashboardParameters) ?? null,
                        records: records as any,
                        card: card as any,
                        className,
                        theme: (theme as any) ?? "light",
                      } as BaseCardProps<K, M, R>);
                    } catch (e) {
                      // fall through to registered component / fallback
                      console.error("Error in card.renderCard:", e);
                    }
                  }

                  const RegisteredComponent = registeredCards?.[card.kind];
                  if (RegisteredComponent) {
                    try {
                      return (
                        <RegisteredComponent
                          reportId={reportId}
                          card={card}
                          records={records}
                          state={cardState}
                          params={runtimeParams}
                          className={className}
                        />
                      );
                    } catch (e) {
                      /* fall back */
                    }
                  }

                  return (
                    <div className="h-full flex items-center justify-center">
                      <div className="max-w-xs text-center">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-muted/50 text-muted-foreground mb-3">
                          <GripVertical className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-medium">
                          Card variant not found
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          The renderer for "{String(card.kind)}" is not
                          registered. Provide a card component for this variant
                          or check the dashboard configuration.
                        </p>
                        <div className="mt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setCardState(reportId, card.id, {
                                loadingState: "idle",
                              })
                            }
                          >
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Idle state
                if (cardState.loadingState === "idle") {
                  return (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <div className="text-xs mb-2">
                          Click refresh to load data
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRefresh}
                          className="h-7 px-2 text-xs"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Load Data
                        </Button>
                      </div>
                    </div>
                  );
                }

                return null;
              })()}
            </motion.div>
            <span className="sr-only" aria-live="polite">
              Use edges or corners to resize this card vertically or
              horizontally.
            </span>
          </div>
        </div>
        {!card.hideFooter && renderCardFooterContent()}
      </div>
    </Fragment>
  );
}

export function DashboardCard<
  K extends string,
  M extends CardSettingsMap,
  R extends CardRecordMap = CardRecordMap,
>({ reportId, card, className }: DashboardCardProps<K, M, R>) {
  const {
    parameters: runtimeParams,
    getCardProcessors,
    appendRecords,
  } = useDashboard();
  const [, setRecords] = useDashboardRecord(reportId, card.id);
  const { setCardState } = useDashboard();
  const [filterState, setFilterState] = useState<Record<string, unknown>>(
    () => {
      try {
        // Extract filters from query payload if available
        const payload = card.query?.payload as any;
        const initialFromPayload =
          payload?.params?.filters && typeof payload.params.filters === "object"
            ? (payload.params.filters as Record<string, unknown>)
            : {};

        // Merge in filter schema default values (if provided on card.settings or card)
        const filterSchema =
          (card.settings as any)?.filterSchema ?? (card as any).filterSchema;

        if (filterSchema && Array.isArray(filterSchema.fields)) {
          const merged: Record<string, unknown> = {
            ...(initialFromPayload || {}),
          };
          for (const f of filterSchema.fields) {
            try {
              const id = (f as any).id;
              const def = (f as any).defaultValue;
              if (
                id &&
                def !== undefined &&
                (merged[id] === undefined || merged[id] === null)
              ) {
                merged[id] = def;
              }
            } catch {
              // ignore malformed field entries
            }
          }
          return merged;
        }

        return initialFromPayload;
      } catch {
        return {};
      }
    }
  );

  const processors = getCardProcessors(reportId, card.id, card.kind);

  const handleRecordsUpdate = useCallback(
    (records: AnyCardRecord<R>[]) => {
      setRecords((prevRecords) => {
        const first =
          Array.isArray(records) && records.length > 0
            ? (records[0] as any)
            : null;

        const looksLikeTableRecord =
          first && typeof first === "object" && Array.isArray(first.rows);
        const looksLikeChartRecord =
          first &&
          typeof first === "object" &&
          Array.isArray((first as any).data);

        if (looksLikeTableRecord || looksLikeChartRecord) {
          return records;
        }
        if (appendRecords) {
          return [...(prevRecords || []), ...records];
        }

        return records;
      });
    },
    [setRecords]
  );

  const handleStateChange = useCallback(
    (executionState: any) => {
      setCardState(reportId, card.id, {
        loadingState: executionState.loadingState,
        error: executionState.error,
        lastRefresh: executionState.lastRefresh,
      });
    },
    [setCardState, reportId, card.id]
  );

  return (
    <CardExecutionProvider<M, R>
      reportId={reportId}
      cardId={card.id}
      kind={card.kind}
      query={card.query}
      cardSettings={card.settings}
      parameters={{
        ...(runtimeParams || {}),
        ...(filterState || {}),
      }}
      preProcessors={processors.pre as unknown as PreProcessor<M, R>[]}
      postProcessors={processors.post as unknown as PostProcessor<M, R>[]}
      onRecordsUpdate={handleRecordsUpdate}
      onStateChange={handleStateChange}
    >
      <DashboardCardInternal
        reportId={reportId}
        card={card}
        className={className}
        filterState={filterState}
        setFilterState={setFilterState}
        runtimeParams={{
          ...(runtimeParams || {}),
          ...(filterState || {}),
        }}
      />
    </CardExecutionProvider>
  );
}
