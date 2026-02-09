'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  Users,
  GitBranch,
  FileText,
  Eye,
  Shield,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getTenantById, updateTenantStatus, updateTenantPlan } from '@/actions/platform/tenants'
import { impersonateTenant } from '@/actions/platform/impersonation'
import { toast } from 'sonner'

const statusColors: Record<string, string> = {
  trial: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  active: 'bg-green-500/10 text-green-400 border-green-500/20',
  suspended: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const invoiceStatusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  paid: 'bg-green-500/10 text-green-400 border-green-500/20',
  failed: 'bg-red-500/10 text-red-400 border-red-500/20',
  refunded: 'bg-muted text-muted-foreground',
}

export default function TenantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const tenantId = Number(params.id)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [impersonating, setImpersonating] = useState(false)

  async function loadTenant() {
    setLoading(true)
    const result = await getTenantById(tenantId)
    if (result.success) {
      setData(result.data)
    } else {
      toast.error(result.message || 'Tenant not found')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadTenant()
  }, [tenantId])

  async function handleStatusChange(status: 'trial' | 'active' | 'suspended' | 'cancelled') {
    const result = await updateTenantStatus(tenantId, status)
    if (result.success) {
      toast.success(`Status updated to ${status}`)
      loadTenant()
    } else {
      toast.error(result.message || 'Failed to update')
    }
  }

  async function handlePlanChange(plan: string) {
    const result = await updateTenantPlan(tenantId, plan as 'basic' | 'pro' | 'enterprise')
    if (result.success) {
      toast.success(`Plan updated to ${plan}`)
      loadTenant()
    } else {
      toast.error(result.message || 'Failed to update')
    }
  }

  async function handleImpersonate() {
    setImpersonating(true)
    const result = await impersonateTenant(tenantId)
    if (result.success) {
      router.push('/dashboard')
      router.refresh()
    } else {
      toast.error(result.message || 'Failed to impersonate')
      setImpersonating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Tenant not found
      </div>
    )
  }

  const { tenant, users: tenantUsers, branches: tenantBranches, invoices } = data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link href="/platform/tenants">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{tenant.name}</h1>
          <p className="text-muted-foreground text-sm">{tenant.slug}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={tenant.subscriptionPlan} onValueChange={handlePlanChange}>
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>

          {tenant.subscriptionStatus === 'suspended' || tenant.subscriptionStatus === 'cancelled' ? (
            <Button size="sm" onClick={() => handleStatusChange('active')}>
              Activate
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="text-amber-400 border-amber-400/30"
              onClick={() => handleStatusChange('suspended')}
            >
              Suspend
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={handleImpersonate}
            disabled={impersonating}
          >
            {impersonating ? (
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
            ) : (
              <Eye className="w-3 h-3 mr-1" />
            )}
            View as Tenant
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="card-tactical">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Shield className="w-4 h-4" />
              Status
            </div>
            <Badge
              variant="outline"
              className={`capitalize ${statusColors[tenant.subscriptionStatus] || ''}`}
            >
              {tenant.subscriptionStatus}
            </Badge>
          </CardContent>
        </Card>
        <Card className="card-tactical">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Building2 className="w-4 h-4" />
              Plan
            </div>
            <p className="font-semibold capitalize">{tenant.subscriptionPlan}</p>
          </CardContent>
        </Card>
        <Card className="card-tactical">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Users className="w-4 h-4" />
              Users
            </div>
            <p className="font-semibold">{tenantUsers.length}</p>
          </CardContent>
        </Card>
        <Card className="card-tactical">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <GitBranch className="w-4 h-4" />
              Branches
            </div>
            <p className="font-semibold">{tenantBranches.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users ({tenantUsers.length})</TabsTrigger>
          <TabsTrigger value="branches">Branches ({tenantBranches.length})</TabsTrigger>
          <TabsTrigger value="invoices">Invoices ({invoices.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card className="card-tactical">
            <CardHeader>
              <CardTitle className="text-lg">Tenant Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{new Date(tenant.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trial Ends</p>
                <p className="font-medium">{new Date(tenant.trialEndsAt).toLocaleDateString()}</p>
              </div>
              {tenant.subscriptionEndsAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Subscription Ends</p>
                  <p className="font-medium">{new Date(tenant.subscriptionEndsAt).toLocaleDateString()}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">KuickPay Customer ID</p>
                <p className="font-medium">{tenant.kuickpayCustomerId || 'Not set'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <Card className="card-tactical">
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Role</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {tenantUsers.map((user: any) => (
                    <tr key={user.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 px-4 font-medium">{user.fullName}</td>
                      <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="capitalize text-xs">{user.role}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={user.isActive
                            ? 'bg-green-500/10 text-green-400 border-green-500/20 text-xs'
                            : 'bg-red-500/10 text-red-400 border-red-500/20 text-xs'}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                      </td>
                    </tr>
                  ))}
                  {tenantUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">No users</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branches" className="mt-4">
          <Card className="card-tactical">
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Address</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Phone</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tenantBranches.map((branch: any) => (
                    <tr key={branch.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 px-4 font-medium">
                        {branch.name}
                        {branch.isMain && (
                          <Badge variant="outline" className="ml-2 text-[10px]">Main</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{branch.address || '-'}</td>
                      <td className="py-3 px-4 text-muted-foreground">{branch.phone || '-'}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={branch.isActive
                            ? 'bg-green-500/10 text-green-400 border-green-500/20 text-xs'
                            : 'bg-red-500/10 text-red-400 border-red-500/20 text-xs'}
                        >
                          {branch.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {tenantBranches.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">No branches</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="mt-4">
          <Card className="card-tactical">
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Plan</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Period</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Paid At</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv: any) => (
                    <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 px-4 font-medium">{inv.planName || '-'}</td>
                      <td className="py-3 px-4">Rs {Number(inv.amount).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={`capitalize text-xs ${invoiceStatusColors[inv.status] || ''}`}
                        >
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(inv.billingPeriodStart).toLocaleDateString()} - {new Date(inv.billingPeriodEnd).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                  {invoices.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">No invoices</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
