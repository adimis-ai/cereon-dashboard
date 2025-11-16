import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import type {
  DashboardCallbacks,
  DashboardParameters,
  DashboardProps,
  DashboardSpec,
  DashboardState,
  CardState,
  ReportState,
  CardSettingsMap,
  CardRecordMap,
  PreProcessor,
  PostProcessor,
} from "../types";
import { CardGridPosition, DashboardTheme, AnimationPreset } from "../types";
import { DashboardRecordProvider } from "./dashboard-record";

type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends Record<string, unknown>
    ? DeepReadonly<T[K]>
    : T[K];
};

export interface CardEditMap {
  [reportId: string]: {
    [cardId: string]: boolean;
  };
}

export type CardComponent = React.ComponentType<any>;

type DashboardContextType<
  M extends CardSettingsMap = CardSettingsMap,
  R extends CardRecordMap = CardRecordMap,
> = {
  /** Current immutable spec snapshot. */
  spec: DeepReadonly<DashboardSpec<M, R>> | null;
  /** If true, records are appended instead of replaced on update. */
  appendRecords?: boolean;
  /** Host callbacks. Kept referentially stable. */
  callbacks: Readonly<DashboardCallbacks<M, R>>;
  /** Live parameters state. */
  parameters: DashboardParameters | null;
  /** Replace or derive parameters. */
  setParameters: React.Dispatch<
    React.SetStateAction<DashboardParameters | null>
  >;
  /** Original snapshots for SSR hydration or diffing. */
  originalState?: DashboardState<M, R> | null;
  originalParameters?: DashboardParameters | null;

  /** Replace or derive the full dashboard state, if locally owned. */
  setDashboardState?: React.Dispatch<
    React.SetStateAction<DashboardState<M, R> | null>
  >;
  /** Current local dashboard state if provider owns it. */
  state: DashboardState<M, R> | null;

  /** Report state management */
  reportStates: Record<string, ReportState>;
  /** Update report state */
  setReportState: (reportId: string, state: Partial<ReportState>) => void;
  /** Active report ID */
  activeReportId?: string;
  /** Set active report */
  setActiveReportId: (reportId: string) => void;

  /** Card state management */
  getCardState: (reportId: string, cardId: string) => CardState;
  /** Update card state */
  setCardState: (
    reportId: string,
    cardId: string,
    state: Partial<CardState>
  ) => void;

  /** Layout management */
  updateCardLayout: (
    reportId: string,
    cardId: string,
    position: CardGridPosition
  ) => void;
  /** Update multiple card layouts */
  updateReportLayout: (reportId: string, layout: CardGridPosition[]) => void;

  /** Animation preset */
  animations: AnimationPreset;
  /** Set animations */
  setAnimations: (animations: AnimationPreset) => void;
  /** Theme management */
  theme?: DashboardTheme;
  /** Set theme */
  setTheme?: (theme: DashboardTheme) => void;

  /** Cards registry management*/
  registeredCards: Record<string, CardComponent>;
  /** Register a custom card component */
  registerCard: (cardId: string, component: CardComponent) => void;

  /** Get processors for a specific card */
  getCardProcessors: (
    reportId: string,
    cardId: string,
    kind: string
  ) => {
    pre: PreProcessor<M, R>[];
    post: PostProcessor<M, R>[];
  };
};

// Create a non-generic context and cast when consumed. We keep the runtime
// context single-instance while exposing generic typings via helpers.
const DashboardContext = createContext<
  DashboardContextType<any, any> | undefined
>(undefined);

export interface DashboardProviderProps<
  M extends CardSettingsMap = CardSettingsMap,
  R extends CardRecordMap = CardRecordMap,
> extends Pick<DashboardProps<M, R>, "callbacks"> {
  children: ReactNode;
  spec: DashboardSpec<M, R>;
  state?: Omit<DashboardState<M, R>, "spec"> | null;
  parameters?: DashboardParameters | null;
  editable?: boolean;
  appendRecords?: boolean;
  theme?: DashboardTheme;
  setTheme?: (theme: DashboardTheme) => void;
}

