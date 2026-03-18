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

  const pdfWindow = new BrowserWindow({
    show: false,
    width: 800,
    height: 1200,
    webPreferences: {
      nodeIntegration: false,
      offscreen: true,
    },
  })

  await pdfWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`)
  await new Promise((resolve) => setTimeout(resolve, 1500))

  const pdfData = await pdfWindow.webContents.printToPDF({
    pageSize: 'A4',
    printBackground: true,
    landscape: false,
    margins: {
      top: 0.4,
      bottom: 0.4,
      left: 0.4,
      right: 0.4,
    },
  })

  const downloadsPath = app.getPath('downloads')
  const fileName = `${reportType}_report_${Date.now()}.pdf`
  const filePath = path.join(downloadsPath, fileName)

  fs.writeFileSync(filePath, pdfData)
  pdfWindow.close()

  return filePath
}

// ── Helpers ────────────────────────────────────────────────
function fmtCurrency(amount: number): string {
  return `Rs. ${(amount || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtNum(n: number): string {
  return (n || 0).toLocaleString('en-PK')
}

function fmtPct(n: number): string {
  return `${(n || 0).toFixed(1)}%`
}

// ── Master Template ────────────────────────────────────────
function getReportTemplate(
  title: string,
  content: string,
  filters: any,
  businessInfo?: any
): string {
  const bizName = businessInfo?.name || 'Business'
  const bizAddress = businessInfo?.address || ''
  const bizPhone = businessInfo?.phone || ''
  const bizEmail = businessInfo?.email || ''
  const hasContact = bizAddress || bizPhone || bizEmail
  const periodLabel = getPeriodLabel(filters.timePeriod, filters.startDate, filters.endDate)
  const generatedAt = formatDateTime(new Date())

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { size: A4; margin: 12mm 14mm; }

  body {
    font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
    font-size: 11px;
    line-height: 1.5;
    color: #1e293b;
    background: #fff;
  }

  /* ── Header ── */
  .report-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 14px;
    border-bottom: 2px solid #0f172a;
    margin-bottom: 16px;
  }
  .biz-block {}
  .biz-name {
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: 0.5px;
    line-height: 1.2;
  }
  .biz-contact {
    font-size: 9px;
    color: #64748b;
    margin-top: 4px;
    line-height: 1.6;
  }
  .report-meta {
    text-align: right;
  }
  .report-title {
    font-size: 14px;
    font-weight: 700;
    color: #0f172a;
    text-transform: uppercase;
    letter-spacing: 1.5px;
  }
  .report-period {
    font-size: 10px;
    color: #475569;
    margin-top: 3px;
  }
  .report-branch {
    display: inline-block;
    margin-top: 5px;
    padding: 2px 8px;
    background: #f1f5f9;
    border-radius: 3px;
    font-size: 9px;
    font-weight: 600;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* ── KPI Cards ── */
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin-bottom: 18px;
  }
  .kpi-grid.cols-3 { grid-template-columns: repeat(3, 1fr); }
  .kpi-grid.cols-2 { grid-template-columns: repeat(2, 1fr); }
  .kpi-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 12px 14px;
  }
  .kpi-card.highlight {
    background: #0f172a;
    border-color: #0f172a;
  }
  .kpi-card.highlight .kpi-label { color: #94a3b8; }
  .kpi-card.highlight .kpi-value { color: #fff; }
  .kpi-card.accent {
    background: #fefce8;
    border-color: #fde68a;
  }
  .kpi-card.danger {
    background: #fef2f2;
    border-color: #fecaca;
  }
  .kpi-card.danger .kpi-value { color: #dc2626; }
  .kpi-card.success {
    background: #f0fdf4;
    border-color: #bbf7d0;
  }
  .kpi-card.success .kpi-value { color: #16a34a; }
  .kpi-label {
    font-size: 8.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: #64748b;
    margin-bottom: 4px;
  }
  .kpi-value {
    font-size: 16px;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.2;
  }
  .kpi-sub {
    font-size: 9px;
    color: #94a3b8;
    margin-top: 2px;
  }

  /* ── Sections ── */
  .section {
    margin-bottom: 16px;
  }
  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 1px solid #e2e8f0;
  }
  .section-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #0f172a;
  }
  .section-badge {
    font-size: 8px;
    font-weight: 600;
    padding: 2px 6px;
    background: #f1f5f9;
    border-radius: 3px;
    color: #64748b;
  }

  /* ── Tables ── */
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 10.5px;
  }
  table thead th {
    text-align: left;
    font-size: 8.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: #64748b;
    padding: 6px 10px;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }
  table thead th:last-child { text-align: right; }
  table tbody td {
    padding: 7px 10px;
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
  }
  table tbody td:last-child {
    text-align: right;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  table tbody tr:last-child td { border-bottom: none; }
  table tbody tr:nth-child(even) { background: #fafbfc; }
  .col-num {
    width: 40px;
    text-align: center;
    color: #94a3b8;
    font-weight: 500;
  }

  /* ── Data Rows (key-value pairs) ── */
  .data-rows {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 2px 0;
    overflow: hidden;
  }
  .data-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 7px 14px;
    font-size: 11px;
  }
  .data-row + .data-row { border-top: 1px solid #e2e8f0; }
  .data-row .label {
    color: #475569;
    font-weight: 500;
  }
  .data-row .value {
    font-weight: 600;
    color: #0f172a;
    font-variant-numeric: tabular-nums;
  }
  .data-row.total {
    background: #0f172a;
    padding: 10px 14px;
  }
  .data-row.total .label { color: #cbd5e1; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  .data-row.total .value { color: #fff; font-size: 14px; font-weight: 700; }
  .data-row.subtotal {
    background: #f1f5f9;
  }
  .data-row.subtotal .label { font-weight: 600; }
  .data-row.subtotal .value { font-weight: 700; }
  .data-row.deduction .value { color: #dc2626; }
  .data-row.positive .value { color: #16a34a; }

  /* ── Two Column Layout ── */
  .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  /* ── Alert Box ── */
  .alert {
    padding: 10px 14px;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 500;
    margin-bottom: 14px;
  }
  .alert.warning {
    background: #fef3c7;
    border: 1px solid #fde68a;
    color: #92400e;
  }
  .alert.danger {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #991b1b;
  }

  /* ── Footer ── */
  .report-footer {
    margin-top: 20px;
    padding-top: 10px;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 8.5px;
    color: #94a3b8;
  }
  .footer-left { }
  .footer-right { text-align: right; }

  /* ── Utility ── */
  .text-right { text-align: right; }
  .text-center { text-align: center; }
  .text-danger { color: #dc2626; }
  .text-success { color: #16a34a; }
  .text-muted { color: #94a3b8; }
  .mb-0 { margin-bottom: 0; }
  .mt-sm { margin-top: 8px; }

  /* ── Page break ── */
  .page-break { page-break-before: always; }
</style>
</head>
<body>

  <!-- Header -->
  <div class="report-header">
    <div class="biz-block">
      <div class="biz-name">${bizName}</div>
      ${hasContact ? `<div class="biz-contact">
        ${bizAddress ? `${bizAddress}<br>` : ''}
        ${bizPhone ? `Tel: ${bizPhone}` : ''}${bizPhone && bizEmail ? ' &nbsp;|&nbsp; ' : ''}${bizEmail ? `Email: ${bizEmail}` : ''}
      </div>` : ''}
    </div>
    <div class="report-meta">
      <div class="report-title">${title}</div>
      <div class="report-period">${periodLabel}</div>
      <div class="report-branch">${filters.branchName || 'All Branches'}</div>
    </div>
  </div>

  <!-- Content -->
  ${content}

  <!-- Footer -->
  <div class="report-footer">
    <div class="footer-left">
      Generated: ${generatedAt} &nbsp;|&nbsp; ${bizName}
    </div>
    <div class="footer-right">
      Confidential &mdash; For Internal Use Only
    </div>
  </div>

</body></html>`
}

// ══════════════════════════════════════════════════════════
// SALES REPORT
// ══════════════════════════════════════════════════════════
function generateSalesReportHTML(data: SalesReportData, filters: any, businessInfo?: any): string {
  const content = `
    <div class="kpi-grid">
      <div class="kpi-card highlight">
        <div class="kpi-label">Total Revenue</div>
        <div class="kpi-value">${fmtCurrency(data.summary?.totalRevenue || 0)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Transactions</div>
        <div class="kpi-value">${fmtNum(data.summary?.totalSales || 0)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Avg Order Value</div>
        <div class="kpi-value">${fmtCurrency(data.summary?.avgOrderValue || 0)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Tax Collected</div>
        <div class="kpi-value">${fmtCurrency(data.summary?.totalTax || 0)}</div>
      </div>
    </div>

    <div class="two-col">
      <div class="section">
        <div class="section-header">
          <div class="section-title">By Payment Method</div>
          <div class="section-badge">${data.byPaymentMethod?.length || 0} methods</div>
        </div>
        <table>
          <thead><tr><th>Method</th><th>Count</th><th>Amount</th></tr></thead>
          <tbody>
            ${data.byPaymentMethod?.map(item => `
              <tr>
                <td>${item.paymentMethod}</td>
                <td class="col-num">${fmtNum(item.count)}</td>
                <td>${fmtCurrency(item.total)}</td>
              </tr>
            `).join('') || '<tr><td colspan="3" class="text-center text-muted">No data</td></tr>'}
          </tbody>
        </table>
      </div>

      <div class="section">
        <div class="section-header">
          <div class="section-title">Top Products</div>
          <div class="section-badge">Top 10</div>
        </div>
        <table>
          <thead><tr><th>Product</th><th>Qty</th><th>Revenue</th></tr></thead>
          <tbody>
            ${data.topProducts?.slice(0, 10).map(item => `
              <tr>
                <td>${item.productName}</td>
                <td class="col-num">${fmtNum(item.quantitySold)}</td>
                <td>${fmtCurrency(item.revenue)}</td>
              </tr>
            `).join('') || '<tr><td colspan="3" class="text-center text-muted">No data</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>

    ${data.dailySales && data.dailySales.length > 0 ? `
    <div class="section">
      <div class="section-header">
        <div class="section-title">Daily Breakdown</div>
        <div class="section-badge">${data.dailySales.length} days</div>
      </div>
      <table>
        <thead><tr><th>Date</th><th>Transactions</th><th>Revenue</th></tr></thead>
        <tbody>
          ${data.dailySales.map(item => `
            <tr>
              <td>${formatDate(item.date)}</td>
              <td class="col-num">${fmtNum(item.count)}</td>
              <td>${fmtCurrency(item.total)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}
  `
  return getReportTemplate('Sales Report', content, filters, businessInfo)
}

// ══════════════════════════════════════════════════════════
// INVENTORY REPORT
// ══════════════════════════════════════════════════════════
function generateInventoryReportHTML(data: InventoryReportData, filters: any, businessInfo?: any): string {
  const totalValue = data.stockValue?.reduce((sum, item) => sum + item.costValue, 0) || 0
  const totalRetail = data.stockValue?.reduce((sum, item) => sum + item.retailValue, 0) || 0
  const lowCount = data.stockSummary?.[0]?.lowStockItems || 0
  const outCount = data.stockSummary?.[0]?.outOfStockItems || 0

  const content = `
    <div class="kpi-grid">
      <div class="kpi-card highlight">
        <div class="kpi-label">Stock Value (Cost)</div>
        <div class="kpi-value">${fmtCurrency(totalValue)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Retail Value</div>
        <div class="kpi-value">${fmtCurrency(totalRetail)}</div>
      </div>
      <div class="kpi-card${lowCount > 0 ? ' accent' : ''}">
        <div class="kpi-label">Low Stock Items</div>
        <div class="kpi-value">${fmtNum(lowCount)}</div>
      </div>
      <div class="kpi-card${outCount > 0 ? ' danger' : ''}">
        <div class="kpi-label">Out of Stock</div>
        <div class="kpi-value">${fmtNum(outCount)}</div>
      </div>
    </div>

    ${(lowCount > 0 || outCount > 0) ? `
    <div class="alert ${outCount > 0 ? 'danger' : 'warning'}">
      ${outCount > 0 ? `&#9888; ${outCount} product(s) are OUT OF STOCK and need immediate restocking.` : ''}
      ${lowCount > 0 ? `${outCount > 0 ? '<br>' : '&#9888; '}${lowCount} product(s) are running low on stock.` : ''}
    </div>
    ` : ''}

    <div class="section">
      <div class="section-header">
        <div class="section-title">Stock by Branch</div>
      </div>
      <table>
        <thead><tr><th>Branch</th><th>Products</th><th>Units</th><th>Low Stock</th><th>Out of Stock</th></tr></thead>
        <tbody>
          ${data.stockSummary?.map(item => `
            <tr>
              <td>${item.branchName}</td>
              <td class="col-num">${fmtNum(item.totalProducts)}</td>
              <td class="col-num">${fmtNum(item.totalUnits)}</td>
              <td class="col-num${item.lowStockItems > 0 ? ' text-danger' : ''}">${item.lowStockItems}</td>
              <td class="col-num${item.outOfStockItems > 0 ? ' text-danger' : ''}">${item.outOfStockItems}</td>
            </tr>
          `).join('') || '<tr><td colspan="5" class="text-center text-muted">No data</td></tr>'}
        </tbody>
      </table>
    </div>

    ${data.lowStock && data.lowStock.length > 0 ? `
    <div class="section">
      <div class="section-header">
        <div class="section-title">Low Stock Alert</div>
        <div class="section-badge">${data.lowStock.length} items</div>
      </div>
      <table>
        <thead><tr><th>Product</th><th>Code</th><th>Branch</th><th>Current</th><th>Min Required</th></tr></thead>
        <tbody>
          ${data.lowStock.slice(0, 20).map(item => `
            <tr>
              <td>${item.productName}</td>
              <td>${item.productCode || '-'}</td>
              <td>${item.branchName}</td>
              <td class="col-num ${item.quantity === 0 ? 'text-danger' : ''}">${item.quantity}</td>
              <td class="col-num">${item.minQuantity}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}
  `
  return getReportTemplate('Inventory Report', content, filters, businessInfo)
}

// ══════════════════════════════════════════════════════════
// PROFIT & LOSS
// ══════════════════════════════════════════════════════════
function generateProfitLossReportHTML(data: ProfitLossData, filters: any, businessInfo?: any): string {
  const isProfit = (data.netProfit || 0) >= 0

  const content = `
    <div class="kpi-grid cols-3">
      <div class="kpi-card">
        <div class="kpi-label">Revenue</div>
        <div class="kpi-value">${fmtCurrency(data.revenue || 0)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Gross Profit</div>
        <div class="kpi-value">${fmtCurrency(data.grossProfit || 0)}</div>
        <div class="kpi-sub">Margin: ${fmtPct(data.grossMargin || 0)}</div>
      </div>
      <div class="kpi-card ${isProfit ? 'success' : 'danger'}">
        <div class="kpi-label">Net Profit</div>
        <div class="kpi-value">${fmtCurrency(data.netProfit || 0)}</div>
        <div class="kpi-sub">Margin: ${fmtPct(data.netMargin || 0)}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <div class="section-title">Profit &amp; Loss Statement</div>
      </div>
      <div class="data-rows">
        <div class="data-row">
          <span class="label">Total Revenue</span>
          <span class="value">${fmtCurrency(data.revenue || 0)}</span>
        </div>
        <div class="data-row deduction">
          <span class="label">Less: Cost of Goods Sold</span>
          <span class="value">(${fmtCurrency(data.costOfGoodsSold || 0)})</span>
        </div>
        <div class="data-row subtotal">
          <span class="label">Gross Profit</span>
          <span class="value">${fmtCurrency(data.grossProfit || 0)}</span>
        </div>
        <div class="data-row deduction">
          <span class="label">Less: Operating Expenses</span>
          <span class="value">(${fmtCurrency(data.expenses || 0)})</span>
        </div>
        <div class="data-row total">
          <span class="label">Net Profit / (Loss)</span>
          <span class="value">${fmtCurrency(data.netProfit || 0)}</span>
        </div>
      </div>
    </div>

    ${data.expensesByCategory && data.expensesByCategory.length > 0 ? `
    <div class="section">
      <div class="section-header">
        <div class="section-title">Expense Breakdown</div>
      </div>
      <table>
        <thead><tr><th>Category</th><th>Amount</th></tr></thead>
        <tbody>
          ${data.expensesByCategory.map(item => `
            <tr>
              <td>${item.category}</td>
              <td>${fmtCurrency(item.total)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}
  `
  return getReportTemplate('Profit & Loss', content, filters, businessInfo)
}

// ══════════════════════════════════════════════════════════
// EXPENSE REPORT
// ══════════════════════════════════════════════════════════
function generateExpenseReportHTML(data: ExpenseReportData, filters: any, businessInfo?: any): string {
  const content = `
    <div class="kpi-grid cols-3">
      <div class="kpi-card highlight">
        <div class="kpi-label">Total Expenses</div>
        <div class="kpi-value">${fmtCurrency(data.summary?.totalExpenses || 0)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Expense Count</div>
        <div class="kpi-value">${fmtNum(data.summary?.expenseCount || 0)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Average Expense</div>
        <div class="kpi-value">${fmtCurrency(data.summary?.avgExpense || 0)}</div>
      </div>
    </div>

    <div class="two-col">
      <div class="section">
        <div class="section-header">
          <div class="section-title">By Category</div>
        </div>
        <table>
          <thead><tr><th>Category</th><th>Count</th><th>Amount</th></tr></thead>
          <tbody>
            ${data.expensesByCategory?.map(item => `
              <tr>
                <td>${item.category}</td>
                <td class="col-num">${fmtNum(item.count)}</td>
                <td>${fmtCurrency(item.amount)}</td>
              </tr>
            `).join('') || '<tr><td colspan="3" class="text-center text-muted">No data</td></tr>'}
          </tbody>
        </table>
      </div>

      ${data.topExpenses && data.topExpenses.length > 0 ? `
      <div class="section">
        <div class="section-header">
          <div class="section-title">Recent Expenses</div>
        </div>
        <table>
          <thead><tr><th>Description</th><th>Date</th><th>Amount</th></tr></thead>
          <tbody>
            ${data.topExpenses.slice(0, 10).map(item => `
              <tr>
                <td>${item.category}${item.description ? ' - ' + item.description.substring(0, 20) : ''}</td>
                <td>${formatDate(item.date)}</td>
                <td>${fmtCurrency(item.amount)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}
    </div>
  `
  return getReportTemplate('Expense Report', content, filters, businessInfo)
}

// ══════════════════════════════════════════════════════════
// PURCHASE REPORT
// ══════════════════════════════════════════════════════════
function generatePurchaseReportHTML(data: PurchaseReportData, filters: any, businessInfo?: any): string {
  const content = `
    <div class="kpi-grid">
      <div class="kpi-card highlight">
        <div class="kpi-label">Total Cost</div>
        <div class="kpi-value">${fmtCurrency(data.summary?.totalCost || 0)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Total Orders</div>
        <div class="kpi-value">${fmtNum(data.summary?.totalPurchases || 0)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Avg Order Value</div>
        <div class="kpi-value">${fmtCurrency(data.summary?.avgPurchaseValue || 0)}</div>
      </div>
      <div class="kpi-card${(data.summary?.pendingPayments || 0) > 0 ? ' danger' : ''}">
        <div class="kpi-label">Pending Payment</div>
        <div class="kpi-value">${fmtCurrency(data.summary?.pendingPayments || 0)}</div>
      </div>
    </div>

    <div class="two-col">
      <div class="section">
        <div class="section-header">
          <div class="section-title">By Supplier</div>
        </div>
        <table>
          <thead><tr><th>Supplier</th><th>Orders</th><th>Amount</th></tr></thead>
          <tbody>
            ${data.purchasesBySupplier?.map(item => `
              <tr>
                <td>${item.supplierName}</td>
                <td class="col-num">${fmtNum(item.totalPurchases)}</td>
                <td>${fmtCurrency(item.totalAmount)}</td>
              </tr>
            `).join('') || '<tr><td colspan="3" class="text-center text-muted">No data</td></tr>'}
          </tbody>
        </table>
      </div>

      <div class="section">
        <div class="section-header">
          <div class="section-title">By Status</div>
        </div>
        <table>
          <thead><tr><th>Status</th><th>Count</th><th>Amount</th></tr></thead>
          <tbody>
            ${data.purchasesByStatus?.map(item => `
              <tr>
                <td>${item.status}</td>
                <td class="col-num">${fmtNum(item.count)}</td>
                <td>${fmtCurrency(item.totalAmount)}</td>
              </tr>
            `).join('') || '<tr><td colspan="3" class="text-center text-muted">No data</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>

    ${data.recentPurchases && data.recentPurchases.length > 0 ? `
    <div class="section">
      <div class="section-header">
        <div class="section-title">Recent Orders</div>
      </div>
      <table>
        <thead><tr><th>PO Number</th><th>Supplier</th><th>Date</th><th>Amount</th></tr></thead>
        <tbody>
          ${data.recentPurchases.slice(0, 10).map(item => `
            <tr>
              <td>${item.purchaseOrderNumber}</td>
              <td>${item.supplierName}</td>
              <td>${formatDate(item.createdAt)}</td>
              <td>${fmtCurrency(item.totalAmount)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}
  `
  return getReportTemplate('Purchase Report', content, filters, businessInfo)
}

// ══════════════════════════════════════════════════════════
// RETURNS REPORT
// ══════════════════════════════════════════════════════════
function generateReturnReportHTML(data: ReturnReportData, filters: any, businessInfo?: any): string {
  const content = `
    <div class="kpi-grid cols-3">
      <div class="kpi-card highlight">
        <div class="kpi-label">Refund Value</div>
        <div class="kpi-value">${fmtCurrency(data.summary?.totalValue || 0)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Total Returns</div>
        <div class="kpi-value">${fmtNum(data.summary?.totalReturns || 0)}</div>
      </div>
      <div class="kpi-card${(data.summary?.returnRate || 0) > 5 ? ' danger' : ''}">
        <div class="kpi-label">Return Rate</div>
        <div class="kpi-value">${fmtPct(data.summary?.returnRate || 0)}</div>
      </div>
    </div>

    <div class="two-col">
      <div class="section">
        <div class="section-header">
          <div class="section-title">By Reason</div>
        </div>
        <table>
          <thead><tr><th>Reason</th><th>Count</th><th>Value</th></tr></thead>
          <tbody>
            ${data.returnsByReason?.map(item => `
              <tr>
                <td>${item.reason}</td>
                <td class="col-num">${fmtNum(item.count)}</td>
                <td>${fmtCurrency(item.value)}</td>
              </tr>
            `).join('') || '<tr><td colspan="3" class="text-center text-muted">No data</td></tr>'}
          </tbody>
        </table>
      </div>

      ${data.returnsByProduct && data.returnsByProduct.length > 0 ? `
      <div class="section">
        <div class="section-header">
          <div class="section-title">Most Returned Products</div>
        </div>
        <table>
          <thead><tr><th>Product</th><th>Returns</th><th>Value</th></tr></thead>
          <tbody>
            ${data.returnsByProduct.slice(0, 10).map(item => `
              <tr>
                <td>${item.productName}</td>
                <td class="col-num">${fmtNum(item.returnCount)}</td>
                <td>${fmtCurrency(item.totalValue)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}
    </div>
  `
  return getReportTemplate('Returns Report', content, filters, businessInfo)
}

// ══════════════════════════════════════════════════════════
// COMMISSION REPORT
// ══════════════════════════════════════════════════════════
function generateCommissionReportHTML(data: CommissionReportData, filters: any, businessInfo?: any): string {
  const content = `
    <div class="kpi-grid cols-3">
      <div class="kpi-card highlight">
        <div class="kpi-label">Total Paid</div>
        <div class="kpi-value">${fmtCurrency(data.summary?.totalCommissions || 0)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Commission Count</div>
        <div class="kpi-value">${fmtNum(data.summary?.commissionCount || 0)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Average</div>
        <div class="kpi-value">${fmtCurrency(data.summary?.avgCommission || 0)}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <div class="section-title">By Salesperson</div>
      </div>
      <table>
        <thead><tr><th>Name</th><th>Sales</th><th>Commission</th></tr></thead>
        <tbody>
          ${data.commissionsBySalesperson?.map(item => `
            <tr>
              <td>${item.userName}</td>
              <td class="col-num">${fmtNum(item.salesCount)}</td>
              <td>${fmtCurrency(item.totalCommission)}</td>
            </tr>
          `).join('') || '<tr><td colspan="3" class="text-center text-muted">No data</td></tr>'}
        </tbody>
      </table>
    </div>

    ${data.recentCommissions && data.recentCommissions.length > 0 ? `
    <div class="section">
      <div class="section-header">
        <div class="section-title">Recent Commissions</div>
      </div>
      <table>
        <thead><tr><th>Salesperson</th><th>Invoice</th><th>Date</th><th>Amount</th></tr></thead>
        <tbody>
          ${data.recentCommissions.slice(0, 10).map(item => `
            <tr>
              <td>${item.userName}</td>
              <td>${item.saleInvoice}</td>
              <td>${formatDate(item.date)}</td>
              <td>${fmtCurrency(item.amount)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}
  `
  return getReportTemplate('Commission Report', content, filters, businessInfo)
}

// ══════════════════════════════════════════════════════════
// TAX REPORT
// ══════════════════════════════════════════════════════════
function generateTaxReportHTML(data: TaxReportData, filters: any, businessInfo?: any): string {
  const content = `
    <div class="kpi-grid cols-3">
      <div class="kpi-card highlight">
        <div class="kpi-label">Total Tax Collected</div>
        <div class="kpi-value">${fmtCurrency(data.summary?.totalTaxCollected || 0)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Taxable Sales</div>
        <div class="kpi-value">${fmtCurrency(data.summary?.taxableSales || 0)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Avg Tax per Sale</div>
        <div class="kpi-value">${fmtCurrency(data.summary?.avgTaxPerSale || 0)}</div>
      </div>
    </div>

    <div class="two-col">
      <div class="section">
        <div class="section-header">
          <div class="section-title">By Branch</div>
        </div>
        <table>
          <thead><tr><th>Branch</th><th>Tax Collected</th></tr></thead>
          <tbody>
            ${data.taxByBranch?.map(item => `
              <tr>
                <td>${item.branchName}</td>
                <td>${fmtCurrency(item.taxCollected)}</td>
              </tr>
            `).join('') || '<tr><td colspan="2" class="text-center text-muted">No data</td></tr>'}
          </tbody>
        </table>
      </div>

      <div class="section">
        <div class="section-header">
          <div class="section-title">By Payment Method</div>
        </div>
        <table>
          <thead><tr><th>Method</th><th>Sales</th><th>Tax</th></tr></thead>
          <tbody>
            ${data.taxByPaymentMethod?.map(item => `
              <tr>
                <td>${item.paymentMethod}</td>
                <td class="col-num">${fmtNum(item.salesCount)}</td>
                <td>${fmtCurrency(item.taxCollected)}</td>
              </tr>
            `).join('') || '<tr><td colspan="3" class="text-center text-muted">No data</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `
  return getReportTemplate('Tax Report', content, filters, businessInfo)
}

// ══════════════════════════════════════════════════════════
// CUSTOMER REPORT
// ══════════════════════════════════════════════════════════
function generateCustomerReportHTML(data: CustomerReportData, filters: any, businessInfo?: any): string {
  const content = `
    <div class="kpi-grid">
      <div class="kpi-card highlight">
        <div class="kpi-label">Total Revenue</div>
        <div class="kpi-value">${fmtCurrency(data.summary?.totalRevenue || 0)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Total Customers</div>
        <div class="kpi-value">${fmtNum(data.summary?.totalCustomers || 0)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Active</div>
        <div class="kpi-value">${fmtNum(data.summary?.activeCustomers || 0)}</div>
      </div>
      <div class="kpi-card success">
        <div class="kpi-label">New This Period</div>
        <div class="kpi-value">${fmtNum(data.summary?.newCustomers || 0)}</div>
      </div>
    </div>

    ${data.customerRetention ? `
    <div class="section">
      <div class="section-header">
        <div class="section-title">Retention Metrics</div>
      </div>
      <div class="data-rows">
        <div class="data-row">
          <span class="label">Repeat Customers</span>
          <span class="value">${fmtNum(data.customerRetention.repeatCustomers || 0)}</span>
        </div>
        <div class="data-row">
          <span class="label">One-time Buyers</span>
          <span class="value">${fmtNum(data.customerRetention.oneTimeCustomers || 0)}</span>
        </div>
        <div class="data-row subtotal">
          <span class="label">Retention Rate</span>
          <span class="value">${fmtPct(data.customerRetention.repeatRate || 0)}</span>
        </div>
      </div>
    </div>
    ` : ''}

    <div class="section">
      <div class="section-header">
        <div class="section-title">Top Customers</div>
        <div class="section-badge">Top 10</div>
      </div>
      <table>
        <thead><tr><th>Customer</th><th>Orders</th><th>Total Spent</th></tr></thead>
        <tbody>
          ${data.topCustomers?.slice(0, 10).map(item => `
            <tr>
              <td>${item.customerName}</td>
              <td class="col-num">${fmtNum(item.totalOrders)}</td>
              <td>${fmtCurrency(item.totalSpent)}</td>
            </tr>
          `).join('') || '<tr><td colspan="3" class="text-center text-muted">No data</td></tr>'}
        </tbody>
      </table>
    </div>
  `
  return getReportTemplate('Customer Report', content, filters, businessInfo)
}

// ══════════════════════════════════════════════════════════
// BRANCH PERFORMANCE
// ══════════════════════════════════════════════════════════
function generateBranchPerformanceHTML(data: BranchPerformanceData, filters: any, businessInfo?: any): string {
  const content = `
    <div class="kpi-grid cols-3">
      <div class="kpi-card">
        <div class="kpi-label">Total Branches</div>
        <div class="kpi-value">${fmtNum(data.summary?.totalBranches || 0)}</div>
      </div>
      <div class="kpi-card highlight">
        <div class="kpi-label">Total Revenue</div>
        <div class="kpi-value">${fmtCurrency(data.summary?.totalRevenue || 0)}</div>
      </div>
      <div class="kpi-card success">
        <div class="kpi-label">Total Profit</div>
        <div class="kpi-value">${fmtCurrency(data.summary?.totalProfit || 0)}</div>
      </div>
    </div>

    ${data.topPerformingBranch ? `
    <div class="alert warning">
      &#127942; Top Performing Branch: <strong>${data.topPerformingBranch.branchName}</strong>
    </div>
    ` : ''}

    <div class="section">
      <div class="section-header">
        <div class="section-title">Branch Rankings</div>
      </div>
      <table>
        <thead><tr><th>#</th><th>Branch</th><th>Sales</th><th>Revenue</th><th>Expenses</th><th>Profit</th></tr></thead>
        <tbody>
          ${data.branchMetrics?.sort((a, b) => b.revenue - a.revenue).map((item, i) => `
            <tr>
              <td class="col-num">${i + 1}</td>
              <td><strong>${item.branchName}</strong></td>
              <td class="col-num">${fmtNum(item.salesCount)}</td>
              <td>${fmtCurrency(item.revenue)}</td>
              <td>${fmtCurrency(item.expenses)}</td>
              <td class="${item.profit >= 0 ? 'text-success' : 'text-danger'}">${fmtCurrency(item.profit)}</td>
            </tr>
          `).join('') || '<tr><td colspan="6" class="text-center text-muted">No data</td></tr>'}
        </tbody>
      </table>
    </div>
  `
  return getReportTemplate('Branch Performance', content, filters, businessInfo)
}

// ══════════════════════════════════════════════════════════
// CASH FLOW
// ══════════════════════════════════════════════════════════
function generateCashFlowHTML(data: CashFlowData, filters: any, businessInfo?: any): string {
  const netFlow = data.summary?.netCashFlow || 0

  const content = `
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Opening Balance</div>
        <div class="kpi-value">${fmtCurrency(data.summary?.openingBalance || 0)}</div>
      </div>
      <div class="kpi-card success">
        <div class="kpi-label">Cash In</div>
        <div class="kpi-value">${fmtCurrency(data.summary?.cashIn || 0)}</div>
      </div>
      <div class="kpi-card danger">
        <div class="kpi-label">Cash Out</div>
        <div class="kpi-value">${fmtCurrency(data.summary?.cashOut || 0)}</div>
      </div>
      <div class="kpi-card highlight">
        <div class="kpi-label">Closing Balance</div>
        <div class="kpi-value">${fmtCurrency(data.summary?.closingBalance || 0)}</div>
        <div class="kpi-sub">Net Flow: ${netFlow >= 0 ? '+' : ''}${fmtCurrency(netFlow)}</div>
      </div>
    </div>

    <div class="two-col">
      ${data.cashInBreakdown ? `
      <div class="section">
        <div class="section-header">
          <div class="section-title">Cash Inflow</div>
        </div>
        <div class="data-rows">
          <div class="data-row positive">
            <span class="label">Sales Revenue</span>
            <span class="value">+ ${fmtCurrency(data.cashInBreakdown.sales || 0)}</span>
          </div>
          <div class="data-row positive">
            <span class="label">Receivables Collected</span>
            <span class="value">+ ${fmtCurrency(data.cashInBreakdown.receivables || 0)}</span>
          </div>
          <div class="data-row positive">
            <span class="label">Other Income</span>
            <span class="value">+ ${fmtCurrency(data.cashInBreakdown.other || 0)}</span>
          </div>
          <div class="data-row subtotal">
            <span class="label">Total Cash In</span>
            <span class="value">${fmtCurrency(data.summary?.cashIn || 0)}</span>
          </div>
        </div>
      </div>
      ` : ''}

      ${data.cashOutBreakdown ? `
      <div class="section">
        <div class="section-header">
          <div class="section-title">Cash Outflow</div>
        </div>
        <div class="data-rows">
          <div class="data-row deduction">
            <span class="label">Purchases</span>
            <span class="value">(${fmtCurrency(data.cashOutBreakdown.purchases || 0)})</span>
          </div>
          <div class="data-row deduction">
            <span class="label">Expenses</span>
            <span class="value">(${fmtCurrency(data.cashOutBreakdown.expenses || 0)})</span>
          </div>
          <div class="data-row deduction">
            <span class="label">Commissions</span>
            <span class="value">(${fmtCurrency(data.cashOutBreakdown.commissions || 0)})</span>
          </div>
          <div class="data-row deduction">
            <span class="label">Refunds</span>
            <span class="value">(${fmtCurrency(data.cashOutBreakdown.refunds || 0)})</span>
          </div>
          <div class="data-row subtotal">
            <span class="label">Total Cash Out</span>
            <span class="value">${fmtCurrency(data.summary?.cashOut || 0)}</span>
          </div>
        </div>
      </div>
      ` : ''}
    </div>

    ${data.cashByBranch && data.cashByBranch.length > 0 ? `
    <div class="section">
      <div class="section-header">
        <div class="section-title">Cash by Branch</div>
      </div>
      <table>
        <thead><tr><th>Branch</th><th>Cash in Hand</th></tr></thead>
        <tbody>
          ${data.cashByBranch.map(item => `
            <tr>
              <td>${item.branchName}</td>
              <td>${fmtCurrency(item.cashInHand)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}
  `
  return getReportTemplate('Cash Flow Report', content, filters, businessInfo)
}

// ══════════════════════════════════════════════════════════
// AUDIT TRAIL (Comprehensive)
// ══════════════════════════════════════════════════════════
function generateAuditTrailHTML(data: AuditTrailData, filters: any, businessInfo?: any): string {
  const content = `
    <div class="kpi-grid">
      <div class="kpi-card highlight">
        <div class="kpi-label">Net Profit</div>
        <div class="kpi-value">${fmtCurrency(data.financialSummary?.netProfit || 0)}</div>
        <div class="kpi-sub">Margin: ${fmtPct(data.financialSummary?.profitMargin || 0)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Revenue</div>
        <div class="kpi-value">${fmtCurrency(data.salesSummary?.totalRevenue || 0)}</div>
        <div class="kpi-sub">${fmtNum(data.salesSummary?.totalSales || 0)} transactions</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Expenses</div>
        <div class="kpi-value">${fmtCurrency(data.expensesSummary?.totalExpenses || 0)}</div>
        <div class="kpi-sub">${fmtNum(data.expensesSummary?.expenseCount || 0)} entries</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Inventory Value</div>
        <div class="kpi-value">${fmtCurrency(data.inventorySummary?.totalValue || 0)}</div>
        <div class="kpi-sub">${fmtNum(data.inventorySummary?.totalProducts || 0)} products</div>
      </div>
    </div>

    <!-- Sales Section -->
    <div class="section">
      <div class="section-header">
        <div class="section-title">Sales Overview</div>
      </div>
      <div class="data-rows mb-0">
        <div class="data-row">
          <span class="label">Total Transactions</span>
          <span class="value">${fmtNum(data.salesSummary?.totalSales || 0)}</span>
        </div>
        <div class="data-row">
          <span class="label">Average Order Value</span>
          <span class="value">${fmtCurrency(data.salesSummary?.avgOrderValue || 0)}</span>
        </div>
        <div class="data-row">
          <span class="label">Tax Collected</span>
          <span class="value">${fmtCurrency(data.salesSummary?.totalTax || 0)}</span>
        </div>
        <div class="data-row total">
          <span class="label">Total Revenue</span>
          <span class="value">${fmtCurrency(data.salesSummary?.totalRevenue || 0)}</span>
        </div>
      </div>
    </div>

    <div class="two-col">
      ${data.salesByPaymentMethod && data.salesByPaymentMethod.length > 0 ? `
      <div class="section">
        <div class="section-header">
          <div class="section-title">Sales by Payment</div>
        </div>
        <table>
          <thead><tr><th>Method</th><th>Count</th><th>Amount</th></tr></thead>
          <tbody>
            ${data.salesByPaymentMethod.map(item => `
              <tr>
                <td>${item.paymentMethod}</td>
                <td class="col-num">${fmtNum(item.count)}</td>
                <td>${fmtCurrency(item.total)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      ${data.topProducts && data.topProducts.length > 0 ? `
      <div class="section">
        <div class="section-header">
          <div class="section-title">Top Products</div>
        </div>
        <table>
          <thead><tr><th>Product</th><th>Qty</th><th>Revenue</th></tr></thead>
          <tbody>
            ${data.topProducts.slice(0, 5).map(item => `
              <tr>
                <td>${item.productName}</td>
                <td class="col-num">${fmtNum(item.quantitySold)}</td>
                <td>${fmtCurrency(item.revenue)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}
    </div>

    <!-- Inventory Status -->
    <div class="section">
      <div class="section-header">
        <div class="section-title">Inventory Status</div>
      </div>
      <div class="data-rows">
        <div class="data-row">
          <span class="label">Total Products</span>
          <span class="value">${fmtNum(data.inventorySummary?.totalProducts || 0)}</span>
        </div>
        <div class="data-row">
          <span class="label">Low Stock Items</span>
          <span class="value${(data.inventorySummary?.lowStockItems || 0) > 0 ? ' text-danger' : ''}">${fmtNum(data.inventorySummary?.lowStockItems || 0)}</span>
        </div>
        <div class="data-row">
          <span class="label">Out of Stock</span>
          <span class="value${(data.inventorySummary?.outOfStockItems || 0) > 0 ? ' text-danger' : ''}">${fmtNum(data.inventorySummary?.outOfStockItems || 0)}</span>
        </div>
      </div>
    </div>

    <!-- P&L Statement -->
    ${data.financialSummary ? `
    <div class="section">
      <div class="section-header">
        <div class="section-title">Profit &amp; Loss Statement</div>
      </div>
      <div class="data-rows">
        <div class="data-row">
          <span class="label">Gross Revenue</span>
          <span class="value">${fmtCurrency(data.financialSummary.grossRevenue || 0)}</span>
        </div>
        <div class="data-row deduction">
          <span class="label">Less: Refunds</span>
          <span class="value">(${fmtCurrency(data.financialSummary.refunds || 0)})</span>
        </div>
        <div class="data-row subtotal">
          <span class="label">Net Revenue</span>
          <span class="value">${fmtCurrency(data.financialSummary.netRevenue || 0)}</span>
        </div>
        <div class="data-row deduction">
          <span class="label">Less: Cost of Goods Sold</span>
          <span class="value">(${fmtCurrency(data.financialSummary.cogs || 0)})</span>
        </div>
        <div class="data-row subtotal">
          <span class="label">Gross Profit</span>
          <span class="value">${fmtCurrency(data.financialSummary.grossProfit || 0)}</span>
        </div>
        <div class="data-row deduction">
          <span class="label">Less: Operating Expenses</span>
          <span class="value">(${fmtCurrency(data.financialSummary.expenses || 0)})</span>
        </div>
        <div class="data-row total">
          <span class="label">Net Profit / (Loss)</span>
          <span class="value">${fmtCurrency(data.financialSummary.netProfit || 0)}</span>
        </div>
      </div>
    </div>
    ` : ''}

    <!-- Expense Breakdown -->
    ${data.expensesByCategory && data.expensesByCategory.length > 0 ? `
    <div class="section">
      <div class="section-header">
        <div class="section-title">Expense Breakdown</div>
      </div>
      <table>
        <thead><tr><th>Category</th><th>Count</th><th>Amount</th></tr></thead>
        <tbody>
          ${data.expensesByCategory.map(item => `
            <tr>
              <td>${item.category}</td>
              <td class="col-num">${fmtNum(item.count)}</td>
              <td>${fmtCurrency(item.amount)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}

    <!-- Audit Logs -->
    ${data.auditLogs && data.auditLogs.length > 0 ? `
    <div class="section">
      <div class="section-header">
        <div class="section-title">Recent Activity Log</div>
        <div class="section-badge">${data.auditLogs.length} entries</div>
      </div>
      <table>
        <thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Entity</th></tr></thead>
        <tbody>
          ${data.auditLogs.slice(0, 15).map(item => `
            <tr>
              <td>${formatDateTime(item.timestamp)}</td>
              <td>${item.userName}</td>
              <td>${item.action}</td>
              <td>${item.tableName}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}
  `
  return getReportTemplate('Comprehensive Audit Report', content, filters, businessInfo)
}
