# Card Types

Complete reference for all card types supported by @cereon/dashboard, including configuration options, data formats, and examples.

## Overview

Cereon Dashboard supports six main card types:

- **📊 [Chart Cards](#chart-cards)** - Interactive data visualizations
- **📋 [Table Cards](#table-cards)** - Tabular data with sorting and filtering  
- **🔢 [Number Cards](#number-cards)** - KPI displays with trends
- **📝 [Markdown Cards](#markdown-cards)** - Rich text content
- **🌐 [HTML Cards](#html-cards)** - Custom HTML content
- **🖼️ [Iframe Cards](#iframe-cards)** - Embedded external content

## Chart Cards

Chart cards display interactive data visualizations using Chart.js.

### Supported Chart Types

- `line` - Line charts for trends over time
- `bar` - Bar charts for categorical data  
- `pie` - Pie charts for proportional data
- `doughnut` - Doughnut charts (pie with center hole)
- `area` - Area charts (filled line charts)
- `scatter` - Scatter plots for correlation analysis
- `radar` - Radar charts for multi-dimensional data
- `polarArea` - Polar area charts
- `bubble` - Bubble charts for three-dimensional data

### Basic Configuration

```tsx
{
  id: 'sales_chart',
  kind: 'chart',
  title: 'Sales Trends',
  query: {
    variant: 'http',
    payload: {
      url: '/api/sales-data',
      method: 'GET'
    }
  },
  settings: {
    gridPosition: { x: 0, y: 0, w: 8, h: 6 },
    chartType: 'line',
    enableDownload: true,
    showLegend: true
  }
}
```

### Data Format

Chart cards expect data in Chart.js format:

```tsx
// Line/Bar/Area Charts
{
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
  datasets: [{
    label: 'Revenue',
    data: [12000, 15000, 18000, 22000, 25000],
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    fill: true
  }, {
    label: 'Profit',
    data: [3000, 4500, 5400, 6600, 7500],
    borderColor: '#10b981', 
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    fill: true
  }]
}

// Pie/Doughnut Charts
{
  labels: ['Desktop', 'Mobile', 'Tablet'],
  datasets: [{
    data: [45, 35, 20],
    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
    borderWidth: 2
  }]
}

// Scatter/Bubble Charts
{
  datasets: [{
    label: 'Dataset 1',
    data: [
      { x: 10, y: 20 },
      { x: 15, y: 25 },
      { x: 20, y: 30 }
    ],
    backgroundColor: '#3b82f6'
  }]
}

// Bubble Charts (additional r property)
{
  datasets: [{
    label: 'Bubble Data',
    data: [
      { x: 10, y: 20, r: 15 },
      { x: 15, y: 25, r: 10 },
      { x: 20, y: 30, r: 20 }
    ]
  }]
}
```

### Chart Options

Configure Chart.js options for customization:

```tsx
{
  settings: {
    chartOptions: {
      responsive: true,
      maintainAspectRatio: false,
      
      // Plugins
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: '#3b82f6',
          borderWidth: 1
        },
        title: {
          display: true,
          text: 'Custom Chart Title',
          font: { size: 16 }
        }
      },
      
      // Scales
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Time Period'
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Revenue ($)'
          },
          ticks: {
            callback: function(value) {
              return '$' + value.toLocaleString()
            }
          }
        }
      },
      
      // Interactions
      interaction: {
        intersect: false,
        mode: 'index'
      },
      
      // Animations
      animation: {
        duration: 1000,
        easing: 'easeInOutQuart'
      }
    }
  }
}
```

### Advanced Chart Examples

#### Multi-axis Chart

```tsx
{
  settings: {
    chartOptions: {
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: { display: true, text: 'Revenue ($)' }
        },
        y1: {
          type: 'linear', 
          display: true,
          position: 'right',
          title: { display: true, text: 'Units Sold' },
          grid: { drawOnChartArea: false }
        }
      }
    }
  }
}

// Data format for multi-axis
{
  datasets: [{
    label: 'Revenue',
    data: [12000, 15000, 18000],
    yAxisID: 'y',
    borderColor: '#3b82f6'
  }, {
    label: 'Units',
    data: [120, 150, 180],
    yAxisID: 'y1',
    borderColor: '#10b981'
  }]
}
```

#### Time Series Chart

```tsx
{
  settings: {
    chartOptions: {
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
            displayFormats: {
              day: 'MMM DD'
            }
          }
        }
      }
    }
  }
}

// Time series data format
{
  datasets: [{
    label: 'Daily Sales',
    data: [
      { x: '2024-01-01', y: 1200 },
      { x: '2024-01-02', y: 1350 },
      { x: '2024-01-03', y: 1100 }
    ]
  }]
}
```

## Table Cards

Table cards display tabular data with sorting, filtering, and pagination.

### Basic Configuration

```tsx
{
  id: 'customers_table',
  kind: 'table',
  title: 'Customer List',
  query: {
    variant: 'http',
    payload: {
      url: '/api/customers',
      method: 'GET'
    }
  },
  settings: {
    gridPosition: { x: 0, y: 0, w: 12, h: 8 },
    pagination: true,
    pageSize: 25,
    sortable: true,
    filterable: true,
    enableDownload: true
  }
}
```

### Data Format

Table cards expect data with columns and rows:

```tsx
{
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
      key: 'name',
      title: 'Customer Name', 
      type: 'string',
      sortable: true,
      filterable: true
    },
    {
      key: 'email',
      title: 'Email',
      type: 'email',
      sortable: true,
      filterable: true
    },
    {
      key: 'revenue',
      title: 'Total Revenue',
      type: 'currency',
      sortable: true,
      formatter: (value) => `$${value.toLocaleString()}`
    },
    {
      key: 'status',
      title: 'Status',
      type: 'badge',
      sortable: true,
      renderer: (value) => (
        <Badge variant={value === 'active' ? 'success' : 'warning'}>
          {value}
        </Badge>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      type: 'actions',
      sortable: false,
      renderer: (value, row) => (
        <div>
          <Button size="sm" onClick={() => editCustomer(row.id)}>
            Edit
          </Button>
          <Button size="sm" variant="destructive" onClick={() => deleteCustomer(row.id)}>
            Delete
          </Button>
        </div>
      )
    }
  ],
  rows: [
    {
      id: 1,
      name: 'Acme Corporation',
      email: 'contact@acme.com',
      revenue: 125000,
      status: 'active'
    },
    {
      id: 2, 
      name: 'Globex Industries',
      email: 'info@globex.com',
      revenue: 87500,
      status: 'inactive'
    }
  ],
  
  // Optional metadata
  totalCount: 2,
  currentPage: 1,
  pageSize: 25
}
```

### Column Types

Support for various column types:

```tsx
// String column
{
  key: 'name',
  title: 'Name',
  type: 'string',
  ellipsis: true, // Truncate long text
  maxLength: 50
}

// Number column
{
  key: 'age',
  title: 'Age', 
  type: 'number',
  precision: 0,
  thousandsSeparator: ','
}

// Currency column
{
  key: 'salary',
  title: 'Salary',
  type: 'currency',
  currency: 'USD',
  locale: 'en-US'
}

// Date column
{
  key: 'createdAt',
  title: 'Created',
  type: 'date',
  format: 'YYYY-MM-DD',
  relative: true // Show "2 days ago"
}

// Boolean column
{
  key: 'active',
  title: 'Active',
  type: 'boolean',
  trueLabel: 'Yes',
  falseLabel: 'No'
}

// Badge/Tag column  
{
  key: 'status',
  title: 'Status',
  type: 'badge',
  colorMap: {
    active: 'green',
    inactive: 'red',
    pending: 'yellow'
  }
}

// Progress column
{
  key: 'completion',
  title: 'Progress',
  type: 'progress',
  showPercentage: true,
  colorScheme: 'blue'
}

// Avatar column
{
  key: 'avatar',
  title: 'Avatar',
  type: 'avatar',
  fallbackKey: 'name' // Use name for initials
}

// Link column
{
  key: 'website',
  title: 'Website', 
  type: 'link',
  target: '_blank',
  formatter: (value) => value.replace('https://', '')
}

// Custom renderer
{
  key: 'custom',
  title: 'Custom',
  type: 'custom',
  renderer: (value, row, column) => (
    <CustomComponent data={value} row={row} />
  )
}
```

### Advanced Table Features

#### Row Selection

```tsx
{
  settings: {
    selectable: true,
    multiSelect: true,
    selectKey: 'id',
    onSelectionChange: (selectedRows, selectedKeys) => {
      console.log('Selected:', selectedRows)
    }
  }
}
```

#### Row Actions

```tsx
{
  settings: {
    rowActions: [
      {
        label: 'Edit',
        icon: 'edit',
        onClick: (row) => editRow(row)
      },
      {
        label: 'Delete',
        icon: 'trash',
        variant: 'destructive',
        onClick: (row) => deleteRow(row),
        confirm: {
          title: 'Delete Row',
          message: 'Are you sure you want to delete this item?'
        }
      }
    ]
  }
}
```

#### Inline Editing

```tsx
{
  settings: {
    editable: true,
    editableColumns: ['name', 'email', 'status'],
    onCellEdit: (rowId, columnKey, newValue) => {
      // Save changes
      updateRow(rowId, { [columnKey]: newValue })
    }
  }
}
```

## Number Cards

Number cards display single numeric values with optional trend indicators.

### Basic Configuration

```tsx
{
  id: 'total_users',
  kind: 'number',
  title: 'Total Users',
  query: {
    variant: 'http',
    payload: {
      url: '/api/metrics/users',
      method: 'GET'
    }
  },
  settings: {
    gridPosition: { x: 0, y: 0, w: 3, h: 3 },
    unit: '',
    showTrend: true,
    precision: 0
  }
}
```

### Data Format

```tsx
{
  value: 12847,           // Primary value
  previousValue: 11293,   // Previous period value (optional)
  change: 1554,          // Absolute change (optional)
  changePercent: 13.8,   // Percentage change (optional)
  changeLabel: 'vs last month', // Change description (optional)
  
  // Trend data (optional)
  trend: [
    { period: '2024-01', value: 9500 },
    { period: '2024-02', value: 10200 },
    { period: '2024-03', value: 11293 },
    { period: '2024-04', value: 12847 }
  ],
  
  // Status indicators (optional)
  status: 'positive', // 'positive' | 'negative' | 'neutral' | 'warning'
  target: 15000,      // Target value (optional)
  
  // Custom formatting (optional)
  format: {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }
}
```

### Number Card Variants

#### Currency Number

```tsx
{
  settings: {
    unit: '$',
    precision: 2,
    numberFormat: {
      style: 'currency',
      currency: 'USD',
      currencyDisplay: 'symbol'
    }
  }
}
```

#### Percentage Number

```tsx
{
  settings: {
    unit: '%',
    precision: 1,
    multiplier: 100, // Convert 0.123 to 12.3%
    numberFormat: {
      style: 'percent',
      minimumFractionDigits: 1
    }
  }
}
```

#### Large Number with Abbreviation

```tsx
{
  settings: {
    abbreviate: true, // 1,234,567 → 1.23M
    abbreviationMap: {
      million: 'M',
      billion: 'B', 
      thousand: 'K'
    }
  }
}
```

#### Number with Target/Progress

```tsx
{
  settings: {
    showProgress: true,
    progressType: 'bar', // 'bar' | 'ring' | 'line'
    target: 100000,
    thresholds: {
      excellent: 95,  // >= 95% of target
      good: 80,       // >= 80% of target  
      warning: 60,    // >= 60% of target
      // < 60% is poor
    }
  }
}
```

## Markdown Cards

Markdown cards render rich text content with support for formatting, links, and custom elements.

### Basic Configuration

```tsx
{
  id: 'documentation',
  kind: 'markdown',
  title: 'Getting Started Guide',
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

This dashboard provides comprehensive analytics for your business.

## Features

- **Real-time data** from multiple sources
- **Interactive charts** with drill-down capabilities
- **Customizable layouts** that adapt to your needs

## Getting Started

1. Explore the different report tabs
2. Click on any chart to see detailed views
3. Use the filters to narrow down your analysis

> 💡 **Tip**: Hover over any data point for additional context!

[Learn More](https://docs.example.com) | [Support](mailto:support@example.com)
          `
        }
      }]
    }
  },
  settings: {
    gridPosition: { x: 0, y: 0, w: 6, h: 8 }
  }
}
```

### Data Format

```tsx
{
  content: string,        // Markdown content
  
  // Optional metadata
  lastUpdated?: string,   // ISO date string
  author?: string,        // Content author
  tags?: string[],        // Content tags
  
  // Rendering options
  options?: {
    enableHtml?: boolean,    // Allow HTML in markdown
    enableMath?: boolean,    // Enable LaTeX math rendering
    linkTarget?: '_blank' | '_self',
    
    // Custom link renderer
    linkRenderer?: (href: string, title: string, text: string) => string
  }
}
```

### Markdown Features

#### Basic Formatting

```markdown
# Heading 1
## Heading 2  
### Heading 3

