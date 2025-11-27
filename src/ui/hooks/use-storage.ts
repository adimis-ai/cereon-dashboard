import { useEffect, useState, useCallback } from "react";

type StorageType = "localStorage" | "sessionStorage";

const isSet = (value: any): value is Set<any> => {
  return value instanceof Set;
};

export const useStorageHook = <TValue>(
  type: StorageType,
  storageKey: string,
  defaultValue?: TValue | null,
  eventName: string = "storageChanged"
) => {
  const storage =
    type === "localStorage" ? window.localStorage : window.sessionStorage;

  const serializeValue = (value: any): string => {
    if (isSet(value)) {
      return JSON.stringify({
        __type: "Set",
        value: Array.from(value),
      });
    }
    return typeof value === "object"
      ? JSON.stringify(value)
      : String(value);
  };

  const deserializeValue = (value: string): any => {
    try {
      const parsed = JSON.parse(value);
      if (parsed && parsed.__type === "Set" && Array.isArray(parsed.value)) {
        return new Set(parsed.value);
      }
      return parsed;
    } catch {
      return value;
    }
  };

  const initializeValue = (): TValue | null | undefined => {
    const storedValue = storage.getItem(storageKey);
    if (storedValue !== null) {
      return deserializeValue(storedValue) as TValue | null;
    }
    if (typeof defaultValue !== "undefined") {
      const serializedDefault = serializeValue(defaultValue);
      storage.setItem(storageKey, serializedDefault);
      return defaultValue as TValue | null;
    }
    return undefined;
  };
  const [storedValue, setStoredValue] = useState<TValue | null | undefined>(
    initializeValue
  );

  const setValue = useCallback(
    (valueOrFn: React.SetStateAction<TValue | null | undefined>) => {
      setStoredValue((prevStored) => {
        const newValue =
          typeof valueOrFn === "function"
            ? (valueOrFn as (
                prev: TValue | null | undefined
              ) => TValue | null | undefined)(prevStored)
            : valueOrFn;

        if (newValue === null || typeof newValue === "undefined") {
          storage.removeItem(storageKey);
          window.dispatchEvent(
            new CustomEvent(eventName, {
              detail: { key: storageKey, value: null },
            })
          );
          return newValue as TValue | null | undefined;
        }

        const serialized = serializeValue(newValue);
        try {
          storage.setItem(storageKey, serialized);
        } catch (e) {
          // If storage quota exceeded or disabled, still update state
          // but don't block execution. Swallow the error silently.
        }

        window.dispatchEvent(
          new CustomEvent(eventName, {
            detail: { key: storageKey, value: serialized },
          })
        );

        return newValue as TValue | null | undefined;
      });
    },
    [storage, storageKey, eventName]
  );

  const removeValue = useCallback(() => {
    setStoredValue(undefined);
    storage.removeItem(storageKey);
    window.dispatchEvent(
      new CustomEvent(eventName, {
        detail: { key: storageKey, value: null },
      })
    );
  }, [storage, storageKey, eventName]);

  const getValue = useCallback((): TValue | null | undefined => {
    const value = storage.getItem(storageKey);
    if (!value) return null;
    return deserializeValue(value) as TValue | null | undefined;
  }, [storage, storageKey]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === storageKey) {
        const newValue = event.newValue ? deserializeValue(event.newValue) : null;
        setStoredValue(newValue as TValue | null | undefined);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [storageKey]);

  useEffect(() => {
    const handleCustomStorageChange = (event: CustomEvent) => {
      if (event.detail.key === storageKey) {
        const newValue = event.detail.value ? deserializeValue(event.detail.value) : null;
        setStoredValue(newValue as TValue | null | undefined);
      }
    };

    window.addEventListener(eventName, handleCustomStorageChange as EventListener);
    return () => window.removeEventListener(eventName, handleCustomStorageChange as EventListener);
  }, [storageKey, eventName]);

  return {
    storedValue,
    setValue,
    removeValue,
    getValue,
  };
};
