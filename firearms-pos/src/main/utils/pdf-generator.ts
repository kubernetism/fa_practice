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
    width: 800,
    height: 1200,
    webPreferences: {
      nodeIntegration: false,
      offscreen: true,
    },
  })

  // Load HTML content
  await pdfWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`)

  // Wait for content to fully render
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Generate PDF - A4 size with compact margins for space efficiency
  const pdfData = await pdfWindow.webContents.printToPDF({
    pageSize: 'A4',
    printBackground: true,
    landscape: false,
    margins: {
      top: 0.2,
      bottom: 0.2,
      left: 0.2,
      right: 0.2,
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

// Clean Invoice Style Template - Matching reference image
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
          margin: 10mm;
        }

        body {
          font-family: 'Segoe UI', 'Arial', sans-serif;
          font-size: 11px;
          line-height: 1.4;
          color: #333;
          background: white;
          padding: 15px 20px;
          max-width: 800px;
          margin: 0 auto;
        }

        /* Header - Compact */
        .header {
          text-align: center;
          margin-bottom: 12px;
          padding-bottom: 8px;
        }

        .business-name {
          font-size: 18px;
          font-weight: bold;
          color: #1a1a1a;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 6px;
        }

        .report-title {
          font-size: 13px;
          color: #555;
          margin: 4px 0;
        }

        .report-date {
          font-size: 11px;
          color: #666;
          margin-top: 3px;
        }

        /* Separator Lines - Tighter */
        .line {
          border-top: 1px solid #ddd;
          margin: 8px 0;
        }

        .dashed-line {
          border-top: 1px dashed #ccc;
          margin: 8px 0;
        }

        .double-line {
          border-top: 2px solid #333;
          margin: 10px 0;
        }

        /* Info Row - Compact */
        .info-row {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          padding: 3px 0;
        }

        .info-row span:first-child {
          color: #e67e22;
          font-weight: 500;
        }

        .info-row span:last-child {
          color: #2980b9;
          font-weight: 600;
        }

        /* Table Header - Compact */
        .table-header {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          font-weight: bold;
          text-transform: uppercase;
          padding: 6px 0;
          border-bottom: 2px solid #333;
          margin-bottom: 4px;
          color: #1a1a1a;
        }

        .col-qty { width: 50px; }
        .col-item { flex: 1; padding: 0 10px; }
        .col-total { width: 100px; text-align: right; }

        /* Table Row - Tight spacing */
        .table-row {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          padding: 4px 0;
          border-bottom: 1px solid #eee;
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .table-row .col-qty { color: #e74c3c; font-weight: 500; }
        .table-row .col-item { color: #2980b9; }
        .table-row .col-total { font-weight: 600; color: #27ae60; }

        /* Summary Section - Compact */
        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          padding: 4px 0;
        }

        .summary-row.subtotal {
          padding-top: 6px;
          border-top: 1px dashed #ccc;
        }

        .summary-row.total {
          font-size: 12px;
          font-weight: bold;
          padding: 6px 0;
          border-top: 1px solid #333;
        }

        .summary-row.grand-total {
          font-size: 14px;
          font-weight: bold;
          padding: 8px 6px;
          margin-top: 6px;
          border-top: 2px solid #333;
          background: #f8f9fa;
        }

        /* Section - Reduced gaps */
        .section {
          margin: 10px 0;
        }

        .section-title {
          font-size: 11px;
          font-weight: bold;
          text-transform: uppercase;
          text-align: center;
          padding: 6px 10px;
          margin-bottom: 6px;
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
          border-left: 3px solid #3498db;
          color: #2c3e50;
        }

        /* Footer - Compact */
        .footer {
          margin-top: 15px;
          text-align: center;
          padding-top: 10px;
          border-top: 2px solid #333;
        }

        .thank-you {
          font-size: 10px;
          font-style: italic;
          color: #7f8c8d;
          margin: 6px 0;
        }

        .footer-message {
          font-size: 12px;
          font-weight: bold;
          letter-spacing: 2px;
          margin: 6px 0;
          color: #2c3e50;
        }

        .footer-date {
          font-size: 10px;
          color: #95a5a6;
          margin-top: 6px;
        }

        /* Utility */
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .bold { font-weight: bold; }
        .small { font-size: 10px; }
        .muted { color: #95a5a6; }

        /* Data List - Tighter */
        .data-list {
          margin: 6px 0;
        }

        .data-item {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          border-bottom: 1px solid #eee;
          font-size: 11px;
        }

        .data-item:last-child {
          border-bottom: none;
        }

        .data-item .label { color: #e67e22; font-weight: 500; }
        .data-item .value { font-weight: 600; color: #2980b9; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="business-name">${businessInfo?.name || 'STORE'}</div>
        <div class="report-title">${title}</div>
        <div class="report-date">${getPeriodLabel(filters.timePeriod, filters.startDate, filters.endDate)}</div>
      </div>

      <div class="line"></div>

      <div class="info-row">
        <span>Branch:</span>
        <span>${filters.branchName || 'All Branches'}</span>
      </div>
      <div class="info-row">
        <span>Generated:</span>
        <span>${formatDateTime(new Date())}</span>
      </div>

      <div class="line"></div>

      ${content}

      <div class="double-line"></div>

      <div class="footer">
        <div class="thank-you">Thank you for your business!</div>
        <div class="footer-message">THANK YOU - COME AGAIN!</div>
        <div class="footer-date">${formatDateTime(new Date())}</div>
      </div>
    </body>
    </html>
  `
}

