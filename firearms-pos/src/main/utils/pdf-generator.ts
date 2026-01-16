import { BrowserWindow, app } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import { formatDate, formatDateTime, getPeriodLabel } from './date-helpers'
import type {
  SalesReportData,
  InventoryReportData,
  ProfitLossData,
  ExpenseReportData,
  PurchaseReportData,
  ReturnReportData,
  CommissionReportData,
  TaxReportData,
  CustomerReportData,
  BranchPerformanceData,
  CashFlowData,
  AuditTrailData,
  ReportType,
  TimePeriod,
} from '../../shared/types'

interface PDFOptions {
  reportType: ReportType
  data: any
  filters: {
    timePeriod: TimePeriod
    startDate?: string
    endDate?: string
    branchName?: string
  }
  businessInfo?: {
    name: string
    address?: string
    phone?: string
    email?: string
  }
}

export async function generateReportPDF(options: PDFOptions): Promise<string> {
  const { reportType, data, filters, businessInfo } = options

  // Generate HTML content based on report type
  let htmlContent = ''
  switch (reportType) {
    case 'sales':
      htmlContent = generateSalesReportHTML(data, filters, businessInfo)
      break
    case 'inventory':
      htmlContent = generateInventoryReportHTML(data, filters, businessInfo)
      break
    case 'profit-loss':
      htmlContent = generateProfitLossReportHTML(data, filters, businessInfo)
      break
    case 'expenses':
      htmlContent = generateExpenseReportHTML(data, filters, businessInfo)
      break
    case 'purchases':
      htmlContent = generatePurchaseReportHTML(data, filters, businessInfo)
      break
    case 'returns':
      htmlContent = generateReturnReportHTML(data, filters, businessInfo)
      break
    case 'commissions':
      htmlContent = generateCommissionReportHTML(data, filters, businessInfo)
      break
    case 'tax':
      htmlContent = generateTaxReportHTML(data, filters, businessInfo)
      break
    case 'customer':
      htmlContent = generateCustomerReportHTML(data, filters, businessInfo)
      break
    case 'branch-performance':
      htmlContent = generateBranchPerformanceHTML(data, filters, businessInfo)
      break
    case 'cash-flow':
      htmlContent = generateCashFlowHTML(data, filters, businessInfo)
      break
    case 'audit-trail':
      htmlContent = generateAuditTrailHTML(data, filters, businessInfo)
      break
    default:
      throw new Error(`Unknown report type: ${reportType}`)
  }

  // Create hidden window for PDF generation
  const pdfWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: false,
    },
  })

  // Load HTML content
  await pdfWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`)

  // Wait for content to load
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Generate PDF
  const pdfData = await pdfWindow.webContents.printToPDF({
    pageSize: 'A4',
    printBackground: true,
    landscape: false,
    margins: {
      top: 0.5,
      bottom: 0.5,
      left: 0.5,
      right: 0.5,
    },
  })

  // Save to downloads folder
  const downloadsPath = app.getPath('downloads')
  const fileName = `${reportType}_report_${Date.now()}.pdf`
  const filePath = path.join(downloadsPath, fileName)

  fs.writeFileSync(filePath, pdfData)

  pdfWindow.close()

  return filePath
}

// Design System Colors for Reports
const reportColors = {
  primary900: '#0c1929',
  primary700: '#1e3a5f',
  primary500: '#2563eb',
  accentGold: '#c9a962',
  accentEmerald: '#059669',
  accentRose: '#dc2626',
  gray900: '#111827',
  gray600: '#4b5563',
  gray400: '#9ca3af',
  gray100: '#f3f4f6',
  gray50: '#f9fafb',
}

// Common HTML template - Compact Classic Style
function getReportTemplate(
  title: string,
  content: string,
  filters: any,
  businessInfo?: any
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        @page {
          size: A4;
          margin: 8mm;
        }

        body {
          font-family: 'Courier New', Courier, monospace;
          font-size: 9px;
          line-height: 1.3;
          color: #000;
          padding: 10px;
          background: white;
        }

        /* Header - Compact */
        .header {
          text-align: center;
          margin-bottom: 8px;
          padding-bottom: 6px;
          border-bottom: 2px double #000;
        }

        .business-name {
          font-size: 14px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .business-info {
          font-size: 8px;
          margin-top: 2px;
        }

        .report-title {
          font-size: 11px;
          font-weight: bold;
          text-transform: uppercase;
          margin-top: 6px;
          border: 1px solid #000;
          display: inline-block;
          padding: 2px 10px;
        }

        .report-meta {
          font-size: 8px;
          margin-top: 4px;
        }

        /* Summary Row - Inline */
        .summary-row {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin: 8px 0;
          padding: 4px;
          border: 1px solid #000;
          background: #f5f5f5;
        }

        .summary-item {
          flex: 1;
          min-width: 100px;
          text-align: center;
          padding: 3px;
          border-right: 1px dashed #999;
        }

        .summary-item:last-child {
          border-right: none;
        }

        .summary-label {
          font-size: 7px;
          text-transform: uppercase;
        }

        .summary-value {
          font-size: 11px;
          font-weight: bold;
        }

        /* Tables - Tight */
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 6px 0;
          font-size: 8px;
        }

        th {
          background: #000;
          color: #fff;
          padding: 3px 4px;
          text-align: left;
          font-size: 7px;
          text-transform: uppercase;
          font-weight: bold;
        }

        td {
          padding: 2px 4px;
          border-bottom: 1px dotted #ccc;
        }

        tr:nth-child(even) {
          background: #f9f9f9;
        }

        /* Section Title - Minimal */
        .section-title {
          font-size: 9px;
          font-weight: bold;
          text-transform: uppercase;
          margin: 10px 0 4px;
          padding: 2px 0;
          border-bottom: 1px solid #000;
        }

        /* Footer - Tiny */
        .footer {
          margin-top: 10px;
          padding-top: 4px;
          border-top: 1px solid #000;
          text-align: center;
          font-size: 7px;
        }

        /* Utility Classes */
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        .text-green { color: #000; }
        .text-red { color: #000; }
        .text-blue { color: #000; }
        .text-gold { color: #000; }

        /* Rank - Simple number */
        .rank-badge {
          font-weight: bold;
        }

        .rank-badge.gold::before { content: '★ '; }
        .rank-badge.silver::before { content: '☆ '; }
        .rank-badge.bronze::before { content: '• '; }

        /* Status - Text based */
        .status-badge {
          font-size: 7px;
          padding: 1px 3px;
          border: 1px solid #000;
          text-transform: uppercase;
        }

        .status-badge.success { background: #ddd; }
        .status-badge.warning { background: #eee; }
        .status-badge.danger { background: #ccc; }

        /* Amount */
        .amount-cell {
          font-weight: bold;
          font-family: 'Courier New', monospace;
        }

        /* Hide cards, use summary-row instead */
        .summary-cards { display: none; }
        .card { display: none; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="business-name">${businessInfo?.name || 'Firearms Retail POS'}</div>
        ${
          businessInfo
            ? `<div class="business-info">${businessInfo.address || ''}${businessInfo.phone ? ' | ' + businessInfo.phone : ''}${businessInfo.email ? ' | ' + businessInfo.email : ''}</div>`
            : ''
        }
        <div class="report-title">${title}</div>
        <div class="report-meta">
          ${getPeriodLabel(filters.timePeriod, filters.startDate, filters.endDate)}
          | ${filters.branchName || 'All Branches'} | ${formatDateTime(new Date())}
        </div>
      </div>

      ${content}

      <div class="footer">
        Firearms Retail POS - Confidential
      </div>
    </body>
    </html>
  `
}

