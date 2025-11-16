# Performance Optimization

Complete guide to optimizing the performance of @cereon/dashboard applications for production use.

## Table of Contents

- [Performance Overview](#performance-overview)
- [Bundle Optimization](#bundle-optimization)
- [Runtime Performance](#runtime-performance)
- [Memory Management](#memory-management)
- [Network Optimization](#network-optimization)
- [Monitoring & Profiling](#monitoring--profiling)
- [Best Practices](#best-practices)

## Performance Overview

Cereon Dashboard is designed for high performance with large datasets and complex dashboards. This guide covers optimization strategies for different aspects of your dashboard application.

### Performance Metrics

Key metrics to monitor:
- **Initial Load Time**: Time to first meaningful paint
- **Time to Interactive**: When dashboard becomes fully interactive
- **Memory Usage**: RAM consumption during operation
- **Network Requests**: API calls and data transfer
- **Render Performance**: Frame rate and update smoothness

### Performance Targets

Recommended targets:
- Initial load: < 3 seconds
- Card refresh: < 1 second
- Memory usage: < 100MB for typical dashboard
- 60 FPS animations and interactions

## Bundle Optimization

Optimize your JavaScript bundle size for faster loading.

### Code Splitting

Split your dashboard code for better loading performance:

```tsx
// Lazy load the dashboard component
import { lazy, Suspense } from 'react'

const Dashboard = lazy(() => import('@cereon/dashboard').then(module => ({
  default: module.Dashboard
})))

const DashboardProvider = lazy(() => import('@cereon/dashboard').then(module => ({
  default: module.DashboardProvider
})))

function App() {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <DashboardProvider>
        <Dashboard state={{ spec: dashboardSpec }} />
      </DashboardProvider>
    </Suspense>
  )
}
```

### Tree Shaking

Import only the components you need:

```tsx
// ❌ Imports entire package
import { Dashboard, DashboardProvider, useDashboard, formatNumber } from '@cereon/dashboard'

// ✅ Import specific modules (if supported)
import { Dashboard } from '@cereon/dashboard/components/Dashboard'
import { DashboardProvider } from '@cereon/dashboard/contexts/DashboardProvider'
import { useDashboard } from '@cereon/dashboard/hooks/useDashboard'
import { formatNumber } from '@cereon/dashboard/utils/formatNumber'
```

### Webpack Configuration

Optimize your webpack configuration:

```js
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        dashboard: {
          test: /[\\/]node_modules[\\/]@cereon[\\/]dashboard[\\/]/,
          name: 'cereon-dashboard',
          chunks: 'all',
          priority: 10
        }
      }
    }
  },
  
  resolve: {
    alias: {
      // Use production builds
      'react': 'react/cjs/react.production.min.js',
      'react-dom': 'react-dom/cjs/react-dom.production.min.js'
    }
  }
}
```

### Vite Configuration

Optimize Vite for production:

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          dashboard: ['@cereon/dashboard'],
          charts: ['chart.js', 'react-chartjs-2'],
          grid: ['react-grid-layout']
        }
      }
    },
    
    // Enable compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true
      }
    }
  },
  
  optimizeDeps: {
    include: [
      '@cereon/dashboard',
      'react-grid-layout',
      'chart.js'
    ]
  }
})
```

## Runtime Performance

Optimize dashboard performance during operation.

### Virtual Scrolling

For large tables, enable virtual scrolling:

```tsx
{
  id: 'large_table',
  kind: 'table',
  settings: {
    // Enable virtual scrolling for large datasets
    virtualization: {
      enabled: true,
      rowHeight: 50,          // Fixed row height
      overscanCount: 10,      // Extra rows to render
      maxHeight: 400          // Container height
    },
    
    // Optimize pagination
    pagination: {
      enabled: true,
      pageSize: 100,          // Larger page size for virtual scrolling
      prefetchPages: 1        // Prefetch next page
    }
  }
}
```

### Chart Optimization

Optimize chart performance:

```tsx
{
  id: 'performance_chart',
  kind: 'chart',
  settings: {
    // Optimize chart rendering
    chartOptions: {
      // Disable animations for better performance
      animation: false,
      
      // Reduce point radius for large datasets
      elements: {
        point: {
          radius: 1,
          hoverRadius: 3
        }
      },
      
      // Optimize scales
      scales: {
        x: {
          // Sample data for large datasets
          ticks: {
            maxTicksLimit: 20
          }
        }
      },
      
      // Disable interaction for static charts
      interaction: {
        intersect: false,
        mode: 'nearest'
      }
    },
    
    // Data sampling for large datasets
    dataProcessing: {
      sampleSize: 1000,       // Maximum data points
      samplingMethod: 'lttb'  // Largest Triangle Three Buckets
    }
  }
}
```

### Debounced Updates

Debounce frequent updates:

```tsx
import { useDashboard } from '@cereon/dashboard'
import { useCallback, useMemo } from 'react'
import { debounce } from 'lodash'

