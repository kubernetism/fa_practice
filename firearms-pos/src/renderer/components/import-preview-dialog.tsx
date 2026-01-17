import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertTriangle,
  Database,
  Package,
  Users,
  DollarSign,
  ShoppingCart,
  Settings,
  FileArchive,
  Loader2,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface BackupCategory {
  id: string
  name: string
  description: string
  tables: { name: string; count: number }[]
  totalRecords: number
}

interface BackupPreviewData {
  isValid: boolean
  categories: BackupCategory[]
  backupDate: string | null
  backupSize: number
  filePath: string
}

interface ImportPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportComplete?: () => void
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  inventory: Package,
  management: Users,
  finance: DollarSign,
  sales: ShoppingCart,
  system: Settings,
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'Unknown'
  try {
    return new Date(dateString).toLocaleString()
  } catch {
    return dateString
  }
}

export function ImportPreviewDialog({
  open,
  onOpenChange,
  onImportComplete,
}: ImportPreviewDialogProps) {
  const [step, setStep] = useState<'select' | 'preview' | 'importing' | 'complete' | 'error'>('select')
  const [previewData, setPreviewData] = useState<BackupPreviewData | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [mergeMode, setMergeMode] = useState<'replace' | 'merge'>('replace')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<{
    message: string
    imported?: { category: string; tables: string[]; records: number }[]
  } | null>(null)

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setStep('select')
      setPreviewData(null)
      setSelectedCategories(new Set())
      setExpandedCategories(new Set())
      setError(null)
      setImportResult(null)
    }
  }, [open])

  const handleSelectFile = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await window.api.backup.preview()

      if (result.success && result.data) {
        setPreviewData(result.data)
        // Pre-select all categories except system
        const defaultSelected = new Set(
          result.data.categories
            .filter((c: BackupCategory) => c.id !== 'system' && c.totalRecords > 0)
            .map((c: BackupCategory) => c.id)
        )
        setSelectedCategories(defaultSelected)
        setStep('preview')
      } else {
        if (result.message !== 'File selection cancelled') {
          setError(result.message || 'Failed to preview backup file')
        }
      }
    } catch (err) {
      console.error('Preview failed:', err)
      setError('Failed to read backup file')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  const handleToggleExpand = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  const handleSelectAll = () => {
    if (previewData) {
      const allCategories = previewData.categories.filter((c) => c.totalRecords > 0).map((c) => c.id)
      setSelectedCategories(new Set(allCategories))
    }
  }

  const handleSelectNone = () => {
    setSelectedCategories(new Set())
  }

  const handleImport = async () => {
    if (!previewData || selectedCategories.size === 0) return

    setStep('importing')
    setError(null)

    try {
      const result = await window.api.backup.importSelective({
        filePath: previewData.filePath,
        categories: Array.from(selectedCategories),
        mergeMode,
      })

      if (result.success) {
        setImportResult({
          message: result.message,
          imported: result.imported,
        })
        setStep('complete')
        onImportComplete?.()
      } else {
        setError(result.message || 'Import failed')
        setStep('error')
      }
    } catch (err) {
      console.error('Import failed:', err)
      setError('An unexpected error occurred during import')
      setStep('error')
    }
  }

  const totalSelectedRecords = previewData
    ? previewData.categories
        .filter((c) => selectedCategories.has(c.id))
        .reduce((sum, c) => sum + c.totalRecords, 0)
    : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileArchive className="h-5 w-5" />
            {step === 'select' && 'Import Backup'}
            {step === 'preview' && 'Select Data to Import'}
            {step === 'importing' && 'Importing Data...'}
            {step === 'complete' && 'Import Complete'}
            {step === 'error' && 'Import Error'}
          </DialogTitle>
          <DialogDescription>
            {step === 'select' && 'Select a backup file to preview and import data from.'}
            {step === 'preview' && 'Choose which categories of data you want to import.'}
            {step === 'importing' && 'Please wait while your data is being imported.'}
            {step === 'complete' && 'Your data has been successfully imported.'}
            {step === 'error' && 'There was a problem importing your data.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden py-4">
          {/* Step: Select File */}
          {step === 'select' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Database className="h-16 w-16 text-muted-foreground" />
              <div className="text-center space-y-2">
                <p className="text-lg font-medium">Choose Backup File</p>
                <p className="text-sm text-muted-foreground max-w-md">
                  Select a backup file (.db) to preview its contents. You'll be able to choose
                  which data categories to import.
                </p>
              </div>
              <Button onClick={handleSelectFile} disabled={isLoading} size="lg">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Reading Backup...
                  </>
                ) : (
                  'Select Backup File'
                )}
              </Button>
              {error && (
                <p className="text-sm text-destructive mt-2">{error}</p>
              )}
            </div>
          )}

          {/* Step: Preview */}
          {step === 'preview' && previewData && (
            <div className="space-y-4">
              {/* Backup Info */}
              <div className="flex items-center gap-4 p-3 bg-muted rounded-lg text-sm">
                <div>
                  <span className="text-muted-foreground">File:</span>{' '}
                  <span className="font-medium">{previewData.filePath.split('/').pop()}</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div>
                  <span className="text-muted-foreground">Size:</span>{' '}
                  <span className="font-medium">{formatBytes(previewData.backupSize)}</span>
                </div>
                {previewData.backupDate && (
                  <>
                    <Separator orientation="vertical" className="h-4" />
                    <div>
                      <span className="text-muted-foreground">Last Data:</span>{' '}
                      <span className="font-medium">{formatDate(previewData.backupDate)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Import Mode */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label>Import Mode:</Label>
                  <Select value={mergeMode} onValueChange={(v) => setMergeMode(v as 'replace' | 'merge')}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="replace">Replace Existing</SelectItem>
                      <SelectItem value="merge">Merge (Add New)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSelectNone}>
                    Clear
                  </Button>
                </div>
              </div>

              {mergeMode === 'replace' && (
                <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <p className="text-yellow-700 dark:text-yellow-400">
                    <strong>Replace mode</strong> will delete existing data in selected categories
                    before importing. A safety backup will be created automatically.
                  </p>
                </div>
              )}

              {/* Categories List */}
              <ScrollArea className="h-[280px] border rounded-lg">
                <div className="p-2 space-y-1">
                  {previewData.categories.map((category) => {
                    const Icon = categoryIcons[category.id] || Database
                    const isExpanded = expandedCategories.has(category.id)
                    const isSelected = selectedCategories.has(category.id)
                    const hasData = category.totalRecords > 0

                    return (
                      <div key={category.id}>
                        <div
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer',
                            isSelected && 'bg-primary/10'
                          )}
                        >
                          <Checkbox
                            checked={isSelected}
                            disabled={!hasData}
                            onCheckedChange={() => handleToggleCategory(category.id)}
                          />
                          <button
                            onClick={() => handleToggleExpand(category.id)}
                            className="p-0.5"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <div
                            className="flex-1"
                            onClick={() => hasData && handleToggleCategory(category.id)}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{category.name}</span>
                              <Badge variant={hasData ? 'default' : 'secondary'}>
                                {category.totalRecords.toLocaleString()} records
                              </Badge>
                              {category.id === 'system' && (
                                <Badge variant="destructive" className="text-xs">
                                  Caution
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{category.description}</p>
                          </div>
                        </div>

                        {/* Expanded table details */}
                        {isExpanded && (
                          <div className="ml-14 pl-4 border-l-2 border-muted mb-2">
                            {category.tables.map((table) => (
                              <div
                                key={table.name}
                                className="flex items-center justify-between py-1 text-sm"
                              >
                                <span className="text-muted-foreground">{table.name}</span>
                                <span>{table.count.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>

              {/* Summary */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>
                  <strong>{selectedCategories.size}</strong> categories selected
                </span>
                <span>
                  <strong>{totalSelectedRecords.toLocaleString()}</strong> records to import
                </span>
              </div>
            </div>
          )}

          {/* Step: Importing */}
          {step === 'importing' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
              <div className="text-center space-y-2">
                <p className="text-lg font-medium">Importing Data</p>
                <p className="text-sm text-muted-foreground">
                  Please wait while your data is being imported. This may take a few moments.
                </p>
              </div>
            </div>
          )}

          {/* Step: Complete */}
          {step === 'complete' && importResult && (
            <div className="space-y-4">
              <div className="flex flex-col items-center py-6 space-y-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <div className="text-center space-y-2">
                  <p className="text-lg font-medium text-green-600">Import Successful</p>
                  <p className="text-sm text-muted-foreground">{importResult.message}</p>
                </div>
              </div>

              {importResult.imported && importResult.imported.length > 0 && (
                <div className="border rounded-lg p-4 space-y-2">
                  <p className="font-medium text-sm">Import Summary:</p>
                  {importResult.imported.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{item.category}</span>
                      <Badge variant="outline">{item.records} records</Badge>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
                <p className="text-blue-700 dark:text-blue-400">
                  You may need to refresh the page or restart the application to see all imported data.
                </p>
              </div>
            </div>
          )}

          {/* Step: Error */}
          {step === 'error' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <XCircle className="h-16 w-16 text-destructive" />
              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-destructive">Import Failed</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button variant="outline" onClick={() => setStep('preview')}>
                Try Again
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          {step === 'select' && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}

          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={() => setStep('select')}>
                Back
              </Button>
              <Button
                onClick={handleImport}
                disabled={selectedCategories.size === 0}
              >
                Import {selectedCategories.size > 0 && `(${totalSelectedRecords.toLocaleString()} records)`}
              </Button>
            </>
          )}

          {step === 'complete' && (
            <Button onClick={() => onOpenChange(false)}>
              Done
            </Button>
          )}

          {step === 'error' && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ImportPreviewDialog
