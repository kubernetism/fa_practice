'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Building2, Users, GitBranch, MoreHorizontal } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getTenants, updateTenantStatus } from '@/actions/platform/tenants'
import { toast } from 'sonner'

const statusColors: Record<string, string> = {
  trial: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  active: 'bg-green-500/10 text-green-400 border-green-500/20',
  suspended: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const planColors: Record<string, string> = {
  basic: 'bg-muted text-muted-foreground',
  pro: 'bg-primary/10 text-primary border-primary/20',
  enterprise: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

export default function TenantsPage() {
  const [tenantsList, setTenantsList] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  async function loadTenants() {
    setLoading(true)
    const result = await getTenants({
      search: search || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
      plan: planFilter === 'all' ? undefined : planFilter,
    })
    if (result.success) setTenantsList(result.data)
    setLoading(false)
  }

  useEffect(() => {
    loadTenants()
  }, [statusFilter, planFilter])

  useEffect(() => {
    const timer = setTimeout(loadTenants, 300)
    return () => clearTimeout(timer)
  }, [search])

  async function handleStatusChange(id: number, status: 'trial' | 'active' | 'suspended' | 'cancelled') {
    const result = await updateTenantStatus(id, status)
    if (result.success) {
      toast.success(`Tenant status updated to ${status}`)
      loadTenants()
    } else {
      toast.error(result.message || 'Failed to update status')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tenants</h1>
        <p className="text-muted-foreground text-sm">Manage all tenant accounts</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background/50"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="basic">Basic</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tenants Table */}
      <Card className="card-tactical">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Plan</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-center py-3 px-4 text-muted-foreground font-medium">Users</th>
                  <th className="text-center py-3 px-4 text-muted-foreground font-medium">Branches</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Created</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenantsList.map((tenant) => (
                  <tr key={tenant.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 px-4">
                      <Link
                        href={`/platform/tenants/${tenant.id}`}
                        className="font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {tenant.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{tenant.slug}</p>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={`capitalize text-xs ${planColors[tenant.subscriptionPlan] || ''}`}>
                        {tenant.subscriptionPlan}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className={`capitalize text-xs ${statusColors[tenant.subscriptionStatus] || ''}`}
                      >
                        {tenant.subscriptionStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground">
                        <Users className="w-3 h-3" />
                        {tenant.userCount}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground">
                        <GitBranch className="w-3 h-3" />
                        {tenant.branchCount}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/platform/tenants/${tenant.id}`}>View Details</Link>
                          </DropdownMenuItem>
                          {tenant.subscriptionStatus !== 'active' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(tenant.id, 'active')}>
                              Activate
                            </DropdownMenuItem>
                          )}
                          {tenant.subscriptionStatus !== 'suspended' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(tenant.id, 'suspended')}
                              className="text-amber-400"
                            >
                              Suspend
                            </DropdownMenuItem>
                          )}
                          {tenant.subscriptionStatus !== 'cancelled' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(tenant.id, 'cancelled')}
                              className="text-destructive"
                            >
                              Cancel
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {!loading && tenantsList.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No tenants found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