function OptimizedDashboard() {
  const { updateReportState } = useDashboard()
  
  // Debounce layout updates
  const debouncedLayoutUpdate = useCallback(
    debounce((reportId: string, layout: Layout[]) => {
      updateReportState(reportId, { layout })
    }, 300),
    []
  )
  
  // Memoize expensive calculations
  const processedSpec = useMemo(() => {
    return processComplexSpec(rawSpec)
  }, [rawSpec])
  
  return (
    <Dashboard
      state={{ spec: processedSpec }}
      onLayoutChange={debouncedLayoutUpdate}
    />
  )
}
```

### Lazy Card Loading

Load cards only when visible:

```tsx
import { useIntersectionObserver } from '@cereon/dashboard'

function LazyCard({ cardSpec }: { cardSpec: CardSpec }) {
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px' // Load 100px before visible
  })
  
  return (
    <div ref={ref}>
      {isVisible ? (
        <Card spec={cardSpec} />
      ) : (
        <div style={{ height: '300px', background: '#f0f0f0' }}>
          Loading card...
        </div>
      )}
    </div>
  )
}
```

## Memory Management

Prevent memory leaks and optimize memory usage.

### Connection Cleanup

Properly cleanup WebSocket connections:

```tsx
import { useEffect, useRef } from 'react'

function WebSocketCard({ query }: { query: WebSocketQueryConfig }) {
  const connectionRef = useRef<WebSocket | null>(null)
  
  useEffect(() => {
    // Create connection
    const ws = new WebSocket(query.payload.url)
    connectionRef.current = ws
    
    // Setup handlers
    ws.onmessage = handleMessage
    ws.onerror = handleError
    
    // Cleanup on unmount
    return () => {
      if (connectionRef.current) {
        connectionRef.current.close()
        connectionRef.current = null
      }
    }
  }, [query.payload.url])
  
  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (connectionRef.current) {
        connectionRef.current.close()
      }
    }
  }, [])
}
```

### Memory Monitoring

Monitor memory usage:

```tsx
function MemoryMonitor() {
  useEffect(() => {
    const interval = setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        console.log('Memory usage:', {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
        })
      }
    }, 10000) // Check every 10 seconds
    
    return () => clearInterval(interval)
  }, [])
  
  return null
}
```

### Data Cleanup

Clean up unused data:

```tsx
import { useDashboard } from '@cereon/dashboard'
import { useEffect } from 'react'

