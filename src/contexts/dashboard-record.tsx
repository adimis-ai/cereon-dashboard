// apps/cereon-demo-client/dashboard/contexts/dashboard-record.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useSyncExternalStore,
  ReactNode,
} from "react";
import { AnyCardRecord, CardRecordMap } from "../types";

// Internal store uses the base CardRecordMap to keep a single runtime
// representation. External APIs are generic and cast to the expected types.
type AnyCardRecordType = AnyCardRecord<CardRecordMap>;

type RecordsMap = {
  [reportName: string]: {
    [cardName: string]: AnyCardRecordType[];
  };
};

type Subscriber = () => void;

type Key = string; // `${report}::${card}`

class RecordStore {
  private data: RecordsMap;
  private byKeySubs: Map<Key, Set<Subscriber>>;
  private reportSubs: Map<string, Set<Subscriber>>;
  // Caches for stable empty snapshots
  private _emptyArrayCache: Map<Key, AnyCardRecordType[]>;
  private _emptyReportCache: Map<string, { [card: string]: AnyCardRecordType[] }>;

  constructor(initial: RecordsMap | null) {
    this.data = initial ? { ...initial } : {};
    this.byKeySubs = new Map();
    this.reportSubs = new Map();
    // Caches to return stable empty references so getSnapshot is referentially stable
    this._emptyArrayCache = new Map();
    this._emptyReportCache = new Map();
  }

  private key(report: string, card: string): Key {
    return `${report}::${card}`;
  }

  getRecords(report: string, card: string): AnyCardRecordType[] {
    const val = this.data[report]?.[card];
    if (typeof val !== "undefined") return val;
    const key = `${report}::${card}`;
    if (!this._emptyArrayCache.has(key)) {
      this._emptyArrayCache.set(key, []);
    }
    return this._emptyArrayCache.get(key)!;
  }

  getReport(report: string): { [card: string]: AnyCardRecordType[] } {
    const val = this.data[report];
    if (typeof val !== "undefined") return val;
    if (!this._emptyReportCache.has(report)) {
      this._emptyReportCache.set(report, {});
    }
    return this._emptyReportCache.get(report)!;
  }

  /** Upsert records for a single card. */
  setRecord(
    report: string,
    card: string,
    next: AnyCardRecordType[] | ((prev: AnyCardRecordType[]) => AnyCardRecordType[])
  ): void {
    const prev = this.getRecords(report, card);
    const value = typeof next === "function" ? (next as any)(prev) : next;

    if (!this.data[report]) this.data[report] = {};
    // Shallow equality short-circuit.
    const prevRef = this.data[report][card];
    if (prevRef === value) return;

    this.data[report][card] = value;

    // Notify card subscribers.
    const cardKey = this.key(report, card);
    this.byKeySubs.get(cardKey)?.forEach((fn) => fn());
    // Notify report-level subscribers.
    this.reportSubs.get(report)?.forEach((fn) => fn());
  }

  /** Bulk upsert across cards within a report. */
  bulkSetRecord(
    report: string,
    next:
      | Record<string, AnyCardRecordType[] | ((prev: AnyCardRecordType[]) => AnyCardRecordType[])>
      | ((prev: { [cardName: string]: AnyCardRecordType[] }) => { [cardName: string]: AnyCardRecordType[] })
  ): void {
    const prevReport = this.getReport(report);
    const resolved = typeof next === "function" ? (next as any)(prevReport) : next;

    const cards = Object.keys(resolved);
    if (!this.data[report]) this.data[report] = {};

    let anyChanged = false;
    for (const card of cards) {
      const curr = this.getRecords(report, card);
      const proposed = resolved[card];
      // If the resolved mapping doesn't include this card, skip it.
      if (typeof proposed === "undefined") continue;

      const value = typeof proposed === "function" ? (proposed as any)(curr) : proposed;

      // Only apply if the computed value is defined (should be array); skip otherwise.
      if (typeof value === "undefined") continue;

      if (this.data[report][card] !== value) {
        this.data[report][card] = value;
        anyChanged = true;
        const cardKey = this.key(report, card);
        this.byKeySubs.get(cardKey)?.forEach((fn) => fn());
      }
    }
    if (anyChanged) {
      this.reportSubs.get(report)?.forEach((fn) => fn());
    }
  }

  /** Subscribe to a specific card key. */
  subscribe(report: string, card: string, fn: Subscriber): () => void {
    const k = this.key(report, card);
    if (!this.byKeySubs.has(k)) this.byKeySubs.set(k, new Set());
    this.byKeySubs.get(k)!.add(fn);
    return () => this.byKeySubs.get(k)!.delete(fn);
  }