// Sales Report HTML - Classic Receipt Style
function generateSalesReportHTML(
  data: SalesReportData,
  filters: any,
  businessInfo?: any
): string {
  const content = `
    <div class="section">
      <div class="section-title">Sales Summary</div>
      <div class="data-list">
        <div class="data-item">
          <span class="label">Total Transactions:</span>
          <span class="value">${data.summary?.totalSales || 0}</span>
        </div>
        <div class="data-item">
          <span class="label">Average Order:</span>
          <span class="value">Rs. ${(data.summary?.avgOrderValue || 0).toFixed(2)}</span>
        </div>
        <div class="data-item">
          <span class="label">Tax Collected:</span>
          <span class="value">Rs. ${(data.summary?.totalTax || 0).toFixed(2)}</span>
        </div>
      </div>
      <div class="summary-row grand-total">
        <span>TOTAL REVENUE:</span>
        <span>Rs. ${(data.summary?.totalRevenue || 0).toFixed(2)}</span>
      </div>
    </div>

    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">By Payment Method</div>
      <div class="table-header">
        <span class="col-qty">#</span>
        <span class="col-item">Method</span>
        <span class="col-total">Amount</span>
      </div>
      ${data.byPaymentMethod
        ?.map(
          (item) => `
        <div class="table-row">
          <span class="col-qty">${item.count}</span>
          <span class="col-item">${item.paymentMethod}</span>
          <span class="col-total">Rs. ${item.total.toFixed(2)}</span>
        </div>
      `
        )
        .join('') || '<div class="text-center muted">No data available</div>'}
    </div>

    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">Top Selling Products</div>
      <div class="table-header">
        <span class="col-qty">QTY</span>
        <span class="col-item">Product</span>
        <span class="col-total">Revenue</span>
      </div>
      ${data.topProducts
        ?.slice(0, 10)
        .map(
          (item) => `
        <div class="table-row">
          <span class="col-qty">${item.quantitySold}</span>
          <span class="col-item">${item.productName}</span>
          <span class="col-total">Rs. ${item.revenue.toFixed(2)}</span>
        </div>
      `
        )
        .join('') || '<div class="text-center muted">No data available</div>'}
    </div>
  `

  return getReportTemplate('Sales Report', content, filters, businessInfo)
}

// Inventory Report HTML - Classic Receipt Style
function generateInventoryReportHTML(
  data: InventoryReportData,
  filters: any,
  businessInfo?: any
): string {
  const totalValue = data.stockValue?.reduce((sum, item) => sum + item.costValue, 0) || 0

  const content = `
    <div class="section">
      <div class="section-title">Inventory Summary</div>
      <div class="data-list">
        <div class="data-item">
          <span class="label">Low Stock Items:</span>
          <span class="value">${data.stockSummary?.[0]?.lowStockItems || 0}</span>
        </div>
        <div class="data-item">
          <span class="label">Out of Stock:</span>
          <span class="value">${data.stockSummary?.[0]?.outOfStockItems || 0}</span>
        </div>
      </div>
      <div class="summary-row grand-total">
        <span>STOCK VALUE:</span>
        <span>Rs. ${totalValue.toFixed(2)}</span>
      </div>
    </div>

    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">Stock by Branch</div>
      <div class="table-header">
        <span class="col-qty">Units</span>
        <span class="col-item">Branch</span>
        <span class="col-total">Low Stock</span>
      </div>
      ${data.stockSummary
        ?.map(
          (item) => `
        <div class="table-row">
          <span class="col-qty">${item.totalUnits}</span>
          <span class="col-item">${item.branchName}</span>
          <span class="col-total">${item.lowStockItems}</span>
        </div>
      `
        )
        .join('') || '<div class="text-center muted">No data available</div>'}
    </div>

    ${
      data.lowStock && data.lowStock.length > 0
        ? `
    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">** LOW STOCK ALERT **</div>
      <div class="table-header">
        <span class="col-qty">Qty</span>
        <span class="col-item">Product</span>
        <span class="col-total">Status</span>
      </div>
      ${data.lowStock
        .slice(0, 15)
        .map(
          (item) => `
        <div class="table-row">
          <span class="col-qty">${item.quantity}/${item.minQuantity}</span>
          <span class="col-item">${item.productName}</span>
          <span class="col-total">${item.quantity === 0 ? 'OUT!' : 'LOW'}</span>
        </div>
      `
        )
        .join('')}
    </div>
    `
        : ''
    }
  `

  return getReportTemplate('Inventory Report', content, filters, businessInfo)
}

