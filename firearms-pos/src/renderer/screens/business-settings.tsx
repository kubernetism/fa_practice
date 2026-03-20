import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/auth-context'
import { Button } from '../components/ui/button'
import { ImportPreviewDialog } from '../components/import-preview-dialog'
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
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
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

  const handleImportBackup = () => {
    setIsImportDialogOpen(true)
  }

  const handleImportComplete = () => {
    // Refresh backup list after import
    fetchBackups()
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
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-foreground">Access Denied</h2>
          <p className="text-muted-foreground text-sm">
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
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-primary" />
          <p className="text-muted-foreground text-sm">Loading settings...</p>
        </div>
      </div>
    )
  }

  // Show loading spinner when switching between branches
  if (isLoadingSettings && !currentSettings) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-primary" />
          <p className="text-muted-foreground text-sm">Loading settings...</p>
        </div>
      </div>
    )
  }

  const selectedBranchLabel = selectedBranchId === null
    ? 'Global Settings'
    : branches.find(b => b.id === selectedBranchId)?.name ?? 'Unknown Branch'

  return (
    <div className="flex flex-col h-full">
      {/* ── Header Bar ── */}
      <div className="border-t-2 border-amber-500/30 bg-background border-b border-border px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/20 shrink-0">
            <SettingsIcon className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold leading-tight tracking-wide truncate">
              Business Settings
            </h1>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Configure global and branch-specific settings
            </p>
          </div>
        </div>

        {/* Inline branch selector */}
        <div className="flex items-center gap-2 sm:ml-4">
          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
          <Select
            value={selectedBranchId === null ? 'global' : selectedBranchId.toString()}
            onValueChange={(val) => handleBranchChange(val === 'global' ? null : parseInt(val))}
          >
            <SelectTrigger className="h-7 text-xs w-[200px] border-amber-500/20 bg-amber-500/5 focus:ring-amber-500/30">
              <SelectValue placeholder="Select branch or global" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="global">
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
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
          {isLoadingSettings && (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 sm:ml-auto shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/5"
            onClick={() => {
              setDialogMode('clone')
              setIsDialogOpen(true)
            }}
          >
            <Copy className="w-3.5 h-3.5 mr-1.5" />
            Clone
          </Button>
          <Button
            size="sm"
            className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white border-0"
            onClick={() => {
              setDialogMode('create')
              setIsDialogOpen(true)
            }}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            New Settings
          </Button>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="mx-5 mt-3 bg-destructive/10 border border-destructive/40 text-destructive px-3 py-2 rounded-md flex items-center gap-2 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Main Content ── */}
      {currentSettings && (
        <form onSubmit={handleSaveSettings} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-5 pt-4 pb-20">
            <Tabs defaultValue="business" className="w-full">
              {/* ── Tab Navigation ── */}
              <TabsList className="h-8 bg-muted/50 border border-border p-0.5 mb-5 w-full grid grid-cols-5 lg:grid-cols-10 gap-0.5">
                <TabsTrigger
                  value="business"
                  className="h-7 text-[11px] px-2 flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-500 rounded-none"
                >
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden lg:inline">Business</span>
                </TabsTrigger>
                <TabsTrigger
                  value="tax"
                  className="h-7 text-[11px] px-2 flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-500 rounded-none"
                >
                  <DollarSign className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden lg:inline">Tax</span>
                </TabsTrigger>
                <TabsTrigger
                  value="receipt"
                  className="h-7 text-[11px] px-2 flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-500 rounded-none"
                >
                  <Receipt className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden lg:inline">Receipt</span>
                </TabsTrigger>
                <TabsTrigger
                  value="customize"
                  className="h-7 text-[11px] px-2 flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-500 rounded-none"
                >
                  <Printer className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden lg:inline">Customize</span>
                </TabsTrigger>
                <TabsTrigger
                  value="inventory"
                  className="h-7 text-[11px] px-2 flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-500 rounded-none"
                >
                  <Package className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden lg:inline">Inventory</span>
                </TabsTrigger>
                <TabsTrigger
                  value="sales"
                  className="h-7 text-[11px] px-2 flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-500 rounded-none"
                >
                  <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden lg:inline">Sales</span>
                </TabsTrigger>
                <TabsTrigger
                  value="hours"
                  className="h-7 text-[11px] px-2 flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-500 rounded-none"
                >
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden lg:inline">Hours</span>
                </TabsTrigger>
                <TabsTrigger
                  value="system"
                  className="h-7 text-[11px] px-2 flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-500 rounded-none"
                >
                  <SettingsIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden lg:inline">System</span>
                </TabsTrigger>
                <TabsTrigger
                  value="all"
                  className="h-7 text-[11px] px-2 flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-500 rounded-none"
                >
                  <List className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden lg:inline">All</span>
                </TabsTrigger>
                <TabsTrigger
                  value="danger"
                  className="h-7 text-[11px] px-2 flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:text-red-500 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-red-500 rounded-none text-red-500/70"
                >
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden lg:inline">Danger</span>
                </TabsTrigger>
              </TabsList>

              {/* ══════════════════════════════════════
                  BUSINESS INFO TAB
              ══════════════════════════════════════ */}
              <TabsContent value="business">
                <Card className="border-l-2 border-l-amber-500/20 border-border">
                  <CardHeader className="py-3 px-4 border-b border-border">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      Business Information
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Basic business details and contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      <div className="col-span-full">
                        <Label htmlFor="businessName" className="text-xs font-medium mb-1 block">Business Name *</Label>
                        <Input
                          id="businessName"
                          className="h-8 text-sm"
                          value={currentSettings.businessName || ''}
                          onChange={(e) =>
                            setCurrentSettings({ ...currentSettings, businessName: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="businessRegistrationNo" className="text-xs font-medium mb-1 block">Registration Number</Label>
                        <Input
                          id="businessRegistrationNo"
                          className="h-8 text-sm"
                          value={currentSettings.businessRegistrationNo || ''}
                          onChange={(e) =>
                            setCurrentSettings({ ...currentSettings, businessRegistrationNo: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="businessType" className="text-xs font-medium mb-1 block">Business Type</Label>
                        <Select
                          value={currentSettings.businessType || ''}
                          onValueChange={(val) =>
                            setCurrentSettings({ ...currentSettings, businessType: val })
                          }
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {BUSINESS_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="businessPhone" className="text-xs font-medium mb-1 block">Phone</Label>
                        <Input
                          id="businessPhone"
                          className="h-8 text-sm"
                          value={currentSettings.businessPhone || ''}
                          onChange={(e) =>
                            setCurrentSettings({ ...currentSettings, businessPhone: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="businessEmail" className="text-xs font-medium mb-1 block">Email</Label>
                        <Input
                          id="businessEmail"
                          type="email"
                          className="h-8 text-sm"
                          value={currentSettings.businessEmail || ''}
                          onChange={(e) =>
                            setCurrentSettings({ ...currentSettings, businessEmail: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="businessWebsite" className="text-xs font-medium mb-1 block">Website</Label>
                        <Input
                          id="businessWebsite"
                          className="h-8 text-sm"
                          value={currentSettings.businessWebsite || ''}
                          onChange={(e) =>
                            setCurrentSettings({ ...currentSettings, businessWebsite: e.target.value })
                          }
                        />
                      </div>
                      <div className="col-span-full">
                        <Label htmlFor="businessAddress" className="text-xs font-medium mb-1 block">Address</Label>
                        <Textarea
                          id="businessAddress"
                          className="text-sm resize-none"
                          rows={2}
                          value={currentSettings.businessAddress || ''}
                          onChange={(e) =>
                            setCurrentSettings({ ...currentSettings, businessAddress: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="businessCity" className="text-xs font-medium mb-1 block">City</Label>
                        <Input
                          id="businessCity"
                          className="h-8 text-sm"
                          value={currentSettings.businessCity || ''}
                          onChange={(e) =>
                            setCurrentSettings({ ...currentSettings, businessCity: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="businessState" className="text-xs font-medium mb-1 block">State / Province</Label>
                        <Input
                          id="businessState"
                          className="h-8 text-sm"
                          value={currentSettings.businessState || ''}
                          onChange={(e) =>
                            setCurrentSettings({ ...currentSettings, businessState: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="businessCountry" className="text-xs font-medium mb-1 block">Country</Label>
                        <Input
                          id="businessCountry"
                          className="h-8 text-sm"
                          value={currentSettings.businessCountry || ''}
                          onChange={(e) =>
                            setCurrentSettings({ ...currentSettings, businessCountry: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ══════════════════════════════════════
                  TAX & CURRENCY TAB
              ══════════════════════════════════════ */}
              <TabsContent value="tax">
                <Card className="border-l-2 border-l-amber-500/20 border-border">
                  <CardHeader className="py-3 px-4 border-b border-border">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-primary" />
                      Tax & Currency Configuration
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Configure tax rates and currency formatting
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <Label htmlFor="taxName" className="text-xs font-medium mb-1 block">Tax Name</Label>
                        <Input
                          id="taxName"
                          className="h-8 text-sm"
                          value={currentSettings.taxName || 'GST'}
                          onChange={(e) =>
                            setCurrentSettings({ ...currentSettings, taxName: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="taxRate" className="text-xs font-medium mb-1 block">Tax Rate (%)</Label>
                        <Input
                          id="taxRate"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          className="h-8 text-sm"
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
                        <Label htmlFor="taxId" className="text-xs font-medium mb-1 block">Tax ID / EIN</Label>
                        <Input
                          id="taxId"
                          className="h-8 text-sm"
                          value={currentSettings.taxId || ''}
                          onChange={(e) =>
                            setCurrentSettings({ ...currentSettings, taxId: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="currencyCode" className="text-xs font-medium mb-1 block">Currency Code</Label>
                        <Input
                          id="currencyCode"
                          className="h-8 text-sm"
                          value={currentSettings.currencyCode || 'PKR'}
                          onChange={(e) =>
                            setCurrentSettings({ ...currentSettings, currencyCode: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="currencySymbol" className="text-xs font-medium mb-1 block">Currency Symbol</Label>
                        <Input
                          id="currencySymbol"
                          className="h-8 text-sm"
                          value={currentSettings.currencySymbol || 'Rs.'}
                          onChange={(e) =>
                            setCurrentSettings({ ...currentSettings, currencySymbol: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="currencyPosition" className="text-xs font-medium mb-1 block">Symbol Position</Label>
                        <Select
                          value={currentSettings.currencyPosition || 'prefix'}
                          onValueChange={(val) =>
                            setCurrentSettings({ ...currentSettings, currencyPosition: val })
                          }
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="prefix">Prefix (e.g., Rs.100)</SelectItem>
                            <SelectItem value="suffix">Suffix (e.g., 100 Rs.)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="decimalPlaces" className="text-xs font-medium mb-1 block">Decimal Places</Label>
                        <Input
                          id="decimalPlaces"
                          type="number"
                          min="0"
                          max="4"
                          className="h-8 text-sm"
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

              {/* ══════════════════════════════════════
                  RECEIPT / INVOICE TAB
              ══════════════════════════════════════ */}
              <TabsContent value="receipt">
                <Card className="border-l-2 border-l-amber-500/20 border-border">
                  <CardHeader className="py-3 px-4 border-b border-border">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-primary" />
                      Receipt & Invoice Settings
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Configure receipt and invoice formatting
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <Label htmlFor="invoicePrefix" className="text-xs font-medium mb-1 block">Invoice Prefix</Label>
                        <Input
                          id="invoicePrefix"
                          className="h-8 text-sm"
                          value={currentSettings.invoicePrefix || 'INV'}
                          onChange={(e) =>
                            setCurrentSettings({ ...currentSettings, invoicePrefix: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="invoiceNumberFormat" className="text-xs font-medium mb-1 block">Number Format</Label>
                        <Select
                          value={currentSettings.invoiceNumberFormat || 'sequential'}
                          onValueChange={(val) =>
                            setCurrentSettings({ ...currentSettings, invoiceNumberFormat: val })
                          }
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sequential">Sequential (0001)</SelectItem>
                            <SelectItem value="date-based">Date-based (202401010001)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="invoiceStartingNumber" className="text-xs font-medium mb-1 block">Starting Number</Label>
                        <Input
                          id="invoiceStartingNumber"
                          type="number"
                          min="1"
                          className="h-8 text-sm"
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
                        <Label htmlFor="receiptHeader" className="text-xs font-medium mb-1 block">Receipt Header</Label>
                        <Textarea
                          id="receiptHeader"
                          className="text-sm resize-none"
                          rows={2}
                          value={currentSettings.receiptHeader || ''}
                          onChange={(e) =>
                            setCurrentSettings({ ...currentSettings, receiptHeader: e.target.value })
                          }
                          placeholder="Header text shown at the top of receipts"
                        />
                      </div>
                      <div className="col-span-full">
                        <Label htmlFor="receiptFooter" className="text-xs font-medium mb-1 block">Receipt Footer</Label>
                        <Textarea
                          id="receiptFooter"
                          className="text-sm resize-none"
                          rows={2}
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

              {/* ══════════════════════════════════════
                  RECEIPT CUSTOMIZATION TAB
              ══════════════════════════════════════ */}
              <TabsContent value="customize">
                <Card className="border-l-2 border-l-amber-500/20 border-border">
                  <CardHeader className="py-3 px-4 border-b border-border">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Printer className="w-4 h-4 text-primary" />
                      Receipt Customization
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Configure receipt appearance and auto-generation settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <Label htmlFor="receiptFormat" className="text-xs font-medium mb-1 block">Receipt Format</Label>
                        <Select
                          value={currentSettings.receiptFormat || 'pdf'}
                          onValueChange={(val) =>
                            setCurrentSettings({ ...currentSettings, receiptFormat: val })
                          }
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pdf">PDF (A4/Letter)</SelectItem>
                            <SelectItem value="thermal">Thermal (80mm)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="receiptPrimaryColor" className="text-xs font-medium mb-1 block">Primary Color</Label>
                        <div className="flex gap-2">
                          <Input
                            id="receiptPrimaryColor"
                            type="color"
                            value={currentSettings.receiptPrimaryColor || '#1e40af'}
                            onChange={(e) =>
                              setCurrentSettings({ ...currentSettings, receiptPrimaryColor: e.target.value })
                            }
                            className="w-10 h-8 p-1 cursor-pointer"
                          />
                          <Input
                            value={currentSettings.receiptPrimaryColor || '#1e40af'}
                            onChange={(e) =>
                              setCurrentSettings({ ...currentSettings, receiptPrimaryColor: e.target.value })
                            }
                            placeholder="#1e40af"
                            className="flex-1 h-8 text-sm font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="receiptSecondaryColor" className="text-xs font-medium mb-1 block">Secondary Color</Label>
                        <div className="flex gap-2">
                          <Input
                            id="receiptSecondaryColor"
                            type="color"
                            value={currentSettings.receiptSecondaryColor || '#64748b'}
                            onChange={(e) =>
                              setCurrentSettings({ ...currentSettings, receiptSecondaryColor: e.target.value })
                            }
                            className="w-10 h-8 p-1 cursor-pointer"
                          />
                          <Input
                            value={currentSettings.receiptSecondaryColor || '#64748b'}
                            onChange={(e) =>
                              setCurrentSettings({ ...currentSettings, receiptSecondaryColor: e.target.value })
                            }
                            placeholder="#64748b"
                            className="flex-1 h-8 text-sm font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="receiptFontSize" className="text-xs font-medium mb-1 block">Font Size</Label>
                        <Select
                          value={currentSettings.receiptFontSize || 'medium'}
                          onValueChange={(val) =>
                            setCurrentSettings({ ...currentSettings, receiptFontSize: val })
                          }
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2 pt-5">
                        <input
                          type="checkbox"
                          id="receiptAutoDownload"
                          checked={currentSettings.receiptAutoDownload !== false}
                          onChange={(e) =>
                            setCurrentSettings({ ...currentSettings, receiptAutoDownload: e.target.checked })
                          }
                          className="h-4 w-4 rounded border-gray-300 accent-amber-500"
                        />
                        <Label htmlFor="receiptAutoDownload" className="text-xs cursor-pointer">Auto-download receipt after sale</Label>
                      </div>
                      <div className="flex items-center gap-2 pt-5">
                        <input
                          type="checkbox"
                          id="receiptShowBusinessLogo"
                          checked={currentSettings.receiptShowBusinessLogo !== false}
                          onChange={(e) =>
                            setCurrentSettings({ ...currentSettings, receiptShowBusinessLogo: e.target.checked })
                          }
                          className="h-4 w-4 rounded border-gray-300 accent-amber-500"
                        />
                        <Label htmlFor="receiptShowBusinessLogo" className="text-xs cursor-pointer">Show business logo on receipt</Label>
                      </div>
                    </div>

                    {/* Custom Fields */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2">Custom Fields</span>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                      <div className="grid gap-3 md:grid-cols-3">
                        <div>
                          <Label htmlFor="receiptCustomField1Label" className="text-xs font-medium mb-1 block">Field 1 Label</Label>
                          <Input
                            id="receiptCustomField1Label"
                            className="h-8 text-sm"
                            value={currentSettings.receiptCustomField1Label || ''}
                            onChange={(e) =>
                              setCurrentSettings({ ...currentSettings, receiptCustomField1Label: e.target.value })
                            }
                            placeholder="e.g., License Number"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="receiptCustomField1Value" className="text-xs font-medium mb-1 block">Field 1 Value</Label>
                          <Input
                            id="receiptCustomField1Value"
                            className="h-8 text-sm"
                            value={currentSettings.receiptCustomField1Value || ''}
                            onChange={(e) =>
                              setCurrentSettings({ ...currentSettings, receiptCustomField1Value: e.target.value })
                            }
                            placeholder="e.g., FFL-12345678"
                          />
                        </div>
                        <div>
                          <Label htmlFor="receiptCustomField2Label" className="text-xs font-medium mb-1 block">Field 2 Label</Label>
                          <Input
                            id="receiptCustomField2Label"
                            className="h-8 text-sm"
                            value={currentSettings.receiptCustomField2Label || ''}
                            onChange={(e) =>
                              setCurrentSettings({ ...currentSettings, receiptCustomField2Label: e.target.value })
                            }
                            placeholder="e.g., Store Hours"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="receiptCustomField2Value" className="text-xs font-medium mb-1 block">Field 2 Value</Label>
                          <Input
                            id="receiptCustomField2Value"
                            className="h-8 text-sm"
                            value={currentSettings.receiptCustomField2Value || ''}
                            onChange={(e) =>
                              setCurrentSettings({ ...currentSettings, receiptCustomField2Value: e.target.value })
                            }
                            placeholder="e.g., Mon-Sat 9AM-6PM"
                          />
                        </div>
                        <div>
                          <Label htmlFor="receiptCustomField3Label" className="text-xs font-medium mb-1 block">Field 3 Label</Label>
                          <Input
                            id="receiptCustomField3Label"
                            className="h-8 text-sm"
                            value={currentSettings.receiptCustomField3Label || ''}
                            onChange={(e) =>
                              setCurrentSettings({ ...currentSettings, receiptCustomField3Label: e.target.value })
                            }
                            placeholder="e.g., Return Policy"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="receiptCustomField3Value" className="text-xs font-medium mb-1 block">Field 3 Value</Label>
                          <Input
                            id="receiptCustomField3Value"
                            className="h-8 text-sm"
                            value={currentSettings.receiptCustomField3Value || ''}
                            onChange={(e) =>
                              setCurrentSettings({ ...currentSettings, receiptCustomField3Value: e.target.value })
                            }
                            placeholder="e.g., 30 days with receipt"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2">Terms &amp; Conditions</span>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                      <Textarea
                        id="receiptTermsAndConditions"
                        className="text-sm resize-none"
                        value={currentSettings.receiptTermsAndConditions || ''}
                        onChange={(e) =>
                          setCurrentSettings({ ...currentSettings, receiptTermsAndConditions: e.target.value })
                        }
                        placeholder="Return policy, warranty information, legal disclaimers, etc."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ══════════════════════════════════════
                  INVENTORY TAB
              ══════════════════════════════════════ */}
              <TabsContent value="inventory">
                <Card className="border-l-2 border-l-amber-500/20 border-border">
                  <CardHeader className="py-3 px-4 border-b border-border">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Package className="w-4 h-4 text-primary" />
                      Inventory Management
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Configure inventory tracking and stock management
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <Label htmlFor="lowStockThreshold" className="text-xs font-medium mb-1 block">Low Stock Threshold</Label>
                        <Input
                          id="lowStockThreshold"
                          type="number"
                          min="0"
                          className="h-8 text-sm"
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
                        <Label htmlFor="stockValuationMethod" className="text-xs font-medium mb-1 block">Valuation Method</Label>
                        <Select
                          value={currentSettings.stockValuationMethod || 'FIFO'}
                          onValueChange={(val) =>
                            setCurrentSettings({ ...currentSettings, stockValuationMethod: val })
                          }
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STOCK_VALUATION_METHODS.map((method) => (
                              <SelectItem key={method} value={method}>{method}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="autoReorderQuantity" className="text-xs font-medium mb-1 block">Auto Reorder Quantity</Label>
                        <Input
                          id="autoReorderQuantity"
                          type="number"
                          min="0"
                          className="h-8 text-sm"
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

              {/* ══════════════════════════════════════
                  SALES & PAYMENT TAB
              ══════════════════════════════════════ */}
              <TabsContent value="sales">
                <Card className="border-l-2 border-l-amber-500/20 border-border">
                  <CardHeader className="py-3 px-4 border-b border-border">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-primary" />
                      Sales & Payment Settings
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Configure sales, payment methods, and discounts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <Label htmlFor="defaultPaymentMethod" className="text-xs font-medium mb-1 block">Default Payment Method</Label>
                        <Input
                          id="defaultPaymentMethod"
                          className="h-8 text-sm"
                          value={currentSettings.defaultPaymentMethod || 'Cash'}
                          onChange={(e) =>
                            setCurrentSettings({ ...currentSettings, defaultPaymentMethod: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="allowedPaymentMethods" className="text-xs font-medium mb-1 block">Allowed Payment Methods</Label>
                        <Input
                          id="allowedPaymentMethods"
                          className="h-8 text-sm"
                          value={currentSettings.allowedPaymentMethods || 'Cash,Card,Bank Transfer,COD'}
                          onChange={(e) =>
                            setCurrentSettings({ ...currentSettings, allowedPaymentMethods: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxDiscountPercentage" className="text-xs font-medium mb-1 block">Max Discount (%)</Label>
                        <Input
                          id="maxDiscountPercentage"
                          type="number"
                          min="0"
                          max="100"
                          className="h-8 text-sm"
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
                        <Label htmlFor="openingCashBalance" className="text-xs font-medium mb-1 block">Opening Cash Balance</Label>
                        <Input
                          id="openingCashBalance"
                          type="number"
                          min="0"
                          step="0.01"
                          className="h-8 text-sm"
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

              {/* ══════════════════════════════════════
                  WORKING HOURS TAB
              ══════════════════════════════════════ */}
              <TabsContent value="hours">
                <Card className="border-l-2 border-l-amber-500/20 border-border">
                  <CardHeader className="py-3 px-4 border-b border-border">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      Working Hours
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Configure operating hours for this business / branch
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <Label htmlFor="workingDaysStart" className="text-xs font-medium mb-1 block">Week Starts</Label>
                        <Select
                          value={currentSettings.workingDaysStart || 'Monday'}
                          onValueChange={(val) =>
                            setCurrentSettings({ ...currentSettings, workingDaysStart: val })
                          }
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DAYS_OF_WEEK.map((day) => (
                              <SelectItem key={day} value={day}>{day}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="workingDaysEnd" className="text-xs font-medium mb-1 block">Week Ends</Label>
                        <Select
                          value={currentSettings.workingDaysEnd || 'Saturday'}
                          onValueChange={(val) =>
                            setCurrentSettings({ ...currentSettings, workingDaysEnd: val })
                          }
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DAYS_OF_WEEK.map((day) => (
                              <SelectItem key={day} value={day}>{day}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="openingTime" className="text-xs font-medium mb-1 block">Opening Time</Label>
                        <Input
                          id="openingTime"
                          type="time"
                          className="h-8 text-sm"
                          value={currentSettings.openingTime || '09:00'}
                          onChange={(e) =>
                            setCurrentSettings({ ...currentSettings, openingTime: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="closingTime" className="text-xs font-medium mb-1 block">Closing Time</Label>
                        <Input
                          id="closingTime"
                          type="time"
                          className="h-8 text-sm"
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

              {/* ══════════════════════════════════════
                  SYSTEM PREFERENCES TAB
              ══════════════════════════════════════ */}
              <TabsContent value="system">
                <div className="space-y-4">
                  {/* System Prefs */}
                  <Card className="border-l-2 border-l-amber-500/20 border-border">
                    <CardHeader className="py-3 px-4 border-b border-border">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <SettingsIcon className="w-4 h-4 text-primary" />
                        System Preferences
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Configure date, time, language, and locale settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <Label htmlFor="dateFormat" className="text-xs font-medium mb-1 block">Date Format</Label>
                          <Select
                            value={currentSettings.dateFormat || 'DD/MM/YYYY'}
                            onValueChange={(val) =>
                              setCurrentSettings({ ...currentSettings, dateFormat: val })
                            }
                          >
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DATE_FORMATS.map((format) => (
                                <SelectItem key={format} value={format}>{format}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="timeFormat" className="text-xs font-medium mb-1 block">Time Format</Label>
                          <Select
                            value={currentSettings.timeFormat || '24-hour'}
                            onValueChange={(val) =>
                              setCurrentSettings({ ...currentSettings, timeFormat: val })
                            }
                          >
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TIME_FORMATS.map((format) => (
                                <SelectItem key={format} value={format}>{format}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="timezone" className="text-xs font-medium mb-1 block">Timezone</Label>
                          <Select
                            value={currentSettings.timezone || 'UTC'}
                            onValueChange={(val) =>
                              setCurrentSettings({ ...currentSettings, timezone: val })
                            }
                          >
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TIMEZONES.map((tz) => (
                                <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="language" className="text-xs font-medium mb-1 block">Language</Label>
                          <Input
                            id="language"
                            className="h-8 text-sm"
                            value={currentSettings.language || 'en'}
                            onChange={(e) =>
                              setCurrentSettings({ ...currentSettings, language: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Backup & Restore */}
                  <Card className="border-l-2 border-l-amber-500/20 border-border">
                    <CardHeader className="py-3 px-4 border-b border-border">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-primary" />
                        Backup & Restore
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Create backups, restore from backups, and configure automatic backup settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      {/* Quick Actions */}
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Quick Actions</p>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white border-0"
                            onClick={handleCreateBackup}
                            disabled={isBackingUp}
                          >
                            {isBackingUp ? (
                              <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                            ) : (
                              <Download className="w-3.5 h-3.5 mr-1.5" />
                            )}
                            {isBackingUp ? 'Creating...' : 'Create Backup'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={handleExportBackup}
                          >
                            <FolderOpen className="w-3.5 h-3.5 mr-1.5" />
                            Export to File
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={handleImportBackup}
                          >
                            <Upload className="w-3.5 h-3.5 mr-1.5" />
                            Import Data
                          </Button>
                        </div>
                        {backupConfig.lastBackupTime && (
                          <p className="text-[11px] text-muted-foreground mt-2">
                            Last backup: {formatDate(backupConfig.lastBackupTime)}
                          </p>
                        )}
                      </div>

                      <Separator />

                      {/* Automatic Backup Settings */}
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Automatic Backup</p>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                          <div className="flex items-center gap-2 col-span-full">
                            <input
                              type="checkbox"
                              id="autoBackupOnClose"
                              checked={backupConfig.autoBackupOnClose}
                              onChange={(e) => handleUpdateBackupConfig({ autoBackupOnClose: e.target.checked })}
                              className="h-4 w-4 rounded border-gray-300 accent-amber-500"
                            />
                            <Label htmlFor="autoBackupOnClose" className="text-xs cursor-pointer">
                              Create backup when application closes
                            </Label>
                          </div>
                          <div className="flex items-center gap-2 col-span-full">
                            <input
                              type="checkbox"
                              id="autoBackupEnabled"
                              checked={backupConfig.autoBackupEnabled}
                              onChange={(e) => handleUpdateBackupConfig({ autoBackupEnabled: e.target.checked })}
                              className="h-4 w-4 rounded border-gray-300 accent-amber-500"
                            />
                            <Label htmlFor="autoBackupEnabled" className="text-xs cursor-pointer">
                              Enable scheduled automatic backups
                            </Label>
                          </div>

                          {backupConfig.autoBackupEnabled && (
                            <>
                              <div>
                                <Label htmlFor="autoBackupFrequency" className="text-xs font-medium mb-1 block">Backup Frequency</Label>
                                <Select
                                  value={backupConfig.autoBackupFrequency}
                                  onValueChange={(val: 'daily' | 'weekly' | 'monthly') =>
                                    handleUpdateBackupConfig({ autoBackupFrequency: val })
                                  }
                                >
                                  <SelectTrigger className="h-8 text-sm">
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
                                <Label htmlFor="autoBackupTime" className="text-xs font-medium mb-1 block">Backup Time</Label>
                                <Input
                                  id="autoBackupTime"
                                  type="time"
                                  className="h-8 text-sm"
                                  value={backupConfig.autoBackupTime}
                                  onChange={(e) => handleUpdateBackupConfig({ autoBackupTime: e.target.value })}
                                />
                              </div>
                              {backupConfig.autoBackupFrequency === 'weekly' && (
                                <div>
                                  <Label htmlFor="autoBackupDay" className="text-xs font-medium mb-1 block">Day of Week</Label>
                                  <Select
                                    value={backupConfig.autoBackupDay.toString()}
                                    onValueChange={(val) => handleUpdateBackupConfig({ autoBackupDay: parseInt(val) })}
                                  >
                                    <SelectTrigger className="h-8 text-sm">
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
                                  <Label htmlFor="autoBackupDayMonth" className="text-xs font-medium mb-1 block">Day of Month</Label>
                                  <Input
                                    id="autoBackupDayMonth"
                                    type="number"
                                    min="1"
                                    max="28"
                                    className="h-8 text-sm"
                                    value={backupConfig.autoBackupDay}
                                    onChange={(e) => handleUpdateBackupConfig({ autoBackupDay: parseInt(e.target.value) || 1 })}
                                  />
                                </div>
                              )}
                            </>
                          )}

                          <div>
                            <Label htmlFor="backupRetentionDays" className="text-xs font-medium mb-1 block">Keep Backups For (Days)</Label>
                            <Input
                              id="backupRetentionDays"
                              type="number"
                              min="1"
                              max="365"
                              className="h-8 text-sm"
                              value={backupConfig.backupRetentionDays}
                              onChange={(e) => handleUpdateBackupConfig({ backupRetentionDays: parseInt(e.target.value) || 30 })}
                            />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Existing Backups */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Existing Backups</p>
                          <div className="flex gap-1.5">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={loadBackupData}
                              disabled={isLoadingBackups}
                            >
                              <RefreshCw className={`w-3 h-3 mr-1 ${isLoadingBackups ? 'animate-spin' : ''}`} />
                              Refresh
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={handleCleanOldBackups}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Clean Old
                            </Button>
                          </div>
                        </div>
                        {backupDirectory && (
                          <p className="text-[11px] text-muted-foreground mb-2 font-mono truncate">
                            {backupDirectory}
                          </p>
                        )}

                        {isLoadingBackups ? (
                          <div className="flex items-center justify-center py-6">
                            <RefreshCw className="w-5 h-5 animate-spin text-primary" />
                          </div>
                        ) : backupList.length === 0 ? (
                          <div className="text-center py-6 text-muted-foreground border border-dashed border-border rounded-lg">
                            <FileArchive className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p className="text-xs font-medium">No backups found</p>
                            <p className="text-[11px] text-muted-foreground">Create your first backup using the button above</p>
                          </div>
                        ) : (
                          <div className="border border-border rounded-md overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-muted/40">
                                  <TableHead className="text-xs py-2 h-auto">Backup Name</TableHead>
                                  <TableHead className="text-xs py-2 h-auto">Created</TableHead>
                                  <TableHead className="text-xs py-2 h-auto">Size</TableHead>
                                  <TableHead className="text-xs py-2 h-auto text-right w-20">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {backupList.map((backup) => (
                                  <TableRow key={backup.path} className="hover:bg-amber-500/5">
                                    <TableCell className="py-1.5 font-mono text-xs">{backup.name}</TableCell>
                                    <TableCell className="py-1.5 text-xs text-muted-foreground">{formatDate(backup.createdAt)}</TableCell>
                                    <TableCell className="py-1.5 text-xs text-muted-foreground">{formatFileSize(backup.size)}</TableCell>
                                    <TableCell className="py-1.5 text-right">
                                      <div className="flex justify-end gap-1">
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0 hover:text-primary"
                                          onClick={() => handleRestoreBackup(backup)}
                                          disabled={isRestoring}
                                          title="Restore this backup"
                                        >
                                          <Upload className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0 hover:text-destructive"
                                          onClick={() => handleDeleteBackup(backup)}
                                          title="Delete this backup"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
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

              {/* ══════════════════════════════════════
                  ALL SETTINGS TAB
              ══════════════════════════════════════ */}
              <TabsContent value="all">
                <Card className="border-l-2 border-l-amber-500/20 border-border">
                  <CardHeader className="py-3 px-4 border-b border-border">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <List className="w-4 h-4 text-primary" />
                      All Business Settings
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Overview of all business configurations across branches
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40">
                          <TableHead className="text-xs py-2 h-auto pl-4">Business Name</TableHead>
                          <TableHead className="text-xs py-2 h-auto">Branch</TableHead>
                          <TableHead className="text-xs py-2 h-auto">Currency</TableHead>
                          <TableHead className="text-xs py-2 h-auto">Tax Rate</TableHead>
                          <TableHead className="text-xs py-2 h-auto">Status</TableHead>
                          <TableHead className="text-xs py-2 h-auto text-right pr-4">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allSettings.map((setting) => (
                          <TableRow
                            key={setting.settingId}
                            className={`hover:bg-amber-500/5 ${setting.branchId === selectedBranchId ? 'bg-amber-500/10' : ''}`}
                          >
                            <TableCell className="py-2 text-xs font-medium pl-4">{setting.businessName || '—'}</TableCell>
                            <TableCell className="py-2 text-xs">
                              {setting.branchId === null ? (
                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-amber-500/40 text-amber-600">
                                  <Globe className="w-3 h-3 mr-1" />
                                  Global
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">{setting.branch?.name || `Branch ${setting.branchId}`}</span>
                              )}
                            </TableCell>
                            <TableCell className="py-2 text-xs text-muted-foreground">
                              {setting.currencySymbol} ({setting.currencyCode})
                            </TableCell>
                            <TableCell className="py-2 text-xs text-muted-foreground">{setting.taxRate}%</TableCell>
                            <TableCell className="py-2 text-xs">
                              <Badge
                                variant={setting.isActive ? 'default' : 'destructive'}
                                className="text-[10px] h-5 px-1.5"
                              >
                                {setting.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-2 text-right pr-4">
                              <div className="flex justify-end gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:text-primary"
                                  onClick={() => handleBranchChange(setting.branchId)}
                                  title="Edit this settings"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                {setting.branchId !== null && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 hover:text-destructive"
                                    onClick={() => handleDeleteSettings(setting.settingId)}
                                    title="Delete this settings"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {allSettings.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-8">
                              No business settings configured yet. Create global settings first.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ══════════════════════════════════════
                  DANGER ZONE TAB
              ══════════════════════════════════════ */}
              <TabsContent value="danger">
                <Card className="border border-red-800/40 bg-red-950/10">
                  <CardHeader className="py-3 px-4 border-b border-red-800/30 bg-red-950/20">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-red-400">
                      <AlertTriangle className="w-4 h-4" />
                      Danger Zone
                    </CardTitle>
                    <CardDescription className="text-xs text-red-400/70">
                      Dangerous operations that can permanently affect your data. Use with extreme caution.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    {/* Hard Reset Database Section */}
                    <div className="border border-red-700/40 rounded-lg p-5 bg-red-950/20">
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg shrink-0">
                          <Database className="w-5 h-5 text-red-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-red-400 mb-1">
                            Hard Reset Database
                          </h3>
                          <p className="text-xs text-muted-foreground mb-4">
                            This will permanently delete all data from the database and return the
                            application to a fresh install state. Only the default admin account
                            (username: admin, password: admin123) will remain.
                          </p>

                          <div className="bg-background/40 border border-border rounded-md p-3 mb-3">
                            <h4 className="text-xs font-semibold mb-2 text-foreground">What will be deleted:</h4>
                            <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside">
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

                          <div className="bg-amber-500/10 border border-amber-500/40 rounded-md p-3 mb-4">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs font-semibold text-primary mb-0.5">
                                  Warning: This action cannot be undone!
                                </p>
                                <p className="text-[11px] text-amber-400/80">
                                  All data will be permanently deleted. Make sure you have a backup
                                  before proceeding. The application will restart after the reset.
                                </p>
                              </div>
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="h-8 text-xs bg-red-700 hover:bg-red-800"
                            onClick={handleOpenResetDialog}
                          >
                            <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                            Reset Database
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* ── Sticky Save Bar ── */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-background/80 backdrop-blur-sm px-5 py-2.5 flex justify-end gap-2 z-10">
            <div className="flex-1 flex items-center">
              <span className="text-[11px] text-muted-foreground">
                Editing: <span className="text-primary font-medium">{selectedBranchLabel}</span>
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={fetchData}
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Reset
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white border-0"
              disabled={isSaving}
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      )}

      {/* ══════════════════════════════════════
          CLONE / CREATE DIALOG
      ══════════════════════════════════════ */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="border-amber-500/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              {dialogMode === 'clone' ? (
                <><Copy className="w-4 h-4 text-primary" /> Clone Settings</>
              ) : (
                <><Plus className="w-4 h-4 text-primary" /> Create New Settings</>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {dialogMode === 'clone'
                ? 'Select source and target branches to clone settings'
                : 'Create new business settings for a branch'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            {dialogMode === 'clone' ? (
              <>
                <div>
                  <Label className="text-xs font-medium mb-1 block">Source Settings</Label>
                  <Select
                    value={cloneSourceBranchId === null ? 'global' : cloneSourceBranchId.toString()}
                    onValueChange={(val) =>
                      setCloneSourceBranchId(val === 'global' ? null : parseInt(val))
                    }
                  >
                    <SelectTrigger className="h-8 text-sm">
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
                  <Label className="text-xs font-medium mb-1 block">Target Branch</Label>
                  <Select value={cloneTargetBranchId} onValueChange={setCloneTargetBranchId}>
                    <SelectTrigger className="h-8 text-sm">
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
                  {branches.filter((b) => !allSettings.some((s) => s.branchId === b.id)).length === 0 && (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      All branches already have settings. Update existing settings instead.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div>
                <Label className="text-xs font-medium mb-1 block">Select Branch</Label>
                <Select value={createBranchId} onValueChange={setCreateBranchId}>
                  <SelectTrigger className="h-8 text-sm">
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
                {branches.filter((b) => !allSettings.some((s) => s.branchId === b.id)).length === 0 && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    All branches already have settings. Update existing settings instead.
                  </p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white border-0"
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

      {/* ══════════════════════════════════════
          RESTORE BACKUP CONFIRMATION DIALOG
      ══════════════════════════════════════ */}
      <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <DialogContent className="border-amber-500/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm text-primary">
              <AlertTriangle className="w-4 h-4" />
              Confirm Restore
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to restore from this backup?
            </DialogDescription>
          </DialogHeader>
          <div className="py-3 space-y-3">
            <div className="bg-amber-500/10 border border-amber-500/40 rounded-md p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-primary mb-0.5">
                    Warning: This will replace all current data!
                  </p>
                  <p className="text-[11px] text-amber-400/80">
                    A safety backup will be created before restoring. The application will restart after the restore is complete.
                  </p>
                </div>
              </div>
            </div>
            {selectedBackupForRestore && (
              <div className="bg-muted/50 border border-border rounded-md p-3">
                <p className="text-xs font-medium mb-1">{selectedBackupForRestore.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  Created: {formatDate(selectedBackupForRestore.createdAt)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Size: {formatFileSize(selectedBackupForRestore.size)}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                setIsRestoreDialogOpen(false)
                setSelectedBackupForRestore(null)
              }}
              disabled={isRestoring}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white border-0"
              onClick={confirmRestoreBackup}
              disabled={isRestoring}
            >
              {isRestoring ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Restoring...
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  Restore Backup
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════
          IMPORT PREVIEW DIALOG
      ══════════════════════════════════════ */}
      <ImportPreviewDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImportComplete={handleImportComplete}
      />

      {/* ══════════════════════════════════════
          HARD RESET DATABASE DIALOG
      ══════════════════════════════════════ */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="max-w-lg border-red-700/40">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm text-red-400">
              <AlertTriangle className="w-4 h-4" />
              Hard Reset Database
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {resetStep === 'warning' && 'Read the warning carefully before proceeding'}
              {resetStep === 'confirm' && 'Type RESET to confirm this action'}
              {resetStep === 'auth' && 'Enter admin credentials to authorize'}
              {resetStep === 'progress' && 'Resetting database...'}
            </DialogDescription>
          </DialogHeader>

          {/* Step indicator */}
          <div className="flex items-center gap-1 px-1">
            {(['warning', 'confirm', 'auth', 'progress'] as const).map((step, i) => (
              <div key={step} className="flex items-center gap-1">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
                  ${resetStep === step ? 'bg-red-600 text-white' :
                    ['warning', 'confirm', 'auth', 'progress'].indexOf(resetStep) > i
                      ? 'bg-red-900/50 text-red-400'
                      : 'bg-muted text-muted-foreground'}`}>
                  {i + 1}
                </div>
                {i < 3 && <div className="w-6 h-px bg-border" />}
              </div>
            ))}
            <span className="ml-2 text-[11px] text-muted-foreground capitalize">{resetStep}</span>
          </div>

          <div className="py-2">
            {/* Step 1: Warning */}
            {resetStep === 'warning' && (
              <div className="space-y-3">
                <div className="bg-red-950/30 border border-red-700/40 rounded-md p-3">
                  <h4 className="text-xs font-bold text-red-400 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    DANGER: This action cannot be undone!
                  </h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    This will permanently delete ALL data in the database, including:
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside ml-1">
                    <li>All sales, purchases, expenses, and financial records</li>
                    <li>All products, categories, inventory, and stock records</li>
                    <li>All customers, suppliers, and referral persons</li>
                    <li>All user accounts (a new default admin will be created)</li>
                    <li>All branches and business settings</li>
                    <li>All audit logs and system history</li>
                  </ul>
                  <p className="text-xs font-semibold text-red-400 mt-2">
                    Only the default admin account (username: admin, password: admin123) will remain.
                  </p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/40 rounded-md p-3">
                  <p className="text-xs text-amber-400/90">
                    <span className="font-semibold">Important:</span> Make sure you have a complete backup before proceeding.
                    The application will restart after the reset is complete.
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Confirmation Text */}
            {resetStep === 'confirm' && (
              <div className="bg-muted/50 border border-border rounded-md p-3">
                <p className="text-xs mb-3">
                  To confirm this action, please type{' '}
                  <span className="font-bold text-red-400 font-mono">RESET</span>{' '}
                  in the box below:
                </p>
                <Input
                  value={resetConfirmationText}
                  onChange={(e) => setResetConfirmationText(e.target.value)}
                  placeholder="Type RESET here"
                  className="h-8 text-sm font-mono border-red-500/30 focus:border-red-500/60"
                  autoFocus
                />
              </div>
            )}

            {/* Step 3: Admin Authentication */}
            {resetStep === 'auth' && (
              <div className="bg-muted/50 border border-border rounded-md p-3 space-y-3">
                <p className="text-xs text-muted-foreground">
                  For security, please enter your admin credentials to authorize this operation:
                </p>
                <div>
                  <Label htmlFor="reset-username" className="text-xs font-medium mb-1 block">Admin Username</Label>
                  <Input
                    id="reset-username"
                    className="h-8 text-sm"
                    value={resetAdminUsername}
                    onChange={(e) => setResetAdminUsername(e.target.value)}
                    placeholder="Enter admin username"
                    autoFocus
                  />
                </div>
                <div>
                  <Label htmlFor="reset-password" className="text-xs font-medium mb-1 block">Admin Password</Label>
                  <Input
                    id="reset-password"
                    type="password"
                    className="h-8 text-sm"
                    value={resetAdminPassword}
                    onChange={(e) => setResetAdminPassword(e.target.value)}
                    placeholder="Enter admin password"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Progress */}
            {resetStep === 'progress' && (
              <div className="flex flex-col items-center justify-center py-8">
                <RefreshCw className="w-10 h-10 text-red-500 animate-spin mb-3" />
                <p className="text-sm font-semibold mb-1">Resetting Database...</p>
                <p className="text-xs text-muted-foreground text-center">
                  Please wait while all data is being deleted. This may take a few moments.
                  <br />
                  Do not close this window.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            {resetStep !== 'progress' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
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
                  <Button size="sm" className="h-8 text-xs" onClick={handleResetDialogNext}>
                    Continue
                  </Button>
                )}
                {resetStep === 'confirm' && (
                  <Button
                    size="sm"
                    className="h-8 text-xs"
                    onClick={handleResetDialogNext}
                    disabled={resetConfirmationText !== 'RESET'}
                  >
                    Next
                  </Button>
                )}
                {resetStep === 'auth' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 text-xs bg-red-700 hover:bg-red-800"
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