**Bold text**
*Italic text*
***Bold and italic***
~~Strikethrough~~

`Inline code`

> Blockquote text
> Multiple lines
```

#### Lists

```markdown
<!-- Unordered list -->
- Item 1
- Item 2
  - Nested item
  - Another nested item
- Item 3

<!-- Ordered list -->
1. First item
2. Second item
   1. Nested numbered item
   2. Another nested item
3. Third item

<!-- Task list -->
- [x] Completed task
- [ ] Incomplete task
- [ ] Another task
```

#### Links and Images

```markdown
[Link text](https://example.com)
[Link with title](https://example.com "Title text")

![Alt text](https://example.com/image.jpg)
![Image with title](https://example.com/image.jpg "Image title")
```

#### Tables

```markdown
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

<!-- Aligned columns -->
| Left | Center | Right |
|:-----|:------:|------:|
| L1   | C1     | R1    |
| L2   | C2     | R2    |
```

#### Code Blocks

```markdown
<!-- Inline code -->
Use the `console.log()` function to debug.

<!-- Code block -->
```javascript
function greet(name) {
  return `Hello, ${name}!`;
}
```

<!-- Code block with highlighting -->
```python
def calculate_revenue(price, quantity):
    return price * quantity

total = calculate_revenue(29.99, 150)
print(f"Total revenue: ${total}")
```
```

#### Advanced Elements

```markdown
<!-- Horizontal rule -->
---

<!-- Line breaks -->
Line 1  
Line 2 (two spaces at end of previous line)

<!-- Footnotes -->
Here's a sentence with a footnote[^1].

[^1]: This is the footnote content.

<!-- Abbreviations -->
*[HTML]: HyperText Markup Language
*[CSS]: Cascading Style Sheets

The HTML and CSS specifications are maintained by W3C.
```

### Custom Markdown Settings

```tsx
{
  settings: {
    // Rendering options
    enableHtml: true,
    enableMath: true,
    linkTarget: '_blank',
    
    // Syntax highlighting theme
    codeTheme: 'github', // 'github' | 'monokai' | 'tomorrow'
    
    // Custom CSS classes
    className: 'custom-markdown',
    
    // Custom renderers
    renderers: {
      // Custom link renderer
      link: ({ href, title, children }) => (
        <a href={href} title={title} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      ),
      
      // Custom image renderer
      image: ({ src, alt, title }) => (
        <img 
          src={src} 
          alt={alt} 
          title={title}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      ),
      
      // Custom code renderer
      code: ({ language, value }) => (
        <SyntaxHighlighter language={language}>
          {value}
        </SyntaxHighlighter>
      )
    }
  }
}
```

## HTML Cards

HTML cards render custom HTML content with security controls.

### Basic Configuration

```tsx
{
  id: 'custom_widget',
  kind: 'html',
  title: 'Custom Dashboard Widget',
  query: {
    variant: 'http',
    payload: {
      url: '/api/widgets/custom',
      method: 'GET'
    }
  },
  settings: {
    gridPosition: { x: 0, y: 0, w: 6, h: 6 },
    sanitize: true
  }
}
```

### Data Format

```tsx
{
  content: string,        // HTML content
  
  // Optional metadata  
  title?: string,         // Widget title
  description?: string,   // Widget description
  
  // Security options
  sanitize?: boolean,     // Enable HTML sanitization
  allowedTags?: string[], // Allowed HTML tags
  allowedAttributes?: string[], // Allowed attributes
  
  // Styling
  css?: string,          // Custom CSS
  className?: string,    // CSS class name
  
  // JavaScript (if enabled)
  scripts?: string[],    // External script URLs
  inline_script?: string // Inline JavaScript
}
```

### Security Configuration

```tsx
{
  settings: {
    // Enable HTML sanitization (recommended)
    sanitize: true,
    
    // Allowed HTML tags
    allowedTags: [
      'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'strong', 'em', 'u', 'br', 'hr',
      'ul', 'ol', 'li',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'svg', 'path', 'circle', 'rect', 'line'
    ],
    
    // Allowed attributes
    allowedAttributes: [
      'id', 'class', 'style',
      'href', 'target', 'title',
      'src', 'alt', 'width', 'height',
      'colspan', 'rowspan',
      'viewBox', 'd', 'cx', 'cy', 'r', 'x', 'y'
    ],
    
    // URL schemes for links and images
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    
    // Disable JavaScript execution
    allowScripts: false,
    
    // Sandbox options (if using iframe)
    sandbox: [
      'allow-same-origin'
      // Omit 'allow-scripts' for security
    ]
  }
}
```

### HTML Examples

#### Custom Dashboard Widget

```html
<div class="custom-widget">
  <div class="widget-header">
    <h3>Performance Metrics</h3>
    <span class="status-indicator green"></span>
  </div>
  
  <div class="metrics-grid">
    <div class="metric">
      <div class="metric-value">98.5%</div>
      <div class="metric-label">Uptime</div>
    </div>
    
    <div class="metric">
      <div class="metric-value">245ms</div>
      <div class="metric-label">Response Time</div>
    </div>
    
    <div class="metric">
      <div class="metric-value">1,247</div>
      <div class="metric-label">Active Users</div>
    </div>
  </div>
</div>

<style>
.custom-widget {
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-indicator.green {
  background-color: #10b981;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.metric {
  text-align: center;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.metric-label {
  font-size: 0.875rem;
  opacity: 0.8;
}
</style>
```

#### SVG Visualization

```html
<div class="svg-widget">
  <h4>Server Status</h4>
  
  <svg width="300" height="150" viewBox="0 0 300 150">
    <!-- Server icons -->
    <rect x="50" y="50" width="40" height="60" fill="#10b981" rx="4"/>
    <rect x="110" y="50" width="40" height="60" fill="#10b981" rx="4"/>
    <rect x="170" y="50" width="40" height="60" fill="#f59e0b" rx="4"/>
    <rect x="230" y="50" width="40" height="60" fill="#ef4444" rx="4"/>
    
    <!-- Status lights -->
    <circle cx="70" cy="40" r="4" fill="#10b981"/>
    <circle cx="130" cy="40" r="4" fill="#10b981"/>
    <circle cx="190" cy="40" r="4" fill="#f59e0b"/>
    <circle cx="250" cy="40" r="4" fill="#ef4444"/>
    
    <!-- Labels -->
    <text x="70" y="130" text-anchor="middle" font-size="12">Web-01</text>
    <text x="130" y="130" text-anchor="middle" font-size="12">Web-02</text>
    <text x="190" y="130" text-anchor="middle" font-size="12">DB-01</text>
    <text x="250" y="130" text-anchor="middle" font-size="12">Cache</text>
  </svg>
</div>
```

## Iframe Cards

Iframe cards embed external web content within dashboard cards.

### Basic Configuration

```tsx
{
  id: 'external_dashboard',
  kind: 'iframe',
  title: 'External Analytics',
  query: {
    variant: 'custom',
    payload: {
      handler: () => [{
        kind: 'iframe',
        cardId: 'external_dashboard',
        reportId: 'external',
        data: {
          src: 'https://analytics.example.com/embed/dashboard',
          title: 'Analytics Dashboard'
        }
      }]
    }
  },
  settings: {
    gridPosition: { x: 0, y: 0, w: 12, h: 10 }
  }
}
```

### Data Format

```tsx
{
  src: string,                    // Iframe source URL
  
  // Optional attributes
  title?: string,                 // Iframe title (accessibility)
  width?: number | string,        // Iframe width
  height?: number | string,       // Iframe height  
  allowFullscreen?: boolean,      // Allow fullscreen
  
  // Security options
  sandbox?: string[],             // Sandbox restrictions
  referrerPolicy?: string,        // Referrer policy
  loading?: 'eager' | 'lazy',     // Loading behavior
  
  // Custom attributes
  [key: string]: any             // Additional iframe attributes
}
```

### Security Settings

```tsx
{
  settings: {
    // Sandbox restrictions (recommended)
    sandbox: [
      'allow-scripts',           // Allow JavaScript
      'allow-same-origin',       // Allow same-origin requests
      'allow-forms',            // Allow form submission
      'allow-popups',           // Allow popups
      'allow-presentation',     // Allow presentation mode
      // 'allow-top-navigation' // Avoid this for security
    ],
    
    // Referrer policy
    referrerPolicy: 'no-referrer', // 'no-referrer' | 'origin' | 'same-origin'
    
    // Loading strategy
    loading: 'lazy',              // 'eager' | 'lazy'
    
    // HTTPS enforcement
    requireHttps: true,
    
    // Allowed domains (whitelist)
    allowedDomains: [
      'analytics.example.com',
      'dashboard.partner.com'
    ]
  }
}
```

### Iframe Examples

#### Google Analytics Embed

```tsx
{
  data: {
    src: 'https://datastudio.google.com/embed/reporting/abc123',
    title: 'Google Analytics Dashboard',
    allowFullscreen: true
  },
  settings: {
    sandbox: ['allow-scripts', 'allow-same-origin'],
    referrerPolicy: 'origin'
  }
}
```

#### Tableau Dashboard

```tsx
{
  data: {
    src: 'https://public.tableau.com/views/Dashboard/Overview?:embed=y&:display_count=n',
    title: 'Tableau Dashboard',
    allowFullscreen: true
  }
}
```

#### Power BI Report

```tsx
{
  data: {
    src: 'https://app.powerbi.com/reportEmbed?reportId=abc123&config=xyz789',
    title: 'Power BI Report'
  },
  settings: {
    sandbox: ['allow-scripts', 'allow-same-origin', 'allow-forms']
  }
}
```

#### Custom Application

```tsx
{
  data: {
    src: 'https://myapp.example.com/widget?theme=dark&readonly=true',
    title: 'Custom Application Widget'
  },
  settings: {
    sandbox: ['allow-scripts', 'allow-same-origin'],
    loading: 'lazy'
  }
}
```

## Best Practices

### Performance Optimization

1. **Lazy Loading**: Use lazy loading for iframe cards
2. **Data Pagination**: Implement pagination for large table datasets
3. **Chart Optimization**: Limit data points in charts (< 1000 points)
4. **Memory Management**: Clean up WebSocket connections properly

### Security Considerations

1. **HTML Sanitization**: Always enable sanitization for HTML cards
2. **Iframe Sandboxing**: Use restrictive sandbox settings
3. **HTTPS Enforcement**: Require HTTPS for external content
4. **Content Security Policy**: Implement CSP headers

### Accessibility

1. **Alt Text**: Provide alt text for images and charts
2. **Color Contrast**: Ensure sufficient color contrast
3. **Keyboard Navigation**: Support keyboard navigation
4. **Screen Readers**: Use semantic HTML and ARIA labels

### Responsive Design

1. **Grid Layouts**: Use responsive grid positions
2. **Flexible Sizing**: Make cards adapt to different screen sizes
3. **Mobile-First**: Design for mobile devices first
4. **Touch-Friendly**: Ensure touch targets are large enough

This comprehensive guide covers all card types and their configuration options. For more examples, see the [examples](examples/) directory.