# Installation & Setup

Complete guide for installing and setting up @cereon/dashboard in your React application.

## Requirements

- **Node.js**: 16.0 or higher
- **React**: 16.8 or higher (hooks support required)
- **TypeScript**: 4.5 or higher (optional but recommended)

## Installation

### Using npm

```bash
npm install @cereon/dashboard
```

### Using yarn

```bash
yarn add @cereon/dashboard
```

### Using pnpm

```bash
pnpm add @cereon/dashboard
```

## Peer Dependencies

The package has several peer dependencies that you may need to install:

```bash
# Core dependencies (required)
npm install react react-dom

# Layout and interactions (required)
npm install react-grid-layout framer-motion
```

### Complete Installation

For a complete installation with all dependencies:

```bash
npm install @cereon/dashboard react react-dom react-grid-layout framer-motion
```

## Basic Setup

### 1. Wrap Your App with DashboardProvider

```tsx
// App.tsx
import React from 'react';
import { DashboardProvider } from '@cereon/dashboard';

function App() {
  return (
    <DashboardProvider>
      {/* Your app content */}
    </DashboardProvider>
  );
}

export default App;
```

### 2. Import Required Styles

```tsx
// main.tsx or index.tsx
import '@cereon/dashboard/styles.css';
// or if using CSS modules
import '@cereon/dashboard/dist/styles.css';
```

### 3. Create Your First Dashboard

```tsx
// Dashboard.tsx
import React from 'react';
import { Dashboard } from '@cereon/dashboard';

const dashboardSpec = {
  id: 'my_dashboard',
  title: 'My First Dashboard',
  reports: [{
    id: 'overview',
    title: 'Overview', 
    reportCards: [
      {
        id: 'welcome_card',
        kind: 'markdown',
        title: 'Welcome',
        query: {
          variant: 'custom',
          payload: {
            handler: () => [{
              kind: 'markdown',
              cardId: 'welcome_card',
              reportId: 'overview',
              data: {
                content: '# Welcome to Cereon Dashboard!\n\nYour dashboard is ready to use.'
              }
            }]
          }
        }
      }
    ]
  }]
};

export function MyDashboard() {
  return (
    <div style={{ height: '100vh' }}>
      <Dashboard state={{ spec: dashboardSpec }} />
    </div>
  );
}
```

## Framework Integration

### Next.js Setup

```tsx
// pages/_app.tsx
import type { AppProps } from 'next/app';
import { DashboardProvider } from '@cereon/dashboard';
import '@cereon/dashboard/styles.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <DashboardProvider>
      <Component {...pageProps} />
    </DashboardProvider>
  );
}
```

```tsx
// pages/dashboard.tsx
import { Dashboard } from '@cereon/dashboard';
import { dashboardSpec } from '../config/dashboard-config';

export default function DashboardPage() {
  return <Dashboard state={{ spec: dashboardSpec }} />;
}
```

### Vite Setup

```tsx
// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { DashboardProvider } from '@cereon/dashboard';
import App from './App';
import '@cereon/dashboard/styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DashboardProvider>
      <App />
    </DashboardProvider>
  </React.StrictMode>
);
```

### Create React App Setup

```tsx
// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { DashboardProvider } from '@cereon/dashboard';
import App from './App';
import '@cereon/dashboard/styles.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <DashboardProvider>
      <App />
    </DashboardProvider>
  </React.StrictMode>
);
```

## TypeScript Configuration

### tsconfig.json

Ensure your TypeScript configuration includes:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": [
    "src",
    "node_modules/@cereon/dashboard/dist/types"
  ]
}
```

### Type Definitions

Create a types file for better TypeScript experience:

```tsx
// types/dashboard.ts
import type { 
  DashboardSpec, 
  DashboardState,
  CardSettingsMap,
  CardRecordMap 
} from '@cereon/dashboard';

// Define your card types
export interface MyCardSettings extends CardSettingsMap {
  chart: {
    enableDownload?: boolean;
    gridPosition?: CardGridPosition;
  };
  table: {
    enableDownload?: boolean;
    pagination?: boolean;
    gridPosition?: CardGridPosition;
  };
  number: {
    unit?: string;
    gridPosition?: CardGridPosition;
  };
}

