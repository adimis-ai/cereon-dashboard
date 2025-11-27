// packages/cereon-dashboard/src/contexts/card-execution.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import type {
  DashboardQuerySpec,
  StreamingHttpPayload,
  HttpPayload,
  CustomPayload,
  CustomQueryContext,
  DashboardParameters,
  CardSettingsMap,
  CardRecordMap,
  AnyCardRecord,
  CardState,
  PreProcessor,
  PostProcessor,
  DashboardReportCardSpec,
} from "../types";
import { resolveParamPlaceholders } from "../utils/utils";

/**
 * NOTE: streaming formats supported (auto-detected if not provided):
 * - "sse"       => Server-Sent-Events blocks with `event:` / `data:` lines
 * - "ndjson"    => newline-delimited JSON (one JSON per line)
 * - "delimited" => delimiter-delimited JSON (payload.streamDelimiter required)
 * - "json"      => regular JSON object/array possibly sent in one or more chunks
 *
 * We accept an optional `streamFormat` property on the payload without
 * requiring immediate changes to the shared types. If you want type-safety
 * add `streamFormat?: "sse" | "ndjson" | "delimited" | "json"` to
 * StreamingHttpPayload in `dashboard.types.ts`.
 */

export interface CardExecutionState {
  loadingState: CardState["loadingState"];
  error?: string;
  lastRefresh?: string;
  connectionStatus?:
    | "disconnected"
    | "connecting"
    | "connected"
    | "reconnecting";
  streamActive?: boolean;
}

export interface CardExecutionContextType<
  M extends CardSettingsMap = CardSettingsMap,
  R extends CardRecordMap = CardRecordMap,
> {
  state: CardExecutionState;
  executeQuery: (params: Record<string, any>) => Promise<void>;
  cancel: () => void;
  reconnect: () => Promise<void>;
  setRecords: (records: AnyCardRecord<R>[]) => void;
  // WebSocket-specific methods
  sendMessage?: (message: any) => void;
  sendAck?: (messageId: string) => void;
  isWebSocketConnected?: () => boolean;
  unsubscribe?: (subscriptionId?: string) => void;
}

const createCardExecutionContext = <
  M extends CardSettingsMap = CardSettingsMap,
  R extends CardRecordMap = CardRecordMap,
>() => createContext<CardExecutionContextType<M, R> | undefined>(undefined);

const cardContexts = new Map<string, React.Context<any>>();

export const getCardExecutionContext = <
  M extends CardSettingsMap = CardSettingsMap,
  R extends CardRecordMap = CardRecordMap,
>(
  cardKey: string
) => {
  if (!cardContexts.has(cardKey)) {
    cardContexts.set(cardKey, createCardExecutionContext<M, R>());
  }
  return cardContexts.get(cardKey)! as React.Context<
    CardExecutionContextType<M, R> | undefined
  >;
};

interface CardExecutionProviderProps<
  M extends CardSettingsMap = CardSettingsMap,
  R extends CardRecordMap = CardRecordMap,
> {
  reportId: string;
  cardId: string;
  kind: string;
  query?: DashboardQuerySpec<M, R>;
  cardSpec?: DashboardReportCardSpec<keyof M & string, M, R>;
  cardSettings?: M[keyof M];
  parameters: DashboardParameters | null;
  children: ReactNode;
  preProcessors?: PreProcessor<M, R>[];
  postProcessors?: PostProcessor<M, R>[];
  onRecordsUpdate: (records: AnyCardRecord<R>[]) => void;
  onStateChange: (state: Partial<CardExecutionState>) => void;
}

export const CardExecutionProvider = <
  M extends CardSettingsMap = CardSettingsMap,
  R extends CardRecordMap = CardRecordMap,
