# Quick Start

Get your first Cereon dashboard running in minutes with this step-by-step tutorial.

## Prerequisites

- Node.js 16+ installed
- React application (existing or new)
- Basic familiarity with React and TypeScript

## Step 1: Create a New React App (Optional)

If you don't have a React app yet:

```bash
# Using Vite (recommended)
npm create vite@latest my-dashboard-app -- --template react-ts
cd my-dashboard-app
npm install

# Or using Create React App
npx create-react-app my-dashboard-app --template typescript
cd my-dashboard-app
```

## Step 2: Install Cereon Dashboard

```bash
npm install @cereon/dashboard react-grid-layout framer-motion
```

## Step 3: Basic Setup

### Add CSS Import

```tsx
// src/main.tsx (Vite) or src/index.tsx (CRA)
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import '@cereon/dashboard/styles.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

### Wrap App with Provider

```tsx
// src/App.tsx
import React from 'react'
import { DashboardProvider } from '@cereon/dashboard'
import { MyFirstDashboard } from './MyFirstDashboard'

function App() {
  return (
    <DashboardProvider>
      <div className="App">
        <MyFirstDashboard />
      </div>
    </DashboardProvider>
  )
}

export default App
```

## Step 4: Create Your First Dashboard

Create a new file `src/MyFirstDashboard.tsx`:

```tsx
// src/MyFirstDashboard.tsx
import React from 'react'
import { Dashboard, DashboardSpec } from '@cereon/dashboard'

// Sample data for our cards
const sampleChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [{
    label: 'Revenue ($)',
    data: [12000, 15000, 13000, 18000, 21000, 25000],
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    fill: true
  }]
}

const sampleTableData = [
  { id: 1, product: 'Dashboard Pro', revenue: '$25,000', growth: '+15%' },
  { id: 2, product: 'Analytics Suite', revenue: '$18,000', growth: '+8%' },
  { id: 3, product: 'Reports Basic', revenue: '$12,000', growth: '+22%' }
]