function DataCleanup() {
  const { reportStates } = useDashboard()
  
  useEffect(() => {
    // Clean up old data every 5 minutes
    const interval = setInterval(() => {
      const cutoff = Date.now() - 5 * 60 * 1000 // 5 minutes ago
      
      Object.keys(reportStates).forEach(reportId => {
        const report = reportStates[reportId]
        
        // Remove old cached data
        Object.keys(report.cardData).forEach(cardId => {
          const cardData = report.cardData[cardId]
          if (cardData && cardData.timestamp && 
              new Date(cardData.timestamp).getTime() < cutoff) {
            delete report.cardData[cardId]
          }
        })
      })
    }, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [reportStates])
  
  return null
}
```

## Network Optimization

Optimize network requests and data loading.

### Request Batching

Batch multiple requests:

```tsx
interface BatchQueryConfig {
  queries: QueryConfig[]
  batchSize?: number
  delay?: number
}

async function executeBatchQuery(config: BatchQueryConfig) {
  const { queries, batchSize = 10, delay = 100 } = config
  const results: any[] = []
  
  // Process queries in batches
  for (let i = 0; i < queries.length; i += batchSize) {
    const batch = queries.slice(i, i + batchSize)
    
    // Execute batch concurrently
    const batchResults = await Promise.allSettled(
      batch.map(query => executeQuery(query))
    )
    
    results.push(...batchResults)
    
    // Add delay between batches to avoid overwhelming server
    if (i + batchSize < queries.length) {
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  return results
}
```

### Request Caching

Implement intelligent caching:

```tsx
interface CacheConfig {
  maxAge: number        // Cache duration in ms
  maxSize: number       // Maximum cache entries
  staleWhileRevalidate: boolean
}

class QueryCache {
  private cache = new Map<string, CacheEntry>()
  private config: CacheConfig
  
  constructor(config: CacheConfig) {
    this.config = config
  }
  
  async get(key: string, fetcher: () => Promise<any>): Promise<any> {
    const cached = this.cache.get(key)
    const now = Date.now()
    
    // Return fresh cache
    if (cached && (now - cached.timestamp) < this.config.maxAge) {
      return cached.data
    }
    
    // Stale while revalidate
    if (cached && this.config.staleWhileRevalidate) {
      // Return stale data immediately
      const staleData = cached.data
      
      // Fetch fresh data in background
      fetcher().then(freshData => {
        this.set(key, freshData)
      })
      
      return staleData
    }
    
    // Fetch fresh data
    const data = await fetcher()
    this.set(key, data)
    
    return data
  }
  
  set(key: string, data: any): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.config.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }
}
```

### Request Prioritization

Prioritize important requests:

```tsx
interface RequestPriority {
  high: QueryConfig[]
  normal: QueryConfig[]
  low: QueryConfig[]
}

async function executeWithPriority(priorities: RequestPriority) {
  // Execute high priority requests first
  const highResults = await Promise.all(
    priorities.high.map(query => executeQuery(query))
  )
  
  // Execute normal priority requests
  const normalResults = await Promise.all(
    priorities.normal.map(query => executeQuery(query))
  )
  
  // Execute low priority requests with delay
  const lowResults = await Promise.allSettled(
    priorities.low.map((query, index) => 
      new Promise(resolve => 
        setTimeout(() => resolve(executeQuery(query)), index * 100)
      )
    )
  )
  
  return {
    high: highResults,
    normal: normalResults,
    low: lowResults
  }
}
```

## Monitoring & Profiling

Track performance and identify bottlenecks.

### Performance Monitoring

Track key metrics:

```tsx
interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage: number
  networkRequests: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkRequests: 0
  }
  
  startTiming(label: string): () => void {
    const start = performance.now()
    
    return () => {
      const duration = performance.now() - start
      console.log(`${label}: ${duration.toFixed(2)}ms`)
      
      // Send to analytics
      this.sendMetric(label, duration)
    }
  }
  
  measureRender<T>(component: string, fn: () => T): T {
    const endTiming = this.startTiming(`Render ${component}`)
    
    try {
      return fn()
    } finally {
      endTiming()
    }
  }
  
  private sendMetric(label: string, value: number): void {
    // Send to your analytics service
    if (window.gtag) {
      window.gtag('event', 'timing_complete', {
        name: label,
        value: Math.round(value)
      })
    }
  }
}
```

### React Profiler

Use React Profiler to identify slow components:

```tsx
import { Profiler, ProfilerOnRenderCallback } from 'react'

const onRenderCallback: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime,
  interactions
) => {
  console.log('Profiler:', {
    id,
    phase,
    actualDuration,
    baseDuration
  })
  
  // Log slow renders
  if (actualDuration > 16) { // Slower than 60fps
    console.warn(`Slow render detected in ${id}: ${actualDuration}ms`)
  }
}