/**
 * Root provider. Splits concerns:
 * - Keeps callbacks referentially stable.
 * - Exposes spec and parameter helpers.
 * - Manages report and card states.
 * - Delegates record updates to DashboardRecordProvider to isolate re-renders.
 */
export const DashboardProvider = <
  M extends CardSettingsMap = CardSettingsMap,
  R extends CardRecordMap = CardRecordMap,
>({
  spec,
  state: providedState = null,
  parameters: initialParameters = null,
  callbacks: rawCallbacks,
  children,
  appendRecords = true,
  theme,
  setTheme,
}: DashboardProviderProps<M, R>) => {
  const initialState = useMemo<DashboardState<M, R>>(() => {
    return {
      spec,
      ...providedState,
    };
  }, [spec, providedState]);

  const [state, setDashboardState] = useState<DashboardState<M, R> | null>(
    initialState
  );
  const [parameters, setParameters] = useState<DashboardParameters | null>(
    initialParameters
  );
  const [registryCards, setRegistryCards] = useState<
    Record<string, CardComponent>
  >({});

  const registerCard = useCallback<DashboardContextType<M, R>["registerCard"]>(
    (cardId, component) => {
      setRegistryCards((prev) => ({
        ...prev,
        [cardId]: component,
      }));
    },
    []
  );

  const [reportStates, setReportStates] = useState<Record<string, ReportState>>(
    initialState?.reportStates ?? {}
  );
  const [activeReportId, setActiveReportId] = useState<string | undefined>(
    initialState?.activeReportId
  );

  const [animations, setAnimations] = useState<AnimationPreset>(
    initialState?.additional?.animations ??
      initialState?.spec?.config?.animations ??
      "smooth"
  );

  const callbacks = useMemo<Readonly<DashboardCallbacks<M, R>>>(() => {
    return {
      ...rawCallbacks,
      processors: rawCallbacks?.processors,
      setDashboardState:
        rawCallbacks?.setDashboardState ??
        ((next) => {
          setDashboardState((prev) =>
            typeof next === "function"
              ? (next as (p: DashboardState<M, R>) => DashboardState<M, R>)(
                  prev as DashboardState<M, R>
                )
              : (next as DashboardState<M, R> | null)
          );
        }),
      onClear: rawCallbacks?.onClear,
      onLayoutChange: rawCallbacks?.onLayoutChange,
      onReportChange: rawCallbacks?.onReportChange,
      handleHealthCheck: rawCallbacks?.handleHealthCheck,
      onCardStateChange: rawCallbacks?.onCardStateChange,
      onCardFilterChange: rawCallbacks?.onCardFilterChange,
    };
  }, [rawCallbacks]);

  const specRef = useRef<DashboardSpec<M, R> | null>(state?.spec ?? null);
  if (state?.spec && specRef.current !== state.spec) {
    specRef.current = state.spec;
  }

  const setReportState = useCallback(
    (reportId: string, newState: Partial<ReportState>) => {
      setReportStates((prev) => ({
        ...prev,
        [reportId]: {
          cardStates: {},
          ...prev[reportId],
          ...newState,
        } as ReportState,
      }));
    },
    []
  );

  const getCardState = useCallback(
    (reportId: string, cardId: string): CardState => {
      const reportState = reportStates[reportId];
      const cardState = reportState?.cardStates?.[cardId];
      return (
        cardState ?? {
          loadingState: "idle",
          isVisible: false,
          hasFocus: false,
        }
      );
    },
    [reportStates]
  );

  const setCardState = useCallback(
    (reportId: string, cardId: string, newState: Partial<CardState>) => {
      setReportStates((prev) => {
        const currentReportState = prev[reportId] ?? { cardStates: {} };
        const currentCardState = currentReportState.cardStates[cardId] ?? {
          loadingState: "idle" as const,
          isVisible: false,
          hasFocus: false,
        };

        return {
          ...prev,
          [reportId]: {
            ...currentReportState,
            cardStates: {
              ...currentReportState.cardStates,
              [cardId]: {
                ...currentCardState,
                ...newState,
              },
            },
          },
        };
      });

      // Notify callback if provided
      callbacks.onCardStateChange?.(reportId, cardId, newState);
    },
    [callbacks]
  );

  const updateCardLayout = useCallback(
    (reportId: string, cardId: string, position: CardGridPosition) => {
      setCardState(reportId, cardId, { gridPosition: position });
      callbacks.onLayoutChange?.(reportId, [position], cardId);
    },
    [setCardState, callbacks]
  );

  const updateReportLayout = useCallback(
    (reportId: string, layout: CardGridPosition[]) => {
      const report = state?.spec?.reports?.find((r) => r.id === reportId);
      if (!report) return;

      layout.forEach((layoutItem, index) => {
        const cardId =
          (layoutItem as any).i ||
          (layoutItem as any).cardId ||
          report.reportCards[index]?.id;

        if (cardId) {
          const position: CardGridPosition = {
            x: layoutItem.x,
            y: layoutItem.y,
            w: layoutItem.w,
            h: layoutItem.h,
            minW: layoutItem.minW,
            maxW: layoutItem.maxW,
            minH: layoutItem.minH,
            maxH: layoutItem.maxH,
            static: layoutItem.static,
            isDraggable: layoutItem.isDraggable,
            isResizable: layoutItem.isResizable,
          };

          setCardState(reportId, cardId, { gridPosition: position });
        }
      });
      callbacks.onLayoutChange?.(reportId, layout);
    },
    [state?.spec, setCardState, callbacks]
  );

  const handleSetActiveReportId = useCallback(
    (reportId: string) => {
      setActiveReportId(reportId);
      callbacks.onReportChange?.(reportId);
    },
    [callbacks]
  );

  const getCardProcessors = useCallback(
    (reportId: string, cardId: string, kind: string) => {
      const processors = callbacks.processors || {};

      // Get card kind specific processors
      const cardKindProcessors = processors.cardKind?.[kind] || {};

      // Get report-card specific processors
      const reportCardProcessors =
        processors.reportCard?.[reportId]?.[cardId] || {};

      return {
        pre: [
          ...(cardKindProcessors.pre || []),
          ...(reportCardProcessors.pre || []),
        ],
        post: [
          ...(cardKindProcessors.post || []),
          ...(reportCardProcessors.post || []),
        ],
      };
    },
    [callbacks.processors]
  );

  const value = useMemo<DashboardContextType<M, R>>(
    () => ({
      spec: specRef.current,
      callbacks,
      parameters,
      setParameters,
      originalState: initialState,
      originalParameters: initialParameters,
      setDashboardState,
      state,
      reportStates,
      setReportState,
      activeReportId,
      setActiveReportId: handleSetActiveReportId,
      getCardState,
      setCardState,
      updateCardLayout,
      updateReportLayout,
      theme,
      setTheme,
      animations,
      setAnimations,
      registeredCards: registryCards,
      registerCard,
      getCardProcessors,
      appendRecords,
    }),
    [
      callbacks,
      initialParameters,
      initialState,
      parameters,
      setParameters,
      state,
      reportStates,
      setReportState,
      activeReportId,
      handleSetActiveReportId,
      getCardState,
      setCardState,
      updateCardLayout,
      updateReportLayout,
      theme,
      animations,
      registryCards,
      registerCard,
      getCardProcessors,
      appendRecords,
    ]
  );

  return (
    <DashboardContext.Provider value={value as any}>
      <DashboardRecordProvider initialRecords={initialState?.records as any}>
        {children}
      </DashboardRecordProvider>
    </DashboardContext.Provider>
  );
};

export const useDashboard = <
  M extends CardSettingsMap = CardSettingsMap,
  R extends CardRecordMap = CardRecordMap,
>(): DashboardContextType<M, R> => {
  const ctx = useContext(
    DashboardContext as React.Context<DashboardContextType<M, R> | undefined>
  );
  if (!ctx)
    throw new Error("useDashboard must be used within a DashboardProvider");
  return ctx as DashboardContextType<M, R>;
};
