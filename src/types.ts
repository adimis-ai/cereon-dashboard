import { FormFieldOrGroup } from "./ui";
import React from "react";

// packages/cereon-dashboard/src/types.ts
export enum DashboardDownloadFormat {
  CSV = "csv",
  JSON = "json",
  PNG = "png",
  SVG = "svg",
  GEOJSON = "geojson",
}

/**
 * Runtime query metadata used for observability and paging.
 */
export interface QueryMeta extends Record<string, unknown> {
  /** ISO start time of the query. */
  startedAt?: string;
  /** ISO end time of the query. */
  finishedAt?: string;
  /** Elapsed time in milliseconds. */
  elapsedMs?: number;
}

/**
 * Grid layout position for dashboard cards.
 */
export interface CardGridPosition {
  /** X position in grid units */
  x: number;
  /** Y position in grid units */
  y: number;
  /** Width in grid units */
  w: number;
  /** Height in grid units */
  h: number;
  /** Minimum width constraint */
  minW?: number;
  /** Maximum width constraint */
  maxW?: number;
  /** Minimum height constraint */
  minH?: number;
  /** Maximum height constraint */
  maxH?: number;
  /** Static card cannot be moved or resized */
  static?: boolean;
  /** Card cannot be dragged */
  isDraggable?: boolean;
  /** Card cannot be resized */
  isResizable?: boolean;
}

// Dashboard filter interfaces
export interface CardFiltersProps {
  /** Filter configuration schema */
  schema: FormFieldOrGroup[];
  /** Default values for the filters */
  defaultValues?: Record<string, any>;
  /** Whether the filters are disabled */
  disabled?: boolean;
  /** Custom CSS class name */
  className?: string;
  /** Custom maximum width */
  maxWidth?: string;
  /** Custom width */
  width?: string;
}

/**
 * Shared settings applied to all card kinds.
 */
export interface CommonCardSettings extends Record<string, unknown> {
  /** Enables data download actions. */
  enableDownload?: boolean;
  /** Grid layout position and constraints */
  gridPosition?: CardGridPosition;
  /** Card title */
  filters?: CardFiltersProps;
}

/**
 * Base record for all rendered cards.
 */
export interface BaseDashboardCardRecord extends Record<string, unknown> {
  /** Card kind discriminator. */
  kind: string;
  /** Execution metadata. */
  meta?: QueryMeta;
  /** Optional unique identifier. */
  reportId?: string;
  /** Optional unique identifier. */
  cardId?: string;
}

/**
 * Card loading state.
 */
export type CardLoadingState = "idle" | "loading" | "error" | "success";

/**
 * Report layout strategy.
 */
export type ReportLayoutStrategy = "grid" | "masonry" | "flexible";

/**
 * Dashboard themes for consistent styling.
 */
export type DashboardTheme = "light" | "dark" | "system";

/**
 * Animation presets for cards and transitions.
 */
export type AnimationPreset = "none" | "subtle" | "smooth" | "dynamic";

