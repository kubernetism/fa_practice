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

// Common HTML template
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
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          padding: 40px;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 20px;
        }
        .business-name {
          font-size: 28px;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 5px;
        }
        .business-info {
          font-size: 12px;
          color: #666;
          margin-bottom: 15px;
        }
        .report-title {
          font-size: 24px;
          font-weight: bold;
          margin: 15px 0 10px;
        }
        .report-meta {
          font-size: 12px;
          color: #666;
        }
        .summary-cards {
          display: flex;
          gap: 20px;
          margin: 30px 0;
          flex-wrap: wrap;
        }
        .card {
          flex: 1;
          min-width: 200px;
          padding: 20px;
          background: #f8fafc;
          border-left: 4px solid #2563eb;
          border-radius: 6px;
        }
        .card-title {
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .card-value {
          font-size: 28px;
          font-weight: bold;
          color: #1e293b;
        }
        .card-subtitle {
          font-size: 12px;
          color: #64748b;
          margin-top: 4px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 12px;
        }
        thead {
          background: #1e40af;
          color: white;
        }
        th {
          padding: 12px;
          text-align: left;
          font-weight: 600;
        }
        td {
          padding: 10px 12px;
          border-bottom: 1px solid #e2e8f0;
        }
        tr:nth-child(even) {
          background: #f8fafc;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          margin: 30px 0 15px;
          color: #1e40af;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 8px;
        }
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 2px solid #e2e8f0;
          text-align: center;
          font-size: 10px;
          color: #94a3b8;
        }
        .text-right {
          text-align: right;
        }
        .text-center {
          text-align: center;
        }
        .font-bold {
          font-weight: bold;
        }
        .text-green {
          color: #16a34a;
        }
        .text-red {
          color: #dc2626;
        }
        .text-blue {
          color: #2563eb;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="business-name">${businessInfo?.name || 'Firearms Retail POS'}</div>
        ${
          businessInfo
            ? `<div class="business-info">
            ${businessInfo.address || ''} | ${businessInfo.phone || ''} | ${businessInfo.email || ''}
          </div>`
            : ''
        }
        <div class="report-title">${title}</div>
        <div class="report-meta">
          Period: ${getPeriodLabel(filters.timePeriod, filters.startDate, filters.endDate)}
          ${filters.branchName ? ` | Branch: ${filters.branchName}` : ' | All Branches'} |
          Generated: ${formatDateTime(new Date())}
        </div>
      </div>

      ${content}

      <div class="footer">
        Generated by Firearms Retail POS | Confidential Business Report
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
    <div class="summary-cards">
      <div class="card">
        <div class="card-title">Total Sales</div>
        <div class="card-value">${data.summary?.totalSales || 0}</div>
      </div>
      <div class="card">
        <div class="card-title">Total Revenue</div>
        <div class="card-value text-green">Rs. ${(data.summary?.totalRevenue || 0).toFixed(2)}</div>
      </div>
      <div class="card">
        <div class="card-title">Avg Order Value</div>
        <div class="card-value text-blue">Rs. ${(data.summary?.avgOrderValue || 0).toFixed(2)}</div>
      </div>
      <div class="card">
        <div class="card-title">Tax Collected</div>
        <div class="card-value">Rs. ${(data.summary?.totalTax || 0).toFixed(2)}</div>
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
          <th>Product Code</th>
          <th>Product Name</th>
          <th class="text-right">Quantity Sold</th>
          <th class="text-right">Revenue</th>
        </tr>
      </thead>
      <tbody>
        ${data.topProducts
          ?.map(
            (item) => `
          <tr>
            <td>${item.productCode}</td>
            <td>${item.productName}</td>
            <td class="text-right font-bold">${item.quantitySold}</td>
            <td class="text-right text-green">Rs. ${item.revenue.toFixed(2)}</td>
          </tr>
        `
          )
          .join('') || '<tr><td colspan="4" class="text-center">No data available</td></tr>'}
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
    <div class="summary-cards">
      <div class="card">
        <div class="card-title">Total Stock Value</div>
        <div class="card-value text-green">Rs. ${totalValue.toFixed(2)}</div>
      </div>
      <div class="card">
        <div class="card-title">Low Stock Items</div>
        <div class="card-value text-red">${data.stockSummary?.[0]?.lowStockItems || 0}</div>
      </div>
      <div class="card">
        <div class="card-title">Out of Stock</div>
        <div class="card-value text-red">${data.stockSummary?.[0]?.outOfStockItems || 0}</div>
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
        </tr>
      </thead>
      <tbody>
        ${data.lowStock
          .map(
            (item) => `
          <tr>
            <td>${item.productName}</td>
            <td>${item.branchName}</td>
            <td class="text-right text-red font-bold">${item.quantity}</td>
            <td class="text-right">${item.minQuantity}</td>
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
    <div class="summary-cards">
      <div class="card">
        <div class="card-title">Revenue</div>
        <div class="card-value text-green">Rs. ${(data.revenue || 0).toFixed(2)}</div>
      </div>
      <div class="card">
        <div class="card-title">Gross Profit</div>
        <div class="card-value text-blue">Rs. ${(data.grossProfit || 0).toFixed(2)}</div>
        <div class="card-subtitle">${(data.grossMargin || 0).toFixed(2)}% margin</div>
      </div>
      <div class="card">
        <div class="card-title">Net Profit</div>
        <div class="card-value ${data.netProfit >= 0 ? 'text-green' : 'text-red'}">
          Rs. ${(data.netProfit || 0).toFixed(2)}
        </div>
        <div class="card-subtitle">${(data.netMargin || 0).toFixed(2)}% margin</div>
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
    <div class="summary-cards">
      <div class="card">
        <div class="card-title">Total Expenses</div>
        <div class="card-value text-red">Rs. ${(data.summary?.totalExpenses || 0).toFixed(2)}</div>
      </div>
      <div class="card">
        <div class="card-title">Expense Count</div>
        <div class="card-value">${data.summary?.expenseCount || 0}</div>
      </div>
      <div class="card">
        <div class="card-title">Average Expense</div>
        <div class="card-value">Rs. ${(data.summary?.avgExpense || 0).toFixed(2)}</div>
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

// Placeholder functions for other report types
function generatePurchaseReportHTML(data: PurchaseReportData, filters: any, businessInfo?: any): string {
  return getReportTemplate('Purchase Report', '<p>Purchase report content...</p>', filters, businessInfo)
}

function generateReturnReportHTML(data: ReturnReportData, filters: any, businessInfo?: any): string {
  return getReportTemplate('Returns Report', '<p>Returns report content...</p>', filters, businessInfo)
}

function generateCommissionReportHTML(data: CommissionReportData, filters: any, businessInfo?: any): string {
  return getReportTemplate('Commission Report', '<p>Commission report content...</p>', filters, businessInfo)
}

function generateTaxReportHTML(data: TaxReportData, filters: any, businessInfo?: any): string {
  return getReportTemplate('Tax Report', '<p>Tax report content...</p>', filters, businessInfo)
}

function generateCustomerReportHTML(data: CustomerReportData, filters: any, businessInfo?: any): string {
  return getReportTemplate('Customer Report', '<p>Customer report content...</p>', filters, businessInfo)
}

function generateBranchPerformanceHTML(data: BranchPerformanceData, filters: any, businessInfo?: any): string {
  return getReportTemplate('Branch Performance Report', '<p>Branch performance content...</p>', filters, businessInfo)
}

function generateCashFlowHTML(data: CashFlowData, filters: any, businessInfo?: any): string {
  return getReportTemplate('Cash Flow Report', '<p>Cash flow content...</p>', filters, businessInfo)
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
          <th>Action</th>
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
            <td>${item.userName}</td>
            <td class="font-bold">${item.action}</td>
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
