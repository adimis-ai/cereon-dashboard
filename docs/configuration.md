# Configuration Guide

Complete guide to configuring dashboards, reports, and cards in @cereon/dashboard.

## Table of Contents

- [Dashboard Configuration](#dashboard-configuration)
- [Report Configuration](#report-configuration)
- [Card Configuration](#card-configuration)  
- [Layout Configuration](#layout-configuration)
- [Query Configuration](#query-configuration)
- [Settings Configuration](#settings-configuration)
- [Advanced Configuration](#advanced-configuration)

## Dashboard Configuration

### Basic Dashboard Spec

```tsx
import { DashboardSpec } from '@cereon/dashboard'

const dashboardSpec: DashboardSpec = {
  // Required fields
  id: 'my_dashboard',
  title: 'My Dashboard',
  reports: [
    // Array of report configurations
  ],

  // Optional fields
  description: 'Dashboard description',
  version: '1.0.0',
  tags: ['analytics', 'metrics'],
  metadata: {
    author: 'Your Name',
    created: new Date().toISOString(),
    department: 'Engineering'
  },

  // Layout options
  layout: {
    breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
    cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
    rowHeight: 60,
    margin: [10, 10],
    containerPadding: [10, 10],
    autoSize: true,
    verticalCompact: true,
    preventCollision: false,
    isDraggable: true,
    isResizable: true
  },

  // Theme configuration
  theme: {
    mode: 'light', // 'light' | 'dark' | 'auto'
    primaryColor: '#3b82f6',
    fontFamily: 'Inter, sans-serif'
  },

  // Refresh settings
  refresh: {
    enabled: true,
    interval: 30000, // 30 seconds
    showLastUpdated: true
  }
}
```

### TypeScript Configuration

For full type safety, define your configuration types:

```tsx
// types/dashboard.ts
import { 
  DashboardSpec, 
  CardSettingsMap, 
  CardRecordMap 
} from '@cereon/dashboard'

// Define your card settings
interface MyCardSettings extends CardSettingsMap {
  chart: {
    enableDownload?: boolean
    showLegend?: boolean
    gridPosition?: CardGridPosition
  }
  table: {
    enableDownload?: boolean
    pagination?: boolean
    pageSize?: number
    sortable?: boolean
    gridPosition?: CardGridPosition
  }
  number: {
    unit?: string
    showTrend?: boolean
    precision?: number
    gridPosition?: CardGridPosition
  }
  markdown: {
    enableHtml?: boolean
    gridPosition?: CardGridPosition
  }
}

// Define your record types
interface MyCardRecords extends CardRecordMap {
  chart: ChartCardRecord
  table: TableCardRecord  
  number: NumberCardRecord
  markdown: MarkdownCardRecord
}

// Typed dashboard spec
export type MyDashboardSpec = DashboardSpec<MyCardSettings, MyCardRecords>
```

## Report Configuration

### Report Structure

```tsx
import { ReportSpec } from '@cereon/dashboard'

const reportSpec: ReportSpec = {
  // Required fields
  id: 'overview_report',
  title: 'Overview',
  reportCards: [
    // Array of card configurations
  ],

  // Optional fields
  description: 'Key metrics and KPIs',
  icon: 'chart-bar', // Icon identifier
  order: 1, // Display order
  
  // Visibility and permissions
  visible: true,
  permissions: {
    view: ['admin', 'analyst'],
    edit: ['admin']
  },

  // Layout overrides
  layout: {
    cols: { lg: 12, md: 10, sm: 6 },
    rowHeight: 80,
    margin: [15, 15]
  },

  // Refresh configuration
  refresh: {
    enabled: true,
    interval: 60000, // 1 minute
    pauseOnInactive: true
  },

  // Filters and parameters
  filters: [
    {
      id: 'date_range',
      type: 'daterange',
      label: 'Date Range',
      default: { start: '2024-01-01', end: '2024-12-31' }
    },
    {
      id: 'department',
      type: 'select',
      label: 'Department',
      options: ['Engineering', 'Sales', 'Marketing'],
      multiple: true
    }
  ],

  // Export options
  export: {
    enabled: true,
    formats: ['pdf', 'png', 'csv'],
    includeData: true
  }
}
```

### Conditional Reports

Show/hide reports based on conditions:

```tsx
const conditionalReports = [
  {
    id: 'admin_report',
    title: 'Admin Dashboard',
    visible: userRole === 'admin',
    reportCards: [...]
  },
  {
    id: 'mobile_report', 
    title: 'Mobile View',
    visible: window.innerWidth < 768,
    reportCards: [...]
  }
]
```

## Card Configuration

### Universal Card Properties

All cards share these properties:

```tsx
interface BaseCardConfig {
  // Identity
  id: string                    // Unique identifier
  kind: CardKind               // 'chart' | 'table' | 'number' | 'markdown' | 'html' | 'iframe'
  
  // Display
  title?: string               // Card title
  description?: string         // Card description
  icon?: string               // Icon identifier
  
  // Data source
  query: QueryConfig           // How to fetch data
  
  // Layout and behavior  
  settings?: CardSettings      // Card-specific settings
  
  // Visibility and permissions
  visible?: boolean           // Show/hide card
  permissions?: {             // Access control
    view?: string[]
    edit?: string[]
  }
  
  // Styling
  className?: string          // Custom CSS class
  style?: React.CSSProperties // Inline styles
}
```

### Chart Card Configuration

```tsx
{
  id: 'revenue_chart',
  kind: 'chart',
  title: 'Revenue Trends',
  query: {
    variant: 'http',
    payload: {
      url: '/api/revenue-data',
      method: 'GET',
      headers: { 'Authorization': 'Bearer token' }
    }
  },
  settings: {
    // Grid layout
    gridPosition: { x: 0, y: 0, w: 8, h: 6 },
    
    // Chart-specific settings
    chartType: 'line', // 'line' | 'bar' | 'pie' | 'doughnut' | 'area'
    enableDownload: true,
    showLegend: true,
    
    // Chart.js options
    chartOptions: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: { 
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        x: { display: true },
        y: { 
          beginAtZero: true,
          ticks: {
            callback: (value) => '$' + value.toLocaleString()
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  }
}
```

### Table Card Configuration

```tsx
{
  id: 'sales_table',
  kind: 'table',
  title: 'Sales Data',
  query: {
    variant: 'websocket',
    payload: {
      url: 'ws://localhost:8000/sales',
      subscribe_message: { type: 'subscribe', table: 'sales' }
    }
  },
  settings: {
    gridPosition: { x: 8, y: 0, w: 4, h: 8 },
    
    // Table-specific settings
    pagination: true,
    pageSize: 25,
    sortable: true,
    filterable: true,
    enableDownload: true,
    
    // Column configuration
    columns: [
      {
        key: 'id',
        title: 'ID', 
        type: 'number',
        sortable: true,
        filterable: false,
        width: 80
      },
      {
        key: 'customer',
        title: 'Customer',
        type: 'string',
        sortable: true,
        filterable: true
      },
      {
        key: 'amount',
        title: 'Amount',
        type: 'currency',
        sortable: true,
        formatter: (value) => `$${value.toLocaleString()}`
      },
      {
        key: 'status',
        title: 'Status',
        type: 'badge',
        renderer: (value) => (
          <Badge variant={value === 'paid' ? 'success' : 'warning'}>
            {value}
          </Badge>
        )
      }
    ],
    
    // Selection
    selectable: true,
    onSelectionChange: (selected) => console.log(selected)
  }
}
```

### Number Card Configuration

```tsx
{
  id: 'total_sales',
  kind: 'number',
  title: 'Total Sales',
  query: {
    variant: 'streaming-http',
    payload: {
      url: '/api/sales/total',
      method: 'GET'
    }
  },
  settings: {
    gridPosition: { x: 0, y: 0, w: 3, h: 3 },
    
    // Number-specific settings
    unit: '$',
    precision: 0,
    showTrend: true,
    trendPeriod: 'vs last month',
    
    // Formatting
    numberFormat: {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    },
    
    // Thresholds for color coding
    thresholds: {
      good: 100000,    // Green above this
      warning: 75000,  // Yellow above this
      // Red below warning
    },
    
    // Animation
    animateOnChange: true,
    countUpDuration: 2000
  }
}
```

### Markdown Card Configuration

```tsx
{
  id: 'documentation',
  kind: 'markdown',
  title: 'Getting Started',
  query: {
    variant: 'custom',
    payload: {
      handler: () => [{
        kind: 'markdown',
        cardId: 'documentation',
        reportId: 'overview',
        data: {
          content: `
# Welcome to the Dashboard

This dashboard provides real-time insights into:
- 📊 **Sales Performance** 
- 👥 **Customer Analytics**
- 💰 **Revenue Tracking**

## Quick Actions
- [View Reports](/reports)
- [Export Data](/export)
          `
        }
      }]
    }
  },
  settings: {
    gridPosition: { x: 0, y: 4, w: 6, h: 4 },
    
    // Markdown-specific settings
    enableHtml: true,
    enableMath: false,
    linkTarget: '_blank',
    
    // Syntax highlighting
    codeTheme: 'github',
    
    // Custom renderers
    renderers: {
      link: ({ href, children }) => (
        <a href={href} target="_blank" rel="noopener">
          {children}
        </a>
      )
    }
  }
}
```

### HTML Card Configuration

```tsx
{
  id: 'custom_widget',
  kind: 'html',
  title: 'Custom Widget',
  query: {
    variant: 'http',
    payload: {
      url: '/api/widget/html',
      method: 'GET'
    }
  },
  settings: {
    gridPosition: { x: 6, y: 4, w: 6, h: 4 },
    
    // HTML-specific settings
    sanitize: true,           // Sanitize HTML for security
    allowedTags: ['div', 'span', 'p', 'img'],
    allowedAttributes: ['class', 'id', 'src'],
    
    // Iframe security
    sandbox: [
      'allow-scripts',
      'allow-same-origin'
    ]
  }
}
```

### Iframe Card Configuration

```tsx
{
  id: 'embedded_app',
  kind: 'iframe',
  title: 'External Dashboard',
  query: {
    variant: 'custom',
    payload: {
      handler: () => [{
        kind: 'iframe',
        cardId: 'embedded_app', 
        reportId: 'external',
        data: {
          src: 'https://external-dashboard.example.com/embed',
          title: 'External Dashboard',
          allowFullscreen: true
        }
      }]
    }
  },
  settings: {
    gridPosition: { x: 0, y: 0, w: 12, h: 8 },
    
    // Iframe-specific settings
    sandbox: [
      'allow-scripts',
      'allow-same-origin',
      'allow-forms'
    ],
    loading: 'lazy',
    referrerPolicy: 'no-referrer'
  }
}
```

## Layout Configuration

### Grid System

Cereon uses React Grid Layout with a 12-column system:

```tsx
interface GridPosition {
  x: number    // Column position (0-11)
  y: number    // Row position (0+)  
  w: number    // Width in columns (1-12)
  h: number    // Height in grid units
  minW?: number // Minimum width
  maxW?: number // Maximum width
  minH?: number // Minimum height
  maxH?: number // Maximum height
  static?: boolean // Disable drag/resize
}
```

### Responsive Layout

Configure different layouts for different screen sizes:

```tsx
const responsiveLayouts = {
  lg: [
    { i: 'card1', x: 0, y: 0, w: 6, h: 4 },
    { i: 'card2', x: 6, y: 0, w: 6, h: 4 }
  ],
  md: [
    { i: 'card1', x: 0, y: 0, w: 5, h: 4 },
    { i: 'card2', x: 5, y: 0, w: 5, h: 4 }
  ],
  sm: [
    { i: 'card1', x: 0, y: 0, w: 6, h: 4 },
    { i: 'card2', x: 0, y: 4, w: 6, h: 4 }
  ],
  xs: [
    { i: 'card1', x: 0, y: 0, w: 4, h: 4 },
    { i: 'card2', x: 0, y: 4, w: 4, h: 4 }
  ]
}
```

### Layout Constraints

```tsx
// Dashboard-level constraints
const dashboardSpec = {
  id: 'constrained_dashboard',
  layout: {
    // Prevent dragging
    isDraggable: false,
    
    // Prevent resizing
    isResizable: false,
    
    // Prevent collisions
    preventCollision: true,
    
    // Compact layout
    verticalCompact: true,
    compactType: 'vertical',
    
    // Custom boundaries
    maxRows: 20,
    
    // Margins and padding
    margin: [10, 10],
    containerPadding: [20, 20],
    
    // Row height
    rowHeight: 60
  }
}
```

## Query Configuration

### HTTP Queries

```tsx
{
  variant: 'http',
  payload: {
    url: '/api/data',
    method: 'GET', // 'GET' | 'POST' | 'PUT' | 'DELETE'
    
    // Headers
    headers: {
      'Authorization': 'Bearer token',
      'Content-Type': 'application/json'
    },
    
    // Query parameters
    params: {
      limit: 100,
      offset: 0,
      filter: 'active'
    },
    
    // Request body (for POST/PUT)
    body: JSON.stringify({ key: 'value' }),
    
    // Timeout
    timeout: 10000,
    
    // Retry configuration
    retry: {
      attempts: 3,
      delay: 1000,
      exponential: true
    },
    
    // Polling
    poll: {
      enabled: true,
      interval: 5000
    }
  }
}
```

### WebSocket Queries

```tsx
{
  variant: 'websocket',
  payload: {
    url: 'ws://localhost:8000/realtime',
    
    // Connection options
    protocols: ['dashboard-v1'],
    
    // Authentication
    headers: {
      'Authorization': 'Bearer token'
    },
    
    // Messages
    subscribe_message: {
      type: 'subscribe',
      channel: 'metrics'
    },
    
    unsubscribe_message: {
      type: 'unsubscribe',
      channel: 'metrics'
    },
    
    // Reconnection
    reconnect: {
      enabled: true,
      maxAttempts: 5,
      delay: 1000
    },
    
    // Heartbeat
    heartbeat: {
      enabled: true,
      interval: 30000,
      message: { type: 'ping' }
    }
  }
}
```

### Streaming HTTP Queries

```tsx
{
  variant: 'streaming-http',
  payload: {
    url: '/api/stream',
    method: 'GET',
    
    // Stream parsing
    parser: 'json-lines', // 'json-lines' | 'server-sent-events'
    
    // Headers for SSE
    headers: {
      'Accept': 'text/event-stream',
      'Cache-Control': 'no-cache'
    },
    
    // Reconnection
    reconnect: {
      enabled: true,
      maxAttempts: 10,
      delay: 2000
    }
  }
}
```

### Custom Queries

```tsx
{
  variant: 'custom',
  payload: {
    handler: async (context) => {
      // Access card and report context
      const { cardId, reportId, filters, params } = context
      
      try {
        // Custom data fetching logic
        const response = await fetch(`/api/custom/${cardId}`, {
          method: 'POST',
          body: JSON.stringify({ filters, params })
        })
        
        const data = await response.json()
        
        // Return card records
        return [{
          kind: 'chart',
          cardId,
          reportId,
          data: {
            chartType: 'bar',
            chartData: data
          }
        }]
      } catch (error) {
        // Return error state
        return [{
          kind: 'markdown',
          cardId,
          reportId,
          data: {
            content: `❌ Error loading data: ${error.message}`
          }
        }]
      }
    },
    
    // Dependencies for re-execution
    dependencies: ['filters', 'params']
  }
}
```

## Settings Configuration

### Global Settings

Configure provider-level settings:

```tsx
<DashboardProvider
  settings={{
    // Theme
    theme: 'dark',
    
    // Animation preferences  
    animations: {
      enabled: true,
      duration: 200,
      easing: 'ease-in-out'
    },
    
    // Grid settings
    grid: {
      defaultCols: 12,
      defaultRowHeight: 60,
      defaultMargin: [10, 10]
    },
    
    // Performance
    performance: {
      virtualizeGrids: true,
      debounceResize: 200,
      lazyLoadCards: true
    },
    
    // Accessibility
    accessibility: {
      announceChanges: true,
      keyboardNavigation: true
    },
    
    // Development
    development: {
      enableDevTools: process.env.NODE_ENV === 'development',
      logQueries: false
    }
  }}
>
  {/* Dashboard components */}
</DashboardProvider>
```

### Runtime Configuration

Update settings at runtime:

```tsx
import { useDashboard } from '@cereon/dashboard'

function DashboardControls() {
  const { settings, updateSettings } = useDashboard()
  
  const toggleTheme = () => {
    updateSettings({
      theme: settings.theme === 'light' ? 'dark' : 'light'
    })
  }
  
  const toggleAnimations = () => {
    updateSettings({
      animations: {
        ...settings.animations,
        enabled: !settings.animations.enabled
      }
    })
  }
  
  return (
    <div>
      <button onClick={toggleTheme}>
        Switch to {settings.theme === 'light' ? 'Dark' : 'Light'} Theme
      </button>
      <button onClick={toggleAnimations}>
        {settings.animations.enabled ? 'Disable' : 'Enable'} Animations
      </button>
    </div>
  )
}
```

## Advanced Configuration

### Custom Card Types

Register custom card types:

```tsx
// Define custom card type
interface CustomCardRecord extends BaseCardRecord {
  kind: 'custom'
  data: {
    customProperty: string
  }
}

// Register with provider
<DashboardProvider
  customCardTypes={{
    custom: {
      component: CustomCardComponent,
      defaultSettings: {
        showBorder: true
      }
    }
  }}
>
```

### Middleware and Interceptors

Add request/response middleware:

```tsx
<DashboardProvider
  middleware={{
    request: async (config) => {
      // Modify request config
      config.headers = {
        ...config.headers,
        'X-Timestamp': Date.now().toString()
      }
      return config
    },
    
    response: async (response, config) => {
      // Log responses
      console.log('Response:', response)
      
      // Transform data
      if (response.data?.items) {
        response.data.items = response.data.items.map(transformItem)
      }
      
      return response
    },
    
    error: async (error, config) => {
      // Handle errors
      if (error.status === 401) {
        // Redirect to login
        window.location.href = '/login'
      }
      
      throw error
    }
  }}
>
```

### Plugin System

Create and register plugins:

```tsx
// Define plugin
const analyticsPlugin = {
  name: 'analytics',
  version: '1.0.0',
  
  onCardRender: (card) => {
    // Track card views
    analytics.track('card_viewed', {
      cardId: card.id,
      cardKind: card.kind
    })
  },
  
  onQueryExecute: (query) => {
    // Track query performance
    const startTime = Date.now()
    
    return {
      onComplete: (result) => {
        analytics.track('query_completed', {
          duration: Date.now() - startTime,
          success: true
        })
      },
      
      onError: (error) => {
        analytics.track('query_failed', {
          duration: Date.now() - startTime,
          error: error.message
        })
      }
    }
  }
}

// Register plugin
<DashboardProvider plugins={[analyticsPlugin]}>
```

### Configuration Validation

Use schemas for validation:

```tsx
import { z } from 'zod'

// Define validation schema
const DashboardConfigSchema = z.object({
  id: z.string(),
  title: z.string(),
  reports: z.array(z.object({
    id: z.string(),
    title: z.string(),
    reportCards: z.array(z.object({
      id: z.string(),
      kind: z.enum(['chart', 'table', 'number', 'markdown', 'html', 'iframe']),
      query: z.object({
        variant: z.enum(['http', 'websocket', 'streaming-http', 'custom']),
        payload: z.any()
      })
    }))
  }))
})

// Validate configuration
const validateDashboardConfig = (config: unknown) => {
  try {
    return DashboardConfigSchema.parse(config)
  } catch (error) {
    throw new Error(`Invalid dashboard configuration: ${error.message}`)
  }
}
```

### Dynamic Configuration Loading

Load configuration from external sources:

```tsx
import { useState, useEffect } from 'react'

function DynamicDashboard({ configUrl }: { configUrl: string }) {
  const [spec, setSpec] = useState<DashboardSpec | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function loadConfig() {
      try {
        const response = await fetch(configUrl)
        const config = await response.json()
        
        // Validate configuration
        const validatedSpec = validateDashboardConfig(config)
        setSpec(validatedSpec)
      } catch (error) {
        console.error('Failed to load dashboard config:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadConfig()
  }, [configUrl])
  
  if (loading) {
    return <div>Loading dashboard configuration...</div>
  }
  
  if (!spec) {
    return <div>Failed to load dashboard configuration</div>
  }
  
  return <Dashboard state={{ spec }} />
}
```

This comprehensive configuration guide covers all aspects of setting up and customizing Cereon dashboards. For specific implementation examples, see the [examples](examples/) directory.