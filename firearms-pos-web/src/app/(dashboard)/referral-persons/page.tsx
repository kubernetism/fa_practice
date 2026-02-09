'use client'

import { useState, useEffect } from 'react'
import {
  UserPlus,
  Plus,
  Phone,
  MapPin,
  Percent,
  DollarSign,
  MoreVertical,
  Pencil,
  Trash2,
  ToggleLeft,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  getReferralPersons,
  createReferralPerson,
  updateReferralPerson,
  deleteReferralPerson,
} from '@/actions/referral-persons'
import { toast } from 'sonner'

export default function ReferralPersonsPage() {
  const [loading, setLoading] = useState(true)
  const [referrals, setReferrals] = useState<any[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    address: '',
    commissionRate: '5.00',
    notes: '',
  })
  const branchId = 1 // TODO: Get from session/context

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const res = await getReferralPersons()
      if (res.success) {
        setReferrals(res.data)
      }
    } catch (error) {
      console.error('Failed to load referral persons:', error)
      toast.error('Failed to load referral persons')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await createReferralPerson({
        branchId,
        name: formData.name,
        contact: formData.contact,
        address: formData.address,
        commissionRate: formData.commissionRate,
        notes: formData.notes,
      })
      if (res.success) {
        toast.success('Referral person added successfully')
        setDialogOpen(false)
        setFormData({
          name: '',
          contact: '',
          address: '',
          commissionRate: '5.00',
          notes: '',
        })
        loadData()
      }
    } catch (error) {
      console.error('Failed to create referral person:', error)
      toast.error('Failed to create referral person')
    }
  }

  async function handleToggle(id: number, isActive: boolean) {
    try {
      const res = await updateReferralPerson(id, { isActive: !isActive })
      if (res.success) {
        toast.success('Referral person updated')
        loadData()
      }
    } catch (error) {
      console.error('Failed to update referral person:', error)
      toast.error('Failed to update referral person')
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this referral person?')) return
    try {
      const res = await deleteReferralPerson(id)
      if (res.success) {
        toast.success('Referral person deleted')
        loadData()
      }
    } catch (error) {
      console.error('Failed to delete referral person:', error)
      toast.error('Failed to delete referral person')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Referral Persons</h1>
            <p className="text-sm text-muted-foreground mt-1">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Referral Persons</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage referrers and their commission rates</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="brass-glow">
              <Plus className="w-4 h-4 mr-2" />
              Add Referrer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Add Referral Person</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input placeholder="Referrer's full name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact Number</Label>
                  <Input placeholder="03XX-XXXXXXX" value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Commission Rate (%)</Label>
                  <Input type="number" step="0.01" placeholder="e.g., 3.00" value={formData.commissionRate} onChange={(e) => setFormData({...formData, commissionRate: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input placeholder="City or full address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input placeholder="Any additional notes" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
              </div>
              <Button type="submit" className="w-full brass-glow">Add Referrer</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="card-tactical">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Active Referrers</p>
                <p className="text-2xl font-bold tracking-tight">{referrals.filter((r) => r.isActive).length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-tactical">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Earned</p>
                <p className="text-2xl font-bold tracking-tight">Rs. {referrals.reduce((s, r) => s + Number(r.totalCommissionEarned || 0), 0).toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-tactical">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Unpaid Balance</p>
                <p className="text-2xl font-bold tracking-tight">Rs. {referrals.reduce((s, r) => s + (Number(r.totalCommissionEarned || 0) - Number(r.totalCommissionPaid || 0)), 0).toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {referrals.map((person) => {
          const unpaid = Number(person.totalCommissionEarned || 0) - Number(person.totalCommissionPaid || 0)
          const initials = person.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
          return (
            <Card key={person.id} className={`card-tactical ${!person.isActive ? 'opacity-60' : ''}`}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12 border border-border">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">{person.name}</h3>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${person.isActive ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-muted-foreground'}`}
                        >
                          {person.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Pencil className="w-3.5 h-3.5 mr-2" />Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggle(person.id, person.isActive)}>
                            <ToggleLeft className="w-3.5 h-3.5 mr-2" />{person.isActive ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(person.id)}>
                            <Trash2 className="w-3.5 h-3.5 mr-2" />Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {person.contact && (
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{person.contact}</span>
                      )}
                      {person.address && (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{person.address}</span>
                      )}
                      <span className="flex items-center gap-1"><Percent className="w-3 h-3" />{person.commissionRate || '0'}%</span>
                    </div>
                    <div className="flex items-center gap-6 mt-3 pt-3 border-t border-border">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Earned</p>
                        <p className="text-sm font-semibold">Rs. {Number(person.totalCommissionEarned || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Paid</p>
                        <p className="text-sm font-semibold text-success">Rs. {Number(person.totalCommissionPaid || 0).toLocaleString()}</p>
                      </div>
                      {unpaid > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Unpaid</p>
                          <p className="text-sm font-semibold text-warning">Rs. {unpaid.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {referrals.length === 0 && (
          <div className="col-span-2 text-center py-8 text-muted-foreground">
            No referral persons found
          </div>
        )}
      </div>
    </div>
  )
}