// Define our dashboard specification
const dashboardSpec: DashboardSpec = {
  id: 'my_first_dashboard',
  title: 'My First Dashboard',
  description: 'A simple dashboard to get started with Cereon',
  reports: [
    {
      id: 'overview',
      title: 'Overview',
      description: 'Key metrics and insights',
      reportCards: [
        // Welcome card
        {
          id: 'welcome_card',
          kind: 'markdown',
          title: 'Welcome! 👋',
          query: {
            variant: 'custom',
            payload: {
              handler: () => [{
                kind: 'markdown',
                cardId: 'welcome_card',
                reportId: 'overview',
                data: {
                  content: `
# Welcome to Your First Dashboard!

This is a **Markdown card** that supports:
- ✅ Rich text formatting
- 📊 Embedded content
- 🎨 Custom styling

Get started by exploring the other cards below.
                  `
                }
              }]
            }
          },
          settings: {
            gridPosition: { x: 0, y: 0, w: 6, h: 4 }
          }
        },

        // KPI Numbers
        {
          id: 'total_revenue',
          kind: 'number',
          title: 'Total Revenue',
          query: {
            variant: 'custom',
            payload: {
              handler: () => [{
                kind: 'number',
                cardId: 'total_revenue',
                reportId: 'overview',
                data: {
                  value: 55000,
                  unit: '$',
                  change: 15.3,
                  changeLabel: 'vs last month'
                }
              }]
            }
          },
          settings: {
            gridPosition: { x: 6, y: 0, w: 3, h: 2 },
            unit: '$',
            showChange: true
          }
        },

        {
          id: 'active_users',
          kind: 'number', 
          title: 'Active Users',
          query: {
            variant: 'custom',
            payload: {
              handler: () => [{
                kind: 'number',
                cardId: 'active_users',
                reportId: 'overview',
                data: {
                  value: 2847,
                  change: 8.2,
                  changeLabel: 'vs last week'
                }
              }]
            }
          },
          settings: {
            gridPosition: { x: 9, y: 0, w: 3, h: 2 }
          }
        },

        {
          id: 'conversion_rate',
          kind: 'number',
          title: 'Conversion Rate',
          query: {
            variant: 'custom', 
            payload: {
              handler: () => [{
                kind: 'number',
                cardId: 'conversion_rate',
                reportId: 'overview',
                data: {
                  value: 3.24,
                  unit: '%',
                  change: -0.15,
                  changeLabel: 'vs last month'
                }
              }]
            }
          },
          settings: {
            gridPosition: { x: 6, y: 2, w: 3, h: 2 },
            unit: '%'
          }
        },

        {
          id: 'avg_order_value',
          kind: 'number',
          title: 'Avg Order Value', 
          query: {
            variant: 'custom',
            payload: {
              handler: () => [{
                kind: 'number',
                cardId: 'avg_order_value',
                reportId: 'overview',
                data: {
                  value: 127.50,
                  unit: '$',
                  change: 5.8,
                  changeLabel: 'vs last month'
                }
              }]
            }
          },
          settings: {
            gridPosition: { x: 9, y: 2, w: 3, h: 2 },
            unit: '$'
          }
        },

        // Revenue Chart
        {
          id: 'revenue_chart',
          kind: 'chart',
          title: 'Revenue Trend',
          query: {
            variant: 'custom',
            payload: {
              handler: () => [{
                kind: 'chart',
                cardId: 'revenue_chart',
                reportId: 'overview',
                data: {
                  chartType: 'line',
                  chartData: sampleChartData,
                  options: {
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top' as const
                      },
                      title: {
                        display: true,
                        text: 'Monthly Revenue Growth'
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value: any) {
                            return '$' + value.toLocaleString()
                          }
                        }
                      }
                    }
                  }
                }
              }]
            }
          },
          settings: {
            gridPosition: { x: 0, y: 4, w: 8, h: 6 },
            enableDownload: true
          }
        },

        // Products Table
        {
          id: 'products_table',
          kind: 'table',
          title: 'Top Products',
          query: {
            variant: 'custom',
            payload: {
              handler: () => [{
                kind: 'table',
                cardId: 'products_table',
                reportId: 'overview',
                data: {
                  columns: [
                    { key: 'product', title: 'Product', type: 'string' },
                    { key: 'revenue', title: 'Revenue', type: 'string' },
                    { key: 'growth', title: 'Growth', type: 'string' }
                  ],
                  rows: sampleTableData
                }
              }]
            }
          },
          settings: {
            gridPosition: { x: 8, y: 4, w: 4, h: 6 },
            enableDownload: true,
            pagination: true
          }
        }
      ]
    },

    // Second report for analytics
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Detailed analytics and insights',
      reportCards: [
        {
          id: 'analytics_info',
          kind: 'markdown',
          title: 'Analytics Overview',
          query: {
            variant: 'custom',
            payload: {
              handler: () => [{
                kind: 'markdown',
                cardId: 'analytics_info',
                reportId: 'analytics',
                data: {
                  content: `
# Analytics Dashboard 📈

This section contains detailed analytics and performance metrics.

## Key Features:
- **Real-time data** updates
- **Interactive charts** with drill-down capabilities  
- **Exportable reports** in multiple formats
- **Custom time ranges** for analysis

> 💡 **Tip**: Click on any chart element for detailed insights!
                  `
                }
              }]
            }
          },
          settings: {
            gridPosition: { x: 0, y: 0, w: 12, h: 4 }
          }
        }
      ]
    }
  ]
}

export function MyFirstDashboard() {
  return (
    <div style={{ height: '100vh', padding: '1rem' }}>
      <h1 style={{ marginBottom: '1rem', color: '#1f2937' }}>
        My First Cereon Dashboard
      </h1>
      <Dashboard
        state={{ spec: dashboardSpec }}
        style={{ height: 'calc(100vh - 4rem)' }}
      />
    </div>
  )
}
```

## Step 5: Run Your Dashboard

```bash
npm run dev  # For Vite
# or
npm start    # For Create React App
```

Visit `http://localhost:5173` (Vite) or `http://localhost:3000` (CRA) to see your dashboard!

## What You Built

Congratulations! You've created a dashboard with:

- **📝 Markdown Card**: Rich text with formatting
- **🔢 Number Cards**: KPI displays with change indicators  
- **📊 Chart Card**: Interactive line chart showing revenue trends
- **📋 Table Card**: Data table with sorting and pagination
- **🏷️ Multiple Reports**: Organized content in tabs

## Understanding the Code

### Dashboard Specification

The `DashboardSpec` defines the structure:

```tsx
{
  id: 'unique_dashboard_id',
  title: 'Dashboard Title',
  reports: [
    {
      id: 'report_id',
      title: 'Report Name',
      reportCards: [
        // Array of card definitions
      ]
    }
  ]
}
```

