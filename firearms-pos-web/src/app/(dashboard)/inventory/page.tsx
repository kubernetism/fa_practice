'use client';

import { useState, useEffect } from 'react';
import { PageLoader } from '@/components/ui/page-loader';
import {
  Warehouse,
  Package,
  ArrowRightLeft,
  AlertTriangle,
  TrendingDown,
  Plus,
  Search,
  Filter,
  FileText,
  CheckCircle2,
  ClipboardList,
  ChevronsUpDown,
  Check,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  getInventory,
  getInventorySummary,
  getStockAdjustments,
  getStockTransfers,
  adjustStock,
  receiveStockTransfer,
} from '@/actions/inventory';
import {
  getInventoryCounts,
  createInventoryCount,
} from '@/actions/inventory-counts';
import { searchProducts } from '@/actions/products';
import { getActiveBranches } from '@/actions/branches';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Types
type StockItem = {
  inventory: {
    id: number;
    tenantId: number;
    productId: number;
    branchId: number;
    quantity: number;
    minQuantity: number;
    maxQuantity: number;
    lastRestockDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
  };
  productName: string;
  productCode: string;
  productUnit: string | null;
  isSerialTracked: boolean;
  branchName: string | null;
};

type AdjustmentType = 'add' | 'remove' | 'damage' | 'theft' | 'correction' | 'expired';

type Adjustment = {
  adjustment: {
    id: number;
    productId: number;
    branchId: number | null;
    userId: number;
    adjustmentType: string;
    quantityBefore: number;
    quantityChange: number;
    quantityAfter: number;
    reason: string;
    serialNumber: string | null;
    reference: string | null;
    createdAt: Date;
  };
  productName: string;
  productCode: string | null;
};

type Transfer = {
  transfer: {
    id: number;
    productId: number;
    fromBranchId: number;
    toBranchId: number;
    quantity: number;
    status: string;
    notes: string | null;
    createdAt: Date;
  };
  productName: string;
};

type Tab = 'stock' | 'adjustments' | 'transfers' | 'counts';