// Profit & Loss Report HTML - Classic Receipt Style
function generateProfitLossReportHTML(
  data: ProfitLossData,
  filters: any,
  businessInfo?: any
): string {
  const content = `
    <div class="section">
      <div class="section-title">Financial Statement</div>

      <div class="data-list">
        <div class="data-item">
          <span class="label">Total Revenue:</span>
          <span class="value">Rs. ${(data.revenue || 0).toFixed(2)}</span>
        </div>
        <div class="data-item">
          <span class="label">Cost of Goods Sold:</span>
          <span class="value">- Rs. ${(data.costOfGoodsSold || 0).toFixed(2)}</span>
        </div>
      </div>

      <div class="dashed-line"></div>

      <div class="summary-row subtotal">
        <span>Gross Profit:</span>
        <span>Rs. ${(data.grossProfit || 0).toFixed(2)}</span>
      </div>
      <div class="data-item">
        <span class="label small">Gross Margin:</span>
        <span class="value">${(data.grossMargin || 0).toFixed(1)}%</span>
      </div>

      <div class="dashed-line"></div>

      <div class="data-item">
        <span class="label">Operating Expenses:</span>
        <span class="value">- Rs. ${(data.expenses || 0).toFixed(2)}</span>
      </div>

      <div class="line"></div>

      <div class="summary-row grand-total">
        <span>NET PROFIT:</span>
        <span>Rs. ${(data.netProfit || 0).toFixed(2)}</span>
      </div>
      <div class="data-item">
        <span class="label small">Net Margin:</span>
        <span class="value">${(data.netMargin || 0).toFixed(1)}%</span>
      </div>
    </div>

    ${
      data.expensesByCategory && data.expensesByCategory.length > 0
        ? `
    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">Expenses by Category</div>
      <div class="table-header">
        <span class="col-item">Category</span>
        <span class="col-total">Amount</span>
      </div>
      ${data.expensesByCategory
        .map(
          (item) => `
        <div class="table-row">
          <span class="col-item">${item.category}</span>
          <span class="col-total">Rs. ${item.total.toFixed(2)}</span>
        </div>
      `
        )
        .join('')}
    </div>
    `
        : ''
    }
  `

  return getReportTemplate('Profit & Loss', content, filters, businessInfo)
}

// Expense Report HTML - Classic Receipt Style
function generateExpenseReportHTML(
  data: ExpenseReportData,
  filters: any,
  businessInfo?: any
): string {
  const content = `
    <div class="section">
      <div class="section-title">Expense Summary</div>
      <div class="data-list">
        <div class="data-item">
          <span class="label">Total Count:</span>
          <span class="value">${data.summary?.expenseCount || 0}</span>
        </div>
        <div class="data-item">
          <span class="label">Average Expense:</span>
          <span class="value">Rs. ${(data.summary?.avgExpense || 0).toFixed(2)}</span>
        </div>
      </div>
      <div class="summary-row grand-total">
        <span>TOTAL EXPENSES:</span>
        <span>Rs. ${(data.summary?.totalExpenses || 0).toFixed(2)}</span>
      </div>
    </div>

    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">By Category</div>
      <div class="table-header">
        <span class="col-qty">#</span>
        <span class="col-item">Category</span>
        <span class="col-total">Amount</span>
      </div>
      ${data.expensesByCategory
        ?.map(
          (item) => `
        <div class="table-row">
          <span class="col-qty">${item.count}</span>
          <span class="col-item">${item.category}</span>
          <span class="col-total">Rs. ${item.amount.toFixed(2)}</span>
        </div>
      `
        )
        .join('') || '<div class="text-center muted">No data available</div>'}
    </div>

    ${
      data.topExpenses && data.topExpenses.length > 0
        ? `
    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">Recent Expenses</div>
      <div class="table-header">
        <span class="col-item">Description</span>
        <span class="col-total">Amount</span>
      </div>
      ${data.topExpenses
        .slice(0, 10)
        .map(
          (item) => `
        <div class="table-row">
          <span class="col-item">${item.category}${item.description ? ' - ' + item.description.substring(0, 15) : ''}</span>
          <span class="col-total">Rs. ${item.amount.toFixed(2)}</span>
        </div>
        <div class="small muted" style="padding-left:20px;">${formatDate(item.date)}</div>
      `
        )
        .join('')}
    </div>
    `
        : ''
    }
  `

  return getReportTemplate('Expense Report', content, filters, businessInfo)
}