### Card Structure

Each card has:
- **`id`**: Unique identifier
- **`kind`**: Type of card (`'chart'`, `'table'`, `'number'`, `'markdown'`)
- **`title`**: Display title
- **`query`**: Data source configuration
- **`settings`**: Layout and display options

### Query Handlers

The `query.payload.handler` function returns card data:

```tsx
handler: () => [{
  kind: 'chart',
  cardId: 'my_chart',
  reportId: 'my_report',
  data: {
    // Chart-specific data
  }
}]
```

### Grid Layout

Cards use `gridPosition` for layout:
- **`x`**: Horizontal position (0-11)
- **`y`**: Vertical position  
- **`w`**: Width in grid units (1-12)
- **`h`**: Height in grid units

## Next Steps

### 1. Connect Real Data

Replace the static `handler` functions with API calls:

```tsx
// Example: Fetch data from API
{
  id: 'live_chart',
  kind: 'chart',
  query: {
    variant: 'http',
    payload: {
      url: '/api/revenue-data',
      method: 'GET'
    }
  }
}
```

### 2. Add Interactivity

Use real-time data with WebSocket:

```tsx
{
  id: 'realtime_data',
  kind: 'number',
  query: {
    variant: 'websocket',
    payload: {
      url: 'ws://localhost:8000/realtime',
      subscribe_message: { type: 'subscribe', channel: 'metrics' }
    }
  }
}
```

### 3. Customize Styling

Create a custom theme:

```css
/* Custom dashboard theme */
:root {
  --cereon-primary: #6366f1;
  --cereon-background: #f8fafc;
  --cereon-card-background: #ffffff;
}
```

### 4. Add More Card Types

Explore other card types:

```tsx
// HTML Card
{
  id: 'custom_html',
  kind: 'html',
  query: {
    variant: 'custom',
    payload: {
      handler: () => [{
        kind: 'html',
        data: {
          content: '<div>Custom HTML content</div>'
        }
      }]
    }
  }
}

// Iframe Card
{
  id: 'embedded_app',
  kind: 'iframe',
  query: {
    variant: 'custom', 
    payload: {
      handler: () => [{
        kind: 'iframe',
        data: {
          src: 'https://example.com/embed'
        }
      }]
    }
  }
}
```

## Common Patterns

### Loading States

Add loading indicators:

```tsx
const [loading, setLoading] = useState(true)

// In your handler
handler: async () => {
  setLoading(true)
  try {
    const data = await fetchData()
    return [{ kind: 'chart', data }]
  } finally {
    setLoading(false)
  }
}
```

### Error Handling

Handle errors gracefully:

```tsx
handler: async () => {
  try {
    const data = await fetchData()
    return [{ kind: 'chart', data }]
  } catch (error) {
    return [{
      kind: 'markdown',
      data: {
        content: '⚠️ Failed to load data. Please try again.'
      }
    }]
  }
}
```

### Dynamic Configuration

Make cards configurable:

```tsx
const createNumberCard = (id: string, title: string, value: number) => ({
  id,
  kind: 'number' as const,
  title,
  query: {
    variant: 'custom' as const,
    payload: {
      handler: () => [{
        kind: 'number' as const,
        cardId: id,
        reportId: 'overview',
        data: { value }
      }]
    }
  }
})

// Use in dashboard spec
reportCards: [
  createNumberCard('revenue', 'Revenue', 55000),
  createNumberCard('users', 'Users', 2847),
  // ...
]
```

## Troubleshooting

**Dashboard not rendering?**
- Check that `DashboardProvider` wraps your app
- Verify CSS import is present
- Look for console errors

**Cards not displaying correctly?**
- Ensure `cardId` matches the card's `id`
- Verify `reportId` matches the report's `id`
- Check grid position values

**TypeScript errors?**
- Install `@types/react` and `@types/react-dom`
- Add `"skipLibCheck": true` to `tsconfig.json`

## Learn More

- [Configuration Guide](configuration.md) - Advanced dashboard configuration
- [Card Types](card-types.md) - Complete guide to all card types  
- [Theming](theming.md) - Customize colors and styling
- [Performance](performance.md) - Optimization techniques
- [API Reference](api-reference.md) - Complete component documentation

Ready to build amazing dashboards! 🚀