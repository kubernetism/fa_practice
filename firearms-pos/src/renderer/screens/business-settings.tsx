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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
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
  List,
  AlertTriangle,
  Database,
  Download,
  Upload,
  HardDrive,
  FolderOpen,
  Calendar,
  FileArchive,
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

  // Hard Reset state
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [resetConfirmationText, setResetConfirmationText] = useState('')
  const [resetAdminUsername, setResetAdminUsername] = useState('')
  const [resetAdminPassword, setResetAdminPassword] = useState('')
  const [isResetting, setIsResetting] = useState(false)
  const [resetStep, setResetStep] = useState<'warning' | 'confirm' | 'auth' | 'progress'>('warning')

  // Backup state
  interface BackupConfig {
    autoBackupEnabled: boolean
    autoBackupOnClose: boolean
    autoBackupFrequency: 'daily' | 'weekly' | 'monthly' | 'custom'
    autoBackupTime: string
    autoBackupDay: number
    backupRetentionDays: number
    lastBackupTime: string | null
  }

  interface BackupFile {
    name: string
    path: string
    size: number
    createdAt: string
  }

  const [backupConfig, setBackupConfig] = useState<BackupConfig>({
    autoBackupEnabled: false,
    autoBackupOnClose: false,
    autoBackupFrequency: 'daily',
    autoBackupTime: '23:00',
    autoBackupDay: 0,
    backupRetentionDays: 30,
    lastBackupTime: null
  })
  const [backupList, setBackupList] = useState<BackupFile[]>([])
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [isLoadingBackups, setIsLoadingBackups] = useState(false)
  const [backupDirectory, setBackupDirectory] = useState('')
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false)
  const [selectedBackupForRestore, setSelectedBackupForRestore] = useState<BackupFile | null>(null)

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

  const handleOpenResetDialog = () => {
    setIsResetDialogOpen(true)
    setResetStep('warning')
    setResetConfirmationText('')
    setResetAdminUsername('')
    setResetAdminPassword('')
  }

  // Backup functions
  const loadBackupData = async () => {
    setIsLoadingBackups(true)
    try {
      const [configResult, listResult, dirResult] = await Promise.all([
        window.api.backup.getConfig(),
        window.api.backup.list(),
        window.api.backup.getDirectory()
      ])

      if (configResult.success && configResult.data) {
        setBackupConfig(configResult.data)
      }
      if (listResult.success && listResult.data) {
        setBackupList(listResult.data)
      }
      if (dirResult.success && dirResult.data) {
        setBackupDirectory(dirResult.data)
      }
    } catch (err) {
      console.error('Failed to load backup data:', err)
    } finally {
      setIsLoadingBackups(false)
    }
  }

  const handleCreateBackup = async () => {
    if (!user) return
    setIsBackingUp(true)
    try {
      const result = await window.api.backup.create(user.userId)
      if (result.success) {
        alert(result.message)
        await loadBackupData()
      } else {
        alert(result.message || 'Failed to create backup')
      }
    } catch (err) {
      console.error('Backup creation failed:', err)
      alert('Failed to create backup')
    } finally {
      setIsBackingUp(false)
    }
  }

  const handleExportBackup = async () => {
    if (!user) return
    try {
      const result = await window.api.backup.export(user.userId)
      if (result.success) {
        alert(result.message)
      } else {
        if (result.message !== 'Export cancelled') {
          alert(result.message || 'Failed to export backup')
        }
      }
    } catch (err) {
      console.error('Export failed:', err)
      alert('Failed to export backup')
    }
  }

  const handleImportBackup = async () => {
    if (!user) return
    if (!confirm('Warning: Importing a backup will replace all current data. Are you sure you want to continue?')) {
      return
    }
    setIsRestoring(true)
    try {
      const result = await window.api.backup.import(user.userId)
      if (result.success) {
        alert(result.message + '\n\nThe application will now restart.')
        window.location.reload()
      } else {
        if (result.message !== 'Import cancelled') {
          alert(result.message || 'Failed to import backup')
        }
      }
    } catch (err) {
      console.error('Import failed:', err)
      alert('Failed to import backup')
    } finally {
      setIsRestoring(false)
    }
  }

  const handleRestoreBackup = async (backup: BackupFile) => {
    setSelectedBackupForRestore(backup)
    setIsRestoreDialogOpen(true)
  }

  const confirmRestoreBackup = async () => {
    if (!user || !selectedBackupForRestore) return
    setIsRestoring(true)
    try {
      const result = await window.api.backup.restore(selectedBackupForRestore.path, user.userId)
      if (result.success) {
        alert(result.message + '\n\nThe application will now restart.')
        setIsRestoreDialogOpen(false)
        window.location.reload()
      } else {
        alert(result.message || 'Failed to restore backup')
      }
    } catch (err) {
      console.error('Restore failed:', err)
      alert('Failed to restore backup')
    } finally {
      setIsRestoring(false)
    }
  }

  const handleDeleteBackup = async (backup: BackupFile) => {
    if (!user) return
    if (!confirm(`Are you sure you want to delete this backup?\n\n${backup.name}`)) {
      return
    }
    try {
      const result = await window.api.backup.delete(backup.path, user.userId)
      if (result.success) {
        alert(result.message)
        await loadBackupData()
      } else {
        alert(result.message || 'Failed to delete backup')
      }
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Failed to delete backup')
    }
  }

  const handleUpdateBackupConfig = async (updates: Partial<BackupConfig>) => {
    if (!user) return
    try {
      const newConfig = { ...backupConfig, ...updates }
      const result = await window.api.backup.updateConfig(newConfig, user.userId)
      if (result.success && result.data) {
        setBackupConfig(result.data)
        // Show feedback for important changes
        if ('autoBackupEnabled' in updates) {
          console.log(updates.autoBackupEnabled
            ? 'Scheduled automatic backups enabled'
            : 'Scheduled automatic backups disabled')
        }
        if ('autoBackupOnClose' in updates) {
          console.log(updates.autoBackupOnClose
            ? 'Backup on close enabled'
            : 'Backup on close disabled')
        }
      } else {
        alert(result.message || 'Failed to update backup configuration')
      }
    } catch (err) {
      console.error('Config update failed:', err)
      alert('Failed to update backup configuration')
    }
  }

  const handleCleanOldBackups = async () => {
    if (!confirm(`This will delete all backups older than ${backupConfig.backupRetentionDays} days. Continue?`)) {
      return
    }
    try {
      const result = await window.api.backup.cleanOld(backupConfig.backupRetentionDays)
      if (result.success) {
        alert(result.message)
        await loadBackupData()
      } else {
        alert(result.message || 'Failed to clean old backups')
      }
    } catch (err) {
      console.error('Clean failed:', err)
      alert('Failed to clean old backups')
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString()
  }

  // Load backup data when component mounts
  useEffect(() => {
    if (isAdmin) {
      loadBackupData()
    }
  }, [isAdmin])

  const handleResetDialogNext = () => {
    if (resetStep === 'warning') {
      setResetStep('confirm')
    } else if (resetStep === 'confirm') {
      if (resetConfirmationText === 'RESET') {
        setResetStep('auth')
      } else {
        alert('Please type "RESET" exactly to continue.')
      }
    }
  }

  const handleHardReset = async () => {
    if (!resetAdminUsername || !resetAdminPassword) {
      alert('Please enter admin credentials')
      return
    }

    setIsResetting(true)
    setResetStep('progress')

    try {
      // First verify admin credentials
      const verifyResult = await window.api.database.verifyAdmin(
        resetAdminUsername,
        resetAdminPassword
      )

      if (!verifyResult.success) {
        alert(verifyResult.message || 'Invalid admin credentials')
        setIsResetting(false)
        setResetStep('auth')
        return
      }

      // Proceed with hard reset
      const result = await window.api.database.hardReset(resetConfirmationText)

      if (result.success) {
        alert(result.message + '\n\nThe application will now restart.')
        // Close the dialog
        setIsResetDialogOpen(false)
        // Logout and reload
        await window.api.auth.logout()
        window.location.reload()
      } else {
        alert(result.message || 'Failed to reset database')
        setResetStep('auth')
      }
    } catch (err) {
      console.error('Hard reset error:', err)
      alert('An error occurred during database reset')
      setResetStep('auth')
    } finally {
      setIsResetting(false)
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
          <Tabs defaultValue="business" className="w-full">
            <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 mb-6 h-auto gap-1">
              <TabsTrigger value="business" className="flex items-center gap-1 px-2 py-1.5">
                <Building2 className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">Business</span>
              </TabsTrigger>
              <TabsTrigger value="tax" className="flex items-center gap-1 px-2 py-1.5">
                <DollarSign className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">Tax</span>
              </TabsTrigger>
              <TabsTrigger value="receipt" className="flex items-center gap-1 px-2 py-1.5">
                <Receipt className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">Receipt</span>
              </TabsTrigger>
              <TabsTrigger value="customize" className="flex items-center gap-1 px-2 py-1.5">
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">Customize</span>
              </TabsTrigger>
              <TabsTrigger value="inventory" className="flex items-center gap-1 px-2 py-1.5">
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">Inventory</span>
              </TabsTrigger>
              <TabsTrigger value="sales" className="flex items-center gap-1 px-2 py-1.5">
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">Sales</span>
              </TabsTrigger>
              <TabsTrigger value="hours" className="flex items-center gap-1 px-2 py-1.5">
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">Hours</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-1 px-2 py-1.5">
                <SettingsIcon className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">System</span>
              </TabsTrigger>
              <TabsTrigger value="all" className="flex items-center gap-1 px-2 py-1.5">
                <List className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">All</span>
              </TabsTrigger>
              <TabsTrigger value="danger" className="flex items-center gap-1 px-2 py-1.5 text-destructive">
                <AlertTriangle className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">Danger</span>
              </TabsTrigger>
            </TabsList>

            {/* Business Info Tab */}
            <TabsContent value="business">
              <Card>
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
            </TabsContent>

          {/* Tax & Currency Tab */}
            <TabsContent value="tax">
          <Card>
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
            </TabsContent>

          {/* Receipt/Invoice Tab */}
            <TabsContent value="receipt">
          <Card>
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
            </TabsContent>

          {/* Receipt Customization Tab */}
            <TabsContent value="customize">
          <Card>
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
            </TabsContent>

          {/* Inventory Tab */}
            <TabsContent value="inventory">
          <Card>
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
            </TabsContent>

          {/* Sales & Payment Tab */}
            <TabsContent value="sales">
          <Card>
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
            </TabsContent>

          {/* Working Hours Tab */}
            <TabsContent value="hours">
          <Card>
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
            </TabsContent>

          {/* System Preferences Tab */}
            <TabsContent value="system">
          <div className="space-y-6">
          <Card>
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
              </div>
            </CardContent>
          </Card>

          {/* Backup & Restore Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="w-5 h-5" />
                Backup & Restore
              </CardTitle>
              <CardDescription>
                Create backups, restore from backups, and configure automatic backup settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Actions */}
              <div>
                <h4 className="font-medium mb-3">Quick Actions</h4>
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    onClick={handleCreateBackup}
                    disabled={isBackingUp}
                  >
                    {isBackingUp ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    {isBackingUp ? 'Creating Backup...' : 'Create Backup Now'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleExportBackup}
                  >
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Export to File
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleImportBackup}
                    disabled={isRestoring}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import from File
                  </Button>
                </div>
                {backupConfig.lastBackupTime && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Last backup: {formatDate(backupConfig.lastBackupTime)}
                  </p>
                )}
              </div>

              <Separator />

              {/* Automatic Backup Settings */}
              <div>
                <h4 className="font-medium mb-3">Automatic Backup Settings</h4>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="flex items-center gap-3 col-span-full">
                    <input
                      type="checkbox"
                      id="autoBackupOnClose"
                      checked={backupConfig.autoBackupOnClose}
                      onChange={(e) => handleUpdateBackupConfig({ autoBackupOnClose: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="autoBackupOnClose" className="cursor-pointer">
                      Create backup when application closes
                    </Label>
                  </div>
                  <div className="flex items-center gap-3 col-span-full">
                    <input
                      type="checkbox"
                      id="autoBackupEnabled"
                      checked={backupConfig.autoBackupEnabled}
                      onChange={(e) => handleUpdateBackupConfig({ autoBackupEnabled: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="autoBackupEnabled" className="cursor-pointer">
                      Enable scheduled automatic backups
                    </Label>
                  </div>

                  {backupConfig.autoBackupEnabled && (
                    <>
                      <div>
                        <Label htmlFor="autoBackupFrequency">Backup Frequency</Label>
                        <Select
                          value={backupConfig.autoBackupFrequency}
                          onValueChange={(val: 'daily' | 'weekly' | 'monthly') =>
                            handleUpdateBackupConfig({ autoBackupFrequency: val })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="autoBackupTime">Backup Time</Label>
                        <Input
                          id="autoBackupTime"
                          type="time"
                          value={backupConfig.autoBackupTime}
                          onChange={(e) => handleUpdateBackupConfig({ autoBackupTime: e.target.value })}
                        />
                      </div>
                      {backupConfig.autoBackupFrequency === 'weekly' && (
                        <div>
                          <Label htmlFor="autoBackupDay">Day of Week</Label>
                          <Select
                            value={backupConfig.autoBackupDay.toString()}
                            onValueChange={(val) => handleUpdateBackupConfig({ autoBackupDay: parseInt(val) })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Sunday</SelectItem>
                              <SelectItem value="1">Monday</SelectItem>
                              <SelectItem value="2">Tuesday</SelectItem>
                              <SelectItem value="3">Wednesday</SelectItem>
                              <SelectItem value="4">Thursday</SelectItem>
                              <SelectItem value="5">Friday</SelectItem>
                              <SelectItem value="6">Saturday</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      {backupConfig.autoBackupFrequency === 'monthly' && (
                        <div>
                          <Label htmlFor="autoBackupDayMonth">Day of Month</Label>
                          <Input
                            id="autoBackupDayMonth"
                            type="number"
                            min="1"
                            max="28"
                            value={backupConfig.autoBackupDay}
                            onChange={(e) => handleUpdateBackupConfig({ autoBackupDay: parseInt(e.target.value) || 1 })}
                          />
                        </div>
                      )}
                    </>
                  )}

                  <div>
                    <Label htmlFor="backupRetentionDays">Keep Backups For (Days)</Label>
                    <Input
                      id="backupRetentionDays"
                      type="number"
                      min="1"
                      max="365"
                      value={backupConfig.backupRetentionDays}
                      onChange={(e) => handleUpdateBackupConfig({ backupRetentionDays: parseInt(e.target.value) || 30 })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Existing Backups */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Existing Backups</h4>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={loadBackupData}
                      disabled={isLoadingBackups}
                    >
                      <RefreshCw className={`w-4 h-4 mr-1 ${isLoadingBackups ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCleanOldBackups}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Clean Old
                    </Button>
                  </div>
                </div>
                {backupDirectory && (
                  <p className="text-xs text-muted-foreground mb-2">
                    Backup location: {backupDirectory}
                  </p>
                )}

                {isLoadingBackups ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : backupList.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileArchive className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No backups found</p>
                    <p className="text-sm">Create your first backup using the button above</p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Backup Name</TableHead>
                          <TableHead>Date Created</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {backupList.map((backup) => (
                          <TableRow key={backup.path}>
                            <TableCell className="font-mono text-sm">{backup.name}</TableCell>
                            <TableCell>{formatDate(backup.createdAt)}</TableCell>
                            <TableCell>{formatFileSize(backup.size)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRestoreBackup(backup)}
                                  disabled={isRestoring}
                                >
                                  <Upload className="w-4 h-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteBackup(backup)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          </div>
            </TabsContent>

            {/* All Settings Tab */}
            <TabsContent value="all">
              <Card>
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
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleBranchChange(setting.branchId)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              {setting.branchId !== null && (
                                <Button
                                  type="button"
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
            </TabsContent>

            {/* Danger Zone Tab */}
            <TabsContent value="danger">
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>
                    Dangerous operations that can permanently affect your data. Use with extreme caution.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Hard Reset Database Section */}
                  <div className="border border-destructive rounded-lg p-6 bg-destructive/5">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-destructive/10 rounded-lg">
                        <Database className="w-6 h-6 text-destructive" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-destructive mb-2">
                          Hard Reset Database
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          This will permanently delete all data from the database and return the
                          application to a fresh install state. Only the default admin account
                          (username: admin, password: admin123) will remain.
                        </p>
                        <div className="bg-background border rounded-lg p-4 mb-4">
                          <h4 className="font-medium text-sm mb-2">What will be deleted:</h4>
                          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                            <li>All sales, purchases, expenses, and returns</li>
                            <li>All products, categories, and inventory records</li>
                            <li>All customers, suppliers, and referral persons</li>
                            <li>All user accounts (except the default admin)</li>
                            <li>All branches and business settings</li>
                            <li>All audit logs, commissions, and financial records</li>
                            <li>All cash register sessions and transactions</li>
                            <li>All messages, todos, and chart of accounts</li>
                          </ul>
                        </div>
                        <div className="bg-amber-500/10 border border-amber-500/50 rounded-lg p-4 mb-4">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-sm text-amber-900 dark:text-amber-100 mb-1">
                                Warning: This action cannot be undone!
                              </h4>
                              <p className="text-xs text-amber-800 dark:text-amber-200">
                                All data will be permanently deleted. Make sure you have a backup
                                before proceeding. The application will restart after the reset.
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={handleOpenResetDialog}
                          className="w-full sm:w-auto"
                        >
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Reset Database
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <div className="flex justify-end gap-3 mt-6">
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

      {/* Restore Backup Confirmation Dialog */}
      <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              Confirm Restore
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to restore from this backup?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-amber-500/10 border border-amber-500/50 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm text-amber-900 dark:text-amber-100 mb-1">
                    Warning: This will replace all current data!
                  </h4>
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    A safety backup will be created before restoring. The application will restart after the restore is complete.
                  </p>
                </div>
              </div>
            </div>
            {selectedBackupForRestore && (
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm">
                  <strong>Backup:</strong> {selectedBackupForRestore.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Created: {formatDate(selectedBackupForRestore.createdAt)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Size: {formatFileSize(selectedBackupForRestore.size)}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRestoreDialogOpen(false)
                setSelectedBackupForRestore(null)
              }}
              disabled={isRestoring}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={confirmRestoreBackup}
              disabled={isRestoring}
            >
              {isRestoring ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Restoring...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Restore Backup
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hard Reset Database Dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Hard Reset Database
            </DialogTitle>
            <DialogDescription>
              {resetStep === 'warning' && 'Read the warning carefully before proceeding'}
              {resetStep === 'confirm' && 'Type RESET to confirm this action'}
              {resetStep === 'auth' && 'Enter admin credentials to authorize'}
              {resetStep === 'progress' && 'Resetting database...'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {/* Step 1: Warning */}
            {resetStep === 'warning' && (
              <div className="space-y-4">
                <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
                  <h4 className="font-semibold text-destructive mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    DANGER: This action cannot be undone!
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    This will permanently delete ALL data in the database, including:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-2">
                    <li>All sales, purchases, expenses, and financial records</li>
                    <li>All products, categories, inventory, and stock records</li>
                    <li>All customers, suppliers, and referral persons</li>
                    <li>All user accounts (a new default admin will be created)</li>
                    <li>All branches and business settings</li>
                    <li>All audit logs and system history</li>
                  </ul>
                  <p className="text-sm font-semibold text-destructive mt-3">
                    Only the default admin account (username: admin, password: admin123) will remain.
                  </p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/50 rounded-lg p-4">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Important:</strong> Make sure you have a complete backup before proceeding.
                    The application will restart after the reset is complete.
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Confirmation Text */}
            {resetStep === 'confirm' && (
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm mb-3">
                    To confirm this action, please type <strong className="text-destructive">RESET</strong> in the box below:
                  </p>
                  <Input
                    value={resetConfirmationText}
                    onChange={(e) => setResetConfirmationText(e.target.value)}
                    placeholder="Type RESET here"
                    className="font-mono"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Step 3: Admin Authentication */}
            {resetStep === 'auth' && (
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm mb-4">
                    For security, please enter your admin credentials to authorize this operation:
                  </p>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="reset-username">Admin Username</Label>
                      <Input
                        id="reset-username"
                        value={resetAdminUsername}
                        onChange={(e) => setResetAdminUsername(e.target.value)}
                        placeholder="Enter admin username"
                        autoFocus
                      />
                    </div>
                    <div>
                      <Label htmlFor="reset-password">Admin Password</Label>
                      <Input
                        id="reset-password"
                        type="password"
                        value={resetAdminPassword}
                        onChange={(e) => setResetAdminPassword(e.target.value)}
                        placeholder="Enter admin password"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Progress */}
            {resetStep === 'progress' && (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center py-8">
                  <RefreshCw className="w-12 h-12 text-destructive animate-spin mb-4" />
                  <p className="text-lg font-medium mb-2">Resetting Database...</p>
                  <p className="text-sm text-muted-foreground text-center">
                    Please wait while all data is being deleted. This may take a few moments.
                    <br />
                    Do not close this window.
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            {resetStep !== 'progress' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsResetDialogOpen(false)
                    setResetStep('warning')
                    setResetConfirmationText('')
                    setResetAdminUsername('')
                    setResetAdminPassword('')
                  }}
                  disabled={isResetting}
                >
                  Cancel
                </Button>
                {resetStep === 'warning' && (
                  <Button onClick={handleResetDialogNext}>
                    Continue
                  </Button>
                )}
                {resetStep === 'confirm' && (
                  <Button
                    onClick={handleResetDialogNext}
                    disabled={resetConfirmationText !== 'RESET'}
                  >
                    Next
                  </Button>
                )}
                {resetStep === 'auth' && (
                  <Button
                    variant="destructive"
                    onClick={handleHardReset}
                    disabled={!resetAdminUsername || !resetAdminPassword || isResetting}
                  >
                    {isResetting ? 'Resetting...' : 'Reset Database'}
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
