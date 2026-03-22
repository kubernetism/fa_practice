'use client'

import { useState, useEffect } from 'react'
import {
  Settings,
  Building2,
  Receipt,
  Bell,
  Percent,
  Save,
  Globe,
  Clock,
  DollarSign,
  Printer,
  FileText,
  ShieldCheck,
  Key,
  ShoppingCart,
  Banknote,
  CreditCard,
  Smartphone,
  User,
  Truck,
  Landmark,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { getBusinessSettings, updateBusinessSettings, upsertSetting } from '@/actions/settings'
import { changePassword } from '@/actions/users'
import { toast } from 'sonner'
import { PageLoader } from '@/components/ui/page-loader'

type SettingsSection = 'business' | 'tax' | 'sales' | 'receipt' | 'notifications' | 'security'

const ALL_PAYMENT_METHODS = [
  { key: 'cash', label: 'Cash', icon: Banknote, description: 'Accept cash payments' },
  { key: 'card', label: 'Card', icon: CreditCard, description: 'Credit/debit card payments' },
  { key: 'credit', label: 'Credit', icon: User, description: 'Customer credit / receivable' },
  { key: 'mobile', label: 'Mobile', icon: Smartphone, description: 'Mobile wallet payments (JazzCash, Easypaisa)' },
  { key: 'cod', label: 'COD', icon: Truck, description: 'Cash on delivery' },
  { key: 'bank_transfer', label: 'Bank Transfer', icon: Landmark, description: 'Direct bank transfer' },
]

const sections: { id: SettingsSection; label: string; icon: typeof Settings }[] = [
  { id: 'business', label: 'Business Info', icon: Building2 },
  { id: 'tax', label: 'Tax & Currency', icon: Percent },
  { id: 'sales', label: 'Sales & Payments', icon: ShoppingCart },
  { id: 'receipt', label: 'Receipt', icon: Receipt },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: ShieldCheck },
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('business')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<any>(null)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    setLoading(true)
    try {
      const result = await getBusinessSettings()
      if (result.success && result.data) {
        setSettings(result.data)
      } else {
        setSettings({})
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
      setSettings({})
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const result = await updateBusinessSettings(settings)
      if (result.success) {
        alert('Settings saved successfully')
        loadSettings()
      } else {
        alert('Failed to save settings')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  function updateField(field: string, value: any) {
    setSettings({ ...settings, [field]: value })
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New password and confirm password do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    setChangingPassword(true)
    try {
      const result = await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
      )

      if (result.success) {
        toast.success('Password changed successfully')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
      } else {
        toast.error(result.message || 'Failed to change password')
      }
    } catch (error) {
      console.error('Failed to change password:', error)
      toast.error('Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <PageLoader />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure your business preferences</p>
        </div>
        <Button className="brass-glow" onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <div className="w-56 shrink-0 space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <section.icon className="w-4 h-4" />
              {section.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          {activeSection === 'business' && (
            <>
              <Card className="card-tactical">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    Business Information
                  </CardTitle>
                  <CardDescription>Your company details shown on receipts and documents</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Business Name</Label>
                      <Input
                        value={settings?.businessName || ''}
                        onChange={(e) => updateField('businessName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Trading Name</Label>
                      <Input
                        value={settings?.businessType || ''}
                        onChange={(e) => updateField('businessType', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>NTN (National Tax Number)</Label>
                      <Input
                        value={settings?.taxId || ''}
                        onChange={(e) => updateField('taxId', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Business Registration No.</Label>
                      <Input
                        value={settings?.businessRegistrationNo || ''}
                        onChange={(e) => updateField('businessRegistrationNo', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input
                      value={settings?.businessAddress || ''}
                      onChange={(e) => updateField('businessAddress', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={settings?.businessPhone || ''}
                        onChange={(e) => updateField('businessPhone', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        value={settings?.businessEmail || ''}
                        onChange={(e) => updateField('businessEmail', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Website</Label>
                      <Input
                        value={settings?.businessWebsite || ''}
                        onChange={(e) => updateField('businessWebsite', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-tactical">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    Regional Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Country</Label>
                      <Select value={settings?.businessCountry || 'pk'} onValueChange={(value) => updateField('businessCountry', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pk">Pakistan</SelectItem>
                          <SelectItem value="ae">UAE</SelectItem>
                          <SelectItem value="sa">Saudi Arabia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <Select value={settings?.timezone || 'UTC'} onValueChange={(value) => updateField('timezone', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">PKT (UTC+5)</SelectItem>
                          <SelectItem value="GST">GST (UTC+4)</SelectItem>
                          <SelectItem value="AST">AST (UTC+3)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date Format</Label>
                      <Select value={settings?.dateFormat || 'DD/MM/YYYY'} onValueChange={(value) => updateField('dateFormat', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeSection === 'tax' && (
            <>
              <Card className="card-tactical">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    Currency Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Select value={settings?.currencyCode || 'PKR'} onValueChange={(value) => updateField('currencyCode', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PKR">PKR - Pakistani Rupee</SelectItem>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Currency Symbol</Label>
                      <Input
                        value={settings?.currencySymbol || 'Rs.'}
                        onChange={(e) => updateField('currencySymbol', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Decimal Places</Label>
                      <Select value={String(settings?.decimalPlaces || 2)} onValueChange={(value) => updateField('decimalPlaces', Number(value))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-tactical">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Percent className="w-4 h-4 text-primary" />
                    Tax Configuration
                  </CardTitle>
                  <CardDescription>Default tax rates applied to sales</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Default Tax Rate (%)</Label>
                      <Input
                        type="number"
                        value={settings?.taxRate || '17'}
                        onChange={(e) => updateField('taxRate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tax Label</Label>
                      <Input
                        value={settings?.taxName || 'Sales Tax'}
                        onChange={(e) => updateField('taxName', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                    <div>
                      <p className="text-sm font-medium">Tax Inclusive Pricing</p>
                      <p className="text-xs text-muted-foreground">Product prices already include tax</p>
                    </div>
                    <Switch
                      checked={settings?.isTaxInclusive || false}
                      onCheckedChange={(checked) => updateField('isTaxInclusive', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                    <div>
                      <p className="text-sm font-medium">Show Tax Breakdown</p>
                      <p className="text-xs text-muted-foreground">Display tax amount separately on receipts</p>
                    </div>
                    <Switch
                      checked={settings?.showTaxOnReceipt ?? true}
                      onCheckedChange={(checked) => updateField('showTaxOnReceipt', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeSection === 'sales' && (
            <>
              <Card className="card-tactical">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-primary" />
                    Payment Methods
                  </CardTitle>
                  <CardDescription>Select which payment methods are available at Point of Sale</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {ALL_PAYMENT_METHODS.map((method) => {
                    const allowed = (settings?.allowedPaymentMethods || 'cash,card,credit,mobile')
                      .toLowerCase()
                      .split(',')
                      .map((s: string) => s.trim())
                    const isChecked = allowed.includes(method.key)

                    return (
                      <label
                        key={method.key}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors cursor-pointer"
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            let methods = allowed.filter((m: string) => m !== method.key)
                            if (checked) methods.push(method.key)
                            if (methods.length === 0) methods = ['cash']
                            updateField('allowedPaymentMethods', methods.join(','))
                            // If default was removed, reset to first allowed
                            const currentDefault = (settings?.defaultPaymentMethod || 'cash').toLowerCase()
                            if (!methods.includes(currentDefault)) {
                              updateField('defaultPaymentMethod', methods[0])
                            }
                          }}
                        />
                        <method.icon className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{method.label}</p>
                          <p className="text-xs text-muted-foreground">{method.description}</p>
                        </div>
                        {isChecked && (
                          <Badge variant="outline" className="text-[10px] text-green-500 border-green-500/30">
                            Active
                          </Badge>
                        )}
                      </label>
                    )
                  })}
                </CardContent>
              </Card>

              <Card className="card-tactical">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    Default Payment Method
                  </CardTitle>
                  <CardDescription>Pre-selected payment method when opening POS</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select
                    value={(settings?.defaultPaymentMethod || 'cash').toLowerCase()}
                    onValueChange={(value) => updateField('defaultPaymentMethod', value)}
                  >
                    <SelectTrigger className="w-full max-w-sm">
                      <SelectValue placeholder="Select default method" />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_PAYMENT_METHODS
                        .filter((method) => {
                          const allowed = (settings?.allowedPaymentMethods || 'cash,card,credit,mobile')
                            .toLowerCase()
                            .split(',')
                            .map((s: string) => s.trim())
                          return allowed.includes(method.key)
                        })
                        .map((method) => (
                          <SelectItem key={method.key} value={method.key}>
                            <span className="flex items-center gap-2">
                              <method.icon className="w-4 h-4" />
                              {method.label}
                            </span>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </>
          )}

          {activeSection === 'receipt' && (
            <>
              <Card className="card-tactical">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Printer className="w-4 h-4 text-primary" />
                    Receipt Layout
                  </CardTitle>
                  <CardDescription>Configure how printed receipts appear</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Receipt Format</Label>
                      <Select value={settings?.receiptFormat || 'pdf'} onValueChange={(value) => updateField('receiptFormat', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="58">58mm (Small)</SelectItem>
                          <SelectItem value="80">80mm (Standard)</SelectItem>
                          <SelectItem value="pdf">A4 (Full Page)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Invoice Prefix</Label>
                      <Input
                        value={settings?.invoicePrefix || 'INV-'}
                        onChange={(e) => updateField('invoicePrefix', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Receipt Header Text</Label>
                    <Input
                      value={settings?.receiptHeader || ''}
                      onChange={(e) => updateField('receiptHeader', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Receipt Footer Text</Label>
                    <Input
                      value={settings?.receiptFooter || ''}
                      onChange={(e) => updateField('receiptFooter', e.target.value)}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Display Options</Label>
                    {[
                      { field: 'receiptShowBusinessLogo', label: 'Show Business Logo', desc: 'Print company logo on receipt header' },
                      { field: 'showTaxOnReceipt', label: 'Show Tax Breakdown', desc: 'Include tax details on receipt' },
                      { field: 'showQRCodeOnReceipt', label: 'Show QR Code', desc: 'Print QR code for sale reference' },
                      { field: 'receiptAutoDownload', label: 'Auto Download Receipt', desc: 'Automatically download after sale' },
                    ].map((opt) => (
                      <div key={opt.field} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                        <div>
                          <p className="text-sm font-medium">{opt.label}</p>
                          <p className="text-xs text-muted-foreground">{opt.desc}</p>
                        </div>
                        <Switch
                          checked={settings?.[opt.field] ?? true}
                          onCheckedChange={(checked) => updateField(opt.field, checked)}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeSection === 'notifications' && (
            <>
              <Card className="card-tactical">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bell className="w-4 h-4 text-primary" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>Choose which events trigger alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { field: 'lowStockNotifications', label: 'Low Stock Alerts', desc: 'Notify when product stock falls below minimum' },
                    { field: 'enableEmailNotifications', label: 'Email Notifications', desc: 'Send notifications via email' },
                    { field: 'dailySalesReport', label: 'Daily Sales Summary', desc: 'Send end-of-day sales report via email' },
                  ].map((notif) => (
                    <div key={notif.field} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                      <div>
                        <p className="text-sm font-medium">{notif.label}</p>
                        <p className="text-xs text-muted-foreground">{notif.desc}</p>
                      </div>
                      <Switch
                        checked={settings?.[notif.field] ?? true}
                        onCheckedChange={(checked) => updateField(notif.field, checked)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="card-tactical">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Low Stock Threshold
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Default Minimum Stock</Label>
                      <Input
                        type="number"
                        value={settings?.lowStockThreshold || 5}
                        onChange={(e) => updateField('lowStockThreshold', Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Notification Email</Label>
                      <Input
                        type="email"
                        value={settings?.notificationEmail || ''}
                        onChange={(e) => updateField('notificationEmail', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeSection === 'security' && (
            <>
              <Card className="card-tactical">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Key className="w-4 h-4 text-primary" />
                    Change Password
                  </CardTitle>
                  <CardDescription>Update your account password</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Current Password</Label>
                      <Input
                        type="password"
                        placeholder="Enter current password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input
                        type="password"
                        placeholder="Enter new password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        required
                      />
                      <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm New Password</Label>
                      <Input
                        type="password"
                        placeholder="Re-enter new password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={changingPassword} className="brass-glow">
                      {changingPassword ? 'Changing Password...' : 'Change Password'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="card-tactical">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    Authentication & Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { field: 'requirePasswordChange', label: 'Require Password Change', desc: 'Force periodic password updates' },
                    { field: 'enableAuditLogs', label: 'Enable Audit Trail', desc: 'Log all user actions for compliance review' },
                  ].map((sec) => (
                    <div key={sec.field} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                      <div>
                        <p className="text-sm font-medium">{sec.label}</p>
                        <p className="text-xs text-muted-foreground">{sec.desc}</p>
                      </div>
                      <Switch
                        checked={settings?.[sec.field] ?? true}
                        onCheckedChange={(checked) => updateField(sec.field, checked)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="card-tactical">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Session & Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Session Timeout (minutes)</Label>
                      <Input
                        type="number"
                        value={settings?.sessionTimeoutMinutes || 60}
                        onChange={(e) => updateField('sessionTimeoutMinutes', Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Password Change Days</Label>
                      <Input
                        type="number"
                        value={settings?.passwordChangeIntervalDays || 90}
                        onChange={(e) => updateField('passwordChangeIntervalDays', Number(e.target.value))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
