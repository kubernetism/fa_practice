'use client';

import { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Building2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  getSuppliers,
  getSupplierSummary,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '@/actions/suppliers';

interface Supplier {
  id: number;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  taxId: string | null;
  paymentTerms: string | null;
  notes: string | null;
  isActive: boolean;
}

const paymentTermsLabels: Record<string, string> = {
  net_15: 'Net 15 Days',
  net_30: 'Net 30 Days',
  net_45: 'Net 45 Days',
  net_60: 'Net 60 Days',
  cod: 'Cash on Delivery',
  advance: 'Advance Payment',
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Summary stats
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [activeSuppliers, setActiveSuppliers] = useState(0);
  const [inactiveSuppliers, setInactiveSuppliers] = useState(0);

  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    taxId: '',
    paymentTerms: 'net_30',
    notes: '',
    isActive: true,
  });

  // Load suppliers and summary
  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const isActiveFilter = statusFilter === 'all' ? undefined : statusFilter === 'active';
      const [suppliersResult, summaryResult] = await Promise.all([
        getSuppliers({ search: searchQuery || undefined, isActive: isActiveFilter }),
        getSupplierSummary(),
      ]);

      if (suppliersResult.success) {
        setSuppliers(suppliersResult.data as Supplier[]);
      }

      if (summaryResult.success) {
        const summary = summaryResult.data;
        setTotalSuppliers(Number(summary.totalSuppliers) || 0);
        setActiveSuppliers(Number(summary.activeCount) || 0);
        setInactiveSuppliers(Number(summary.inactiveCount) || 0);
      }
    } catch (error) {
      console.error('Failed to load suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter suppliers
  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      searchQuery === '' ||
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingSupplier) {
        const result = await updateSupplier(editingSupplier.id, formData as any);
        if (result.success) {
          setIsAddDialogOpen(false);
          handleDialogClose();
          loadData();
        }
      } else {
        const result = await createSupplier({
          name: formData.name!,
          contactPerson: formData.contactPerson || undefined,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
          city: formData.city || undefined,
          state: formData.state || undefined,
          zipCode: formData.zipCode || undefined,
          taxId: formData.taxId || undefined,
          paymentTerms: formData.paymentTerms || undefined,
          notes: formData.notes || undefined,
        });
        if (result.success) {
          setIsAddDialogOpen(false);
          handleDialogClose();
          loadData();
        }
      }
    } catch (error) {
      console.error('Failed to save supplier:', error);
    }
  };

  // Handle edit
  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData(supplier);
    setIsAddDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      try {
        await deleteSupplier(id);
        loadData();
      } catch (error) {
        console.error('Failed to delete supplier:', error);
      }
    }
  };

  // Reset dialog
  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setEditingSupplier(null);
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      taxId: '',
      paymentTerms: 'net_30',
      notes: '',
      isActive: true,
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground mt-1">
            Manage supplier contacts and payment terms
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="brass-glow" onClick={() => handleDialogClose()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
              </DialogTitle>
              <DialogDescription>
                {editingSupplier
                  ? 'Update supplier information and payment terms.'
                  : 'Enter supplier details to add them to your system.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                {/* Name */}
                <div className="grid gap-2">
                  <Label htmlFor="name">
                    Supplier Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Pakistan Ordnance Factories"
                    required
                  />
                </div>

                {/* Contact Person */}
                <div className="grid gap-2">
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, contactPerson: e.target.value })
                    }
                    placeholder="Col. Ahmed Hassan"
                  />
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="sales@supplier.pk"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+92-51-1234567"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Industrial Area, Sector I-9"
                  />
                </div>

                {/* City, State, Zip */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city || ''}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Islamabad"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state || ''}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="Punjab"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode || ''}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      placeholder="44000"
                    />
                  </div>
                </div>

                {/* Tax ID */}
                <div className="grid gap-2">
                  <Label htmlFor="taxId">Tax ID (NTN)</Label>
                  <Input
                    id="taxId"
                    value={formData.taxId || ''}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    placeholder="NTN-1234567-8"
                  />
                </div>

                {/* Payment Terms and Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="paymentTerms">Payment Terms</Label>
                    <Select
                      value={formData.paymentTerms || 'net_30'}
                      onValueChange={(value) =>
                        setFormData({ ...formData, paymentTerms: value })
                      }
                    >
                      <SelectTrigger id="paymentTerms">
                        <SelectValue placeholder="Select payment terms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="net_15">Net 15 Days</SelectItem>
                        <SelectItem value="net_30">Net 30 Days</SelectItem>
                        <SelectItem value="net_45">Net 45 Days</SelectItem>
                        <SelectItem value="net_60">Net 60 Days</SelectItem>
                        <SelectItem value="cod">Cash on Delivery</SelectItem>
                        <SelectItem value="advance">Advance Payment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.isActive ? 'active' : 'inactive'}
                      onValueChange={(value: 'active' | 'inactive') =>
                        setFormData({ ...formData, isActive: value === 'active' })
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Notes */}
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes about this supplier..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Cancel
                </Button>
                <Button type="submit" className="brass-glow">
                  {editingSupplier ? 'Update Supplier' : 'Add Supplier'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="card-tactical">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Suppliers</p>
                <p className="text-3xl font-bold mt-2">{totalSuppliers}</p>
              </div>
              <Building2 className="h-10 w-10 text-amber-500/70" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-tactical">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-3xl font-bold mt-2 text-green-500">{activeSuppliers}</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-green-500/70" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-tactical">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inactive</p>
                <p className="text-3xl font-bold mt-2 text-red-500">{inactiveSuppliers}</p>
              </div>
              <XCircle className="h-10 w-10 text-red-500/70" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="card-tactical">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search suppliers by name, contact, city, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card className="card-tactical">
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center text-muted-foreground py-8">Loading...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Tax ID</TableHead>
                    <TableHead>Payment Terms</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No suppliers found. Add your first supplier to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSuppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-amber-500/70" />
                            {supplier.name}
                          </div>
                        </TableCell>
                        <TableCell>{supplier.contactPerson || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground">{supplier.email || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground">{supplier.phone || 'N/A'}</TableCell>
                        <TableCell>{supplier.city || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground">{supplier.taxId || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] font-medium">
                            {paymentTermsLabels[supplier.paymentTerms || 'net_30']}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              supplier.isActive
                                ? 'border-green-500/50 bg-green-500/10 text-green-500'
                                : 'border-red-500/50 bg-red-500/10 text-red-500'
                            }`}
                          >
                            {supplier.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(supplier)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(supplier.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
