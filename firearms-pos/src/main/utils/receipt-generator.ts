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

export interface ReceiptCustomerData {
  name: string
  phone?: string
  email?: string
  address?: string
}

export interface ReceiptData {
  sale: ReceiptSaleData
  items: ReceiptItemData[]
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
  customer: ReceiptCustomerData | null
  businessSettings: BusinessSettings
}

// Font size mapping
const fontSizeMap = {
  small: { base: 10, header: 14, title: 18 },
  medium: { base: 12, header: 16, title: 22 },
  large: { base: 14, header: 18, title: 26 },
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

// Generate PDF Receipt HTML (A4 format)
function generatePDFReceiptHTML(data: ReceiptData): string {
  const { sale, items, customer, businessSettings: settings } = data
  const fontSize = fontSizeMap[settings.receiptFontSize as keyof typeof fontSizeMap] || fontSizeMap.medium
  const primaryColor = settings.receiptPrimaryColor || '#1e40af'
  const secondaryColor = settings.receiptSecondaryColor || '#64748b'
  const showTax = settings.showTaxOnReceipt !== false
  const showLogo = settings.receiptShowBusinessLogo !== false

  // Build custom fields HTML
  let customFieldsHTML = ''
  if (settings.receiptCustomField1Label && settings.receiptCustomField1Value) {
    customFieldsHTML += `<p><strong>${settings.receiptCustomField1Label}:</strong> ${settings.receiptCustomField1Value}</p>`
  }
  if (settings.receiptCustomField2Label && settings.receiptCustomField2Value) {
    customFieldsHTML += `<p><strong>${settings.receiptCustomField2Label}:</strong> ${settings.receiptCustomField2Value}</p>`
  }
  if (settings.receiptCustomField3Label && settings.receiptCustomField3Value) {
    customFieldsHTML += `<p><strong>${settings.receiptCustomField3Label}:</strong> ${settings.receiptCustomField3Value}</p>`
  }

  // Build items rows
  const itemsHTML = items
    .map(
      (item) => `
      <tr>
        <td>${item.productName}${item.serialNumber ? `<br><small style="color: ${secondaryColor};">S/N: ${item.serialNumber}</small>` : ''}</td>
        <td class="text-center">${item.quantity}</td>
        <td class="text-right">${formatCurrency(item.unitPrice, settings)}</td>
        ${showTax ? `<td class="text-right">${formatCurrency(item.taxAmount, settings)}</td>` : ''}
        <td class="text-right">${formatCurrency(item.totalPrice, settings)}</td>
      </tr>
    `
    )
    .join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: ${fontSize.base}px;
          line-height: 1.5;
          color: #333;
          padding: 30px;
        }
        .receipt-container {
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid ${primaryColor};
          padding-bottom: 20px;
          margin-bottom: 25px;
        }
        .business-logo {
          max-width: 120px;
          max-height: 80px;
          margin-bottom: 10px;
        }
        .business-name {
          font-size: ${fontSize.title}px;
          font-weight: bold;
          color: ${primaryColor};
          margin-bottom: 5px;
        }
        .business-info {
          font-size: ${fontSize.base - 1}px;
          color: ${secondaryColor};
          margin-bottom: 8px;
        }
        .receipt-header-text {
          font-size: ${fontSize.base}px;
          color: #333;
          margin-top: 10px;
          font-style: italic;
        }
        .invoice-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 25px;
          padding: 15px;
          background: #f8fafc;
          border-radius: 8px;
        }
        .invoice-left, .invoice-right {
          flex: 1;
        }
        .invoice-right {
          text-align: right;
        }
        .invoice-label {
          font-size: ${fontSize.base - 2}px;
          color: ${secondaryColor};
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .invoice-value {
          font-size: ${fontSize.header}px;
          font-weight: bold;
          color: #1e293b;
        }
        .customer-info {
          margin-bottom: 20px;
          padding: 15px;
          background: #f1f5f9;
          border-left: 4px solid ${primaryColor};
          border-radius: 4px;
        }
        .customer-label {
          font-size: ${fontSize.base - 1}px;
          color: ${secondaryColor};
          margin-bottom: 5px;
        }
        .customer-name {
          font-size: ${fontSize.header}px;
          font-weight: bold;
          color: #1e293b;
        }
        .customer-contact {
          font-size: ${fontSize.base}px;
          color: #475569;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        thead {
          background: ${primaryColor};
          color: white;
        }
        th {
          padding: 12px 10px;
          text-align: left;
          font-weight: 600;
          font-size: ${fontSize.base}px;
        }
        td {
          padding: 12px 10px;
          border-bottom: 1px solid #e2e8f0;
          font-size: ${fontSize.base}px;
        }
        tr:nth-child(even) {
          background: #f8fafc;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .totals-section {
          margin-top: 25px;
          border-top: 2px solid #e2e8f0;
          padding-top: 15px;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: ${fontSize.base}px;
        }
        .totals-row.grand-total {
          font-size: ${fontSize.header}px;
          font-weight: bold;
          color: ${primaryColor};
          border-top: 2px solid ${primaryColor};
          margin-top: 10px;
          padding-top: 15px;
        }
        .payment-info {
          margin-top: 20px;
          padding: 15px;
          background: #ecfdf5;
          border-radius: 8px;
          border: 1px solid #10b981;
        }
        .payment-row {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
        }
        .payment-method {
          display: inline-block;
          padding: 4px 12px;
          background: ${primaryColor};
          color: white;
          border-radius: 4px;
          font-size: ${fontSize.base - 1}px;
          font-weight: 600;
        }
        .custom-fields {
          margin-top: 25px;
          padding: 15px;
          background: #fefce8;
          border-radius: 8px;
          font-size: ${fontSize.base}px;
        }
        .custom-fields p {
          margin-bottom: 5px;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #e2e8f0;
          text-align: center;
        }
        .footer-text {
          font-size: ${fontSize.base}px;
          color: #333;
          margin-bottom: 15px;
        }
        .terms {
          margin-top: 20px;
          padding: 15px;
          background: #f8fafc;
          border-radius: 8px;
          font-size: ${fontSize.base - 1}px;
          color: ${secondaryColor};
          text-align: left;
          white-space: pre-wrap;
        }
        .terms-title {
          font-weight: bold;
          color: #333;
          margin-bottom: 8px;
        }
        .thank-you {
          font-size: ${fontSize.header}px;
          color: ${primaryColor};
          font-weight: bold;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="header">
          ${showLogo && settings.businessLogo ? `<img src="${settings.businessLogo}" class="business-logo" alt="Logo" />` : ''}
          <div class="business-name">${settings.businessName || 'Business Name'}</div>
          <div class="business-info">
            ${settings.businessAddress ? settings.businessAddress + ', ' : ''}
            ${settings.businessCity || ''}
            ${settings.businessState ? ', ' + settings.businessState : ''}
          </div>
          <div class="business-info">
            ${settings.businessPhone ? 'Tel: ' + settings.businessPhone : ''}
            ${settings.businessPhone && settings.businessEmail ? ' | ' : ''}
            ${settings.businessEmail ? settings.businessEmail : ''}
          </div>
          ${settings.receiptHeader ? `<div class="receipt-header-text">${settings.receiptHeader}</div>` : ''}
        </div>

        <div class="invoice-details">
          <div class="invoice-left">
            <div class="invoice-label">Invoice Number</div>
            <div class="invoice-value">${sale.invoiceNumber}</div>
          </div>
          <div class="invoice-right">
            <div class="invoice-label">Date & Time</div>
            <div class="invoice-value">${formatDateTime(new Date(sale.saleDate))}</div>
          </div>
        </div>

        <div class="customer-info">
          <div class="customer-label">Customer</div>
          <div class="customer-name">${customer?.name || 'Walk-in Customer'}</div>
          ${customer?.phone ? `<div class="customer-contact">Phone: ${customer.phone}</div>` : ''}
          ${customer?.email ? `<div class="customer-contact">Email: ${customer.email}</div>` : ''}
          ${customer?.address ? `<div class="customer-contact">Address: ${customer.address}</div>` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th class="text-center">Qty</th>
              <th class="text-right">Price</th>
              ${showTax ? '<th class="text-right">Tax</th>' : ''}
              <th class="text-right">Total</th>
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
          ${
            showTax
              ? `
          <div class="totals-row">
            <span>Tax</span>
            <span>${formatCurrency(sale.taxAmount, settings)}</span>
          </div>
          `
              : ''
          }
          ${
            sale.discountAmount > 0
              ? `
          <div class="totals-row">
            <span>Discount</span>
            <span style="color: #dc2626;">-${formatCurrency(sale.discountAmount, settings)}</span>
          </div>
          `
              : ''
          }
          <div class="totals-row grand-total">
            <span>Grand Total</span>
            <span>${formatCurrency(sale.totalAmount, settings)}</span>
          </div>
        </div>

        <div class="payment-info">
          <div class="payment-row">
            <span>Payment Method</span>
            <span class="payment-method">${getPaymentMethodLabel(sale.paymentMethod)}</span>
          </div>
          <div class="payment-row">
            <span>Amount Paid</span>
            <span><strong>${formatCurrency(sale.amountPaid, settings)}</strong></span>
          </div>
          ${
            sale.amountPaid < sale.totalAmount
              ? `
          <div class="payment-row" style="color: #dc2626;">
            <span>Remaining Amount</span>
            <span><strong>${formatCurrency(sale.totalAmount - sale.amountPaid, settings)}</strong></span>
          </div>
          `
              : ''
          }
          ${
            sale.changeGiven > 0
              ? `
          <div class="payment-row">
            <span>Change</span>
            <span><strong>${formatCurrency(sale.changeGiven, settings)}</strong></span>
          </div>
          `
              : ''
          }
        </div>

        ${customFieldsHTML ? `<div class="custom-fields">${customFieldsHTML}</div>` : ''}

        <div class="footer">
          ${settings.receiptFooter ? `<div class="footer-text">${settings.receiptFooter}</div>` : ''}
          ${
            settings.receiptTermsAndConditions
              ? `
          <div class="terms">
            <div class="terms-title">Terms & Conditions</div>
            ${settings.receiptTermsAndConditions}
          </div>
          `
              : ''
          }
          <div class="thank-you">Thank You for Your Business!</div>
        </div>
      </div>
    </body>
    </html>
  `
}

// Generate Thermal Receipt HTML (80mm format)
function generateThermalReceiptHTML(data: ReceiptData): string {
  const { sale, items, customer, businessSettings: settings } = data
  const showTax = settings.showTaxOnReceipt !== false
  const primaryColor = settings.receiptPrimaryColor || '#1e40af'

  // Build items rows for thermal
  const itemsHTML = items
    .map(
      (item) => `
      <div class="item-row">
        <div class="item-name">${item.productName}</div>
        ${item.serialNumber ? `<div class="item-serial">S/N: ${item.serialNumber}</div>` : ''}
        <div class="item-details">
          <span>${item.quantity} x ${formatCurrency(item.unitPrice, settings)}</span>
          <span class="item-total">${formatCurrency(item.totalPrice, settings)}</span>
        </div>
      </div>
    `
    )
    .join('')

  // Build custom fields
  let customFieldsHTML = ''
  if (settings.receiptCustomField1Label && settings.receiptCustomField1Value) {
    customFieldsHTML += `<div class="custom-field">${settings.receiptCustomField1Label}: ${settings.receiptCustomField1Value}</div>`
  }
  if (settings.receiptCustomField2Label && settings.receiptCustomField2Value) {
    customFieldsHTML += `<div class="custom-field">${settings.receiptCustomField2Label}: ${settings.receiptCustomField2Value}</div>`
  }
  if (settings.receiptCustomField3Label && settings.receiptCustomField3Value) {
    customFieldsHTML += `<div class="custom-field">${settings.receiptCustomField3Label}: ${settings.receiptCustomField3Value}</div>`
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
          color: #000;
          width: 302px;
          padding: 10px;
          background: white;
        }
        .header {
          text-align: center;
          border-bottom: 1px dashed #000;
          padding-bottom: 10px;
          margin-bottom: 10px;
        }
        .business-name {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .business-info {
          font-size: 10px;
          color: #333;
        }
        .receipt-header-text {
          font-size: 10px;
          font-style: italic;
          margin-top: 5px;
        }
        .invoice-section {
          margin: 10px 0;
          border-bottom: 1px dashed #000;
          padding-bottom: 10px;
        }
        .invoice-row {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
        }
        .invoice-row strong {
          font-size: 12px;
        }
        .customer-section {
          margin: 10px 0;
          padding: 8px;
          background: #f5f5f5;
          border-radius: 4px;
        }
        .customer-name {
          font-weight: bold;
          font-size: 12px;
        }
        .customer-contact {
          font-size: 10px;
          color: #333;
        }
        .items-section {
          margin: 10px 0;
          border-bottom: 1px dashed #000;
          padding-bottom: 10px;
        }
        .items-header {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
          border-bottom: 1px solid #000;
          padding-bottom: 5px;
          margin-bottom: 8px;
          font-size: 11px;
        }
        .item-row {
          margin-bottom: 8px;
        }
        .item-name {
          font-weight: bold;
          font-size: 11px;
        }
        .item-serial {
          font-size: 9px;
          color: #666;
        }
        .item-details {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
        }
        .item-total {
          font-weight: bold;
        }
        .totals-section {
          margin: 10px 0;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          padding: 3px 0;
        }
        .total-row.grand-total {
          font-size: 14px;
          font-weight: bold;
          border-top: 2px solid #000;
          border-bottom: 2px solid #000;
          padding: 8px 0;
          margin-top: 5px;
        }
        .payment-section {
          margin: 10px 0;
          padding: 8px;
          background: #f0f0f0;
          border-radius: 4px;
        }
        .payment-row {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          padding: 2px 0;
        }
        .payment-method-badge {
          font-weight: bold;
          padding: 2px 6px;
          background: ${primaryColor};
          color: white;
          border-radius: 3px;
          font-size: 10px;
        }
        .custom-fields {
          margin: 10px 0;
          padding: 8px;
          background: #fff8e1;
          border-radius: 4px;
          font-size: 10px;
        }
        .custom-field {
          padding: 2px 0;
        }
        .footer {
          margin-top: 10px;
          text-align: center;
          border-top: 1px dashed #000;
          padding-top: 10px;
        }
        .footer-text {
          font-size: 10px;
          margin-bottom: 5px;
        }
        .terms {
          margin-top: 8px;
          padding: 8px;
          background: #f5f5f5;
          border-radius: 4px;
          font-size: 9px;
          text-align: left;
          white-space: pre-wrap;
        }
        .thank-you {
          font-size: 12px;
          font-weight: bold;
          margin-top: 10px;
        }
        .separator {
          border-bottom: 1px dashed #000;
          margin: 8px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="business-name">${settings.businessName || 'Business'}</div>
        <div class="business-info">
          ${settings.businessAddress || ''}
          ${settings.businessCity ? ', ' + settings.businessCity : ''}
        </div>
        ${settings.businessPhone ? `<div class="business-info">Tel: ${settings.businessPhone}</div>` : ''}
        ${settings.receiptHeader ? `<div class="receipt-header-text">${settings.receiptHeader}</div>` : ''}
      </div>

      <div class="invoice-section">
        <div class="invoice-row">
          <span>Invoice:</span>
          <strong>${sale.invoiceNumber}</strong>
        </div>
        <div class="invoice-row">
          <span>Date:</span>
          <span>${formatDateTime(new Date(sale.saleDate))}</span>
        </div>
      </div>

      <div class="customer-section">
        <div class="customer-name">${customer?.name || 'Walk-in Customer'}</div>
        ${customer?.phone ? `<div class="customer-contact">Tel: ${customer.phone}</div>` : ''}
      </div>

      <div class="items-section">
        <div class="items-header">
          <span>ITEM</span>
          <span>TOTAL</span>
        </div>
        ${itemsHTML}
      </div>

      <div class="totals-section">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>${formatCurrency(sale.subtotal, settings)}</span>
        </div>
        ${
          showTax
            ? `
        <div class="total-row">
          <span>Tax:</span>
          <span>${formatCurrency(sale.taxAmount, settings)}</span>
        </div>
        `
            : ''
        }
        ${
          sale.discountAmount > 0
            ? `
        <div class="total-row">
          <span>Discount:</span>
          <span>-${formatCurrency(sale.discountAmount, settings)}</span>
        </div>
        `
            : ''
        }
        <div class="total-row grand-total">
          <span>TOTAL:</span>
          <span>${formatCurrency(sale.totalAmount, settings)}</span>
        </div>
      </div>

      <div class="payment-section">
        <div class="payment-row">
          <span>Payment:</span>
          <span class="payment-method-badge">${getPaymentMethodLabel(sale.paymentMethod)}</span>
        </div>
        <div class="payment-row">
          <span>Paid:</span>
          <strong>${formatCurrency(sale.amountPaid, settings)}</strong>
        </div>
        ${
          sale.amountPaid < sale.totalAmount
            ? `
        <div class="payment-row" style="color: #dc2626;">
          <span>Remaining:</span>
          <strong>${formatCurrency(sale.totalAmount - sale.amountPaid, settings)}</strong>
        </div>
        `
            : ''
        }
        ${
          sale.changeGiven > 0
            ? `
        <div class="payment-row">
          <span>Change:</span>
          <strong>${formatCurrency(sale.changeGiven, settings)}</strong>
        </div>
        `
            : ''
        }
      </div>

      ${customFieldsHTML ? `<div class="custom-fields">${customFieldsHTML}</div>` : ''}

      <div class="footer">
        ${settings.receiptFooter ? `<div class="footer-text">${settings.receiptFooter}</div>` : ''}
        ${
          settings.receiptTermsAndConditions
            ? `
        <div class="terms">${settings.receiptTermsAndConditions}</div>
        `
            : ''
        }
        <div class="thank-you">Thank You!</div>
      </div>
    </body>
    </html>
  `
}

// Generate PDF Payment History Receipt HTML (A4 format)
function generatePDFPaymentHistoryReceiptHTML(data: PaymentHistoryData): string {
  const { receivable, payments, sale, items, customer, businessSettings: settings } = data
  const fontSize = fontSizeMap[settings.receiptFontSize as keyof typeof fontSizeMap] || fontSizeMap.medium
  const primaryColor = settings.receiptPrimaryColor || '#1e40af'
  const secondaryColor = settings.receiptSecondaryColor || '#64748b'
  const showTax = settings.showTaxOnReceipt !== false
  const showLogo = settings.receiptShowBusinessLogo !== false

  // Status badge color
  const statusColor =
    receivable.status === 'paid'
      ? '#10b981'
      : receivable.status === 'partial'
        ? '#f59e0b'
        : receivable.status === 'overdue'
          ? '#dc2626'
          : '#64748b'

  // Build items rows
  const itemsHTML = items
    .map(
      (item) => `
      <tr>
        <td>${item.productName}${item.serialNumber ? `<br><small style="color: ${secondaryColor};">S/N: ${item.serialNumber}</small>` : ''}</td>
        <td class="text-center">${item.quantity}</td>
        <td class="text-right">${formatCurrency(item.unitPrice, settings)}</td>
        ${showTax ? `<td class="text-right">${formatCurrency(item.taxAmount, settings)}</td>` : ''}
        <td class="text-right">${formatCurrency(item.totalPrice, settings)}</td>
      </tr>
    `
    )
    .join('')

  // Build payment history with running balance
  let runningBalance = 0
  const paymentsWithBalanceHTML = payments
    .map((payment) => {
      runningBalance += payment.amount
      const remaining = Math.max(0, receivable.totalAmount - runningBalance)
      return `
        <tr>
          <td>${formatDateTime(new Date(payment.paymentDate))}</td>
          <td class="text-center">${getPaymentMethodLabel(payment.paymentMethod)}</td>
          <td class="text-right">${formatCurrency(payment.amount, settings)}</td>
          <td class="text-right">${formatCurrency(runningBalance, settings)}</td>
          <td class="text-right" style="color: ${remaining > 0 ? '#dc2626' : '#10b981'}; font-weight: bold;">${formatCurrency(remaining, settings)}</td>
          <td class="text-center">${payment.referenceNumber || '-'}</td>
          <td class="text-left">${payment.notes || '-'}</td>
        </tr>
      `
    })
    .join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          font-size: ${fontSize.base}px;
          line-height: 1.5;
          color: #1e293b;
          padding: 40px;
          background: white;
        }
        .receipt-container {
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 2px solid ${primaryColor};
          margin-bottom: 20px;
        }
        .business-logo {
          max-width: 120px;
          max-height: 80px;
          margin-bottom: 10px;
        }
        .business-name {
          font-size: ${fontSize.title}px;
          font-weight: bold;
          color: ${primaryColor};
          margin-bottom: 5px;
        }
        .business-info {
          font-size: ${fontSize.base}px;
          color: ${secondaryColor};
        }
        .receipt-title {
          font-size: ${fontSize.header + 2}px;
          font-weight: bold;
          color: ${primaryColor};
          margin-top: 15px;
          padding: 10px 20px;
          background: linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%);
          border-radius: 8px;
          display: inline-block;
        }
        .invoice-details {
          display: flex;
          justify-content: space-between;
          margin: 20px 0;
          padding: 15px;
          background: #f8fafc;
          border-radius: 8px;
        }
        .invoice-label {
          font-size: ${fontSize.base - 1}px;
          color: ${secondaryColor};
          margin-bottom: 3px;
        }
        .invoice-value {
          font-size: ${fontSize.base + 1}px;
          font-weight: 600;
        }
        .status-badge {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 20px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: ${fontSize.base - 1}px;
        }
        .customer-info {
          padding: 15px;
          background: #f0f9ff;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .customer-label {
          font-size: ${fontSize.base - 1}px;
          color: ${secondaryColor};
          margin-bottom: 5px;
        }
        .customer-name {
          font-size: ${fontSize.header}px;
          font-weight: bold;
          color: #0369a1;
        }
        .customer-contact {
          font-size: ${fontSize.base}px;
          color: #475569;
          margin-top: 3px;
        }
        .balance-summary {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          gap: 15px;
        }
        .balance-card {
          flex: 1;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
        }
        .balance-card.total { background: #e0f2fe; border: 1px solid #0ea5e9; }
        .balance-card.paid { background: #dcfce7; border: 1px solid #22c55e; }
        .balance-card.remaining { background: ${receivable.remainingAmount > 0 ? '#fee2e2' : '#dcfce7'}; border: 1px solid ${receivable.remainingAmount > 0 ? '#dc2626' : '#22c55e'}; }
        .balance-label {
          font-size: ${fontSize.base - 1}px;
          color: ${secondaryColor};
          margin-bottom: 5px;
        }
        .balance-value {
          font-size: ${fontSize.header + 2}px;
          font-weight: bold;
        }
        .section-title {
          font-size: ${fontSize.header}px;
          font-weight: bold;
          color: ${primaryColor};
          margin: 20px 0 10px 0;
          padding-bottom: 5px;
          border-bottom: 2px solid #e2e8f0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        th, td {
          padding: 12px;
          border-bottom: 1px solid #e2e8f0;
          text-align: left;
        }
        th {
          background: #f1f5f9;
          font-weight: 600;
          color: #475569;
          font-size: ${fontSize.base}px;
        }
        tr:nth-child(even) { background: #f8fafc; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .totals-section {
          margin-top: 15px;
          border-top: 2px solid #e2e8f0;
          padding-top: 15px;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: ${fontSize.base}px;
        }
        .totals-row.grand-total {
          font-size: ${fontSize.header}px;
          font-weight: bold;
          color: ${primaryColor};
          border-top: 2px solid ${primaryColor};
          margin-top: 10px;
          padding-top: 15px;
        }
        .payment-history-section {
          background: #fefce8;
          border: 1px solid #eab308;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #e2e8f0;
          text-align: center;
        }
        .footer-text {
          font-size: ${fontSize.base}px;
          color: #333;
          margin-bottom: 15px;
        }
        .terms {
          margin-top: 20px;
          padding: 15px;
          background: #f8fafc;
          border-radius: 8px;
          font-size: ${fontSize.base - 1}px;
          color: ${secondaryColor};
          text-align: left;
          white-space: pre-wrap;
        }
        .terms-title {
          font-weight: bold;
          color: #333;
          margin-bottom: 8px;
        }
        .thank-you {
          font-size: ${fontSize.header}px;
          color: ${primaryColor};
          font-weight: bold;
          margin-top: 20px;
        }
        .empty-payments {
          text-align: center;
          padding: 30px;
          color: ${secondaryColor};
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="header">
          ${showLogo && settings.businessLogo ? `<img src="${settings.businessLogo}" class="business-logo" alt="Logo" />` : ''}
          <div class="business-name">${settings.businessName || 'Business Name'}</div>
          <div class="business-info">
            ${settings.businessAddress || ''}
            ${settings.businessCity || settings.businessState ? ', ' : ''}
            ${settings.businessCity || ''} ${settings.businessState || ''}
          </div>
          <div class="business-info">
            ${settings.businessPhone ? 'Tel: ' + settings.businessPhone : ''}
            ${settings.businessPhone && settings.businessEmail ? ' | ' : ''}
            ${settings.businessEmail ? settings.businessEmail : ''}
          </div>
          <div class="receipt-title">PAYMENT HISTORY RECEIPT</div>
        </div>

        <div class="invoice-details">
          <div class="invoice-left">
            <div class="invoice-label">Invoice Number</div>
            <div class="invoice-value">${receivable.invoiceNumber}</div>
            <div class="invoice-label" style="margin-top: 10px;">Original Sale Date</div>
            <div class="invoice-value">${formatDateTime(new Date(sale.saleDate))}</div>
            ${receivable.dueDate ? `
            <div class="invoice-label" style="margin-top: 10px;">Due Date</div>
            <div class="invoice-value">${formatDate(new Date(receivable.dueDate))}</div>
            ` : ''}
          </div>
          <div class="invoice-right">
            <div class="invoice-label">Receipt Date</div>
            <div class="invoice-value">${formatDateTime(new Date())}</div>
            <div class="invoice-label" style="margin-top: 10px;">Status</div>
            <div style="margin-top: 5px;">
              <span class="status-badge" style="background-color: ${statusColor}; color: white;">${receivable.status.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div class="customer-info">
          <div class="customer-label">Customer</div>
          <div class="customer-name">${customer?.name || 'Walk-in Customer'}</div>
          ${customer?.phone ? `<div class="customer-contact">Phone: ${customer.phone}</div>` : ''}
          ${customer?.email ? `<div class="customer-contact">Email: ${customer.email}</div>` : ''}
          ${customer?.address ? `<div class="customer-contact">Address: ${customer.address}</div>` : ''}
        </div>

        <div class="balance-summary">
          <div class="balance-card total">
            <div class="balance-label">Total Amount</div>
            <div class="balance-value">${formatCurrency(receivable.totalAmount, settings)}</div>
          </div>
          <div class="balance-card paid">
            <div class="balance-label">Amount Paid</div>
            <div class="balance-value" style="color: #22c55e;">${formatCurrency(receivable.paidAmount, settings)}</div>
          </div>
          <div class="balance-card remaining">
            <div class="balance-label">Remaining</div>
            <div class="balance-value" style="color: ${receivable.remainingAmount > 0 ? '#dc2626' : '#22c55e'};">${formatCurrency(receivable.remainingAmount, settings)}</div>
          </div>
        </div>

        ${items.length > 0 ? `
        <div class="section-title">Items Purchased</div>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th class="text-center">Qty</th>
              <th class="text-right">Unit Price</th>
              ${showTax ? '<th class="text-right">Tax</th>' : ''}
              <th class="text-right">Total</th>
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
            <span>-${formatCurrency(sale.discountAmount, settings)}</span>
          </div>
          ` : ''}
          <div class="totals-row grand-total">
            <span>Grand Total</span>
            <span>${formatCurrency(sale.totalAmount, settings)}</span>
          </div>
        </div>
        ` : ''}

        <div class="payment-history-section">
          <div class="section-title" style="margin-top: 0;">Complete Payment History</div>
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
                <th class="text-left">Notes</th>
              </tr>
            </thead>
            <tbody>
              ${paymentsWithBalanceHTML}
            </tbody>
          </table>
          ` : `
          <div class="empty-payments">No payments have been recorded yet for this receivable.</div>
          `}
        </div>

        <div class="footer">
          <div style="font-size: ${fontSize.base}px; color: ${secondaryColor}; margin-bottom: 15px;">
            This receipt serves as proof of payment history for the referenced invoice.
          </div>
          ${settings.receiptFooter ? `<div class="footer-text">${settings.receiptFooter}</div>` : ''}
          ${settings.receiptTermsAndConditions ? `
          <div class="terms">
            <div class="terms-title">Terms & Conditions</div>
            ${settings.receiptTermsAndConditions}
          </div>
          ` : ''}
          <div class="thank-you">Thank You for Your Business!</div>
        </div>
      </div>
    </body>
    </html>
  `
}

// Generate Thermal Payment History Receipt HTML (80mm format)
function generateThermalPaymentHistoryReceiptHTML(data: PaymentHistoryData): string {
  const { receivable, payments, sale, customer, businessSettings: settings } = data
  const showTax = settings.showTaxOnReceipt !== false

  // Status indicator
  const statusIndicator =
    receivable.status === 'paid'
      ? '[PAID]'
      : receivable.status === 'partial'
        ? '[PARTIAL]'
        : receivable.status === 'overdue'
          ? '[OVERDUE]'
          : '[PENDING]'

  // Build payment history rows with running balance
  let runningBalance = 0
  const paymentsHTML = payments
    .map((payment) => {
      runningBalance += payment.amount
      const remaining = Math.max(0, receivable.totalAmount - runningBalance)
      return `
      <div class="payment-entry">
        <div class="payment-date">${formatDateTime(new Date(payment.paymentDate))}</div>
        <div class="payment-details">
          <span>${getPaymentMethodLabel(payment.paymentMethod)}</span>
          <span class="payment-amount">${formatCurrency(payment.amount, settings)}</span>
        </div>
        <div class="payment-balance">
          <span>Paid: ${formatCurrency(runningBalance, settings)}</span>
          <span>Due: ${formatCurrency(remaining, settings)}</span>
        </div>
        ${payment.referenceNumber ? `<div class="payment-ref">Ref: ${payment.referenceNumber}</div>` : ''}
      </div>
      <div class="separator"></div>
    `
    })
    .join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
          color: #000;
          width: 302px;
          padding: 10px;
          background: white;
        }
        .header {
          text-align: center;
          border-bottom: 1px dashed #000;
          padding-bottom: 10px;
          margin-bottom: 10px;
        }
        .business-name {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .business-info {
          font-size: 10px;
          color: #333;
        }
        .receipt-title {
          font-size: 12px;
          font-weight: bold;
          margin-top: 8px;
          text-decoration: underline;
        }
        .invoice-section {
          margin: 10px 0;
          border-bottom: 1px dashed #000;
          padding-bottom: 10px;
        }
        .invoice-row {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
        }
        .invoice-row strong {
          font-size: 12px;
        }
        .status-row {
          text-align: center;
          font-size: 12px;
          font-weight: bold;
          padding: 5px;
          background: #f0f0f0;
          margin: 10px 0;
          border-radius: 4px;
        }
        .balance-section {
          background: #f5f5f5;
          padding: 8px;
          border-radius: 4px;
          margin: 10px 0;
        }
        .balance-row {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          padding: 3px 0;
        }
        .balance-row.total {
          font-weight: bold;
          border-top: 1px solid #000;
          padding-top: 5px;
        }
        .payment-history-section {
          background: #fff8e1;
          padding: 8px;
          border-radius: 4px;
          margin: 10px 0;
        }
        .payment-history-title {
          font-size: 11px;
          font-weight: bold;
          margin-bottom: 8px;
          text-align: center;
          text-decoration: underline;
        }
        .payment-entry {
          margin-bottom: 8px;
        }
        .payment-date {
          font-size: 10px;
          color: #666;
        }
        .payment-details {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
        }
        .payment-amount {
          font-weight: bold;
        }
        .payment-balance {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #666;
        }
        .payment-ref {
          font-size: 9px;
          color: #666;
          font-style: italic;
        }
        .customer-section {
          margin: 10px 0;
          padding: 8px;
          background: #f5f5f5;
          border-radius: 4px;
        }
        .customer-name {
          font-weight: bold;
          font-size: 12px;
        }
        .totals-section {
          margin: 10px 0;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          padding: 3px 0;
        }
        .total-row.grand-total {
          font-size: 14px;
          font-weight: bold;
          border-top: 2px solid #000;
          border-bottom: 2px solid #000;
          padding: 8px 0;
          margin-top: 5px;
        }
        .footer {
          margin-top: 10px;
          text-align: center;
          border-top: 1px dashed #000;
          padding-top: 10px;
        }
        .footer-text {
          font-size: 10px;
          margin-bottom: 5px;
        }
        .thank-you {
          font-size: 12px;
          font-weight: bold;
          margin-top: 10px;
        }
        .separator {
          border-bottom: 1px dashed #ccc;
          margin: 8px 0;
        }
        .empty-payments {
          text-align: center;
          padding: 10px;
          font-style: italic;
          font-size: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="business-name">${settings.businessName || 'Business'}</div>
        <div class="business-info">${settings.businessAddress || ''} ${settings.businessCity || ''}</div>
        ${settings.businessPhone ? `<div class="business-info">Tel: ${settings.businessPhone}</div>` : ''}
        <div class="receipt-title">PAYMENT HISTORY</div>
      </div>

      <div class="invoice-section">
        <div class="invoice-row">
          <span>Invoice:</span>
          <strong>${receivable.invoiceNumber}</strong>
        </div>
        <div class="invoice-row">
          <span>Date:</span>
          <span>${formatDateTime(new Date(sale.saleDate))}</span>
        </div>
        <div class="invoice-row">
          <span>Receipt:</span>
          <span>${formatDateTime(new Date())}</span>
        </div>
      </div>

      <div class="customer-section">
        <div class="customer-name">${customer?.name || 'Walk-in Customer'}</div>
        ${customer?.phone ? `<div>Tel: ${customer.phone}</div>` : ''}
      </div>

      <div class="status-row">
        ${statusIndicator} - Status: ${receivable.status.toUpperCase()}
      </div>

      <div class="balance-section">
        <div class="balance-row">
          <span>Total Amount:</span>
          <span>${formatCurrency(receivable.totalAmount, settings)}</span>
        </div>
        <div class="balance-row">
          <span>Total Paid:</span>
          <span>${formatCurrency(receivable.paidAmount, settings)}</span>
        </div>
        <div class="balance-row total">
          <span>Remaining:</span>
          <span style="color: ${receivable.remainingAmount > 0 ? '#dc2626' : '#10b981'};">${formatCurrency(receivable.remainingAmount, settings)}</span>
        </div>
      </div>

      <div class="payment-history-section">
        <div class="payment-history-title">PAYMENT HISTORY</div>
        ${payments.length > 0 ? paymentsHTML : '<div class="empty-payments">No payments recorded</div>'}
      </div>

      <div class="totals-section">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>${formatCurrency(sale.subtotal, settings)}</span>
        </div>
        ${showTax ? `
        <div class="total-row">
          <span>Tax:</span>
          <span>${formatCurrency(sale.taxAmount, settings)}</span>
        </div>
        ` : ''}
        ${sale.discountAmount > 0 ? `
        <div class="total-row">
          <span>Discount:</span>
          <span>-${formatCurrency(sale.discountAmount, settings)}</span>
        </div>
        ` : ''}
        <div class="total-row grand-total">
          <span>TOTAL:</span>
          <span>${formatCurrency(sale.totalAmount, settings)}</span>
        </div>
      </div>

      <div class="footer">
        ${settings.receiptFooter ? `<div class="footer-text">${settings.receiptFooter}</div>` : ''}
        <div class="footer-text">Payment history receipt</div>
        <div class="thank-you">Thank You!</div>
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
          pageSize: { width: 80 * 1000, height: 297 * 1000 } as Electron.Size,
          margins: { top: 0.1, bottom: 0.1, left: 0.1, right: 0.1 },
        }
      : {
          pageSize: 'A4' as const,
          margins: { top: 0.4, bottom: 0.4, left: 0.4, right: 0.4 },
        }

  // Create hidden window for PDF generation
  const pdfWindow = new BrowserWindow({
    show: false,
    width: format === 'thermal' ? 400 : 900,
    height: 1200,
    webPreferences: {
      nodeIntegration: false,
    },
  })

  try {
    // Load HTML content
    await pdfWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`)

    // Wait for content to render
    await new Promise((resolve) => setTimeout(resolve, 500))

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
          pageSize: { width: 80 * 1000, height: 297 * 1000 } as Electron.Size, // 80mm width, variable height
          margins: { top: 0.1, bottom: 0.1, left: 0.1, right: 0.1 },
        }
      : {
          pageSize: 'A4' as const,
          margins: { top: 0.4, bottom: 0.4, left: 0.4, right: 0.4 },
        }

  // Create hidden window for PDF generation
  const pdfWindow = new BrowserWindow({
    show: false,
    width: format === 'thermal' ? 400 : 800,
    height: 1200,
    webPreferences: {
      nodeIntegration: false,
    },
  })

  try {
    // Load HTML content
    await pdfWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`)

    // Wait for content to render
    await new Promise((resolve) => setTimeout(resolve, 500))

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
