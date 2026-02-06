'use client';

import { useState } from 'react';
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
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  taxId: string;
  paymentTerms: 'net_15' | 'net_30' | 'net_45' | 'net_60' | 'cod' | 'advance';
  notes: string;
  status: 'active' | 'inactive';
}

// Mock data with Pakistani firearms/ammunition suppliers
const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Pakistan Ordnance Factories',
    contactPerson: 'Col. Ahmed Hassan',
    email: 'procurement@pof.gov.pk',
    phone: '+92-51-9314501',
    address: 'Wah Cantt Industrial Area',
    city: 'Wah Cantt',
    state: 'Punjab',
    zipCode: '47040',
    taxId: 'NTN-1234567-8',
    paymentTerms: 'net_30',
    notes: 'Government-owned defense manufacturer. Primary supplier for military-grade firearms.',
    status: 'active',
  },
  {
    id: '2',
    name: 'Arms Corporation of Pakistan',
    contactPerson: 'Muhammad Tariq',
    email: 'sales@armscorp.pk',
    phone: '+92-42-37654321',
    address: 'Defence Industrial Estate, Kot Lakhpat',
    city: 'Lahore',
    state: 'Punjab',
    zipCode: '54000',
    taxId: 'NTN-2345678-9',
    paymentTerms: 'net_45',
    notes: 'Licensed commercial arms manufacturer. Specializes in civilian firearms and sporting rifles.',
    status: 'active',
  },
  {
    id: '3',
    name: 'National Defense Industries',
    contactPerson: 'Brig. (R) Saeed Khan',
    email: 'info@ndi.com.pk',
    phone: '+92-21-32456789',
    address: 'SITE Industrial Area, Block 18',
    city: 'Karachi',
    state: 'Sindh',
    zipCode: '75700',
    taxId: 'NTN-3456789-0',
    paymentTerms: 'net_60',
    notes: 'Ammunition and explosives manufacturer. Bulk orders require 45-day lead time.',
    status: 'active',
  },
  {
    id: '4',
    name: 'Frontier Arms & Ammunition',
    contactPerson: 'Malik Iftikhar',
    email: 'orders@frontierarms.pk',
    phone: '+92-91-5276543',
    address: 'Bara Road, Hayatabad Industrial Estate',
    city: 'Peshawar',
    state: 'Khyber Pakhtunkhwa',
    zipCode: '25120',
    taxId: 'NTN-4567890-1',
    paymentTerms: 'cod',
    notes: 'Traditional gunsmith collective. Cash on delivery only. Specializes in hunting rifles.',
    status: 'active',
  },
  {
    id: '5',
    name: 'Strategic Defense Solutions',
    contactPerson: 'Shahid Mehmood',
    email: 'contact@sds.pk',
    phone: '+92-51-8765432',
    address: 'I-9 Industrial Area',
    city: 'Islamabad',
    state: 'Islamabad Capital Territory',
    zipCode: '44000',
    taxId: 'NTN-5678901-2',
    paymentTerms: 'advance',
    notes: 'High-end tactical equipment and accessories. Requires 50% advance payment.',
    status: 'inactive',
  },
  {
    id: '6',
    name: 'Punjab Ammunition Works',
    contactPerson: 'Rashid Mahmood',
    email: 'sales@paw.com.pk',
    phone: '+92-61-4567890',
    address: 'Sargodha Road Industrial Zone',
    city: 'Multan',
    state: 'Punjab',
    zipCode: '60000',
    taxId: 'NTN-6789012-3',
    paymentTerms: 'net_15',
    notes: 'Domestic ammunition manufacturer. Fast turnaround for standard calibers.',
    status: 'active',
  },
];

const paymentTermsLabels: Record<Supplier['paymentTerms'], string> = {
  net_15: 'Net 15 Days',
  net_30: 'Net 30 Days',
  net_45: 'Net 45 Days',
  net_60: 'Net 60 Days',
  cod: 'Cash on Delivery',
  advance: 'Advance Payment',
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
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
    status: 'active',
  });

  // Filter suppliers
  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      searchQuery === '' ||
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate summary stats
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter((s) => s.status === 'active').length;
  const inactiveSuppliers = suppliers.filter((s) => s.status === 'inactive').length;

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingSupplier) {
      // Update existing supplier
      setSuppliers(
        suppliers.map((s) =>
          s.id === editingSupplier.id ? { ...editingSupplier, ...formData } : s
        )
      );
    } else {
      // Add new supplier
      const newSupplier: Supplier = {
        id: (suppliers.length + 1).toString(),
        name: formData.name || '',
        contactPerson: formData.contactPerson || '',
        email: formData.email || '',
        phone: formData.phone || '',
        address: formData.address || '',
        city: formData.city || '',
        state: formData.state || '',
        zipCode: formData.zipCode || '',
        taxId: formData.taxId || '',
        paymentTerms: formData.paymentTerms || 'net_30',
        notes: formData.notes || '',
        status: formData.status || 'active',
      };
      setSuppliers([...suppliers, newSupplier]);
    }

    // Reset form
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
      status: 'active',
    });
    setEditingSupplier(null);
    setIsAddDialogOpen(false);
  };

  // Handle edit
  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData(supplier);
    setIsAddDialogOpen(true);
  };

  // Handle delete
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      setSuppliers(suppliers.filter((s) => s.id !== id));
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
      status: 'active',
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
                    value={formData.contactPerson}
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
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="sales@supplier.pk"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
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
                    value={formData.address}
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
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Islamabad"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="Punjab"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
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
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    placeholder="NTN-1234567-8"
                  />
                </div>

                {/* Payment Terms and Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="paymentTerms">Payment Terms</Label>
                    <Select
                      value={formData.paymentTerms}
                      onValueChange={(value: Supplier['paymentTerms']) =>
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
                      value={formData.status}
                      onValueChange={(value: 'active' | 'inactive') =>
                        setFormData({ ...formData, status: value })
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
                    value={formData.notes}
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
                      <TableCell>{supplier.contactPerson}</TableCell>
                      <TableCell className="text-muted-foreground">{supplier.email}</TableCell>
                      <TableCell className="text-muted-foreground">{supplier.phone}</TableCell>
                      <TableCell>{supplier.city}</TableCell>
                      <TableCell className="text-muted-foreground">{supplier.taxId}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-medium">
                          {paymentTermsLabels[supplier.paymentTerms]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            supplier.status === 'active'
                              ? 'border-green-500/50 bg-green-500/10 text-green-500'
                              : 'border-red-500/50 bg-red-500/10 text-red-500'
                          }`}
                        >
                          {supplier.status === 'active' ? 'Active' : 'Inactive'}
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
        </CardContent>
      </Card>
    </div>
  );
}
