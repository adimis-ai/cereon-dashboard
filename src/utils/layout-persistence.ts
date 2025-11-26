import type { CardGridPosition } from "../types";
import { Layout } from "react-grid-layout";

/**
 * Utility for persisting dashboard card layouts to localStorage
 */

export interface PersistedLayout {
  [cardId: string]: CardGridPosition;
}

export interface LayoutPersistenceOptions {
  dashboardId: string;
  reportId: string;
  reportTitle?: string;
}

/**
 * Generate a unique key for localStorage based on dashboard and report identifiers
 */
function getLayoutKey(options: LayoutPersistenceOptions): string {
  const { dashboardId, reportId, reportTitle } = options;
  // Create a composite key that includes dashboard, report ID, and optionally title for uniqueness
  const titleSuffix = reportTitle ? `-${reportTitle.replace(/\s+/g, '-').toLowerCase()}` : '';
  return `cereon-dashboard-layout-${dashboardId}-${reportId}${titleSuffix}`;
}

/**
 * Save layout to localStorage
 */
export function saveLayoutToStorage(
  layout: Layout[],
  options: LayoutPersistenceOptions
): void {
  try {
    const layoutKey = getLayoutKey(options);
    
    // Convert react-grid-layout Layout[] to our CardGridPosition format
    const persistedLayout: PersistedLayout = {};
    
    layout.forEach((item) => {
      const cardId = item.i;
      if (cardId) {
        persistedLayout[cardId] = {
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
        };
      }
    });

    // Add metadata
    const layoutWithMetadata = {
      layout: persistedLayout,
      timestamp: new Date().toISOString(),
      version: '1.0', // For future migration compatibility
      dashboardId: options.dashboardId,
      reportId: options.reportId,
      reportTitle: options.reportTitle,
    };

    localStorage.setItem(layoutKey, JSON.stringify(layoutWithMetadata));
    
    console.log('Layout saved to localStorage:', {
      key: layoutKey,
      cardCount: layout.length,
      timestamp: layoutWithMetadata.timestamp,
    });
  } catch (error) {
    console.warn('Failed to save layout to localStorage:', error);
  }
}

/**
 * Load layout from localStorage
 */
export function loadLayoutFromStorage(
  options: LayoutPersistenceOptions
): PersistedLayout | null {
  try {
    const layoutKey = getLayoutKey(options);
    const stored = localStorage.getItem(layoutKey);
    
    if (!stored) {
      console.log('No saved layout found for key:', layoutKey);
      return null;
    }

    const parsed = JSON.parse(stored);
    
    // Handle both old format (direct layout object) and new format (with metadata)
    if (parsed.layout && parsed.version) {
      // New format with metadata
      console.log('Loaded layout from localStorage:', {
        key: layoutKey,
        timestamp: parsed.timestamp,
        version: parsed.version,
        cardCount: Object.keys(parsed.layout).length,
      });
      return parsed.layout;
    } else {
      // Legacy format - assume the entire object is the layout
      console.log('Loaded legacy layout from localStorage:', {
        key: layoutKey,
        cardCount: Object.keys(parsed).length,
      });
      return parsed;
    }
  } catch (error) {
    console.warn('Failed to load layout from localStorage:', error);
    return null;
  }
}

/**
 * Clear saved layout from localStorage
 */
export function clearLayoutFromStorage(options: LayoutPersistenceOptions): void {
  try {
    const layoutKey = getLayoutKey(options);
    localStorage.removeItem(layoutKey);
    console.log('Cleared layout from localStorage:', layoutKey);
  } catch (error) {
    console.warn('Failed to clear layout from localStorage:', error);
  }
}

/**
 * Get all saved layout keys for a dashboard (useful for cleanup)
 */
export function getDashboardLayoutKeys(dashboardId: string): string[] {
  try {
    const prefix = `cereon-dashboard-layout-${dashboardId}-`;
    const keys: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) {
        keys.push(key);
      }
    }
    
    return keys;
  } catch (error) {
    console.warn('Failed to get dashboard layout keys:', error);
    return [];
  }
}

/**
 * Clear all layouts for a dashboard
 */
export function clearDashboardLayouts(dashboardId: string): void {
  try {
    const keys = getDashboardLayoutKeys(dashboardId);
    keys.forEach(key => localStorage.removeItem(key));
    console.log('Cleared all layouts for dashboard:', dashboardId, keys.length);
  } catch (error) {
    console.warn('Failed to clear dashboard layouts:', error);
  }
}

/**
 * Check if localStorage is available and functional
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = '__cereon_storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Debounced save function to prevent excessive localStorage writes
 */
export function createDebouncedSave(
  delay: number = 1000
): (layout: Layout[], options: LayoutPersistenceOptions) => void {
  let timeoutId: any | null = null;
  
  return (layout: Layout[], options: LayoutPersistenceOptions) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      saveLayoutToStorage(layout, options);
      timeoutId = null;
    }, delay);
  };
}