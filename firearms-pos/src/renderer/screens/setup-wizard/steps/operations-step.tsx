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
import { Clock, CreditCard, Package } from 'lucide-react'

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const PAYMENT_METHODS = ['Cash', 'Card', 'Bank Transfer', 'COD', 'Cheque', 'Credit']

const STOCK_VALUATION_METHODS = [
  { value: 'FIFO', label: 'FIFO (First In, First Out)' },
  { value: 'LIFO', label: 'LIFO (Last In, First Out)' },
  { value: 'Average', label: 'Weighted Average' },
]

export function OperationsStep() {
  const { operationsInfo, updateOperationsInfo } = useSetup()

  const handlePaymentMethodToggle = (method: string) => {
    const current = operationsInfo.allowedPaymentMethods.split(',').filter(Boolean)
    const updated = current.includes(method)
      ? current.filter((m) => m !== method)
      : [...current, method]
    updateOperationsInfo({ allowedPaymentMethods: updated.join(',') })
  }

  const isPaymentMethodEnabled = (method: string) => {
    return operationsInfo.allowedPaymentMethods.split(',').includes(method)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Clock className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Operational Settings</h2>
          <p className="text-sm text-muted-foreground">
            Configure working hours, payments & inventory
          </p>
        </div>
      </div>

      {/* Working Hours Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Working Hours
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Week Starts */}
          <div className="grid gap-2">
            <Label htmlFor="workingDaysStart">Week Starts</Label>
            <Select
              value={operationsInfo.workingDaysStart}
              onValueChange={(value) => updateOperationsInfo({ workingDaysStart: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map((day) => (
                  <SelectItem key={day} value={day}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Week Ends */}
          <div className="grid gap-2">
            <Label htmlFor="workingDaysEnd">Week Ends</Label>
            <Select
              value={operationsInfo.workingDaysEnd}
              onValueChange={(value) => updateOperationsInfo({ workingDaysEnd: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map((day) => (
                  <SelectItem key={day} value={day}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Opening Time */}
          <div className="grid gap-2">
            <Label htmlFor="openingTime">Opening Time</Label>
            <Input
              id="openingTime"
              type="time"
              value={operationsInfo.openingTime}
              onChange={(e) => updateOperationsInfo({ openingTime: e.target.value })}
            />
          </div>

          {/* Closing Time */}
          <div className="grid gap-2">
            <Label htmlFor="closingTime">Closing Time</Label>
            <Input
              id="closingTime"
              type="time"
              value={operationsInfo.closingTime}
              onChange={(e) => updateOperationsInfo({ closingTime: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Payment Methods Section */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Payment Methods
          </h3>
        </div>

        <div className="grid gap-4">
          {/* Default Payment Method */}
          <div className="grid gap-2">
            <Label htmlFor="defaultPaymentMethod">Default Payment Method</Label>
            <Select
              value={operationsInfo.defaultPaymentMethod}
              onValueChange={(value) => updateOperationsInfo({ defaultPaymentMethod: value })}
            >
              <SelectTrigger className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Allowed Payment Methods */}
          <div className="grid gap-2">
            <Label>Allowed Payment Methods</Label>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => handlePaymentMethodToggle(method)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    isPaymentMethodEnabled(method)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Section */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Inventory Settings
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Low Stock Threshold */}
          <div className="grid gap-2">
            <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
            <Input
              id="lowStockThreshold"
              type="number"
              min="0"
              value={operationsInfo.lowStockThreshold}
              onChange={(e) =>
                updateOperationsInfo({ lowStockThreshold: parseInt(e.target.value) || 0 })
              }
            />
            <p className="text-xs text-muted-foreground">
              Alert when stock falls below this quantity
            </p>
          </div>

          {/* Stock Valuation Method */}
          <div className="grid gap-2">
            <Label htmlFor="stockValuationMethod">Stock Valuation Method</Label>
            <Select
              value={operationsInfo.stockValuationMethod}
              onValueChange={(value) => updateOperationsInfo({ stockValuationMethod: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STOCK_VALUATION_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Method for calculating inventory cost
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
