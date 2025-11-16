# API Reference

Complete API reference for all components, hooks, types, and utilities in @cereon/dashboard.

## Table of Contents

- [Components](#components)
- [Hooks](#hooks) 
- [Types](#types)
- [Utilities](#utilities)
- [Context Providers](#context-providers)

## Components

### Dashboard

The main dashboard component that renders reports and cards.

```tsx
interface DashboardProps<
  TCardSettings extends CardSettingsMap = CardSettingsMap,
  TCardRecords extends CardRecordMap = CardRecordMap
> {
  state: DashboardState<TCardSettings, TCardRecords>
  className?: string
  style?: React.CSSProperties
  onStateChange?: (state: DashboardState<TCardSettings, TCardRecords>) => void
  onCardClick?: (cardId: string, reportId: string) => void
  onLayoutChange?: (layout: Layout[], reportId: string) => void
}

function Dashboard<TCardSettings, TCardRecords>(
  props: DashboardProps<TCardSettings, TCardRecords>
): React.ReactElement
```

#### Props

- **`state`** - Dashboard state containing spec and runtime state
- **`className`** - Additional CSS class names
- **`style`** - Inline styles
- **`onStateChange`** - Callback when dashboard state changes
- **`onCardClick`** - Callback when a card is clicked
- **`onLayoutChange`** - Callback when layout changes (drag/resize)

#### Example

```tsx
import { Dashboard, DashboardSpec } from '@cereon/dashboard'

const spec: DashboardSpec = {
  id: 'my_dashboard',
  title: 'Analytics Dashboard',
  reports: [...]
}

function MyDashboard() {
  return (
    <Dashboard
      state={{ spec }}
      onCardClick={(cardId, reportId) => {
        console.log('Card clicked:', { cardId, reportId })
      }}
      onLayoutChange={(layout, reportId) => {
        console.log('Layout changed:', { layout, reportId })
      }}
    />
  )
}
```

### DashboardProvider

Context provider for dashboard configuration and theme.

```tsx
interface DashboardProviderProps {
  children: React.ReactNode
  theme?: Partial<ThemeConfig>
  settings?: Partial<DashboardSettings>
  middleware?: DashboardMiddleware
  plugins?: DashboardPlugin[]
  customCardTypes?: Record<string, CustomCardType>
}

function DashboardProvider(props: DashboardProviderProps): React.ReactElement
```

#### Props

- **`children`** - Child components
- **`theme`** - Theme configuration
- **`settings`** - Dashboard settings
- **`middleware`** - Request/response middleware
- **`plugins`** - Dashboard plugins
- **`customCardTypes`** - Custom card type definitions

#### Example

```tsx
import { DashboardProvider } from '@cereon/dashboard'

function App() {
  return (
    <DashboardProvider
      theme={{
        mode: 'dark',
        primaryColor: '#7c3aed'
      }}
      settings={{
        animations: { enabled: true },
        grid: { defaultCols: 12 }
      }}
    >
      <Dashboard state={{ spec }} />
    </DashboardProvider>
  )
}
```

### Card Components

Individual card components for different data types.

#### ChartCard

```tsx
interface ChartCardProps {
  data: ChartCardRecord
  settings?: ChartCardSettings
  onDataChange?: (data: ChartCardRecord) => void
  onSettingsChange?: (settings: ChartCardSettings) => void
}

function ChartCard(props: ChartCardProps): React.ReactElement
```

#### TableCard

```tsx
interface TableCardProps {
  data: TableCardRecord
  settings?: TableCardSettings
  onDataChange?: (data: TableCardRecord) => void
  onSettingsChange?: (settings: TableCardSettings) => void
  onRowClick?: (row: any, index: number) => void
  onSelectionChange?: (selectedRows: any[], selectedKeys: string[]) => void
}

function TableCard(props: TableCardProps): React.ReactElement
```

#### NumberCard

```tsx
interface NumberCardProps {
  data: NumberCardRecord
  settings?: NumberCardSettings
  onDataChange?: (data: NumberCardRecord) => void
  onSettingsChange?: (settings: NumberCardSettings) => void
}

function NumberCard(props: NumberCardProps): React.ReactElement
```

#### MarkdownCard

```tsx
interface MarkdownCardProps {
  data: MarkdownCardRecord
  settings?: MarkdownCardSettings
  onDataChange?: (data: MarkdownCardRecord) => void
  onSettingsChange?: (settings: MarkdownCardSettings) => void
}

function MarkdownCard(props: MarkdownCardProps): React.ReactElement
```

#### HTMLCard

```tsx
interface HTMLCardProps {
  data: HTMLCardRecord
  settings?: HTMLCardSettings
  onDataChange?: (data: HTMLCardRecord) => void
  onSettingsChange?: (settings: HTMLCardSettings) => void
}

function HTMLCard(props: HTMLCardProps): React.ReactElement
```

#### IframeCard

```tsx
interface IframeCardProps {
  data: IframeCardRecord
  settings?: IframeCardSettings
  onDataChange?: (data: IframeCardRecord) => void
  onSettingsChange?: (settings: IframeCardSettings) => void
}

function IframeCard(props: IframeCardProps): React.ReactElement
```

## Hooks

### useDashboard

Access dashboard state and methods.

```tsx
interface DashboardContextValue<
  TCardSettings extends CardSettingsMap = CardSettingsMap,
  TCardRecords extends CardRecordMap = CardRecordMap
> {
  // State
  spec: DashboardSpec<TCardSettings, TCardRecords> | null
  reportStates: Record<string, ReportState>
  currentReportId: string | null
  
  // Actions
  setSpec: (spec: DashboardSpec<TCardSettings, TCardRecords>) => void
  setCurrentReport: (reportId: string) => void
  updateReportState: (reportId: string, state: Partial<ReportState>) => void
  
  // Queries
  executeQuery: (cardId: string, reportId: string) => Promise<void>
  refreshCard: (cardId: string, reportId: string) => Promise<void>
  refreshReport: (reportId: string) => Promise<void>
  refreshAll: () => Promise<void>
  
  // Layout
  updateLayout: (reportId: string, layout: Layout[]) => void
  resetLayout: (reportId: string) => void
  
  // Settings
  updateSettings: (settings: Partial<DashboardSettings>) => void
}

function useDashboard<TCardSettings, TCardRecords>(): DashboardContextValue<TCardSettings, TCardRecords>
```

#### Example

```tsx
import { useDashboard } from '@cereon/dashboard'

function DashboardControls() {
  const { 
    spec, 
    currentReportId, 
    setCurrentReport, 
    refreshAll 
  } = useDashboard()
  
  return (
    <div>
      <h2>{spec?.title}</h2>
      <button onClick={() => refreshAll()}>
        Refresh All
      </button>
      {spec?.reports.map(report => (
        <button 
          key={report.id}
          onClick={() => setCurrentReport(report.id)}
          disabled={currentReportId === report.id}
        >
          {report.title}
        </button>
      ))}
    </div>
  )
}
```

### useTheme

Access and modify theme configuration.

```tsx
interface ThemeContextValue {
  theme: ThemeConfig
  setTheme: (theme: Partial<ThemeConfig>) => void
  toggleMode: () => void
  updateColors: (colors: Partial<ThemeColors>) => void
}

function useTheme(): ThemeContextValue
```

#### Example

```tsx
import { useTheme } from '@cereon/dashboard'

function ThemeControls() {
  const { theme, setTheme, toggleMode } = useTheme()
  
  return (
    <div>
      <button onClick={toggleMode}>
        Switch to {theme.mode === 'light' ? 'Dark' : 'Light'} Mode
      </button>
      
      <input
        type="color"
        value={theme.colors.primary}
        onChange={(e) => setTheme({
          colors: { primary: e.target.value }
        })}
      />
    </div>
  )
}
```

### useCard

Access card state and methods within a card component.

```tsx
interface CardContextValue {
  cardId: string
  reportId: string
  data: CardRecord | null
  settings: CardSettings
  loading: boolean
  error: Error | null
  
  // Actions
  refresh: () => Promise<void>
  updateData: (data: CardRecord) => void
  updateSettings: (settings: Partial<CardSettings>) => void
}

function useCard(): CardContextValue
```

#### Example

```tsx
import { useCard } from '@cereon/dashboard'

function CustomCardComponent() {
  const { 
    cardId, 
    data, 
    loading, 
    error, 
    refresh 
  } = useCard()
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return (
    <div>
      <h3>Card: {cardId}</h3>
      <button onClick={refresh}>Refresh</button>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
```

### useQuery

Execute and manage card queries.

```tsx
interface QueryResult<T = any> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  cancel: () => void
}

interface QueryOptions {
  enabled?: boolean
  refetchInterval?: number
  refetchOnWindowFocus?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

function useQuery<T = any>(
  query: QueryConfig,
  options?: QueryOptions
): QueryResult<T>
```

#### Example

```tsx
import { useQuery } from '@cereon/dashboard'

function DataCard() {
  const { data, loading, error, refetch } = useQuery({
    variant: 'http',
    payload: {
      url: '/api/data',
      method: 'GET'
    }
  }, {
    refetchInterval: 30000, // Refetch every 30 seconds
    onError: (error) => console.error('Query failed:', error)
  })
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
```

### useLayout

Manage grid layout state.

```tsx
interface LayoutContextValue {
  layouts: Record<string, Layout[]>
  updateLayout: (reportId: string, layout: Layout[]) => void
  resetLayout: (reportId: string) => void
  exportLayouts: () => Record<string, Layout[]>
  importLayouts: (layouts: Record<string, Layout[]>) => void
}

function useLayout(): LayoutContextValue
```

#### Example

```tsx
import { useLayout } from '@cereon/dashboard'

function LayoutControls() {
  const { layouts, resetLayout, exportLayouts } = useLayout()
  
  const handleExport = () => {
    const exported = exportLayouts()
    console.log('Exported layouts:', exported)
    // Save to localStorage, send to server, etc.
  }
  
  return (
    <div>
      <button onClick={() => resetLayout('overview')}>
        Reset Overview Layout
      </button>
      <button onClick={handleExport}>
        Export Layouts
      </button>
    </div>
  )
}
```

## Types

### Core Types

#### DashboardSpec

```tsx
interface DashboardSpec<
  TCardSettings extends CardSettingsMap = CardSettingsMap,
  TCardRecords extends CardRecordMap = CardRecordMap
> {
  id: string
  title?: string
  description?: string
  version?: string
  tags?: string[]
  metadata?: Record<string, any>
  
  reports: ReportSpec<TCardSettings, TCardRecords>[]
  
  // Optional configuration
  layout?: Partial<GridLayoutConfig>
  theme?: Partial<ThemeConfig>
  refresh?: RefreshConfig
}
```

#### ReportSpec

```tsx
interface ReportSpec<
  TCardSettings extends CardSettingsMap = CardSettingsMap,
  TCardRecords extends CardRecordMap = CardRecordMap
> {
  id: string
  title: string
  description?: string
  icon?: string
  order?: number
  
  reportCards: CardSpec<TCardSettings, TCardRecords>[]
  
  // Optional configuration
  visible?: boolean
  permissions?: PermissionsConfig
  layout?: Partial<GridLayoutConfig>
  refresh?: RefreshConfig
  filters?: FilterConfig[]
  export?: ExportConfig
}
```

#### CardSpec

```tsx
interface CardSpec<
  TCardSettings extends CardSettingsMap = CardSettingsMap,
  TCardRecords extends CardRecordMap = CardRecordMap
> {
  id: string
  kind: CardKind
  title?: string
  description?: string
  icon?: string
  
  query: QueryConfig
  settings?: TCardSettings[CardKind]
  
  // Optional configuration
  visible?: boolean
  permissions?: PermissionsConfig
  className?: string
  style?: React.CSSProperties
}
```

### Card Types

#### CardKind

```tsx
type CardKind = 
  | 'chart' 
  | 'table' 
  | 'number' 
  | 'markdown' 
  | 'html' 
  | 'iframe'
```

#### CardRecord

```tsx
interface BaseCardRecord {
  kind: CardKind
  cardId: string
  reportId: string
  timestamp?: string
  metadata?: Record<string, any>
}

interface ChartCardRecord extends BaseCardRecord {
  kind: 'chart'
  data: ChartData
}

interface TableCardRecord extends BaseCardRecord {
  kind: 'table'
  data: TableData
}

interface NumberCardRecord extends BaseCardRecord {
  kind: 'number'
  data: NumberData
}

interface MarkdownCardRecord extends BaseCardRecord {
  kind: 'markdown'
  data: MarkdownData
}

interface HTMLCardRecord extends BaseCardRecord {
  kind: 'html'
  data: HTMLData
}

interface IframeCardRecord extends BaseCardRecord {
  kind: 'iframe'
  data: IframeData
}

type CardRecord = 
  | ChartCardRecord 
  | TableCardRecord 
  | NumberCardRecord 
  | MarkdownCardRecord 
  | HTMLCardRecord 
  | IframeCardRecord
```

### Query Types

#### QueryConfig

```tsx
interface BaseQueryConfig {
  variant: QueryVariant
  timeout?: number
  retry?: RetryConfig
}

interface HTTPQueryConfig extends BaseQueryConfig {
  variant: 'http'
  payload: HTTPPayload
}

interface WebSocketQueryConfig extends BaseQueryConfig {
  variant: 'websocket'
  payload: WebSocketPayload
}

interface StreamingHTTPQueryConfig extends BaseQueryConfig {
  variant: 'streaming-http'
  payload: StreamingHTTPPayload
}

interface CustomQueryConfig extends BaseQueryConfig {
  variant: 'custom'
  payload: CustomPayload
}

type QueryConfig = 
  | HTTPQueryConfig 
  | WebSocketQueryConfig 
  | StreamingHTTPQueryConfig 
  | CustomQueryConfig
```

#### HTTPPayload

```tsx
interface HTTPPayload {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  params?: Record<string, any>
  body?: any
  
  // Advanced options
  timeout?: number
  retry?: RetryConfig
  poll?: PollConfig
}
```

#### WebSocketPayload

```tsx
interface WebSocketPayload {
  url: string
  protocols?: string[]
  headers?: Record<string, string>
  
  subscribe_message?: any
  unsubscribe_message?: any
  
  // Connection management
  reconnect?: ReconnectConfig
  heartbeat?: HeartbeatConfig
}
```

### Settings Types

#### CardSettingsMap

```tsx
interface CardSettingsMap {
  chart: ChartCardSettings
  table: TableCardSettings
  number: NumberCardSettings
  markdown: MarkdownCardSettings
  html: HTMLCardSettings
  iframe: IframeCardSettings
}
```

#### ChartCardSettings

```tsx
interface ChartCardSettings extends BaseCardSettings {
  chartType?: ChartType
  enableDownload?: boolean
  showLegend?: boolean
  chartOptions?: any // Chart.js options
}
```

#### TableCardSettings

```tsx
interface TableCardSettings extends BaseCardSettings {
  pagination?: boolean
  pageSize?: number
  sortable?: boolean
  filterable?: boolean
  selectable?: boolean
  enableDownload?: boolean
  
  columns?: ColumnConfig[]
  rowActions?: RowAction[]
}
```

#### NumberCardSettings

```tsx
interface NumberCardSettings extends BaseCardSettings {
  unit?: string
  precision?: number
  showTrend?: boolean
  showProgress?: boolean
  target?: number
  thresholds?: ThresholdConfig
}
```

### Theme Types

#### ThemeConfig

```tsx
interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto'
  variant: 'default' | 'minimal' | 'corporate' | 'custom'
  
  colors: ThemeColors
  typography: ThemeTypography
  spacing: ThemeSpacing
  borderRadius: ThemeBorderRadius
  shadows: ThemeShadows
  animations: ThemeAnimations
}
```

#### ThemeColors

```tsx
interface ThemeColors {
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
  
  // Borders and outlines
  border: string
  outline: string
  
  // Interactive states
  hover: string
  active: string
  focus: string
  disabled: string
}
```

## Utilities

### formatNumber

Format numbers with various options.

```tsx
interface NumberFormatOptions {
  style?: 'decimal' | 'currency' | 'percent'
  currency?: string
  locale?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  notation?: 'standard' | 'scientific' | 'engineering' | 'compact'
}

function formatNumber(
  value: number, 
  options?: NumberFormatOptions
): string
```

#### Example

```tsx
import { formatNumber } from '@cereon/dashboard'

console.log(formatNumber(1234567.89)) // "1,234,567.89"
console.log(formatNumber(1234567.89, { 
  style: 'currency', 
  currency: 'USD' 
})) // "$1,234,567.89"
console.log(formatNumber(0.1234, { 
  style: 'percent' 
})) // "12.34%"
console.log(formatNumber(1234567, { 
  notation: 'compact' 
})) // "1.2M"
```

### formatDate

Format dates with various options.

```tsx
interface DateFormatOptions {
  style?: 'full' | 'long' | 'medium' | 'short'
  dateStyle?: 'full' | 'long' | 'medium' | 'short'
  timeStyle?: 'full' | 'long' | 'medium' | 'short'
  locale?: string
  timeZone?: string
  relative?: boolean
}

function formatDate(
  date: Date | string | number,
  options?: DateFormatOptions
): string
```

#### Example

```tsx
import { formatDate } from '@cereon/dashboard'

const date = new Date('2024-01-15T10:30:00Z')

console.log(formatDate(date)) // "Jan 15, 2024"
console.log(formatDate(date, { 
  dateStyle: 'full' 
})) // "Monday, January 15, 2024"
console.log(formatDate(date, { 
  relative: true 
})) // "2 days ago" (if today is Jan 17)
```

### validateDashboardSpec

Validate dashboard specification.

```tsx
interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

interface ValidationError {
  path: string
  message: string
  code: string
}

function validateDashboardSpec(
  spec: unknown
): ValidationResult
```

#### Example

```tsx
import { validateDashboardSpec } from '@cereon/dashboard'

const result = validateDashboardSpec({
  id: 'test',
  reports: [{
    id: 'report1',
    reportCards: [{
      id: 'card1',
      kind: 'chart',
      query: {
        variant: 'http',
        payload: { url: '/api/data' }
      }
    }]
  }]
})

if (!result.valid) {
  console.error('Validation errors:', result.errors)
}
```

### generateId

Generate unique identifiers.

```tsx
function generateId(prefix?: string): string
```

#### Example

```tsx
import { generateId } from '@cereon/dashboard'

console.log(generateId()) // "abc123def456"
console.log(generateId('card')) // "card_abc123def456"
```

## Context Providers

### DashboardProvider

Main provider for dashboard functionality.

```tsx
interface DashboardProviderProps {
  children: React.ReactNode
  theme?: Partial<ThemeConfig>
  settings?: Partial<DashboardSettings>
  middleware?: DashboardMiddleware
  plugins?: DashboardPlugin[]
  customCardTypes?: Record<string, CustomCardType>
}
```

### ThemeProvider

Provider for theme configuration (used internally by DashboardProvider).

```tsx
interface ThemeProviderProps {
  children: React.ReactNode
  theme: ThemeConfig
  onThemeChange?: (theme: ThemeConfig) => void
}
```

### QueryProvider

Provider for query management (used internally by DashboardProvider).

```tsx
interface QueryProviderProps {
  children: React.ReactNode
  middleware?: QueryMiddleware
  defaultOptions?: QueryOptions
}
```

This API reference provides comprehensive documentation for all public APIs in the @cereon/dashboard package. For implementation examples, see the [examples](examples/) directory.