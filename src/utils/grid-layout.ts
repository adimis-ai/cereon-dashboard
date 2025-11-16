import { Layout } from "react-grid-layout";
import { CardGridPosition } from "../types";

/**
 * Utility functions for grid layout management
 */

export interface GridLayoutUtils {
  optimizeLayout: (layout: Layout[], cols: number) => Layout[];
  detectCollisions: (layout: Layout[]) => Layout[];
  calculateOptimalSize: (cardKind: string, content?: any) => { w: number; h: number };
  compactLayout: (layout: Layout[], compactType?: 'vertical' | 'horizontal') => Layout[];
  validateLayout: (layout: Layout[], cols: number) => boolean;
  generateAutoLayout: (cardCount: number, cols: number, cardTypes: string[]) => Layout[];
}

/**
 * Optimizes layout by removing gaps and ensuring efficient space usage
 */
export function optimizeLayout(layout: Layout[], cols: number): Layout[] {
  if (!layout || layout.length === 0) return [];

  // Sort by y position first, then by x position
  const sortedLayout = [...layout].sort((a, b) => {
    if (a.y !== b.y) return a.y - b.y;
    return a.x - b.x;
  });

  const optimized: Layout[] = [];
  const occupiedPositions = new Set<string>();

  for (const item of sortedLayout) {
    let { x, y, w, h } = item;
    
    // Find the first available position
    while (isPositionOccupied(x, y, w, h, occupiedPositions)) {
      x++;
      if (x + w > cols) {
        x = 0;
        y++;
      }
    }

    // Mark positions as occupied
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        occupiedPositions.add(`${x + dx},${y + dy}`);
      }
    }

    optimized.push({ ...item, x, y });
  }

  return optimized;
}

/**
 * Detects and resolves layout collisions
 */
export function detectCollisions(layout: Layout[]): Layout[] {
  const resolved: Layout[] = [];
  const occupiedPositions = new Set<string>();

  for (const item of layout) {
    let { x, y, w, h } = item;
    
    // Check for collisions
    if (hasCollision(x, y, w, h, occupiedPositions)) {
      // Find next available position
      const newPosition = findNextAvailablePosition(w, h, occupiedPositions, 12);
      x = newPosition.x;
      y = newPosition.y;
    }

    // Mark positions as occupied
    markPositionOccupied(x, y, w, h, occupiedPositions);
    resolved.push({ ...item, x, y });
  }

  return resolved;
}

/**
 * Calculates optimal card size based on content type and data
 */
export function calculateOptimalSize(cardKind: string, content?: any): { w: number; h: number } {
  const baseSizes = {
    number: { w: 2, h: 3 },
    chart: { w: 4, h: 6 },
    table: { w: 6, h: 8 },
    markdown: { w: 4, h: 5 },
    iframe: { w: 6, h: 8 },
  };

  let baseSize = baseSizes[cardKind as keyof typeof baseSizes] || { w: 3, h: 4 };

  // Adjust size based on content
  if (content) {
    switch (cardKind) {
      case 'table':
        if (Array.isArray(content) && content.length > 0) {
          const cols = Object.keys(content[0] || {}).length;
          const rows = content.length;
          baseSize.w = Math.min(Math.max(cols, 4), 12);
          baseSize.h = Math.min(Math.max(Math.ceil(rows / 5) + 3, 6), 16);
        }
        break;
      case 'chart':
        // Charts generally benefit from wider layouts
        baseSize.w = Math.max(baseSize.w, 5);
        break;
      case 'markdown':
        if (typeof content === 'string') {
          const lines = content.split('\n').length;
          baseSize.h = Math.min(Math.max(Math.ceil(lines / 3), 4), 12);
        }
        break;
    }
  }

  return baseSize;
}

/**
 * Compacts layout to minimize empty space
 */
export function compactLayout(
  layout: Layout[], 
  compactType: 'vertical' | 'horizontal' = 'vertical'
): Layout[] {
  if (!layout || layout.length === 0) return [];

  const compacted = [...layout];

  if (compactType === 'vertical') {
    // Sort by y, then x
    compacted.sort((a, b) => {
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
    });

    // Move each item up as much as possible
    for (let i = 0; i < compacted.length; i++) {
      const item = compacted[i];
      if (!item) continue;
      
      let newY = 0;

      // Find the lowest possible Y position
      while (newY < item.y) {
        const hasCollision = compacted.slice(0, i).some(other => 
          other && rectanglesIntersect(
            { x: item.x, y: newY, w: item.w, h: item.h },
            { x: other.x, y: other.y, w: other.w, h: other.h }
          )
        );

        if (!hasCollision) {
          item.y = newY;
          break;
        }
        newY++;
      }
    }
  } else {
    // Horizontal compacting - similar logic but for X axis
    compacted.sort((a, b) => {
      if (a.x !== b.x) return a.x - b.x;
      return a.y - b.y;
    });

    for (let i = 0; i < compacted.length; i++) {
      const item = compacted[i];
      if (!item) continue;
      
      let newX = 0;

      while (newX < item.x) {
        const hasCollision = compacted.slice(0, i).some(other => 
          other && rectanglesIntersect(
            { x: newX, y: item.y, w: item.w, h: item.h },
            { x: other.x, y: other.y, w: other.w, h: other.h }
          )
        );

        if (!hasCollision) {
          item.x = newX;
          break;
        }
        newX++;
      }
    }
  }

  return compacted;
}