// Define your record types  
export interface MyCardRecords extends CardRecordMap {
  chart: ChartCardRecord;
  table: TableCardRecord;
  number: NumberCardRecord;
}

// Typed dashboard spec
export type MyDashboardSpec = DashboardSpec<MyCardSettings, MyCardRecords>;
export type MyDashboardState = DashboardState<MyCardSettings, MyCardRecords>;
```

## CSS and Styling Setup

### Custom CSS Variables

```css
/* styles/dashboard-theme.css */
:root {
  /* Colors */
  --cereon-primary: #3b82f6;
  --cereon-secondary: #64748b;
  --cereon-accent: #06b6d4;
  --cereon-success: #10b981;
  --cereon-warning: #f59e0b;
  --cereon-error: #ef4444;
  
  /* Backgrounds */
  --cereon-background: #ffffff;
  --cereon-surface: #f8fafc;
  --cereon-card-background: #ffffff;
  
  /* Text */
  --cereon-text-primary: #1f2937;
  --cereon-text-secondary: #6b7280;
  --cereon-text-muted: #9ca3af;
  
  /* Borders */
  --cereon-border: #e5e7eb;
  --cereon-border-light: #f3f4f6;
  
  /* Spacing */
  --cereon-spacing-xs: 0.25rem;
  --cereon-spacing-sm: 0.5rem;
  --cereon-spacing-md: 1rem;
  --cereon-spacing-lg: 1.5rem;
  --cereon-spacing-xl: 2rem;
  
  /* Border radius */
  --cereon-radius-sm: 0.25rem;
  --cereon-radius-md: 0.5rem;
  --cereon-radius-lg: 0.75rem;
  
  /* Shadows */
  --cereon-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --cereon-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --cereon-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

[data-theme="dark"] {
  --cereon-background: #0f172a;
  --cereon-surface: #1e293b;
  --cereon-card-background: #334155;
  --cereon-text-primary: #f1f5f9;
  --cereon-text-secondary: #cbd5e1;
  --cereon-border: #475569;
}
```

### Tailwind CSS Integration

If using Tailwind CSS, add the dashboard classes to your configuration:

```js
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@cereon/dashboard/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cereon: {
          primary: 'var(--cereon-primary)',
          secondary: 'var(--cereon-secondary)',
          accent: 'var(--cereon-accent)',
          // ... other colors
        }
      }
    }
  },
  plugins: []
};
```

## Environment Configuration

### Environment Variables

Create a `.env` file for configuration:

```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_WS_BASE_URL=ws://localhost:8000

# Dashboard Configuration  
REACT_APP_DASHBOARD_THEME=light
REACT_APP_DASHBOARD_ANIMATIONS=smooth
REACT_APP_MAX_CARDS_PER_REPORT=50

# Development
REACT_APP_ENABLE_DEBUG=true
REACT_APP_MOCK_DATA=false
```

### Configuration Hook

```tsx
// hooks/useConfig.ts
import { useMemo } from 'react';

export interface AppConfig {
  apiBaseUrl: string;
  wsBaseUrl: string;
  theme: 'light' | 'dark' | 'system';
  animations: 'none' | 'subtle' | 'smooth' | 'dynamic';
  maxCardsPerReport: number;
  enableDebug: boolean;
  mockData: boolean;
}

export function useConfig(): AppConfig {
  return useMemo(() => ({
    apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
    wsBaseUrl: process.env.REACT_APP_WS_BASE_URL || 'ws://localhost:8000',
    theme: (process.env.REACT_APP_DASHBOARD_THEME as any) || 'light',
    animations: (process.env.REACT_APP_DASHBOARD_ANIMATIONS as any) || 'smooth',
    maxCardsPerReport: parseInt(process.env.REACT_APP_MAX_CARDS_PER_REPORT || '50'),
    enableDebug: process.env.REACT_APP_ENABLE_DEBUG === 'true',
    mockData: process.env.REACT_APP_MOCK_DATA === 'true'
  }), []);
}
```

## Bundle Optimization

### Code Splitting

```tsx
// components/LazyDashboard.tsx
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => 
  import('@cereon/dashboard').then(module => ({
    default: module.Dashboard
  }))
);

