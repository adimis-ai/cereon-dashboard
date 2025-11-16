import { useEffect, useRef, useCallback } from "react";
import { useDashboard } from "../contexts/dashboard";

/**
 * Hook for managing card visibility and intersection observation.
 * Automatically updates card state when cards enter/exit viewport.
 */
export function useCardVisibility(reportId: string, cardId: string) {
  const { getCardState, setCardState } = useDashboard();
  const cardRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const cardState = getCardState(reportId, cardId);

  const updateVisibility = useCallback(
    (isVisible: boolean) => {
      if (cardState.isVisible !== isVisible) {
        setCardState(reportId, cardId, { isVisible });
      }
    },
    [reportId, cardId, cardState.isVisible, setCardState]
  );

  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;

    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          updateVisibility(entry.isIntersecting);
        });
      },
      {
        threshold: 0.1, // Card is considered visible when 10% is in viewport
        rootMargin: "50px", // Start loading data slightly before card is visible
      }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [updateVisibility]);

  const setFocus = useCallback(
    (hasFocus: boolean) => {
      setCardState(reportId, cardId, { hasFocus });
    },
    [reportId, cardId, setCardState]
  );

  return {
    cardRef,
    isVisible: cardState.isVisible,
    hasFocus: cardState.hasFocus,
    setFocus,
  };
}