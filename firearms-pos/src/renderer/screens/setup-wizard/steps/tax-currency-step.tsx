import { useEffect, useRef } from 'react'
import { useSetup } from '@/contexts/setup-context'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DollarSign } from 'lucide-react'

const COMMON_CURRENCIES = [
  { code: 'PKR', symbol: 'Rs.', name: 'Pakistani Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '\u20ac', name: 'Euro' },
  { code: 'GBP', symbol: '\u00a3', name: 'British Pound' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal' },
  { code: 'INR', symbol: '\u20b9', name: 'Indian Rupee' },
]

const CURRENCY_POSITIONS = [
  { value: 'prefix', label: 'Before amount (e.g., Rs.100)' },
  { value: 'suffix', label: 'After amount (e.g., 100 Rs.)' },
]

export function TaxCurrencyStep() {
  const { taxCurrencyInfo, updateTaxCurrencyInfo } = useSetup()
  const taxNameRef = useRef<HTMLInputElement>(null)

  // Auto-focus on tax name field when step loads
  useEffect(() => {
    const timer = setTimeout(() => {
      taxNameRef.current?.focus()
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleCurrencyChange = (code: string) => {
    const currency = COMMON_CURRENCIES.find((c) => c.code === code)
    if (currency) {
      updateTaxCurrencyInfo({
        currencyCode: currency.code,
        currencySymbol: currency.symbol,
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Tax & Currency Settings</h2>
          <p className="text-sm text-muted-foreground">Configure financial settings</p>
        </div>
      </div>

      {/* Currency Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Currency
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Currency Code */}
          <div className="grid gap-2">
            <Label htmlFor="currencyCode">Currency</Label>
            <Select value={taxCurrencyInfo.currencyCode} onValueChange={handleCurrencyChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_CURRENCIES.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Currency Symbol */}
          <div className="grid gap-2">
            <Label htmlFor="currencySymbol">Symbol</Label>
            <Input
              id="currencySymbol"
              placeholder="Rs."
              value={taxCurrencyInfo.currencySymbol}
              onChange={(e) => updateTaxCurrencyInfo({ currencySymbol: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Symbol Position */}
          <div className="grid gap-2">
            <Label htmlFor="currencyPosition">Symbol Position</Label>
            <Select
              value={taxCurrencyInfo.currencyPosition}
              onValueChange={(value) => updateTaxCurrencyInfo({ currencyPosition: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_POSITIONS.map((pos) => (
                  <SelectItem key={pos.value} value={pos.value}>
                    {pos.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Decimal Places */}
          <div className="grid gap-2">
            <Label htmlFor="decimalPlaces">Decimal Places</Label>
            <Select
              value={String(taxCurrencyInfo.decimalPlaces)}
              onValueChange={(value) =>
                updateTaxCurrencyInfo({ decimalPlaces: parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0 (e.g., Rs.100)</SelectItem>
                <SelectItem value="2">2 (e.g., Rs.100.00)</SelectItem>
                <SelectItem value="3">3 (e.g., Rs.100.000)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Preview */}
        <div className="p-3 rounded-lg bg-muted/50 text-center">
          <span className="text-sm text-muted-foreground">Preview: </span>
          <span className="font-mono text-lg">
            {taxCurrencyInfo.currencyPosition === 'prefix'
              ? `${taxCurrencyInfo.currencySymbol}1,234${taxCurrencyInfo.decimalPlaces > 0 ? '.' + '0'.repeat(taxCurrencyInfo.decimalPlaces) : ''}`
              : `1,234${taxCurrencyInfo.decimalPlaces > 0 ? '.' + '0'.repeat(taxCurrencyInfo.decimalPlaces) : ''} ${taxCurrencyInfo.currencySymbol}`}
          </span>
        </div>
      </div>

      {/* Tax Section */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Tax Configuration
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Tax Name */}
          <div className="grid gap-2">
            <Label htmlFor="taxName">Tax Name</Label>
            <Input
              ref={taxNameRef}
              id="taxName"
              placeholder="GST"
              value={taxCurrencyInfo.taxName}
              onChange={(e) => updateTaxCurrencyInfo({ taxName: e.target.value })}
              autoComplete="off"
            />
          </div>

          {/* Tax Rate */}
          <div className="grid gap-2">
            <Label htmlFor="taxRate">Tax Rate (%)</Label>
            <Input
              id="taxRate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              placeholder="0"
              value={taxCurrencyInfo.taxRate}
              onChange={(e) =>
                updateTaxCurrencyInfo({ taxRate: parseFloat(e.target.value) || 0 })
              }
            />
          </div>

          {/* Tax ID */}
          <div className="grid gap-2">
            <Label htmlFor="taxId">Tax ID / EIN</Label>
            <Input
              id="taxId"
              placeholder="Tax identification number"
              value={taxCurrencyInfo.taxId}
              onChange={(e) => updateTaxCurrencyInfo({ taxId: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