export interface HttpPayload {
  method?: "GET" | "POST";
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface StreamingHttpPayload extends HttpPayload {
  streamDelimiter?: string;
  streamFormat?: "sse" | "ndjson" | "delimited" | "json";
}

export interface WebSocketPayload {
  /** WebSocket connection URL */
  url: string;
  /** Initial connection parameters */
  params?: Record<string, unknown>;
  /** Topic to subscribe to */
  topic: string;
  /** Sequence number for resuming connections */
  resumeSeq?: number;
  /** Unique subscription identifier */
  subscriptionId: string;
  /** Message acknowledgment policy */
  ackPolicy?: "auto" | "manual";
  /** Message compression method */
  compression?: "none" | "gzip" | "deflate";
  /** WebSocket sub-protocols */
  protocols?: string | string[];
  /** Reconnection delay in milliseconds (default: 1000) */
  reconnectDelay?: number;
  /** Maximum reconnection attempts (default: 5) */
  maxReconnectAttempts?: number;
  /** Heartbeat interval in milliseconds (default: 30000, 0 to disable) */
  heartbeatInterval?: number;
  /** Additional headers for connection (Note: limited support in browsers) */
  headers?: Record<string, string>;
}

/**
 * Context provided to custom query handlers
 */
export interface CustomQueryContext<
  M extends CardSettingsMap = CardSettingsMap,
  R extends CardRecordMap = CardRecordMap,
> {
  /** Report ID */
  reportId: string;
  /** Card ID */
  cardId: string;
  /** Card kind */
  kind: string;
  /** Optional configuration for the custom handler */
  params?: Record<string, unknown>;
  /** Complete card specification */
  cardSpec: DashboardReportCardSpec<keyof M & string, M>;
  /** Dashboard parameters */
  runtimeParams: DashboardParameters | null;
  /** Card-specific settings */
  cardSettings?: M[keyof M];
  /** Abort signal for cancellation */
  signal?: AbortSignal;
  /** State update callback */
  updateState?: (state: {
    loadingState?: CardLoadingState;
    error?: string;
    connectionStatus?:
      | "disconnected"
      | "connecting"
      | "connected"
      | "reconnecting";
  }) => void;
}

/**
 * Custom query handler function
 */
export type CustomQueryHandler<
  M extends CardSettingsMap = CardSettingsMap,
  R extends CardRecordMap = CardRecordMap,
> = (
  context: CustomQueryContext<M, R>
) =>
  | Promise<AnyCardRecord<R>[]>
  | AnyCardRecord<R>[]
  | AsyncIterable<AnyCardRecord<R>[]>;

export interface CustomPayload<
  M extends CardSettingsMap = CardSettingsMap,
  R extends CardRecordMap = CardRecordMap,
> {
  /** Custom query handler function */
  handler: CustomQueryHandler<M, R>;
  /** Optional configuration for the custom handler */
  params?: Record<string, unknown>;
  /** Whether the handler supports streaming/async iteration */
  streaming?: boolean;
  /** Custom timeout in milliseconds */
  timeout?: number;
}

export interface DashboardQuerySpec<
  M extends CardSettingsMap = CardSettingsMap,
  R extends CardRecordMap = CardRecordMap,
> {
  variant: "streaming-http" | "http" | "websocket" | "custom";
  payload:
    | StreamingHttpPayload
    | HttpPayload
    | WebSocketPayload
    | CustomPayload<M, R>;
}

export type CardSettingsMap<K extends string = string> = Record<
  K,
  CommonCardSettings
>;
export type CardRecordMap<K extends string = string> = Record<
  K,
  BaseDashboardCardRecord
>;
export type AnyCardRecord<R extends CardRecordMap> = R[keyof R & string];

export interface DashboardReportCardSpec<
  K extends string,
  M extends CardSettingsMap,
  R extends CardRecordMap = CardRecordMap,
> {
  kind: K;
  id: string;
  title: string;
  settings?: M[K];
  className?: string;
  description?: string;
  hideHeader?: boolean;
  hideFooter?: boolean;
  "aria-label"?: string;
  isDraggable?: boolean;
  isResizable?: boolean;
  panel?: boolean;
  transparent?: boolean;
  query?: DashboardQuerySpec<M, R>;
  gridPosition?: CardGridPosition;
  renderCard?: (props?: BaseCardProps<K, M, R>) => React.ReactNode;
}

export type AnyDashboardReportCardSpec<
  M extends CardSettingsMap,
  R extends CardRecordMap = CardRecordMap,
> = {
  [K in keyof M & string]: DashboardReportCardSpec<K, M, R>;
}[keyof M & string];

export interface ReportLayoutConfig {
  strategy: ReportLayoutStrategy;
  columns?: number;
  gap?: number;
  compact?: boolean;
  autopack?: boolean;
  preventCollision?: boolean;
  enableDragDrop?: boolean;
  enableResize?: boolean;
  margin?: [number, number];
  containerPadding?: [number, number];
  rowHeight?: number;
}

export interface DashboardReportSpec<
  M extends CardSettingsMap = CardSettingsMap,
  R extends CardRecordMap = CardRecordMap,
> {
  id: string;
  title: string;
  description?: string;
  reportCards: AnyDashboardReportCardSpec<M, R>[];
  layout?: ReportLayoutConfig;
  theme?: DashboardTheme;
}

export interface DashboardConfig {
  theme: DashboardTheme;
  animations: AnimationPreset;
  // TODO: Use these performance attributes in Dashboard and sub contexts and component
  defaultRefreshInterval?: number;
  maxConcurrentQueries?: number;
}

export interface DashboardSpec<
  M extends CardSettingsMap = CardSettingsMap,
  R extends CardRecordMap = CardRecordMap,
> {
  id: string;
  title: string;
  description?: string;
  reports: DashboardReportSpec<M, R>[];
  config?: DashboardConfig;
}

export interface CardState {
  loadingState: CardLoadingState;
  lastRefresh?: string;
  error?: string;
  isVisible?: boolean;
  hasFocus?: boolean;
  gridPosition?: CardGridPosition;
}

export interface ReportState {
  activeReportId?: string;
  cardStates: Record<string, CardState>;
  layout?: ReportLayoutConfig;
  isLoading?: boolean;
}

export interface DashboardState<
  M extends CardSettingsMap = CardSettingsMap,
  R extends CardRecordMap = CardRecordMap,
> {
  spec: DashboardSpec<M, R>;
  records?: {
    [reportId: string]: {
      [cardId: string]: AnyCardRecord<R>[];
    };
  };
  reportStates?: {
    [reportId: string]: ReportState;
  };
  activeReportId?: string;
  additional?: {
    theme: DashboardTheme;
    animations: AnimationPreset;
    lastSaved?: string;
  };
}

// Processor interfaces for pre and post query processing
/**
 * Pre-query processor function.
 *
 * Developers can implement this to transform or validate a card's query
 * before it is executed. This may be synchronous or return a Promise.
 *
 * Inputs:
 * - reportId: id of the active report
 * - cardId: id of the card being processed
 * - kind: card kind discriminator
 * - query: original query spec
 * - parameters: resolved dashboard parameters or null
 * - cardSettings: optional card settings for the card kind
 *
 * Returns a DashboardQuerySpec (possibly mutated) or a Promise that resolves
 * to one. Implementations should not mutate global state.
 */
export interface PreProcessor<
  M extends CardSettingsMap = CardSettingsMap,
  R extends CardRecordMap = CardRecordMap,
> {
  (args: {
    reportId: string;
    cardId: string;
    kind: string;
    query: DashboardQuerySpec<M, R>;
    parameters: DashboardParameters | null;
    cardSettings?: M[keyof M];
  }): DashboardQuerySpec<M, R> | Promise<DashboardQuerySpec<M, R>>;
}

/**
 * Post-query processor function.
 *
 * Use this to transform raw query response data into card records. This
 * function receives the original query and raw data and must return an array
 * of card records (or a Promise resolving to them).
 *
 * Inputs mirror PreProcessor but include rawData and should not mutate it.
 */
export interface PostProcessor<
  M extends CardSettingsMap = CardSettingsMap,
  R extends CardRecordMap = CardRecordMap,
> {
  (args: {
    reportId: string;
    cardId: string;
    kind: string;
    rawData: any;
    query: DashboardQuerySpec<M, R>;
    parameters: DashboardParameters | null;
    cardSettings?: M[keyof M];
  }): AnyCardRecord<R>[] | Promise<AnyCardRecord<R>[]>;
}

/**
 * Registry for pre- and post-processors registered globally per card kind
 * or specifically for individual report-card instances.
 *
 * - `cardKind`: processors applied to all cards of a given kind.
 * - `reportCard`: processors applied to a specific card within a specific
 *   report (overrides or supplements kind-level processors).
 */
export interface ProcessorRegistry<
  M extends CardSettingsMap = CardSettingsMap,
  R extends CardRecordMap = CardRecordMap,
> {
  // Card kind specific processors (applied to all cards of this kind)
  cardKind?: {
    [K in keyof M]?: {
      pre?: PreProcessor<M, R>[];
      post?: PostProcessor<M, R>[];
    };
  };
  // Report-card specific processors (applied to specific cards in specific reports)
  reportCard?: {
    [reportId: string]: {
      [cardId: string]: {
        pre?: PreProcessor<M, R>[];
        post?: PostProcessor<M, R>[];
      };
    };
  };
}

export interface DashboardCallbacks<
  M extends CardSettingsMap = CardSettingsMap,
  R extends CardRecordMap = CardRecordMap,
> {
  processors?: ProcessorRegistry<M, R>;
  setDashboardState?: (
    next:
      | DashboardState<M, R>
      | ((prev: DashboardState<M, R>) => DashboardState<M, R>)
  ) => void | Promise<void>;
  onLayoutChange?: (
    reportId: string,
    layout: CardGridPosition[],
    cardId?: string
  ) => void | Promise<void>;
  onReportChange?: (reportId: string) => void | Promise<void>;
  onCardStateChange?: (
    reportId: string,
    cardId: string,
    state: Partial<CardState>
  ) => void | Promise<void>;
  /** Callback when filter values change */
  onCardFilterChange?: (event: {
    reportId: string;
    cardId: string;
    name: string;
    value: any;
    error?: string;
  }) => void;
  /** Callback when filters are cleared */
  onClear?: (event: {
    reportId: string;
    cardId: string;
    name?: string;
  }) => void;
  handleHealthCheck?: () => { ok: true } | Promise<{ ok: true }>;
}

export interface DashboardParameters {
  [key: string]: unknown;
}

export interface DashboardProps<
  M extends CardSettingsMap = CardSettingsMap,
  R extends CardRecordMap = CardRecordMap,
> {
  state?: DashboardState<M, R>;
  callbacks?: DashboardCallbacks<M, R>;
  parameters?: DashboardParameters | null;
  className?: string;
  style?: React.CSSProperties;
}

export interface BaseCardProps<
  K extends string,
  M extends CardSettingsMap,
  R extends CardRecordMap,
> {
  reportId: string;
  state: CardState;
  params: DashboardParameters | null;
  records: R[K][];
  card: DashboardReportCardSpec<K, M, R>;
  className?: string;
  theme: "light" | "dark" | "system";
}
