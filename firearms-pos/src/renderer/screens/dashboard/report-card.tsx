import React from 'react'

interface FundFlowData {
  openingCash: number
  cashFromSales: number
  arCollections: number
  deposits: number
  totalCashIn: number
  apPayments: number
  expensesPaid: number
  refunds: number
  withdrawals: number
  totalCashOut: number
  closingCash: number
}

interface ReportCardProps {
  businessName: string
  branchName: string
  periodLabel: string
  generatedAt: string
  formatCurrency: (n: number) => string
  formatNumber: (n: number) => string
  stats: {
    grossRevenue: number
    totalRevenue: number
    totalDiscount: number
    returnDeductions: number
    totalProfit: number
    totalCost: number
    totalPurchases: number
    totalExpense: number
    totalTaxCollected: number
    totalCommission: number
    totalSalesCount: number
    totalProductsSold: number
    totalProducts: number
    totalReturns: number
    receivablesPending: number
    receivablesReceived: number
    payablesPending: number
    payablesPaid: number
    cashInHand: number
    lowStockCount: number
  }
  fundFlow?: FundFlowData | null
}

/**
 * A self-contained, shareable report card rendered off-screen.
 * Captured via html-to-image and copied to clipboard.
 * Uses inline styles only — no Tailwind — so the capture is pixel-perfect.
 */
