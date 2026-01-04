import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/auth-context'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import {
  Building2,
  Receipt,
  DollarSign,
  Package,
  CreditCard,
  ShoppingCart,
  Bell,
  Clock,
  Shield,
  Settings as SettingsIcon,
  Save,
  Plus,
  Pencil,
  Trash2,
  Copy,
  Globe,
  MapPin,
  RefreshCw,
  AlertCircle,
  Printer,
} from 'lucide-react'
import type { Branch, BusinessSettings } from '@shared/types'

interface SettingsWithBranch extends BusinessSettings {
  branch?: Branch | null
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const BUSINESS_TYPES = ['Retail', 'Wholesale', 'Mixed']
const CURRENCY_POSITIONS = ['prefix', 'suffix']
const INVOICE_FORMATS = ['sequential', 'date-based']
const STOCK_VALUATION_METHODS = ['FIFO', 'LIFO', 'Average']
const BACKUP_FREQUENCIES = ['daily', 'weekly', 'monthly']
const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']
const TIME_FORMATS = ['12-hour', '24-hour']
const TIMEZONES = ['UTC', 'Asia/Karachi', 'America/New_York', 'Europe/London']

export function BusinessSettingsScreen() {
  const { user } = useAuth()

  const [branches, setBranches] = useState<Branch[]>([])
  const [allSettings, setAllSettings] = useState<SettingsWithBranch[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null)
  const [currentSettings, setCurrentSettings] = useState<BusinessSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'clone'>('create')
  const [error, setError] = useState<string | null>(null)
  const [isLoadingSettings, setIsLoadingSettings] = useState(false)

  // Dialog state
  const [cloneSourceBranchId, setCloneSourceBranchId] = useState<number | null>(null)
  const [cloneTargetBranchId, setCloneTargetBranchId] = useState<string>('')
  const [createBranchId, setCreateBranchId] = useState<string>('')

  // Admin access check
  const isAdmin = user?.role?.toLowerCase() === 'admin'

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Fetch branches
      const branchesResult = await window.api.branches.getActive()
      if (branchesResult.success && branchesResult.data) {
        setBranches(branchesResult.data)
      }

      // Fetch all settings (admin only)
      if (isAdmin && user) {
        try {
          console.log('[BusinessSettings] Fetching all settings for user:', user.userId)
          const settingsData = await window.api.businessSettings.getAll(user.userId)
          console.log('[BusinessSettings] Settings received:', settingsData.length)
          setAllSettings(settingsData)
        } catch (err) {
          console.error('[BusinessSettings] Failed to fetch all settings:', err)
          // Show warning but don't fail completely - we can still show current settings
        }
      }

      // Load current settings
      await handleBranchChange(selectedBranchId)
    } catch (err) {
      setError('Failed to load data')
      console.error('Error fetching data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [isAdmin, user, selectedBranchId])

  const handleBranchChange = async (branchId: number | null) => {
    setSelectedBranchId(branchId)
    setIsLoadingSettings(true)
    try {
      const settings = branchId
        ? await window.api.businessSettings.getByBranch(branchId)
        : await window.api.businessSettings.getGlobal()
      setCurrentSettings(settings)
    } catch (err) {
      console.error('Error loading settings:', err)
      setError('Failed to load settings')
    } finally {
      setIsLoadingSettings(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentSettings || !user) return

    setIsSaving(true)
    setError(null)
    try {
      if (currentSettings.settingId) {
        // Update existing
        await window.api.businessSettings.update(user.userId, currentSettings.settingId, currentSettings)
      } else {
        // Create new
        await window.api.businessSettings.create(user.userId, currentSettings)
      }
      await fetchData()
      alert('Settings saved successfully!')
    } catch (err) {
      console.error('Error saving settings:', err)
      setError('Failed to save settings')
      alert('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteSettings = async (settingId: number) => {
    if (!confirm('Are you sure you want to delete these settings?')) return
    if (!user) return

    try {
      await window.api.businessSettings.delete(user.userId, settingId)
      await fetchData()
      alert('Settings deleted successfully!')
    } catch (err) {
      console.error('Error deleting settings:', err)
      alert('Failed to delete settings')
    }
  }

  const handleCloneSettings = async () => {
    if (!user || !cloneSourceBranchId || !cloneTargetBranchId) return

    try {
      await window.api.businessSettings.clone(
        user.userId,
        cloneSourceBranchId,
        parseInt(cloneTargetBranchId)
      )
      await fetchData()
      setIsDialogOpen(false)
      setCloneSourceBranchId(null)
      setCloneTargetBranchId('')
      alert('Settings cloned successfully!')
    } catch (err) {
      console.error('Error cloning settings:', err)
      alert('Failed to clone settings')
    }
  }

  const handleCreateSettings = async () => {
    if (!user || !createBranchId) return

    try {
      await window.api.businessSettings.create(user.userId, {
        branchId: parseInt(createBranchId),
        businessName: '',
        businessAddress: '',
        currencySymbol: 'Rs.',
        currencyCode: 'PKR',
        taxRate: 0,
        taxName: 'GST',
      } as Record<string, unknown>)
      await fetchData()
      setIsDialogOpen(false)
      setCreateBranchId('')
      // Switch to the newly created settings
      await handleBranchChange(parseInt(createBranchId))
      alert('Settings created successfully!')
    } catch (err) {
      console.error('Error creating settings:', err)
      alert('Failed to create settings')
    }
  }

  // Render access denied for non-admins
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center max-w-md">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            Only administrators can access business settings. Please contact your administrator
            if you need to modify settings.
          </p>
        </div>
      </div>
    )
  }

  if (isLoading && !currentSettings) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  // Show loading spinner when switching between branches
  if (isLoadingSettings && !currentSettings) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Business Settings Management</h1>
          <p className="text-muted-foreground">
            Configure global and branch-specific settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setDialogMode('clone')
              setIsDialogOpen(true)
            }}
          >
            <Copy className="w-4 h-4 mr-2" />
            Clone Settings
          </Button>
          <Button
            onClick={() => {
              setDialogMode('create')
              setIsDialogOpen(true)
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Settings
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Branch Selector */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <Label className="min-w-[140px]">Select Business:</Label>
            </div>
            <Select
              value={selectedBranchId === null ? 'global' : selectedBranchId.toString()}
              onValueChange={(val) => handleBranchChange(val === 'global' ? null : parseInt(val))}
            >
              <SelectTrigger className="flex-1 max-w-md">
                <SelectValue placeholder="Select branch or global settings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Global Settings (Default)
                  </div>
                </SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id.toString()}>
                    {branch.name} ({branch.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground">
              {selectedBranchId === null
                ? 'Editing global default settings'
                : `Editing settings for ${branches.find(b => b.id === selectedBranchId)?.name || 'Unknown'}`}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Form */}
      {currentSettings && (
        <form onSubmit={handleSaveSettings}>
          {/* Business Info Tab */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Business Information
              </CardTitle>
              <CardDescription>
                Basic business details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="col-span-full">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    value={currentSettings.businessName || ''}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        businessName: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="businessRegistrationNo">Registration Number</Label>
                  <Input
                    id="businessRegistrationNo"
                    value={currentSettings.businessRegistrationNo || ''}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        businessRegistrationNo: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select
                    value={currentSettings.businessType || ''}
                    onValueChange={(val) =>
                      setCurrentSettings({ ...currentSettings, businessType: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="businessPhone">Phone</Label>
                  <Input
                    id="businessPhone"
                    value={currentSettings.businessPhone || ''}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        businessPhone: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="businessEmail">Email</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    value={currentSettings.businessEmail || ''}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        businessEmail: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="businessWebsite">Website</Label>
                  <Input
                    id="businessWebsite"
                    value={currentSettings.businessWebsite || ''}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        businessWebsite: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-span-full">
                  <Label htmlFor="businessAddress">Address</Label>
                  <Textarea
                    id="businessAddress"
                    value={currentSettings.businessAddress || ''}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        businessAddress: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="businessCity">City</Label>
                  <Input
                    id="businessCity"
                    value={currentSettings.businessCity || ''}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        businessCity: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="businessState">State/Province</Label>
                  <Input
                    id="businessState"
                    value={currentSettings.businessState || ''}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        businessState: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="businessCountry">Country</Label>
                  <Input
                    id="businessCountry"
                    value={currentSettings.businessCountry || ''}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        businessCountry: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax & Currency Tab */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Tax & Currency Configuration
              </CardTitle>
              <CardDescription>
                Configure tax rates and currency formatting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <Label htmlFor="taxName">Tax Name</Label>
                  <Input
                    id="taxName"
                    value={currentSettings.taxName || 'GST'}
                    onChange={(e) =>
                      setCurrentSettings({ ...currentSettings, taxName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={currentSettings.taxRate || 0}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        taxRate: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="taxId">Tax ID / EIN</Label>
                  <Input
                    id="taxId"
                    value={currentSettings.taxId || ''}
                    onChange={(e) =>
                      setCurrentSettings({ ...currentSettings, taxId: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="currencyCode">Currency Code</Label>
                  <Input
                    id="currencyCode"
                    value={currentSettings.currencyCode || 'PKR'}
                    onChange={(e) =>
                      setCurrentSettings({ ...currentSettings, currencyCode: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="currencySymbol">Currency Symbol</Label>
                  <Input
                    id="currencySymbol"
                    value={currentSettings.currencySymbol || 'Rs.'}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        currencySymbol: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="currencyPosition">Symbol Position</Label>
                  <Select
                    value={currentSettings.currencyPosition || 'prefix'}
                    onValueChange={(val) =>
                      setCurrentSettings({ ...currentSettings, currencyPosition: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prefix">Prefix (e.g., Rs.100)</SelectItem>
                      <SelectItem value="suffix">Suffix (e.g., 100 Rs.)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="decimalPlaces">Decimal Places</Label>
                  <Input
                    id="decimalPlaces"
                    type="number"
                    min="0"
                    max="4"
                    value={currentSettings.decimalPlaces ?? 2}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        decimalPlaces: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Receipt/Invoice Tab */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Receipt & Invoice Settings
              </CardTitle>
              <CardDescription>
                Configure receipt and invoice formatting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
                  <Input
                    id="invoicePrefix"
                    value={currentSettings.invoicePrefix || 'INV'}
                    onChange={(e) =>
                      setCurrentSettings({ ...currentSettings, invoicePrefix: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="invoiceNumberFormat">Number Format</Label>
                  <Select
                    value={currentSettings.invoiceNumberFormat || 'sequential'}
                    onValueChange={(val) =>
                      setCurrentSettings({ ...currentSettings, invoiceNumberFormat: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sequential">Sequential (0001)</SelectItem>
                      <SelectItem value="date-based">Date-based (202401010001)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="invoiceStartingNumber">Starting Number</Label>
                  <Input
                    id="invoiceStartingNumber"
                    type="number"
                    min="1"
                    value={currentSettings.invoiceStartingNumber || 1}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        invoiceStartingNumber: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
                <div className="col-span-full">
                  <Label htmlFor="receiptHeader">Receipt Header</Label>
                  <Textarea
                    id="receiptHeader"
                    value={currentSettings.receiptHeader || ''}
                    onChange={(e) =>
                      setCurrentSettings({ ...currentSettings, receiptHeader: e.target.value })
                    }
                    placeholder="Header text shown at the top of receipts"
                  />
                </div>
                <div className="col-span-full">
                  <Label htmlFor="receiptFooter">Receipt Footer</Label>
                  <Textarea
                    id="receiptFooter"
                    value={currentSettings.receiptFooter || ''}
                    onChange={(e) =>
                      setCurrentSettings({ ...currentSettings, receiptFooter: e.target.value })
                    }
                    placeholder="Footer text shown at the bottom of receipts"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Receipt Customization Tab */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Printer className="w-5 h-5" />
                Receipt Customization
              </CardTitle>
              <CardDescription>
                Configure receipt appearance and auto-generation settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <Label htmlFor="receiptFormat">Receipt Format</Label>
                  <Select
                    value={currentSettings.receiptFormat || 'pdf'}
                    onValueChange={(val) =>
                      setCurrentSettings({ ...currentSettings, receiptFormat: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF (A4/Letter)</SelectItem>
                      <SelectItem value="thermal">Thermal (80mm)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="receiptPrimaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="receiptPrimaryColor"
                      type="color"
                      value={currentSettings.receiptPrimaryColor || '#1e40af'}
                      onChange={(e) =>
                        setCurrentSettings({
                          ...currentSettings,
                          receiptPrimaryColor: e.target.value,
                        })
                      }
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={currentSettings.receiptPrimaryColor || '#1e40af'}
                      onChange={(e) =>
                        setCurrentSettings({
                          ...currentSettings,
                          receiptPrimaryColor: e.target.value,
                        })
                      }
                      placeholder="#1e40af"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="receiptSecondaryColor">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="receiptSecondaryColor"
                      type="color"
                      value={currentSettings.receiptSecondaryColor || '#64748b'}
                      onChange={(e) =>
                        setCurrentSettings({
                          ...currentSettings,
                          receiptSecondaryColor: e.target.value,
                        })
                      }
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={currentSettings.receiptSecondaryColor || '#64748b'}
                      onChange={(e) =>
                        setCurrentSettings({
                          ...currentSettings,
                          receiptSecondaryColor: e.target.value,
                        })
                      }
                      placeholder="#64748b"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="receiptFontSize">Font Size</Label>
                  <Select
                    value={currentSettings.receiptFontSize || 'medium'}
                    onValueChange={(val) =>
                      setCurrentSettings({ ...currentSettings, receiptFontSize: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="receiptAutoDownload"
                    checked={currentSettings.receiptAutoDownload !== false}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        receiptAutoDownload: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="receiptAutoDownload">Auto-download receipt after sale</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="receiptShowBusinessLogo"
                    checked={currentSettings.receiptShowBusinessLogo !== false}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        receiptShowBusinessLogo: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="receiptShowBusinessLogo">Show business logo on receipt</Label>
                </div>

                {/* Custom Field 1 */}
                <div className="col-span-full">
                  <Separator className="my-4" />
                  <h4 className="font-medium mb-3">Custom Fields</h4>
                </div>
                <div>
                  <Label htmlFor="receiptCustomField1Label">Custom Field 1 Label</Label>
                  <Input
                    id="receiptCustomField1Label"
                    value={currentSettings.receiptCustomField1Label || ''}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        receiptCustomField1Label: e.target.value,
                      })
                    }
                    placeholder="e.g., License Number"
                  />
                </div>
                <div className="lg:col-span-2">
                  <Label htmlFor="receiptCustomField1Value">Custom Field 1 Value</Label>
                  <Input
                    id="receiptCustomField1Value"
                    value={currentSettings.receiptCustomField1Value || ''}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        receiptCustomField1Value: e.target.value,
                      })
                    }
                    placeholder="e.g., FFL-12345678"
                  />
                </div>
                <div>
                  <Label htmlFor="receiptCustomField2Label">Custom Field 2 Label</Label>
                  <Input
                    id="receiptCustomField2Label"
                    value={currentSettings.receiptCustomField2Label || ''}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        receiptCustomField2Label: e.target.value,
                      })
                    }
                    placeholder="e.g., Store Hours"
                  />
                </div>
                <div className="lg:col-span-2">
                  <Label htmlFor="receiptCustomField2Value">Custom Field 2 Value</Label>
                  <Input
                    id="receiptCustomField2Value"
                    value={currentSettings.receiptCustomField2Value || ''}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        receiptCustomField2Value: e.target.value,
                      })
                    }
                    placeholder="e.g., Mon-Sat 9AM-6PM"
                  />
                </div>
                <div>
                  <Label htmlFor="receiptCustomField3Label">Custom Field 3 Label</Label>
                  <Input
                    id="receiptCustomField3Label"
                    value={currentSettings.receiptCustomField3Label || ''}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        receiptCustomField3Label: e.target.value,
                      })
                    }
                    placeholder="e.g., Return Policy"
                  />
                </div>
                <div className="lg:col-span-2">
                  <Label htmlFor="receiptCustomField3Value">Custom Field 3 Value</Label>
                  <Input
                    id="receiptCustomField3Value"
                    value={currentSettings.receiptCustomField3Value || ''}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        receiptCustomField3Value: e.target.value,
                      })
                    }
                    placeholder="e.g., 30 days with receipt"
                  />
                </div>

                {/* Terms and Conditions */}
                <div className="col-span-full">
                  <Separator className="my-4" />
                  <Label htmlFor="receiptTermsAndConditions">Terms & Conditions</Label>
                  <Textarea
                    id="receiptTermsAndConditions"
                    value={currentSettings.receiptTermsAndConditions || ''}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        receiptTermsAndConditions: e.target.value,
                      })
                    }
                    placeholder="Return policy, warranty information, legal disclaimers, etc."
                    rows={4}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Tab */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Inventory Management
              </CardTitle>
              <CardDescription>
                Configure inventory tracking and stock management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    min="0"
                    value={currentSettings.lowStockThreshold ?? 10}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        lowStockThreshold: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="stockValuationMethod">Valuation Method</Label>
                  <Select
                    value={currentSettings.stockValuationMethod || 'FIFO'}
                    onValueChange={(val) =>
                      setCurrentSettings({ ...currentSettings, stockValuationMethod: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STOCK_VALUATION_METHODS.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="autoReorderQuantity">Auto Reorder Quantity</Label>
                  <Input
                    id="autoReorderQuantity"
                    type="number"
                    min="0"
                    value={currentSettings.autoReorderQuantity ?? 50}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        autoReorderQuantity: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sales & Payment Tab */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Sales & Payment Settings
              </CardTitle>
              <CardDescription>
                Configure sales, payment methods, and discounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <Label htmlFor="defaultPaymentMethod">Default Payment Method</Label>
                  <Input
                    id="defaultPaymentMethod"
                    value={currentSettings.defaultPaymentMethod || 'Cash'}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        defaultPaymentMethod: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="allowedPaymentMethods">Allowed Payment Methods</Label>
                  <Input
                    id="allowedPaymentMethods"
                    value={currentSettings.allowedPaymentMethods || 'Cash,Card,Bank Transfer,COD'}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        allowedPaymentMethods: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="maxDiscountPercentage">Max Discount (%)</Label>
                  <Input
                    id="maxDiscountPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={currentSettings.maxDiscountPercentage ?? 50}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        maxDiscountPercentage: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="openingCashBalance">Opening Cash Balance</Label>
                  <Input
                    id="openingCashBalance"
                    type="number"
                    min="0"
                    step="0.01"
                    value={currentSettings.openingCashBalance ?? 0}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        openingCashBalance: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Working Hours Tab */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Working Hours
              </CardTitle>
              <CardDescription>
                Configure operating hours for this business/branch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <Label htmlFor="workingDaysStart">Week Starts</Label>
                  <Select
                    value={currentSettings.workingDaysStart || 'Monday'}
                    onValueChange={(val) =>
                      setCurrentSettings({ ...currentSettings, workingDaysStart: val })
                    }
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
                <div>
                  <Label htmlFor="workingDaysEnd">Week Ends</Label>
                  <Select
                    value={currentSettings.workingDaysEnd || 'Saturday'}
                    onValueChange={(val) =>
                      setCurrentSettings({ ...currentSettings, workingDaysEnd: val })
                    }
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
                <div>
                  <Label htmlFor="openingTime">Opening Time</Label>
                  <Input
                    id="openingTime"
                    type="time"
                    value={currentSettings.openingTime || '09:00'}
                    onChange={(e) =>
                      setCurrentSettings({ ...currentSettings, openingTime: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="closingTime">Closing Time</Label>
                  <Input
                    id="closingTime"
                    type="time"
                    value={currentSettings.closingTime || '18:00'}
                    onChange={(e) =>
                      setCurrentSettings({ ...currentSettings, closingTime: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Preferences Tab */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                System Preferences
              </CardTitle>
              <CardDescription>
                Configure date, time, language, and backup settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select
                    value={currentSettings.dateFormat || 'DD/MM/YYYY'}
                    onValueChange={(val) =>
                      setCurrentSettings({ ...currentSettings, dateFormat: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DATE_FORMATS.map((format) => (
                        <SelectItem key={format} value={format}>
                          {format}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timeFormat">Time Format</Label>
                  <Select
                    value={currentSettings.timeFormat || '24-hour'}
                    onValueChange={(val) =>
                      setCurrentSettings({ ...currentSettings, timeFormat: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_FORMATS.map((format) => (
                        <SelectItem key={format} value={format}>
                          {format}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={currentSettings.timezone || 'UTC'}
                    onValueChange={(val) =>
                      setCurrentSettings({ ...currentSettings, timezone: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    value={currentSettings.language || 'en'}
                    onChange={(e) =>
                      setCurrentSettings({ ...currentSettings, language: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="autoBackupFrequency">Backup Frequency</Label>
                  <Select
                    value={currentSettings.autoBackupFrequency || 'daily'}
                    onValueChange={(val) =>
                      setCurrentSettings({ ...currentSettings, autoBackupFrequency: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BACKUP_FREQUENCIES.map((freq) => (
                        <SelectItem key={freq} value={freq}>
                          {freq.charAt(0).toUpperCase() + freq.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="backupRetentionDays">Backup Retention (Days)</Label>
                  <Input
                    id="backupRetentionDays"
                    type="number"
                    min="1"
                    value={currentSettings.backupRetentionDays ?? 30}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        backupRetentionDays: parseInt(e.target.value) || 30,
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={fetchData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button type="submit" disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      )}

      {/* All Settings Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All Business Settings</CardTitle>
          <CardDescription>
            Overview of all business configurations across branches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Tax Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allSettings.map((setting) => (
                <TableRow key={setting.settingId}>
                  <TableCell className="font-medium">{setting.businessName}</TableCell>
                  <TableCell>
                    {setting.branchId === null ? (
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        <Globe className="w-3 h-3" />
                        Global
                      </Badge>
                    ) : (
                      <span>{setting.branch?.name || `Branch ${setting.branchId}`}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {setting.currencySymbol} ({setting.currencyCode})
                  </TableCell>
                  <TableCell>{setting.taxRate}%</TableCell>
                  <TableCell>
                    <Badge
                      variant={setting.isActive ? 'default' : 'destructive'}
                    >
                      {setting.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBranchChange(setting.branchId)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      {setting.branchId !== null && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteSettings(setting.settingId)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {allSettings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No business settings configured yet. Create global settings first.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Clone/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'clone' ? 'Clone Settings' : 'Create New Settings'}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'clone'
                ? 'Select source and target branches to clone settings'
                : 'Create new business settings for a branch'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {dialogMode === 'clone' ? (
              <>
                <div>
                  <Label>Source Settings</Label>
                  <Select
                    value={cloneSourceBranchId === null ? 'global' : cloneSourceBranchId.toString()}
                    onValueChange={(val) =>
                      setCloneSourceBranchId(val === 'global' ? null : parseInt(val))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">Global Settings</SelectItem>
                      {branches
                        .filter((b) => allSettings.some((s) => s.branchId === b.id))
                        .map((branch) => (
                          <SelectItem key={branch.id} value={branch.id.toString()}>
                            {branch.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Target Branch</Label>
                  <Select value={cloneTargetBranchId} onValueChange={setCloneTargetBranchId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches
                        .filter((b) => !allSettings.some((s) => s.branchId === b.id))
                        .map((branch) => (
                          <SelectItem key={branch.id} value={branch.id.toString()}>
                            {branch.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {branches.filter((b) => !allSettings.some((s) => s.branchId === b.id)).length ===
                    0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      All branches already have settings. Update existing settings instead.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label>Select Branch</Label>
                  <Select value={createBranchId} onValueChange={setCreateBranchId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches
                        .filter((b) => !allSettings.some((s) => s.branchId === b.id))
                        .map((branch) => (
                          <SelectItem key={branch.id} value={branch.id.toString()}>
                            {branch.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {branches.filter((b) => !allSettings.some((s) => s.branchId === b.id)).length ===
                    0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      All branches already have settings. Update existing settings instead.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={dialogMode === 'clone' ? handleCloneSettings : handleCreateSettings}
              disabled={
                dialogMode === 'clone'
                  ? !cloneSourceBranchId || !cloneTargetBranchId
                  : !createBranchId
              }
            >
              {dialogMode === 'clone' ? 'Clone Settings' : 'Create Settings'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
