'use client';

import { useState } from 'react';
import {
  Warehouse,
  Package,
  ArrowRightLeft,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Filter,
  FileText,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Types
type StockItem = {
  id: string;
  productName: string;
  productCode: string;
  branch: string;
  quantity: number;
  minQuantity: number;
  reorderLevel: number;
  unitCost: number;
};

type AdjustmentType = 'add' | 'remove' | 'damage' | 'theft' | 'correction' | 'expired';

type Adjustment = {
  id: string;
  date: string;
  productName: string;
  type: AdjustmentType;
  qtyBefore: number;
  change: number;
  qtyAfter: number;
  reason: string;
  user: string;
  branch: string;
};

type TransferStatus = 'pending' | 'in_transit' | 'completed' | 'cancelled';

type Transfer = {
  id: string;
  date: string;
  productName: string;
  fromBranch: string;
  toBranch: string;
  quantity: number;
  status: TransferStatus;
  notes?: string;
};

type Tab = 'stock' | 'adjustments' | 'transfers';

// Mock data
const branches = ['All Branches', 'Islamabad HQ', 'Rawalpindi Branch', 'Lahore Branch'];

const mockStockData: StockItem[] = [
  {
    id: '1',
    productName: 'Glock 19 Gen5',
    productCode: 'GLK-19-G5',
    branch: 'Islamabad HQ',
    quantity: 12,
    minQuantity: 5,
    reorderLevel: 10,
    unitCost: 185000,
  },
  {
    id: '2',
    productName: 'Beretta 92FS',
    productCode: 'BRT-92FS',
    branch: 'Islamabad HQ',
    quantity: 3,
    minQuantity: 5,
    reorderLevel: 8,
    unitCost: 195000,
  },
  {
    id: '3',
    productName: 'AR-15 Rifle',
    productCode: 'AR15-STD',
    branch: 'Rawalpindi Branch',
    quantity: 0,
    minQuantity: 3,
    reorderLevel: 5,
    unitCost: 425000,
  },
  {
    id: '4',
    productName: '9mm Ammunition (Box of 50)',
    productCode: '9MM-50',
    branch: 'Islamabad HQ',
    quantity: 250,
    minQuantity: 100,
    reorderLevel: 200,
    unitCost: 3500,
  },
  {
    id: '5',
    productName: '.45 ACP Ammunition (Box of 50)',
    productCode: '45ACP-50',
    branch: 'Lahore Branch',
    quantity: 85,
    minQuantity: 100,
    reorderLevel: 150,
    unitCost: 4200,
  },
  {
    id: '6',
    productName: 'Red Dot Sight - Holosun',
    productCode: 'RDS-HS507',
    branch: 'Rawalpindi Branch',
    quantity: 8,
    minQuantity: 5,
    reorderLevel: 10,
    unitCost: 42000,
  },
  {
    id: '7',
    productName: 'Glock 19 Gen5',
    productCode: 'GLK-19-G5',
    branch: 'Lahore Branch',
    quantity: 5,
    minQuantity: 5,
    reorderLevel: 10,
    unitCost: 185000,
  },
  {
    id: '8',
    productName: '9mm Ammunition (Box of 50)',
    productCode: '9MM-50',
    branch: 'Rawalpindi Branch',
    quantity: 175,
    minQuantity: 100,
    reorderLevel: 200,
    unitCost: 3500,
  },
];

const mockAdjustments: Adjustment[] = [
  {
    id: '1',
    date: '2026-02-05 14:30',
    productName: 'Glock 19 Gen5',
    type: 'add',
    qtyBefore: 10,
    change: 2,
    qtyAfter: 12,
    reason: 'Stock replenishment from supplier',
    user: 'Ahmad Khan',
    branch: 'Islamabad HQ',
  },
  {
    id: '2',
    date: '2026-02-04 11:15',
    productName: 'AR-15 Rifle',
    type: 'remove',
    qtyBefore: 2,
    change: -2,
    qtyAfter: 0,
    reason: 'Transferred to customer order',
    user: 'Sana Ahmed',
    branch: 'Rawalpindi Branch',
  },
  {
    id: '3',
    date: '2026-02-03 16:45',
    productName: '.45 ACP Ammunition',
    type: 'damage',
    qtyBefore: 90,
    change: -5,
    qtyAfter: 85,
    reason: 'Water damage in storage area',
    user: 'Hassan Ali',
    branch: 'Lahore Branch',
  },
  {
    id: '4',
    date: '2026-02-02 09:20',
    productName: 'Red Dot Sight - Holosun',
    type: 'correction',
    qtyBefore: 6,
    change: 2,
    qtyAfter: 8,
    reason: 'Physical count correction',
    user: 'Fatima Noor',
    branch: 'Rawalpindi Branch',
  },
];

const mockTransfers: Transfer[] = [
  {
    id: '1',
    date: '2026-02-05 10:00',
    productName: 'Glock 19 Gen5',
    fromBranch: 'Islamabad HQ',
    toBranch: 'Rawalpindi Branch',
    quantity: 3,
    status: 'in_transit',
    notes: 'Urgent transfer for customer order',
  },
  {
    id: '2',
    date: '2026-02-04 15:30',
    productName: '9mm Ammunition',
    fromBranch: 'Islamabad HQ',
    toBranch: 'Lahore Branch',
    quantity: 50,
    status: 'completed',
    notes: 'Monthly stock redistribution',
  },
  {
    id: '3',
    date: '2026-02-03 13:00',
    productName: 'Beretta 92FS',
    fromBranch: 'Rawalpindi Branch',
    toBranch: 'Islamabad HQ',
    quantity: 2,
    status: 'completed',
  },
  {
    id: '4',
    date: '2026-02-02 11:45',
    productName: 'Red Dot Sight - Holosun',
    fromBranch: 'Lahore Branch',
    toBranch: 'Rawalpindi Branch',
    quantity: 5,
    status: 'pending',
    notes: 'Awaiting approval',
  },
];

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<Tab>('stock');
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [searchQuery, setSearchQuery] = useState('');
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);

  // Adjustment form state
  const [adjustmentForm, setAdjustmentForm] = useState({
    product: '',
    branch: '',
    type: 'add' as AdjustmentType,
    quantity: '',
    reason: '',
    serialNumber: '',
    reference: '',
  });

  // Transfer form state
  const [transferForm, setTransferForm] = useState({
    product: '',
    fromBranch: '',
    toBranch: '',
    quantity: '',
    notes: '',
  });

  // Calculate summary statistics
  const filteredStock =
    selectedBranch === 'All Branches'
      ? mockStockData
      : mockStockData.filter((item) => item.branch === selectedBranch);

  const totalItems = filteredStock.length;
  const totalQuantity = filteredStock.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = filteredStock.filter(
    (item) => item.quantity <= item.minQuantity && item.quantity > 0
  ).length;
  const outOfStockItems = filteredStock.filter((item) => item.quantity === 0).length;

  // Get stock status
  const getStockStatus = (quantity: number, minQuantity: number) => {
    if (quantity === 0) return 'out';
    if (quantity <= minQuantity) return 'low';
    return 'ok';
  };

  // Handle adjustment submission
  const handleAdjustmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adjustment submitted:', adjustmentForm);
    setAdjustmentDialogOpen(false);
    // Reset form
    setAdjustmentForm({
      product: '',
      branch: '',
      type: 'add',
      quantity: '',
      reason: '',
      serialNumber: '',
      reference: '',
    });
  };

  // Handle transfer submission
  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Transfer submitted:', transferForm);
    setTransferDialogOpen(false);
    // Reset form
    setTransferForm({
      product: '',
      fromBranch: '',
      toBranch: '',
      quantity: '',
      notes: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">Inventory</h1>
        <p className="text-muted-foreground mt-1">
          Track stock levels, adjustments, and transfers
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="card-tactical p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold text-white mt-1">{totalItems}</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="card-tactical p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Quantity</p>
              <p className="text-2xl font-bold text-white mt-1">{totalQuantity}</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Warehouse className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="card-tactical p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-500 mt-1">{lowStockItems}</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="card-tactical p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
              <p className="text-2xl font-bold text-destructive mt-1">{outOfStockItems}</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-destructive" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card-tactical">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'stock' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('stock')}
              className={activeTab === 'stock' ? 'brass-glow' : ''}
            >
              <Package className="h-4 w-4 mr-2" />
              Stock Levels
            </Button>
            <Button
              variant={activeTab === 'adjustments' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('adjustments')}
              className={activeTab === 'adjustments' ? 'brass-glow' : ''}
            >
              <FileText className="h-4 w-4 mr-2" />
              Adjustments
            </Button>
            <Button
              variant={activeTab === 'transfers' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('transfers')}
              className={activeTab === 'transfers' ? 'brass-glow' : ''}
            >
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Transfers
            </Button>
          </div>

          {/* Action buttons based on active tab */}
          <div>
            {activeTab === 'adjustments' && (
              <Dialog open={adjustmentDialogOpen} onOpenChange={setAdjustmentDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="brass-glow">
                    <Plus className="h-4 w-4 mr-2" />
                    Record Adjustment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <form onSubmit={handleAdjustmentSubmit}>
                    <DialogHeader>
                      <DialogTitle>Record Stock Adjustment</DialogTitle>
                      <DialogDescription>
                        Add, remove, or correct inventory quantities
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="adj-product">Product</Label>
                          <Select
                            value={adjustmentForm.product}
                            onValueChange={(value) =>
                              setAdjustmentForm({ ...adjustmentForm, product: value })
                            }
                          >
                            <SelectTrigger id="adj-product">
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="glock19">Glock 19 Gen5</SelectItem>
                              <SelectItem value="beretta92">Beretta 92FS</SelectItem>
                              <SelectItem value="ar15">AR-15 Rifle</SelectItem>
                              <SelectItem value="9mm">9mm Ammunition</SelectItem>
                              <SelectItem value="45acp">.45 ACP Ammunition</SelectItem>
                              <SelectItem value="reddot">Red Dot Sight - Holosun</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="adj-branch">Branch</Label>
                          <Select
                            value={adjustmentForm.branch}
                            onValueChange={(value) =>
                              setAdjustmentForm({ ...adjustmentForm, branch: value })
                            }
                          >
                            <SelectTrigger id="adj-branch">
                              <SelectValue placeholder="Select branch" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="islamabad">Islamabad HQ</SelectItem>
                              <SelectItem value="rawalpindi">Rawalpindi Branch</SelectItem>
                              <SelectItem value="lahore">Lahore Branch</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="adj-type">Adjustment Type</Label>
                          <Select
                            value={adjustmentForm.type}
                            onValueChange={(value) =>
                              setAdjustmentForm({
                                ...adjustmentForm,
                                type: value as AdjustmentType,
                              })
                            }
                          >
                            <SelectTrigger id="adj-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="add">Add Stock</SelectItem>
                              <SelectItem value="remove">Remove Stock</SelectItem>
                              <SelectItem value="damage">Damage</SelectItem>
                              <SelectItem value="theft">Theft</SelectItem>
                              <SelectItem value="correction">Correction</SelectItem>
                              <SelectItem value="expired">Expired</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="adj-quantity">Quantity</Label>
                          <Input
                            id="adj-quantity"
                            type="number"
                            min="1"
                            value={adjustmentForm.quantity}
                            onChange={(e) =>
                              setAdjustmentForm({ ...adjustmentForm, quantity: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="adj-reason">Reason</Label>
                        <Textarea
                          id="adj-reason"
                          placeholder="Explain the reason for this adjustment..."
                          value={adjustmentForm.reason}
                          onChange={(e) =>
                            setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })
                          }
                          required
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="adj-serial">Serial Number (Optional)</Label>
                          <Input
                            id="adj-serial"
                            placeholder="SN123456"
                            value={adjustmentForm.serialNumber}
                            onChange={(e) =>
                              setAdjustmentForm({
                                ...adjustmentForm,
                                serialNumber: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="adj-reference">Reference (Optional)</Label>
                          <Input
                            id="adj-reference"
                            placeholder="PO-2026-001"
                            value={adjustmentForm.reference}
                            onChange={(e) =>
                              setAdjustmentForm({ ...adjustmentForm, reference: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setAdjustmentDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="brass-glow">
                        Record Adjustment
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}

            {activeTab === 'transfers' && (
              <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="brass-glow">
                    <Plus className="h-4 w-4 mr-2" />
                    New Transfer
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <form onSubmit={handleTransferSubmit}>
                    <DialogHeader>
                      <DialogTitle>Create Stock Transfer</DialogTitle>
                      <DialogDescription>
                        Transfer inventory between branches
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="transfer-product">Product</Label>
                        <Select
                          value={transferForm.product}
                          onValueChange={(value) =>
                            setTransferForm({ ...transferForm, product: value })
                          }
                        >
                          <SelectTrigger id="transfer-product">
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="glock19">Glock 19 Gen5</SelectItem>
                            <SelectItem value="beretta92">Beretta 92FS</SelectItem>
                            <SelectItem value="ar15">AR-15 Rifle</SelectItem>
                            <SelectItem value="9mm">9mm Ammunition</SelectItem>
                            <SelectItem value="45acp">.45 ACP Ammunition</SelectItem>
                            <SelectItem value="reddot">Red Dot Sight - Holosun</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="transfer-from">From Branch</Label>
                          <Select
                            value={transferForm.fromBranch}
                            onValueChange={(value) =>
                              setTransferForm({ ...transferForm, fromBranch: value })
                            }
                          >
                            <SelectTrigger id="transfer-from">
                              <SelectValue placeholder="Select branch" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="islamabad">Islamabad HQ</SelectItem>
                              <SelectItem value="rawalpindi">Rawalpindi Branch</SelectItem>
                              <SelectItem value="lahore">Lahore Branch</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="transfer-to">To Branch</Label>
                          <Select
                            value={transferForm.toBranch}
                            onValueChange={(value) =>
                              setTransferForm({ ...transferForm, toBranch: value })
                            }
                          >
                            <SelectTrigger id="transfer-to">
                              <SelectValue placeholder="Select branch" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="islamabad">Islamabad HQ</SelectItem>
                              <SelectItem value="rawalpindi">Rawalpindi Branch</SelectItem>
                              <SelectItem value="lahore">Lahore Branch</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transfer-quantity">Quantity</Label>
                        <Input
                          id="transfer-quantity"
                          type="number"
                          min="1"
                          value={transferForm.quantity}
                          onChange={(e) =>
                            setTransferForm({ ...transferForm, quantity: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transfer-notes">Notes (Optional)</Label>
                        <Textarea
                          id="transfer-notes"
                          placeholder="Additional notes about this transfer..."
                          value={transferForm.notes}
                          onChange={(e) =>
                            setTransferForm({ ...transferForm, notes: e.target.value })
                          }
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setTransferDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="brass-glow">
                        Create Transfer
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'stock' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger className="w-[200px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Stock Table */}
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead>Product</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Min Qty</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Reorder Level</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStock
                      .filter((item) =>
                        searchQuery
                          ? item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.productCode.toLowerCase().includes(searchQuery.toLowerCase())
                          : true
                      )
                      .map((item) => {
                        const status = getStockStatus(item.quantity, item.minQuantity);
                        return (
                          <TableRow key={item.id} className="border-border">
                            <TableCell>
                              <div>
                                <div className="font-medium text-white">{item.productName}</div>
                                <div className="text-sm text-muted-foreground">
                                  {item.productCode}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{item.branch}</TableCell>
                            <TableCell className="text-right font-medium">
                              {item.quantity}
                            </TableCell>
                            <TableCell className="text-right">{item.minQuantity}</TableCell>
                            <TableCell>
                              {status === 'ok' && (
                                <Badge
                                  variant="outline"
                                  className="bg-green-500/10 text-green-500 border-green-500/20"
                                >
                                  In Stock
                                </Badge>
                              )}
                              {status === 'low' && (
                                <Badge
                                  variant="outline"
                                  className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                >
                                  Low Stock
                                </Badge>
                              )}
                              {status === 'out' && (
                                <Badge
                                  variant="outline"
                                  className="bg-red-500/10 text-red-500 border-red-500/20"
                                >
                                  Out of Stock
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">{item.reorderLevel}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setAdjustmentDialogOpen(true)}
                              >
                                Adjust
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {activeTab === 'adjustments' && (
            <div className="space-y-4">
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead>Date</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Qty Before</TableHead>
                      <TableHead className="text-right">Change</TableHead>
                      <TableHead className="text-right">Qty After</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>User</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAdjustments.map((adj) => (
                      <TableRow key={adj.id} className="border-border">
                        <TableCell className="text-muted-foreground">{adj.date}</TableCell>
                        <TableCell className="font-medium text-white">
                          {adj.productName}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              adj.type === 'add'
                                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                : adj.type === 'remove'
                                  ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                  : adj.type === 'damage' || adj.type === 'theft'
                                    ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                    : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                            }
                          >
                            {adj.type.charAt(0).toUpperCase() + adj.type.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{adj.qtyBefore}</TableCell>
                        <TableCell className="text-right">
                          <span
                            className={adj.change > 0 ? 'text-green-500' : 'text-red-500'}
                          >
                            {adj.change > 0 ? '+' : ''}
                            {adj.change}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {adj.qtyAfter}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{adj.reason}</TableCell>
                        <TableCell>{adj.user}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {activeTab === 'transfers' && (
            <div className="space-y-4">
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead>Date</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>From Branch</TableHead>
                      <TableHead>To Branch</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockTransfers.map((transfer) => (
                      <TableRow key={transfer.id} className="border-border">
                        <TableCell className="text-muted-foreground">{transfer.date}</TableCell>
                        <TableCell className="font-medium text-white">
                          {transfer.productName}
                        </TableCell>
                        <TableCell>{transfer.fromBranch}</TableCell>
                        <TableCell>{transfer.toBranch}</TableCell>
                        <TableCell className="text-right font-medium">
                          {transfer.quantity}
                        </TableCell>
                        <TableCell>
                          {transfer.status === 'pending' && (
                            <Badge
                              variant="outline"
                              className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                            >
                              Pending
                            </Badge>
                          )}
                          {transfer.status === 'in_transit' && (
                            <Badge
                              variant="outline"
                              className="bg-blue-500/10 text-blue-500 border-blue-500/20"
                            >
                              In Transit
                            </Badge>
                          )}
                          {transfer.status === 'completed' && (
                            <Badge
                              variant="outline"
                              className="bg-green-500/10 text-green-500 border-green-500/20"
                            >
                              Completed
                            </Badge>
                          )}
                          {transfer.status === 'cancelled' && (
                            <Badge
                              variant="outline"
                              className="bg-red-500/10 text-red-500 border-red-500/20"
                            >
                              Cancelled
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {transfer.notes || '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