export const ReportCard = React.forwardRef<HTMLDivElement, ReportCardProps>(
  ({ businessName, branchName, periodLabel, generatedAt, formatCurrency, formatNumber, stats, fundFlow }, ref) => {
    const profit = stats.totalProfit
    const profitColor = profit >= 0 ? '#16a34a' : '#dc2626'

    const s: Record<string, React.CSSProperties> = {
      root: {
        width: 520,
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
        color: '#e2e8f0',
        borderRadius: 16,
        overflow: 'hidden',
        position: 'absolute',
        left: -9999,
        top: -9999,
      },
      // Header
      header: {
        padding: '20px 24px 16px',
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        borderBottom: '1px solid rgba(148,163,184,0.15)',
      },
      bizName: {
        fontSize: 18,
        fontWeight: 700,
        color: '#f8fafc',
        margin: 0,
        letterSpacing: '0.02em',
      },
      metaRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 6,
      },
      metaText: {
        fontSize: 11,
        fontWeight: 700,
        color: '#f8fafc',
        margin: 0,
      },
      periodBadge: {
        fontSize: 10,
        fontWeight: 600,
        color: '#38bdf8',
        background: 'rgba(56,189,248,0.12)',
        padding: '3px 10px',
        borderRadius: 20,
        letterSpacing: '0.04em',
        textTransform: 'uppercase' as const,
      },
      // Hero KPIs
      heroRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 1,
        background: 'rgba(148,163,184,0.08)',
      },
      heroCell: {
        padding: '16px 20px',
        background: '#0f172a',
        textAlign: 'center' as const,
      },
      heroLabel: {
        fontSize: 9,
        fontWeight: 600,
        color: '#64748b',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.08em',
        margin: '0 0 6px',
      },
      heroValue: {
        fontSize: 20,
        fontWeight: 700,
        margin: 0,
        letterSpacing: '-0.02em',
      },
      heroSub: {
        fontSize: 9,
        color: '#64748b',
        margin: '4px 0 0',
      },
      // Section
      section: {
        padding: '14px 24px',
        borderBottom: '1px solid rgba(148,163,184,0.08)',
      },
      sectionTitle: {
        fontSize: 9,
        fontWeight: 700,
        color: '#475569',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.1em',
        margin: '0 0 10px',
      },
      grid2: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0 24px',
      },
      row: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '4px 0',
      },
      rowLabel: {
        fontSize: 11,
        color: '#94a3b8',
        margin: 0,
      },
      rowValue: {
        fontSize: 12,
        fontWeight: 600,
        color: '#e2e8f0',
        margin: 0,
        fontVariantNumeric: 'tabular-nums',
      },
      // Divider inside grid
      divider: {
        borderTop: '1px solid rgba(148,163,184,0.06)',
        margin: '2px 0',
        gridColumn: '1 / -1',
      },
      // Footer
      footer: {
        padding: '12px 24px 10px',
        borderTop: '1px solid rgba(148,163,184,0.08)',
      },
      footerMain: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      footerDate: {
        fontSize: 10,
        fontWeight: 700,
        color: '#f8fafc',
        margin: 0,
      },
      footerBrand: {
        fontSize: 10,
        fontWeight: 700,
        color: '#f8fafc',
        margin: 0,
      },
      devInfo: {
        marginTop: 8,
        paddingTop: 8,
        borderTop: '1px solid rgba(148,163,184,0.06)',
        textAlign: 'center' as const,
      },
      devText: {
        fontSize: 9,
        color: '#475569',
        margin: 0,
        lineHeight: 1.5,
      },
    }

    return (
      <div ref={ref} style={s.root}>
        {/* ── Header ─────────────────────────── */}
        <div style={s.header}>
          <p style={s.bizName}>{businessName || 'POS System'}</p>
          <div style={s.metaRow}>
            <p style={s.metaText}>{branchName}</p>
            <span style={s.periodBadge}>{periodLabel}</span>
          </div>
        </div>

        {/* ── Hero KPIs ──────────────────────── */}
        <div style={s.heroRow}>
          <div style={s.heroCell}>
            <p style={s.heroLabel}>Revenue</p>
            <p style={{ ...s.heroValue, color: '#38bdf8' }}>
              {formatCurrency(stats.grossRevenue)}
            </p>
            {(stats.returnDeductions > 0 || stats.totalDiscount > 0) && (
              <p style={s.heroSub}>
                {stats.totalDiscount > 0 && `Disc: -${formatCurrency(stats.totalDiscount)}`}
                {stats.totalDiscount > 0 && stats.returnDeductions > 0 && ' · '}
                {stats.returnDeductions > 0 && `Ret: -${formatCurrency(stats.returnDeductions)}`}
                {' · '}Net: {formatCurrency(stats.totalRevenue)}
              </p>
            )}
          </div>
          <div style={s.heroCell}>
            <p style={s.heroLabel}>Profit</p>
            <p style={{ ...s.heroValue, color: profitColor }}>
              {formatCurrency(profit)}
            </p>
            <p style={s.heroSub}>After costs & deductions</p>
          </div>
          <div style={s.heroCell}>
            <p style={s.heroLabel}>Cash In Hand</p>
            <p style={{ ...s.heroValue, color: '#34d399' }}>
              {formatCurrency(stats.cashInHand)}
            </p>
            <p style={s.heroSub}>Register balance</p>
          </div>
        </div>

        {/* ── Sales & Cost ───────────────────── */}
        <div style={s.section}>
          <p style={s.sectionTitle}>Sales & Cost</p>
          <div style={s.grid2}>
            <div style={s.row}>
              <p style={s.rowLabel}>Sales</p>
              <p style={s.rowValue}>{formatNumber(stats.totalSalesCount)} txns</p>
            </div>
            <div style={s.row}>
              <p style={s.rowLabel}>Units Sold</p>
              <p style={s.rowValue}>{formatNumber(stats.totalProductsSold)}</p>
            </div>
            <div style={s.row}>
              <p style={s.rowLabel}>Total Cost</p>
              <p style={s.rowValue}>{formatCurrency(stats.totalCost)}</p>
            </div>
            <div style={s.row}>
              <p style={s.rowLabel}>Returns</p>
              <p style={{ ...s.rowValue, color: stats.totalReturns > 0 ? '#fb923c' : '#e2e8f0' }}>
                {formatCurrency(stats.totalReturns)}
              </p>
            </div>
            <div style={s.row}>
              <p style={s.rowLabel}>Purchases</p>
              <p style={s.rowValue}>{formatCurrency(stats.totalPurchases)}</p>
            </div>
            <div style={s.row}>
              <p style={s.rowLabel}>Expenses</p>
              <p style={s.rowValue}>{formatCurrency(stats.totalExpense)}</p>
            </div>
          </div>
        </div>

        {/* ── Tax, Commission & AR/AP ────────── */}
        <div style={s.section}>
          <p style={s.sectionTitle}>Deductions & Receivables</p>
          <div style={s.grid2}>
            <div style={s.row}>
              <p style={s.rowLabel}>Discounts</p>
              <p style={{ ...s.rowValue, color: stats.totalDiscount > 0 ? '#f472b6' : '#e2e8f0' }}>
                {formatCurrency(stats.totalDiscount)}
              </p>
            </div>
            <div style={s.row}>
              <p style={s.rowLabel}>Tax Collected</p>
              <p style={s.rowValue}>{formatCurrency(stats.totalTaxCollected)}</p>
            </div>
            <div style={s.row}>
              <p style={s.rowLabel}>Commission</p>
              <p style={s.rowValue}>{formatCurrency(stats.totalCommission)}</p>
            </div>
            <div style={{ ...s.divider }} />
            <div style={s.row}>
              <p style={s.rowLabel}>AR Pending</p>
              <p style={{ ...s.rowValue, color: stats.receivablesPending > 0 ? '#facc15' : '#e2e8f0' }}>
                {formatCurrency(stats.receivablesPending)}
              </p>
            </div>
            <div style={s.row}>
              <p style={s.rowLabel}>AR Received</p>
              <p style={{ ...s.rowValue, color: '#34d399' }}>
                {formatCurrency(stats.receivablesReceived)}
              </p>
            </div>
            <div style={s.row}>
              <p style={s.rowLabel}>AP Pending</p>
              <p style={{ ...s.rowValue, color: stats.payablesPending > 0 ? '#f87171' : '#e2e8f0' }}>
                {formatCurrency(stats.payablesPending)}
              </p>
            </div>
            <div style={s.row}>
              <p style={s.rowLabel}>AP Paid</p>
              <p style={{ ...s.rowValue, color: '#34d399' }}>
                {formatCurrency(stats.payablesPaid)}
              </p>
            </div>
          </div>
        </div>

        {/* ── Fund Flow ──────────────────────── */}
        {fundFlow && (
          <div style={s.section}>
            <p style={s.sectionTitle}>Fund Flow</p>
            <div style={s.row}>
              <p style={s.rowLabel}>Opening Cash</p>
              <p style={s.rowValue}>{formatCurrency(fundFlow.openingCash)}</p>
            </div>
            <div style={s.row}>
              <p style={s.rowLabel}>+ Sales (Cash)</p>
              <p style={{ ...s.rowValue, color: '#34d399' }}>{formatCurrency(fundFlow.cashFromSales)}</p>
            </div>
            {fundFlow.arCollections > 0 && (
              <div style={s.row}>
                <p style={s.rowLabel}>+ AR Collections</p>
                <p style={{ ...s.rowValue, color: '#34d399' }}>{formatCurrency(fundFlow.arCollections)}</p>
              </div>
            )}
            {fundFlow.deposits > 0 && (
              <div style={s.row}>
                <p style={s.rowLabel}>+ Deposits</p>
                <p style={{ ...s.rowValue, color: '#34d399' }}>{formatCurrency(fundFlow.deposits)}</p>
              </div>
            )}
            <div style={{ borderTop: '1px solid rgba(148,163,184,0.12)', margin: '4px 0' }} />
            <div style={s.row}>
              <p style={{ ...s.rowLabel, fontWeight: 600, color: '#38bdf8' }}>Total Available</p>
              <p style={{ ...s.rowValue, color: '#38bdf8' }}>{formatCurrency(fundFlow.openingCash + fundFlow.totalCashIn)}</p>
            </div>
            <div style={{ borderTop: '1px solid rgba(148,163,184,0.12)', margin: '4px 0' }} />
            {fundFlow.apPayments > 0 && (
              <div style={s.row}>
                <p style={s.rowLabel}>- AP Payments</p>
                <p style={{ ...s.rowValue, color: '#f87171' }}>({formatCurrency(fundFlow.apPayments)})</p>
              </div>
            )}
            {fundFlow.expensesPaid > 0 && (
              <div style={s.row}>
                <p style={s.rowLabel}>- Expenses</p>
                <p style={{ ...s.rowValue, color: '#f87171' }}>({formatCurrency(fundFlow.expensesPaid)})</p>
              </div>
            )}
            {fundFlow.refunds > 0 && (
              <div style={s.row}>
                <p style={s.rowLabel}>- Refunds</p>
                <p style={{ ...s.rowValue, color: '#fb923c' }}>({formatCurrency(fundFlow.refunds)})</p>
              </div>
            )}
            {fundFlow.withdrawals > 0 && (
              <div style={s.row}>
                <p style={s.rowLabel}>- Withdrawals</p>
                <p style={{ ...s.rowValue, color: '#f87171' }}>({formatCurrency(fundFlow.withdrawals)})</p>
              </div>
            )}
            <div style={{ borderTop: '1px solid rgba(148,163,184,0.12)', margin: '4px 0' }} />
            <div style={s.row}>
              <p style={{ ...s.rowLabel, fontWeight: 700, color: '#34d399' }}>Closing Cash</p>
              <p style={{ ...s.rowValue, color: '#34d399', fontSize: 14 }}>{formatCurrency(fundFlow.closingCash)}</p>
            </div>
          </div>
        )}

        {/* ── Inventory ──────────────────────── */}
        <div style={{ ...s.section, borderBottom: 'none' }}>
          <p style={s.sectionTitle}>Inventory</p>
          <div style={s.grid2}>
            <div style={s.row}>
              <p style={s.rowLabel}>Active Products</p>
              <p style={s.rowValue}>{formatNumber(stats.totalProducts)}</p>
            </div>
            <div style={s.row}>
              <p style={s.rowLabel}>Low Stock Alerts</p>
              <p style={{ ...s.rowValue, color: stats.lowStockCount > 0 ? '#f87171' : '#34d399' }}>
                {formatNumber(stats.lowStockCount)}
              </p>
            </div>
          </div>
        </div>

        {/* ── Footer ─────────────────────────── */}
        <div style={s.footer}>
          <div style={s.footerMain}>
            <p style={s.footerDate}>{generatedAt}</p>
            <p style={s.footerBrand}>{businessName || 'POS System'}</p>
          </div>
          <div style={s.devInfo}>
            <p style={s.devText}>
              Developed by Syed Safdar Ali Shah &middot; programmersafdar@live.com &middot; 0316-0917600
            </p>
          </div>
        </div>
      </div>
    )
  }
)

ReportCard.displayName = 'ReportCard'