type InventoryCount = {
  count: {
    id: number;
    countType: string;
    status: string;
    branchId: number;
    notes: string | null;
    createdAt: Date;
  };
  branchName: string | null;
};

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<Tab>('stock');
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [searchQuery, setSearchQuery] = useState('');
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [countDialogOpen, setCountDialogOpen] = useState(false);

  // Data states
  const [stockData, setStockData] = useState<StockItem[]>([]);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [counts, setCounts] = useState<InventoryCount[]>([]);

  // Summary stats
  const [totalItems, setTotalItems] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [lowStockItems, setLowStockItems] = useState(0);
  const [outOfStockItems, setOutOfStockItems] = useState(0);

  // Product & branch combobox data
  const [allProducts, setAllProducts] = useState<{ id: number; name: string; code: string }[]>([]);
  const [activeBranches, setActiveBranches] = useState<{ id: number; name: string; code: string; isMain: boolean }[]>([]);

  // Adjustment dialog combobox states
  const [adjProductOpen, setAdjProductOpen] = useState(false);
  const [adjBranchOpen, setAdjBranchOpen] = useState(false);

  // Transfer dialog combobox states
  const [transferProductOpen, setTransferProductOpen] = useState(false);
  const [transferFromBranchOpen, setTransferFromBranchOpen] = useState(false);
  const [transferToBranchOpen, setTransferToBranchOpen] = useState(false);

  // Count dialog combobox state
  const [countBranchOpen, setCountBranchOpen] = useState(false);

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

  // Transfer form state (keeping for UI compatibility)
  const [transferForm, setTransferForm] = useState({
    product: '',
    fromBranch: '',
    toBranch: '',
    quantity: '',
    notes: '',
  });

  // Count form state
  const [countForm, setCountForm] = useState({
    type: 'full' as 'full' | 'cycle' | 'spot' | 'annual',
    branchId: '',
    notes: '',
  });

  // Load products & branches for comboboxes on mount
  useEffect(() => {
    const loadComboboxData = async () => {
      try {
        const [productsResult, branchesResult] = await Promise.all([
          searchProducts(''),
          getActiveBranches(),
        ]);
        if (productsResult.success) {
          setAllProducts(productsResult.data as { id: number; name: string; code: string }[]);
        }
        if (branchesResult.success) {
          setActiveBranches(branchesResult.data as { id: number; name: string; code: string; isMain: boolean }[]);
        }
      } catch (error) {
        console.error('Failed to load combobox data:', error);
      }
    };
    loadComboboxData();
  }, []);

  // Load data
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);

      if (activeTab === 'stock') {
        const [inventoryResult, summaryResult] = await Promise.all([
          getInventory(),
          getInventorySummary(),
        ]);

        if (inventoryResult.success) {
          setStockData(inventoryResult.data as StockItem[]);
        }

        if (summaryResult.success) {
          const summary = summaryResult.data;
          setTotalItems(Number(summary.totalItems) || 0);
          setTotalQuantity(Number(summary.totalQuantity) || 0);
          setLowStockItems(Number(summary.lowStockCount) || 0);
          setOutOfStockItems(Number(summary.outOfStockCount) || 0);
        }
      } else if (activeTab === 'adjustments') {
        const result = await getStockAdjustments();
        if (result.success) {
          setAdjustments(result.data as Adjustment[]);
        }
      } else if (activeTab === 'transfers') {
        const result = await getStockTransfers();
        if (result.success) {
          setTransfers(result.data as Transfer[]);
        }
      } else if (activeTab === 'counts') {
        const result = await getInventoryCounts();
        if (result.success) {
          setCounts(result.data as InventoryCount[]);
        }
      }
    } catch (error) {
      console.error('Failed to load inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate filtered stock
  const filteredStock = stockData.filter((item) => {
    const matchesBranch =
      selectedBranch === 'All Branches' || item.branchName === selectedBranch;
    const matchesSearch =
      searchQuery === '' ||
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.productCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBranch && matchesSearch;
  });

  // Get stock status
  const getStockStatus = (quantity: number, minQuantity: number) => {
    if (quantity === 0) return 'out';
    if (quantity <= minQuantity) return 'low';
    return 'ok';
  };

  // Handle adjustment submission
  const handleAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await adjustStock({
        productId: Number(adjustmentForm.product),
        branchId: Number(adjustmentForm.branch),
        adjustmentType: adjustmentForm.type,
        quantityChange: Number(adjustmentForm.quantity),
        reason: adjustmentForm.reason,
        serialNumber: adjustmentForm.serialNumber || undefined,
        reference: adjustmentForm.reference || undefined,
      });

      if (result.success) {
        toast.success('Stock adjustment recorded successfully');
        setAdjustmentDialogOpen(false);
        setAdjustmentForm({
          product: '',
          branch: '',
          type: 'add',
          quantity: '',
          reason: '',
          serialNumber: '',
          reference: '',
        });
        loadData();
      } else {
        toast.error((result as any).message || 'Failed to record adjustment');
      }
    } catch (error) {
      console.error('Failed to record adjustment:', error);
      toast.error('Failed to record adjustment');
    }
  };

  // Handle transfer submission (placeholder - would need a createStockTransfer action)
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

  // Handle receiving a stock transfer
  const handleReceiveTransfer = async (transferId: number) => {
    try {
      const result = await receiveStockTransfer(transferId);
      if (result.success) {
        toast.success('Transfer received successfully');
        loadData();
      } else {
        toast.error((result as any).message || 'Failed to receive transfer');
      }
    } catch (error) {
      console.error('Failed to receive transfer:', error);
      toast.error('Failed to receive transfer');
    }
  };

  // Handle inventory count creation
  const handleCountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createInventoryCount({
        countType: countForm.type,
        branchId: countForm.branchId ? Number(countForm.branchId) : 1,
        notes: countForm.notes || undefined,
      });

      if (result.success) {
        toast.success('Inventory count created successfully');
        setCountDialogOpen(false);
        setCountForm({
          type: 'full',
          branchId: '',
          notes: '',
        });
        loadData();
      } else {
        toast.error('Failed to create inventory count');
      }
    } catch (error) {
      console.error('Failed to create count:', error);
      toast.error('Failed to create inventory count');
    }
  };

  // Handle product search in combobox
  const handleProductSearch = async (query: string) => {
    try {
      const result = await searchProducts(query);
      if (result.success) {
        setAllProducts(result.data as { id: number; name: string; code: string }[]);
      }
    } catch (error) {
      console.error('Failed to search products:', error);
    }
  };

  // Get unique branch names
  const branches = ['All Branches', ...Array.from(new Set(stockData.map(item => item.branchName).filter((b): b is string => b !== null)))];

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
            <Button
              variant={activeTab === 'counts' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('counts')}
              className={activeTab === 'counts' ? 'brass-glow' : ''}
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              Counts
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
                          <Label>Product</Label>
                          <Popover open={adjProductOpen} onOpenChange={setAdjProductOpen}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-between font-normal">
                                <span className="truncate">
                                  {adjustmentForm.product
                                    ? allProducts.find(p => String(p.id) === adjustmentForm.product)?.name || `Product #${adjustmentForm.product}`
                                    : 'Select product...'}
                                </span>
                                <ChevronsUpDown className="w-4 h-4 text-muted-foreground shrink-0" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0" align="start">
                              <Command shouldFilter={false}>
                                <CommandInput placeholder="Search products..." onValueChange={handleProductSearch} />
                                <CommandList>
                                  <CommandEmpty>No product found.</CommandEmpty>
                                  <CommandGroup>
                                    {allProducts.map((p) => (
                                      <CommandItem
                                        key={p.id}
                                        value={String(p.id)}
                                        onSelect={() => {
                                          setAdjustmentForm({ ...adjustmentForm, product: String(p.id) });
                                          setAdjProductOpen(false);
                                        }}
                                      >
                                        <Check className={cn('w-4 h-4 mr-2', adjustmentForm.product === String(p.id) ? 'opacity-100' : 'opacity-0')} />
                                        <div className="flex flex-col">
                                          <span>{p.name}</span>
                                          <span className="text-xs text-muted-foreground">{p.code}</span>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-2">
                          <Label>Branch</Label>
                          <Popover open={adjBranchOpen} onOpenChange={setAdjBranchOpen}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-between font-normal">
                                <span className="truncate">
                                  {adjustmentForm.branch
                                    ? activeBranches.find(b => String(b.id) === adjustmentForm.branch)?.name || `Branch #${adjustmentForm.branch}`
                                    : 'Select branch...'}
                                </span>
                                <ChevronsUpDown className="w-4 h-4 text-muted-foreground shrink-0" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0" align="start">
                              <Command>
                                <CommandInput placeholder="Search branches..." />
                                <CommandList>
                                  <CommandEmpty>No branch found.</CommandEmpty>
                                  <CommandGroup>
                                    {activeBranches.map((b) => (
                                      <CommandItem
                                        key={b.id}
                                        value={b.name}
                                        onSelect={() => {
                                          setAdjustmentForm({ ...adjustmentForm, branch: String(b.id) });
                                          setAdjBranchOpen(false);
                                        }}
                                      >
                                        <Check className={cn('w-4 h-4 mr-2', adjustmentForm.branch === String(b.id) ? 'opacity-100' : 'opacity-0')} />
                                        {b.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
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
                        <Label>Product</Label>
                        <Popover open={transferProductOpen} onOpenChange={setTransferProductOpen}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-between font-normal">
                              <span className="truncate">
                                {transferForm.product
                                  ? allProducts.find(p => String(p.id) === transferForm.product)?.name || `Product #${transferForm.product}`
                                  : 'Select product...'}
                              </span>
                              <ChevronsUpDown className="w-4 h-4 text-muted-foreground shrink-0" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-0" align="start">
                            <Command shouldFilter={false}>
                              <CommandInput placeholder="Search products..." onValueChange={handleProductSearch} />
                              <CommandList>
                                <CommandEmpty>No product found.</CommandEmpty>
                                <CommandGroup>
                                  {allProducts.map((p) => (
                                    <CommandItem
                                      key={p.id}
                                      value={String(p.id)}
                                      onSelect={() => {
                                        setTransferForm({ ...transferForm, product: String(p.id) });
                                        setTransferProductOpen(false);
                                      }}
                                    >
                                      <Check className={cn('w-4 h-4 mr-2', transferForm.product === String(p.id) ? 'opacity-100' : 'opacity-0')} />
                                      <div className="flex flex-col">
                                        <span>{p.name}</span>
                                        <span className="text-xs text-muted-foreground">{p.code}</span>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>From Branch</Label>
                          <Popover open={transferFromBranchOpen} onOpenChange={setTransferFromBranchOpen}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-between font-normal">
                                <span className="truncate">
                                  {transferForm.fromBranch
                                    ? activeBranches.find(b => String(b.id) === transferForm.fromBranch)?.name || `Branch #${transferForm.fromBranch}`
                                    : 'Select branch...'}
                                </span>
                                <ChevronsUpDown className="w-4 h-4 text-muted-foreground shrink-0" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0" align="start">
                              <Command>
                                <CommandInput placeholder="Search branches..." />
                                <CommandList>
                                  <CommandEmpty>No branch found.</CommandEmpty>
                                  <CommandGroup>
                                    {activeBranches.map((b) => (
                                      <CommandItem
                                        key={b.id}
                                        value={b.name}
                                        onSelect={() => {
                                          setTransferForm({ ...transferForm, fromBranch: String(b.id) });
                                          setTransferFromBranchOpen(false);
                                        }}
                                      >
                                        <Check className={cn('w-4 h-4 mr-2', transferForm.fromBranch === String(b.id) ? 'opacity-100' : 'opacity-0')} />
                                        {b.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-2">
                          <Label>To Branch</Label>
                          <Popover open={transferToBranchOpen} onOpenChange={setTransferToBranchOpen}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-between font-normal">
                                <span className="truncate">
                                  {transferForm.toBranch
                                    ? activeBranches.find(b => String(b.id) === transferForm.toBranch)?.name || `Branch #${transferForm.toBranch}`
                                    : 'Select branch...'}
                                </span>
                                <ChevronsUpDown className="w-4 h-4 text-muted-foreground shrink-0" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0" align="start">
                              <Command>
                                <CommandInput placeholder="Search branches..." />
                                <CommandList>
                                  <CommandEmpty>No branch found.</CommandEmpty>
                                  <CommandGroup>
                                    {activeBranches.map((b) => (
                                      <CommandItem
                                        key={b.id}
                                        value={b.name}
                                        onSelect={() => {
                                          setTransferForm({ ...transferForm, toBranch: String(b.id) });
                                          setTransferToBranchOpen(false);
                                        }}
                                      >
                                        <Check className={cn('w-4 h-4 mr-2', transferForm.toBranch === String(b.id) ? 'opacity-100' : 'opacity-0')} />
                                        {b.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
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

            {activeTab === 'counts' && (
              <Dialog open={countDialogOpen} onOpenChange={setCountDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="brass-glow">
                    <Plus className="h-4 w-4 mr-2" />
                    New Count
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <form onSubmit={handleCountSubmit}>
                    <DialogHeader>
                      <DialogTitle>Create Inventory Count</DialogTitle>
                      <DialogDescription>
                        Start a new inventory count session
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="count-type">Count Type</Label>
                        <Select
                          value={countForm.type}
                          onValueChange={(value) =>
                            setCountForm({ ...countForm, type: value as any })
                          }
                        >
                          <SelectTrigger id="count-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full">Full Count</SelectItem>
                            <SelectItem value="cycle">Cycle Count</SelectItem>
                            <SelectItem value="spot">Spot Check</SelectItem>
                            <SelectItem value="annual">Annual Count</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Branch (Optional)</Label>
                        <Popover open={countBranchOpen} onOpenChange={setCountBranchOpen}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-between font-normal">
                              <span className="truncate">
                                {countForm.branchId
                                  ? activeBranches.find(b => String(b.id) === countForm.branchId)?.name || `Branch #${countForm.branchId}`
                                  : 'All branches'}
                              </span>
                              <ChevronsUpDown className="w-4 h-4 text-muted-foreground shrink-0" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search branches..." />
                              <CommandList>
                                <CommandEmpty>No branch found.</CommandEmpty>
                                <CommandGroup>
                                  <CommandItem
                                    value="all-branches"
                                    onSelect={() => {
                                      setCountForm({ ...countForm, branchId: '' });
                                      setCountBranchOpen(false);
                                    }}
                                  >
                                    <Check className={cn('w-4 h-4 mr-2', countForm.branchId === '' ? 'opacity-100' : 'opacity-0')} />
                                    All branches
                                  </CommandItem>
                                  {activeBranches.map((b) => (
                                    <CommandItem
                                      key={b.id}
                                      value={b.name}
                                      onSelect={() => {
                                        setCountForm({ ...countForm, branchId: String(b.id) });
                                        setCountBranchOpen(false);
                                      }}
                                    >
                                      <Check className={cn('w-4 h-4 mr-2', countForm.branchId === String(b.id) ? 'opacity-100' : 'opacity-0')} />
                                      {b.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="count-notes">Notes (Optional)</Label>
                        <Textarea
                          id="count-notes"
                          placeholder="Additional notes..."
                          value={countForm.notes}
                          onChange={(e) =>
                            setCountForm({ ...countForm, notes: e.target.value })
                          }
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCountDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="brass-glow">
                        Create Count
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
          {loading ? (
            <PageLoader />
          ) : (
            <>
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
                        {filteredStock.length === 0 ? (
                          <TableRow className="border-border">
                            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                              No inventory items found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredStock.map((item) => {
                            const status = getStockStatus(item.inventory.quantity, item.inventory.minQuantity);
                            return (
                              <TableRow key={item.inventory.id} className="border-border">
                                <TableCell>
                                  <div>
                                    <div className="font-medium text-white">{item.productName}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {item.productCode}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>{item.branchName || 'N/A'}</TableCell>
                                <TableCell className="text-right font-medium">
                                  {item.inventory.quantity}
                                </TableCell>
                                <TableCell className="text-right">{item.inventory.minQuantity}</TableCell>
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
                                <TableCell className="text-right">{item.inventory.minQuantity}</TableCell>
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
                          })
                        )}
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
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adjustments.length === 0 ? (
                          <TableRow className="border-border">
                            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                              No adjustments found
                            </TableCell>
                          </TableRow>
                        ) : (
                          adjustments.map((adj) => (
                            <TableRow key={adj.adjustment.id} className="border-border">
                              <TableCell className="text-muted-foreground">
                                {new Date(adj.adjustment.createdAt).toLocaleString('en-PK')}
                              </TableCell>
                              <TableCell className="font-medium text-white">
                                {adj.productName}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    adj.adjustment.adjustmentType === 'add'
                                      ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                      : adj.adjustment.adjustmentType === 'remove'
                                        ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                        : adj.adjustment.adjustmentType === 'damage' || adj.adjustment.adjustmentType === 'theft'
                                          ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                          : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                  }
                                >
                                  {adj.adjustment.adjustmentType.charAt(0).toUpperCase() + adj.adjustment.adjustmentType.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">{adj.adjustment.quantityBefore}</TableCell>
                              <TableCell className="text-right">
                                <span
                                  className={adj.adjustment.quantityChange > 0 ? 'text-green-500' : 'text-red-500'}
                                >
                                  {adj.adjustment.quantityChange > 0 ? '+' : ''}
                                  {adj.adjustment.quantityChange}
                                </span>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {adj.adjustment.quantityAfter}
                              </TableCell>
                              <TableCell className="max-w-xs truncate">{adj.adjustment.reason}</TableCell>
                            </TableRow>
                          ))
                        )}
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
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transfers.length === 0 ? (
                          <TableRow className="border-border">
                            <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                              No transfers found
                            </TableCell>
                          </TableRow>
                        ) : (
                          transfers.map((transfer) => (
                            <TableRow key={transfer.transfer.id} className="border-border">
                              <TableCell className="text-muted-foreground">
                                {new Date(transfer.transfer.createdAt).toLocaleString('en-PK')}
                              </TableCell>
                              <TableCell className="font-medium text-white">
                                {transfer.productName}
                              </TableCell>
                              <TableCell>{transfer.transfer.fromBranchId}</TableCell>
                              <TableCell>{transfer.transfer.toBranchId}</TableCell>
                              <TableCell className="text-right font-medium">
                                {transfer.transfer.quantity}
                              </TableCell>
                              <TableCell>
                                {transfer.transfer.status === 'pending' && (
                                  <Badge
                                    variant="outline"
                                    className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                  >
                                    Pending
                                  </Badge>
                                )}
                                {transfer.transfer.status === 'in_transit' && (
                                  <Badge
                                    variant="outline"
                                    className="bg-blue-500/10 text-blue-500 border-blue-500/20"
                                  >
                                    In Transit
                                  </Badge>
                                )}
                                {transfer.transfer.status === 'completed' && (
                                  <Badge
                                    variant="outline"
                                    className="bg-green-500/10 text-green-500 border-green-500/20"
                                  >
                                    Completed
                                  </Badge>
                                )}
                                {transfer.transfer.status === 'cancelled' && (
                                  <Badge
                                    variant="outline"
                                    className="bg-red-500/10 text-red-500 border-red-500/20"
                                  >
                                    Cancelled
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="max-w-xs truncate">
                                {transfer.transfer.notes || '—'}
                              </TableCell>
                              <TableCell className="text-right">
                                {transfer.transfer.status === 'in_transit' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleReceiveTransfer(transfer.transfer.id)}
                                    className="h-8"
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Receive
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {activeTab === 'counts' && (
                <div className="space-y-4">
                  <div className="rounded-md border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-border">
                          <TableHead>ID</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Branch</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {counts.length === 0 ? (
                          <TableRow className="border-border">
                            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                              No inventory counts found
                            </TableCell>
                          </TableRow>
                        ) : (
                          counts.map((count) => (
                            <TableRow key={count.count.id} className="border-border">
                              <TableCell className="font-mono text-sm">#{count.count.id}</TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className="capitalize"
                                >
                                  {count.count.countType}
                                </Badge>
                              </TableCell>
                              <TableCell>{count.branchName || 'All Branches'}</TableCell>
                              <TableCell>
                                {count.count.status === 'draft' && (
                                  <Badge
                                    variant="outline"
                                    className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                  >
                                    Draft
                                  </Badge>
                                )}
                                {count.count.status === 'in_progress' && (
                                  <Badge
                                    variant="outline"
                                    className="bg-blue-500/10 text-blue-500 border-blue-500/20"
                                  >
                                    In Progress
                                  </Badge>
                                )}
                                {count.count.status === 'completed' && (
                                  <Badge
                                    variant="outline"
                                    className="bg-green-500/10 text-green-500 border-green-500/20"
                                  >
                                    Completed
                                  </Badge>
                                )}
                                {count.count.status === 'cancelled' && (
                                  <Badge
                                    variant="outline"
                                    className="bg-red-500/10 text-red-500 border-red-500/20"
                                  >
                                    Cancelled
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {new Date(count.count.createdAt).toLocaleString('en-PK')}
                              </TableCell>
                              <TableCell className="max-w-xs truncate">
                                {count.count.notes || '—'}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
