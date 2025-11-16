# @cereon/dashboard

> ⚠️ CONSTRUCTION / BETA NOTICE: The official beta release of these packages is scheduled for 1st December 2025. Expect breaking changes until the beta is published. If you plan to depend on this library for production, please wait until the official beta.

[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/) [![React](https://img.shields.io/badge/React-Ready-61DAFB.svg?logo=react&logoColor=white)](https://reactjs.org/) [![Vite](https://img.shields.io/badge/Vite-Ready-brightgreen.svg?logo=vite&logoColor=white)](https://vitejs.dev/) [![Next.js](https://img.shields.io/badge/Next.js-Ready-black.svg?logo=nextdotjs&logoColor=white)](https://nextjs.org/) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**@cereon/dashboard** is a powerful React component library for building interactive, real-time dashboards. Seamlessly integrates with Cereon SDK backends to create responsive, data-driven experiences.

<!-- Demo images: light and dark themes -->
<p align="center">
  <img alt="Cereon Dashboard Light" src="./assets/cereon-dashboard-demo-light.png" width="48%" style="margin-right:2%" />
  <img alt="Cereon Dashboard Dark" src="./assets/cereon-dashboard-demo-dark.png" width="48%" />
</p>

## 🚀 Quick Start

### Installation

```bash
npm install @cereon/dashboard
# or
yarn add @cereon/dashboard
# or
pnpm add @cereon/dashboard
```

### Basic Example

Create your first dashboard in minutes:

```tsx
import React from "react";
import { Dashboard, DashboardProvider } from "@cereon/dashboard";

const dashboardSpec = {
  id: "my_dashboard",
  title: "Sales Analytics",
  reports: [
    {
      id: "overview",
      title: "Overview",
      reportCards: [
        {
          id: "sales_chart",
          kind: "line",
          title: "Monthly Sales",
          query: {
            variant: "http",
            payload: {
              url: "https://api.example.com/cards/sales",
            },
          },
        },
        {
          id: "revenue_kpi",
          kind: "number",
          title: "Total Revenue",
          query: {
            variant: "http",
            payload: {
              url: "https://api.example.com/cards/revenue",
            },
          },
        },
      ],
    },
  ],
};

function App() {
  return (
    <DashboardProvider>
      <Dashboard state={{ spec: dashboardSpec }} />
    </DashboardProvider>
  );
}

export default App;
```

Include this in your `index.css`

```css
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");
@import url("https://fonts.googleapis.com/css2?family=JetAssistants+Mono:wght@400;500;600;700&display=swap");
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  --radius: 0.65rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.141 0.005 285.823);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.141 0.005 285.823);
  --primary: oklch(0.648 0.2 131.684);
  --primary-foreground: oklch(0.986 0.031 120.757);
  --secondary: oklch(0.967 0.001 286.375);
  --secondary-foreground: oklch(0.21 0.006 285.885);
  --muted: oklch(0.967 0.001 286.375);
  --muted-foreground: oklch(0.552 0.016 285.938);
  --accent: oklch(0.967 0.001 286.375);
  --accent-foreground: oklch(0.21 0.006 285.885);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.92 0.004 286.32);
  --input: oklch(0.92 0.004 286.32);
  --ring: oklch(0.841 0.238 128.85);
  --chart-1: oklch(0.871 0.15 154.449);
  --chart-2: oklch(0.723 0.219 149.579);
  --chart-3: oklch(0.627 0.194 149.214);
  --chart-4: oklch(0.527 0.154 150.069);
  --chart-5: oklch(0.448 0.119 151.328);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.141 0.005 285.823);
  --sidebar-primary: oklch(0.648 0.2 131.684);
  --sidebar-primary-foreground: oklch(0.986 0.031 120.757);
  --sidebar-accent: oklch(0.967 0.001 286.375);
  --sidebar-accent-foreground: oklch(0.21 0.006 285.885);
  --sidebar-border: oklch(0.92 0.004 286.32);
  --sidebar-ring: oklch(0.841 0.238 128.85);
  --warning: oklch(0.65 0.23 90);
  --warning-foreground: oklch(0.98 0.04 90);
  --success: oklch(0.62 0.23 134);
  --success-foreground: oklch(0.97 0.04 134);
}

.dark {
  --background: oklch(0.141 0.005 285.823);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.21 0.006 285.885);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.21 0.006 285.885);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.648 0.2 131.684);
  --primary-foreground: oklch(0.986 0.031 120.757);
  --secondary: oklch(0.274 0.006 286.033);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.274 0.006 286.033);
  --muted-foreground: oklch(0.705 0.015 286.067);
  --accent: oklch(0.274 0.006 286.033);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.405 0.101 131.063);
  --chart-1: oklch(0.871 0.15 154.449);
  --chart-2: oklch(0.723 0.219 149.579);
  --chart-3: oklch(0.627 0.194 149.214);
  --chart-4: oklch(0.527 0.154 150.069);
  --chart-5: oklch(0.448 0.119 151.328);
  --sidebar: oklch(0.21 0.006 285.885);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.768 0.233 130.85);
  --sidebar-primary-foreground: oklch(0.986 0.031 120.757);
  --sidebar-accent: oklch(0.274 0.006 286.033);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.405 0.101 131.063);
  --warning: oklch(0.65 0.23 90);
  --warning-foreground: oklch(0.98 0.04 90);
  --success: oklch(0.62 0.23 134);
  --success-foreground: oklch(0.97 0.04 134);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
  --animate-accordion-down: accordion-down 0.2s ease-out;
  --animate-accordion-up: accordion-up 0.2s ease-out;
  --header-height: 3rem;

  @keyframes accordion-down {
    from {
      height: 0;
    }
    to {
      height: var(--radix-accordion-content-height);
    }
  }
  @keyframes accordion-up {
    from {
      height: var(--radix-accordion-content-height);
    }
    to {
      height: 0;
    }
  }
  @keyframes gradient {
    0% {
      background-position: 100% 50%;
    }
    50% {
      background-position: 0% 50%;
    }
    100% {
      background-position: 100% 50%;
    }
  }
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}

@layer base {
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
    background-color: var(--muted);
  }
  ::-webkit-scrollbar-thumb {
    background-color: var(--muted-foreground);
    border-radius: 10px;
  }
  ::-webkit-scrollbar-track {
    background: var(--muted);
    opacity: 0.5;
  }
  * {
    scrollbar-width: thin;
    scrollbar-color: var(--muted-foreground) var(--muted);
  }
}

html {
  scroll-behavior: smooth;
  font-family: "JetAssistants Mono", "Inter", system-ui, -apple-system,
    BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans",
    sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol",
    "Noto Color Emoji";
  font-variant-ligatures: contextual;
  font-feature-settings: "calt" 1, "liga" 1;
}

@media (max-width: 1024px) {
  .shadow {
    top: 70px;
  }
  @keyframes shadow-slide {
    from {
      background: color-mix(in oklch, var(--primary) 20%, transparent);
      right: 460px;
    }
    to {
      background: color-mix(in oklch, var(--primary) 50%, transparent);
      right: 160px;
    }
  }
}

@media (max-width: 768px) {
  .shadow {
    top: 70px;
    width: 100px;
    height: 350px;
    filter: blur(60px);
  }
  @keyframes shadow-slide {
    from {
      background: color-mix(in oklch, var(--primary) 20%, transparent);
      right: 280px;
    }
    to {
      background: color-mix(in oklch, var(--primary) 30%, transparent);
      right: 100px;
    }
  }
}

.markdown-preview-root {
  background: var(--card) !important;
  color: var(--card-foreground) !important;
}

.markdown-preview-root * {
  color: inherit !important;
  background: transparent !important;
}

.markdown-preview-root pre,
.markdown-preview-root code {
  color: var(--card-foreground) !important;
  /* subtle code background derived from the card but not clashing */
  background: color-mix(in oklch, var(--muted) 6%, var(--card)) !important;
}

.markdown-preview-root table,
.markdown-preview-root th,
.markdown-preview-root td,
.markdown-preview-root hr {
  color: var(--card-foreground) !important;
  border-color: color-mix(
    in oklch,
    var(--card-foreground) 30%,
    transparent
  ) !important;
}
```

## ✨ Key Features

### 📊 **Rich Visualization Components**

- **Chart Cards**: Line, bar, area, pie, radar, and radial charts
- **Data Tables**: Sortable, filterable, and paginated tables
- **KPI Cards**: Number displays with trend indicators
- **Content Cards**: Markdown, HTML, and iframe support

### ⚡ **Real-time Updates**

- **WebSocket Support**: Live data streaming
- **HTTP Polling**: Configurable refresh intervals
- **Server-Sent Events**: Streaming data feeds
- **Custom Handlers**: Build your own data sources

### 🎨 **Modern Design System**

- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Theme Support**: Light, dark, and custom themes
- **Drag & Drop**: Rearrange and resize cards
- **Animations**: Smooth transitions and micro-interactions

### 🛠️ **Developer Experience**

- **TypeScript First**: Complete type safety
- **Flexible Architecture**: Extensible and customizable
- **Performance Optimized**: Lazy loading and virtualization
- **Accessibility**: WCAG 2.1 compliant

## 📖 Documentation

| Guide                                            | Description                            |
| ------------------------------------------------ | -------------------------------------- |
| [Installation & Setup](docs/installation.md)     | Complete installation and setup guide  |
| [Quick Start Tutorial](docs/quickstart.md)       | Build your first dashboard             |
| [Dashboard Configuration](docs/configuration.md) | Complete configuration reference       |
| [Card Types](docs/card-types.md)                 | Available card types and customization |
| [Theming & Styling](docs/theming.md)             | Customize appearance and branding      |
| [API Reference](docs/api-reference.md)           | Complete component API                 |
| [Performance](docs/performance.md)               | Optimization best practices            |
| [Examples](docs/examples/)                       | Real-world implementation examples     |

## 🏃‍♂️ Quick Examples

### Real-time Dashboard

```tsx
const realtimeSpec = {
  id: "realtime_dashboard",
  reports: [
    {
      id: "live_metrics",
      reportCards: [
        {
          id: "live_users",
          kind: "number",
          query: {
            variant: "websocket",
            payload: {
              url: "wss://api.example.com/live-users",
              topic: "user_count",
            },
          },
        },
        {
          id: "live_chart",
          kind: "line",
          query: {
            variant: "streaming-http",
            payload: {
              url: "https://api.example.com/metrics/stream",
              streamFormat: "sse",
            },
          },
        },
      ],
    },
  ],
};

<Dashboard state={{ spec: realtimeSpec }} />;
```

### Custom Theme

```tsx
import { Dashboard, DashboardProvider } from "@cereon/dashboard";

const customConfig = {
  theme: "dark",
  animations: "smooth",
};

<DashboardProvider>
  <Dashboard
    state={{
      spec: dashboardSpec,
      additional: customConfig,
    }}
  />
</DashboardProvider>;
```

### Interactive Filtering

```tsx
const interactiveSpec = {
  reports: [
    {
      reportCards: [
        {
          id: "filtered_data",
          kind: "table",
          settings: {
            filters: {
              schema: [
                {
                  type: "select",
                  name: "region",
                  label: "Region",
                  options: [
                    { label: "North", value: "north" },
                    { label: "South", value: "south" },
                  ],
                },
                {
                  type: "daterange",
                  name: "dateRange",
                  label: "Date Range",
                },
              ],
              defaultValues: {
                region: "north",
              },
            },
          },
          query: {
            variant: "http",
            payload: {
              url: "https://api.example.com/filtered-data",
              // Filters automatically added as query parameters
            },
          },
        },
      ],
    },
  ],
};
```

## 🏗️ Architecture

The Cereon Dashboard follows a **declarative configuration approach**:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Dashboard     │    │     Cards       │    │  Data Sources   │
│ Configuration   │───▶│  Components     │◄───│   (APIs/WS)    │
│    (Spec)       │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        │                       │                       │
   JSON Schema           React Components         HTTP/WebSocket
```

### Core Concepts

- **Dashboard Spec**: Declarative JSON configuration
- **Reports**: Tab-based organization of related cards
- **Cards**: Individual data visualization components
- **Queries**: Define how cards fetch and update data
- **Providers**: React context for state management

## 🔌 Integration with Cereon SDK

Perfect companion to [cereon-sdk](https://pypi.org/project/cereon-sdk/) Python package:

**Backend (Python)**:

```python
from cereon_sdk import BaseCard, ChartCardRecord

class SalesCard(BaseCard[ChartCardRecord]):
    kind = "line"
    card_id = "monthly_sales"
    transport = "http"

    @classmethod
    async def handler(cls, ctx):
        return [ChartCardRecord(...)]
```

**Frontend (React)**:

```tsx
const spec = {
  reports: [
    {
      reportCards: [
        {
          id: "monthly_sales",
          kind: "line",
          query: {
            variant: "http",
            payload: { url: "/api/cards/monthly_sales" },
          },
        },
      ],
    },
  ],
};
```

## 📦 What's Included

### Components

- `<Dashboard />` - Main dashboard component
- `<DashboardProvider />` - Context provider
- `<DashboardCard />` - Individual card component
- Built-in card types for all major visualizations

### Hooks

- `useDashboard()` - Access dashboard state and actions
- `useCardVisibility()` - Optimize rendering for visible cards

### Utilities

- Grid layout management
- Theme system
- Performance optimization helpers
- Type definitions

## 🌐 Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## 📱 Mobile Support

Fully responsive design with mobile-specific optimizations:

- Touch-friendly interactions
- Responsive grid layouts
- Mobile-optimized card sizes
- Swipe gestures for navigation

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Visual regression tests
npm run test:visual
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Community

- 📚 **Documentation**: [Complete docs](docs/)
- 🐛 **Issues**: [GitHub Issues](https://github.com/adimis-ai/cereon-dashboard/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/adimis-ai/cereon-dashboard/discussions)
- 🚀 **Examples**: [Live Examples](https://cereon-examples.vercel.app)

---

**Ready to build amazing dashboards? Get started with our [Quick Start Guide](docs/quickstart.md)!** 🚀