function ProfiledDashboard() {
  return (
    <Profiler id="Dashboard" onRender={onRenderCallback}>
      <Dashboard state={{ spec }} />
    </Profiler>
  )
}
```

### Performance Hooks

Create custom hooks for performance monitoring:

```tsx
import { useEffect, useRef, useState } from 'react'

function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    renderCount: 0,
    averageRenderTime: 0
  })
  
  const renderTimes = useRef<number[]>([])
  
  useEffect(() => {
    const startTime = performance.now()
    
    return () => {
      const renderTime = performance.now() - startTime
      renderTimes.current.push(renderTime)
      
      setMetrics(prev => ({
        renderCount: prev.renderCount + 1,
        averageRenderTime: 
          renderTimes.current.reduce((a, b) => a + b) / renderTimes.current.length
      }))
    }
  })
  
  return metrics
}

// Usage
function MonitoredCard() {
  const metrics = usePerformanceMonitor()
  
  return (
    <div>
      <Card />
      {process.env.NODE_ENV === 'development' && (
        <div>Renders: {metrics.renderCount}, Avg: {metrics.averageRenderTime.toFixed(2)}ms</div>
      )}
    </div>
  )
}
```

## Best Practices

### General Guidelines

1. **Measure First**: Always profile before optimizing
2. **Start Simple**: Implement basic optimizations first
3. **Monitor Continuously**: Set up performance monitoring in production
4. **Test on Slow Devices**: Ensure performance on low-end devices

### Code Organization

```tsx
// Group related components
const ChartComponents = lazy(() => import('./charts'))
const TableComponents = lazy(() => import('./tables'))
const NumberComponents = lazy(() => import('./numbers'))

// Use barrel exports efficiently
// ❌ Exports everything
export * from './components'

// ✅ Export only what's needed
export { Dashboard } from './components/Dashboard'
export { DashboardProvider } from './contexts/DashboardProvider'
```

### Data Management

```tsx
// Normalize data structures
interface NormalizedData {
  entities: Record<string, Entity>
  ids: string[]
}

// Use immutable updates
import { produce } from 'immer'

const updateData = produce((draft, action) => {
  switch (action.type) {
    case 'UPDATE_CARD':
      draft.cards[action.cardId] = action.data
      break
  }
})
```

### Rendering Optimization

```tsx
// Memoize expensive calculations
const ProcessedData = memo(({ data }: { data: RawData }) => {
  const processed = useMemo(() => 
    expensiveProcessing(data), 
    [data]
  )
  
  return <Chart data={processed} />
})

// Use React.memo for pure components
const CardHeader = memo(({ title, icon }: CardHeaderProps) => (
  <div className="card-header">
    <Icon name={icon} />
    <h3>{title}</h3>
  </div>
))

// Optimize list rendering
const CardList = ({ cards }: { cards: CardSpec[] }) => (
  <div>
    {cards.map(card => (
      <Card 
        key={card.id} 
        spec={card} 
        // Provide stable callback
        onClick={useCallback(() => handleClick(card.id), [card.id])}
      />
    ))}
  </div>
)
```

### Bundle Analysis

Regular bundle analysis helps identify optimization opportunities:

```bash
# Webpack Bundle Analyzer
npm install --save-dev webpack-bundle-analyzer
npx webpack-bundle-analyzer build/static/js/*.js

# Vite Bundle Analyzer
npm install --save-dev rollup-plugin-visualizer
# Add to vite.config.ts plugins: [visualizer()]
```

This comprehensive performance guide helps ensure your Cereon dashboards run smoothly and efficiently in production environments.