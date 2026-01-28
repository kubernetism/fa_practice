import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Trash2, Ticket, RefreshCw, Copy, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
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

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  const getStatusBadge = (voucher: Voucher) => {
    if (voucher.isUsed) {
      return <Badge variant="secondary">Used</Badge>
    }
    if (!voucher.isActive) {
      return <Badge variant="destructive">Inactive</Badge>
    }
    if (voucher.expiresAt && new Date(voucher.expiresAt) < new Date()) {
      return <Badge variant="destructive">Expired</Badge>
    }
    return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
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
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vouchers</h1>
          <p className="text-muted-foreground">Create and manage discount vouchers</p>
        </div>
        <Button onClick={handleOpenCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Create Voucher
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by code or description..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            <Tabs
              value={filter}
              onValueChange={(v) => {
                setFilter(v as typeof filter)
                setPage(1)
              }}
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="used">Used</TabsTrigger>
                <TabsTrigger value="expired">Expired</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : vouchers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Ticket className="h-8 w-8" />
                      <p>No vouchers found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                vouchers.map((voucher) => (
                  <TableRow key={voucher.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="rounded bg-muted px-2 py-1 text-sm font-mono font-semibold">
                          {voucher.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyCode(voucher.code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {voucher.description || '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(voucher.discountAmount)}
                    </TableCell>
                    <TableCell>{getStatusBadge(voucher)}</TableCell>
                    <TableCell>{formatDate(voucher.expiresAt)}</TableCell>
                    <TableCell>{formatDate(voucher.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      {!voucher.isUsed && voucher.isActive && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(voucher.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, total)} of {total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
  )
}