>({
  reportId,
  cardId,
  kind,
  query,
  cardSpec,
  cardSettings,
  parameters: runtimeParams,
  children,
  preProcessors = [],
  postProcessors = [],
  onRecordsUpdate,
  onStateChange,
}: CardExecutionProviderProps<M, R>) => {
  const cardKey = `${reportId}::${cardId}`;
  const Context = getCardExecutionContext<M, R>(cardKey);

  const [state, setState] = useState<CardExecutionState>({
    loadingState: "idle",
    connectionStatus: "disconnected",
    streamActive: false,
  });
  const [params, setParams] = useState<Record<string, any>>({});

  const abortControllerRef = useRef<AbortController | null>(null);
  const streamReaderRef = useRef<ReadableStreamDefaultReader | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const connectPromiseRef = useRef<Promise<void> | null>(null);
  const manualCloseRef = useRef<boolean>(false);
  const reconnectTimeoutRef = useRef<any | null>(null);
  const heartbeatIntervalRef = useRef<any | null>(null);

  const updateState = useCallback(
    (newState: Partial<CardExecutionState>) => {
      setState((prev) => {
        const updated = { ...prev, ...newState };
        queueMicrotask(() => {
          onStateChange(updated);
        });
        return updated;
      });
    },
    [onStateChange]
  );

  const cancel = useCallback(() => {
    // Clear any pending reconnection attempts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Clear heartbeat interval
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    // Abort HTTP requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Cancel streaming readers
    if (streamReaderRef.current) {
      try {
        streamReaderRef.current.cancel();
      } catch {}
      streamReaderRef.current = null;
    }

    // Close WebSocket connections
    if (websocketRef.current) {
      // Mark manual close so websocket.onclose doesn't trigger reconnect
      manualCloseRef.current = true;
      // Try to send unsubscribe message before closing
      if (websocketRef.current.readyState === WebSocket.OPEN) {
        try {
          unsubscribeWebSocket();
          // Give a small delay for the unsubscribe message to be sent
          setTimeout(() => {
            if (websocketRef.current) {
              websocketRef.current.close(1000, "User cancelled");
            }
          }, 100);
        } catch {
          // If unsubscribe fails, just close the connection
          websocketRef.current.close(1000, "User cancelled");
        }
      } else if (websocketRef.current.readyState === WebSocket.CONNECTING) {
        websocketRef.current.close(1000, "User cancelled");
      }

      // Remove event listeners to prevent triggering reconnection logic
      websocketRef.current.onopen = null;
      websocketRef.current.onmessage = null;
      websocketRef.current.onerror = null;
      websocketRef.current.onclose = null;

      websocketRef.current = null;
    }

    updateState({
      loadingState: "idle",
      connectionStatus: "disconnected",
      streamActive: false,
    });
  }, [updateState]);

  const parseStreamBlock = useCallback(
    (block: string, format?: string, delimiter?: string) => {
      /**
       * Parse a single streaming block into one or more JS values.
       * Heuristics:
       *  - SSE: if block contains "data:" lines we parse them. If multiple "data:" lines they are concatenated.
       *  - NDJSON: if a block is multiple lines where each line is valid JSON parse lines.
       *  - Delimited: if streamDelimiter provided use that to split and parse each piece as JSON.
       *  - JSON: try to JSON.parse the block as object/array.
       *
       * Returns array of parsed items (could be empty if parse fails).
       */
      const items: any[] = [];
      const trimmed = block.trim();
      if (!trimmed) return items;

      // If explicit SSE or we detect "event:" / "data:" pattern
      const looksLikeSse =
        format === "sse" || /\bdata:/.test(trimmed) || /\bevent:/.test(trimmed);
      if (looksLikeSse) {
        // Break into SSE records separated by blank lines (1-2)
        const sseRecords = trimmed
          .split(/\n\s*\n/)
          .map((r) => r.trim())
          .filter(Boolean);
        for (const rec of sseRecords) {
          // extract event and data lines (may be multi-line data)
          // be tolerant: allow leading whitespace and accidental prefixes
          const lines = rec.split(/\r?\n/);
          let eventName: string | undefined;
          const dataParts: string[] = [];
          const lineRe = /^\s*(event|data)\s*:\s*(.*)$/i;
          for (const l of lines) {
            const ln = l;
            const m = ln.match(lineRe);
            if (m) {
              const keyRaw = m[1] || "";
              const key = keyRaw.toLowerCase();
              const rest = typeof m[2] === "string" ? m[2] : "";
              if (key === "event") {
                eventName = rest.trim();
              } else if (key === "data") {
                dataParts.push(rest);
              }
            } else if (ln && ln.trim()) {
              // if stray JSON lines (no data: prefix), collect them as well
              dataParts.push(ln.trim());
            }
          }

          const dataText = dataParts.join("\n");
          if (dataText) {
            try {
              // Try parsing the accumulated data as JSON. Many SSE servers
              // send JSON payloads after 'data:' so we strip the prefixes
              // above and attempt parse. If parse fails we fall back to raw.
              const parsed = JSON.parse(dataText);
              // attach event wrapper so downstream processors can react if needed
              if (eventName)
                items.push({
                  __sseEvent: eventName,
                  __raw: parsed,
                  ...(typeof parsed === "object" ? parsed : { value: parsed }),
                });
              else items.push(parsed);
            } catch {
              // not JSON, push raw string
              if (eventName)
                items.push({ __sseEvent: eventName, __rawText: dataText });
              else items.push(dataText);
            }
          }
        }
        return items;
      }

      // NDJSON detection or forced
      const looksLikeNdjson =
        format === "ndjson" ||
        (trimmed.split(/\r?\n/).length > 1 &&
          trimmed
            .trim()
            .split(/\r?\n/)
            .every((l) => {
              try {
                JSON.parse(l);
                return true;
              } catch {
                return false;
              }
            }));

      if (looksLikeNdjson) {
        const lines = trimmed
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean);
        for (const line of lines) {
          try {
            items.push(JSON.parse(line));
          } catch {
            items.push(line);
          }
        }
        return items;
      }

      // Delimited format (single block may contain many pieces separated by delimiter)
      if (format === "delimited" && delimiter) {
        const parts = block
          .split(delimiter)
          .map((p) => p.trim())
          .filter(Boolean);
        for (const p of parts) {
          try {
            items.push(JSON.parse(p));
          } catch {
            items.push(p);
          }
        }
        return items;
      }

      // Attempt to parse as JSON object/array
      try {
        const parsed = JSON.parse(trimmed);
        // If parsed is array return items
        if (Array.isArray(parsed)) return parsed;
        items.push(parsed);
        return items;
      } catch {
        // last resort: the block might contain multiple JSON substrings; attempt to find them
        const jsonMatches = trimmed.match(/\{[\s\S]*\}|\[[\s\S]*\]/g);
        if (jsonMatches) {
          for (const jm of jsonMatches) {
            try {
              items.push(JSON.parse(jm));
            } catch {
              // ignore
            }
          }
          if (items.length) return items;
        }
        // fallback: treat as raw string
        items.push(trimmed);
        return items;
      }
    },
    []
  );

  const runPreProcessors = useCallback(
    async (
      originalQuery: DashboardQuerySpec<M, R>,
      processors: PreProcessor<M, R>[]
    ): Promise<DashboardQuerySpec<M, R>> => {
      let processedQuery = originalQuery;

      for (const processor of processors) {
        try {
          processedQuery = await processor({
            reportId,
            cardId,
            kind,
            query: processedQuery,
            parameters: runtimeParams,
            cardSettings: cardSettings as M[keyof M],
          });
        } catch (error) {
          console.error("Pre-processor failed:", error);
          throw error;
        }
      }

      return processedQuery;
    },
    [reportId, cardId, kind, runtimeParams, cardSettings]
  );

  const runPostProcessors = useCallback(
    async (
      rawData: any,
      processedQuery: DashboardQuerySpec<M, R>,
      processors: PostProcessor<M, R>[]
    ): Promise<AnyCardRecord<R>[]> => {
      // Allow rawData to be a single item or an array of items.
      // Normalize to array of items for processors expecting rawData param.
      const rawItems = Array.isArray(rawData) ? rawData : [rawData];

      // Start with rawItems as the 'processedRecords' input for first processor.
      let processedRecords: AnyCardRecord<R>[] = rawItems as AnyCardRecord<R>[];

      for (const processor of processors) {
        try {
          processedRecords = await processor({
            reportId,
            cardId,
            kind,
            rawData: processedRecords,
            query: processedQuery,
            parameters: runtimeParams,
            cardSettings: cardSettings as M[keyof M],
          });
        } catch (error) {
          console.error("Post-processor failed:", error);
          throw error;
        }
      }

      return processedRecords;
    },
    [reportId, cardId, kind, runtimeParams, cardSettings]
  );

  const setRecords = useCallback(
    (records: AnyCardRecord<R>[]) => {
      onRecordsUpdate(records);
    },
    [onRecordsUpdate]
  );

  const sendMessage = useCallback((message: any) => {
    if (
      websocketRef.current &&
      websocketRef.current.readyState === WebSocket.OPEN
    ) {
      const payload =
        typeof message === "string" ? message : JSON.stringify(message);
      websocketRef.current.send(payload);
    } else {
      console.warn("Cannot send message: WebSocket is not connected");
    }
  }, []);

  const sendAck = useCallback((messageId: string) => {
    if (
      websocketRef.current &&
      websocketRef.current.readyState === WebSocket.OPEN
    ) {
      const ackMessage = {
        action: "ack",
        messageId,
        timestamp: new Date().toISOString(),
      };
      websocketRef.current.send(JSON.stringify(ackMessage));
    } else {
      console.warn("Cannot send acknowledgment: WebSocket is not connected");
    }
  }, []);

  const isWebSocketConnected = useCallback(() => {
    return websocketRef.current?.readyState === WebSocket.OPEN;
  }, []);

  const unsubscribeWebSocket = useCallback(
    (subscriptionId?: string) => {
      if (
        websocketRef.current &&
        websocketRef.current.readyState === WebSocket.OPEN
      ) {
        const wsPayload =
          query?.variant === "websocket" ? (query.payload as any) : null;
        const unsubMessage = {
          action: "unsubscribe",
          subscriptionId: subscriptionId || wsPayload?.subscriptionId,
          timestamp: new Date().toISOString(),
        };
        websocketRef.current.send(JSON.stringify(unsubMessage));
      }
    },
    [query]
  );

  const executeHttpQuery = useCallback(
    async (resolvedQuery: DashboardQuerySpec<M, R>) => {
      const payload = resolvedQuery.payload as HttpPayload;
      abortControllerRef.current = new AbortController();

      const paramsJson = JSON.stringify(payload?.params ?? {});
      const isGet = payload.method === "GET";

      // For GET → append ?params=<json>
      const finalUrl = isGet
        ? `${payload.url}?params=${encodeURIComponent(paramsJson)}`
        : payload.url;

      const fetchOptions: RequestInit = {
        method: payload.method || "GET",
        headers: payload.headers ?? {},
        signal: abortControllerRef.current.signal,
      };

      // For POST → body = paramsJson
      if (!isGet) {
        fetchOptions.body = JSON.stringify({
          params: paramsJson,
        });
      }

      try {
        const response = await fetch(finalUrl, fetchOptions);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } finally {
        abortControllerRef.current = null;
      }
    },
    []
  );

  const executeStreamingHttpQuery = useCallback(
    async (resolvedQuery: DashboardQuerySpec<M, R>) => {
      const payloadRaw = resolvedQuery.payload as StreamingHttpPayload & {
        streamFormat?: "sse" | "ndjson" | "delimited" | "json" | string;
        streamDelimiter?: string;
      };
      const payload = payloadRaw;
      const delimiter = payload.streamDelimiter || "\n";

      abortControllerRef.current = new AbortController();
      updateState({ streamActive: true, connectionStatus: "connecting" });

      const paramsJson = JSON.stringify(payload?.params ?? {});
      const isGet = (payload.method ?? "GET").toUpperCase() === "GET";
      const finalUrl = isGet
        ? `${payload.url}${payload.url!.includes("?") ? "&" : "?"}params=${encodeURIComponent(
            paramsJson
          )}`
        : payload.url!;

      const headers: Record<string, string> = { ...(payload.headers ?? {}) };
      const hasContentType = Object.keys(headers).some(
        (k) => k.toLowerCase() === "content-type"
      );
      if (!isGet && !hasContentType) {
        headers["Content-Type"] = "application/json";
      }

      const normalizeItemForProcessors = (item: any): any => {
        if (item == null) return item;

        if (typeof item === "object" && "__validation_error" in item) {
          return item;
        }

        if (typeof item === "object" && "__raw" in item) {
          return item.__raw;
        }

        if (
          typeof item === "object" &&
          ("kind" in item || "report_id" in item || "card_id" in item)
        ) {
          if ("data" in item && item.data !== undefined) {
            return item.data;
          }
          return item;
        }

        if (typeof item === "object" && "data" in item) {
          return item.data;
        }

        if (
          typeof item === "object" &&
          (Array.isArray(item.rows) || Array.isArray(item.columns))
        ) {
          return item;
        }

        return item;
      };

      try {
        const fetchOptions: RequestInit = {
          method: payload.method || "GET",
          headers,
          body: !isGet ? JSON.stringify({ params: paramsJson }) : undefined,
          signal: abortControllerRef.current.signal,
        };

        const response = await fetch(finalUrl, fetchOptions);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error("Response body is not available for streaming");
        }

        updateState({ connectionStatus: "connected" });

        const reader = response.body.getReader();
        streamReaderRef.current = reader;

        const decoder = new TextDecoder();
        let buffer = "";

        const forcedFormat = payload.streamFormat;

        let firstDataEmitted = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunkText = decoder.decode(value, { stream: true });
          buffer += chunkText;

          const format =
            forcedFormat ||
            (() => {
              if (/\bdata:/.test(buffer) || /\bevent:/.test(buffer))
                return "sse";
              const lines = buffer
                .split(/\r?\n/)
                .map((l) => l.trim())
                .filter(Boolean);
              if (
                lines.length > 1 &&
                lines.every((l) => {
                  try {
                    JSON.parse(l);
                    return true;
                  } catch {
                    return false;
                  }
                })
              )
                return "ndjson";
              if (payload.streamDelimiter) return "delimited";
              return "json";
            })();

          let completeBlocks: string[] = [];
          if (format === "sse") {
            const parts = buffer.split(/\n{2,}|\r?\n\r?\n/);
            if (buffer.endsWith("\n\n") || buffer.endsWith("\r\n\r\n")) {
              completeBlocks = parts.filter(Boolean);
              buffer = "";
            } else {
              completeBlocks = parts.slice(0, -1).filter(Boolean);
              buffer = parts.slice(-1)[0] || "";
            }
          } else if (format === "delimited") {
            const sep = payload.streamDelimiter
              ? payload.streamDelimiter + payload.streamDelimiter
              : delimiter + delimiter;
            const parts = buffer.split(sep);
            completeBlocks = parts.slice(0, -1).filter(Boolean);
            buffer = parts.slice(-1)[0] || "";
          } else if (format === "ndjson") {
            const lines = buffer.split(/\r?\n/);
            const completeLines: string[] = [];
            while (lines.length > 0) {
              const maybe = lines.shift()!;
              if (!maybe.trim()) continue;
              try {
                JSON.parse(maybe);
                completeLines.push(maybe);
              } catch {
                lines.unshift(maybe);
                break;
              }
            }
            completeBlocks = completeLines;
            buffer = lines.join("\n");
          } else {
            try {
              JSON.parse(buffer);
              completeBlocks = [buffer];
              buffer = "";
            } catch {
              const matches = (buffer.match(/\{[\s\S]*?\}|\[[\s\S]*?\]/g) ||
                []) as string[];
              if (matches.length > 0) {
                // last match guaranteed to exist because matches.length > 0
                const last = matches[matches.length - 1]!;
                const lastIdx = buffer.lastIndexOf(last);
                const head = buffer.substring(0, lastIdx);
                const headMatches =
                  (head.match(/\{[\s\S]*?\}|\[[\s\S]*?\]/g) as string[]) || [];
                completeBlocks = [...headMatches, last];
                buffer = buffer.substring(lastIdx + last.length);
              } else {
                completeBlocks = [];
              }
            }
          }

          if (completeBlocks.length === 0) {
            continue;
          }

          for (const block of completeBlocks) {
            let parsedItems: any[] = [];
            try {
              parsedItems = parseStreamBlock(
                block,
                format,
                payload.streamDelimiter
              );
            } catch (e) {
              parsedItems = [block];
            }

            for (const item of parsedItems) {
              try {
                const normalized = normalizeItemForProcessors(item);
                const processedRecords = await runPostProcessors(
                  normalized,
                  resolvedQuery,
                  postProcessors
                );

                // Normalize common server shapes that sometimes arrive as
                // stringified JSON or nested arrays when streaming.
                const normalizeForUI = (records: any[]): any[] => {
                  if (!Array.isArray(records)) return [];

                  // Flatten one level if server wrapped payload in an array
                  // (e.g. [[{...}]]) which can happen depending on serializer.
                  if (records.length === 1 && Array.isArray(records[0])) {
                    records = records[0];
                  }

                  for (let i = 0; i < records.length; i++) {
                    const r = records[i];
                    if (!r || typeof r !== "object") continue;

                    // meta sometimes comes stringified from backend -> parse it
                    if (typeof r.meta === "string") {
                      try {
                        r.meta = JSON.parse(r.meta);
                      } catch {
                        // leave as-is on parse failure
                      }
                    }

                    // rows sometimes arrives as JSON string -> parse
                    if (typeof r.rows === "string") {
                      try {
                        const parsed = JSON.parse(r.rows);
                        if (Array.isArray(parsed)) r.rows = parsed;
                      } catch {
                        // ignore
                      }
                    }

                    // rows may be array of stringified objects -> parse each
                    if (
                      Array.isArray(r.rows) &&
                      r.rows.length > 0 &&
                      typeof r.rows[0] === "string"
                    ) {
                      const parsedRows: any[] = [];
                      for (const rr of r.rows) {
                        if (typeof rr === "string") {
                          try {
                            parsedRows.push(JSON.parse(rr));
                          } catch {
                            parsedRows.push(rr);
                          }
                        } else parsedRows.push(rr);
                      }
                      r.rows = parsedRows;
                    }
                  }

                  return records;
                };

                const normalizedForUI = normalizeForUI(
                  Array.isArray(processedRecords)
                    ? processedRecords
                    : [processedRecords]
                );

                if (
                  Array.isArray(normalizedForUI) &&
                  normalizedForUI.length > 0
                ) {
                  onRecordsUpdate(normalizedForUI);
                  if (!firstDataEmitted) {
                    firstDataEmitted = true;
                    updateState({
                      loadingState: "success",
                      lastRefresh: new Date().toISOString(),
                    });
                  }
                }
              } catch (procErr) {
                console.warn("Post-processor failed for stream item:", procErr);
              }
            }
          }
        }

        if (buffer.trim()) {
          try {
            const tailItems = parseStreamBlock(
              buffer,
              payload.streamFormat,
              payload.streamDelimiter
            );
            for (const item of tailItems) {
              try {
                const normalized = normalizeItemForProcessors(item);
                const processedRecords = await runPostProcessors(
                  normalized,
                  resolvedQuery,
                  postProcessors
                );

                if (
                  Array.isArray(processedRecords) &&
                  processedRecords.length > 0
                ) {
                  onRecordsUpdate(processedRecords);
                  updateState({
                    loadingState: "success",
                    lastRefresh: new Date().toISOString(),
                  });
                }
              } catch (procErr) {
                console.warn(
                  "Post-processor failed for final stream item:",
                  procErr
                );
              }
            }
          } catch (e) {
            console.warn("Failed to parse final streaming data chunk:", e);
          }
        }

        return null;
      } finally {
        streamReaderRef.current = null;
        abortControllerRef.current = null;
        updateState({ streamActive: false, connectionStatus: "disconnected" });
      }
    },
    [
      postProcessors,
      onRecordsUpdate,
      updateState,
      parseStreamBlock,
      runPostProcessors,
    ]
  );

  const executeWebsocketQueryImpl = useCallback(
    async (resolvedQuery: DashboardQuerySpec<M, R>) => {
      const payload = resolvedQuery.payload as any as {
        topic: string;
        resumeSeq?: number;
        subscriptionId: string;
        ackPolicy?: "auto" | "manual";
        compression?: "none" | "gzip" | "deflate";
        url?: string;
        protocols?: string | string[];
        reconnectDelay?: number;
        maxReconnectAttempts?: number;
        heartbeatInterval?: number;
        headers?: Record<string, string>;
      };

      if (!payload.url) {
        throw new Error("WebSocket URL is required in payload");
      }

      // Configuration with sensible defaults
      const reconnectDelay = payload.reconnectDelay ?? 1000;
      const maxReconnectAttempts = payload.maxReconnectAttempts ?? 5;
      const heartbeatInterval = payload.heartbeatInterval ?? 30000;

      let reconnectAttempts = 0;

      const connectWebSocket = (): Promise<void> => {
        return new Promise((resolve, reject) => {
          try {
            updateState({
              connectionStatus: "connecting",
              streamActive: false,
            });

            // Clean up existing connection
            if (websocketRef.current) {
              websocketRef.current.close();
            }

            // Create WebSocket with optional protocols
            const ws = new WebSocket(payload.url!, payload.protocols);
            websocketRef.current = ws;

            // Connection timeout
            const connectionTimeout = setTimeout(() => {
              if (ws.readyState === WebSocket.CONNECTING) {
                ws.close();
                reject(new Error("WebSocket connection timeout"));
              }
            }, 10000);

            ws.onopen = () => {
              clearTimeout(connectionTimeout);

              reconnectAttempts = 0;
              // Clear manual close flag on successful open — this is an active connection
              manualCloseRef.current = false;
              updateState({
                connectionStatus: "connected",
                streamActive: true,
                loadingState: "success",
                lastRefresh: new Date().toISOString(),
              });

              // Send subscription message with extended options
              const subscriptionMessage = {
                action: "subscribe",
                topic: payload.topic,
                subscriptionId: payload.subscriptionId,
                resumeSeq: payload.resumeSeq,
                ackPolicy: payload.ackPolicy || "auto",
                compression: payload.compression || "none",
                timestamp: new Date().toISOString(),
                clientInfo: {
                  reportId,
                  cardId,
                  kind,
                  userAgent: navigator.userAgent,
                },
              };

              ws.send(JSON.stringify(subscriptionMessage));

              // Setup heartbeat if configured
              if (heartbeatInterval > 0) {
                heartbeatIntervalRef.current = setInterval(() => {
                  if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ action: "ping" }));
                  }
                }, heartbeatInterval);
              }

              resolve();
            };

            ws.onmessage = async (event) => {
              try {
                let messageData: any;

                // Handle different message formats
                if (typeof event.data === "string") {
                  try {
                    messageData = JSON.parse(event.data);
                  } catch {
                    // If not JSON, treat as raw string
                    messageData = event.data;
                  }
                } else if (event.data instanceof Blob) {
                  // Handle binary data
                  const text = await event.data.text();
                  try {
                    messageData = JSON.parse(text);
                  } catch {
                    messageData = text;
                  }
                } else {
                  messageData = event.data;
                }

                // Skip system messages (ping/pong, acks, etc.)
                if (messageData && typeof messageData === "object") {
                  // respond to ping (server heartbeat) and ignore pong/ack/error
                  if (messageData.action === "ping") {
                    // reply with pong to keep server heartbeat happy
                    try {
                      ws.send(
                        JSON.stringify({
                          action: "pong",
                          timestamp: new Date().toISOString(),
                        })
                      );
                    } catch {}
                    return;
                  }

                  if (
                    messageData.action === "pong" ||
                    messageData.action === "ack" ||
                    messageData.action === "error"
                  ) {
                    if (messageData.action === "error") {
                      console.warn(
                        "WebSocket server error:",
                        messageData.message || messageData.error
                      );
                    }
                    return;
                  }

                  // Handle subscription confirmation
                  if (messageData.action === "subscribed") {
                    return;
                  }

                  // Handle subscription errors
                  if (messageData.action === "subscription_error") {
                    console.error(
                      "WebSocket subscription error:",
                      messageData.message || messageData.error
                    );
                    updateState({
                      error: `Subscription error: ${messageData.message || messageData.error}`,
                    });
                    return;
                  }
                }

                // Handle automatic acknowledgment if policy is set to auto
                const messageId = messageData?.id || messageData?.messageId;
                if (payload.ackPolicy === "auto" && messageId) {
                  const ackMessage = {
                    action: "ack",
                    messageId,
                    subscriptionId: payload.subscriptionId,
                    timestamp: new Date().toISOString(),
                  };
                  ws.send(JSON.stringify(ackMessage));
                }

                // Process data through post-processors
                const processedRecords = await runPostProcessors(
                  messageData,
                  resolvedQuery,
                  postProcessors
                );

                if (
                  Array.isArray(processedRecords) &&
                  processedRecords.length > 0
                ) {
                  onRecordsUpdate(processedRecords);
                  updateState({
                    lastRefresh: new Date().toISOString(),
                  });
                }
              } catch (error) {
                console.error("Error processing WebSocket message:", error);
                updateState({
                  error: `Message processing error: ${error instanceof Error ? error.message : "Unknown error"}`,
                });
              }
            };

            ws.onerror = (error) => {
              console.error("WebSocket error:", error);
              clearTimeout(connectionTimeout);

              const errorMessage =
                error instanceof Event && (error as any).message
                  ? (error as any).message
                  : "WebSocket connection error";

              updateState({
                connectionStatus: "disconnected",
                streamActive: false,
                error: errorMessage,
              });

              if (ws.readyState === WebSocket.CONNECTING) {
                reject(
                  new Error(`WebSocket connection failed: ${errorMessage}`)
                );
              }
            };
            // store and expose the connect promise so concurrent callers reuse it
            // (connectPromiseRef is set by outer wrapper)

            ws.onclose = (event) => {
              clearTimeout(connectionTimeout);

              // Clear heartbeat
              if (heartbeatIntervalRef.current) {
                clearInterval(heartbeatIntervalRef.current);
                heartbeatIntervalRef.current = null;
              }

              updateState({
                connectionStatus: "disconnected",
                streamActive: false,
              });

              // Only attempt reconnection if not manually closed and within retry limits
              if (
                !manualCloseRef.current &&
                event.code !== 1000 && // Normal closure
                event.code !== 1001 && // Going away
                reconnectAttempts < maxReconnectAttempts
              ) {
                reconnectAttempts++;
                const delay = Math.min(
                  reconnectDelay * Math.pow(2, reconnectAttempts - 1),
                  30000
                );

                updateState({
                  connectionStatus: "reconnecting",
                  error: `Connection lost. Reconnecting... (${reconnectAttempts}/${maxReconnectAttempts})`,
                });

                reconnectTimeoutRef.current = setTimeout(async () => {
                  try {
                    // reuse existing connect promise if another connect started concurrently
                    if (connectPromiseRef.current) {
                      await connectPromiseRef.current;
                    } else {
                      await connectWebSocket();
                    }
                  } catch (reconnectError) {
                    console.error(
                      "WebSocket reconnection failed:",
                      reconnectError
                    );

                    if (reconnectAttempts >= maxReconnectAttempts) {
                      updateState({
                        loadingState: "error",
                        connectionStatus: "disconnected",
                        error: `Failed to reconnect after ${maxReconnectAttempts} attempts`,
                      });
                    }
                  }
                }, delay);
              } else if (reconnectAttempts >= maxReconnectAttempts) {
                updateState({
                  loadingState: "error",
                  connectionStatus: "disconnected",
                  error: `WebSocket connection failed after ${maxReconnectAttempts} attempts`,
                });
              }
            };
          } catch (error) {
            console.error("Error creating WebSocket:", error);
            reject(error);
          }
        });
      };

      // Wrap connectWebSocket to ensure only one concurrent connect attempt runs
      const connectOnce = (): Promise<void> => {
        if (
          websocketRef.current &&
          websocketRef.current.readyState === WebSocket.OPEN
        ) {
          // already connected
          return Promise.resolve();
        }
        if (connectPromiseRef.current) return connectPromiseRef.current;
        const p = connectWebSocket();
        connectPromiseRef.current = p;
        // clear ref once settled
        p.finally(() => {
          connectPromiseRef.current = null;
        });
        return p;
      };

      try {
        await connectOnce();
        return null;
      } catch (error) {
        manualCloseRef.current = true;
        throw error;
      }
    },
    [updateState, runPostProcessors, postProcessors, onRecordsUpdate]
  );

  const executeCustomQuery = useCallback(
    async (resolvedQuery: DashboardQuerySpec<M, R>) => {
      const payload = resolvedQuery.payload as CustomPayload<M, R>;

      if (!payload.handler) {
        throw new Error("Custom query handler is required");
      }

      // Create abort controller for custom queries
      abortControllerRef.current = new AbortController();
      const timeout = payload.timeout || 30000; // 30 second default timeout

      try {
        updateState({
          connectionStatus: "connecting",
          streamActive: !!payload.streaming,
        });

        // Create the context for the custom handler
        const context: CustomQueryContext<M, R> = {
          reportId,
          cardId,
          kind,
          cardSpec: cardSpec! as any,
          runtimeParams: runtimeParams,
          cardSettings,
          params: payload?.params,
          signal: abortControllerRef.current.signal,
          updateState: (state) => {
            updateState(state);
          },
        };

        // Set up timeout
        const timeoutId = setTimeout(() => {
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
          }
        }, timeout);

        let result: AnyCardRecord<R>[];

        try {
          updateState({ connectionStatus: "connected" });

          const handlerResult = await payload.handler(context);

          // Handle different return types
          if (Symbol.asyncIterator in Object(handlerResult)) {
            // Handle async iterable (streaming)
            result = [];
            updateState({ streamActive: true });

            for await (const batch of handlerResult as AsyncIterable<
              AnyCardRecord<R>[]
            >) {
              if (abortControllerRef.current?.signal.aborted) {
                break;
              }

              // Process each batch through post-processors
              const processedRecords = await runPostProcessors(
                batch,
                resolvedQuery,
                postProcessors
              );

              if (
                Array.isArray(processedRecords) &&
                processedRecords.length > 0
              ) {
                onRecordsUpdate(processedRecords);
                updateState({
                  lastRefresh: new Date().toISOString(),
                });
              }

              result = result.concat(processedRecords);
            }

            return result;
          } else {
            // Handle direct return (array or promise)
            const directResult = Array.isArray(handlerResult)
              ? handlerResult
              : await Promise.resolve(handlerResult);

            return directResult;
          }
        } finally {
          clearTimeout(timeoutId);
        }
      } catch (error) {
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error("Custom query was cancelled");
        }

        const errorMessage =
          error instanceof Error ? error.message : "Custom query failed";
        updateState({
          connectionStatus: "disconnected",
          streamActive: false,
          error: errorMessage,
        });

        throw error;
      } finally {
        abortControllerRef.current = null;
        updateState({
          connectionStatus: "disconnected",
          streamActive: false,
        });
      }
    },
    [
      reportId,
      cardId,
      kind,
      cardSpec,
      runtimeParams,
      cardSettings,
      updateState,
      runPostProcessors,
      postProcessors,
      onRecordsUpdate,
    ]
  );

  const executeQuery = useCallback(
    async (params: Record<string, any>) => {
      if (params) {
        setParams(params);
      }

      if (!query) {
        return;
      }
      if (state.loadingState === "loading") {
        return;
      }

      updateState({ loadingState: "loading", error: undefined });

      try {
        const processedQuery = await runPreProcessors(query, preProcessors);

        const resolvedQuery = resolveParamPlaceholders(
          processedQuery,
          {
            ...runtimeParams,
            ...params,
          } as Record<string, unknown>
        );

        let rawData: any;

        switch (resolvedQuery.variant) {
          case "http":
            rawData = await executeHttpQuery(resolvedQuery);
            break;
          case "streaming-http":
            rawData = await executeStreamingHttpQuery(resolvedQuery);
            break;
          case "websocket":
            rawData = await executeWebsocketQueryImpl(resolvedQuery);
            break;
          case "custom":
            rawData = await executeCustomQuery(resolvedQuery);
            break;
          default:
            throw new Error(
              `Unsupported query variant: ${(resolvedQuery as any).variant}`
            );
        }

        // Non-streaming: process once through post-processors
        if (rawData !== null) {
          const processedRecords = await runPostProcessors(
            rawData,
            resolvedQuery,
            postProcessors
          );
          onRecordsUpdate(processedRecords);
          updateState({
            loadingState: "success",
            lastRefresh: new Date().toISOString(),
          });
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        updateState({
          loadingState: "error",
          error: errorMessage,
          connectionStatus: "disconnected",
          streamActive: false,
        });
        throw error;
      }
    },
    [
      state.loadingState,
      query,
      runtimeParams,
      preProcessors,
      postProcessors,
      executeHttpQuery,
      executeStreamingHttpQuery,
      executeWebsocketQueryImpl,
      executeCustomQuery,
      runPreProcessors,
      runPostProcessors,
      onRecordsUpdate,
      updateState,
      reportId,
      cardId,
      setParams,
      params,
    ]
  );

  const reconnect = useCallback(async () => {
    cancel();
    await executeQuery(params);
  }, [cancel, executeQuery, params]);

  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  // Auto-cleanup when query changes (especially for WebSocket connections)
  useEffect(() => {
    return () => {
      // Cancel any ongoing connections when dependencies change
      if (
        websocketRef.current ||
        streamReaderRef.current ||
        abortControllerRef.current
      ) {
        cancel();
      }
    };
  }, [query?.variant, query?.payload, cancel]);

  const value = useMemo<CardExecutionContextType<M, R>>(
    () => ({
      state,
      executeQuery,
      cancel,
      reconnect,
      setRecords,
      sendMessage: query?.variant === "websocket" ? sendMessage : undefined,
      sendAck: query?.variant === "websocket" ? sendAck : undefined,
      isWebSocketConnected:
        query?.variant === "websocket" ? isWebSocketConnected : undefined,
      unsubscribe:
        query?.variant === "websocket" ? unsubscribeWebSocket : undefined,
    }),
    [
      state,
      executeQuery,
      cancel,
      reconnect,
      setRecords,
      sendMessage,
      sendAck,
      isWebSocketConnected,
      unsubscribeWebSocket,
      query?.variant,
    ]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useCardExecution = <
  M extends CardSettingsMap = CardSettingsMap,
  R extends CardRecordMap = CardRecordMap,
>(
  reportId: string,
  cardId: string
): CardExecutionContextType<M, R> => {
  const cardKey = `${reportId}::${cardId}`;
  const Context = getCardExecutionContext<M, R>(cardKey);
  const ctx = useContext(Context);

  if (!ctx) {
    throw new Error(
      `useCardExecution must be used within a CardExecutionProvider for card ${cardKey}`
    );
  }

  return ctx;
};
