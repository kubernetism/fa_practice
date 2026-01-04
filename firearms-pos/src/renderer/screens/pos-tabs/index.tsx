import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Clock,
  User,
  ShoppingBag,
  ArrowRight,
  Pause,
  Play,
  Trash2,
  Filter,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTabs } from '@/contexts/tabs-context'
import { useBranch } from '@/contexts/branch-context'
import { useAuth } from '@/contexts/auth-context'
import type { SalesTabWithItems, SalesTabStatus } from '@shared/types'
import { formatCurrency, formatTimeAgo } from '@/lib/utils'

const statusConfig: Record<
  SalesTabStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  open: { label: 'Open', color: 'bg-green-100 text-green-700', icon: <ShoppingBag className="h-3 w-3" /> },
  on_hold: {
    label: 'On Hold',
    color: 'bg-yellow-100 text-yellow-700',
    icon: <Pause className="h-3 w-3" />,
  },
  closed: {
    label: 'Closed',
    color: 'bg-gray-100 text-gray-700',
    icon: <Clock className="h-3 w-3" />,
  },
}

export function PosTabsScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { currentBranch, branches } = useBranch()
  const {
    tabs,
    isLoading,
    fetchTabs,
    deleteTab,
    setActiveTab,
  } = useTabs()

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState<number | undefined>(currentBranch?.id)
  const [selectedStatus, setSelectedStatus] = useState<SalesTabStatus | 'all'>('all')
  const [deleteConfirm, setDeleteConfirm] = useState<{ tab: SalesTabWithItems; open: boolean }>({
    tab: null as any,
    open: false,
  })

  // Fetch tabs on mount and when filters change
  useEffect(() => {
    if (currentBranch?.id) {
      setSelectedBranch(currentBranch.id)
    }
  }, [currentBranch])

  useEffect(() => {
    const filters: any = {}
    if (selectedBranch) filters.branchId = selectedBranch
    if (selectedStatus !== 'all') filters.status = selectedStatus
    fetchTabs(filters)
  }, [selectedBranch, selectedStatus, fetchTabs])

  // Create new tab
  const handleCreateTab = async () => {
    if (!selectedBranch) return

    const newTab = await window.api.salesTabs.create({
      branchId: selectedBranch,
    })

    if (newTab?.data) {
      setShowCreateDialog(false)
      // Open the new tab
      const result = await window.api.salesTabs.getById(newTab.data.id)
      if (result.success && result.data) {
        setActiveTab(result.data as SalesTabWithItems)
      }
    }
  }

  // View tab detail
  const handleViewTab = async (tab: SalesTabWithItems) => {
    const result = await window.api.salesTabs.getById(tab.id)
    if (result.success && result.data) {
      setActiveTab(result.data as SalesTabWithItems)
    }
  }

  // Hold/resume tab
  const handleToggleHold = async (tab: SalesTabWithItems) => {
    const newStatus: SalesTabStatus = tab.status === 'open' ? 'on_hold' : 'open'
    await window.api.salesTabs.update(tab.id, { status: newStatus })
    fetchTabs({
      branchId: selectedBranch,
      status: selectedStatus === 'all' ? undefined : selectedStatus,
    })
  }

  // Delete tab
  const handleDeleteTab = async () => {
    if (deleteConfirm.tab) {
      const success = await deleteTab(deleteConfirm.tab.id)
      if (success) {
        setDeleteConfirm({ tab: null as any, open: false })
      }
    }
  }

  const openTabs = tabs.filter((t) => t.status === 'open')
  const onHoldTabs = tabs.filter((t) => t.status === 'on_hold')

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">POS Tabs</h1>
          <p className="text-muted-foreground">Manage open sales tabs and hold transactions</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const filters: any = {}
              if (selectedBranch) filters.branchId = selectedBranch
              if (selectedStatus !== 'all') filters.status = selectedStatus
              fetchTabs(filters)
            }}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setShowCreateDialog(true)} disabled={!selectedBranch}>
            <Plus className="mr-2 h-4 w-4" />
            Open New Tab
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 sm:flex-1">
              {branches.length > 1 && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Branch
                  </label>
                  <Select value={selectedBranch?.toString()} onValueChange={(v) => setSelectedBranch(Number(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      {branches.map((b) => (
                        <SelectItem key={b.id} value={b.id.toString()}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Status
                </label>
                <Select
                  value={selectedStatus}
                  onValueChange={(v: any) => setSelectedStatus(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : selectedStatus === 'all' ? (
        <div className="space-y-6">
          {/* Open Tabs Section */}
          {openTabs.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <ShoppingBag className="h-5 w-5 text-green-600" />
                Open Tabs ({openTabs.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {openTabs.map((tab) => (
                  <TabCard
                    key={tab.id}
                    tab={tab}
                    onView={() => handleViewTab(tab)}
                    onToggleHold={() => handleToggleHold(tab)}
                    onDelete={() => setDeleteConfirm({ tab, open: true })}
                  />
                ))}
              </div>
            </section>
          )}

          {/* On Hold Tabs Section */}
          {onHoldTabs.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <Pause className="h-5 w-5 text-yellow-600" />
                On Hold Tabs ({onHoldTabs.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {onHoldTabs.map((tab) => (
                  <TabCard
                    key={tab.id}
                    tab={tab}
                    onView={() => handleViewTab(tab)}
                    onToggleHold={() => handleToggleHold(tab)}
                    onDelete={() => setDeleteConfirm({ tab, open: true })}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {openTabs.length === 0 && onHoldTabs.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No tabs yet</h3>
                <p className="mb-4 text-muted-foreground">
                  Get started by creating a new sales tab for your branch.
                </p>
                <Button onClick={() => setShowCreateDialog(true)} disabled={!selectedBranch}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Tab
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tabs.map((tab) => (
            <TabCard
              key={tab.id}
              tab={tab}
              onView={() => handleViewTab(tab)}
              onToggleHold={() => handleToggleHold(tab)}
              onDelete={() => setDeleteConfirm({ tab, open: true })}
            />
          ))}
          {tabs.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No tabs found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or create a new tab.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Create Tab Dialog */}
      <AlertDialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Open New Sales Tab</AlertDialogTitle>
            <AlertDialogDescription>
              Create a new tab for holding items before checkout.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {!currentBranch && (
            <div className="flex items-center gap-2 rounded-lg bg-yellow-50 p-3 text-yellow-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Please select a branch first.</span>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCreateTab} disabled={!selectedBranch}>
              Create Tab
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm((prev) => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tab?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete tab {deleteConfirm.tab?.tabNumber}? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTab} className="bg-destructive text-destructive-foreground">
              Delete Tab
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

interface TabCardProps {
  tab: SalesTabWithItems
  onView: () => void
  onToggleHold: () => void
  onDelete: () => void
}

function TabCard({ tab, onView, onToggleHold, onDelete }: TabCardProps) {
  const status = statusConfig[tab.status]
  const navigate = useNavigate()

  const handleCheckout = () => {
    navigate(`/pos-tabs/${tab.id}`)
  }

  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{tab.tabNumber}</CardTitle>
            <div className="mt-1 flex items-center gap-2">
              <Badge className={status.color}>
                <span className="mr-1">{status.icon}</span>
                {status.label}
              </Badge>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">
            {formatTimeAgo(tab.createdAt)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-3">
          {/* Customer */}
          {tab.customer ? (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">
                {tab.customer.firstName} {tab.customer.lastName}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span>Guest</span>
            </div>
          )}

          {/* Branch */}
          {tab.branch && (
            <div className="text-xs text-muted-foreground">{tab.branch.name}</div>
          )}

          {/* Created by */}
          {tab.user && (
            <div className="text-xs text-muted-foreground">
              Created by {tab.user.fullName || tab.user.username}
            </div>
          )}

          {/* Items and Total */}
          <div className="flex items-center justify-between border-t pt-3">
            <div className="flex items-center gap-2 text-sm">
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              <span>
                {tab.itemCount} {tab.itemCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <div className="text-lg font-bold">
              {formatCurrency(tab.finalAmount)}
            </div>
          </div>

          {/* Notes */}
          {tab.notes && (
            <div className="rounded-md bg-muted p-2 text-xs italic text-muted-foreground">
              {tab.notes}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {tab.status === 'open' && (
              <>
                <Button variant="outline" size="sm" className="flex-1" onClick={onView}>
                  <ArrowRight className="mr-1 h-3.5 w-3.5" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={onToggleHold}
                >
                  <Pause className="mr-1 h-3.5 w-3.5" />
                  Hold
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={handleCheckout}>
                  Checkout
                </Button>
              </>
            )}
            {tab.status === 'on_hold' && (
              <>
                <Button variant="outline" size="sm" className="flex-1" onClick={onView}>
                  <ArrowRight className="mr-1 h-3.5 w-3.5" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={onToggleHold}
                >
                  <Play className="mr-1 h-3.5 w-3.5" />
                  Resume
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-destructive hover:text-destructive"
                  onClick={onDelete}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
            {tab.status === 'closed' && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={onView}
                disabled
              >
                <Clock className="mr-1 h-3.5 w-3.5" />
                Closed
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
