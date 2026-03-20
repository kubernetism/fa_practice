import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Trash2, RefreshCw, Copy, Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { useCurrency } from '@/contexts/settings-context'

interface Voucher {
  id: number
  code: string
  description: string | null
  discountAmount: number
  expiresAt: string | null
  isUsed: boolean
  usedAt: string | null
  usedInSaleId: number | null
  createdBy: number | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export function VouchersScreen() {
  const { formatCurrency } = useCurrency()
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'used' | 'expired'>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Create form state
  const [formCode, setFormCode] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formAmount, setFormAmount] = useState('')
  const [formExpiresAt, setFormExpiresAt] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const fetchVouchers = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await window.api.vouchers.getAll({
        page,
        limit: 20,
        search: searchQuery,
        filter,
      })

      if (result.success && result.data) {
        setVouchers(result.data)
        setTotalPages(result.totalPages || 1)
        setTotal(result.total || 0)
      }
    } catch (error) {
      console.error('Failed to fetch vouchers:', error)
    } finally {
      setIsLoading(false)
    }
  }, [page, searchQuery, filter])

  useEffect(() => {
    fetchVouchers()
  }, [fetchVouchers])

  const handleGenerateCode = async () => {
    try {
      const result = await window.api.vouchers.generateCode()
      if (result.success && result.data) {
        setFormCode(result.data)
      }
    } catch (error) {
      console.error('Failed to generate code:', error)
    }
  }

  const handleOpenCreateDialog = async () => {
    setFormCode('')
    setFormDescription('')
    setFormAmount('')
    setFormExpiresAt('')
    setShowCreateDialog(true)
    // Auto-generate code
    await handleGenerateCode()
  }

  const handleCreate = async () => {
    if (!formCode.trim() || !formAmount) return

    setIsSaving(true)
    try {
      const result = await window.api.vouchers.create({
        code: formCode.trim(),
        description: formDescription.trim() || undefined,
        discountAmount: parseFloat(formAmount),
        expiresAt: formExpiresAt || undefined,
      })

      if (result.success) {
        setShowCreateDialog(false)
        fetchVouchers()
      } else {
        alert(result.message || 'Failed to create voucher')
      }
    } catch (error) {
      console.error('Failed to create voucher:', error)
      alert('Failed to create voucher')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to deactivate this voucher?')) return

    try {
      const result = await window.api.vouchers.delete(id)
      if (result.success) {
        fetchVouchers()
      } else {
        alert(result.message || 'Failed to delete voucher')
      }
    } catch (error) {
      console.error('Failed to delete voucher:', error)
    }
  }

  const copyCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code)
  }, [])

  const getStatusBadge = (voucher: Voucher) => {
    if (voucher.isUsed) {
      return <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Used</Badge>
    }
    if (!voucher.isActive) {
      return <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Inactive</Badge>
    }
    if (voucher.expiresAt && new Date(voucher.expiresAt) < new Date()) {
      return <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Expired</Badge>
    }
    return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-[10px] px-1.5 py-0">Active</Badge>
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <TooltipProvider>
      <div className="space-y-3 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">Vouchers</h1>
            <div className="flex items-center gap-1.5">
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                {total} Total
              </span>
            </div>
          </div>
          <Button size="sm" className="h-8" onClick={handleOpenCreateDialog}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Create Voucher
          </Button>
        </div>

        {/* Search + Filter tabs */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by code or description..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
              className="h-8 pl-8 text-sm"
            />
            {searchQuery && (
              <button
                aria-label="Clear search"
                onClick={() => {
                  setSearchQuery('')
                  setPage(1)
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Tabs
            value={filter}
            onValueChange={(v) => {
              setFilter(v as typeof filter)
              setPage(1)
            }}
          >
            <TabsList className="h-8">
              <TabsTrigger value="all" className="text-xs h-6 px-2">All</TabsTrigger>
              <TabsTrigger value="active" className="text-xs h-6 px-2">Active</TabsTrigger>
              <TabsTrigger value="used" className="text-xs h-6 px-2">Used</TabsTrigger>
              <TabsTrigger value="expired" className="text-xs h-6 px-2">Expired</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Table */}
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Code</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Description</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-right">Amount</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Expiry</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Created</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : vouchers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                    No vouchers found
                  </TableCell>
                </TableRow>
              ) : (
                vouchers.map((voucher) => (
                  <TableRow key={voucher.id} className="group h-9">
                    <TableCell className="py-1.5">
                      <div className="flex items-center gap-1.5">
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono font-semibold">
                          {voucher.code}
                        </code>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => copyCode(voucher.code)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy Code</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                    <TableCell className="py-1.5 text-sm text-muted-foreground truncate max-w-[180px]">
                      {voucher.description || '—'}
                    </TableCell>
                    <TableCell className="py-1.5 text-right text-sm font-medium tabular-nums">
                      {formatCurrency(voucher.discountAmount)}
                    </TableCell>
                    <TableCell className="py-1.5">{getStatusBadge(voucher)}</TableCell>
                    <TableCell className="py-1.5 text-sm text-muted-foreground">
                      {formatDate(voucher.expiresAt)}
                    </TableCell>
                    <TableCell className="py-1.5 text-sm text-muted-foreground">
                      {formatDate(voucher.createdAt)}
                    </TableCell>
                    <TableCell className="py-1.5">
                      {!voucher.isUsed && voucher.isActive && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleDelete(voucher.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Deactivate</TooltipContent>
                          </Tooltip>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination — outside table border */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="min-w-[3rem] text-center">{page} / {totalPages}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Create Voucher Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Voucher</DialogTitle>
              <DialogDescription>
                Create a new discount voucher with a unique code.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Code */}
              <div className="space-y-2">
                <Label htmlFor="voucher-code">Voucher Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="voucher-code"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="10-digit code"
                    maxLength={10}
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleGenerateCode}
                    title="Regenerate Code"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="voucher-desc">Description (Optional)</Label>
                <Input
                  id="voucher-desc"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g., Eid Sale, Loyalty Reward"
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="voucher-amount">Discount Amount (Rs)</Label>
                <Input
                  id="voucher-amount"
                  type="number"
                  step="0.01"
                  min="1"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  placeholder="Enter discount amount"
                />
              </div>

              {/* Expiry Date */}
              <div className="space-y-2">
                <Label htmlFor="voucher-expiry">Expiry Date (Optional)</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="voucher-expiry"
                    type="date"
                    className="pl-10"
                    value={formExpiresAt}
                    onChange={(e) => setFormExpiresAt(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={isSaving || !formCode.trim() || !formAmount || parseFloat(formAmount) <= 0}
              >
                {isSaving ? 'Creating...' : 'Create Voucher'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
