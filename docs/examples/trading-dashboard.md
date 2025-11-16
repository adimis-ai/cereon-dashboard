# Trading Dashboard Example

Complete implementation of a real-time trading dashboard showcasing advanced features of @cereon/dashboard.

## Overview

This example demonstrates a comprehensive trading dashboard with:
- **Real-time market data** via WebSocket
- **Interactive charts** with technical indicators
- **Portfolio tracking** with live P&L calculations  
- **Trading interface** with order management
- **Risk management** displays and alerts
- **Multi-timeframe analysis** across different periods

## Dashboard Configuration

### Complete Spec Definition

```tsx
// TradingDashboard.tsx
import React from 'react'
import { Dashboard, DashboardSpec } from '@cereon/dashboard'

const tradingDashboardSpec: DashboardSpec = {
  id: 'trading_dashboard',
  title: 'Trading Dashboard',
  description: 'Real-time trading analytics and portfolio management',
  
  // Dashboard-level configuration
  layout: {
    cols: { lg: 24, md: 20, sm: 12, xs: 8, xxs: 4 },
    rowHeight: 40,
    margin: [8, 8],
    breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }
  },
  
  refresh: {
    enabled: true,
    interval: 1000, // 1 second updates
    showLastUpdated: true
  },
  
  reports: [
    {
      id: 'overview',
      title: 'Market Overview',
      icon: 'chart-line',
      reportCards: [
        // Market Status
        {
          id: 'market_status',
          kind: 'markdown',
          title: 'Market Status',
          query: {
            variant: 'websocket',
            payload: {
              url: 'ws://localhost:8000/market-status',
              subscribe_message: { type: 'subscribe', channel: 'market_status' }
            }
          },
          settings: {
            gridPosition: { x: 0, y: 0, w: 6, h: 4 }
          }
        },

        // Market Indices
        {
          id: 'market_indices',
          kind: 'table',
          title: 'Major Indices',
          query: {
            variant: 'streaming-http',
            payload: {
              url: '/api/market/indices/stream',
              parser: 'server-sent-events'
            }
          },
          settings: {
            gridPosition: { x: 6, y: 0, w: 9, h: 8 },
            pagination: false,
            sortable: true,
            columns: [
              { 
                key: 'symbol', 
                title: 'Index', 
                type: 'string',
                width: 100
              },
              { 
                key: 'price', 
                title: 'Price', 
                type: 'currency',
                formatter: (value) => `$${value.toFixed(2)}`
              },
              { 
                key: 'change', 
                title: 'Change', 
                type: 'number',
                formatter: (value) => `${value > 0 ? '+' : ''}${value.toFixed(2)}`
              },
              { 
                key: 'changePercent', 
                title: 'Change %', 
                type: 'badge',
                renderer: (value) => (
                  <span className={value >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {value >= 0 ? '+' : ''}{value.toFixed(2)}%
                  </span>
                )
              }
            ]
          }
        },

        // Market Heatmap
        {
          id: 'sector_heatmap',
          kind: 'html',
          title: 'Sector Performance Heatmap',
          query: {
            variant: 'http',
            payload: {
              url: '/api/market/sectors/heatmap',
              method: 'GET'
            }
          },
          settings: {
            gridPosition: { x: 15, y: 0, w: 9, h: 8 },
            sanitize: true,
            allowedTags: ['div', 'span', 'svg', 'rect', 'text']
          }
        },

        // Top Movers
        {
          id: 'top_movers',
          kind: 'table',
          title: 'Top Movers',
          query: {
            variant: 'websocket',
            payload: {
              url: 'ws://localhost:8000/top-movers',
              subscribe_message: { type: 'subscribe', channel: 'top_movers' }
            }
          },
          settings: {
            gridPosition: { x: 0, y: 4, w: 6, h: 8 },
            pageSize: 10,
            columns: [
              { key: 'symbol', title: 'Symbol', type: 'string' },
              { key: 'price', title: 'Price', type: 'currency' },
              { 
                key: 'changePercent', 
                title: 'Change %', 
                type: 'progress',
                renderer: (value) => (
                  <div className="flex items-center">
                    <div 
                      className={`w-full h-2 rounded ${
                        value >= 0 ? 'bg-green-200' : 'bg-red-200'
                      }`}
                    >
                      <div 
                        className={`h-full rounded ${
                          value >= 0 ? 'bg-green-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${Math.min(Math.abs(value), 100)}%` }}
                      />
                    </div>
                    <span className="ml-2 text-sm">
                      {value >= 0 ? '+' : ''}{value.toFixed(2)}%
                    </span>
                  </div>
                )
              }
            ]
          }
        },

        // Market News
        {
          id: 'market_news',
          kind: 'table',
          title: 'Latest News',
          query: {
            variant: 'http',
            payload: {
              url: '/api/news/market',
              method: 'GET',
              poll: { enabled: true, interval: 30000 }
            }
          },
          settings: {
            gridPosition: { x: 6, y: 8, w: 18, h: 6 },
            pagination: true,
            pageSize: 5,
            columns: [
              { 
                key: 'timestamp', 
                title: 'Time', 
                type: 'date',
                width: 120,
                formatter: (value) => new Date(value).toLocaleTimeString()
              },
              { key: 'title', title: 'Headline', type: 'string' },
              { 
                key: 'source', 
                title: 'Source', 
                type: 'badge',
                width: 100
              },
              { 
                key: 'sentiment', 
                title: 'Sentiment', 
                type: 'badge',
                width: 100,
                renderer: (value) => (
                  <span className={`
                    px-2 py-1 rounded text-xs
                    ${value === 'positive' ? 'bg-green-100 text-green-800' : ''}
                    ${value === 'negative' ? 'bg-red-100 text-red-800' : ''}
                    ${value === 'neutral' ? 'bg-gray-100 text-gray-800' : ''}
                  `}>
                    {value}
                  </span>
                )
              }
            ]
          }
        }
      ]
    },

    {
      id: 'portfolio',
      title: 'Portfolio',
      icon: 'wallet',
      reportCards: [
        // Portfolio Summary
        {
          id: 'portfolio_value',
          kind: 'number',
          title: 'Portfolio Value',
          query: {
            variant: 'websocket',
            payload: {
              url: 'ws://localhost:8000/portfolio/value',
              subscribe_message: { type: 'subscribe', channel: 'portfolio_value' }
            }
          },
          settings: {
            gridPosition: { x: 0, y: 0, w: 6, h: 4 },
            unit: '$',
            precision: 2,
            showTrend: true,
            animateOnChange: true
          }
        },

        {
          id: 'daily_pnl',
          kind: 'number',
          title: 'Daily P&L',
          query: {
            variant: 'websocket',
            payload: {
              url: 'ws://localhost:8000/portfolio/pnl',
              subscribe_message: { type: 'subscribe', channel: 'daily_pnl' }
            }
          },
          settings: {
            gridPosition: { x: 6, y: 0, w: 6, h: 4 },
            unit: '$',
            precision: 2,
            showTrend: true,
            thresholds: {
              good: 0,     // Green above 0
              warning: -1000, // Yellow above -1000
              // Red below -1000
            }
          }
        },

        {
          id: 'total_return',
          kind: 'number',
          title: 'Total Return',
          query: {
            variant: 'websocket',
            payload: {
              url: 'ws://localhost:8000/portfolio/return',
              subscribe_message: { type: 'subscribe', channel: 'total_return' }
            }
          },
          settings: {
            gridPosition: { x: 12, y: 0, w: 6, h: 4 },
            unit: '%',
            precision: 2,
            showTrend: true
          }
        },

        {
          id: 'cash_balance',
          kind: 'number',
          title: 'Cash Balance',
          query: {
            variant: 'http',
            payload: {
              url: '/api/portfolio/cash',
              method: 'GET'
            }
          },
          settings: {
            gridPosition: { x: 18, y: 0, w: 6, h: 4 },
            unit: '$',
            precision: 2
          }
        },

        // Portfolio Allocation Chart
        {
          id: 'portfolio_allocation',
          kind: 'chart',
          title: 'Asset Allocation',
          query: {
            variant: 'http',
            payload: {
              url: '/api/portfolio/allocation',
              method: 'GET'
            }
          },
          settings: {
            gridPosition: { x: 0, y: 4, w: 12, h: 8 },
            chartType: 'doughnut',
            enableDownload: true,
            chartOptions: {
              plugins: {
                legend: { position: 'right' },
                tooltip: {
                  callbacks: {
                    label: (context) => `${context.label}: $${context.parsed.toLocaleString()}`
                  }
                }
              }
            }
          }
        },

        // Holdings Table
        {
          id: 'portfolio_holdings',
          kind: 'table',
          title: 'Holdings',
          query: {
            variant: 'websocket',
            payload: {
              url: 'ws://localhost:8000/portfolio/holdings',
              subscribe_message: { type: 'subscribe', channel: 'holdings' }
            }
          },
          settings: {
            gridPosition: { x: 12, y: 4, w: 12, h: 12 },
            sortable: true,
            enableDownload: true,
            columns: [
              { key: 'symbol', title: 'Symbol', type: 'string', width: 80 },
              { key: 'quantity', title: 'Shares', type: 'number' },
              { 
                key: 'avgPrice', 
                title: 'Avg Price', 
                type: 'currency',
                formatter: (value) => `$${value.toFixed(2)}`
              },
              { 
                key: 'currentPrice', 
                title: 'Current', 
                type: 'currency',
                formatter: (value) => `$${value.toFixed(2)}`
              },
              { 
                key: 'marketValue', 
                title: 'Market Value', 
                type: 'currency',
                formatter: (value) => `$${value.toLocaleString()}`
              },
              { 
                key: 'unrealizedPnL', 
                title: 'Unrealized P&L', 
                type: 'currency',
                renderer: (value) => (
                  <span className={value >= 0 ? 'text-green-600' : 'text-red-600'}>
                    ${value.toLocaleString()}
                  </span>
                )
              },
              { 
                key: 'unrealizedPercent', 
                title: 'Return %', 
                type: 'badge',
                renderer: (value) => (
                  <span className={`
                    px-2 py-1 rounded text-xs font-semibold
                    ${value >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                  `}>
                    {value >= 0 ? '+' : ''}{value.toFixed(2)}%
                  </span>
                )
              }
            ]
          }
        },

        // Performance Chart
        {
          id: 'portfolio_performance',
          kind: 'chart',
          title: 'Portfolio Performance',
          query: {
            variant: 'http',
            payload: {
              url: '/api/portfolio/performance',
              method: 'GET',
              params: { period: '1Y' }
            }
          },
          settings: {
            gridPosition: { x: 0, y: 12, w: 12, h: 8 },
            chartType: 'line',
            enableDownload: true,
            chartOptions: {
              scales: {
                x: {
                  type: 'time',
                  time: { unit: 'month' }
                },
                y: {
                  beginAtZero: false,
                  ticks: {
                    callback: (value) => `$${value.toLocaleString()}`
                  }
                }
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    title: (context) => new Date(context[0].parsed.x).toLocaleDateString(),
                    label: (context) => `Portfolio Value: $${context.parsed.y.toLocaleString()}`
                  }
                }
              }
            }
          }
        }
      ]
    },

    {
      id: 'trading',
      title: 'Trading',
      icon: 'trending-up',
      reportCards: [
        // Trading Interface
        {
          id: 'trading_interface',
          kind: 'html',
          title: 'Quick Trade',
          query: {
            variant: 'custom',
            payload: {
              handler: () => [{
                kind: 'html',
                cardId: 'trading_interface',
                reportId: 'trading',
                data: {
                  content: `
                    <div id="trading-interface" class="p-4">
                      <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label class="block text-sm font-medium mb-1">Symbol</label>
                          <input type="text" id="symbol" class="w-full p-2 border rounded" placeholder="AAPL">
                        </div>
                        <div>
                          <label class="block text-sm font-medium mb-1">Quantity</label>
                          <input type="number" id="quantity" class="w-full p-2 border rounded" placeholder="100">
                        </div>
                      </div>
                      
                      <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label class="block text-sm font-medium mb-1">Order Type</label>
                          <select id="orderType" class="w-full p-2 border rounded">
                            <option value="market">Market</option>
                            <option value="limit">Limit</option>
                            <option value="stop">Stop Loss</option>
                          </select>
                        </div>
                        <div>
                          <label class="block text-sm font-medium mb-1">Price</label>
                          <input type="number" id="price" class="w-full p-2 border rounded" placeholder="150.00" step="0.01">
                        </div>
                      </div>
                      
                      <div class="flex gap-2">
                        <button 
                          onclick="submitOrder('buy')" 
                          class="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                        >
                          BUY
                        </button>
                        <button 
                          onclick="submitOrder('sell')" 
                          class="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                        >
                          SELL
                        </button>
                      </div>
                    </div>
                    
                    <script>
                      function submitOrder(side) {
                        const order = {
                          symbol: document.getElementById('symbol').value,
                          quantity: document.getElementById('quantity').value,
                          orderType: document.getElementById('orderType').value,
                          price: document.getElementById('price').value,
                          side: side
                        };
                        
                        fetch('/api/orders', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(order)
                        }).then(response => {
                          if (response.ok) {
                            alert('Order submitted successfully!');
                            // Refresh orders table
                            window.dashboardRefresh('open_orders');
                          } else {
                            alert('Order failed!');
                          }
                        });
                      }
                    </script>
                  `
                }
              }]
            }
          },
          settings: {
            gridPosition: { x: 0, y: 0, w: 8, h: 8 },
            sanitize: false,  // Allow scripts for trading interface
            allowedTags: ['div', 'input', 'button', 'select', 'option', 'label', 'script']
          }
        },

        // Market Data
        {
          id: 'market_data',
          kind: 'table',
          title: 'Level 2 Data',
          query: {
            variant: 'websocket',
            payload: {
              url: 'ws://localhost:8000/market-data',
              subscribe_message: { 
                type: 'subscribe', 
                channel: 'level2',
                symbol: 'AAPL'  // Default symbol
              }
            }
          },
          settings: {
            gridPosition: { x: 8, y: 0, w: 8, h: 12 },
            pagination: false,
            sortable: false,
            columns: [
              { key: 'side', title: 'Side', type: 'badge', width: 60 },
              { 
                key: 'price', 
                title: 'Price', 
                type: 'currency',
                formatter: (value) => `$${value.toFixed(2)}`
              },
              { key: 'size', title: 'Size', type: 'number' },
              { key: 'orders', title: 'Orders', type: 'number' }
            ]
          }
        },

        // Price Chart with Technical Indicators
        {
          id: 'price_chart',
          kind: 'chart',
          title: 'AAPL - 5 Min Chart',
          query: {
            variant: 'websocket',
            payload: {
              url: 'ws://localhost:8000/price-data',
              subscribe_message: { 
                type: 'subscribe', 
                channel: 'ohlc',
                symbol: 'AAPL',
                interval: '5min'
              }
            }
          },
          settings: {
            gridPosition: { x: 16, y: 0, w: 8, h: 12 },
            chartType: 'line',
            enableDownload: true,
            chartOptions: {
              scales: {
                x: {
                  type: 'time',
                  time: { unit: 'minute' }
                },
                y: {
                  position: 'right',
                  ticks: {
                    callback: (value) => `$${value.toFixed(2)}`
                  }
                }
              },
              plugins: {
                legend: { display: false },
                tooltip: {
                  mode: 'index',
                  intersect: false,
                  callbacks: {
                    title: (context) => new Date(context[0].parsed.x).toLocaleString(),
                    label: (context) => `Price: $${context.parsed.y.toFixed(2)}`
                  }
                }
              },
              interaction: {
                intersect: false,
                mode: 'index'
              }
            }
          }
        },

        // Open Orders
        {
          id: 'open_orders',
          kind: 'table',
          title: 'Open Orders',
          query: {
            variant: 'websocket',
            payload: {
              url: 'ws://localhost:8000/orders',
              subscribe_message: { type: 'subscribe', channel: 'open_orders' }
            }
          },
          settings: {
            gridPosition: { x: 0, y: 8, w: 16, h: 8 },
            sortable: true,
            enableDownload: true,
            rowActions: [
              {
                label: 'Cancel',
                icon: 'x',
                variant: 'destructive',
                onClick: (row) => cancelOrder(row.orderId),
                confirm: {
                  title: 'Cancel Order',
                  message: 'Are you sure you want to cancel this order?'
                }
              },
              {
                label: 'Modify',
                icon: 'edit',
                onClick: (row) => openModifyDialog(row)
              }
            ],
            columns: [
              { key: 'orderId', title: 'Order ID', type: 'string', width: 120 },
              { key: 'symbol', title: 'Symbol', type: 'string', width: 80 },
              { 
                key: 'side', 
                title: 'Side', 
                type: 'badge',
                width: 60,
                renderer: (value) => (
                  <span className={`
                    px-2 py-1 rounded text-xs font-semibold
                    ${value === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                  `}>
                    {value.toUpperCase()}
                  </span>
                )
              },
              { key: 'quantity', title: 'Quantity', type: 'number' },
              { key: 'filled', title: 'Filled', type: 'number' },
              { 
                key: 'price', 
                title: 'Price', 
                type: 'currency',
                formatter: (value) => `$${value.toFixed(2)}`
              },
              { key: 'type', title: 'Type', type: 'string' },
              { 
                key: 'status', 
                title: 'Status', 
                type: 'badge',
                renderer: (value) => (
                  <span className={`
                    px-2 py-1 rounded text-xs
                    ${value === 'open' ? 'bg-blue-100 text-blue-800' : ''}
                    ${value === 'partial' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${value === 'filled' ? 'bg-green-100 text-green-800' : ''}
                    ${value === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {value.toUpperCase()}
                  </span>
                )
              },
              { 
                key: 'timestamp', 
                title: 'Time', 
                type: 'date',
                formatter: (value) => new Date(value).toLocaleString()
              }
            ]
          }
        }
      ]
    },

    {
      id: 'analytics',
      title: 'Analytics',
      icon: 'bar-chart-2',
      reportCards: [
        // Risk Metrics
        {
          id: 'portfolio_beta',
          kind: 'number',
          title: 'Portfolio Beta',
          query: {
            variant: 'http',
            payload: {
              url: '/api/analytics/beta',
              method: 'GET'
            }
          },
          settings: {
            gridPosition: { x: 0, y: 0, w: 4, h: 3 },
            precision: 2,
            thresholds: {
              good: 1.2,     // Low risk
              warning: 1.5,  // Medium risk
              // High risk above 1.5
            }
          }
        },

        {
          id: 'sharpe_ratio',
          kind: 'number',
          title: 'Sharpe Ratio',
          query: {
            variant: 'http',
            payload: {
              url: '/api/analytics/sharpe',
              method: 'GET'
            }
          },
          settings: {
            gridPosition: { x: 4, y: 0, w: 4, h: 3 },
            precision: 2,
            thresholds: {
              good: 1.0,     // Good performance
              warning: 0.5,  // Fair performance
              // Poor performance below 0.5
            }
          }
        },

        {
          id: 'max_drawdown',
          kind: 'number',
          title: 'Max Drawdown',
          query: {
            variant: 'http',
            payload: {
              url: '/api/analytics/drawdown',
              method: 'GET'
            }
          },
          settings: {
            gridPosition: { x: 8, y: 0, w: 4, h: 3 },
            unit: '%',
            precision: 2,
            thresholds: {
              good: -5,      // Low drawdown
              warning: -15,  // Moderate drawdown
              // High drawdown below -15%
            }
          }
        },

        {
          id: 'var_95',
          kind: 'number',
          title: '95% VaR (1 Day)',
          query: {
            variant: 'http',
            payload: {
              url: '/api/analytics/var',
              method: 'GET',
              params: { confidence: 0.95, horizon: 1 }
            }
          },
          settings: {
            gridPosition: { x: 12, y: 0, w: 4, h: 3 },
            unit: '$',
            precision: 0,
            thresholds: {
              good: -1000,    // Low risk
              warning: -5000, // Moderate risk
              // High risk below -5000
            }
          }
        },

        // Sector Exposure
        {
          id: 'sector_exposure',
          kind: 'chart',
          title: 'Sector Exposure',
          query: {
            variant: 'http',
            payload: {
              url: '/api/analytics/sectors',
              method: 'GET'
            }
          },
          settings: {
            gridPosition: { x: 16, y: 0, w: 8, h: 8 },
            chartType: 'bar',
            enableDownload: true,
            chartOptions: {
              indexAxis: 'y',
              scales: {
                x: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => `${value}%`
                  }
                }
              },
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (context) => `${context.parsed.x.toFixed(1)}%`
                  }
                }
              }
            }
          }
        },

        // Correlation Heatmap
        {
          id: 'correlation_heatmap',
          kind: 'html',
          title: 'Asset Correlation Matrix',
          query: {
            variant: 'http',
            payload: {
              url: '/api/analytics/correlation',
              method: 'GET'
            }
          },
          settings: {
            gridPosition: { x: 0, y: 3, w: 16, h: 10 },
            sanitize: true
          }
        },

        // Performance Attribution
        {
          id: 'performance_attribution',
          kind: 'chart',
          title: 'Performance Attribution',
          query: {
            variant: 'http',
            payload: {
              url: '/api/analytics/attribution',
              method: 'GET'
            }
          },
          settings: {
            gridPosition: { x: 0, y: 13, w: 24, h: 8 },
            chartType: 'bar',
            enableDownload: true,
            chartOptions: {
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => `${value}%`
                  }
                }
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`
                  }
                }
              }
            }
          }
        }
      ]
    }
  ]
}

