'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Badge } from '@/components/ui/badge';
import {
  Users,
  UserCheck,
  Shield,
  ShieldAlert,
  Search,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';

// Types
interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  governmentIdType: 'cnic' | 'passport' | 'driving_license';
  governmentIdNumber: string;
  firearmLicenseNumber: string | null;
  licenseExpiryDate: string | null;
  dateOfBirth: string;
  notes: string;
  isActive: boolean;
  createdAt: string;
}

// Mock data with Pakistani customers
const MOCK_CUSTOMERS: Customer[] = [
  {
    id: '1',
    firstName: 'Ahmed',
    lastName: 'Khan',
    email: 'ahmed.khan@example.pk',
    phone: '+92-300-1234567',
    address: 'House 23, Street 5, F-7',
    city: 'Islamabad',
    state: 'Federal',
    zipCode: '44000',
    governmentIdType: 'cnic',
    governmentIdNumber: '35201-1234567-1',
    firearmLicenseNumber: 'FL-ISB-2024-001',
    licenseExpiryDate: '2026-06-15',
    dateOfBirth: '1985-03-12',
    notes: 'Regular customer, competitive shooter',
    isActive: true,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    firstName: 'Fatima',
    lastName: 'Malik',
    email: 'fatima.malik@example.pk',
    phone: '+92-321-9876543',
    address: 'Flat 12, Gulberg III',
    city: 'Lahore',
    state: 'Punjab',
    zipCode: '54000',
    governmentIdType: 'cnic',
    governmentIdNumber: '35202-9876543-2',
    firearmLicenseNumber: 'FL-LHR-2023-045',
    licenseExpiryDate: '2026-02-28',
    dateOfBirth: '1990-07-22',
    notes: 'Licensed for personal protection',
    isActive: true,
    createdAt: '2023-11-20',
  },
  {
    id: '3',
    firstName: 'Imran',
    lastName: 'Sheikh',
    email: 'imran.sheikh@example.pk',
    phone: '+92-333-5551234',
    address: 'Plot 45, DHA Phase 6',
    city: 'Karachi',
    state: 'Sindh',
    zipCode: '75500',
    governmentIdType: 'cnic',
    governmentIdNumber: '42101-5551234-5',
    firearmLicenseNumber: 'FL-KHI-2024-089',
    licenseExpiryDate: '2024-01-10',
    dateOfBirth: '1982-11-05',
    notes: 'License expired, renewal pending',
    isActive: false,
    createdAt: '2023-05-10',
  },
  {
    id: '4',
    firstName: 'Zainab',
    lastName: 'Ali',
    email: 'zainab.ali@example.pk',
    phone: '+92-345-7778888',
    address: 'House 67, Cantt Area',
    city: 'Rawalpindi',
    state: 'Punjab',
    zipCode: '46000',
    governmentIdType: 'cnic',
    governmentIdNumber: '37405-7778888-4',
    firearmLicenseNumber: null,
    licenseExpiryDate: null,
    dateOfBirth: '1995-02-18',
    notes: 'New customer, license application in progress',
    isActive: true,
    createdAt: '2025-12-01',
  },
  {
    id: '5',
    firstName: 'Hassan',
    lastName: 'Raza',
    email: 'hassan.raza@example.pk',
    phone: '+92-300-4445566',
    address: 'Street 12, Satellite Town',
    city: 'Quetta',
    state: 'Balochistan',
    zipCode: '87300',
    governmentIdType: 'cnic',
    governmentIdNumber: '54201-4445566-3',
    firearmLicenseNumber: 'FL-QTA-2025-012',
    licenseExpiryDate: '2026-03-10',
    dateOfBirth: '1988-09-30',
    notes: 'Sport shooting enthusiast',
    isActive: true,
    createdAt: '2025-01-05',
  },
  {
    id: '6',
    firstName: 'Ayesha',
    lastName: 'Hussain',
    email: 'ayesha.hussain@example.pk',
    phone: '+92-331-2223344',
    address: 'Block C, Johar Town',
    city: 'Lahore',
    state: 'Punjab',
    zipCode: '54782',
    governmentIdType: 'passport',
    governmentIdNumber: 'AB1234567',
    firearmLicenseNumber: 'FL-LHR-2024-156',
    licenseExpiryDate: '2027-08-20',
    dateOfBirth: '1992-05-14',
    notes: 'VIP member, multiple firearms registered',
    isActive: true,
    createdAt: '2024-03-22',
  },
  {
    id: '7',
    firstName: 'Bilal',
    lastName: 'Ahmed',
    email: 'bilal.ahmed@example.pk',
    phone: '+92-322-9998877',
    address: 'House 89, Model Town',
    city: 'Peshawar',
    state: 'KPK',
    zipCode: '25000',
    governmentIdType: 'cnic',
    governmentIdNumber: '17101-9998877-6',
    firearmLicenseNumber: 'FL-PSH-2024-078',
    licenseExpiryDate: '2026-02-15',
    dateOfBirth: '1987-12-08',
    notes: 'Security professional',
    isActive: true,
    createdAt: '2024-02-10',
  },
  {
    id: '8',
    firstName: 'Sana',
    lastName: 'Tariq',
    email: 'sana.tariq@example.pk',
    phone: '+92-346-1112233',
    address: 'Flat 5, Clifton Block 2',
    city: 'Karachi',
    state: 'Sindh',
    zipCode: '75600',
    governmentIdType: 'cnic',
    governmentIdNumber: '42201-1112233-8',
    firearmLicenseNumber: 'FL-KHI-2025-203',
    licenseExpiryDate: '2026-11-30',
    dateOfBirth: '1993-08-25',
    notes: 'First-time buyer',
    isActive: true,
    createdAt: '2025-01-20',
  },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    governmentIdType: 'cnic' as 'cnic' | 'passport' | 'driving_license',
    governmentIdNumber: '',
    firearmLicenseNumber: '',
    licenseExpiryDate: '',
    dateOfBirth: '',
    notes: '',
  });

  // Calculate summary statistics
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.isActive).length;
  const customersWithLicense = customers.filter((c) => c.firearmLicenseNumber).length;
  const expiredLicenses = customers.filter((c) => {
    if (!c.licenseExpiryDate) return false;
    return new Date(c.licenseExpiryDate) < new Date();
  }).length;

  // Filter customers
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.governmentIdNumber.includes(searchTerm);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && customer.isActive) ||
      (statusFilter === 'inactive' && !customer.isActive);

    return matchesSearch && matchesStatus;
  });

  // License expiry badge logic
  const getLicenseExpiryBadge = (expiryDate: string | null) => {
    if (!expiryDate) {
      return (
        <Badge variant="outline" className="text-[10px] border-gray-600 text-gray-400">
          No License
        </Badge>
      );
    }

    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return (
        <Badge variant="outline" className="text-[10px] border-red-500 text-red-400 bg-red-950/20">
          Expired
        </Badge>
      );
    } else if (daysUntilExpiry <= 30) {
      return (
        <Badge variant="outline" className="text-[10px] border-yellow-500 text-yellow-400 bg-yellow-950/20">
          Expiring Soon
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="text-[10px] border-green-500 text-green-400 bg-green-950/20">
          Valid
        </Badge>
      );
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      governmentIdType: 'cnic',
      governmentIdNumber: '',
      firearmLicenseNumber: '',
      licenseExpiryDate: '',
      dateOfBirth: '',
      notes: '',
    });
    setSelectedCustomer(null);
  };

  // Handle add customer
  const handleAddCustomer = () => {
    const newCustomer: Customer = {
      id: Date.now().toString(),
      ...formData,
      firearmLicenseNumber: formData.firearmLicenseNumber || null,
      licenseExpiryDate: formData.licenseExpiryDate || null,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setCustomers([...customers, newCustomer]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  // Handle edit customer
  const handleEditCustomer = () => {
    if (!selectedCustomer) return;

    setCustomers(
      customers.map((c) =>
        c.id === selectedCustomer.id
          ? {
              ...c,
              ...formData,
              firearmLicenseNumber: formData.firearmLicenseNumber || null,
              licenseExpiryDate: formData.licenseExpiryDate || null,
            }
          : c
      )
    );
    setIsEditDialogOpen(false);
    resetForm();
  };

  // Handle delete customer
  const handleDeleteCustomer = (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      setCustomers(customers.filter((c) => c.id !== id));
    }
  };

  // Open edit dialog
  const openEditDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      zipCode: customer.zipCode,
      governmentIdType: customer.governmentIdType,
      governmentIdNumber: customer.governmentIdNumber,
      firearmLicenseNumber: customer.firearmLicenseNumber || '',
      licenseExpiryDate: customer.licenseExpiryDate || '',
      dateOfBirth: customer.dateOfBirth,
      notes: customer.notes,
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display text-brass-200">Customers</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage customer records and firearm license information
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="brass-glow" onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>
                Enter customer details and firearm license information
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Ahmed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Khan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="customer@example.pk"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+92-300-1234567"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="House 23, Street 5, F-7"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Islamabad"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="Federal"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  placeholder="44000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="governmentIdType">Government ID Type *</Label>
                <Select
                  value={formData.governmentIdType}
                  onValueChange={(value: 'cnic' | 'passport' | 'driving_license') =>
                    setFormData({ ...formData, governmentIdType: value })
                  }
                >
                  <SelectTrigger id="governmentIdType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cnic">CNIC</SelectItem>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="driving_license">Driving License</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="governmentIdNumber">Government ID Number *</Label>
                <Input
                  id="governmentIdNumber"
                  value={formData.governmentIdNumber}
                  onChange={(e) => setFormData({ ...formData, governmentIdNumber: e.target.value })}
                  placeholder="35201-1234567-1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firearmLicenseNumber">Firearm License Number</Label>
                <Input
                  id="firearmLicenseNumber"
                  value={formData.firearmLicenseNumber}
                  onChange={(e) => setFormData({ ...formData, firearmLicenseNumber: e.target.value })}
                  placeholder="FL-ISB-2024-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="licenseExpiryDate">License Expiry Date</Label>
                <Input
                  id="licenseExpiryDate"
                  type="date"
                  value={formData.licenseExpiryDate}
                  onChange={(e) => setFormData({ ...formData, licenseExpiryDate: e.target.value })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about the customer"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="brass-glow" onClick={handleAddCustomer}>
                Add Customer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <Card className="card-tactical">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-lg bg-brass-900/20 border border-brass-700/30">
                <Users className="h-6 w-6 text-brass-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Customers</p>
                <p className="text-2xl font-bold text-brass-200">{totalCustomers}</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-lg bg-green-900/20 border border-green-700/30">
                <UserCheck className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Active Customers</p>
                <p className="text-2xl font-bold text-green-300">{activeCustomers}</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-700/30">
                <Shield className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">With License</p>
                <p className="text-2xl font-bold text-blue-300">{customersWithLicense}</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-lg bg-red-900/20 border border-red-700/30">
                <ShieldAlert className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Expired License</p>
                <p className="text-2xl font-bold text-red-300">{expiredLicenses}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card className="card-tactical">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, phone, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="card-tactical">
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Govt ID</TableHead>
                <TableHead>Firearm License</TableHead>
                <TableHead>License Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-400 py-8">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium text-sm">
                      {customer.firstName} {customer.lastName}
                    </TableCell>
                    <TableCell className="text-sm text-gray-400">{customer.email}</TableCell>
                    <TableCell className="text-sm text-gray-400">{customer.phone}</TableCell>
                    <TableCell className="text-xs text-gray-400">
                      <div className="space-y-1">
                        <Badge variant="outline" className="text-[10px]">
                          {customer.governmentIdType.toUpperCase()}
                        </Badge>
                        <div>{customer.governmentIdNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-gray-400">
                      {customer.firearmLicenseNumber || (
                        <span className="text-gray-500 italic">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="space-y-1">
                        {customer.licenseExpiryDate ? (
                          <>
                            <div className="text-gray-400">
                              {new Date(customer.licenseExpiryDate).toLocaleDateString('en-PK')}
                            </div>
                            {getLicenseExpiryBadge(customer.licenseExpiryDate)}
                          </>
                        ) : (
                          getLicenseExpiryBadge(null)
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          customer.isActive
                            ? 'border-green-500 text-green-400 bg-green-950/20'
                            : 'border-gray-600 text-gray-400'
                        }`}
                      >
                        {customer.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(customer)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-950/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>Update customer details and firearm license information</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-firstName">First Name *</Label>
              <Input
                id="edit-firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-lastName">Last Name *</Label>
              <Input
                id="edit-lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone *</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-city">City</Label>
              <Input
                id="edit-city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-state">State/Province</Label>
              <Input
                id="edit-state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-zipCode">Zip Code</Label>
              <Input
                id="edit-zipCode"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dateOfBirth">Date of Birth *</Label>
              <Input
                id="edit-dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-governmentIdType">Government ID Type *</Label>
              <Select
                value={formData.governmentIdType}
                onValueChange={(value: 'cnic' | 'passport' | 'driving_license') =>
                  setFormData({ ...formData, governmentIdType: value })
                }
              >
                <SelectTrigger id="edit-governmentIdType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cnic">CNIC</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="driving_license">Driving License</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-governmentIdNumber">Government ID Number *</Label>
              <Input
                id="edit-governmentIdNumber"
                value={formData.governmentIdNumber}
                onChange={(e) => setFormData({ ...formData, governmentIdNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-firearmLicenseNumber">Firearm License Number</Label>
              <Input
                id="edit-firearmLicenseNumber"
                value={formData.firearmLicenseNumber}
                onChange={(e) => setFormData({ ...formData, firearmLicenseNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-licenseExpiryDate">License Expiry Date</Label>
              <Input
                id="edit-licenseExpiryDate"
                type="date"
                value={formData.licenseExpiryDate}
                onChange={(e) => setFormData({ ...formData, licenseExpiryDate: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Input
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="brass-glow" onClick={handleEditCustomer}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