export function LazyDashboard(props: any) {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <Dashboard {...props} />
    </Suspense>
  );
}
```

### Tree Shaking

Import only what you need:

```tsx
// Instead of importing everything
import { Dashboard, DashboardProvider, useDashboard } from '@cereon/dashboard';

// Import specific components
import { Dashboard } from '@cereon/dashboard/components/Dashboard';
import { DashboardProvider } from '@cereon/dashboard/contexts/dashboard';
import { useDashboard } from '@cereon/dashboard/hooks/useDashboard';
```

## Development Tools

### Dashboard Dev Tools

```tsx
// components/DashboardDevTools.tsx (development only)
import { useDashboard } from '@cereon/dashboard';

export function DashboardDevTools() {
  const { spec, reportStates } = useDashboard();
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 0, 
      right: 0, 
      background: 'white', 
      border: '1px solid #ccc',
      padding: '1rem',
      zIndex: 9999 
    }}>
      <h4>Dashboard Debug Info</h4>
      <pre>{JSON.stringify({ spec, reportStates }, null, 2)}</pre>
    </div>
  );
}
```

### Hot Module Replacement

For Vite projects, enable HMR for better development experience:

```tsx
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      overlay: false // Disable error overlay for cleaner development
    }
  },
  optimizeDeps: {
    include: ['@cereon/dashboard', 'react-grid-layout', 'framer-motion']
  }
});
```

## Testing Setup

### Jest Configuration

```js
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@cereon/dashboard|react-grid-layout)/)'
  ]
};
```

### Testing Utilities

```tsx
// test-utils/render.tsx
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { DashboardProvider } from '@cereon/dashboard';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  dashboardConfig?: any;
}

export function renderWithDashboard(
  ui: React.ReactElement,
  { dashboardConfig, ...options }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <DashboardProvider {...dashboardConfig}>
        {children}
      </DashboardProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}
```

## Verification

After installation, verify everything works:

### 1. Check Bundle Size

```bash
npm run build
# Check the generated bundle size
```

### 2. Test Basic Functionality

```tsx
// Test.tsx
import { Dashboard, DashboardProvider } from '@cereon/dashboard';

const testSpec = {
  id: 'test',
  reports: [{
    id: 'test_report',
    reportCards: [{
      id: 'test_card',
      kind: 'markdown',
      query: {
        variant: 'custom',
        payload: {
          handler: () => [{
            kind: 'markdown',
            cardId: 'test_card', 
            reportId: 'test_report',
            data: { content: '# Setup Successful! ✅' }
          }]
        }
      }
    }]
  }]
};

export function Test() {
  return (
    <DashboardProvider>
      <Dashboard state={{ spec: testSpec }} />
    </DashboardProvider>
  );
}
```

### 3. Console Verification

Open your browser's developer console and verify no errors are shown during dashboard rendering.

## Troubleshooting

### Common Issues

**Module Resolution Errors**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**TypeScript Errors**:
```json
// Add to tsconfig.json
{
  "compilerOptions": {
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true
  }
}
```

**CSS Loading Issues**:
```tsx
// Ensure CSS is imported in the correct order
import '@cereon/dashboard/styles.css';
import './app.css'; // Your app styles
```

**Peer Dependency Warnings**:
```bash
# Install missing peer dependencies
npm install react react-dom react-grid-layout framer-motion
```

### Getting Help

- Check the [API Reference](api-reference.md) for detailed component documentation
- Browse [examples](examples/) for implementation patterns
- Open an issue on [GitHub](https://github.com/adimis-ai/cereon/issues) for bugs

## Next Steps

- [Quick Start Tutorial](quickstart.md) - Build your first dashboard
- [Configuration Guide](configuration.md) - Learn about dashboard configuration
- [Card Types](card-types.md) - Explore available card types
- [Theming](theming.md) - Customize the appearance