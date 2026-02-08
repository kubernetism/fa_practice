'use client'

import { useState } from 'react'
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

type SettingsSection = 'business' | 'tax' | 'receipt' | 'notifications' | 'security'

const sections: { id: SettingsSection; label: string; icon: typeof Settings }[] = [
  { id: 'business', label: 'Business Info', icon: Building2 },
  { id: 'tax', label: 'Tax & Currency', icon: Percent },
  { id: 'receipt', label: 'Receipt', icon: Receipt },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: ShieldCheck },
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('business')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure your business preferences</p>
        </div>
        <Button className="brass-glow">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
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
                      <Input defaultValue="Firearms Trading Co." />
                    </div>
                    <div className="space-y-2">
                      <Label>Trading Name</Label>
                      <Input defaultValue="FTC Arms & Ammunition" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>NTN (National Tax Number)</Label>
                      <Input defaultValue="1234567-8" />
                    </div>
                    <div className="space-y-2">
                      <Label>STRN (Sales Tax Reg.)</Label>
                      <Input defaultValue="17-00-1234-567-89" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Dealer License Number</Label>
                    <Input defaultValue="DL-ISB-2024-001" />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input defaultValue="Plot 45, Blue Area, Jinnah Avenue, Islamabad" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input defaultValue="+92-51-2345678" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input defaultValue="info@firearms.pk" />
                    </div>
                    <div className="space-y-2">
                      <Label>Website</Label>
                      <Input defaultValue="www.firearms.pk" />
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
                      <Select defaultValue="pk">
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
                      <Select defaultValue="pkt">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pkt">PKT (UTC+5)</SelectItem>
                          <SelectItem value="gst">GST (UTC+4)</SelectItem>
                          <SelectItem value="ast">AST (UTC+3)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date Format</Label>
                      <Select defaultValue="dmy">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                          <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                          <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
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
                      <Select defaultValue="pkr">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pkr">PKR - Pakistani Rupee</SelectItem>
                          <SelectItem value="usd">USD - US Dollar</SelectItem>
                          <SelectItem value="aed">AED - UAE Dirham</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Currency Symbol</Label>
                      <Input defaultValue="Rs." />
                    </div>
                    <div className="space-y-2">
                      <Label>Decimal Places</Label>
                      <Select defaultValue="2">
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
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                    <div>
                      <p className="text-sm font-medium">Enable Sales Tax</p>
                      <p className="text-xs text-muted-foreground">Apply tax on all taxable products</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Default Tax Rate (%)</Label>
                      <Input type="number" defaultValue="17" />
                    </div>
                    <div className="space-y-2">
                      <Label>Tax Label</Label>
                      <Input defaultValue="Sales Tax" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                    <div>
                      <p className="text-sm font-medium">Tax Inclusive Pricing</p>
                      <p className="text-xs text-muted-foreground">Product prices already include tax</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                    <div>
                      <p className="text-sm font-medium">Show Tax Breakdown</p>
                      <p className="text-xs text-muted-foreground">Display tax amount separately on receipts</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
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
                      <Label>Receipt Width</Label>
                      <Select defaultValue="80">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="58">58mm (Small)</SelectItem>
                          <SelectItem value="80">80mm (Standard)</SelectItem>
                          <SelectItem value="a4">A4 (Full Page)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Invoice Prefix</Label>
                      <Input defaultValue="INV-" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Receipt Header Text</Label>
                    <Input defaultValue="FTC Arms & Ammunition - Licensed Dealer" />
                  </div>
                  <div className="space-y-2">
                    <Label>Receipt Footer Text</Label>
                    <Input defaultValue="Thank you for your business. All sales subject to applicable laws." />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Display Options</Label>
                    {[
                      { label: 'Show Business Logo', desc: 'Print company logo on receipt header', checked: true },
                      { label: 'Show Customer Info', desc: 'Include customer name and contact', checked: true },
                      { label: 'Show Serial Numbers', desc: 'Print serial numbers for tracked items', checked: true },
                      { label: 'Show Dealer License', desc: 'Display license number on receipt', checked: true },
                      { label: 'Show Barcode', desc: 'Print barcode for sale reference', checked: false },
                    ].map((opt) => (
                      <div key={opt.label} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                        <div>
                          <p className="text-sm font-medium">{opt.label}</p>
                          <p className="text-xs text-muted-foreground">{opt.desc}</p>
                        </div>
                        <Switch defaultChecked={opt.checked} />
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
                    { label: 'Low Stock Alerts', desc: 'Notify when product stock falls below minimum', checked: true },
                    { label: 'License Expiry Reminders', desc: 'Alert 30 days before customer license expires', checked: true },
                    { label: 'Daily Sales Summary', desc: 'Send end-of-day sales report via email', checked: false },
                    { label: 'New User Registration', desc: 'Notify admins when staff accounts are created', checked: true },
                    { label: 'Failed Login Attempts', desc: 'Alert on 3+ consecutive failed logins', checked: true },
                    { label: 'Return Processing', desc: 'Notify when a return is submitted', checked: false },
                  ].map((notif) => (
                    <div key={notif.label} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                      <div>
                        <p className="text-sm font-medium">{notif.label}</p>
                        <p className="text-xs text-muted-foreground">{notif.desc}</p>
                      </div>
                      <Switch defaultChecked={notif.checked} />
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
                      <Input type="number" defaultValue="5" />
                    </div>
                    <div className="space-y-2">
                      <Label>Alert Lead Days</Label>
                      <Input type="number" defaultValue="7" />
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
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    Authentication & Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: 'Require Strong Passwords', desc: 'Minimum 8 characters with mixed case and numbers', checked: true },
                    { label: 'Two-Factor Authentication', desc: 'Require 2FA for admin accounts', checked: false },
                    { label: 'Auto Logout on Idle', desc: 'Automatically log out after period of inactivity', checked: true },
                    { label: 'Login IP Restriction', desc: 'Only allow login from whitelisted IP addresses', checked: false },
                  ].map((sec) => (
                    <div key={sec.label} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                      <div>
                        <p className="text-sm font-medium">{sec.label}</p>
                        <p className="text-xs text-muted-foreground">{sec.desc}</p>
                      </div>
                      <Switch defaultChecked={sec.checked} />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="card-tactical">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Audit & Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Session Timeout (minutes)</Label>
                      <Input type="number" defaultValue="30" />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Login Attempts</Label>
                      <Input type="number" defaultValue="5" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                    <div>
                      <p className="text-sm font-medium">Enable Audit Trail</p>
                      <p className="text-xs text-muted-foreground">Log all user actions for compliance review</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                    <div>
                      <p className="text-sm font-medium">Require Sale Void Reason</p>
                      <p className="text-xs text-muted-foreground">Force staff to enter a reason when voiding sales</p>
                    </div>
                    <Switch defaultChecked />
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
