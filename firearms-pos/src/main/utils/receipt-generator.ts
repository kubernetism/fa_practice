import { BrowserWindow, app } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import { formatDate, formatDateTime } from './date-helpers'
import type { BusinessSettings } from '../db/schemas/business_settings'

// Receipt Data Interfaces
export interface ReceiptSaleData {
  id: number
  invoiceNumber: string
  saleDate: string
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  amountPaid: number
  changeGiven: number
  paymentMethod: string
  paymentStatus: string
  notes?: string
}

export interface ReceiptItemData {
  productName: string
  productCode: string
  quantity: number
  unitPrice: number
  serialNumber?: string
  discountAmount: number
  taxAmount: number
  totalPrice: number
}

export interface ReceiptServiceData {
  serviceName: string
  serviceCode?: string
  quantity: number
  unitPrice: number
  hours?: number // For hourly services
  taxAmount: number
  totalAmount: number
  notes?: string
}

export interface ReceiptCustomerData {
  name: string
  phone?: string
  email?: string
  address?: string
}

export interface ReceiptData {
  sale: ReceiptSaleData
  items: ReceiptItemData[]
  services?: ReceiptServiceData[]
  customer: ReceiptCustomerData | null
  businessSettings: BusinessSettings
}

export interface ReceiptOptions {
  format: 'pdf' | 'thermal'
  autoDownload: boolean
}

// Payment History Receipt Interfaces
export interface PaymentHistoryData {
  receivable: {
    id: number
    invoiceNumber: string
    totalAmount: number
    paidAmount: number
    remainingAmount: number
    status: string
    createdAt: string
    dueDate?: string
  }
  payments: Array<{
    id: number
    amount: number
    paymentMethod: string
    referenceNumber?: string
    notes?: string
    paymentDate: string
    receivedBy?: string
  }>
  sale: {
    invoiceNumber: string
    saleDate: string
    subtotal: number
    taxAmount: number
    discountAmount: number
    totalAmount: number
  }
  items: ReceiptItemData[]
  services?: ReceiptServiceData[]
  customer: ReceiptCustomerData | null
  businessSettings: BusinessSettings
}

// Font size mapping - Executive Minimal Design System
const fontSizeMap = {
  small: { base: 11, header: 16, title: 24, caption: 9 },
  medium: { base: 12, header: 18, title: 28, caption: 10 },
  large: { base: 14, header: 20, title: 32, caption: 11 },
}

// Design System Colors
const designColors = {
  // Primary palette
  primary900: '#0c1929',
  primary700: '#1e3a5f',
  primary500: '#2563eb',
  accentGold: '#c9a962',
  accentEmerald: '#059669',
  accentRose: '#dc2626',
  // Neutral palette
  gray900: '#111827',
  gray600: '#4b5563',
  gray400: '#9ca3af',
  gray100: '#f3f4f6',
  gray50: '#f9fafb',
  white: '#ffffff',
}

// Format currency with settings
function formatCurrency(amount: number, settings: BusinessSettings): string {
  const symbol = settings.currencySymbol || 'Rs.'
  const position = settings.currencyPosition || 'prefix'
  const formatted = amount.toFixed(settings.decimalPlaces || 2)

  return position === 'prefix' ? `${symbol} ${formatted}` : `${formatted} ${symbol}`
}

// Get payment method display name
function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    cash: 'Cash',
    card: 'Card',
    credit: 'Credit',
    mixed: 'Mixed',
    mobile: 'Mobile Payment',
    cod: 'Cash on Delivery',
    receivable: 'Pay Later',
    bank_transfer: 'Bank Transfer',
    cheque: 'Cheque',
  }
  return labels[method] || method
}

