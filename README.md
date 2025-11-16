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