// Purchase Report HTML - Classic Receipt Style
function generatePurchaseReportHTML(data: PurchaseReportData, filters: any, businessInfo?: any): string {
  const content = `
    <div class="section">
      <div class="section-title">Purchase Summary</div>
      <div class="data-list">
        <div class="data-item">
          <span class="label">Total Orders:</span>
          <span class="value">${data.summary?.totalPurchases || 0}</span>
        </div>
        <div class="data-item">
          <span class="label">Average Order:</span>
          <span class="value">Rs. ${(data.summary?.avgPurchaseValue || 0).toFixed(2)}</span>
        </div>
        <div class="data-item">
          <span class="label">Pending Payment:</span>
          <span class="value">Rs. ${(data.summary?.pendingPayments || 0).toFixed(2)}</span>
        </div>
      </div>
      <div class="summary-row grand-total">
        <span>TOTAL COST:</span>
        <span>Rs. ${(data.summary?.totalCost || 0).toFixed(2)}</span>
      </div>
    </div>

    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">By Supplier</div>
      <div class="table-header">
        <span class="col-qty">#</span>
        <span class="col-item">Supplier</span>
        <span class="col-total">Amount</span>
      </div>
      ${data.purchasesBySupplier
        ?.map(
          (item) => `
        <div class="table-row">
          <span class="col-qty">${item.totalPurchases}</span>
          <span class="col-item">${item.supplierName}</span>
          <span class="col-total">Rs. ${item.totalAmount.toFixed(2)}</span>
        </div>
      `
        )
        .join('') || '<div class="text-center muted">No data available</div>'}
    </div>

    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">By Status</div>
      <div class="table-header">
        <span class="col-qty">#</span>
        <span class="col-item">Status</span>
        <span class="col-total">Amount</span>
      </div>
      ${data.purchasesByStatus
        ?.map(
          (item) => `
        <div class="table-row">
          <span class="col-qty">${item.count}</span>
          <span class="col-item">${item.status}</span>
          <span class="col-total">Rs. ${item.totalAmount.toFixed(2)}</span>
        </div>
      `
        )
        .join('') || '<div class="text-center muted">No data available</div>'}
    </div>

    ${
      data.recentPurchases && data.recentPurchases.length > 0
        ? `
    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">Recent Orders</div>
      <div class="table-header">
        <span class="col-item">PO Number</span>
        <span class="col-total">Amount</span>
      </div>
      ${data.recentPurchases
        .slice(0, 8)
        .map(
          (item) => `
        <div class="table-row">
          <span class="col-item">${item.purchaseOrderNumber}</span>
          <span class="col-total">Rs. ${item.totalAmount.toFixed(2)}</span>
        </div>
        <div class="small muted" style="padding-left:20px;">${item.supplierName} | ${formatDate(item.createdAt)}</div>
      `
        )
        .join('')}
    </div>
    `
        : ''
    }
  `

  return getReportTemplate('Purchase Report', content, filters, businessInfo)
}

// Returns Report HTML - Classic Receipt Style
function generateReturnReportHTML(data: ReturnReportData, filters: any, businessInfo?: any): string {
  const content = `
    <div class="section">
      <div class="section-title">Returns Summary</div>
      <div class="data-list">
        <div class="data-item">
          <span class="label">Total Returns:</span>
          <span class="value">${data.summary?.totalReturns || 0}</span>
        </div>
        <div class="data-item">
          <span class="label">Return Rate:</span>
          <span class="value">${(data.summary?.returnRate || 0).toFixed(1)}%</span>
        </div>
      </div>
      <div class="summary-row grand-total">
        <span>REFUND VALUE:</span>
        <span>Rs. ${(data.summary?.totalValue || 0).toFixed(2)}</span>
      </div>
    </div>

    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">By Reason</div>
      <div class="table-header">
        <span class="col-qty">#</span>
        <span class="col-item">Reason</span>
        <span class="col-total">Value</span>
      </div>
      ${data.returnsByReason
        ?.map(
          (item) => `
        <div class="table-row">
          <span class="col-qty">${item.count}</span>
          <span class="col-item">${item.reason}</span>
          <span class="col-total">Rs. ${item.value.toFixed(2)}</span>
        </div>
      `
        )
        .join('') || '<div class="text-center muted">No data available</div>'}
    </div>

    ${
      data.returnsByProduct && data.returnsByProduct.length > 0
        ? `
    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">Most Returned Products</div>
      <div class="table-header">
        <span class="col-qty">QTY</span>
        <span class="col-item">Product</span>
        <span class="col-total">Value</span>
      </div>
      ${data.returnsByProduct
        .slice(0, 10)
        .map(
          (item) => `
        <div class="table-row">
          <span class="col-qty">${item.returnCount}</span>
          <span class="col-item">${item.productName}</span>
          <span class="col-total">Rs. ${item.totalValue.toFixed(2)}</span>
        </div>
      `
        )
        .join('')}
    </div>
    `
        : ''
    }
  `

  return getReportTemplate('Returns Report', content, filters, businessInfo)
}