// Generate PDF Receipt HTML (A4 format) - Compact Professional Design
function generatePDFReceiptHTML(data: ReceiptData): string {
  const { sale, items, services = [], customer, businessSettings: settings } = data
  const showTax = settings.showTaxOnReceipt !== false
  const showLogo = settings.receiptShowBusinessLogo !== false
  const taxRate = settings.taxRate || 0

  // Format date compactly
  const saleDate = new Date(sale.saleDate)
  const formattedDate = saleDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit'
  })

  // Calculate due date (7 days from sale)
  const dueDate = new Date(saleDate)
  dueDate.setDate(dueDate.getDate() + 7)
  const formattedDueDate = dueDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit'
  })

  // Build numbered items rows (products)
  let itemNumber = 0
  const productItemsHTML = items
    .map((item) => {
      itemNumber++
      return `
      <tr>
        <td class="no-col">${itemNumber}.</td>
        <td class="desc-col">
          <div class="item-name">${item.productName}</div>
          ${item.serialNumber ? `<div class="item-detail">S/N: ${item.serialNumber}</div>` : ''}
        </td>
        <td class="price-col">${formatCurrency(item.unitPrice, settings)}</td>
        <td class="qty-col">${item.quantity}</td>
        <td class="total-col">${formatCurrency(item.totalPrice, settings)}</td>
      </tr>
    `
    })
    .join('')

  // Build service rows
  const serviceItemsHTML = services
    .map((service) => {
      itemNumber++
      return `
      <tr class="service-row">
        <td class="no-col">${itemNumber}.</td>
        <td class="desc-col">
          <div class="item-name">${service.serviceName} <span class="svc-tag">[SERVICE]</span></div>
          ${service.hours ? `<div class="item-detail">${service.hours} hour${service.hours > 1 ? 's' : ''} @ ${formatCurrency(service.unitPrice, settings)}/hr</div>` : ''}
          ${service.notes ? `<div class="item-detail">${service.notes}</div>` : ''}
        </td>
        <td class="price-col">${formatCurrency(service.unitPrice, settings)}</td>
        <td class="qty-col">${service.quantity}</td>
        <td class="total-col">${formatCurrency(service.totalAmount, settings)}</td>
      </tr>
    `
    })
    .join('')

  const itemsHTML = productItemsHTML + serviceItemsHTML

  // Payment info rows
  const paymentInfoHTML = `
    <div class="payment-line">Payment Method: ${getPaymentMethodLabel(sale.paymentMethod)}</div>
    ${settings.receiptCustomField1Label && settings.receiptCustomField1Value ? `<div class="payment-line">${settings.receiptCustomField1Label}: ${settings.receiptCustomField1Value}</div>` : ''}
    ${settings.receiptCustomField2Label && settings.receiptCustomField2Value ? `<div class="payment-line">${settings.receiptCustomField2Label}: ${settings.receiptCustomField2Value}</div>` : ''}
  `

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Pinyon+Script&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: 'IBM Plex Mono', 'Consolas', 'Monaco', monospace;
          font-size: 11px;
          line-height: 1.5;
          color: #1a1a1a;
          padding: 30px 40px;
          background: #f5f5f5;
        }

        .invoice-container {
          max-width: 700px;
          margin: 0 auto;
          background: #f5f5f5;
        }

        /* Header Section */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .header-left {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .business-logo {
          width: 50px;
          height: 50px;
          object-fit: contain;
        }

        .business-info h1 {
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }

        .business-tagline {
          font-size: 9px;
          color: #444;
          line-height: 1.3;
        }

        /* Invoice Title Section */
        .invoice-title-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }

        .invoice-title {
          font-size: 42px;
          font-weight: 400;
          font-style: italic;
          letter-spacing: 2px;
          color: #1a1a1a;
        }

        .customer-block {
          text-align: right;
          font-size: 11px;
          line-height: 1.4;
        }

        .customer-name {
          font-weight: 600;
        }

        /* Invoice Details Row */
        .invoice-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
          font-size: 11px;
        }

        .invoice-left span,
        .invoice-right span {
          display: block;
          margin-bottom: 2px;
        }

        .invoice-right {
          text-align: right;
        }

        /* Items Table */
        .divider {
          border-top: 2px solid #1a1a1a;
          margin: 10px 0;
        }

        .divider-thin {
          border-top: 1px solid #1a1a1a;
          margin: 8px 0;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        thead tr {
          border-bottom: 2px solid #1a1a1a;
        }

        th {
          padding: 8px 4px;
          text-align: left;
          font-weight: 600;
          font-size: 11px;
          text-transform: capitalize;
        }

        td {
          padding: 10px 4px;
          vertical-align: top;
          font-size: 11px;
        }

        .no-col { width: 30px; }
        .desc-col { width: auto; }
        .price-col { width: 80px; text-align: left; }
        .qty-col { width: 50px; text-align: center; }
        .total-col { width: 80px; text-align: right; }

        th.price-col { text-align: left; }
        th.qty-col { text-align: center; }
        th.total-col { text-align: right; }

        .item-name {
          font-weight: 500;
        }

        .item-detail {
          font-size: 9px;
          color: #666;
          margin-top: 2px;
        }

        .svc-tag {
          font-size: 8px;
          color: #2563eb;
          font-weight: 600;
        }

        .service-row {
          background: rgba(37, 99, 235, 0.05);
        }

        /* Footer Section with Totals */
        .footer-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-top: 10px;
          padding-top: 15px;
          border-top: 2px solid #1a1a1a;
        }

        .important-notice {
          flex: 1;
          font-style: italic;
          font-size: 10px;
          line-height: 1.4;
          max-width: 280px;
          padding-right: 20px;
        }

        .important-notice strong {
          font-style: italic;
        }

        .totals-block {
          text-align: right;
          font-size: 11px;
        }

        .totals-row {
          display: flex;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 4px;
        }

        .totals-row.total-final {
          font-weight: 700;
          font-size: 12px;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #1a1a1a;
        }

        .totals-label {
          text-align: left;
        }

        .totals-value {
          min-width: 90px;
          text-align: right;
        }

        /* Payment Section */
        .payment-section {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 2px solid #1a1a1a;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .payment-info {
          font-size: 11px;
          line-height: 1.5;
        }

        .payment-title {
          font-weight: 700;
          margin-bottom: 4px;
        }

        .payment-line {
          color: #333;
        }

        .thank-you {
          font-family: 'Pinyon Script', cursive;
          font-size: 36px;
          color: #1a1a1a;
        }

        /* Developer Footer */
        .dev-footer {
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #ccc;
          text-align: center;
          font-size: 9px;
          color: #888;
          line-height: 1.4;
        }

        .dev-footer a {
          color: #666;
          text-decoration: none;
        }

        /* Balance Due Warning */
        .balance-warning {
          margin-top: 10px;
          padding: 8px 12px;
          background: #fef2f2;
          border-left: 3px solid #dc2626;
          font-size: 10px;
          color: #991b1b;
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header -->
        <div class="header">
          <div class="header-left">
            ${showLogo && settings.businessLogo ? `<img src="${settings.businessLogo}" class="business-logo" alt="Logo" />` : ''}
            <div class="business-info">
              <h1>${settings.businessName || 'Business Name Co.'}</h1>
              <div class="business-tagline">
                Point of Sales<br>
                Inventory Management<br>
                System
              </div>
            </div>
          </div>
        </div>

        <!-- Invoice Title & Customer -->
        <div class="invoice-title-section">
          <div class="invoice-title">Invoice</div>
          <div class="customer-block">
            <div class="customer-name">${customer?.name || 'Walk-in Customer'}</div>
            ${customer?.phone ? `<div>${customer.phone}</div>` : ''}
            ${customer?.email ? `<div>${customer.email}</div>` : ''}
          </div>
        </div>

        <!-- Invoice Details -->
        <div class="invoice-details">
          <div class="invoice-left">
            <span>No: ${sale.invoiceNumber}</span>
            <span>To: ${customer?.name || 'Walk-in Customer'}</span>
          </div>
          <div class="invoice-right">
            <span>Date: ${formattedDate}</span>
            ${sale.amountPaid < sale.totalAmount ? `<span>Due Date: ${formattedDueDate}</span>` : ''}
          </div>
        </div>

        <!-- Items Table -->
        <div class="divider"></div>
        <table>
          <thead>
            <tr>
              <th class="no-col">No</th>
              <th class="desc-col">Description</th>
              <th class="price-col">Price</th>
              <th class="qty-col">Qty</th>
              <th class="total-col">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <!-- Totals Section -->
        <div class="footer-section">
          <div class="important-notice">
            ${settings.receiptTermsAndConditions ? settings.receiptTermsAndConditions : `<strong>Important:</strong> The invoice amount must be paid no later than 7 business days after issuance.`}
          </div>
          <div class="totals-block">
            <div class="totals-row">
              <span class="totals-label">SUBTOTAL</span>
              <span class="totals-value">: ${formatCurrency(sale.subtotal, settings)}</span>
            </div>
            ${showTax ? `
            <div class="totals-row">
              <span class="totals-label">TAX (${taxRate}%)</span>
              <span class="totals-value">: ${formatCurrency(sale.taxAmount, settings)}</span>
            </div>
            ` : ''}
            ${sale.discountAmount > 0 ? `
            <div class="totals-row">
              <span class="totals-label">DISCOUNT</span>
              <span class="totals-value">: -${formatCurrency(sale.discountAmount, settings)}</span>
            </div>
            ` : ''}
            <div class="totals-row total-final">
              <span class="totals-label">TOTAL</span>
              <span class="totals-value">: ${formatCurrency(sale.totalAmount, settings)}</span>
            </div>
          </div>
        </div>

        ${sale.amountPaid < sale.totalAmount ? `
        <div class="balance-warning">
          <strong>Balance Due:</strong> ${formatCurrency(sale.totalAmount - sale.amountPaid, settings)} — Please settle within the due date.
        </div>
        ` : ''}

        <!-- Payment Section -->
        <div class="payment-section">
          <div class="payment-info">
            <div class="payment-title">Payment Information:</div>
            ${paymentInfoHTML}
            ${sale.amountPaid > 0 ? `<div class="payment-line">Amount Paid: ${formatCurrency(sale.amountPaid, settings)}</div>` : ''}
            ${sale.changeGiven > 0 ? `<div class="payment-line">Change Given: ${formatCurrency(sale.changeGiven, settings)}</div>` : ''}
          </div>
          <div class="thank-you">Thank You</div>
        </div>

        <!-- Developer Footer -->
        <div class="dev-footer">
          ${settings.receiptFooter ? `${settings.receiptFooter}<br><br>` : ''}
          This Application is Developed by:<br>
          programmersafdar@live.com<br>
          github.com/programmer-safdar-ali
        </div>
      </div>
    </body>
    </html>
  `
}

// Generate Thermal Receipt HTML (80mm format) - Optimized for thermal printers
function generateThermalReceiptHTML(data: ReceiptData): string {
  const { sale, items, services = [], customer, businessSettings: settings } = data
  const showTax = settings.showTaxOnReceipt !== false

  // Helper to pad string for alignment (thermal receipt formatting)
  const padEnd = (str: string, len: number) => str.padEnd(len, ' ')
  const padStart = (str: string, len: number) => str.padStart(len, ' ')
  const dotFill = (label: string, value: string, totalWidth: number = 32) => {
    const dotsNeeded = totalWidth - label.length - value.length
    return `${label}${'·'.repeat(Math.max(1, dotsNeeded))}${value}`
  }

  // Format short date for thermal
  const saleDate = new Date(sale.saleDate)
  const shortDate = `${saleDate.getDate().toString().padStart(2, '0')}/${(saleDate.getMonth() + 1).toString().padStart(2, '0')}/${saleDate.getFullYear().toString().slice(-2)}`
  const shortTime = saleDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })

  // Build product items rows for thermal with dot leaders
  const productItemsHTML = items
    .map(
      (item) => {
        const priceStr = formatCurrency(item.totalPrice, settings)
        return `
      <div class="item-row">
        <div class="item-name">${item.productName.length > 28 ? item.productName.substring(0, 25) + '...' : item.productName}</div>
        ${item.serialNumber ? `<div class="item-serial">SN: ${item.serialNumber}</div>` : ''}
        <div class="item-qty-price">${item.quantity} × ${formatCurrency(item.unitPrice, settings)}</div>
        <div class="item-total">${priceStr}</div>
      </div>
    `
      }
    )
    .join('')

  // Build service items rows for thermal
  const serviceItemsHTML = services
    .map(
      (service) => {
        const priceStr = formatCurrency(service.totalAmount, settings)
        const serviceName = service.serviceName.length > 28 ? service.serviceName.substring(0, 25) + '...' : service.serviceName
        return `
      <div class="item-row service-item">
        <div class="item-name">${serviceName} <span class="svc-tag">[SVC]</span></div>
        ${service.serviceCode ? `<div class="item-serial">CODE: ${service.serviceCode}</div>` : ''}
        ${service.hours ? `<div class="item-serial">${service.hours}hr @ ${formatCurrency(service.unitPrice, settings)}/hr</div>` : ''}
        ${service.notes ? `<div class="item-serial">${service.notes}</div>` : ''}
        <div class="item-qty-price">${service.quantity} × ${formatCurrency(service.unitPrice, settings)}</div>
        <div class="item-total">${priceStr}</div>
      </div>
    `
      }
    )
    .join('')

  // Combined items HTML
  const itemsHTML = productItemsHTML + serviceItemsHTML

  // Build custom fields
  let customFieldsHTML = ''
  if (settings.receiptCustomField1Label && settings.receiptCustomField1Value) {
    customFieldsHTML += `<div class="cf-row">${settings.receiptCustomField1Label}: ${settings.receiptCustomField1Value}</div>`
  }
  if (settings.receiptCustomField2Label && settings.receiptCustomField2Value) {
    customFieldsHTML += `<div class="cf-row">${settings.receiptCustomField2Label}: ${settings.receiptCustomField2Value}</div>`
  }
  if (settings.receiptCustomField3Label && settings.receiptCustomField3Value) {
    customFieldsHTML += `<div class="cf-row">${settings.receiptCustomField3Label}: ${settings.receiptCustomField3Value}</div>`
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: 'JetBrains Mono', 'Consolas', 'Courier New', monospace;
          font-size: 10px;
          line-height: 1.3;
          color: #000;
          width: 302px;
          padding: 8px 10px;
          background: white;
        }

        /* Header Box */
        .header-box {
          border: 2px solid #000;
          padding: 8px;
          margin-bottom: 8px;
          text-align: center;
        }

        .business-name {
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .business-info {
          font-size: 9px;
          margin-top: 4px;
          color: #333;
        }

        .header-msg {
          font-size: 9px;
          font-style: italic;
          margin-top: 4px;
          color: #666;
        }

        /* Dividers */
        .div-double {
          border-top: 3px double #000;
          margin: 8px 0;
        }

        .div-single {
          border-top: 1px solid #000;
          margin: 6px 0;
        }

        .div-dashed {
          border-top: 1px dashed #000;
          margin: 6px 0;
        }

        /* Invoice Section */
        .invoice-section {
          margin: 8px 0;
        }

        .inv-row {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          padding: 2px 0;
        }

        .inv-number {
          font-weight: 700;
          font-size: 11px;
        }

        /* Customer Section */
        .customer-section {
          background: #f0f0f0;
          padding: 6px 8px;
          margin: 8px 0;
        }

        .customer-name {
          font-weight: 700;
          font-size: 11px;
        }

        .customer-contact {
          font-size: 9px;
          color: #444;
        }

        /* Items Section */
        .items-header {
          display: flex;
          justify-content: space-between;
          font-weight: 700;
          font-size: 10px;
          padding: 4px 0;
          border-bottom: 1px solid #000;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .item-row {
          margin-bottom: 8px;
          padding-bottom: 6px;
          border-bottom: 1px dotted #ccc;
        }

        .item-row:last-child {
          border-bottom: none;
        }

        .item-name {
          font-weight: 600;
          font-size: 10px;
        }

        .item-serial {
          font-size: 8px;
          color: #666;
          font-style: italic;
        }

        .item-qty-price {
          font-size: 9px;
          color: #444;
          margin-top: 2px;
        }

        .item-total {
          font-weight: 700;
          font-size: 10px;
          text-align: right;
        }

        .service-item {
          background: #f0f7ff;
          padding: 4px;
          margin-left: -4px;
          margin-right: -4px;
          border-left: 2px solid #3b82f6;
        }

        .svc-tag {
          font-size: 7px;
          font-weight: 700;
          color: #3b82f6;
          vertical-align: super;
        }

        /* Totals Section */
        .totals-section {
          margin: 10px 0;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          padding: 3px 0;
        }

        .total-row span:first-child::after {
          content: '';
        }

        .total-label {
          flex: 1;
        }

        .total-dots {
          flex: 2;
          border-bottom: 1px dotted #999;
          margin: 0 4px 3px 4px;
        }

        .total-value {
          text-align: right;
          min-width: 70px;
        }

        .grand-total-box {
          border: 2px solid #000;
          padding: 8px;
          margin: 8px 0;
          display: flex;
          justify-content: space-between;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.5px;
        }

        /* Payment Section */
        .payment-section {
          background: #e8e8e8;
          padding: 8px;
          margin: 8px 0;
        }

        .payment-row {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          padding: 3px 0;
        }

        .payment-method {
          font-weight: 700;
          padding: 2px 8px;
          background: #000;
          color: #fff;
          font-size: 9px;
          letter-spacing: 0.5px;
        }

        .payment-value {
          font-weight: 700;
        }

        .remaining-row {
          color: #000;
          font-weight: 700;
        }

        /* Custom Fields */
        .custom-section {
          background: #fffde7;
          padding: 6px 8px;
          margin: 8px 0;
          border: 1px solid #ffd600;
        }

        .cf-row {
          font-size: 9px;
          padding: 2px 0;
        }

        /* Footer */
        .footer {
          text-align: center;
          margin-top: 10px;
          padding-top: 8px;
        }

        .footer-msg {
          font-size: 9px;
          color: #666;
          margin-bottom: 6px;
        }

        .terms-section {
          background: #f5f5f5;
          padding: 6px;
          font-size: 8px;
          text-align: left;
          margin: 8px 0;
          white-space: pre-wrap;
          color: #555;
        }

        .thank-you-box {
          border-top: 2px solid #000;
          border-bottom: 2px solid #000;
          padding: 8px;
          margin-top: 10px;
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
      </style>
    </head>
    <body>
      <div class="header-box">
        <div class="business-name">${settings.businessName || 'BUSINESS'}</div>
        <div class="business-info">
          ${settings.businessAddress || ''}${settings.businessCity ? `, ${settings.businessCity}` : ''}
        </div>
        ${settings.businessPhone ? `<div class="business-info">TEL: ${settings.businessPhone}</div>` : ''}
        ${settings.receiptHeader ? `<div class="header-msg">${settings.receiptHeader}</div>` : ''}
      </div>

      <div class="invoice-section">
        <div class="inv-row">
          <span>INV#</span>
          <span class="inv-number">${sale.invoiceNumber}</span>
        </div>
        <div class="inv-row">
          <span>DATE</span>
          <span>${shortDate} ${shortTime}</span>
        </div>
      </div>

      <div class="div-single"></div>

      <div class="customer-section">
        <div class="customer-name">${customer?.name || 'WALK-IN CUSTOMER'}</div>
        ${customer?.phone ? `<div class="customer-contact">TEL: ${customer.phone}</div>` : ''}
      </div>

      <div class="div-double"></div>

      <div class="items-header">
        <span>ITEMS</span>
        <span>AMOUNT</span>
      </div>

      <div class="items-section">
        ${itemsHTML}
      </div>

      <div class="div-single"></div>

      <div class="totals-section">
        <div class="total-row">
          <span class="total-label">SUBTOTAL</span>
          <span class="total-dots"></span>
          <span class="total-value">${formatCurrency(sale.subtotal, settings)}</span>
        </div>
        ${
          showTax
            ? `
        <div class="total-row">
          <span class="total-label">TAX</span>
          <span class="total-dots"></span>
          <span class="total-value">${formatCurrency(sale.taxAmount, settings)}</span>
        </div>
        `
            : ''
        }
        ${
          sale.discountAmount > 0
            ? `
        <div class="total-row">
          <span class="total-label">DISCOUNT</span>
          <span class="total-dots"></span>
          <span class="total-value">-${formatCurrency(sale.discountAmount, settings)}</span>
        </div>
        `
            : ''
        }
      </div>

      <div class="grand-total-box">
        <span>TOTAL</span>
        <span>${formatCurrency(sale.totalAmount, settings)}</span>
      </div>

      <div class="payment-section">
        <div class="payment-row">
          <span>METHOD</span>
          <span class="payment-method">${getPaymentMethodLabel(sale.paymentMethod).toUpperCase()}</span>
        </div>
        <div class="payment-row">
          <span>PAID</span>
          <span class="payment-value">${formatCurrency(sale.amountPaid, settings)}</span>
        </div>
        ${
          sale.amountPaid < sale.totalAmount
            ? `
        <div class="payment-row remaining-row">
          <span>★ BALANCE DUE</span>
          <span>${formatCurrency(sale.totalAmount - sale.amountPaid, settings)}</span>
        </div>
        `
            : ''
        }
        ${
          sale.changeGiven > 0
            ? `
        <div class="payment-row">
          <span>CHANGE</span>
          <span class="payment-value">${formatCurrency(sale.changeGiven, settings)}</span>
        </div>
        `
            : ''
        }
      </div>

      ${customFieldsHTML ? `<div class="custom-section">${customFieldsHTML}</div>` : ''}

      <div class="footer">
        ${settings.receiptFooter ? `<div class="footer-msg">${settings.receiptFooter}</div>` : ''}
        ${settings.receiptTermsAndConditions ? `<div class="terms-section">${settings.receiptTermsAndConditions}</div>` : ''}
        <div class="thank-you-box">THANK YOU</div>
      </div>
    </body>
    </html>
  `
}