// Sales Report HTML
function generateSalesReportHTML(
  data: SalesReportData,
  filters: any,
  businessInfo?: any
): string {
  const content = `
    <div class="summary-row">
      <div class="summary-item">
        <div class="summary-label">Total Sales</div>
        <div class="summary-value">${data.summary?.totalSales || 0}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Revenue</div>
        <div class="summary-value">Rs.${(data.summary?.totalRevenue || 0).toFixed(0)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Avg Order</div>
        <div class="summary-value">Rs.${(data.summary?.avgOrderValue || 0).toFixed(0)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Tax</div>
        <div class="summary-value">Rs.${(data.summary?.totalTax || 0).toFixed(0)}</div>
      </div>
    </div>

    <div class="section-title">Sales by Payment Method</div>
    <table>
      <thead>
        <tr>
          <th>Payment Method</th>
          <th class="text-right">Count</th>
          <th class="text-right">Total Amount</th>
        </tr>
      </thead>
      <tbody>
        ${data.byPaymentMethod
          ?.map(
            (item) => `
          <tr>
            <td class="font-bold">${item.paymentMethod}</td>
            <td class="text-right">${item.count}</td>
            <td class="text-right">Rs. ${item.total.toFixed(2)}</td>
          </tr>
        `
          )
          .join('') || '<tr><td colspan="3" class="text-center">No data available</td></tr>'}
      </tbody>
    </table>

    <div class="section-title">Top Selling Products</div>
    <table>
      <thead>
        <tr>
          <th style="width: 50px;">Rank</th>
          <th>Product Code</th>
          <th>Product Name</th>
          <th class="text-right">Quantity Sold</th>
          <th class="text-right">Revenue</th>
        </tr>
      </thead>
      <tbody>
        ${data.topProducts
          ?.map(
            (item, index) => `
          <tr>
            <td><span class="rank-badge ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''}">${index + 1}</span></td>
            <td>${item.productCode}</td>
            <td class="font-bold">${item.productName}</td>
            <td class="text-right font-bold">${item.quantitySold}</td>
            <td class="text-right amount-cell text-green">Rs. ${item.revenue.toFixed(2)}</td>
          </tr>
        `
          )
          .join('') || '<tr><td colspan="5" class="text-center">No data available</td></tr>'}
      </tbody>
    </table>
  `

  return getReportTemplate('Sales Report', content, filters, businessInfo)
}

