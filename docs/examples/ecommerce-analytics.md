# E-commerce Analytics Dashboard

Comprehensive e-commerce analytics dashboard showcasing sales metrics, customer insights, and business intelligence features.

## Overview

This example demonstrates an e-commerce analytics dashboard with:
- **Sales performance** tracking and forecasting
- **Customer behavior** analysis and segmentation
- **Product performance** monitoring
- **Marketing attribution** and campaign analysis
- **Inventory management** insights
- **Financial reporting** and KPIs

## Dashboard Implementation

### Complete Dashboard Specification

```tsx
// EcommerceDashboard.tsx
import React from 'react'
import { Dashboard, DashboardSpec } from '@cereon/dashboard'

const ecommerceDashboardSpec: DashboardSpec = {
  id: 'ecommerce_analytics',
  title: 'E-commerce Analytics Dashboard',
  description: 'Comprehensive business intelligence for online retail',
  
  layout: {
    cols: { lg: 24, md: 20, sm: 12, xs: 8, xxs: 4 },
    rowHeight: 50,
    margin: [12, 12]
  },
  
  refresh: {
    enabled: true,
    interval: 300000, // 5 minutes
    showLastUpdated: true
  },
  
  reports: [
    // Sales Overview Report
    {
      id: 'sales_overview',
      title: 'Sales Overview',
      icon: 'trending-up',
      description: 'Key sales metrics and performance indicators',
      
      reportCards: [
        // Revenue KPIs
        {
          id: 'total_revenue',
          kind: 'number',
          title: 'Total Revenue',
          description: 'Total revenue for the current period',
          query: {
            variant: 'http',
            payload: {
              url: '/api/kpis/revenue',
              method: 'GET',
              params: { period: '30d' }
            }
          },
          settings: {
            gridPosition: { x: 0, y: 0, w: 6, h: 4 },
            unit: '$',
            precision: 0,
            showTrend: true,
            animateOnChange: true,
            numberFormat: {
              style: 'currency',
              currency: 'USD',
              notation: 'compact'
            }
          }
        },

        {
          id: 'orders_count',
          kind: 'number',
          title: 'Total Orders',
          query: {
            variant: 'http',
            payload: {
              url: '/api/kpis/orders',
              method: 'GET',
              params: { period: '30d' }
            }
          },
          settings: {
            gridPosition: { x: 6, y: 0, w: 6, h: 4 },
            showTrend: true,
            animateOnChange: true
          }
        },

        {
          id: 'avg_order_value',
          kind: 'number',
          title: 'Average Order Value',
          query: {
            variant: 'http',
            payload: {
              url: '/api/kpis/aov',
              method: 'GET',
              params: { period: '30d' }
            }
          },
          settings: {
            gridPosition: { x: 12, y: 0, w: 6, h: 4 },
            unit: '$',
            precision: 2,
            showTrend: true
          }
        },

        {
          id: 'conversion_rate',
          kind: 'number',
          title: 'Conversion Rate',
          query: {
            variant: 'http',
            payload: {
              url: '/api/kpis/conversion',
              method: 'GET',
              params: { period: '30d' }
            }
          },
          settings: {
            gridPosition: { x: 18, y: 0, w: 6, h: 4 },
            unit: '%',
            precision: 2,
            showTrend: true,
            thresholds: {
              excellent: 5.0,  // Above 5%
              good: 3.0,       // Above 3%
              warning: 1.5     // Above 1.5%
            }
          }
        },

        // Revenue Trend Chart
        {
          id: 'revenue_trend',
          kind: 'chart',
          title: 'Revenue Trend (Last 90 Days)',
          query: {
            variant: 'http',
            payload: {
              url: '/api/analytics/revenue-trend',
              method: 'GET',
              params: { days: 90 }
            }
          },
          settings: {
            gridPosition: { x: 0, y: 4, w: 16, h: 8 },
            chartType: 'line',
            enableDownload: true,
            chartOptions: {
              responsive: true,
              scales: {
                x: {
                  type: 'time',
                  time: {
                    unit: 'day',
                    displayFormats: { day: 'MMM DD' }
                  }
                },
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value: any) {
                      return '$' + value.toLocaleString()
                    }
                  }
                }
              },
              plugins: {
                legend: { position: 'top' },
                tooltip: {
                  mode: 'index',
                  intersect: false,
                  callbacks: {
                    title: (context: any) => new Date(context[0].parsed.x).toLocaleDateString(),
                    label: (context: any) => `Revenue: $${context.parsed.y.toLocaleString()}`
                  }
                }
              }
            }
          }
        },

        // Top Products
        {
          id: 'top_products',
          kind: 'table',
          title: 'Top Products by Revenue',
          query: {
            variant: 'http',
            payload: {
              url: '/api/analytics/top-products',
              method: 'GET',
              params: { limit: 10, period: '30d' }
            }
          },
          settings: {
            gridPosition: { x: 16, y: 4, w: 8, h: 8 },
            pagination: false,
            sortable: true,
            enableDownload: true,
            columns: [
              { 
                key: 'name', 
                title: 'Product', 
                type: 'string',
                ellipsis: true,
                maxLength: 30
              },
              { 
                key: 'revenue', 
                title: 'Revenue', 
                type: 'currency',
                formatter: (value: number) => `$${value.toLocaleString()}`
              },
              { 
                key: 'units_sold', 
                title: 'Units Sold', 
                type: 'number'
              },
              { 
                key: 'growth_rate', 
                title: 'Growth', 
                type: 'badge',
                renderer: (value: number) => (
                  <span className={`
                    px-2 py-1 rounded text-xs font-semibold
                    ${value >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                  `}>
                    {value >= 0 ? '+' : ''}{value.toFixed(1)}%
                  </span>
                )
              }
            ]
          }
        },

        // Sales Funnel
        {
          id: 'sales_funnel',
          kind: 'chart',
          title: 'Sales Funnel',
          query: {
            variant: 'http',
            payload: {
              url: '/api/analytics/sales-funnel',
              method: 'GET',
              params: { period: '30d' }
            }
          },
          settings: {
            gridPosition: { x: 0, y: 12, w: 12, h: 8 },
            chartType: 'bar',
            enableDownload: true,
            chartOptions: {
              indexAxis: 'y',
              scales: {
                x: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value: any) => value.toLocaleString()
                  }
                }
              },
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (context: any) => `${context.dataset.label}: ${context.parsed.x.toLocaleString()}`
                  }
                }
              }
            }
          }
        },

        // Geographic Sales Distribution
        {
          id: 'geographic_sales',
          kind: 'html',
          title: 'Sales by Region',
          query: {
            variant: 'http',
            payload: {
              url: '/api/analytics/geographic-sales',
              method: 'GET'
            }
          },
          settings: {
            gridPosition: { x: 12, y: 12, w: 12, h: 8 },
            sanitize: true,
            allowedTags: ['div', 'svg', 'path', 'circle', 'text', 'g']
          }
        }
      ]
    },

    // Customer Analytics Report
    {
      id: 'customer_analytics',
      title: 'Customer Analytics',
      icon: 'users',
      description: 'Customer behavior and segmentation insights',
      
      reportCards: [
        // Customer KPIs
        {
          id: 'total_customers',
          kind: 'number',
          title: 'Total Customers',
          query: {
            variant: 'http',
            payload: {
              url: '/api/customers/count',
              method: 'GET'
            }
          },
          settings: {
            gridPosition: { x: 0, y: 0, w: 6, h: 4 },
            showTrend: true,
            animateOnChange: true
          }
        },

        {
          id: 'new_customers',
          kind: 'number',
          title: 'New Customers (30d)',
          query: {
            variant: 'http',
            payload: {
              url: '/api/customers/new',
              method: 'GET',
              params: { period: '30d' }
            }
          },
          settings: {
            gridPosition: { x: 6, y: 0, w: 6, h: 4 },
            showTrend: true,
            animateOnChange: true
          }
        },

        {
          id: 'customer_ltv',
          kind: 'number',
          title: 'Avg Customer LTV',
          query: {
            variant: 'http',
            payload: {
              url: '/api/customers/ltv',
              method: 'GET'
            }
          },
          settings: {
            gridPosition: { x: 12, y: 0, w: 6, h: 4 },
            unit: '$',
            precision: 2,
            showTrend: true
          }
        },

        {
          id: 'retention_rate',
          kind: 'number',
          title: 'Retention Rate (90d)',
          query: {
            variant: 'http',
            payload: {
              url: '/api/customers/retention',
              method: 'GET',
              params: { period: '90d' }
            }
          },
          settings: {
            gridPosition: { x: 18, y: 0, w: 6, h: 4 },
            unit: '%',
            precision: 1,
            showTrend: true,
            thresholds: {
              excellent: 80,   // Above 80%
              good: 60,        // Above 60%
              warning: 40      // Above 40%
            }
          }
        },

        // Customer Segmentation
        {
          id: 'customer_segments',
          kind: 'chart',
          title: 'Customer Segmentation (RFM)',
          query: {
            variant: 'http',
            payload: {
              url: '/api/analytics/customer-segments',
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
                    label: (context: any) => {
                      const percentage = ((context.parsed / context.dataset.data.reduce((a: number, b: number) => a + b, 0)) * 100).toFixed(1)
                      return `${context.label}: ${context.parsed.toLocaleString()} (${percentage}%)`
                    }
                  }
                }
              }
            }
          }
        },

        // Cohort Analysis
        {
          id: 'cohort_analysis',
          kind: 'html',
          title: 'Cohort Analysis',
          query: {
            variant: 'http',
            payload: {
              url: '/api/analytics/cohort-analysis',
              method: 'GET'
            }
          },
          settings: {
            gridPosition: { x: 12, y: 4, w: 12, h: 8 },
            sanitize: true
          }
        },

        // Customer Acquisition Channels
        {
          id: 'acquisition_channels',
          kind: 'chart',
          title: 'Customer Acquisition Channels',
          query: {
            variant: 'http',
            payload: {
              url: '/api/analytics/acquisition-channels',
              method: 'GET',
              params: { period: '30d' }
            }
          },
          settings: {
            gridPosition: { x: 0, y: 12, w: 16, h: 8 },
            chartType: 'bar',
            enableDownload: true,
            chartOptions: {
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value: any) => value.toLocaleString()
                  }
                }
              },
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (context: any) => `Customers: ${context.parsed.y.toLocaleString()}`
                  }
                }
              }
            }
          }
        },

        // Top Customers Table
        {
          id: 'top_customers',
          kind: 'table',
          title: 'Top Customers by LTV',
          query: {
            variant: 'http',
            payload: {
              url: '/api/customers/top-customers',
              method: 'GET',
              params: { limit: 20 }
            }
          },
          settings: {
            gridPosition: { x: 16, y: 12, w: 8, h: 8 },
            pagination: true,
            pageSize: 10,
            sortable: true,
            enableDownload: true,
            columns: [
              { 
                key: 'customer_id', 
                title: 'Customer ID', 
                type: 'string',
                width: 100
              },
              { 
                key: 'name', 
                title: 'Name', 
                type: 'string'
              },
              { 
                key: 'ltv', 
                title: 'LTV', 
                type: 'currency',
                formatter: (value: number) => `$${value.toLocaleString()}`
              },
              { 
                key: 'orders', 
                title: 'Orders', 
                type: 'number'
              },
              { 
                key: 'last_order', 
                title: 'Last Order', 
                type: 'date',
                formatter: (value: string) => new Date(value).toLocaleDateString()
              },
              { 
                key: 'segment', 
                title: 'Segment', 
                type: 'badge',
                renderer: (value: string) => (
                  <span className={`
                    px-2 py-1 rounded text-xs
                    ${value === 'Champions' ? 'bg-purple-100 text-purple-800' : ''}
                    ${value === 'Loyal Customers' ? 'bg-blue-100 text-blue-800' : ''}
                    ${value === 'Potential Loyalists' ? 'bg-green-100 text-green-800' : ''}
                    ${value === 'At Risk' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${value === 'Lost' ? 'bg-red-100 text-red-800' : ''}
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

    // Marketing Analytics Report
    {
      id: 'marketing_analytics',
      title: 'Marketing',
      icon: 'megaphone',
      description: 'Campaign performance and marketing attribution',
      
      reportCards: [
        // Marketing KPIs
        {
          id: 'marketing_spend',
          kind: 'number',
          title: 'Marketing Spend (30d)',
          query: {
            variant: 'http',
            payload: {
              url: '/api/marketing/spend',
              method: 'GET',
              params: { period: '30d' }
            }
          },
          settings: {
            gridPosition: { x: 0, y: 0, w: 6, h: 4 },
            unit: '$',
            precision: 0,
            showTrend: true
          }
        },

        {
          id: 'marketing_roas',
          kind: 'number',
          title: 'Return on Ad Spend',
          query: {
            variant: 'http',
            payload: {
              url: '/api/marketing/roas',
              method: 'GET',
              params: { period: '30d' }
            }
          },
          settings: {
            gridPosition: { x: 6, y: 0, w: 6, h: 4 },
            precision: 2,
            showTrend: true,
            thresholds: {
              excellent: 4.0,  // 4:1 ROAS
              good: 2.0,       // 2:1 ROAS
              warning: 1.0     // Break-even
            }
          }
        },

        {
          id: 'cac',
          kind: 'number',
          title: 'Customer Acquisition Cost',
          query: {
            variant: 'http',
            payload: {
              url: '/api/marketing/cac',
              method: 'GET',
              params: { period: '30d' }
            }
          },
          settings: {
            gridPosition: { x: 12, y: 0, w: 6, h: 4 },
            unit: '$',
            precision: 2,
            showTrend: true
          }
        },

        {
          id: 'email_open_rate',
          kind: 'number',
          title: 'Email Open Rate',
          query: {
            variant: 'http',
            payload: {
              url: '/api/marketing/email-metrics',
              method: 'GET',
              params: { metric: 'open_rate', period: '30d' }
            }
          },
          settings: {
            gridPosition: { x: 18, y: 0, w: 6, h: 4 },
            unit: '%',
            precision: 1,
            showTrend: true,
            thresholds: {
              excellent: 25,   // Above 25%
              good: 20,        // Above 20%
              warning: 15      // Above 15%
            }
          }
        },

        // Campaign Performance
        {
          id: 'campaign_performance',
          kind: 'table',
          title: 'Active Campaign Performance',
          query: {
            variant: 'http',
            payload: {
              url: '/api/marketing/campaigns',
              method: 'GET',
              params: { status: 'active' }
            }
          },
          settings: {
            gridPosition: { x: 0, y: 4, w: 24, h: 8 },
            sortable: true,
            enableDownload: true,
            columns: [
              { key: 'name', title: 'Campaign', type: 'string' },
              { key: 'channel', title: 'Channel', type: 'badge' },
              { 
                key: 'spend', 
                title: 'Spend', 
                type: 'currency',
                formatter: (value: number) => `$${value.toLocaleString()}`
              },
              { key: 'impressions', title: 'Impressions', type: 'number' },
              { key: 'clicks', title: 'Clicks', type: 'number' },
              { 
                key: 'ctr', 
                title: 'CTR', 
                type: 'percentage',
                formatter: (value: number) => `${value.toFixed(2)}%`
              },
              { 
                key: 'conversions', 
                title: 'Conversions', 
                type: 'number'
              },
              { 
                key: 'roas', 
                title: 'ROAS', 
                type: 'number',
                formatter: (value: number) => `${value.toFixed(2)}x`,
                renderer: (value: number) => (
                  <span className={`
                    px-2 py-1 rounded text-xs font-semibold
                    ${value >= 3 ? 'bg-green-100 text-green-800' : ''}
                    ${value >= 2 && value < 3 ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${value < 2 ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {value.toFixed(2)}x
                  </span>
                )
              }
            ]
          }
        },

        // Attribution Model
        {
          id: 'attribution_model',
          kind: 'chart',
          title: 'Attribution by Channel (Last 30 Days)',
          query: {
            variant: 'http',
            payload: {
              url: '/api/marketing/attribution',
              method: 'GET',
              params: { period: '30d', model: 'first_touch' }
            }
          },
          settings: {
            gridPosition: { x: 0, y: 12, w: 12, h: 8 },
            chartType: 'pie',
            enableDownload: true,
            chartOptions: {
              plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                  callbacks: {
                    label: (context: any) => {
                      const percentage = ((context.parsed / context.dataset.data.reduce((a: number, b: number) => a + b, 0)) * 100).toFixed(1)
                      return `${context.label}: $${context.parsed.toLocaleString()} (${percentage}%)`
                    }
                  }
                }
              }
            }
          }
        },

        // Email Campaign Metrics
        {
          id: 'email_metrics',
          kind: 'chart',
          title: 'Email Campaign Performance',
          query: {
            variant: 'http',
            payload: {
              url: '/api/marketing/email-performance',
              method: 'GET',
              params: { period: '30d' }
            }
          },
          settings: {
            gridPosition: { x: 12, y: 12, w: 12, h: 8 },
            chartType: 'line',
            enableDownload: true,
            chartOptions: {
              scales: {
                x: {
                  type: 'time',
                  time: { unit: 'day' }
                },
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value: any) => `${value}%`
                  }
                }
              },
              plugins: {
                legend: { position: 'top' },
                tooltip: {
                  callbacks: {
                    label: (context: any) => `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`
                  }
                }
              }
            }
          }
        }
      ]
    },

    // Inventory & Operations Report
    {
      id: 'inventory',
      title: 'Inventory',
      icon: 'package',
      description: 'Inventory management and operational metrics',
      
      reportCards: [
        // Inventory KPIs
        {
          id: 'low_stock_alerts',
          kind: 'number',
          title: 'Low Stock Alerts',
          query: {
            variant: 'http',
            payload: {
              url: '/api/inventory/low-stock-count',
              method: 'GET'
            }
          },
          settings: {
            gridPosition: { x: 0, y: 0, w: 6, h: 4 },
            thresholds: {
              warning: 1,   // Any low stock items
              good: 0       // No low stock
            }
          }
        },

        {
          id: 'inventory_value',
          kind: 'number',
          title: 'Total Inventory Value',
          query: {
            variant: 'http',
            payload: {
              url: '/api/inventory/total-value',
              method: 'GET'
            }
          },
          settings: {
            gridPosition: { x: 6, y: 0, w: 6, h: 4 },
            unit: '$',
            precision: 0,
            numberFormat: {
              style: 'currency',
              currency: 'USD',
              notation: 'compact'
            }
          }
        },

        {
          id: 'inventory_turnover',
          kind: 'number',
          title: 'Inventory Turnover',
          query: {
            variant: 'http',
            payload: {
              url: '/api/inventory/turnover',
              method: 'GET'
            }
          },
          settings: {
            gridPosition: { x: 12, y: 0, w: 6, h: 4 },
            precision: 1,
            showTrend: true
          }
        },

        {
          id: 'out_of_stock',
          kind: 'number',
          title: 'Out of Stock Items',
          query: {
            variant: 'http',
            payload: {
              url: '/api/inventory/out-of-stock-count',
              method: 'GET'
            }
          },
          settings: {
            gridPosition: { x: 18, y: 0, w: 6, h: 4 },
            thresholds: {
              warning: 1,   // Any out of stock
              good: 0       // No out of stock
            }
          }
        },

        // Low Stock Items
        {
          id: 'low_stock_items',
          kind: 'table',
          title: 'Low Stock Items',
          query: {
            variant: 'http',
            payload: {
              url: '/api/inventory/low-stock',
              method: 'GET'
            }
          },
          settings: {
            gridPosition: { x: 0, y: 4, w: 12, h: 10 },
            sortable: true,
            enableDownload: true,
            columns: [
              { key: 'sku', title: 'SKU', type: 'string', width: 100 },
              { key: 'name', title: 'Product Name', type: 'string' },
              { 
                key: 'current_stock', 
                title: 'Current Stock', 
                type: 'number',
                renderer: (value: number, row: any) => (
                  <span className={`
                    ${value <= row.reorder_point ? 'text-red-600 font-semibold' : ''}
                    ${value <= row.reorder_point * 1.5 ? 'text-orange-600' : ''}
                  `}>
                    {value}
                  </span>
                )
              },
              { key: 'reorder_point', title: 'Reorder Point', type: 'number' },
              { key: 'reorder_quantity', title: 'Reorder Qty', type: 'number' },
              { 
                key: 'days_remaining', 
                title: 'Days Remaining', 
                type: 'badge',
                renderer: (value: number) => (
                  <span className={`
                    px-2 py-1 rounded text-xs font-semibold
                    ${value <= 7 ? 'bg-red-100 text-red-800' : ''}
                    ${value > 7 && value <= 14 ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${value > 14 ? 'bg-green-100 text-green-800' : ''}
                  `}>
                    {value} days
                  </span>
                )
              }
            ]
          }
        },

        // Inventory by Category
        {
          id: 'inventory_by_category',
          kind: 'chart',
          title: 'Inventory Value by Category',
          query: {
            variant: 'http',
            payload: {
              url: '/api/inventory/by-category',
              method: 'GET'
            }
          },
          settings: {
            gridPosition: { x: 12, y: 4, w: 12, h: 10 },
            chartType: 'bar',
            enableDownload: true,
            chartOptions: {
              indexAxis: 'y',
              scales: {
                x: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value: any) => '$' + value.toLocaleString()
                  }
                }
              },
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (context: any) => `Value: $${context.parsed.x.toLocaleString()}`
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

export function EcommerceDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              E-commerce Analytics
            </h1>
            <p className="text-gray-600 mt-1">
              Comprehensive business intelligence dashboard
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select className="px-3 py-2 border border-gray-300 rounded-md">
              <option value="30d">Last 30 Days</option>
              <option value="7d">Last 7 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Export Report
            </button>
          </div>
        </div>
      </div>
      
      <Dashboard 
        state={{ spec: ecommerceDashboardSpec }}
        className="p-6"
      />
    </div>
  )
}
```

## Key Features Demonstrated

### 1. Comprehensive KPI Tracking

- **Revenue metrics** with trend indicators
- **Customer analytics** including LTV and retention
- **Marketing performance** with ROAS calculations
- **Inventory management** with automated alerts

### 2. Advanced Data Visualizations

- **Revenue trends** with time-series charts
- **Customer segmentation** using RFM analysis
- **Geographic distribution** maps
- **Cohort analysis** heatmaps

### 3. Business Intelligence Features

- **Sales funnel** visualization
- **Marketing attribution** modeling  
- **Campaign performance** tracking
- **Inventory optimization** insights

### 4. Interactive Data Tables

- **Product performance** rankings
- **Customer analysis** with segmentation
- **Campaign metrics** with real-time updates
- **Inventory alerts** with action items

### 5. Professional UI/UX

- **Responsive design** for all devices
- **Color-coded thresholds** for key metrics
- **Export functionality** for reports
- **Date range selectors** for analysis

This e-commerce dashboard example showcases how @cereon/dashboard can be used to build comprehensive business intelligence applications with rich data visualization and analysis capabilities.