// Generate PDF Payment History Receipt HTML (A4 format) - Executive Minimal Design
function generatePDFPaymentHistoryReceiptHTML(data: PaymentHistoryData): string {
  const { receivable, payments, sale, items, services = [], customer, businessSettings: settings } = data
  const fontSize = fontSizeMap[settings.receiptFontSize as keyof typeof fontSizeMap] || fontSizeMap.medium
  const colors = designColors
  const showTax = settings.showTaxOnReceipt !== false
  const showLogo = settings.receiptShowBusinessLogo !== false

  // Status configuration
  const statusConfig = {
    paid: { color: colors.accentEmerald, label: 'PAID', bg: '#dcfce7' },
    partial: { color: '#f59e0b', label: 'PARTIAL', bg: '#fef3c7' },
    overdue: { color: colors.accentRose, label: 'OVERDUE', bg: '#fee2e2' },
    pending: { color: colors.gray600, label: 'PENDING', bg: colors.gray100 },
  }
  const status = statusConfig[receivable.status as keyof typeof statusConfig] || statusConfig.pending

  // Format dates elegantly
  const saleDate = new Date(sale.saleDate)
  const formattedSaleDate = saleDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const formattedReceiptDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  // Build product items rows
  const productItemsHTML = items
    .map(
      (item, index) => `
      <tr class="${index % 2 === 0 ? 'row-even' : 'row-odd'}">
        <td class="item-cell">
          <span class="item-name">${item.productName}</span>
          ${item.serialNumber ? `<span class="item-serial">S/N: ${item.serialNumber}</span>` : ''}
        </td>
        <td class="text-center">${item.quantity}</td>
        <td class="text-right">${formatCurrency(item.unitPrice, settings)}</td>
        ${showTax ? `<td class="text-right">${formatCurrency(item.taxAmount, settings)}</td>` : ''}
        <td class="text-right amount-cell">${formatCurrency(item.totalPrice, settings)}</td>
      </tr>
    `
    )
    .join('')

  // Build service items rows
  const serviceItemsHTML = services
    .map(
      (service, index) => `
      <tr class="${(items.length + index) % 2 === 0 ? 'row-even' : 'row-odd'}" style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;">
        <td class="item-cell">
          <span class="item-name">${service.serviceName}</span>
          ${service.serviceCode ? `<span class="item-serial">Code: ${service.serviceCode}</span>` : ''}
          ${service.hours ? `<span class="item-serial">${service.hours} hour${service.hours > 1 ? 's' : ''} @ ${formatCurrency(service.unitPrice, settings)}/hr</span>` : ''}
          <span style="display: inline-block; padding: 2px 8px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; font-size: 9px; font-weight: 600; border-radius: 10px; margin-top: 4px;">SERVICE</span>
        </td>
        <td class="text-center">${service.quantity}</td>
        <td class="text-right">${formatCurrency(service.unitPrice, settings)}</td>
        ${showTax ? `<td class="text-right">${formatCurrency(service.taxAmount, settings)}</td>` : ''}
        <td class="text-right amount-cell">${formatCurrency(service.totalAmount, settings)}</td>
      </tr>
    `
    )
    .join('')

  // Combined items HTML
  const itemsHTML = productItemsHTML + serviceItemsHTML

  // Build payment history with running balance
  let runningBalance = 0
  const paymentsWithBalanceHTML = payments
    .map((payment, index) => {
      runningBalance += payment.amount
      const remaining = Math.max(0, receivable.totalAmount - runningBalance)
      const paymentDate = new Date(payment.paymentDate)
      const formattedPaymentDate = paymentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      return `
        <tr class="${index % 2 === 0 ? 'row-even' : 'row-odd'}">
          <td>${formattedPaymentDate}</td>
          <td class="text-center"><span class="method-badge">${getPaymentMethodLabel(payment.paymentMethod)}</span></td>
          <td class="text-right amount-cell">${formatCurrency(payment.amount, settings)}</td>
          <td class="text-right">${formatCurrency(runningBalance, settings)}</td>
          <td class="text-right ${remaining > 0 ? 'balance-due' : 'balance-clear'}">${formatCurrency(remaining, settings)}</td>
          <td class="text-center ref-cell">${payment.referenceNumber || '—'}</td>
        </tr>
      `
    })
    .join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
          --primary-900: ${colors.primary900};
          --primary-700: ${colors.primary700};
          --accent-gold: ${colors.accentGold};
          --accent-emerald: ${colors.accentEmerald};
          --accent-rose: ${colors.accentRose};
          --gray-900: ${colors.gray900};
          --gray-600: ${colors.gray600};
          --gray-400: ${colors.gray400};
          --gray-100: ${colors.gray100};
          --gray-50: ${colors.gray50};
        }

        body {
          font-family: 'DM Sans', 'Segoe UI', sans-serif;
          font-size: ${fontSize.base}px;
          line-height: 1.6;
          color: var(--gray-900);
          padding: 40px;
          background: white;
        }

        .receipt-container {
          max-width: 800px;
          margin: 0 auto;
        }

        /* Header */
        .header {
          text-align: center;
          padding-bottom: 25px;
          margin-bottom: 25px;
          position: relative;
        }

        .header::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 150px;
          height: 3px;
          background: linear-gradient(90deg, transparent, var(--accent-gold), transparent);
        }

        .business-logo {
          max-width: 100px;
          max-height: 70px;
          margin-bottom: 15px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }

        .business-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: ${fontSize.title}px;
          font-weight: 700;
          color: var(--primary-900);
          margin-bottom: 8px;
        }

        .business-info {
          font-size: ${fontSize.caption}px;
          color: var(--gray-600);
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }

        .receipt-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: ${fontSize.header + 2}px;
          font-weight: 600;
          color: var(--primary-900);
          margin-top: 20px;
          padding: 12px 30px;
          background: linear-gradient(135deg, var(--gray-50) 0%, var(--gray-100) 100%);
          border: 1px solid var(--gray-100);
          border-radius: 8px;
          display: inline-block;
          letter-spacing: 1px;
        }

        /* Invoice Details */
        .invoice-details {
          display: flex;
          justify-content: space-between;
          margin: 25px 0;
          padding: 20px 25px;
          background: var(--gray-50);
          border-radius: 12px;
          border: 1px solid var(--gray-100);
        }

        .invoice-left, .invoice-right { flex: 1; }
        .invoice-right { text-align: right; }

        .invoice-label {
          font-size: ${fontSize.caption}px;
          color: var(--gray-400);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 4px;
        }

        .invoice-value {
          font-size: ${fontSize.base + 1}px;
          font-weight: 600;
          color: var(--gray-900);
        }

        .status-badge {
          display: inline-block;
          padding: 6px 18px;
          border-radius: 20px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: ${fontSize.caption}px;
          background: ${status.bg};
          color: ${status.color};
          border: 1px solid ${status.color};
        }

        /* Customer Card */
        .customer-info {
          padding: 18px 20px;
          background: white;
          border-left: 4px solid var(--accent-gold);
          border-radius: 0 12px 12px 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          margin-bottom: 25px;
        }

        .customer-label {
          font-size: ${fontSize.caption}px;
          color: var(--gray-400);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 6px;
        }

        .customer-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: ${fontSize.header}px;
          font-weight: 600;
          color: var(--primary-900);
        }

        .customer-contact {
          font-size: ${fontSize.base}px;
          color: var(--gray-600);
          margin-top: 2px;
        }

        /* Balance Summary */
        .balance-summary {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
        }

        .balance-card {
          flex: 1;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
        }

        .balance-card.total {
          background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
          border: 1px solid #0ea5e9;
        }

        .balance-card.paid {
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
          border: 1px solid var(--accent-emerald);
        }

        .balance-card.remaining {
          background: ${receivable.remainingAmount > 0 ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' : 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)'};
          border: 1px solid ${receivable.remainingAmount > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)'};
        }

        .balance-label {
          font-size: ${fontSize.caption}px;
          color: var(--gray-600);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .balance-value {
          font-family: 'DM Sans', sans-serif;
          font-size: ${fontSize.header + 4}px;
          font-weight: 700;
        }

        .balance-card.total .balance-value { color: #0369a1; }
        .balance-card.paid .balance-value { color: var(--accent-emerald); }
        .balance-card.remaining .balance-value { color: ${receivable.remainingAmount > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)'}; }

        /* Section Title */
        .section-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: ${fontSize.header}px;
          font-weight: 600;
          color: var(--primary-900);
          margin: 25px 0 15px 0;
          padding-bottom: 8px;
          border-bottom: 2px solid var(--accent-gold);
          display: inline-block;
        }

        /* Tables */
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }

        thead { background: var(--primary-900); }

        th {
          padding: 14px 12px;
          text-align: left;
          font-weight: 600;
          font-size: ${fontSize.base}px;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        th:first-child { border-radius: 8px 0 0 0; }
        th:last-child { border-radius: 0 8px 0 0; }

        td {
          padding: 12px;
          border-bottom: 1px solid var(--gray-100);
          font-size: ${fontSize.base}px;
        }

        .row-even { background: var(--gray-50); }
        .row-odd { background: white; }

        .text-center { text-align: center; }
        .text-right { text-align: right; }

        .item-cell { display: flex; flex-direction: column; }
        .item-name { font-weight: 500; color: var(--gray-900); }
        .item-serial {
          font-family: 'JetBrains Mono', monospace;
          font-size: ${fontSize.caption}px;
          color: var(--gray-400);
          margin-top: 2px;
        }

        .amount-cell { font-weight: 600; color: var(--gray-900); }
        .method-badge {
          display: inline-block;
          padding: 4px 10px;
          background: var(--gray-100);
          border-radius: 12px;
          font-size: ${fontSize.caption}px;
          font-weight: 500;
        }

        .balance-due { color: var(--accent-rose); font-weight: 700; }
        .balance-clear { color: var(--accent-emerald); font-weight: 700; }
        .ref-cell { font-family: 'JetBrains Mono', monospace; font-size: ${fontSize.caption}px; color: var(--gray-400); }

        /* Totals */
        .totals-section {
          margin-top: 20px;
          padding: 20px;
          background: var(--gray-50);
          border-radius: 12px;
        }

        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          font-size: ${fontSize.base}px;
          border-bottom: 1px solid var(--gray-100);
        }

        .totals-row:last-of-type { border-bottom: none; }

        .totals-row.grand-total {
          font-size: ${fontSize.header}px;
          font-weight: 700;
          color: var(--primary-900);
          border-top: 3px solid var(--accent-gold);
          border-bottom: none;
          margin-top: 15px;
          padding-top: 20px;
        }

        /* Payment History Section */
        .payment-history-section {
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
          border: 1px solid var(--accent-gold);
          border-radius: 12px;
          padding: 20px;
          margin: 25px 0;
        }

        .payment-history-section .section-title {
          margin-top: 0;
          border-bottom-color: var(--primary-900);
        }

        .empty-payments {
          text-align: center;
          padding: 40px;
          color: var(--gray-400);
          font-style: italic;
        }

        /* Footer */
        .footer {
          margin-top: 40px;
          padding-top: 25px;
          border-top: 1px solid var(--gray-100);
          text-align: center;
        }

        .footer-note {
          font-size: ${fontSize.base}px;
          color: var(--gray-600);
          margin-bottom: 15px;
        }

        .footer-text {
          font-size: ${fontSize.base}px;
          color: var(--gray-600);
          margin-bottom: 15px;
        }

        .terms {
          margin-top: 20px;
          padding: 18px;
          background: var(--gray-50);
          border-radius: 8px;
          font-size: ${fontSize.caption}px;
          color: var(--gray-600);
          text-align: left;
          white-space: pre-wrap;
        }

        .terms-title {
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .thank-you {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: ${fontSize.header + 2}px;
          color: var(--primary-900);
          font-weight: 600;
          margin-top: 25px;
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="header">
          ${showLogo && settings.businessLogo ? `<img src="${settings.businessLogo}" class="business-logo" alt="Logo" />` : ''}
          <div class="business-name">${settings.businessName || 'Business Name'}</div>
          <div class="business-info">
            ${settings.businessAddress ? settings.businessAddress : ''}
            ${settings.businessCity ? ` • ${settings.businessCity}` : ''}
            ${settings.businessState ? `, ${settings.businessState}` : ''}
          </div>
          <div class="business-info">
            ${settings.businessPhone ? settings.businessPhone : ''}
            ${settings.businessPhone && settings.businessEmail ? ' • ' : ''}
            ${settings.businessEmail ? settings.businessEmail : ''}
          </div>
          <div class="receipt-title">Payment History Receipt</div>
        </div>

        <div class="invoice-details">
          <div class="invoice-left">
            <div class="invoice-label">Invoice Number</div>
            <div class="invoice-value">${receivable.invoiceNumber}</div>
            <div class="invoice-label" style="margin-top: 12px;">Original Sale Date</div>
            <div class="invoice-value">${formattedSaleDate}</div>
            ${receivable.dueDate ? `
            <div class="invoice-label" style="margin-top: 12px;">Due Date</div>
            <div class="invoice-value">${formatDate(new Date(receivable.dueDate))}</div>
            ` : ''}
          </div>
          <div class="invoice-right">
            <div class="invoice-label">Receipt Date</div>
            <div class="invoice-value">${formattedReceiptDate}</div>
            <div class="invoice-label" style="margin-top: 12px;">Status</div>
            <div style="margin-top: 6px;">
              <span class="status-badge">${status.label}</span>
            </div>
          </div>
        </div>

        <div class="customer-info">
          <div class="customer-label">Bill To</div>
          <div class="customer-name">${customer?.name || 'Walk-in Customer'}</div>
          ${customer?.phone ? `<div class="customer-contact">${customer.phone}</div>` : ''}
          ${customer?.email ? `<div class="customer-contact">${customer.email}</div>` : ''}
          ${customer?.address ? `<div class="customer-contact">${customer.address}</div>` : ''}
        </div>

        <div class="balance-summary">
          <div class="balance-card total">
            <div class="balance-label">Total Amount</div>
            <div class="balance-value">${formatCurrency(receivable.totalAmount, settings)}</div>
          </div>
          <div class="balance-card paid">
            <div class="balance-label">Amount Paid</div>
            <div class="balance-value">${formatCurrency(receivable.paidAmount, settings)}</div>
          </div>
          <div class="balance-card remaining">
            <div class="balance-label">${receivable.remainingAmount > 0 ? 'Balance Due' : 'Fully Paid'}</div>
            <div class="balance-value">${formatCurrency(receivable.remainingAmount, settings)}</div>
          </div>
        </div>

        ${(items.length > 0 || services.length > 0) ? `
        <div class="section-title">Items & Services Purchased</div>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th class="text-center">Qty</th>
              <th class="text-right">Unit Price</th>
              ${showTax ? '<th class="text-right">Tax</th>' : ''}
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <div class="totals-section">
          <div class="totals-row">
            <span>Subtotal</span>
            <span>${formatCurrency(sale.subtotal, settings)}</span>
          </div>
          ${showTax ? `
          <div class="totals-row">
            <span>Tax</span>
            <span>${formatCurrency(sale.taxAmount, settings)}</span>
          </div>
          ` : ''}
          ${sale.discountAmount > 0 ? `
          <div class="totals-row">
            <span>Discount</span>
            <span style="color: var(--accent-rose);">-${formatCurrency(sale.discountAmount, settings)}</span>
          </div>
          ` : ''}
          <div class="totals-row grand-total">
            <span>Grand Total</span>
            <span>${formatCurrency(sale.totalAmount, settings)}</span>
          </div>
        </div>
        ` : '' /* items.length > 0 || services.length > 0 */}

        <div class="payment-history-section">
          <div class="section-title">Payment History</div>
          ${payments.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th class="text-center">Method</th>
                <th class="text-right">Amount</th>
                <th class="text-right">Total Paid</th>
                <th class="text-right">Balance</th>
                <th class="text-center">Reference</th>
              </tr>
            </thead>
            <tbody>
              ${paymentsWithBalanceHTML}
            </tbody>
          </table>
          ` : `
          <div class="empty-payments">No payments have been recorded yet.</div>
          `}
        </div>

        <div class="footer">
          <div class="footer-note">This receipt serves as proof of payment history for the referenced invoice.</div>
          ${settings.receiptFooter ? `<div class="footer-text">${settings.receiptFooter}</div>` : ''}
          ${settings.receiptTermsAndConditions ? `
          <div class="terms">
            <div class="terms-title">Terms & Conditions</div>
            ${settings.receiptTermsAndConditions}
          </div>
          ` : ''}
          <div class="thank-you">Thank You for Your Business</div>
        </div>
      </div>
    </body>
    </html>
  `
}

// Generate Thermal Payment History Receipt HTML (80mm format) - Optimized for thermal printers
function generateThermalPaymentHistoryReceiptHTML(data: PaymentHistoryData): string {
  const { receivable, payments, sale, customer, businessSettings: settings } = data
  const showTax = settings.showTaxOnReceipt !== false

  // Status indicator with visual emphasis
  const statusConfig = {
    paid: { symbol: '✓', label: 'PAID' },
    partial: { symbol: '◐', label: 'PARTIAL' },
    overdue: { symbol: '!', label: 'OVERDUE' },
    pending: { symbol: '○', label: 'PENDING' },
  }
  const status = statusConfig[receivable.status as keyof typeof statusConfig] || statusConfig.pending

  // Format short dates for thermal
  const saleDate = new Date(sale.saleDate)
  const shortSaleDate = `${saleDate.getDate().toString().padStart(2, '0')}/${(saleDate.getMonth() + 1).toString().padStart(2, '0')}/${saleDate.getFullYear().toString().slice(-2)}`
  const now = new Date()
  const shortNowDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear().toString().slice(-2)}`

  // Build payment history rows with running balance
  let runningBalance = 0
  const paymentsHTML = payments
    .map((payment) => {
      runningBalance += payment.amount
      const remaining = Math.max(0, receivable.totalAmount - runningBalance)
      const pDate = new Date(payment.paymentDate)
      const shortPDate = `${pDate.getDate().toString().padStart(2, '0')}/${(pDate.getMonth() + 1).toString().padStart(2, '0')}`
      return `
      <div class="payment-entry">
        <div class="payment-header">
          <span class="payment-date">${shortPDate}</span>
          <span class="payment-method">${getPaymentMethodLabel(payment.paymentMethod).toUpperCase()}</span>
        </div>
        <div class="payment-amounts">
          <span>Amount: ${formatCurrency(payment.amount, settings)}</span>
          <span>Due: ${formatCurrency(remaining, settings)}</span>
        </div>
        ${payment.referenceNumber ? `<div class="payment-ref">REF: ${payment.referenceNumber}</div>` : ''}
      </div>
    `
    })
    .join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: 'JetBrains Mono', 'Consolas', 'Courier New', monospace;
          font-size: 10px;
          line-height: 1.3;
          color: #000;
          width: 302px;
          padding: 8px 10px;
          background: white;
        }

        /* Header */
        .header-box {
          border: 2px solid #000;
          padding: 8px;
          margin-bottom: 8px;
          text-align: center;
        }

        .business-name {
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .business-info {
          font-size: 9px;
          margin-top: 4px;
          color: #333;
        }

        .receipt-title {
          font-size: 11px;
          font-weight: 700;
          margin-top: 6px;
          padding: 4px 10px;
          background: #000;
          color: #fff;
          display: inline-block;
          letter-spacing: 1px;
        }

        /* Dividers */
        .div-double { border-top: 3px double #000; margin: 8px 0; }
        .div-single { border-top: 1px solid #000; margin: 6px 0; }

        /* Invoice Section */
        .invoice-section { margin: 8px 0; }

        .inv-row {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          padding: 2px 0;
        }

        .inv-number { font-weight: 700; font-size: 11px; }

        /* Customer Section */
        .customer-section {
          background: #f0f0f0;
          padding: 6px 8px;
          margin: 8px 0;
        }

        .customer-name {
          font-weight: 700;
          font-size: 11px;
          text-transform: uppercase;
        }

        .customer-contact { font-size: 9px; color: #444; }

        /* Status Box */
        .status-box {
          border: 2px solid #000;
          padding: 6px;
          margin: 8px 0;
          text-align: center;
        }

        .status-indicator {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        /* Balance Section */
        .balance-section {
          background: #e8e8e8;
          padding: 8px;
          margin: 8px 0;
        }

        .balance-row {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          padding: 3px 0;
        }

        .balance-row.highlight {
          font-weight: 700;
          font-size: 12px;
          border-top: 1px solid #000;
          padding-top: 6px;
          margin-top: 4px;
        }

        .balance-value { font-weight: 700; }

        /* Payment History */
        .history-section {
          border: 1px solid #000;
          padding: 8px;
          margin: 8px 0;
        }

        .history-title {
          font-size: 10px;
          font-weight: 700;
          text-align: center;
          margin-bottom: 8px;
          padding-bottom: 4px;
          border-bottom: 1px solid #000;
          letter-spacing: 1px;
        }

        .payment-entry {
          margin-bottom: 8px;
          padding-bottom: 6px;
          border-bottom: 1px dotted #999;
        }

        .payment-entry:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }

        .payment-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2px;
        }

        .payment-date { font-size: 9px; color: #666; }

        .payment-method {
          font-weight: 700;
          font-size: 9px;
          padding: 1px 4px;
          background: #000;
          color: #fff;
        }

        .payment-amounts {
          display: flex;
          justify-content: space-between;
          font-size: 9px;
        }

        .payment-ref {
          font-size: 8px;
          color: #666;
          margin-top: 2px;
        }

        .empty-history {
          text-align: center;
          padding: 10px;
          font-style: italic;
          font-size: 9px;
          color: #666;
        }

        /* Totals */
        .totals-section { margin: 10px 0; }

        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          padding: 3px 0;
        }

        .total-label { flex: 1; }
        .total-dots { flex: 2; border-bottom: 1px dotted #999; margin: 0 4px 3px 4px; }
        .total-value { text-align: right; min-width: 70px; }

        .grand-total-box {
          border: 2px solid #000;
          padding: 8px;
          margin: 8px 0;
          display: flex;
          justify-content: space-between;
          font-weight: 700;
          font-size: 14px;
        }

        /* Footer */
        .footer {
          text-align: center;
          margin-top: 10px;
          padding-top: 8px;
        }

        .footer-msg {
          font-size: 9px;
          color: #666;
          margin-bottom: 6px;
        }

        .thank-you-box {
          border-top: 2px solid #000;
          border-bottom: 2px solid #000;
          padding: 8px;
          margin-top: 10px;
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 2px;
        }
      </style>
    </head>
    <body>
      <div class="header-box">
        <div class="business-name">${settings.businessName || 'BUSINESS'}</div>
        <div class="business-info">
          ${settings.businessAddress || ''}${settings.businessCity ? `, ${settings.businessCity}` : ''}
        </div>
        ${settings.businessPhone ? `<div class="business-info">TEL: ${settings.businessPhone}</div>` : ''}
        <div class="receipt-title">PAYMENT HISTORY</div>
      </div>

      <div class="invoice-section">
        <div class="inv-row">
          <span>INV#</span>
          <span class="inv-number">${receivable.invoiceNumber}</span>
        </div>
        <div class="inv-row">
          <span>SALE DATE</span>
          <span>${shortSaleDate}</span>
        </div>
        <div class="inv-row">
          <span>RECEIPT</span>
          <span>${shortNowDate}</span>
        </div>
      </div>

      <div class="div-single"></div>

      <div class="customer-section">
        <div class="customer-name">${customer?.name || 'WALK-IN CUSTOMER'}</div>
        ${customer?.phone ? `<div class="customer-contact">TEL: ${customer.phone}</div>` : ''}
      </div>

      <div class="status-box">
        <div class="status-indicator">${status.symbol} ${status.label}</div>
      </div>

      <div class="balance-section">
        <div class="balance-row">
          <span>TOTAL AMOUNT</span>
          <span class="balance-value">${formatCurrency(receivable.totalAmount, settings)}</span>
        </div>
        <div class="balance-row">
          <span>TOTAL PAID</span>
          <span class="balance-value">${formatCurrency(receivable.paidAmount, settings)}</span>
        </div>
        <div class="balance-row highlight">
          <span>${receivable.remainingAmount > 0 ? '★ BALANCE DUE' : '✓ FULLY PAID'}</span>
          <span class="balance-value">${formatCurrency(receivable.remainingAmount, settings)}</span>
        </div>
      </div>

      <div class="history-section">
        <div class="history-title">PAYMENT RECORDS</div>
        ${payments.length > 0 ? paymentsHTML : '<div class="empty-history">No payments recorded</div>'}
      </div>

      <div class="totals-section">
        <div class="total-row">
          <span class="total-label">SUBTOTAL</span>
          <span class="total-dots"></span>
          <span class="total-value">${formatCurrency(sale.subtotal, settings)}</span>
        </div>
        ${showTax ? `
        <div class="total-row">
          <span class="total-label">TAX</span>
          <span class="total-dots"></span>
          <span class="total-value">${formatCurrency(sale.taxAmount, settings)}</span>
        </div>
        ` : ''}
        ${sale.discountAmount > 0 ? `
        <div class="total-row">
          <span class="total-label">DISCOUNT</span>
          <span class="total-dots"></span>
          <span class="total-value">-${formatCurrency(sale.discountAmount, settings)}</span>
        </div>
        ` : ''}
      </div>

      <div class="grand-total-box">
        <span>INVOICE TOTAL</span>
        <span>${formatCurrency(sale.totalAmount, settings)}</span>
      </div>

      <div class="footer">
        ${settings.receiptFooter ? `<div class="footer-msg">${settings.receiptFooter}</div>` : ''}
        <div class="thank-you-box">THANK YOU</div>
      </div>
    </body>
    </html>
  `
}

// Generate payment history receipt
export async function generatePaymentHistoryReceipt(
  data: PaymentHistoryData,
  options: ReceiptOptions
): Promise<string> {
  const { format, autoDownload } = options

  // Generate HTML based on format
  const htmlContent =
    format === 'thermal'
      ? generateThermalPaymentHistoryReceiptHTML(data)
      : generatePDFPaymentHistoryReceiptHTML(data)

  // Page settings based on format
  const pageSettings =
    format === 'thermal'
      ? {
          pageSize: { width: 80 * 1000, height: 210 * 1000 } as Electron.Size,
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
        }
      : {
          pageSize: 'A4' as const,
          margins: { top: 0.4, bottom: 0.4, left: 0.4, right: 0.4 },
        }

  // Create hidden window for PDF generation
  const pdfWindow = new BrowserWindow({
    show: false,
    width: format === 'thermal' ? 320 : 900,
    height: format === 'thermal' ? 1800 : 1200,
    webPreferences: {
      nodeIntegration: false,
    },
  })

  try {
    // Load HTML content
    await pdfWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`)

    // Wait for content to render - longer for thermal to ensure all content loads
    await new Promise((resolve) => setTimeout(resolve, format === 'thermal' ? 1000 : 500))

    // Generate PDF
    const pdfData = await pdfWindow.webContents.printToPDF({
      pageSize: pageSettings.pageSize,
      printBackground: true,
      landscape: false,
      margins: pageSettings.margins,
    })

    // Determine file path
    let filePath: string
    if (autoDownload) {
      const downloadsPath = app.getPath('downloads')
      const fileName = `payment_history_${data.receivable.invoiceNumber}_${Date.now()}.pdf`
      filePath = path.join(downloadsPath, fileName)
    } else {
      const tempPath = app.getPath('temp')
      const fileName = `payment_history_${data.receivable.invoiceNumber}_${Date.now()}.pdf`
      filePath = path.join(tempPath, fileName)
    }

    // Save PDF file
    fs.writeFileSync(filePath, pdfData)

    return filePath
  } finally {
    pdfWindow.close()
  }
}

// Main receipt generation function
export async function generateReceipt(data: ReceiptData, options: ReceiptOptions): Promise<string> {
  const { format, autoDownload } = options

  // Generate HTML based on format
  const htmlContent =
    format === 'thermal' ? generateThermalReceiptHTML(data) : generatePDFReceiptHTML(data)

  // Page settings based on format
  const pageSettings =
    format === 'thermal'
      ? {
          pageSize: { width: 80 * 1000, height: 210 * 1000 } as Electron.Size, // 80mm width, 210mm height
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
        }
      : {
          pageSize: 'A4' as const,
          margins: { top: 0.4, bottom: 0.4, left: 0.4, right: 0.4 },
        }

  // Create hidden window for PDF generation
  const pdfWindow = new BrowserWindow({
    show: false,
    width: format === 'thermal' ? 320 : 800,
    height: format === 'thermal' ? 1800 : 1200,
    webPreferences: {
      nodeIntegration: false,
    },
  })

  try {
    // Load HTML content
    await pdfWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`)

    // Wait for content to render - longer for thermal to ensure all content loads
    await new Promise((resolve) => setTimeout(resolve, format === 'thermal' ? 1000 : 500))

    // Generate PDF
    const pdfData = await pdfWindow.webContents.printToPDF({
      pageSize: pageSettings.pageSize,
      printBackground: true,
      landscape: false,
      margins: pageSettings.margins,
    })

    // Determine file path
    let filePath: string
    if (autoDownload) {
      const downloadsPath = app.getPath('downloads')
      const fileName = `receipt_${data.sale.invoiceNumber}_${Date.now()}.pdf`
      filePath = path.join(downloadsPath, fileName)
    } else {
      // Use temp folder if not auto-downloading
      const tempPath = app.getPath('temp')
      const fileName = `receipt_${data.sale.invoiceNumber}_${Date.now()}.pdf`
      filePath = path.join(tempPath, fileName)
    }

    // Save PDF file
    fs.writeFileSync(filePath, pdfData)

    return filePath
  } finally {
    pdfWindow.close()
  }
}