// Inventory Report HTML
function generateInventoryReportHTML(
  data: InventoryReportData,
  filters: any,
  businessInfo?: any
): string {
  const totalValue = data.stockValue?.reduce((sum, item) => sum + item.costValue, 0) || 0

  const content = `
    <div class="summary-row">
      <div class="summary-item">
        <div class="summary-label">Stock Value</div>
        <div class="summary-value">Rs.${totalValue.toFixed(0)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Low Stock</div>
        <div class="summary-value">${data.stockSummary?.[0]?.lowStockItems || 0}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Out of Stock</div>
        <div class="summary-value">${data.stockSummary?.[0]?.outOfStockItems || 0}</div>
      </div>
    </div>

    <div class="section-title">Stock Summary by Branch</div>
    <table>
      <thead>
        <tr>
          <th>Branch</th>
          <th class="text-right">Total Products</th>
          <th class="text-right">Total Units</th>
          <th class="text-right">Low Stock</th>
        </tr>
      </thead>
      <tbody>
        ${data.stockSummary
          ?.map(
            (item) => `
          <tr>
            <td class="font-bold">${item.branchName}</td>
            <td class="text-right">${item.totalProducts}</td>
            <td class="text-right">${item.totalUnits}</td>
            <td class="text-right text-red">${item.lowStockItems}</td>
          </tr>
        `
          )
          .join('') || '<tr><td colspan="4" class="text-center">No data available</td></tr>'}
      </tbody>
    </table>

    ${
      data.lowStock && data.lowStock.length > 0
        ? `
    <div class="section-title">Low Stock Alert</div>
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Branch</th>
          <th class="text-right">Current Qty</th>
          <th class="text-right">Min Qty</th>
          <th class="text-center">Status</th>
        </tr>
      </thead>
      <tbody>
        ${data.lowStock
          .map(
            (item) => `
          <tr>
            <td class="font-bold">${item.productName}</td>
            <td>${item.branchName}</td>
            <td class="text-right font-bold">${item.quantity}</td>
            <td class="text-right">${item.minQuantity}</td>
            <td class="text-center">
              <span class="status-badge ${item.quantity === 0 ? 'danger' : 'warning'}">
                ${item.quantity === 0 ? 'Out of Stock' : 'Low Stock'}
              </span>
            </td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
    `
        : ''
    }
  `

  return getReportTemplate('Inventory Report', content, filters, businessInfo)
}

// Profit & Loss Report HTML
function generateProfitLossReportHTML(
  data: ProfitLossData,
  filters: any,
  businessInfo?: any
): string {
  const content = `
    <div class="summary-row">
      <div class="summary-item">
        <div class="summary-label">Revenue</div>
        <div class="summary-value">Rs.${(data.revenue || 0).toFixed(0)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Gross Profit (${(data.grossMargin || 0).toFixed(1)}%)</div>
        <div class="summary-value">Rs.${(data.grossProfit || 0).toFixed(0)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Net Profit (${(data.netMargin || 0).toFixed(1)}%)</div>
        <div class="summary-value">Rs.${(data.netProfit || 0).toFixed(0)}</div>
      </div>
    </div>

    <div class="section-title">Financial Breakdown</div>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="font-bold">Total Revenue</td>
          <td class="text-right text-green">Rs. ${(data.revenue || 0).toFixed(2)}</td>
        </tr>
        <tr>
          <td>Cost of Goods Sold</td>
          <td class="text-right text-red">- Rs. ${(data.costOfGoodsSold || 0).toFixed(2)}</td>
        </tr>
        <tr style="background: #f1f5f9;">
          <td class="font-bold">Gross Profit</td>
          <td class="text-right font-bold text-blue">Rs. ${(data.grossProfit || 0).toFixed(2)}</td>
        </tr>
        <tr>
          <td>Operating Expenses</td>
          <td class="text-right text-red">- Rs. ${(data.expenses || 0).toFixed(2)}</td>
        </tr>
        <tr style="background: #f1f5f9;">
          <td class="font-bold">Net Profit</td>
          <td class="text-right font-bold ${data.netProfit >= 0 ? 'text-green' : 'text-red'}">
            Rs. ${(data.netProfit || 0).toFixed(2)}
          </td>
        </tr>
      </tbody>
    </table>

    ${
      data.expensesByCategory && data.expensesByCategory.length > 0
        ? `
    <div class="section-title">Expenses by Category</div>
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${data.expensesByCategory
          .map(
            (item) => `
          <tr>
            <td>${item.category}</td>
            <td class="text-right">Rs. ${item.total.toFixed(2)}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
    `
        : ''
    }
  `

  return getReportTemplate('Profit & Loss Report', content, filters, businessInfo)
}

// Expense Report HTML
function generateExpenseReportHTML(
  data: ExpenseReportData,
  filters: any,
  businessInfo?: any
): string {
  const content = `
    <div class="summary-row">
      <div class="summary-item">
        <div class="summary-label">Total Expenses</div>
        <div class="summary-value">Rs.${(data.summary?.totalExpenses || 0).toFixed(0)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Count</div>
        <div class="summary-value">${data.summary?.expenseCount || 0}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Average</div>
        <div class="summary-value">Rs.${(data.summary?.avgExpense || 0).toFixed(0)}</div>
      </div>
    </div>

    <div class="section-title">Expenses by Category</div>
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th class="text-right">Count</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${data.expensesByCategory
          ?.map(
            (item) => `
          <tr>
            <td class="font-bold">${item.category}</td>
            <td class="text-right">${item.count}</td>
            <td class="text-right text-red">Rs. ${item.amount.toFixed(2)}</td>
          </tr>
        `
          )
          .join('') || '<tr><td colspan="3" class="text-center">No data available</td></tr>'}
      </tbody>
    </table>

    ${
      data.topExpenses && data.topExpenses.length > 0
        ? `
    <div class="section-title">Top Expenses</div>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Category</th>
          <th>Description</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${data.topExpenses
          .map(
            (item) => `
          <tr>
            <td>${formatDate(item.date)}</td>
            <td>${item.category}</td>
            <td>${item.description || '-'}</td>
            <td class="text-right text-red">Rs. ${item.amount.toFixed(2)}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
    `
        : ''
    }
  `

  return getReportTemplate('Expense Report', content, filters, businessInfo)
}

// Purchase Report HTML
function generatePurchaseReportHTML(data: PurchaseReportData, filters: any, businessInfo?: any): string {
  const content = `
    <div class="summary-row">
      <div class="summary-item">
        <div class="summary-label">Purchases</div>
        <div class="summary-value">${data.summary?.totalPurchases || 0}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Total Cost</div>
        <div class="summary-value">Rs.${(data.summary?.totalCost || 0).toFixed(0)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Avg Value</div>
        <div class="summary-value">Rs.${(data.summary?.avgPurchaseValue || 0).toFixed(0)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Pending</div>
        <div class="summary-value">Rs.${(data.summary?.pendingPayments || 0).toFixed(0)}</div>
      </div>
    </div>

    <div class="section-title">Purchases by Supplier</div>
    <table>
      <thead>
        <tr>
          <th>Supplier</th>
          <th class="text-right">Total Orders</th>
          <th class="text-right">Total Amount</th>
        </tr>
      </thead>
      <tbody>
        ${data.purchasesBySupplier
          ?.map(
            (item) => `
          <tr>
            <td class="font-bold">${item.supplierName}</td>
            <td class="text-right">${item.totalPurchases}</td>
            <td class="text-right amount-cell">Rs. ${item.totalAmount.toFixed(2)}</td>
          </tr>
        `
          )
          .join('') || '<tr><td colspan="3" class="text-center">No data available</td></tr>'}
      </tbody>
    </table>

    <div class="section-title">Purchases by Status</div>
    <table>
      <thead>
        <tr>
          <th>Status</th>
          <th class="text-right">Count</th>
          <th class="text-right">Total Amount</th>
        </tr>
      </thead>
      <tbody>
        ${data.purchasesByStatus
          ?.map(
            (item) => `
          <tr>
            <td>
              <span class="status-badge ${item.status === 'Completed' || item.status === 'Received' ? 'success' : item.status === 'Pending' ? 'warning' : 'danger'}">
                ${item.status}
              </span>
            </td>
            <td class="text-right font-bold">${item.count}</td>
            <td class="text-right amount-cell">Rs. ${item.totalAmount.toFixed(2)}</td>
          </tr>
        `
          )
          .join('') || '<tr><td colspan="3" class="text-center">No data available</td></tr>'}
      </tbody>
    </table>

    ${
      data.recentPurchases && data.recentPurchases.length > 0
        ? `
    <div class="section-title">Recent Purchases</div>
    <table>
      <thead>
        <tr>
          <th>PO Number</th>
          <th>Supplier</th>
          <th>Date</th>
          <th class="text-right">Amount</th>
          <th class="text-center">Status</th>
        </tr>
      </thead>
      <tbody>
        ${data.recentPurchases
          .map(
            (item) => `
          <tr>
            <td class="font-bold">${item.purchaseOrderNumber}</td>
            <td>${item.supplierName}</td>
            <td>${formatDate(item.createdAt)}</td>
            <td class="text-right amount-cell">Rs. ${item.totalAmount.toFixed(2)}</td>
            <td class="text-center">
              <span class="status-badge ${item.status === 'Completed' || item.status === 'Received' ? 'success' : item.status === 'Pending' ? 'warning' : 'danger'}">
                ${item.status}
              </span>
            </td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
    `
        : ''
    }
  `

  return getReportTemplate('Purchase Report', content, filters, businessInfo)
}

// Returns Report HTML
function generateReturnReportHTML(data: ReturnReportData, filters: any, businessInfo?: any): string {
  const content = `
    <div class="summary-row">
      <div class="summary-item">
        <div class="summary-label">Returns</div>
        <div class="summary-value">${data.summary?.totalReturns || 0}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Total Value</div>
        <div class="summary-value">Rs.${(data.summary?.totalValue || 0).toFixed(0)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Return Rate</div>
        <div class="summary-value">${(data.summary?.returnRate || 0).toFixed(1)}%</div>
      </div>
    </div>

    <div class="section-title">Returns by Reason</div>
    <table>
      <thead>
        <tr>
          <th>Reason</th>
          <th class="text-right">Count</th>
          <th class="text-right">Value</th>
        </tr>
      </thead>
      <tbody>
        ${data.returnsByReason
          ?.map(
            (item) => `
          <tr>
            <td class="font-bold">${item.reason}</td>
            <td class="text-right">${item.count}</td>
            <td class="text-right amount-cell text-red">Rs. ${item.value.toFixed(2)}</td>
          </tr>
        `
          )
          .join('') || '<tr><td colspan="3" class="text-center">No data available</td></tr>'}
      </tbody>
    </table>

    ${
      data.returnsByProduct && data.returnsByProduct.length > 0
        ? `
    <div class="section-title">Most Returned Products</div>
    <table>
      <thead>
        <tr>
          <th style="width: 50px;">Rank</th>
          <th>Product</th>
          <th class="text-right">Return Count</th>
          <th class="text-right">Total Value</th>
        </tr>
      </thead>
      <tbody>
        ${data.returnsByProduct
          .map(
            (item, index) => `
          <tr>
            <td><span class="rank-badge ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''}">${index + 1}</span></td>
            <td class="font-bold">${item.productName}</td>
            <td class="text-right font-bold">${item.returnCount}</td>
            <td class="text-right amount-cell text-red">Rs. ${item.totalValue.toFixed(2)}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
    `
        : ''
    }
  `

  return getReportTemplate('Returns Report', content, filters, businessInfo)
}

// Commission Report HTML
function generateCommissionReportHTML(data: CommissionReportData, filters: any, businessInfo?: any): string {
  const content = `
    <div class="summary-row">
      <div class="summary-item">
        <div class="summary-label">Total Commissions</div>
        <div class="summary-value">Rs.${(data.summary?.totalCommissions || 0).toFixed(0)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Count</div>
        <div class="summary-value">${data.summary?.commissionCount || 0}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Average</div>
        <div class="summary-value">Rs.${(data.summary?.avgCommission || 0).toFixed(0)}</div>
      </div>
    </div>

    <div class="section-title">Commissions by Salesperson</div>
    <table>
      <thead>
        <tr>
          <th style="width: 50px;">Rank</th>
          <th>Salesperson</th>
          <th class="text-right">Sales Count</th>
          <th class="text-right">Total Commission</th>
        </tr>
      </thead>
      <tbody>
        ${data.commissionsBySalesperson
          ?.map(
            (item, index) => `
          <tr>
            <td><span class="rank-badge ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''}">${index + 1}</span></td>
            <td class="font-bold">${item.userName}</td>
            <td class="text-right">${item.salesCount}</td>
            <td class="text-right amount-cell text-green">Rs. ${item.totalCommission.toFixed(2)}</td>
          </tr>
        `
          )
          .join('') || '<tr><td colspan="4" class="text-center">No data available</td></tr>'}
      </tbody>
    </table>

    ${
      data.recentCommissions && data.recentCommissions.length > 0
        ? `
    <div class="section-title">Recent Commissions</div>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Salesperson</th>
          <th>Invoice</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${data.recentCommissions
          .map(
            (item) => `
          <tr>
            <td>${formatDate(item.date)}</td>
            <td class="font-bold">${item.userName}</td>
            <td>${item.saleInvoice}</td>
            <td class="text-right amount-cell text-green">Rs. ${item.amount.toFixed(2)}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
    `
        : ''
    }
  `

  return getReportTemplate('Commission Report', content, filters, businessInfo)
}

// Tax Report HTML
function generateTaxReportHTML(data: TaxReportData, filters: any, businessInfo?: any): string {
  const content = `
    <div class="summary-row">
      <div class="summary-item">
        <div class="summary-label">Tax Collected</div>
        <div class="summary-value">Rs.${(data.summary?.totalTaxCollected || 0).toFixed(0)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Taxable Sales</div>
        <div class="summary-value">Rs.${(data.summary?.taxableSales || 0).toFixed(0)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Avg per Sale</div>
        <div class="summary-value">Rs.${(data.summary?.avgTaxPerSale || 0).toFixed(0)}</div>
      </div>
    </div>

    <div class="section-title">Tax Collected by Branch</div>
    <table>
      <thead>
        <tr>
          <th style="width: 50px;">Rank</th>
          <th>Branch</th>
          <th class="text-right">Tax Collected</th>
        </tr>
      </thead>
      <tbody>
        ${data.taxByBranch
          ?.map(
            (item, index) => `
          <tr>
            <td><span class="rank-badge ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''}">${index + 1}</span></td>
            <td class="font-bold">${item.branchName}</td>
            <td class="text-right amount-cell text-green">Rs. ${item.taxCollected.toFixed(2)}</td>
          </tr>
        `
          )
          .join('') || '<tr><td colspan="3" class="text-center">No data available</td></tr>'}
      </tbody>
    </table>

    <div class="section-title">Tax Collected by Payment Method</div>
    <table>
      <thead>
        <tr>
          <th>Payment Method</th>
          <th class="text-right">Sales Count</th>
          <th class="text-right">Tax Collected</th>
        </tr>
      </thead>
      <tbody>
        ${data.taxByPaymentMethod
          ?.map(
            (item) => `
          <tr>
            <td class="font-bold">${item.paymentMethod}</td>
            <td class="text-right">${item.salesCount}</td>
            <td class="text-right amount-cell text-green">Rs. ${item.taxCollected.toFixed(2)}</td>
          </tr>
        `
          )
          .join('') || '<tr><td colspan="3" class="text-center">No data available</td></tr>'}
      </tbody>
    </table>
  `

  return getReportTemplate('Tax Report', content, filters, businessInfo)
}

// Customer Report HTML
function generateCustomerReportHTML(data: CustomerReportData, filters: any, businessInfo?: any): string {
  const content = `
    <div class="summary-row">
      <div class="summary-item">
        <div class="summary-label">Total</div>
        <div class="summary-value">${data.summary?.totalCustomers || 0}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Active</div>
        <div class="summary-value">${data.summary?.activeCustomers || 0}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">New</div>
        <div class="summary-value">${data.summary?.newCustomers || 0}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Revenue</div>
        <div class="summary-value">Rs.${(data.summary?.totalRevenue || 0).toFixed(0)}</div>
      </div>
    </div>

    ${
      data.customerRetention
        ? `
    <div class="summary-row">
      <div class="summary-item">
        <div class="summary-label">Repeat</div>
        <div class="summary-value">${data.customerRetention.repeatCustomers || 0}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">One-time</div>
        <div class="summary-value">${data.customerRetention.oneTimeCustomers || 0}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Repeat Rate</div>
        <div class="summary-value">${(data.customerRetention.repeatRate || 0).toFixed(1)}%</div>
      </div>
    </div>
    `
        : ''
    }

    <div class="section-title">Top Customers</div>
    <table>
      <thead>
        <tr>
          <th style="width: 50px;">Rank</th>
          <th>Customer</th>
          <th>Contact</th>
          <th class="text-right">Orders</th>
          <th class="text-right">Avg Order</th>
          <th class="text-right">Total Spent</th>
        </tr>
      </thead>
      <tbody>
        ${data.topCustomers
          ?.map(
            (item, index) => `
          <tr>
            <td><span class="rank-badge ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''}">${index + 1}</span></td>
            <td class="font-bold">${item.customerName}</td>
            <td style="font-size: 10px;">${item.phone || item.email || '-'}</td>
            <td class="text-right">${item.totalOrders}</td>
            <td class="text-right">Rs. ${item.avgOrderValue.toFixed(2)}</td>
            <td class="text-right amount-cell text-green">Rs. ${item.totalSpent.toFixed(2)}</td>
          </tr>
        `
          )
          .join('') || '<tr><td colspan="6" class="text-center">No data available</td></tr>'}
      </tbody>
    </table>
  `

  return getReportTemplate('Customer Report', content, filters, businessInfo)
}

// Branch Performance Report HTML
function generateBranchPerformanceHTML(data: BranchPerformanceData, filters: any, businessInfo?: any): string {
  const content = `
    <div class="summary-row">
      <div class="summary-item">
        <div class="summary-label">Branches</div>
        <div class="summary-value">${data.summary?.totalBranches || 0}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Revenue</div>
        <div class="summary-value">Rs.${(data.summary?.totalRevenue || 0).toFixed(0)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Profit</div>
        <div class="summary-value">Rs.${(data.summary?.totalProfit || 0).toFixed(0)}</div>
      </div>
      ${
        data.topPerformingBranch
          ? `
      <div class="summary-item">
        <div class="summary-label">Top Branch</div>
        <div class="summary-value">${data.topPerformingBranch.branchName}</div>
      </div>
      `
          : ''
      }
    </div>

    <div class="section-title">Branch Performance Metrics</div>
    <table>
      <thead>
        <tr>
          <th style="width: 50px;">Rank</th>
          <th>Branch</th>
          <th class="text-right">Sales</th>
          <th class="text-right">Revenue</th>
          <th class="text-right">Expenses</th>
          <th class="text-right">Profit</th>
          <th class="text-right">Inventory Value</th>
        </tr>
      </thead>
      <tbody>
        ${data.branchMetrics
          ?.sort((a, b) => b.revenue - a.revenue)
          .map(
            (item, index) => `
          <tr>
            <td><span class="rank-badge ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''}">${index + 1}</span></td>
            <td class="font-bold">${item.branchName}</td>
            <td class="text-right">${item.salesCount}</td>
            <td class="text-right amount-cell text-green">Rs. ${item.revenue.toFixed(2)}</td>
            <td class="text-right text-red">Rs. ${item.expenses.toFixed(2)}</td>
            <td class="text-right amount-cell ${item.profit >= 0 ? 'text-green' : 'text-red'}">Rs. ${item.profit.toFixed(2)}</td>
            <td class="text-right text-blue">Rs. ${item.inventoryValue.toFixed(2)}</td>
          </tr>
        `
          )
          .join('') || '<tr><td colspan="7" class="text-center">No data available</td></tr>'}
      </tbody>
    </table>
  `

  return getReportTemplate('Branch Performance Report', content, filters, businessInfo)
}

// Cash Flow Report HTML
function generateCashFlowHTML(data: CashFlowData, filters: any, businessInfo?: any): string {
  const content = `
    <div class="summary-row">
      <div class="summary-item">
        <div class="summary-label">Opening</div>
        <div class="summary-value">Rs.${(data.summary?.openingBalance || 0).toFixed(0)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Cash In</div>
        <div class="summary-value">+Rs.${(data.summary?.cashIn || 0).toFixed(0)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Cash Out</div>
        <div class="summary-value">-Rs.${(data.summary?.cashOut || 0).toFixed(0)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Closing</div>
        <div class="summary-value">Rs.${(data.summary?.closingBalance || 0).toFixed(0)}</div>
      </div>
    </div>

    <div class="summary-row">
      <div class="summary-item">
        <div class="summary-label">Net Flow</div>
        <div class="summary-value">${(data.summary?.netCashFlow || 0) >= 0 ? '+' : ''}Rs.${(data.summary?.netCashFlow || 0).toFixed(0)}</div>
      </div>
    </div>

    ${
      data.cashInBreakdown
        ? `
    <div class="section-title">Cash Inflow Breakdown</div>
    <table>
      <thead>
        <tr>
          <th>Source</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="font-bold">Sales Revenue</td>
          <td class="text-right amount-cell text-green">Rs. ${(data.cashInBreakdown.sales || 0).toFixed(2)}</td>
        </tr>
        <tr>
          <td class="font-bold">Receivables Collected</td>
          <td class="text-right amount-cell text-green">Rs. ${(data.cashInBreakdown.receivables || 0).toFixed(2)}</td>
        </tr>
        <tr>
          <td class="font-bold">Other Income</td>
          <td class="text-right amount-cell text-green">Rs. ${(data.cashInBreakdown.other || 0).toFixed(2)}</td>
        </tr>
        <tr style="background: #dcfce7;">
          <td class="font-bold">Total Cash In</td>
          <td class="text-right amount-cell font-bold text-green">Rs. ${(data.summary?.cashIn || 0).toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
    `
        : ''
    }

    ${
      data.cashOutBreakdown
        ? `
    <div class="section-title">Cash Outflow Breakdown</div>
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="font-bold">Purchases</td>
          <td class="text-right amount-cell text-red">Rs. ${(data.cashOutBreakdown.purchases || 0).toFixed(2)}</td>
        </tr>
        <tr>
          <td class="font-bold">Expenses</td>
          <td class="text-right amount-cell text-red">Rs. ${(data.cashOutBreakdown.expenses || 0).toFixed(2)}</td>
        </tr>
        <tr>
          <td class="font-bold">Commissions</td>
          <td class="text-right amount-cell text-red">Rs. ${(data.cashOutBreakdown.commissions || 0).toFixed(2)}</td>
        </tr>
        <tr>
          <td class="font-bold">Refunds</td>
          <td class="text-right amount-cell text-red">Rs. ${(data.cashOutBreakdown.refunds || 0).toFixed(2)}</td>
        </tr>
        <tr style="background: #fee2e2;">
          <td class="font-bold">Total Cash Out</td>
          <td class="text-right amount-cell font-bold text-red">Rs. ${(data.summary?.cashOut || 0).toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
    `
        : ''
    }

    ${
      data.cashByBranch && data.cashByBranch.length > 0
        ? `
    <div class="section-title">Cash on Hand by Branch</div>
    <table>
      <thead>
        <tr>
          <th>Branch</th>
          <th class="text-right">Cash in Hand</th>
        </tr>
      </thead>
      <tbody>
        ${data.cashByBranch
          .map(
            (item) => `
          <tr>
            <td class="font-bold">${item.branchName}</td>
            <td class="text-right amount-cell text-green">Rs. ${item.cashInHand.toFixed(2)}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
    `
        : ''
    }
  `

  return getReportTemplate('Cash Flow Report', content, filters, businessInfo)
}

function generateAuditTrailHTML(data: AuditTrailData, filters: any, businessInfo?: any): string {
  const content = `
    <div class="summary-cards">
      <div class="card">
        <div class="card-title">Total Sales</div>
        <div class="card-value">${data.salesSummary?.totalSales || 0}</div>
        <div class="card-subtitle">Rs. ${(data.salesSummary?.totalRevenue || 0).toFixed(2)}</div>
      </div>
      <div class="card">
        <div class="card-title">Total Expenses</div>
        <div class="card-value text-red">Rs. ${(data.expensesSummary?.totalExpenses || 0).toFixed(2)}</div>
      </div>
      <div class="card">
        <div class="card-title">Net Profit</div>
        <div class="card-value ${(data.financialSummary?.netProfit || 0) >= 0 ? 'text-green' : 'text-red'}">
          Rs. ${(data.financialSummary?.netProfit || 0).toFixed(2)}
        </div>
      </div>
      <div class="card">
        <div class="card-title">Total Inventory Value</div>
        <div class="card-value text-blue">Rs. ${(data.inventorySummary?.totalValue || 0).toFixed(2)}</div>
      </div>
    </div>

    <div class="section-title">Sales Analysis</div>
    <table>
      <thead>
        <tr>
          <th>Metric</th>
          <th class="text-right">Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Total Sales Count</td>
          <td class="text-right font-bold">${data.salesSummary?.totalSales || 0}</td>
        </tr>
        <tr>
          <td>Total Revenue</td>
          <td class="text-right text-green">Rs. ${(data.salesSummary?.totalRevenue || 0).toFixed(2)}</td>
        </tr>
        <tr>
          <td>Average Transaction Value</td>
          <td class="text-right">Rs. ${(data.salesSummary?.avgOrderValue || 0).toFixed(2)}</td>
        </tr>
        <tr>
          <td>Total Tax Collected</td>
          <td class="text-right">Rs. ${(data.salesSummary?.totalTax || 0).toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    ${
      data.salesByPaymentMethod && data.salesByPaymentMethod.length > 0
        ? `
    <div class="section-title">Sales by Payment Method</div>
    <table>
      <thead>
        <tr>
          <th>Payment Method</th>
          <th class="text-right">Count</th>
          <th class="text-right">Total Amount</th>
        </tr>
      </thead>
      <tbody>
        ${data.salesByPaymentMethod
          .map(
            (item) => `
          <tr>
            <td class="font-bold">${item.paymentMethod}</td>
            <td class="text-right">${item.count}</td>
            <td class="text-right">Rs. ${item.total.toFixed(2)}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
    `
        : ''
    }

    ${
      data.topProducts && data.topProducts.length > 0
        ? `
    <div class="section-title">Top 10 Selling Products</div>
    <table>
      <thead>
        <tr>
          <th>Product Code</th>
          <th>Product Name</th>
          <th class="text-right">Quantity Sold</th>
          <th class="text-right">Revenue</th>
        </tr>
      </thead>
      <tbody>
        ${data.topProducts
          .map(
            (item) => `
          <tr>
            <td>${item.productCode}</td>
            <td>${item.productName}</td>
            <td class="text-right font-bold">${item.quantitySold}</td>
            <td class="text-right text-green">Rs. ${item.revenue.toFixed(2)}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
    `
        : ''
    }

    <div class="section-title">Inventory Status</div>
    <table>
      <thead>
        <tr>
          <th>Metric</th>
          <th class="text-right">Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Total Products</td>
          <td class="text-right font-bold">${data.inventorySummary?.totalProducts || 0}</td>
        </tr>
        <tr>
          <td>Total Inventory Value</td>
          <td class="text-right text-green">Rs. ${(data.inventorySummary?.totalValue || 0).toFixed(2)}</td>
        </tr>
        <tr>
          <td>Low Stock Items</td>
          <td class="text-right text-red">${data.inventorySummary?.lowStockItems || 0}</td>
        </tr>
        <tr>
          <td>Out of Stock Items</td>
          <td class="text-right text-red">${data.inventorySummary?.outOfStockItems || 0}</td>
        </tr>
      </tbody>
    </table>

    ${
      data.purchasesSummary
        ? `
    <div class="section-title">Purchase Records</div>
    <table>
      <thead>
        <tr>
          <th>Metric</th>
          <th class="text-right">Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Total Purchase Orders</td>
          <td class="text-right font-bold">${data.purchasesSummary.totalPurchases || 0}</td>
        </tr>
        <tr>
          <td>Total Purchase Cost</td>
          <td class="text-right text-red">Rs. ${(data.purchasesSummary.totalCost || 0).toFixed(2)}</td>
        </tr>
        <tr>
          <td>Average Purchase Value</td>
          <td class="text-right">Rs. ${(data.purchasesSummary.avgPurchaseValue || 0).toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
    `
        : ''
    }

    ${
      data.expensesSummary
        ? `
    <div class="section-title">Expense Tracking</div>
    <table>
      <thead>
        <tr>
          <th>Metric</th>
          <th class="text-right">Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Total Expenses</td>
          <td class="text-right text-red">Rs. ${(data.expensesSummary.totalExpenses || 0).toFixed(2)}</td>
        </tr>
        <tr>
          <td>Expense Count</td>
          <td class="text-right">${data.expensesSummary.expenseCount || 0}</td>
        </tr>
        <tr>
          <td>Average Expense</td>
          <td class="text-right">Rs. ${(data.expensesSummary.avgExpense || 0).toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
    `
        : ''
    }

    ${
      data.expensesByCategory && data.expensesByCategory.length > 0
        ? `
    <div class="section-title">Expenses by Category</div>
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th class="text-right">Count</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${data.expensesByCategory
          .map(
            (item) => `
          <tr>
            <td class="font-bold">${item.category}</td>
            <td class="text-right">${item.count}</td>
            <td class="text-right text-red">Rs. ${item.amount.toFixed(2)}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
    `
        : ''
    }

    ${
      data.returnsSummary
        ? `
    <div class="section-title">Returns & Refunds</div>
    <table>
      <thead>
        <tr>
          <th>Metric</th>
          <th class="text-right">Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Total Returns</td>
          <td class="text-right font-bold">${data.returnsSummary.totalReturns || 0}</td>
        </tr>
        <tr>
          <td>Total Refund Amount</td>
          <td class="text-right text-red">Rs. ${(data.returnsSummary.totalRefundAmount || 0).toFixed(2)}</td>
        </tr>
        <tr>
          <td>Return Rate</td>
          <td class="text-right">${(data.returnsSummary.returnRate || 0).toFixed(2)}%</td>
        </tr>
      </tbody>
    </table>
    `
        : ''
    }

    ${
      data.financialSummary
        ? `
    <div class="section-title">Financial Summary</div>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="font-bold">Gross Revenue</td>
          <td class="text-right text-green">Rs. ${(data.financialSummary.grossRevenue || 0).toFixed(2)}</td>
        </tr>
        <tr>
          <td>Returns/Refunds</td>
          <td class="text-right text-red">- Rs. ${(data.financialSummary.refunds || 0).toFixed(2)}</td>
        </tr>
        <tr style="background: #f1f5f9;">
          <td class="font-bold">Net Revenue</td>
          <td class="text-right font-bold text-blue">Rs. ${(data.financialSummary.netRevenue || 0).toFixed(2)}</td>
        </tr>
        <tr>
          <td>Cost of Goods Sold</td>
          <td class="text-right text-red">- Rs. ${(data.financialSummary.cogs || 0).toFixed(2)}</td>
        </tr>
        <tr style="background: #f1f5f9;">
          <td class="font-bold">Gross Profit</td>
          <td class="text-right font-bold text-blue">Rs. ${(data.financialSummary.grossProfit || 0).toFixed(2)}</td>
        </tr>
        <tr>
          <td>Operating Expenses</td>
          <td class="text-right text-red">- Rs. ${(data.financialSummary.expenses || 0).toFixed(2)}</td>
        </tr>
        <tr style="background: #f1f5f9;">
          <td class="font-bold">Net Profit</td>
          <td class="text-right font-bold ${data.financialSummary.netProfit >= 0 ? 'text-green' : 'text-red'}">
            Rs. ${(data.financialSummary.netProfit || 0).toFixed(2)}
          </td>
        </tr>
        <tr>
          <td>Profit Margin</td>
          <td class="text-right font-bold">${(data.financialSummary.profitMargin || 0).toFixed(2)}%</td>
        </tr>
      </tbody>
    </table>
    `
        : ''
    }

    ${
      data.commissionsSummary
        ? `
    <div class="section-title">Commissions</div>
    <table>
      <thead>
        <tr>
          <th>Metric</th>
          <th class="text-right">Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Total Commission Paid</td>
          <td class="text-right text-red">Rs. ${(data.commissionsSummary.totalCommission || 0).toFixed(2)}</td>
        </tr>
        <tr>
          <td>Commission Count</td>
          <td class="text-right">${data.commissionsSummary.commissionCount || 0}</td>
        </tr>
        <tr>
          <td>Average Commission</td>
          <td class="text-right">Rs. ${(data.commissionsSummary.avgCommission || 0).toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
    `
        : ''
    }

    ${
      data.auditLogs && data.auditLogs.length > 0
        ? `
    <div class="section-title">Recent System Audit Logs</div>
    <table>
      <thead>
        <tr>
          <th>Date/Time</th>
          <th>User</th>
          <th class="text-center">Action</th>
          <th>Table</th>
        </tr>
      </thead>
      <tbody>
        ${data.auditLogs
          .slice(0, 50)
          .map(
            (item) => `
          <tr>
            <td>${formatDateTime(item.timestamp)}</td>
            <td class="font-bold">${item.userName}</td>
            <td class="text-center">
              <span class="status-badge ${item.action === 'INSERT' || item.action === 'CREATE' ? 'success' : item.action === 'UPDATE' ? 'warning' : item.action === 'DELETE' ? 'danger' : ''}">
                ${item.action}
              </span>
            </td>
            <td>${item.tableName}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
    `
        : ''
    }
  `

  return getReportTemplate('Comprehensive Business Audit Report', content, filters, businessInfo)
}