  /** Subscribe to a whole report. */
  subscribeReport(report: string, fn: Subscriber): () => void {
    if (!this.reportSubs.has(report)) this.reportSubs.set(report, new Set());
    this.reportSubs.get(report)!.add(fn);
    return () => this.reportSubs.get(report)!.delete(fn);
  }
}

type RecordStoreContextType = {
  getRecords: (report: string, card: string) => AnyCardRecordType[];
  setRecord: RecordStore["setRecord"];
  bulkSetRecord: RecordStore["bulkSetRecord"];
  getReport: (report: string) => {
    [card: string]: AnyCardRecordType[];
  };
  // Expose subscription helpers so hooks can use useSyncExternalStore without reaching into internals
  subscribe: (report: string, card: string, fn: Subscriber) => () => void;
  subscribeReport: (report: string, fn: Subscriber) => () => void;
  // Subscriptions are internal to hooks.
};

const RecordStoreContext = createContext<RecordStoreContextType | undefined>(
  undefined
);

export const DashboardRecordProvider = (props: {
  initialRecords: RecordsMap | null;
  children: ReactNode;
    /**
     * Optional host-side bulk setter to keep external state in sync.
     * If provided, we call it after local store update.
     */
  bulkSetRecordFromHost?: (
    report: string,
    next:
      | Record<string, AnyCardRecordType[] | ((prev: AnyCardRecordType[]) => AnyCardRecordType[])>
      | ((prev: { [cardName: string]: AnyCardRecordType[] }) => { [cardName: string]: AnyCardRecordType[] })
  ) => void;
}) => {
  const { initialRecords, children, bulkSetRecordFromHost } = props;
  const storeRef = useRef<RecordStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = new RecordStore(initialRecords as any);
  }

  const getRecords = useCallback(
    (report: string, card: string) => storeRef.current!.getRecords(report, card),
    []
  );
  const getReport = useCallback(
    (report: string) => storeRef.current!.getReport(report),
    []
  );

  const setRecord = useCallback<RecordStore["setRecord"]>((report, card, next) => {
    storeRef.current!.setRecord(report, card, next as any);
    // Do not mirror single-card updates outward. Keep bulk atomicity semantics.
  }, []);

  const bulkSetRecord = useCallback<RecordStore["bulkSetRecord"]>(
    (report, next) => {
      storeRef.current!.bulkSetRecord(report, next as any);
      if (bulkSetRecordFromHost) {
        bulkSetRecordFromHost(report, next as any);
      }
    },
    [bulkSetRecordFromHost]
  );

  const value = useMemo<RecordStoreContextType>(() => ({
    getRecords,
    setRecord,
    bulkSetRecord,
    getReport,
    subscribe: (report: string, card: string, fn: Subscriber) =>
      storeRef.current!.subscribe(report, card, fn),
    subscribeReport: (report: string, fn: Subscriber) =>
      storeRef.current!.subscribeReport(report, fn),
  }), [bulkSetRecord, getRecords, getReport, setRecord]);

  return (
    <RecordStoreContext.Provider value={value}>
      {children}
    </RecordStoreContext.Provider>
  );
};

/** Subscribe to a single card’s records with minimal re-renders. */
export const useDashboardRecord = <R extends CardRecordMap = CardRecordMap>(report: string, card: string) => {
  const ctx = useContext(RecordStoreContext as React.Context<RecordStoreContextType | undefined>);
  if (!ctx) throw new Error("useDashboardRecord must be used within a DashboardRecordProvider");

  const subscribe = useCallback((onStoreChange: () => void) => ctx.subscribe(report, card, onStoreChange), [ctx, report, card]);
  const getSnapshot = () => ctx.getRecords(report, card);
  const records = useSyncExternalStore(subscribe, getSnapshot, getSnapshot) as AnyCardRecordType[];

  const setForKey = useCallback((next: AnyCardRecordType[] | ((prev: AnyCardRecordType[]) => AnyCardRecordType[])) => ctx.setRecord(report, card, next as any), [card, ctx, report]);

  return [records as unknown as AnyCardRecordType[], setForKey] as const;
};

/** Subscribe to all records within a report. Suitable for bulk views. */
export const useDashboardReportRecords = <R extends CardRecordMap = CardRecordMap>(report: string) => {
  const ctx = useContext(RecordStoreContext as React.Context<RecordStoreContextType | undefined>);
  if (!ctx) throw new Error("useDashboardReportRecords must be used within a DashboardRecordProvider");

  const subscribe = useCallback((onStoreChange: () => void) => ctx.subscribeReport(report, onStoreChange), [ctx, report]);
  const getSnapshot = () => ctx.getReport(report);
  const all = useSyncExternalStore(subscribe, getSnapshot, getSnapshot) as { [card: string]: AnyCardRecordType[] };

  return [all as unknown as { [card: string]: AnyCardRecordType[] }, ctx.bulkSetRecord] as const;
};