/**
 * Validates layout integrity
 */
export function validateLayout(layout: Layout[], cols: number): boolean {
  if (!layout || !Array.isArray(layout)) return false;

  for (const item of layout) {
    // Check bounds
    if (item.x < 0 || item.y < 0 || item.w <= 0 || item.h <= 0) {
      return false;
    }
    
    // Check if item fits within grid
    if (item.x + item.w > cols) {
      return false;
    }

    // Check for required properties
    if (!item.i || typeof item.i !== 'string') {
      return false;
    }
  }

  // Check for overlaps
  for (let i = 0; i < layout.length; i++) {
    for (let j = i + 1; j < layout.length; j++) {
      const itemI = layout[i];
      const itemJ = layout[j];
      if (itemI && itemJ && rectanglesIntersect(itemI, itemJ)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Generates automatic layout for cards
 */
export function generateAutoLayout(
  cardCount: number, 
  cols: number, 
  cardTypes: string[] = []
): Layout[] {
  const layout: Layout[] = [];
  let currentX = 0;
  let currentY = 0;
  const maxRowHeight = Math.ceil(Math.sqrt(cardCount));

  for (let i = 0; i < cardCount; i++) {
    const cardType = cardTypes[i] || 'default';
    const size = calculateOptimalSize(cardType);
    
    // Check if current position fits
    if (currentX + size.w > cols) {
      currentX = 0;
      currentY += maxRowHeight;
    }

    layout.push({
      i: `card-${i}`,
      x: currentX,
      y: currentY,
      w: Math.min(size.w, cols),
      h: size.h,
      minW: 1,
      minH: 2,
      maxW: cols,
    });

    currentX += size.w;
  }

  return layout;
}

/**
 * Helper function to check if position is occupied
 */
function isPositionOccupied(
  x: number, 
  y: number, 
  w: number, 
  h: number, 
  occupiedPositions: Set<string>
): boolean {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      if (occupiedPositions.has(`${x + dx},${y + dy}`)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Helper function to check for collisions
 */
function hasCollision(
  x: number, 
  y: number, 
  w: number, 
  h: number, 
  occupiedPositions: Set<string>
): boolean {
  return isPositionOccupied(x, y, w, h, occupiedPositions);
}

/**
 * Marks position as occupied in the grid
 */
function markPositionOccupied(
  x: number, 
  y: number, 
  w: number, 
  h: number, 
  occupiedPositions: Set<string>
): void {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      occupiedPositions.add(`${x + dx},${y + dy}`);
    }
  }
}

/**
 * Finds next available position in the grid
 */
function findNextAvailablePosition(
  w: number, 
  h: number, 
  occupiedPositions: Set<string>, 
  cols: number
): { x: number; y: number } {
  let x = 0;
  let y = 0;

  while (y < 1000) { // Safety limit
    while (x + w <= cols) {
      if (!isPositionOccupied(x, y, w, h, occupiedPositions)) {
        return { x, y };
      }
      x++;
    }
    x = 0;
    y++;
  }

  // Fallback
  return { x: 0, y: 0 };
}

/**
 * Checks if two rectangles intersect
 */
function rectanglesIntersect(
  rect1: { x: number; y: number; w: number; h: number },
  rect2: { x: number; y: number; w: number; h: number }
): boolean {
  return !(
    rect1.x + rect1.w <= rect2.x ||
    rect2.x + rect2.w <= rect1.x ||
    rect1.y + rect1.h <= rect2.y ||
    rect2.y + rect2.h <= rect1.y
  );
}

/**
 * Converts CardGridPosition to react-grid-layout Layout
 */
export function cardPositionToLayout(
  cardId: string, 
  position: CardGridPosition
): Layout {
  return {
    i: cardId,
    x: position.x,
    y: position.y,
    w: position.w,
    h: position.h,
    minW: position.minW,
    maxW: position.maxW,
    minH: position.minH,
    maxH: position.maxH,
    static: position.static,
    isDraggable: position.isDraggable,
    isResizable: position.isResizable,
  };
}

/**
 * Converts react-grid-layout Layout to CardGridPosition
 */
export function layoutToCardPosition(layout: Layout): CardGridPosition {
  return {
    x: layout.x,
    y: layout.y,
    w: layout.w,
    h: layout.h,
    minW: layout.minW,
    maxW: layout.maxW,
    minH: layout.minH,
    maxH: layout.maxH,
    static: layout.static,
    isDraggable: layout.isDraggable,
    isResizable: layout.isResizable,
  };
}

// Export all utilities as a single object for convenience
export const GridLayoutUtils: GridLayoutUtils = {
  optimizeLayout,
  detectCollisions,
  calculateOptimalSize,
  compactLayout,
  validateLayout,
  generateAutoLayout,
};