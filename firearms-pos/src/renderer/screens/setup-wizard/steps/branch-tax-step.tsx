import { useSetup } from '@/contexts/setup-context'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MapPin, RefreshCw, Copy } from 'lucide-react'

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

export function BranchTaxStep() {
  const {
    branchInfo,
    updateBranchInfo,
    taxCurrencyInfo,
    updateTaxCurrencyInfo,
    businessInfo,
    generateBranchCode,
  } = useSetup()

  const handleRegenerateCode = async () => {
    if (businessInfo.businessName) {
      const code = await generateBranchCode(businessInfo.businessName)
      if (code) {
        updateBranchInfo({ code })
      }
    }
  }

  const handleCopyFromBusiness = () => {
    updateBranchInfo({
      address: businessInfo.businessAddress,
      phone: businessInfo.businessPhone,
      email: businessInfo.businessEmail,
    })
  }

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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <MapPin className="h-4.5 w-4.5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight">Branch & Financial Setup</h2>
          <p className="text-xs text-muted-foreground">
            Configure your primary location and financial settings
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
        This will be your main branch. You can add more branches later from the settings.
      </div>

      {/* Branch Form */}
      <div className="grid gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Branch Name */}
          <div className="grid gap-2">
            <Label htmlFor="branchName">
              Branch Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="branchName"
              placeholder="Main Store"
              value={branchInfo.name}
              onChange={(e) => updateBranchInfo({ name: e.target.value })}
              autoComplete="off"
              required
            />
          </div>

          {/* Branch Code */}
          <div className="grid gap-2">
            <Label htmlFor="branchCode">
              Branch Code <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="branchCode"
                placeholder="MAIN01"
                value={branchInfo.code}
                onChange={(e) => updateBranchInfo({ code: e.target.value.toUpperCase() })}
                className="uppercase"
                required
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleRegenerateCode}
                title="Regenerate code"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Unique identifier for this branch (auto-generated)
            </p>
          </div>
        </div>

        {/* Copy from Business Button */}
        <div className="flex justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={handleCopyFromBusiness}>
            <Copy className="w-4 h-4 mr-1" />
            Copy from Business Info
          </Button>
        </div>

        {/* Address */}
        <div className="grid gap-2">
          <Label htmlFor="branchAddress">Branch Address</Label>
          <Textarea
            id="branchAddress"
            placeholder="Enter branch address"
            value={branchInfo.address}
            onChange={(e) => updateBranchInfo({ address: e.target.value })}
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Phone */}
          <div className="grid gap-2">
            <Label htmlFor="branchPhone">Phone</Label>
            <Input
              id="branchPhone"
              placeholder="Branch phone number"
              value={branchInfo.phone}
              onChange={(e) => updateBranchInfo({ phone: e.target.value })}
            />
          </div>

          {/* Email */}
          <div className="grid gap-2">
            <Label htmlFor="branchEmail">Email</Label>
            <Input
              id="branchEmail"
              type="email"
              placeholder="Branch email address"
              value={branchInfo.email}
              onChange={(e) => updateBranchInfo({ email: e.target.value })}
            />
          </div>
        </div>

        {/* License Number */}
        <div className="grid gap-2">
          <Label htmlFor="licenseNumber">Firearms License Number</Label>
          <Input
            id="licenseNumber"
            placeholder="FFL-XXXXXXXX"
            value={branchInfo.licenseNumber}
            onChange={(e) => updateBranchInfo({ licenseNumber: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Federal Firearms License (FFL) number for this location
          </p>
        </div>
      </div>

      {/* Tax & Currency Section */}
      <div className="space-y-4 pt-6 border-t">
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

        {/* Currency Preview */}
        <div className="p-3 rounded-lg bg-muted/50 text-center">
          <span className="text-sm text-muted-foreground">Preview: </span>
          <span className="font-mono text-lg">
            {taxCurrencyInfo.currencyPosition === 'prefix'
              ? `${taxCurrencyInfo.currencySymbol}1,234${taxCurrencyInfo.decimalPlaces > 0 ? '.' + '0'.repeat(taxCurrencyInfo.decimalPlaces) : ''}`
              : `1,234${taxCurrencyInfo.decimalPlaces > 0 ? '.' + '0'.repeat(taxCurrencyInfo.decimalPlaces) : ''} ${taxCurrencyInfo.currencySymbol}`}
          </span>
        </div>
      </div>

      {/* Tax Configuration */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Tax Configuration
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Tax Name */}
          <div className="grid gap-2">
            <Label htmlFor="taxName">Tax Name</Label>
            <Input
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