// Commission Report HTML - Classic Receipt Style
function generateCommissionReportHTML(data: CommissionReportData, filters: any, businessInfo?: any): string {
  const content = `
    <div class="section">
      <div class="section-title">Commission Summary</div>
      <div class="data-list">
        <div class="data-item">
          <span class="label">Total Count:</span>
          <span class="value">${data.summary?.commissionCount || 0}</span>
        </div>
        <div class="data-item">
          <span class="label">Average:</span>
          <span class="value">Rs. ${(data.summary?.avgCommission || 0).toFixed(2)}</span>
        </div>
      </div>
      <div class="summary-row grand-total">
        <span>TOTAL PAID:</span>
        <span>Rs. ${(data.summary?.totalCommissions || 0).toFixed(2)}</span>
      </div>
    </div>

    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">By Salesperson</div>
      <div class="table-header">
        <span class="col-qty">Sales</span>
        <span class="col-item">Name</span>
        <span class="col-total">Commission</span>
      </div>
      ${data.commissionsBySalesperson
        ?.map(
          (item) => `
        <div class="table-row">
          <span class="col-qty">${item.salesCount}</span>
          <span class="col-item">${item.userName}</span>
          <span class="col-total">Rs. ${item.totalCommission.toFixed(2)}</span>
        </div>
      `
        )
        .join('') || '<div class="text-center muted">No data available</div>'}
    </div>

    ${
      data.recentCommissions && data.recentCommissions.length > 0
        ? `
    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">Recent Commissions</div>
      <div class="table-header">
        <span class="col-item">Salesperson</span>
        <span class="col-total">Amount</span>
      </div>
      ${data.recentCommissions
        .slice(0, 10)
        .map(
          (item) => `
        <div class="table-row">
          <span class="col-item">${item.userName}</span>
          <span class="col-total">Rs. ${item.amount.toFixed(2)}</span>
        </div>
        <div class="small muted" style="padding-left:20px;">${formatDate(item.date)} | ${item.saleInvoice}</div>
      `
        )
        .join('')}
    </div>
    `
        : ''
    }
  `

  return getReportTemplate('Commission Report', content, filters, businessInfo)
}

// Tax Report HTML - Classic Receipt Style
function generateTaxReportHTML(data: TaxReportData, filters: any, businessInfo?: any): string {
  const content = `
    <div class="section">
      <div class="section-title">Tax Summary</div>
      <div class="data-list">
        <div class="data-item">
          <span class="label">Taxable Sales:</span>
          <span class="value">Rs. ${(data.summary?.taxableSales || 0).toFixed(2)}</span>
        </div>
        <div class="data-item">
          <span class="label">Avg Tax per Sale:</span>
          <span class="value">Rs. ${(data.summary?.avgTaxPerSale || 0).toFixed(2)}</span>
        </div>
      </div>
      <div class="summary-row grand-total">
        <span>TAX COLLECTED:</span>
        <span>Rs. ${(data.summary?.totalTaxCollected || 0).toFixed(2)}</span>
      </div>
    </div>

    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">By Branch</div>
      <div class="table-header">
        <span class="col-item">Branch</span>
        <span class="col-total">Tax</span>
      </div>
      ${data.taxByBranch
        ?.map(
          (item) => `
        <div class="table-row">
          <span class="col-item">${item.branchName}</span>
          <span class="col-total">Rs. ${item.taxCollected.toFixed(2)}</span>
        </div>
      `
        )
        .join('') || '<div class="text-center muted">No data available</div>'}
    </div>

    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">By Payment Method</div>
      <div class="table-header">
        <span class="col-qty">#</span>
        <span class="col-item">Method</span>
        <span class="col-total">Tax</span>
      </div>
      ${data.taxByPaymentMethod
        ?.map(
          (item) => `
        <div class="table-row">
          <span class="col-qty">${item.salesCount}</span>
          <span class="col-item">${item.paymentMethod}</span>
          <span class="col-total">Rs. ${item.taxCollected.toFixed(2)}</span>
        </div>
      `
        )
        .join('') || '<div class="text-center muted">No data available</div>'}
    </div>
  `

  return getReportTemplate('Tax Report', content, filters, businessInfo)
}