// Helper functions for order management
function cancelOrder(orderId: string) {
  fetch(`/api/orders/${orderId}`, { method: 'DELETE' })
    .then(response => {
      if (response.ok) {
        // Refresh orders table
        window.dispatchEvent(new CustomEvent('refreshCard', { 
          detail: { cardId: 'open_orders', reportId: 'trading' }
        }))
      }
    })
}

function openModifyDialog(order: any) {
  // Implementation for order modification dialog
  console.log('Modify order:', order)
}

export function TradingDashboard() {
  return (
    <div className="h-screen bg-gray-50">
      <div className="p-4 bg-white border-b">
        <h1 className="text-2xl font-bold text-gray-900">
          Trading Dashboard
        </h1>
        <p className="text-gray-600">
          Real-time market data and portfolio management
        </p>
      </div>
      
      <Dashboard 
        state={{ spec: tradingDashboardSpec }}
        className="h-full"
      />
    </div>
  )
}
```

## Key Features Demonstrated

### 1. Real-time Data Integration

- **WebSocket connections** for live market data
- **Server-Sent Events** for streaming updates
- **Multiple data sources** with different update frequencies

### 2. Advanced Chart Configurations

- **Technical indicators** and overlays
- **Multi-timeframe** analysis
- **Interactive tooltips** with financial formatting

### 3. Complex Table Implementations

- **Live data updates** with minimal re-renders
- **Custom cell renderers** for financial data
- **Row actions** for order management
- **Sorting and filtering** capabilities

### 4. Interactive Trading Interface

- **HTML cards** with embedded JavaScript
- **Form handling** and API integration
- **Order management** workflow

### 5. Risk Management Displays

- **Color-coded thresholds** for risk metrics
- **Visual indicators** for portfolio health
- **Correlation matrices** and heatmaps

### 6. Performance Optimizations

- **Efficient WebSocket management**
- **Debounced updates** for high-frequency data
- **Selective rendering** based on visibility

This trading dashboard example showcases the full capabilities of @cereon/dashboard for building sophisticated financial applications with real-time data requirements.