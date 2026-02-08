'use client'

import { useState } from 'react'
import {
  BookOpen,
  ShoppingCart,
  Package,
  Users,
  Warehouse,
  Receipt,
  RotateCcw,
  Truck,
  Wallet,
  BarChart3,
  Settings,
  UserCog,
  Building2,
  CreditCard,
  Headphones,
  ChevronRight,
  ChevronDown,
  Search,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Play,
  Target,
  Shield,
  Smartphone,
  Printer,
  FileText,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

/* ── Guide Section Types ── */
type GuideStep = {
  title: string
  description: string
}

type GuideSection = {
  id: string
  title: string
  icon: typeof BookOpen
  category: 'getting-started' | 'operations' | 'management' | 'troubleshooting'
  summary: string
  steps: GuideStep[]
  tips?: string[]
  warnings?: string[]
}

const guideSections: GuideSection[] = [
  /* ── Getting Started ── */
  {
    id: 'first-setup',
    title: 'First-Time Setup',
    icon: Play,
    category: 'getting-started',
    summary: 'Complete initial configuration to start using the system',
    steps: [
      { title: 'Log in to your account', description: 'Use the credentials provided by your administrator. On first login, you may be prompted to change your password.' },
      { title: 'Set up your business info', description: 'Go to Settings > Business Info and enter your company name, address, NTN, STRN, and dealer license number.' },
      { title: 'Configure tax settings', description: 'Go to Settings > Tax & Currency. Set your default tax rate (17% for Pakistan Sales Tax) and currency (PKR).' },
      { title: 'Create your first branch', description: 'Navigate to Branches and click "Add Branch". Enter name, code, address, and license number. Mark one branch as main.' },
      { title: 'Add staff accounts', description: 'Go to Users and click "Add User". Assign roles (Admin/Manager/Cashier) and link each user to a branch.' },
      { title: 'Add your products', description: 'Go to Products and start adding your inventory. Enable serial tracking for firearms. Set categories and pricing.' },
    ],
    tips: [
      'Complete business info first — it appears on all receipts and invoices.',
      'Only Admins can create other user accounts.',
      'Enable serial tracking for any product that requires individual unit tracking (firearms, optics, etc.).',
    ],
  },
  {
    id: 'understanding-roles',
    title: 'Understanding User Roles',
    icon: Shield,
    category: 'getting-started',
    summary: 'Learn what each role can do in the system',
    steps: [
      { title: 'Admin', description: 'Full system access. Can manage users, branches, settings, billing, view reports, and perform all operations. Typically the business owner.' },
      { title: 'Manager', description: 'Can process sales, manage products and inventory, view customers, handle returns, and access financial modules. Cannot manage users or system settings.' },
      { title: 'Cashier', description: 'Limited to POS operations — process sales, view products, look up customers. Cannot modify inventory, access financial data, or change settings.' },
    ],
    tips: [
      'Assign the minimum role needed for each staff member\'s duties.',
      'Only promote to Admin when full system access is absolutely necessary.',
    ],
  },

  /* ── Operations ── */
  {
    id: 'pos-sales',
    title: 'Processing a Sale (POS)',
    icon: ShoppingCart,
    category: 'operations',
    summary: 'Step-by-step guide to complete a point-of-sale transaction',
    steps: [
      { title: 'Open the POS page', description: 'Click "POS" in the sidebar. The split-screen view shows products on the left and cart on the right.' },
      { title: 'Select a customer', description: 'Use the customer search dropdown at the top of the cart. Type to search by name. Select "Walk-in Customer" for anonymous sales.' },
      { title: 'Add products to cart', description: 'Click product cards on the left or use the search bar to find items. Use category chips to filter products.' },
      { title: 'Enter serial numbers', description: 'For serial-tracked items (firearms), a dialog will prompt you to enter the serial number when adding to cart.' },
      { title: 'Adjust quantities', description: 'Use the + and - buttons on cart items to increase or decrease quantity. Click the trash icon to remove an item.' },
      { title: 'Apply discount (optional)', description: 'Enter a discount amount in the order summary section. This reduces the total before tax.' },
      { title: 'Choose payment method', description: 'Select Cash, Card, Credit, or Mobile payment. For cash, enter the amount received to calculate change.' },
      { title: 'Complete the sale', description: 'Click "Complete Sale" to finalize. The receipt will be generated automatically.' },
    ],
    tips: [
      'Use "Hold" to save a cart and come back to it later — useful when a customer needs to step away.',
      'The barcode button next to search allows scanning product barcodes directly.',
      'Credit sales are tracked in Receivables and must be settled later.',
    ],
    warnings: [
      'Serial numbers are required for tracked items and must be unique — the system will reject duplicates.',
      'Voiding a completed sale requires Manager or Admin privileges.',
    ],
  },
  {
    id: 'products-management',
    title: 'Managing Products',
    icon: Package,
    category: 'operations',
    summary: 'Add, edit, and organize your product catalog',
    steps: [
      { title: 'Navigate to Products', description: 'Click "Products" in the sidebar to view your full catalog with search and filter options.' },
      { title: 'Add a new product', description: 'Click "Add Product" and fill in: name, code, category, price, cost, and tax settings. Enable serial tracking for firearms.' },
      { title: 'Search and filter', description: 'Use the search bar to find products by name, code, or barcode. Filter by category or status (Active/Inactive).' },
      { title: 'Edit product details', description: 'Click the edit icon on any product row to modify its details, pricing, or tracking settings.' },
      { title: 'Deactivate products', description: 'Instead of deleting, deactivate products you no longer sell. They will be hidden from POS but remain in records.' },
    ],
    tips: [
      'Use consistent product codes (e.g., FIR-001, AMM-001) for easy identification.',
      'Set accurate cost prices to get correct profit margins in reports.',
      'Categories help organize POS product grid — create categories like Firearms, Ammunition, Accessories, Optics.',
    ],
  },
  {
    id: 'customer-management',
    title: 'Managing Customers',
    icon: Users,
    category: 'operations',
    summary: 'Maintain customer records with license and ID tracking',
    steps: [
      { title: 'Go to Customers page', description: 'Click "Customers" in the sidebar. View all registered customers with search and status filters.' },
      { title: 'Add a new customer', description: 'Click "Add Customer". Enter first name, last name, CNIC/passport, phone, email, and firearm license details.' },
      { title: 'Track firearm licenses', description: 'Enter the customer\'s firearm license number and expiry date. The system shows license status badges (Valid, Expiring Soon, Expired).' },
      { title: 'Search customers', description: 'Search by name, CNIC, phone, or license number. Filter by Active/Inactive status.' },
    ],
    tips: [
      'Always record CNIC for firearm sales — it is a legal requirement.',
      'The system alerts you when a customer\'s license is expiring within 30 days.',
      'Walk-in customers are used for quick sales where customer details are not needed.',
    ],
    warnings: [
      'Never sell firearms to customers with expired licenses. The system will show a warning badge.',
    ],
  },
  {
    id: 'inventory-ops',
    title: 'Inventory Management',
    icon: Warehouse,
    category: 'operations',
    summary: 'Track stock levels, adjustments, and inter-branch transfers',
    steps: [
      { title: 'View stock levels', description: 'Go to Inventory > Stock Levels tab. See current stock for each product with status indicators (In Stock, Low, Out of Stock).' },
      { title: 'Make stock adjustments', description: 'Click "Adjust Stock" to record additions, removals, or corrections. Select adjustment type: Received, Damaged, Lost, Returned, Correction, or Audit.' },
      { title: 'Transfer between branches', description: 'Click "Transfer" to move stock from one branch to another. Select source branch, destination, products, and quantities.' },
      { title: 'Filter by branch', description: 'Use the branch filter to view stock for a specific location.' },
    ],
    tips: [
      'Run regular stock audits and use "Audit" adjustment type to correct discrepancies.',
      'Low stock warnings trigger at the threshold set in Settings > Notifications.',
      'Transfers require Manager or Admin access.',
    ],
  },
  {
    id: 'sales-history',
    title: 'Sales History & Voiding',
    icon: Receipt,
    category: 'operations',
    summary: 'Review past sales and process voids',
    steps: [
      { title: 'Open Sales page', description: 'Click "Sales" in the sidebar. View all completed transactions with filters.' },
      { title: 'Search and filter', description: 'Search by sale number or customer name. Filter by payment method (Cash/Card/Credit/Mobile), status, or voided sales.' },
      { title: 'View sale details', description: 'Click "View" on any sale to see full details: items, quantities, prices, payment breakdown, and serial numbers.' },
      { title: 'Void a sale', description: 'Click "Void" on a sale, enter the reason for voiding, and confirm. Voided sales are marked but preserved for audit.' },
    ],
    warnings: [
      'Voided sales cannot be un-voided. Always double-check before confirming.',
      'Voiding restocks items automatically if the sale included inventory-tracked products.',
    ],
  },
  {
    id: 'returns',
    title: 'Processing Returns',
    icon: RotateCcw,
    category: 'operations',
    summary: 'Handle product returns and restocking',
    steps: [
      { title: 'Go to Returns', description: 'Click "Returns" in the sidebar to view all return records.' },
      { title: 'Start a new return', description: 'Click "New Return". First look up the original sale by sale number.' },
      { title: 'Select items to return', description: 'Choose which items from the sale are being returned. Specify quantity, condition, and whether the item is restockable.' },
      { title: 'Set return type', description: 'Choose Refund, Exchange, or Store Credit depending on the return policy.' },
      { title: 'Complete the return', description: 'Confirm the return. Restockable items are automatically added back to inventory.' },
    ],
    tips: [
      'Exchange returns allow swapping for a different product in the same transaction.',
      'Store credit is tracked per customer and can be applied to future sales.',
    ],
  },
  {
    id: 'suppliers',
    title: 'Managing Suppliers',
    icon: Truck,
    category: 'operations',
    summary: 'Maintain supplier contacts and track procurement',
    steps: [
      { title: 'Open Suppliers page', description: 'Click "Suppliers" in the sidebar. View all registered suppliers with search and filter.' },
      { title: 'Add a new supplier', description: 'Click "Add Supplier". Enter company name, contact person, phone, email, NTN, and payment terms.' },
      { title: 'Track supplier details', description: 'Each supplier card shows contact info, payment terms, and active status.' },
    ],
    tips: [
      'Set payment terms (Net 30, Net 60, etc.) to track payable deadlines.',
      'Link suppliers to purchase orders for clear procurement tracking.',
    ],
  },

  /* ── Management ── */
  {
    id: 'branches',
    title: 'Branch Setup & Management',
    icon: Building2,
    category: 'management',
    summary: 'Configure multi-location branch network',
    steps: [
      { title: 'Navigate to Branches', description: 'Click "Branches" in the sidebar under Management.' },
      { title: 'Add a branch', description: 'Click "Add Branch". Enter branch name, unique code, address, phone, email, and dealer license number.' },
      { title: 'Set main branch', description: 'Toggle "Set as main branch" for your primary location. Only one branch can be main.' },
      { title: 'Manage status', description: 'Deactivate branches that are temporarily closed. This prevents new sales from that location.' },
    ],
  },
  {
    id: 'user-accounts',
    title: 'User Account Management',
    icon: UserCog,
    category: 'management',
    summary: 'Create and manage staff accounts with role-based access',
    steps: [
      { title: 'Go to Users', description: 'Click "Users" in the sidebar. View all staff with role badges and status.' },
      { title: 'Create a user', description: 'Click "Add User". Enter full name, username, email, phone, password, role, and branch assignment.' },
      { title: 'Filter users', description: 'Filter by role (Admin/Manager/Cashier) or status (Active/Inactive).' },
      { title: 'Deactivate accounts', description: 'Deactivate rather than delete — preserves audit trail while revoking access.' },
    ],
    warnings: [
      'Never share admin credentials. Create individual accounts for each staff member.',
      'Deactivated users cannot log in but their past activity remains in audit logs.',
    ],
  },
  {
    id: 'settings-config',
    title: 'System Settings',
    icon: Settings,
    category: 'management',
    summary: 'Configure business, tax, receipt, notification, and security settings',
    steps: [
      { title: 'Business Info', description: 'Set company name, NTN, STRN, dealer license, address, and contact info. This appears on all receipts.' },
      { title: 'Tax & Currency', description: 'Set default tax rate (17% for Pakistan), currency (PKR), and whether prices are tax-inclusive.' },
      { title: 'Receipt Settings', description: 'Configure receipt width (58mm/80mm/A4), header/footer text, and what information to display.' },
      { title: 'Notifications', description: 'Enable/disable low stock alerts, license expiry reminders, daily summaries, and security alerts.' },
      { title: 'Security', description: 'Configure password requirements, 2FA, auto-logout timeout, and audit trail settings.' },
    ],
    tips: [
      'Set up receipt settings before processing your first sale.',
      'Enable audit trail to maintain compliance records.',
    ],
  },
  {
    id: 'receipt-printing',
    title: 'Receipt & Invoice Printing',
    icon: Printer,
    category: 'management',
    summary: 'Set up and troubleshoot receipt printing',
    steps: [
      { title: 'Configure receipt layout', description: 'Go to Settings > Receipt. Choose width (58mm for small printers, 80mm standard, A4 for full invoices).' },
      { title: 'Set header and footer', description: 'Add your business name, license number in header. Add return policy or thank-you message in footer.' },
      { title: 'Enable serial numbers', description: 'Toggle "Show Serial Numbers" to print serial numbers on receipts for tracked items.' },
      { title: 'Print a receipt', description: 'After completing a sale, the receipt generates automatically. Click the print icon to send to your connected printer.' },
    ],
  },

  /* ── Troubleshooting ── */
  {
    id: 'common-issues',
    title: 'Common Issues & Solutions',
    icon: AlertTriangle,
    category: 'troubleshooting',
    summary: 'Quick fixes for frequently encountered problems',
    steps: [
      { title: 'Cannot log in', description: 'Check username/email and password. If forgotten, use "Forgot Password" on the login page. Contact your admin if account is deactivated.' },
      { title: 'Product not showing in POS', description: 'Ensure the product is marked as "Active" and has stock > 0. Check that the product\'s branch matches your current branch.' },
      { title: 'Serial number rejected', description: 'Serial numbers must be unique across the system. Check if this serial was already used in another sale or is recorded in inventory.' },
      { title: 'Cannot void a sale', description: 'Only Managers and Admins can void sales. If you\'re a Cashier, ask your Manager to process the void.' },
      { title: 'Low stock alert not showing', description: 'Check Settings > Notifications — ensure "Low Stock Alerts" is enabled. Verify the minimum stock threshold is configured.' },
      { title: 'Receipt not printing', description: 'Verify printer connection and paper. Check Settings > Receipt for correct width. Try a test print from your browser\'s print dialog.' },
      { title: 'Page loading slowly', description: 'Clear browser cache, check your internet connection. If the issue persists, contact support.' },
    ],
  },
  {
    id: 'keyboard-shortcuts',
    title: 'Tips & Shortcuts',
    icon: Lightbulb,
    category: 'troubleshooting',
    summary: 'Work faster with these productivity tips',
    steps: [
      { title: 'Quick search in POS', description: 'Start typing a product name or code in the POS search bar — results filter in real-time.' },
      { title: 'Barcode scanning', description: 'Click the barcode icon next to the POS search bar, then scan. The product is added to cart automatically.' },
      { title: 'Hold & resume carts', description: 'Click "Hold" to save the current cart. Resume it later from the held orders section.' },
      { title: 'Bulk stock adjustments', description: 'Use the Inventory > Adjustments tab to process multiple stock corrections at once during audits.' },
      { title: 'Quick customer lookup', description: 'The customer dropdown in POS supports type-ahead search — just start typing the name.' },
      { title: 'Filter combinations', description: 'Combine search with dropdown filters on any list page for precise results.' },
    ],
  },
]

const categoryLabels: Record<string, { label: string; color: string }> = {
  'getting-started': { label: 'Getting Started', color: 'text-green-400' },
  operations: { label: 'Operations', color: 'text-blue-400' },
  management: { label: 'Management', color: 'text-primary' },
  troubleshooting: { label: 'Troubleshooting', color: 'text-amber-400' },
}

export default function GuidePage() {
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>('first-setup')
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const filtered = guideSections.filter((s) => {
    if (activeCategory !== 'all' && s.category !== activeCategory) return false
    if (search) {
      const q = search.toLowerCase()
      if (
        !s.title.toLowerCase().includes(q) &&
        !s.summary.toLowerCase().includes(q) &&
        !s.steps.some((st) => st.title.toLowerCase().includes(q) || st.description.toLowerCase().includes(q))
      ) return false
    }
    return true
  })

  const categories = ['all', 'getting-started', 'operations', 'management', 'troubleshooting']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">How-To Guide</h1>
        <p className="text-sm text-muted-foreground mt-1">Operational and logical guides for using the Firearms POS system</p>
      </div>

      {/* Quick Start Banner */}
      <Card className="card-tactical border-primary/20 bg-primary/5">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-base">Welcome to Firearms POS</h2>
              <p className="text-sm text-muted-foreground mt-1">
                New to the system? Start with the <button className="text-primary font-medium hover:underline" onClick={() => { setActiveCategory('getting-started'); setExpandedId('first-setup') }}>First-Time Setup</button> guide
                to configure your business, then learn how to <button className="text-primary font-medium hover:underline" onClick={() => { setActiveCategory('operations'); setExpandedId('pos-sales') }}>process your first sale</button>.
              </p>
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                  <span>{guideSections.length} guides available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                  <span>Step-by-step instructions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pro tips included</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search + Category Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search guides..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {cat === 'all' ? 'All' : categoryLabels[cat]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Guide Sections */}
      <div className="space-y-3">
        {filtered.map((section) => {
          const isExpanded = expandedId === section.id
          const catInfo = categoryLabels[section.category]

          return (
            <Card key={section.id} className="card-tactical overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : section.id)}
                className="w-full text-left"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <section.icon className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{section.title}</h3>
                        <Badge variant="outline" className={`text-[9px] ${catInfo.color} border-current/20`}>
                          {catInfo.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{section.summary}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-muted-foreground">{section.steps.length} steps</span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </button>

              {isExpanded && (
                <div className="border-t border-border/50 px-4 pb-4">
                  {/* Steps */}
                  <div className="mt-4 space-y-0">
                    {section.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                            {idx + 1}
                          </div>
                          {idx < section.steps.length - 1 && (
                            <div className="w-px flex-1 bg-border/50 my-1" />
                          )}
                        </div>
                        <div className="pb-4">
                          <p className="text-sm font-medium">{step.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tips */}
                  {section.tips && section.tips.length > 0 && (
                    <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Lightbulb className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-semibold text-primary">Pro Tips</span>
                      </div>
                      <ul className="space-y-1.5">
                        {section.tips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <ArrowRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Warnings */}
                  {section.warnings && section.warnings.length > 0 && (
                    <div className="mt-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                      <div className="flex items-center gap-1.5 mb-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-xs font-semibold text-amber-500">Important</span>
                      </div>
                      <ul className="space-y-1.5">
                        {section.warnings.map((warn, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                            <span>{warn}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No guides found matching your search</p>
            <p className="text-xs mt-1">Try different keywords or clear the filter</p>
          </div>
        )}
      </div>

      {/* Need More Help */}
      <Card className="card-tactical border-border/30">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Headphones className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">Need more help?</p>
                <p className="text-xs text-muted-foreground">Contact the developer for personalized assistance</p>
              </div>
            </div>
            <a href="/support">
              <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 text-primary border-primary/20 transition-colors">
                Go to Support
                <ArrowRight className="w-3 h-3 ml-1" />
              </Badge>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
