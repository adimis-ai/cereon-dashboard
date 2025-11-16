# Theming & Customization

Complete guide to customizing the appearance and styling of @cereon/dashboard components.

## Table of Contents

- [Theme System Overview](#theme-system-overview)
- [Built-in Themes](#built-in-themes)
- [Custom Themes](#custom-themes)
- [CSS Variables](#css-variables)
- [Component Styling](#component-styling)
- [Responsive Design](#responsive-design)
- [Dark Mode](#dark-mode)
- [Animation Preferences](#animation-preferences)

## Theme System Overview

Cereon Dashboard uses a flexible theming system based on CSS custom properties (variables) and design tokens. This allows for comprehensive customization while maintaining consistency across components.

### Theme Architecture

```
Theme System
├── Design Tokens (colors, spacing, typography)
├── CSS Variables (runtime customization)
├── Component Themes (card-specific styling)
└── Layout Themes (grid and layout customization)
```

### Theme Provider

Configure themes at the provider level:

```tsx
import { DashboardProvider } from '@cereon/dashboard'

function App() {
  return (
    <DashboardProvider
      theme={{
        mode: 'light',           // 'light' | 'dark' | 'auto'
        variant: 'default',      // 'default' | 'minimal' | 'corporate'
        primaryColor: '#3b82f6', // Brand color
        borderRadius: 'medium',  // 'none' | 'small' | 'medium' | 'large'
        fontFamily: 'Inter, system-ui, sans-serif',
        animations: 'smooth'     // 'none' | 'subtle' | 'smooth' | 'dynamic'
      }}
    >
      <Dashboard state={{ spec: dashboardSpec }} />
    </DashboardProvider>
  )
}
```

## Built-in Themes

Cereon includes several pre-designed themes for common use cases.

### Default Theme

Clean, modern theme suitable for most applications:

```tsx
const defaultTheme = {
  mode: 'light',
  variant: 'default',
  colors: {
    primary: '#3b82f6',
    secondary: '#64748b', 
    accent: '#06b6d4',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    background: '#ffffff',
    surface: '#f8fafc',
    border: '#e5e7eb'
  }
}
```

### Minimal Theme

Simplified theme with reduced visual elements:

```tsx
const minimalTheme = {
  mode: 'light',
  variant: 'minimal',
  colors: {
    primary: '#000000',
    secondary: '#666666',
    background: '#ffffff',
    surface: '#ffffff',
    border: '#e0e0e0'
  },
  spacing: {
    cardPadding: '1rem',
    cardMargin: '0.5rem'
  },
  borderRadius: 'none'
}
```

### Corporate Theme

Professional theme for enterprise applications:

```tsx
const corporateTheme = {
  mode: 'light',
  variant: 'corporate',
  colors: {
    primary: '#1f2937',
    secondary: '#374151',
    accent: '#3730a3',
    background: '#f9fafb',
    surface: '#ffffff',
    border: '#d1d5db'
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600
    }
  }
}
```

### Dark Theme

Dark mode variant of the default theme:

```tsx
const darkTheme = {
  mode: 'dark',
  variant: 'default',
  colors: {
    primary: '#60a5fa',
    secondary: '#94a3b8',
    accent: '#22d3ee',
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    background: '#0f172a',
    surface: '#1e293b',
    border: '#334155'
  }
}
```

## Custom Themes

Create fully custom themes to match your brand identity.

### Theme Configuration Object

```tsx
interface ThemeConfig {
  // Mode and variant
  mode: 'light' | 'dark' | 'auto'
  variant: 'default' | 'minimal' | 'corporate' | 'custom'
  
  // Color system
  colors: {
    // Brand colors
    primary: string
    secondary: string
    accent: string
    
    // Semantic colors
    success: string
    warning: string
    error: string
    info: string
    
    // Surface colors
    background: string
    surface: string
    surfaceVariant: string
    
    // Content colors
    onBackground: string
    onSurface: string
    onPrimary: string
    
    // Border and outline
    border: string
    outline: string
    
    // Interactive states
    hover: string
    active: string
    focus: string
    disabled: string
  }
  
  // Typography
  typography: {
    fontFamily: string
    fontSize: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
      '2xl': string
      '3xl': string
    }
    fontWeight: {
      light: number
      normal: number
      medium: number
      semibold: number
      bold: number
    }
    lineHeight: {
      tight: number
      normal: number
      relaxed: number
    }
  }
  
  // Spacing system
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
    
    // Component-specific spacing
    cardPadding: string
    cardMargin: string
    cardGap: string
  }
  
  // Border radius
  borderRadius: {
    none: string
    sm: string
    md: string
    lg: string
    xl: string
    full: string
  }
  
  // Shadows
  shadows: {
    none: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  
  // Animations
  animations: {
    duration: {
      fast: string
      normal: string
      slow: string
    }
    easing: {
      linear: string
      easeIn: string
      easeOut: string
      easeInOut: string
    }
  }
}
```

### Complete Custom Theme Example

```tsx
const customTheme: ThemeConfig = {
  mode: 'light',
  variant: 'custom',
  
  colors: {
    // Brand colors (your company colors)
    primary: '#7c3aed',      // Purple
    secondary: '#64748b',    // Slate
    accent: '#06b6d4',       // Cyan
    
    // Semantic colors
    success: '#059669',      // Emerald
    warning: '#d97706',      // Amber
    error: '#dc2626',        // Red
    info: '#2563eb',         // Blue
    
    // Surface colors
    background: '#fefefe',
    surface: '#ffffff',
    surfaceVariant: '#f1f5f9',
    
    // Content colors (automatically calculated)
    onBackground: '#0f172a',
    onSurface: '#1e293b',
    onPrimary: '#ffffff',
    
    // Borders
    border: '#e2e8f0',
    outline: '#cbd5e1',
    
    // Interactive states
    hover: '#f8fafc',
    active: '#e2e8f0',
    focus: '#7c3aed',
    disabled: '#94a3b8'
  },
  
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem' // 30px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  },
  
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    
    cardPadding: '1.5rem',
    cardMargin: '1rem',
    cardGap: '1rem'
  },
  
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    full: '9999px'
  },
  
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
  },
  
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
}
```

## CSS Variables

All theme values are exposed as CSS custom properties for dynamic customization.

### Core Variables

```css
:root {
  /* Colors */
  --cereon-primary: #3b82f6;
  --cereon-secondary: #64748b;
  --cereon-accent: #06b6d4;
  --cereon-success: #10b981;
  --cereon-warning: #f59e0b;
  --cereon-error: #ef4444;
  
  /* Surface colors */
  --cereon-background: #ffffff;
  --cereon-surface: #f8fafc;
  --cereon-surface-variant: #f1f5f9;
  
  /* Content colors */
  --cereon-on-background: #0f172a;
  --cereon-on-surface: #1e293b;
  --cereon-on-primary: #ffffff;
  
  /* Borders */
  --cereon-border: #e5e7eb;
  --cereon-outline: #d1d5db;
  
  /* Interactive states */
  --cereon-hover: #f8fafc;
  --cereon-active: #e2e8f0;
  --cereon-focus: #3b82f6;
  --cereon-disabled: #9ca3af;
  
  /* Typography */
  --cereon-font-family: 'Inter', system-ui, sans-serif;
  --cereon-font-size-xs: 0.75rem;
  --cereon-font-size-sm: 0.875rem;
  --cereon-font-size-base: 1rem;
  --cereon-font-size-lg: 1.125rem;
  --cereon-font-weight-normal: 400;
  --cereon-font-weight-medium: 500;
  --cereon-font-weight-semibold: 600;
  --cereon-line-height-normal: 1.5;
  
  /* Spacing */
  --cereon-spacing-xs: 0.25rem;
  --cereon-spacing-sm: 0.5rem;
  --cereon-spacing-md: 1rem;
  --cereon-spacing-lg: 1.5rem;
  --cereon-spacing-xl: 2rem;
  
  /* Component spacing */
  --cereon-card-padding: 1.5rem;
  --cereon-card-margin: 1rem;
  --cereon-card-gap: 1rem;
  
  /* Border radius */
  --cereon-radius-sm: 0.25rem;
  --cereon-radius-md: 0.5rem;
  --cereon-radius-lg: 0.75rem;
  
  /* Shadows */
  --cereon-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --cereon-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --cereon-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  
  /* Animations */
  --cereon-duration-fast: 150ms;
  --cereon-duration-normal: 300ms;
  --cereon-duration-slow: 500ms;
  --cereon-easing-ease-out: cubic-bezier(0, 0, 0.2, 1);
}
```

### Runtime Variable Updates

Update CSS variables dynamically:

```tsx
import { useTheme } from '@cereon/dashboard'

function ThemeCustomizer() {
  const { updateTheme } = useTheme()
  
  const changePrimaryColor = (color: string) => {
    // Update CSS variable directly
    document.documentElement.style.setProperty('--cereon-primary', color)
    
    // Or update through theme system
    updateTheme({
      colors: {
        primary: color
      }
    })
  }
  
  return (
    <div>
      <input
        type="color"
        onChange={(e) => changePrimaryColor(e.target.value)}
        defaultValue="#3b82f6"
      />
    </div>
  )
}
```

## Component Styling

Customize individual component styles using CSS classes and custom properties.

### Dashboard Container

```css
.cereon-dashboard {
  /* Layout */
  --dashboard-padding: 1rem;
  --dashboard-background: var(--cereon-background);
  
  /* Grid */
  --grid-gap: var(--cereon-card-gap);
  --grid-margin: var(--cereon-card-margin);
  
  padding: var(--dashboard-padding);
  background: var(--dashboard-background);
  min-height: 100vh;
}

/* Custom dashboard background */
.cereon-dashboard.gradient-bg {
  background: linear-gradient(
    135deg,
    var(--cereon-primary) 0%,
    var(--cereon-accent) 100%
  );
}
```

### Card Styling

```css
.cereon-card {
  /* Layout */
  --card-padding: var(--cereon-card-padding);
  --card-background: var(--cereon-surface);
  --card-border: 1px solid var(--cereon-border);
  --card-radius: var(--cereon-radius-md);
  --card-shadow: var(--cereon-shadow-md);
  
  /* Header */
  --card-header-padding: 1rem 1.5rem;
  --card-header-border: 1px solid var(--cereon-border);
  
  /* Content */
  --card-content-padding: 1.5rem;
  
  padding: var(--card-padding);
  background: var(--card-background);
  border: var(--card-border);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  transition: box-shadow var(--cereon-duration-normal) var(--cereon-easing-ease-out);
}

.cereon-card:hover {
  --card-shadow: var(--cereon-shadow-lg);
}

/* Card variants */
.cereon-card.card-elevated {
  --card-shadow: var(--cereon-shadow-xl);
  transform: translateY(-2px);
}

.cereon-card.card-minimal {
  --card-border: none;
  --card-shadow: none;
  --card-background: transparent;
}

.cereon-card.card-bordered {
  --card-border: 2px solid var(--cereon-primary);
}
```

### Chart Card Styling

```css
.cereon-card-chart {
  /* Chart container */
  --chart-background: transparent;
  --chart-padding: 1rem;
  
  /* Legend */
  --chart-legend-font-size: var(--cereon-font-size-sm);
  --chart-legend-color: var(--cereon-on-surface);
  
  /* Tooltip */
  --chart-tooltip-background: rgba(0, 0, 0, 0.8);
  --chart-tooltip-color: white;
  --chart-tooltip-border-radius: var(--cereon-radius-sm);
}

.cereon-card-chart .chart-container {
  padding: var(--chart-padding);
  background: var(--chart-background);
}

/* Custom chart colors */
.cereon-card-chart.theme-brand {
  --chart-color-1: var(--cereon-primary);
  --chart-color-2: var(--cereon-accent);
  --chart-color-3: var(--cereon-success);
  --chart-color-4: var(--cereon-warning);
}
```

### Table Card Styling

```css
.cereon-card-table {
  /* Table */
  --table-border: 1px solid var(--cereon-border);
  --table-header-background: var(--cereon-surface-variant);
  --table-row-hover: var(--cereon-hover);
  
  /* Pagination */
  --pagination-button-size: 2rem;
  --pagination-gap: 0.5rem;
}

.cereon-table {
  width: 100%;
  border-collapse: collapse;
  border: var(--table-border);
}

.cereon-table th {
  background: var(--table-header-background);
  padding: 0.75rem;
  text-align: left;
  font-weight: var(--cereon-font-weight-semibold);
  border-bottom: var(--table-border);
}

.cereon-table td {
  padding: 0.75rem;
  border-bottom: var(--table-border);
}

.cereon-table tr:hover {
  background: var(--table-row-hover);
}

/* Striped rows */
.cereon-table.striped tr:nth-child(even) {
  background: var(--cereon-surface-variant);
}
```

### Number Card Styling

```css
.cereon-card-number {
  /* Layout */
  --number-align: center;
  --number-padding: 2rem;
  
  /* Value */
  --number-font-size: 2.5rem;
  --number-font-weight: var(--cereon-font-weight-bold);
  --number-color: var(--cereon-on-surface);
  
  /* Change indicator */
  --change-font-size: var(--cereon-font-size-sm);
  --change-positive-color: var(--cereon-success);
  --change-negative-color: var(--cereon-error);
  
  text-align: var(--number-align);
  padding: var(--number-padding);
}

.cereon-number-value {
  font-size: var(--number-font-size);
  font-weight: var(--number-font-weight);
  color: var(--number-color);
  line-height: 1.2;
}

.cereon-number-change {
  font-size: var(--change-font-size);
  margin-top: 0.5rem;
}

.cereon-number-change.positive {
  color: var(--change-positive-color);
}

.cereon-number-change.negative {
  color: var(--change-negative-color);
}

/* Number card variants */
.cereon-card-number.large {
  --number-font-size: 3.5rem;
  --number-padding: 3rem;
}

.cereon-card-number.compact {
  --number-font-size: 1.5rem;
  --number-padding: 1rem;
  --number-align: left;
}
```

## Responsive Design

Ensure themes work across different screen sizes and devices.

### Responsive Variables

```css
:root {
  /* Base spacing */
  --cereon-card-padding: 1rem;
  --cereon-card-margin: 0.5rem;
  --cereon-font-size-base: 0.875rem;
}

/* Tablet */
@media (min-width: 768px) {
  :root {
    --cereon-card-padding: 1.5rem;
    --cereon-card-margin: 1rem;
    --cereon-font-size-base: 1rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  :root {
    --cereon-card-padding: 2rem;
    --cereon-card-margin: 1.5rem;
  }
}

/* Large screens */
@media (min-width: 1440px) {
  :root {
    --cereon-card-padding: 2.5rem;
    --cereon-card-margin: 2rem;
  }
}
```

### Responsive Component Styles

```css
/* Mobile-first card styling */
.cereon-card {
  padding: 1rem;
  margin: 0.5rem;
}

@media (min-width: 768px) {
  .cereon-card {
    padding: 1.5rem;
    margin: 1rem;
  }
}

@media (min-width: 1024px) {
  .cereon-card {
    padding: 2rem;
    margin: 1.5rem;
  }
}

/* Responsive typography */
.cereon-card-title {
  font-size: 1.25rem;
}

@media (min-width: 768px) {
  .cereon-card-title {
    font-size: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .cereon-card-title {
    font-size: 1.75rem;
  }
}
```

## Dark Mode

Implement comprehensive dark mode support with automatic system detection.

### Dark Mode Configuration

```tsx
<DashboardProvider
  theme={{
    mode: 'auto', // Automatically detect system preference
    
    // Or explicitly set themes
    lightTheme: {
      colors: {
        background: '#ffffff',
        surface: '#f8fafc',
        onBackground: '#0f172a'
      }
    },
    
    darkTheme: {
      colors: {
        background: '#0f172a',
        surface: '#1e293b',
        onBackground: '#f1f5f9'
      }
    }
  }}
>
```

### Dark Mode CSS Variables

```css
:root {
  /* Light theme (default) */
  --cereon-background: #ffffff;
  --cereon-surface: #f8fafc;
  --cereon-on-background: #0f172a;
  --cereon-on-surface: #1e293b;
  --cereon-border: #e5e7eb;
}

[data-theme="dark"] {
  /* Dark theme overrides */
  --cereon-background: #0f172a;
  --cereon-surface: #1e293b;
  --cereon-on-background: #f1f5f9;
  --cereon-on-surface: #cbd5e1;
  --cereon-border: #334155;
}

/* Auto theme detection */
@media (prefers-color-scheme: dark) {
  :root[data-theme="auto"] {
    --cereon-background: #0f172a;
    --cereon-surface: #1e293b;
    --cereon-on-background: #f1f5f9;
    --cereon-on-surface: #cbd5e1;
    --cereon-border: #334155;
  }
}
```

### Theme Toggle Component

```tsx
import { useTheme } from '@cereon/dashboard'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  const toggleTheme = () => {
    setTheme(theme.mode === 'light' ? 'dark' : 'light')
  }
  
  return (
    <button onClick={toggleTheme}>
      {theme.mode === 'light' ? '🌙' : '☀️'}
    </button>
  )
}
```

## Animation Preferences

Respect user preferences for motion and animations.

### Animation Configuration

```tsx
<DashboardProvider
  theme={{
    animations: {
      enabled: true,
      respectMotionPreference: true, // Respect prefers-reduced-motion
      duration: 'normal', // 'fast' | 'normal' | 'slow'
      easing: 'ease-out'
    }
  }}
>
```

### Animation CSS

```css
:root {
  --cereon-duration-fast: 150ms;
  --cereon-duration-normal: 300ms;
  --cereon-duration-slow: 500ms;
  --cereon-easing: cubic-bezier(0, 0, 0.2, 1);
}

/* Respect motion preferences */
@media (prefers-reduced-motion: reduce) {
  :root {
    --cereon-duration-fast: 0ms;
    --cereon-duration-normal: 0ms;
    --cereon-duration-slow: 0ms;
  }
}

/* Component animations */
.cereon-card {
  transition: 
    transform var(--cereon-duration-normal) var(--cereon-easing),
    box-shadow var(--cereon-duration-normal) var(--cereon-easing);
}

.cereon-card:hover {
  transform: translateY(-2px);
}

/* Loading animations */
.cereon-loading {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
```

### Dynamic Animation Control

```tsx
import { useAnimations } from '@cereon/dashboard'

function AnimationSettings() {
  const { animations, updateAnimations } = useAnimations()
  
  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={animations.enabled}
          onChange={(e) => updateAnimations({ enabled: e.target.checked })}
        />
        Enable Animations
      </label>
      
      <select
        value={animations.duration}
        onChange={(e) => updateAnimations({ duration: e.target.value })}
      >
        <option value="fast">Fast</option>
        <option value="normal">Normal</option>
        <option value="slow">Slow</option>
      </select>
    </div>
  )
}
```

This comprehensive theming guide provides everything needed to create beautiful, consistent, and accessible dashboard themes that work across all devices and user preferences.