// Customer Report HTML - Classic Receipt Style
function generateCustomerReportHTML(data: CustomerReportData, filters: any, businessInfo?: any): string {
  const content = `
    <div class="section">
      <div class="section-title">Customer Summary</div>
      <div class="data-list">
        <div class="data-item">
          <span class="label">Total Customers:</span>
          <span class="value">${data.summary?.totalCustomers || 0}</span>
        </div>
        <div class="data-item">
          <span class="label">Active:</span>
          <span class="value">${data.summary?.activeCustomers || 0}</span>
        </div>
        <div class="data-item">
          <span class="label">New This Period:</span>
          <span class="value">${data.summary?.newCustomers || 0}</span>
        </div>
      </div>
      <div class="summary-row grand-total">
        <span>TOTAL REVENUE:</span>
        <span>Rs. ${(data.summary?.totalRevenue || 0).toFixed(2)}</span>
      </div>
    </div>

    ${
      data.customerRetention
        ? `
    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">Retention Stats</div>
      <div class="data-list">
        <div class="data-item">
          <span class="label">Repeat Customers:</span>
          <span class="value">${data.customerRetention.repeatCustomers || 0}</span>
        </div>
        <div class="data-item">
          <span class="label">One-time Buyers:</span>
          <span class="value">${data.customerRetention.oneTimeCustomers || 0}</span>
        </div>
        <div class="data-item">
          <span class="label">Retention Rate:</span>
          <span class="value">${(data.customerRetention.repeatRate || 0).toFixed(1)}%</span>
        </div>
      </div>
    </div>
    `
        : ''
    }

    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">Top Customers</div>
      <div class="table-header">
        <span class="col-qty">Orders</span>
        <span class="col-item">Customer</span>
        <span class="col-total">Spent</span>
      </div>
      ${data.topCustomers
        ?.slice(0, 10)
        .map(
          (item) => `
        <div class="table-row">
          <span class="col-qty">${item.totalOrders}</span>
          <span class="col-item">${item.customerName}</span>
          <span class="col-total">Rs. ${item.totalSpent.toFixed(2)}</span>
        </div>
      `
        )
        .join('') || '<div class="text-center muted">No data available</div>'}
    </div>
  `

  return getReportTemplate('Customer Report', content, filters, businessInfo)
}

// Branch Performance Report HTML - Classic Receipt Style
function generateBranchPerformanceHTML(data: BranchPerformanceData, filters: any, businessInfo?: any): string {
  const content = `
    <div class="section">
      <div class="section-title">Performance Summary</div>
      <div class="data-list">
        <div class="data-item">
          <span class="label">Total Branches:</span>
          <span class="value">${data.summary?.totalBranches || 0}</span>
        </div>
        <div class="data-item">
          <span class="label">Total Revenue:</span>
          <span class="value">Rs. ${(data.summary?.totalRevenue || 0).toFixed(2)}</span>
        </div>
        ${
          data.topPerformingBranch
            ? `
        <div class="data-item">
          <span class="label">Top Branch:</span>
          <span class="value">${data.topPerformingBranch.branchName}</span>
        </div>
        `
            : ''
        }
      </div>
      <div class="summary-row grand-total">
        <span>TOTAL PROFIT:</span>
        <span>Rs. ${(data.summary?.totalProfit || 0).toFixed(2)}</span>
      </div>
    </div>

    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">Branch Rankings</div>
      ${data.branchMetrics
        ?.sort((a, b) => b.revenue - a.revenue)
        .map(
          (item, index) => `
        <div style="margin-bottom:2mm;padding-bottom:1mm;border-bottom:1px dotted #ddd;">
          <div class="table-row" style="padding:0;">
            <span class="col-qty bold">#${index + 1}</span>
            <span class="col-item bold">${item.branchName}</span>
          </div>
          <div class="data-list" style="padding-left:25px;margin-top:1mm;">
            <div class="data-item">
              <span class="label">Sales:</span>
              <span class="value">${item.salesCount}</span>
            </div>
            <div class="data-item">
              <span class="label">Revenue:</span>
              <span class="value">Rs. ${item.revenue.toFixed(2)}</span>
            </div>
            <div class="data-item">
              <span class="label">Expenses:</span>
              <span class="value">Rs. ${item.expenses.toFixed(2)}</span>
            </div>
            <div class="data-item">
              <span class="label">Profit:</span>
              <span class="value bold">Rs. ${item.profit.toFixed(2)}</span>
            </div>
          </div>
        </div>
      `
        )
        .join('') || '<div class="text-center muted">No data available</div>'}
    </div>
  `

  return getReportTemplate('Branch Performance', content, filters, businessInfo)
}

