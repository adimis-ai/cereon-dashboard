// packages/cereon-dashboard/src/index.ts
import "./ui/styles/globals.css";
export { Dashboard } from "./components/Dashboard";
export { DashboardProvider, useDashboard } from "./contexts/dashboard";
export { DashboardRecordProvider } from "./contexts/dashboard-record";
export * from "./ui/index"

export type {
  DashboardProps,
  DashboardSpec,
  DashboardState,
  DashboardCallbacks,
  DashboardParameters,
  DashboardReportSpec,
  DashboardReportCardSpec,
  DashboardQuerySpec,
  StreamingHttpPayload,
  HttpPayload,
  PreProcessor,
  PostProcessor,
  ProcessorRegistry,
  CardState,
  ReportState,
  ReportLayoutConfig,
  DashboardConfig,
  DashboardDownloadFormat,
  QueryMeta,
  CardGridPosition,
  CommonCardSettings,
  BaseDashboardCardRecord,
  CardLoadingState,
  ReportLayoutStrategy,
  DashboardTheme,
  AnimationPreset,
  CardFiltersProps,
  CustomQueryHandler,
} from "./types";

export { useCardVisibility } from "./hooks/useCardVisibility";
export {
  useDashboardRecord,
  useDashboardReportRecords,
} from "./contexts/dashboard-record";

export {
  CardExecutionProvider,
  useCardExecution,
  getCardExecutionContext,
  type CardExecutionState,
  type CardExecutionContextType,
} from "./contexts/card-execution";

// Layout persistence utilities
export {
  saveLayoutToStorage,
  loadLayoutFromStorage,
  clearLayoutFromStorage,
  clearDashboardLayouts,
  getDashboardLayoutKeys,
  isStorageAvailable,
  createDebouncedSave,
  type PersistedLayout,
} from "./utils/layout-persistence";

export { DashboardReport } from "./components/DashboardReport";
export { DashboardCard } from "./components/DashboardCard";

export type { BaseCardProps } from "./types";
export type { DashboardCardProps } from "./components/DashboardCard";

export type { CardEditMap, CardComponent } from "./contexts/dashboard";

export type {
  CardSettingsMap,
  CardRecordMap,
  AnyCardRecord,
  AnyDashboardReportCardSpec,
} from "./types";

export * from "./cards";

export type {
  DashboardNumberSettings,
  DashboardNumberCardRecord,
  NumberCardProps,
  TrendDirection,
} from "./cards/number";

export type {
  DashboardTableSettings,
  DashboardTableCardRecord,
  TableCardProps,
  DashboardTableColumn,
} from "./cards/table";
