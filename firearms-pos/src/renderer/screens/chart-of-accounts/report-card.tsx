import React from 'react'

interface CashFlowSummary {
  summaryByType: Record<string, { count: number; totalAmount: number }>
  totalInflows: number
  totalOutflows: number
  netCashFlow: number
}

interface CoaReportCardProps {
  businessName: string
  branchName: string
  generatedAt: string
  formatCurrency: (n: number) => string
  balanceSheet: {
    assets: { accounts: Array<{ id: number; accountName: string; currentBalance: number }>; total: number }
    liabilities: { accounts: Array<{ id: number; accountName: string; currentBalance: number }>; total: number }
    equity: { accounts: Array<{ id: number; accountName: string; currentBalance: number }>; total: number }
    netIncome: number
    isBalanced: boolean
  } | null
  cashFlowData?: CashFlowSummary | null
  cashFlowPeriod?: string
}

/**
 * A self-contained, shareable Chart of Accounts report card rendered off-screen.
 * Captured via html-to-image and copied to clipboard.
 * Uses inline styles only — no Tailwind — so the capture is pixel-perfect.
 */
export const CoaReportCard = React.forwardRef<HTMLDivElement, CoaReportCardProps>(
  ({ businessName, branchName, generatedAt, formatCurrency, balanceSheet, cashFlowData, cashFlowPeriod }, ref) => {
    const netIncome = balanceSheet?.netIncome ?? 0
    const netIncomeColor = netIncome >= 0 ? '#16a34a' : '#dc2626'
    const totalEquity = (balanceSheet?.equity.total ?? 0) + netIncome

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
      badge: {
        fontSize: 10,
        fontWeight: 600,
        color: '#38bdf8',
        background: 'rgba(56,189,248,0.12)',
        padding: '3px 10px',
        borderRadius: 20,
        letterSpacing: '0.04em',
        textTransform: 'uppercase' as const,
      },
      // Summary hero
      heroRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        gap: 1,
        background: 'rgba(148,163,184,0.08)',
      },
      heroCell: {
        padding: '14px 12px',
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
        fontSize: 16,
        fontWeight: 700,
        margin: 0,
        letterSpacing: '-0.02em',
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
      row: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '3px 0',
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
      totalRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 0 2px',
        borderTop: '1px solid rgba(148,163,184,0.15)',
        marginTop: 4,
      },
      totalLabel: {
        fontSize: 12,
        fontWeight: 700,
        color: '#f8fafc',
        margin: 0,
      },
      totalValue: {
        fontSize: 13,
        fontWeight: 700,
        margin: 0,
        fontVariantNumeric: 'tabular-nums',
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
        {/* Header */}
        <div style={s.header}>
          <p style={s.bizName}>{businessName || 'POS System'}</p>
          <div style={s.metaRow}>
            <p style={s.metaText}>{branchName}</p>
            <span style={s.badge}>Chart of Accounts</span>
          </div>
        </div>

        {/* Hero Summary */}
        <div style={s.heroRow}>
          <div style={s.heroCell}>
            <p style={s.heroLabel}>Assets</p>
            <p style={{ ...s.heroValue, color: '#38bdf8' }}>
              {formatCurrency(balanceSheet?.assets.total ?? 0)}
            </p>
          </div>
          <div style={s.heroCell}>
            <p style={s.heroLabel}>Liabilities</p>
            <p style={{ ...s.heroValue, color: '#f87171' }}>
              {formatCurrency(balanceSheet?.liabilities.total ?? 0)}
            </p>
          </div>
          <div style={s.heroCell}>
            <p style={s.heroLabel}>Equity</p>
            <p style={{ ...s.heroValue, color: '#a78bfa' }}>
              {formatCurrency(totalEquity)}
            </p>
          </div>
          <div style={s.heroCell}>
            <p style={s.heroLabel}>Net Income</p>
            <p style={{ ...s.heroValue, color: netIncomeColor }}>
              {formatCurrency(netIncome)}
            </p>
          </div>
        </div>

        {/* Assets Breakdown */}
        <div style={s.section}>
          <p style={s.sectionTitle}>Assets</p>
          {balanceSheet?.assets.accounts.map((a) => (
            <div key={a.id} style={s.row}>
              <p style={s.rowLabel}>{a.accountName}</p>
              <p style={s.rowValue}>{formatCurrency(a.currentBalance)}</p>
            </div>
          ))}
          <div style={s.totalRow}>
            <p style={s.totalLabel}>Total Assets</p>
            <p style={{ ...s.totalValue, color: '#38bdf8' }}>
              {formatCurrency(balanceSheet?.assets.total ?? 0)}
            </p>
          </div>
        </div>

        {/* Liabilities Breakdown */}
        <div style={s.section}>
          <p style={s.sectionTitle}>Liabilities</p>
          {balanceSheet?.liabilities.accounts.map((a) => (
            <div key={a.id} style={s.row}>
              <p style={s.rowLabel}>{a.accountName}</p>
              <p style={s.rowValue}>{formatCurrency(a.currentBalance)}</p>
            </div>
          ))}
          <div style={s.totalRow}>
            <p style={s.totalLabel}>Total Liabilities</p>
            <p style={{ ...s.totalValue, color: '#f87171' }}>
              {formatCurrency(balanceSheet?.liabilities.total ?? 0)}
            </p>
          </div>
        </div>

        {/* Equity Breakdown */}
        <div style={{ ...s.section, borderBottom: 'none' }}>
          <p style={s.sectionTitle}>Equity</p>
          {balanceSheet?.equity.accounts.map((a) => (
            <div key={a.id} style={s.row}>
              <p style={s.rowLabel}>{a.accountName}</p>
              <p style={s.rowValue}>{formatCurrency(a.currentBalance)}</p>
            </div>
          ))}
          <div style={s.row}>
            <p style={{ ...s.rowLabel, fontStyle: 'italic' }}>Current Net Income</p>
            <p style={{ ...s.rowValue, color: netIncomeColor }}>{formatCurrency(netIncome)}</p>
          </div>
          <div style={s.totalRow}>
            <p style={s.totalLabel}>Total Equity</p>
            <p style={{ ...s.totalValue, color: '#a78bfa' }}>
              {formatCurrency(totalEquity)}
            </p>
          </div>
        </div>

        {/* Cash Flow Summary */}
        {cashFlowData && (
          <div style={s.section}>
            <p style={s.sectionTitle}>Cash Flow Summary {cashFlowPeriod ? `(${cashFlowPeriod})` : ''}</p>
            {Object.entries(cashFlowData.summaryByType).map(([type, data]) => {
              const isInflow = ['sale', 'ar_collection', 'deposit', 'adjustment_add'].includes(type)
              return (
                <div key={type} style={s.row}>
                  <p style={s.rowLabel}>{type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} ({data.count})</p>
                  <p style={{ ...s.rowValue, color: isInflow ? '#34d399' : '#f87171' }}>
                    {isInflow ? '+' : '-'}{formatCurrency(Math.abs(data.totalAmount))}
                  </p>
                </div>
              )
            })}
            <div style={{ borderTop: '1px solid rgba(148,163,184,0.15)', margin: '6px 0' }} />
            <div style={s.row}>
              <p style={{ ...s.rowLabel, fontWeight: 600 }}>Total Inflows</p>
              <p style={{ ...s.rowValue, color: '#34d399' }}>{formatCurrency(cashFlowData.totalInflows)}</p>
            </div>
            <div style={s.row}>
              <p style={{ ...s.rowLabel, fontWeight: 600 }}>Total Outflows</p>
              <p style={{ ...s.rowValue, color: '#f87171' }}>{formatCurrency(cashFlowData.totalOutflows)}</p>
            </div>
            <div style={s.totalRow}>
              <p style={s.totalLabel}>Net Cash Flow</p>
              <p style={{ ...s.totalValue, color: cashFlowData.netCashFlow >= 0 ? '#34d399' : '#f87171' }}>
                {formatCurrency(cashFlowData.netCashFlow)}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
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

CoaReportCard.displayName = 'CoaReportCard'