// Cash Flow Report HTML - Classic Receipt Style
function generateCashFlowHTML(data: CashFlowData, filters: any, businessInfo?: any): string {
  const content = `
    <div class="section">
      <div class="section-title">Cash Flow Summary</div>
      <div class="data-list">
        <div class="data-item">
          <span class="label">Opening Balance:</span>
          <span class="value">Rs. ${(data.summary?.openingBalance || 0).toFixed(2)}</span>
        </div>
        <div class="data-item">
          <span class="label">(+) Cash In:</span>
          <span class="value">Rs. ${(data.summary?.cashIn || 0).toFixed(2)}</span>
        </div>
        <div class="data-item">
          <span class="label">(-) Cash Out:</span>
          <span class="value">Rs. ${(data.summary?.cashOut || 0).toFixed(2)}</span>
        </div>
      </div>
      <div class="line"></div>
      <div class="summary-row grand-total">
        <span>CLOSING BALANCE:</span>
        <span>Rs. ${(data.summary?.closingBalance || 0).toFixed(2)}</span>
      </div>
      <div class="data-item">
        <span class="label">Net Cash Flow:</span>
        <span class="value">${(data.summary?.netCashFlow || 0) >= 0 ? '+' : ''}Rs. ${(data.summary?.netCashFlow || 0).toFixed(2)}</span>
      </div>
    </div>

    ${
      data.cashInBreakdown
        ? `
    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">Cash Inflow</div>
      <div class="table-header">
        <span class="col-item">Source</span>
        <span class="col-total">Amount</span>
      </div>
      <div class="table-row">
        <span class="col-item">Sales Revenue</span>
        <span class="col-total">+ Rs. ${(data.cashInBreakdown.sales || 0).toFixed(2)}</span>
      </div>
      <div class="table-row">
        <span class="col-item">Receivables</span>
        <span class="col-total">+ Rs. ${(data.cashInBreakdown.receivables || 0).toFixed(2)}</span>
      </div>
      <div class="table-row">
        <span class="col-item">Other Income</span>
        <span class="col-total">+ Rs. ${(data.cashInBreakdown.other || 0).toFixed(2)}</span>
      </div>
      <div class="summary-row total">
        <span>Total Cash In:</span>
        <span>Rs. ${(data.summary?.cashIn || 0).toFixed(2)}</span>
      </div>
    </div>
    `
        : ''
    }

    ${
      data.cashOutBreakdown
        ? `
    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">Cash Outflow</div>
      <div class="table-header">
        <span class="col-item">Category</span>
        <span class="col-total">Amount</span>
      </div>
      <div class="table-row">
        <span class="col-item">Purchases</span>
        <span class="col-total">- Rs. ${(data.cashOutBreakdown.purchases || 0).toFixed(2)}</span>
      </div>
      <div class="table-row">
        <span class="col-item">Expenses</span>
        <span class="col-total">- Rs. ${(data.cashOutBreakdown.expenses || 0).toFixed(2)}</span>
      </div>
      <div class="table-row">
        <span class="col-item">Commissions</span>
        <span class="col-total">- Rs. ${(data.cashOutBreakdown.commissions || 0).toFixed(2)}</span>
      </div>
      <div class="table-row">
        <span class="col-item">Refunds</span>
        <span class="col-total">- Rs. ${(data.cashOutBreakdown.refunds || 0).toFixed(2)}</span>
      </div>
      <div class="summary-row total">
        <span>Total Cash Out:</span>
        <span>Rs. ${(data.summary?.cashOut || 0).toFixed(2)}</span>
      </div>
    </div>
    `
        : ''
    }

    ${
      data.cashByBranch && data.cashByBranch.length > 0
        ? `
    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">Cash by Branch</div>
      <div class="table-header">
        <span class="col-item">Branch</span>
        <span class="col-total">Cash in Hand</span>
      </div>
      ${data.cashByBranch
        .map(
          (item) => `
        <div class="table-row">
          <span class="col-item">${item.branchName}</span>
          <span class="col-total">Rs. ${item.cashInHand.toFixed(2)}</span>
        </div>
      `
        )
        .join('')}
    </div>
    `
        : ''
    }
  `

  return getReportTemplate('Cash Flow Report', content, filters, businessInfo)
}

// Audit Trail Report HTML - Classic Receipt Style
function generateAuditTrailHTML(data: AuditTrailData, filters: any, businessInfo?: any): string {
  const content = `
    <div class="section">
      <div class="section-title">Business Summary</div>
      <div class="data-list">
        <div class="data-item">
          <span class="label">Total Sales:</span>
          <span class="value">${data.salesSummary?.totalSales || 0}</span>
        </div>
        <div class="data-item">
          <span class="label">Revenue:</span>
          <span class="value">Rs. ${(data.salesSummary?.totalRevenue || 0).toFixed(2)}</span>
        </div>
        <div class="data-item">
          <span class="label">Expenses:</span>
          <span class="value">Rs. ${(data.expensesSummary?.totalExpenses || 0).toFixed(2)}</span>
        </div>
        <div class="data-item">
          <span class="label">Inventory Value:</span>
          <span class="value">Rs. ${(data.inventorySummary?.totalValue || 0).toFixed(2)}</span>
        </div>
      </div>
      <div class="summary-row grand-total">
        <span>NET PROFIT:</span>
        <span>Rs. ${(data.financialSummary?.netProfit || 0).toFixed(2)}</span>
      </div>
    </div>

    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">Sales Details</div>
      <div class="data-list">
        <div class="data-item">
          <span class="label">Transactions:</span>
          <span class="value">${data.salesSummary?.totalSales || 0}</span>
        </div>
        <div class="data-item">
          <span class="label">Avg Order Value:</span>
          <span class="value">Rs. ${(data.salesSummary?.avgOrderValue || 0).toFixed(2)}</span>
        </div>
        <div class="data-item">
          <span class="label">Tax Collected:</span>
          <span class="value">Rs. ${(data.salesSummary?.totalTax || 0).toFixed(2)}</span>
        </div>
      </div>
    </div>

    ${
      data.salesByPaymentMethod && data.salesByPaymentMethod.length > 0
        ? `
    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">Sales by Payment</div>
      <div class="table-header">
        <span class="col-qty">#</span>
        <span class="col-item">Method</span>
        <span class="col-total">Amount</span>
      </div>
      ${data.salesByPaymentMethod
        .map(
          (item) => `
        <div class="table-row">
          <span class="col-qty">${item.count}</span>
          <span class="col-item">${item.paymentMethod}</span>
          <span class="col-total">Rs. ${item.total.toFixed(2)}</span>
        </div>
      `
        )
        .join('')}
    </div>
    `
        : ''
    }

    ${
      data.topProducts && data.topProducts.length > 0
        ? `
    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">Top Products</div>
      <div class="table-header">
        <span class="col-qty">QTY</span>
        <span class="col-item">Product</span>
        <span class="col-total">Revenue</span>
      </div>
      ${data.topProducts
        .slice(0, 5)
        .map(
          (item) => `
        <div class="table-row">
          <span class="col-qty">${item.quantitySold}</span>
          <span class="col-item">${item.productName}</span>
          <span class="col-total">Rs. ${item.revenue.toFixed(2)}</span>
        </div>
      `
        )
        .join('')}
    </div>
    `
        : ''
    }

    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">Inventory Status</div>
      <div class="data-list">
        <div class="data-item">
          <span class="label">Total Products:</span>
          <span class="value">${data.inventorySummary?.totalProducts || 0}</span>
        </div>
        <div class="data-item">
          <span class="label">Low Stock Items:</span>
          <span class="value">${data.inventorySummary?.lowStockItems || 0}</span>
        </div>
        <div class="data-item">
          <span class="label">Out of Stock:</span>
          <span class="value">${data.inventorySummary?.outOfStockItems || 0}</span>
        </div>
      </div>
    </div>

    ${
      data.financialSummary
        ? `
    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">P&L Statement</div>
      <div class="data-list">
        <div class="data-item">
          <span class="label">Gross Revenue:</span>
          <span class="value">Rs. ${(data.financialSummary.grossRevenue || 0).toFixed(2)}</span>
        </div>
        <div class="data-item">
          <span class="label">(-) Refunds:</span>
          <span class="value">Rs. ${(data.financialSummary.refunds || 0).toFixed(2)}</span>
        </div>
        <div class="data-item">
          <span class="label">Net Revenue:</span>
          <span class="value">Rs. ${(data.financialSummary.netRevenue || 0).toFixed(2)}</span>
        </div>
        <div class="data-item">
          <span class="label">(-) COGS:</span>
          <span class="value">Rs. ${(data.financialSummary.cogs || 0).toFixed(2)}</span>
        </div>
        <div class="data-item">
          <span class="label">Gross Profit:</span>
          <span class="value">Rs. ${(data.financialSummary.grossProfit || 0).toFixed(2)}</span>
        </div>
        <div class="data-item">
          <span class="label">(-) Expenses:</span>
          <span class="value">Rs. ${(data.financialSummary.expenses || 0).toFixed(2)}</span>
        </div>
      </div>
      <div class="line"></div>
      <div class="summary-row grand-total">
        <span>NET PROFIT:</span>
        <span>Rs. ${(data.financialSummary.netProfit || 0).toFixed(2)}</span>
      </div>
      <div class="data-item">
        <span class="label">Profit Margin:</span>
        <span class="value">${(data.financialSummary.profitMargin || 0).toFixed(1)}%</span>
      </div>
    </div>
    `
        : ''
    }

    ${
      data.auditLogs && data.auditLogs.length > 0
        ? `
    <div class="dashed-line"></div>

    <div class="section">
      <div class="section-title">Recent Activity</div>
      <div class="table-header">
        <span class="col-item">Action</span>
        <span class="col-total">User</span>
      </div>
      ${data.auditLogs
        .slice(0, 10)
        .map(
          (item) => `
        <div class="table-row">
          <span class="col-item">${item.action} ${item.tableName}</span>
          <span class="col-total">${item.userName}</span>
        </div>
        <div class="small muted" style="padding-left:20px;">${formatDateTime(item.timestamp)}</div>
      `
        )
        .join('')}
    </div>
    `
        : ''
    }
  `

  return getReportTemplate('Audit Report', content, filters, businessInfo)
}
