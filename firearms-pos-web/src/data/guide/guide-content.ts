import {
  Play,
  ShoppingCart,
  Package,
  Warehouse,
  Receipt,
  Users,
  RotateCcw,
  Truck,
  FolderTree,
  Layers,
  CreditCard,
  HandCoins,
  ArrowDownToLine,
  ArrowUpFromLine,
  Banknote,
  UserCheck,
  Percent,
  BadgePercent,
  FileText,
  BookOpen,
  PenLine,
  Wrench,
  BarChart3,
  ListTodo,
  MessageSquare,
  ClipboardList,
  FileBarChart,
  UserCog,
  Building,
  Settings,
  Wallet,
  Headphones,
  AlertTriangle,
  Lightbulb,
  LayoutDashboard,
  Target,
  Store,
  TrendingUp,
  Calculator,
  Shield,
} from 'lucide-react'
import type { WorkflowPhase, GuideSection } from './types'

/* ═══════════════════════════════════════════════════════════════
   WORKFLOW OVERVIEW — 6 Business Phases
   ═══════════════════════════════════════════════════════════════ */

export const workflowIntro = {
  en: 'This guide walks you through every step of running your business — from initial setup to daily sales to monthly accounting. Follow the phases in order if you are new, or jump to any module you need help with.',
  ur: 'یہ گائیڈ آپ کو کاروبار چلانے کے ہر مرحلے میں رہنمائی کرتا ہے — ابتدائی سیٹ اپ سے لے کر روزانہ کی فروخت اور ماہانہ حسابات تک۔ اگر آپ نئے ہیں تو مراحل کو ترتیب سے فالو کریں، یا کسی بھی ماڈیول پر جائیں جہاں آپ کو مدد چاہیے۔',
}

export const workflowPhases: WorkflowPhase[] = [
  {
    id: 'phase-setup',
    title: { en: 'Initial Setup (One-Time)', ur: 'ابتدائی سیٹ اپ (ایک بار)' },
    description: {
      en: 'Before you can sell anything, set up your business info, create branches, add staff accounts, configure tax rates, and organize your product categories. This is done once when you start using the system.',
      ur: 'کچھ بھی فروخت کرنے سے پہلے، اپنے کاروبار کی معلومات درج کریں، برانچیں بنائیں، عملے کے اکاؤنٹس شامل کریں، ٹیکس کی شرح مقرر کریں، اور پروڈکٹ کیٹیگریز ترتیب دیں۔ یہ سسٹم شروع کرتے وقت صرف ایک بار کیا جاتا ہے۔',
    },
    modules: ['settings', 'branches', 'users', 'categories', 'chart-of-accounts'],
    icon: Play,
  },
  {
    id: 'phase-stock',
    title: { en: 'Stock Up: Getting Products Ready', ur: 'اسٹاک تیار کریں: پروڈکٹس شامل کرنا' },
    description: {
      en: 'Add your suppliers, register your products with prices and serial tracking, create purchase orders for incoming stock, and manage your inventory levels across branches.',
      ur: 'اپنے سپلائرز شامل کریں، قیمتوں اور سیریل ٹریکنگ کے ساتھ پروڈکٹس رجسٹر کریں، آنے والے اسٹاک کے لیے خریداری کے آرڈرز بنائیں، اور برانچوں میں اپنی انوینٹری کا انتظام کریں۔',
    },
    modules: ['suppliers', 'products', 'purchases', 'inventory'],
    icon: Package,
  },
  {
    id: 'phase-sell',
    title: { en: 'Daily Operations: Selling', ur: 'روزمرہ کام: فروخت' },
    description: {
      en: 'Open your cash register, process sales through the Point of Sale, manage customer records with firearm licenses, handle returns, and use POS tabs for running orders.',
      ur: 'اپنا کیش رجسٹر کھولیں، پوائنٹ آف سیل سے فروخت کریں، فائر آرم لائسنس کے ساتھ کسٹمر ریکارڈ رکھیں، واپسیاں سنبھالیں، اور جاری آرڈرز کے لیے POS ٹیبز استعمال کریں۔',
    },
    modules: ['cash-register', 'pos', 'sales', 'customers', 'returns', 'pos-tabs'],
    icon: Store,
  },
  {
    id: 'phase-money',
    title: { en: 'Money Tracking: Where Did It All Go?', ur: 'رقم کی نگرانی: پیسے کہاں گئے؟' },
    description: {
      en: 'Track your business expenses, manage what you owe (payables) and what others owe you (receivables), handle commissions, tax collections, vouchers, and discounts.',
      ur: 'اپنے کاروبار کے اخراجات ٹریک کریں، جو آپ نے دینا ہے (واجبات الادا) اور جو دوسروں نے آپ کو دینا ہے (قابل وصول رقم) کا انتظام کریں، کمیشن، ٹیکس وصولی، واؤچرز اور ڈسکاؤنٹ سنبھالیں۔',
    },
    modules: ['expenses', 'payables', 'receivables', 'commissions', 'referrals', 'vouchers', 'tax-collections', 'discounts'],
    icon: TrendingUp,
  },
  {
    id: 'phase-accounting',
    title: { en: 'Accounting & Reports', ur: 'حسابات اور رپورٹیں' },
    description: {
      en: 'Review your journal entries (the diary of every transaction), check your chart of accounts, track service income, and generate financial reports like Balance Sheet and Profit & Loss.',
      ur: 'اپنی جرنل انٹریز (ہر لین دین کی ڈائری) کا جائزہ لیں، چارٹ آف اکاؤنٹس چیک کریں، سروس کی آمدنی ٹریک کریں، اور بیلنس شیٹ اور نفع و نقصان جیسی مالیاتی رپورٹیں بنائیں۔',
    },
    modules: ['journal-entries', 'chart-of-accounts', 'services', 'reports'],
    icon: Calculator,
  },
  {
    id: 'phase-admin',
    title: { en: 'Administration & Oversight', ur: 'انتظامیہ اور نگرانی' },
    description: {
      en: 'Manage tasks, communicate with staff, review audit logs and reports, handle user accounts, manage billing, and get support when needed.',
      ur: 'کام کا انتظام کریں، عملے سے بات چیت کریں، آڈٹ لاگز اور رپورٹس دیکھیں، صارف اکاؤنٹس کا انتظام کریں، بلنگ سنبھالیں، اور ضرورت پڑنے پر سپورٹ حاصل کریں۔',
    },
    modules: ['todos', 'messages', 'audit-logs', 'audit-reports', 'users', 'branches', 'settings', 'billing', 'support'],
    icon: Shield,
  },
]

/* ═══════════════════════════════════════════════════════════════
   PER-MODULE GUIDES — 35 Sections
   ═══════════════════════════════════════════════════════════════ */

export const guideSections: GuideSection[] = [
  /* ──────────────────────────────────────────────
     OPERATIONS (10 modules)
     ────────────────────────────────────────────── */
  {
    id: 'dashboard',
    title: { en: 'Dashboard', ur: 'ڈیش بورڈ' },
    icon: LayoutDashboard,
    category: 'operations',
    summary: {
      en: 'Your business at a glance — sales, revenue, stock alerts',
      ur: 'آپ کے کاروبار کا مکمل جائزہ — فروخت، آمدنی، اسٹاک الرٹس',
    },
    steps: [
      {
        title: { en: 'Understanding KPI Cards', ur: 'KPI کارڈز کو سمجھنا' },
        description: {
          en: 'At the top of the dashboard, you\'ll see 4 cards: Today\'s Sales (total revenue today), Orders Today (number of transactions), Products (total items + low stock count), and Revenue MTD (month-to-date earnings). Green arrows mean improvement over yesterday/last month, red arrows mean a decline.',
          ur: 'ڈیش بورڈ کے اوپر 4 کارڈز نظر آئیں گے: آج کی فروخت (آج کی کل آمدنی)، آج کے آرڈرز (لین دین کی تعداد)، پروڈکٹس (کل اشیاء + کم اسٹاک)، اور ماہانہ آمدنی۔ سبز تیر بہتری کی نشاندہی کرتے ہیں، سرخ تیر کمی کی۔',
        },
      },
      {
        title: { en: 'Recent Sales List', ur: 'حالیہ فروخت کی فہرست' },
        description: {
          en: 'Below the KPI cards, the "Recent Sales" section shows the last 5 transactions with customer name, invoice number, time, amount, and payment method. This helps you quickly verify recent activity.',
          ur: 'KPI کارڈز کے نیچے "حالیہ فروخت" میں آخری 5 لین دین نظر آتے ہیں جن میں کسٹمر کا نام، انوائس نمبر، وقت، رقم اور ادائیگی کا طریقہ شامل ہوتا ہے۔',
        },
      },
      {
        title: { en: 'Low Stock Alerts', ur: 'کم اسٹاک الرٹس' },
        description: {
          en: 'The "Low Stock Alerts" panel shows products running low. Red badges mean critically low (2 or fewer), amber badges mean approaching minimum. Click on any product to go to inventory.',
          ur: '"کم اسٹاک الرٹس" پینل میں وہ پروڈکٹس دکھائی دیتی ہیں جن کا اسٹاک کم ہو رہا ہے۔ سرخ بیج انتہائی کم (2 یا کم) اور نارنجی بیج کم ہونے والے اسٹاک کی نشاندہی کرتے ہیں۔',
        },
      },
    ],
    tips: [
      {
        en: 'Check the dashboard first thing every morning to see overnight online sales and stock alerts.',
        ur: 'ہر صبح سب سے پہلے ڈیش بورڈ چیک کریں تاکہ رات کی فروخت اور اسٹاک الرٹس دیکھ سکیں۔',
      },
    ],
  },
  {
    id: 'pos',
    title: { en: 'Point of Sale (POS)', ur: 'پوائنٹ آف سیل (POS)' },
    icon: ShoppingCart,
    category: 'operations',
    summary: {
      en: 'Process sales — add products, select customer, choose payment method, complete transaction',
      ur: 'فروخت کریں — پروڈکٹس شامل کریں، کسٹمر منتخب کریں، ادائیگی کا طریقہ چنیں، لین دین مکمل کریں',
    },
    steps: [
      {
        title: { en: 'Open the POS Page', ur: 'POS صفحہ کھولیں' },
        description: {
          en: 'Click "POS" in the sidebar. You\'ll see a split screen: products on the left, your cart on the right.',
          ur: 'سائیڈبار میں "POS" پر کلک کریں۔ آپ کو تقسیم اسکرین نظر آئے گی: بائیں طرف پروڈکٹس، دائیں طرف آپ کا کارٹ۔',
        },
      },
      {
        title: { en: 'Search and Add Products', ur: 'پروڈکٹس تلاش کریں اور شامل کریں' },
        description: {
          en: 'Type a product name or code in the search bar, or use category chips to filter. Click a product card to add it to the cart. If the product has serial tracking (firearms), a dialog will ask for the serial number.',
          ur: 'سرچ بار میں پروڈکٹ کا نام یا کوڈ ٹائپ کریں، یا کیٹیگری چپس سے فلٹر کریں۔ کسی پروڈکٹ کارڈ پر کلک کر کے اسے کارٹ میں شامل کریں۔ اگر پروڈکٹ میں سیریل ٹریکنگ ہے (فائر آرمز) تو سیریل نمبر مانگا جائے گا۔',
        },
      },
      {
        title: { en: 'Select a Customer', ur: 'کسٹمر منتخب کریں' },
        description: {
          en: 'Use the customer dropdown at the top of the cart. Search by name. For anonymous sales, use "Walk-in Customer" (selected by default).',
          ur: 'کارٹ کے اوپر کسٹمر ڈراپ ڈاؤن استعمال کریں۔ نام سے تلاش کریں۔ بغیر نام فروخت کے لیے "Walk-in Customer" استعمال کریں (پہلے سے منتخب)۔',
        },
      },
      {
        title: { en: 'Adjust Quantities', ur: 'مقدار تبدیل کریں' },
        description: {
          en: 'Use the + and - buttons on each cart item to change quantity. Click the trash icon to remove an item completely.',
          ur: 'ہر کارٹ آئٹم پر + اور - بٹن سے مقدار تبدیل کریں۔ کسی آئٹم کو مکمل ہٹانے کے لیے ٹریش آئیکن پر کلک کریں۔',
        },
      },
      {
        title: { en: 'Apply Discount (Optional)', ur: 'ڈسکاؤنٹ لگائیں (اختیاری)' },
        description: {
          en: 'Enter a discount amount in the order summary section. This reduces the total before tax calculation.',
          ur: 'آرڈر سمری سیکشن میں ڈسکاؤنٹ کی رقم درج کریں۔ یہ ٹیکس سے پہلے کل رقم کم کر دیتی ہے۔',
        },
      },
      {
        title: { en: 'Choose Payment Method', ur: 'ادائیگی کا طریقہ چنیں' },
        description: {
          en: 'Select from the payment buttons: Cash, Card, Credit, Mobile, COD, or Bank Transfer (whichever your admin has enabled in Settings > Sales & Payments). For cash payments, enter the amount tendered and the system calculates change automatically.',
          ur: 'ادائیگی کے بٹنوں میں سے منتخب کریں: کیش، کارڈ، کریڈٹ، موبائل، COD، یا بینک ٹرانسفر (جو بھی ایڈمن نے سیٹنگز میں فعال کیا ہو)۔ کیش ادائیگی کے لیے دی گئی رقم درج کریں اور سسٹم خود بخود بقایا حساب لگائے گا۔',
        },
      },
      {
        title: { en: 'Complete the Sale', ur: 'فروخت مکمل کریں' },
        description: {
          en: 'Click "Complete Sale" to finalize the transaction. A receipt is generated automatically. The cart resets for the next sale.',
          ur: '"Complete Sale" پر کلک کریں۔ رسید خود بخود بنے گی۔ کارٹ اگلی فروخت کے لیے خالی ہو جائے گا۔',
        },
      },
      {
        title: { en: 'Hold an Order', ur: 'آرڈر روکیں' },
        description: {
          en: 'If a customer needs to step away, click "Hold Order" to save the current cart. You can resume it later from the POS Tabs page.',
          ur: 'اگر کسٹمر کو جانا ہو تو "Hold Order" پر کلک کر کے موجودہ کارٹ محفوظ کریں۔ بعد میں POS ٹیبز سے دوبارہ شروع کر سکتے ہیں۔',
        },
      },
    ],
    examples: [
      {
        label: { en: 'Example: Selling a Firearm', ur: 'مثال: ایک فائر آرم فروخت کرنا' },
        fields: [
          { name: { en: 'Product', ur: 'پروڈکٹ' }, value: 'Glock 19 Gen 5' },
          { name: { en: 'Serial Number', ur: 'سیریل نمبر' }, value: 'GLK-2024-00847' },
          { name: { en: 'Customer', ur: 'کسٹمر' }, value: 'Ahmad Ali (CNIC: 35201-XXXXXXX-X)' },
          { name: { en: 'Price', ur: 'قیمت' }, value: 'Rs. 450,000' },
          { name: { en: 'Payment', ur: 'ادائیگی' }, value: 'Cash — Tendered Rs. 500,000, Change Rs. 50,000' },
        ],
      },
    ],
    tips: [
      {
        en: 'Use the search bar for fastest product lookup — type any part of the name or product code.',
        ur: 'تیز ترین پروڈکٹ تلاش کے لیے سرچ بار استعمال کریں — نام یا کوڈ کا کوئی بھی حصہ ٹائپ کریں۔',
      },
      {
        en: 'Credit sales automatically create a receivable entry — you can track it in the Receivables module.',
        ur: 'ادھار فروخت خود بخود قابل وصول انٹری بناتی ہے — آپ اسے Receivables ماڈیول میں ٹریک کر سکتے ہیں۔',
      },
    ],
    warnings: [
      {
        en: 'Serial numbers are required for tracked items (firearms) and must be unique. The system will reject duplicates.',
        ur: 'ٹریک شدہ اشیاء (فائر آرمز) کے لیے سیریل نمبر لازمی ہیں اور منفرد ہونے چاہئیں۔ سسٹم ڈپلیکیٹ مسترد کر دے گا۔',
      },
      {
        en: 'Always verify the customer\'s firearm license is valid before selling firearms. Check the license badge on their profile.',
        ur: 'فائر آرم فروخت کرنے سے پہلے ہمیشہ کسٹمر کے فائر آرم لائسنس کی تصدیق کریں۔ ان کے پروفائل پر لائسنس بیج چیک کریں۔',
      },
    ],
  },
  {
    id: 'products',
    title: { en: 'Products', ur: 'پروڈکٹس' },
    icon: Package,
    category: 'operations',
    summary: {
      en: 'Add and manage your product catalog with prices, categories, and serial tracking',
      ur: 'قیمتوں، کیٹیگریز اور سیریل ٹریکنگ کے ساتھ اپنی پروڈکٹ کیٹلاگ کا انتظام کریں',
    },
    steps: [
      {
        title: { en: 'Navigate to Products', ur: 'پروڈکٹس پر جائیں' },
        description: {
          en: 'Click "Products" in the sidebar. You\'ll see your full product catalog with search, category filters, and status filters.',
          ur: 'سائیڈبار میں "Products" پر کلک کریں۔ سرچ، کیٹیگری فلٹرز اور سٹیٹس فلٹرز کے ساتھ مکمل پروڈکٹ کیٹلاگ نظر آئے گی۔',
        },
      },
      {
        title: { en: 'Add a New Product', ur: 'نئی پروڈکٹ شامل کریں' },
        description: {
          en: 'Click "Add Product". Fill in: Product Name, Product Code (unique identifier like FIR-001), Category, Cost Price (what you paid), Selling Price (what you charge), Tax Rate, and whether Serial Tracking is enabled (turn ON for firearms).',
          ur: '"Add Product" پر کلک کریں۔ پروڈکٹ کا نام، پروڈکٹ کوڈ (جیسے FIR-001)، کیٹیگری، لاگت قیمت (آپ نے کتنے میں خریدا)، فروخت قیمت (آپ کتنے میں بیچیں گے)، ٹیکس ریٹ، اور سیریل ٹریکنگ (فائر آرمز کے لیے آن کریں) درج کریں۔',
        },
      },
      {
        title: { en: 'Edit Product Details', ur: 'پروڈکٹ کی تفصیلات میں تبدیلی' },
        description: {
          en: 'Click the edit icon on any product row. You can change name, price, category, tax rate, and other details. Changes take effect immediately.',
          ur: 'کسی بھی پروڈکٹ کی قطار پر ایڈٹ آئیکن پر کلک کریں۔ آپ نام، قیمت، کیٹیگری، ٹیکس ریٹ اور دیگر تفصیلات تبدیل کر سکتے ہیں۔',
        },
      },
      {
        title: { en: 'Deactivate Instead of Delete', ur: 'حذف کرنے کی بجائے غیر فعال کریں' },
        description: {
          en: 'Never delete products — deactivate them instead. Deactivated products are hidden from POS but remain in your sales history and reports for accurate records.',
          ur: 'پروڈکٹس کبھی حذف نہ کریں — بلکہ غیر فعال کریں۔ غیر فعال پروڈکٹس POS سے چھپ جاتی ہیں لیکن فروخت کی تاریخ اور رپورٹس میں درست ریکارڈ کے لیے موجود رہتی ہیں۔',
        },
      },
    ],
    examples: [
      {
        label: { en: 'Example: Adding a Firearm Product', ur: 'مثال: فائر آرم پروڈکٹ شامل کرنا' },
        fields: [
          { name: { en: 'Product Name', ur: 'پروڈکٹ کا نام' }, value: 'Glock 19 Gen 5' },
          { name: { en: 'Product Code', ur: 'پروڈکٹ کوڈ' }, value: 'FIR-001' },
          { name: { en: 'Category', ur: 'کیٹیگری' }, value: 'Firearms' },
          { name: { en: 'Cost Price', ur: 'لاگت قیمت' }, value: 'Rs. 380,000' },
          { name: { en: 'Selling Price', ur: 'فروخت قیمت' }, value: 'Rs. 450,000' },
          { name: { en: 'Serial Tracking', ur: 'سیریل ٹریکنگ' }, value: 'ON' },
        ],
      },
      {
        label: { en: 'Example: Adding Ammunition', ur: 'مثال: گولہ بارود شامل کرنا' },
        fields: [
          { name: { en: 'Product Name', ur: 'پروڈکٹ کا نام' }, value: '9mm FMJ (Box of 50)' },
          { name: { en: 'Product Code', ur: 'پروڈکٹ کوڈ' }, value: 'AMM-001' },
          { name: { en: 'Category', ur: 'کیٹیگری' }, value: 'Ammunition' },
          { name: { en: 'Cost Price', ur: 'لاگت قیمت' }, value: 'Rs. 3,500' },
          { name: { en: 'Selling Price', ur: 'فروخت قیمت' }, value: 'Rs. 4,500' },
          { name: { en: 'Serial Tracking', ur: 'سیریل ٹریکنگ' }, value: 'OFF' },
        ],
      },
    ],
    tips: [
      {
        en: 'Use consistent product codes (e.g., FIR-001 for firearms, AMM-001 for ammo, ACC-001 for accessories) for easy identification.',
        ur: 'آسان شناخت کے لیے مستقل پروڈکٹ کوڈ استعمال کریں (جیسے فائر آرمز کے لیے FIR-001، گولہ بارود کے لیے AMM-001، لوازمات کے لیے ACC-001)۔',
      },
      {
        en: 'Set accurate cost prices — this is essential for correct profit margin calculations in reports.',
        ur: 'درست لاگت قیمتیں مقرر کریں — رپورٹس میں صحیح منافع کا حساب لگانے کے لیے یہ ضروری ہے۔',
      },
    ],
  },
  {
    id: 'inventory',
    title: { en: 'Inventory', ur: 'انوینٹری' },
    icon: Warehouse,
    category: 'operations',
    summary: {
      en: 'Track stock levels, make adjustments, and transfer between branches',
      ur: 'اسٹاک کی سطح ٹریک کریں، ایڈجسٹمنٹ کریں، اور برانچوں کے درمیان ٹرانسفر کریں',
    },
    steps: [
      {
        title: { en: 'View Stock Levels', ur: 'اسٹاک کی سطح دیکھیں' },
        description: {
          en: 'Go to Inventory to see current stock for every product. Status indicators show: In Stock (green), Low Stock (amber), Out of Stock (red). Use the branch filter to view stock at a specific location.',
          ur: 'ہر پروڈکٹ کا موجودہ اسٹاک دیکھنے کے لیے Inventory پر جائیں۔ سٹیٹس: اسٹاک میں (سبز)، کم اسٹاک (نارنجی)، اسٹاک ختم (سرخ)۔ کسی مخصوص برانچ کا اسٹاک دیکھنے کے لیے برانچ فلٹر استعمال کریں۔',
        },
      },
      {
        title: { en: 'Make Stock Adjustments', ur: 'اسٹاک ایڈجسٹمنٹ کریں' },
        description: {
          en: 'Click "Adjust Stock" to record changes. Choose the adjustment type: Received (new stock arrived), Damaged (broken items), Lost (missing items), Returned (customer returns), Correction (fixing errors), or Audit (physical count correction).',
          ur: '"Adjust Stock" پر کلک کریں۔ ایڈجسٹمنٹ کی قسم منتخب کریں: وصول شدہ (نیا اسٹاک آیا)، خراب (ٹوٹی اشیاء)، گم (غائب اشیاء)، واپس (کسٹمر واپسی)، درستگی (غلطیاں ٹھیک کرنا)، یا آڈٹ (فزیکل گنتی کی درستگی)۔',
        },
      },
      {
        title: { en: 'Transfer Between Branches', ur: 'برانچوں کے درمیان ٹرانسفر' },
        description: {
          en: 'Click "Transfer" to move stock from one branch to another. Select the source branch, destination branch, products, and quantities. Transfers require Manager or Admin access.',
          ur: '"Transfer" پر کلک کریں۔ ماخذ برانچ، منزل برانچ، پروڈکٹس اور مقداریں منتخب کریں۔ ٹرانسفر کے لیے مینیجر یا ایڈمن رسائی ضروری ہے۔',
        },
      },
    ],
    tips: [
      {
        en: 'Run regular stock audits (at least monthly) and use the "Audit" adjustment type to correct any discrepancies between system and physical count.',
        ur: 'باقاعدہ اسٹاک آڈٹ کریں (کم از کم ماہانہ) اور سسٹم اور فزیکل گنتی میں فرق کو درست کرنے کے لیے "آڈٹ" ایڈجسٹمنٹ استعمال کریں۔',
      },
    ],
  },
  {
    id: 'sales',
    title: { en: 'Sales History', ur: 'فروخت کی تاریخ' },
    icon: Receipt,
    category: 'operations',
    summary: {
      en: 'View past sales, filter by date/customer/payment, and void transactions',
      ur: 'گزشتہ فروخت دیکھیں، تاریخ/کسٹمر/ادائیگی سے فلٹر کریں، اور لین دین منسوخ کریں',
    },
    steps: [
      {
        title: { en: 'View All Sales', ur: 'تمام فروخت دیکھیں' },
        description: {
          en: 'Click "Sales" in the sidebar. You\'ll see a table of all completed sales with date, invoice number, customer, total amount, payment method, and status.',
          ur: 'سائیڈبار میں "Sales" پر کلک کریں۔ تمام مکمل فروخت کی ٹیبل نظر آئے گی جس میں تاریخ، انوائس نمبر، کسٹمر، کل رقم، ادائیگی کا طریقہ اور سٹیٹس شامل ہوں گے۔',
        },
      },
      {
        title: { en: 'Search and Filter', ur: 'تلاش اور فلٹر' },
        description: {
          en: 'Use the search bar to find sales by invoice number or customer name. Filter by payment method (Cash/Card/Credit/Mobile) or status.',
          ur: 'انوائس نمبر یا کسٹمر کے نام سے فروخت تلاش کرنے کے لیے سرچ بار استعمال کریں۔ ادائیگی کے طریقے یا سٹیٹس سے فلٹر کریں۔',
        },
      },
      {
        title: { en: 'Void a Sale', ur: 'فروخت منسوخ کریں' },
        description: {
          en: 'Click "Void" on any sale, enter the reason for voiding, and confirm. Voided sales are marked but preserved for audit purposes. Stock is automatically restored for inventory-tracked items.',
          ur: 'کسی بھی فروخت پر "Void" پر کلک کریں، منسوخی کی وجہ درج کریں اور تصدیق کریں۔ منسوخ فروخت آڈٹ کے لیے محفوظ رہتی ہیں۔ انوینٹری ٹریک شدہ اشیاء کا اسٹاک خود بخود بحال ہو جاتا ہے۔',
        },
      },
    ],
    warnings: [
      {
        en: 'Voided sales cannot be un-voided. Always double-check before confirming.',
        ur: 'منسوخ فروخت دوبارہ بحال نہیں ہو سکتی۔ تصدیق سے پہلے ہمیشہ دوبارہ چیک کریں۔',
      },
      {
        en: 'Only Managers and Admins can void sales. Cashiers must ask their manager.',
        ur: 'صرف مینیجرز اور ایڈمنز فروخت منسوخ کر سکتے ہیں۔ کیشیئرز کو اپنے مینیجر سے کہنا ہوگا۔',
      },
    ],
  },
  {
    id: 'customers',
    title: { en: 'Customers', ur: 'کسٹمرز' },
    icon: Users,
    category: 'operations',
    summary: {
      en: 'Manage customer records with CNIC, firearm license tracking, and purchase history',
      ur: 'CNIC، فائر آرم لائسنس ٹریکنگ اور خریداری کی تاریخ کے ساتھ کسٹمر ریکارڈ کا انتظام',
    },
    steps: [
      {
        title: { en: 'Add a New Customer', ur: 'نیا کسٹمر شامل کریں' },
        description: {
          en: 'Click "Add Customer". Enter first name, last name, CNIC/passport number, phone, email, address, and firearm license details (license number and expiry date).',
          ur: '"Add Customer" پر کلک کریں۔ پہلا نام، آخری نام، CNIC/پاسپورٹ نمبر، فون، ای میل، پتہ اور فائر آرم لائسنس کی تفصیلات (لائسنس نمبر اور میعاد ختم ہونے کی تاریخ) درج کریں۔',
        },
      },
      {
        title: { en: 'Track Firearm Licenses', ur: 'فائر آرم لائسنس ٹریک کریں' },
        description: {
          en: 'The system shows license status badges: Valid (green), Expiring Soon (amber — within 30 days), Expired (red). This helps you comply with legal requirements.',
          ur: 'سسٹم لائسنس کی حیثیت دکھاتا ہے: درست (سبز)، جلد ختم ہونے والا (نارنجی — 30 دن کے اندر)، ختم شدہ (سرخ)۔ یہ قانونی تقاضوں کی تعمیل میں مدد کرتا ہے۔',
        },
      },
      {
        title: { en: 'Walk-in Customers', ur: 'Walk-in کسٹمرز' },
        description: {
          en: 'For quick sales where you don\'t need customer details, use "Walk-in Customer" in the POS. This is automatically selected by default.',
          ur: 'فوری فروخت کے لیے جہاں کسٹمر کی تفصیلات ضرورت نہ ہوں، POS میں "Walk-in Customer" استعمال کریں۔ یہ پہلے سے منتخب ہوتا ہے۔',
        },
      },
    ],
    warnings: [
      {
        en: 'CNIC is legally required for all firearm sales in Pakistan. Always record it.',
        ur: 'پاکستان میں تمام فائر آرم فروخت کے لیے CNIC قانونی طور پر ضروری ہے۔ اسے ہمیشہ ریکارڈ کریں۔',
      },
    ],
  },
  {
    id: 'returns',
    title: { en: 'Returns', ur: 'واپسیاں' },
    icon: RotateCcw,
    category: 'operations',
    summary: {
      en: 'Process product returns — refunds, exchanges, and store credit',
      ur: 'پروڈکٹ واپسیاں — رقم واپسی، تبادلہ اور اسٹور کریڈٹ',
    },
    steps: [
      {
        title: { en: 'Start a New Return', ur: 'نئی واپسی شروع کریں' },
        description: {
          en: 'Go to Returns and click "New Return". First, look up the original sale by entering the sale/invoice number.',
          ur: 'Returns پر جائیں اور "New Return" پر کلک کریں۔ پہلے سیل/انوائس نمبر درج کر کے اصل فروخت تلاش کریں۔',
        },
      },
      {
        title: { en: 'Select Items to Return', ur: 'واپسی کی اشیاء منتخب کریں' },
        description: {
          en: 'Choose which items from the original sale are being returned. Specify the quantity, item condition (good/damaged), and whether the item can be restocked.',
          ur: 'اصل فروخت سے واپس ہونے والی اشیاء منتخب کریں۔ مقدار، آئٹم کی حالت (اچھی/خراب) اور آیا آئٹم دوبارہ اسٹاک ہو سکتا ہے بتائیں۔',
        },
      },
      {
        title: { en: 'Choose Return Type', ur: 'واپسی کی قسم منتخب کریں' },
        description: {
          en: 'Select: Refund (money back to customer), Exchange (swap for another product), or Store Credit (credit for future purchases). Restockable items are automatically added back to inventory.',
          ur: 'منتخب کریں: رقم واپسی (کسٹمر کو رقم واپس)، تبادلہ (دوسری پروڈکٹ سے بدلنا)، یا اسٹور کریڈٹ (مستقبل کی خریداری کے لیے کریڈٹ)۔ دوبارہ قابل اسٹاک اشیاء خود بخود انوینٹری میں واپس شامل ہو جاتی ہیں۔',
        },
      },
    ],
  },
  {
    id: 'suppliers',
    title: { en: 'Suppliers', ur: 'سپلائرز' },
    icon: Truck,
    category: 'operations',
    summary: {
      en: 'Register and manage your vendors and suppliers',
      ur: 'اپنے وینڈرز اور سپلائرز کو رجسٹر اور منظم کریں',
    },
    steps: [
      {
        title: { en: 'Add a New Supplier', ur: 'نیا سپلائر شامل کریں' },
        description: {
          en: 'Click "Add Supplier". Enter company name, contact person, phone, email, NTN (National Tax Number), and payment terms (e.g., Net 30 = pay within 30 days).',
          ur: '"Add Supplier" پر کلک کریں۔ کمپنی کا نام، رابطہ شخص، فون، ای میل، NTN (نیشنل ٹیکس نمبر) اور ادائیگی کی شرائط (مثلاً Net 30 = 30 دن میں ادائیگی) درج کریں۔',
        },
      },
      {
        title: { en: 'Link Suppliers to Purchases', ur: 'سپلائرز کو خریداری سے جوڑیں' },
        description: {
          en: 'When creating purchase orders, select the supplier. This helps track what you bought from whom and what you owe (payables).',
          ur: 'خریداری کے آرڈرز بناتے وقت سپلائر منتخب کریں۔ اس سے پتا چلتا ہے کہ آپ نے کس سے کیا خریدا اور آپ نے کتنا دینا ہے (واجبات الادا)۔',
        },
      },
    ],
    tips: [
      {
        en: 'Set payment terms accurately — this helps the Payables module automatically calculate when payments are due.',
        ur: 'ادائیگی کی شرائط درست مقرر کریں — اس سے Payables ماڈیول خود بخود حساب لگاتا ہے کہ ادائیگی کب واجب الادا ہے۔',
      },
    ],
  },
  {
    id: 'categories',
    title: { en: 'Categories', ur: 'کیٹیگریز' },
    icon: FolderTree,
    category: 'operations',
    summary: {
      en: 'Organize products into categories for easy browsing in POS',
      ur: 'POS میں آسان براؤزنگ کے لیے پروڈکٹس کو کیٹیگریز میں ترتیب دیں',
    },
    steps: [
      {
        title: { en: 'Create Categories', ur: 'کیٹیگریز بنائیں' },
        description: {
          en: 'Go to Categories and click "Add Category". Enter a name like "Firearms", "Ammunition", "Accessories", "Optics", "Cleaning Supplies", etc. Categories appear as filter chips in POS.',
          ur: 'Categories پر جائیں اور "Add Category" پر کلک کریں۔ نام درج کریں جیسے "فائر آرمز"، "گولہ بارود"، "لوازمات"، "آپٹکس" وغیرہ۔ کیٹیگریز POS میں فلٹر چپس کے طور پر نظر آتی ہیں۔',
        },
      },
      {
        title: { en: 'Assign Products to Categories', ur: 'پروڈکٹس کو کیٹیگریز میں ڈالیں' },
        description: {
          en: 'When adding or editing a product, select its category from the dropdown. This determines which filter shows the product in POS.',
          ur: 'پروڈکٹ شامل یا ایڈٹ کرتے وقت ڈراپ ڈاؤن سے اس کی کیٹیگری منتخب کریں۔ اس سے طے ہوتا ہے کہ POS میں کون سا فلٹر پروڈکٹ دکھائے گا۔',
        },
      },
    ],
  },
  {
    id: 'pos-tabs',
    title: { en: 'POS Tabs', ur: 'POS ٹیبز' },
    icon: Layers,
    category: 'operations',
    summary: {
      en: 'Manage held orders and running tabs for customers',
      ur: 'کسٹمرز کے لیے روکے گئے آرڈرز اور جاری ٹیبز کا انتظام',
    },
    steps: [
      {
        title: { en: 'What are POS Tabs?', ur: 'POS ٹیبز کیا ہیں؟' },
        description: {
          en: 'When you hold an order in POS, it becomes a "tab". Think of it like a restaurant tab — the customer is still shopping or has stepped away, and you\'ll complete the sale later.',
          ur: 'جب آپ POS میں آرڈر روکتے ہیں تو وہ "ٹیب" بن جاتا ہے۔ اسے ریسٹورنٹ ٹیب کی طرح سمجھیں — کسٹمر ابھی خریداری کر رہا ہے یا چلا گیا ہے، اور آپ فروخت بعد میں مکمل کریں گے۔',
        },
      },
      {
        title: { en: 'Resume a Held Order', ur: 'روکا ہوا آرڈر دوبارہ شروع کریں' },
        description: {
          en: 'Go to POS Tabs to see all held orders. Click on a tab to load it back into the POS cart and continue the sale.',
          ur: 'تمام روکے گئے آرڈرز دیکھنے کے لیے POS Tabs پر جائیں۔ کسی ٹیب پر کلک کریں تاکہ وہ واپس POS کارٹ میں لوڈ ہو اور فروخت جاری رہے۔',
        },
      },
    ],
  },

  /* ──────────────────────────────────────────────
     FINANCIAL (9 modules)
     ────────────────────────────────────────────── */
  {
    id: 'expenses',
    title: { en: 'Expenses', ur: 'اخراجات' },
    icon: CreditCard,
    category: 'financial',
    summary: {
      en: 'Record and track all business expenses',
      ur: 'تمام کاروباری اخراجات ریکارڈ اور ٹریک کریں',
    },
    steps: [
      {
        title: { en: 'Record an Expense', ur: 'خرچ ریکارڈ کریں' },
        description: {
          en: 'Go to Expenses and click "Add Expense". Enter the date, category (rent, utilities, salary, transport, etc.), description, amount, and payment method.',
          ur: 'Expenses پر جائیں اور "Add Expense" پر کلک کریں۔ تاریخ، کیٹیگری (کرایہ، بجلی پانی، تنخواہ، ٹرانسپورٹ وغیرہ)، تفصیل، رقم اور ادائیگی کا طریقہ درج کریں۔',
        },
      },
      {
        title: { en: 'View Expense History', ur: 'اخراجات کی تاریخ دیکھیں' },
        description: {
          en: 'Browse all recorded expenses with date range filters. This feeds into your Profit & Loss report automatically.',
          ur: 'تاریخ کی حد کے فلٹرز کے ساتھ تمام ریکارڈ شدہ اخراجات دیکھیں۔ یہ خود بخود آپ کی نفع و نقصان رپورٹ میں شامل ہو جاتے ہیں۔',
        },
      },
    ],
    examples: [
      {
        label: { en: 'Example: Recording Monthly Rent', ur: 'مثال: ماہانہ کرایہ ریکارڈ کرنا' },
        fields: [
          { name: { en: 'Category', ur: 'کیٹیگری' }, value: 'Rent' },
          { name: { en: 'Description', ur: 'تفصیل' }, value: 'Shop rent for March 2026' },
          { name: { en: 'Amount', ur: 'رقم' }, value: 'Rs. 85,000' },
          { name: { en: 'Payment', ur: 'ادائیگی' }, value: 'Bank Transfer' },
        ],
      },
    ],
  },
  {
    id: 'payables',
    title: { en: 'Payables', ur: 'واجبات الادا' },
    icon: ArrowUpFromLine,
    category: 'financial',
    summary: {
      en: 'Track money you owe to suppliers',
      ur: 'وہ رقم ٹریک کریں جو آپ نے سپلائرز کو دینی ہے',
    },
    concepts: [
      {
        term: { en: 'Accounts Payable', ur: 'واجبات الادا' },
        analogy: {
          en: 'Think of it like a "tab" at a shop. You bought goods from a supplier but haven\'t paid yet. The amount you owe them is a "payable". It\'s like an IOU you gave to the supplier.',
          ur: 'اسے دکان پر ادھار کی طرح سمجھیں۔ آپ نے سپلائر سے سامان خریدا لیکن ابھی ادائیگی نہیں کی۔ جو رقم آپ نے دینی ہے وہ "واجب الادا" ہے۔ یہ ایسے ہے جیسے آپ نے سپلائر کو ادھار کی پرچی دی ہو۔',
        },
        definition: {
          en: 'An amount your business owes to a supplier for goods or services received but not yet paid for.',
          ur: 'وہ رقم جو آپ کے کاروبار نے کسی سپلائر سے وصول شدہ سامان یا خدمات کے بدلے ادا کرنی ہے۔',
        },
        inApp: {
          en: 'When you create a purchase order and mark it as "unpaid" or "partially paid", the system automatically creates a payable entry here.',
          ur: 'جب آپ خریداری کا آرڈر بناتے ہیں اور اسے "غیر ادا شدہ" یا "جزوی ادا شدہ" نشان زد کرتے ہیں تو سسٹم خود بخود یہاں واجب الادا انٹری بناتا ہے۔',
        },
      },
    ],
    steps: [
      {
        title: { en: 'View Outstanding Payables', ur: 'بقایا واجبات الادا دیکھیں' },
        description: {
          en: 'The Payables page shows all amounts you owe to suppliers with due dates. Overdue items are highlighted in red.',
          ur: 'Payables صفحہ آپ کی سپلائرز کو واجب الادا تمام رقوم کو مقررہ تاریخوں کے ساتھ دکھاتا ہے۔ تاخیر شدہ آئٹمز سرخ میں نمایاں ہوتے ہیں۔',
        },
      },
      {
        title: { en: 'Record a Payment', ur: 'ادائیگی ریکارڈ کریں' },
        description: {
          en: 'Click on a payable and record the payment amount. You can pay in full or make partial payments. The balance updates automatically.',
          ur: 'کسی واجب الادا پر کلک کریں اور ادائیگی کی رقم ریکارڈ کریں۔ آپ مکمل یا جزوی ادائیگی کر سکتے ہیں۔ بقایا خود بخود اپڈیٹ ہوتا ہے۔',
        },
      },
    ],
  },
  {
    id: 'receivables',
    title: { en: 'Receivables', ur: 'قابل وصول رقم' },
    icon: ArrowDownToLine,
    category: 'financial',
    summary: {
      en: 'Track money owed to you by customers',
      ur: 'وہ رقم ٹریک کریں جو کسٹمرز نے آپ کو دینی ہے',
    },
    concepts: [
      {
        term: { en: 'Accounts Receivable', ur: 'قابل وصول رقم' },
        analogy: {
          en: 'When a customer buys on credit (udhar), they owe you money. That\'s a "receivable" — money that you should receive in the future. Think of it as IOUs that customers gave you.',
          ur: 'جب کسٹمر ادھار پر خریدتا ہے تو اس نے آپ کو رقم دینی ہوتی ہے۔ یہ "قابل وصول" ہے — وہ رقم جو آپ کو مستقبل میں ملنی چاہیے۔ اسے ایسے سمجھیں جیسے کسٹمرز نے آپ کو ادھار کی پرچی دی ہو۔',
        },
        definition: {
          en: 'An amount owed to your business by customers for goods sold on credit.',
          ur: 'وہ رقم جو کسٹمرز نے آپ کے کاروبار کو ادھار پر فروخت شدہ سامان کے بدلے ادا کرنی ہے۔',
        },
        inApp: {
          en: 'When you make a "Credit" sale in POS, the system automatically creates a receivable entry here. Track who owes what and when it\'s due.',
          ur: 'جب آپ POS میں "کریڈٹ" فروخت کرتے ہیں تو سسٹم خود بخود یہاں قابل وصول انٹری بناتا ہے۔ ٹریک کریں کہ کس نے کتنا دینا ہے اور کب تک۔',
        },
      },
    ],
    steps: [
      {
        title: { en: 'View Outstanding Receivables', ur: 'بقایا قابل وصول رقم دیکھیں' },
        description: {
          en: 'See all credit sales that haven\'t been fully paid. Filter by customer, due date, or amount.',
          ur: 'تمام ادھار فروخت دیکھیں جن کی مکمل ادائیگی نہیں ہوئی۔ کسٹمر، مقررہ تاریخ یا رقم سے فلٹر کریں۔',
        },
      },
      {
        title: { en: 'Record a Collection', ur: 'وصولی ریکارڈ کریں' },
        description: {
          en: 'When a customer pays their dues, click on the receivable and enter the payment. Partial collections are supported.',
          ur: 'جب کسٹمر اپنا بقایا ادا کرے تو قابل وصول پر کلک کریں اور ادائیگی درج کریں۔ جزوی وصولی بھی ممکن ہے۔',
        },
      },
    ],
  },
  {
    id: 'cash-register',
    title: { en: 'Cash Register', ur: 'کیش رجسٹر' },
    icon: Banknote,
    category: 'financial',
    summary: {
      en: 'Open/close daily register, track cash in hand, reconcile',
      ur: 'روزانہ رجسٹر کھولیں/بند کریں، نقدی ٹریک کریں، مطابقت کریں',
    },
    steps: [
      {
        title: { en: 'Open a Register Session', ur: 'رجسٹر سیشن کھولیں' },
        description: {
          en: 'At the start of your day, open a new register session. Enter the opening cash balance (the physical cash in your drawer).',
          ur: 'دن کی شروعات میں نیا رجسٹر سیشن کھولیں۔ ابتدائی نقد بیلنس درج کریں (آپ کی دراز میں موجود فزیکل نقدی)۔',
        },
      },
      {
        title: { en: 'Track Cash In/Out', ur: 'نقدی آمد/خرچ ٹریک کریں' },
        description: {
          en: 'Record any non-sale cash movements — like taking cash to the bank (cash out) or adding petty cash (cash in).',
          ur: 'غیر فروخت نقدی کی حرکات ریکارڈ کریں — جیسے بینک میں نقدی جمع کرانا (کیش آؤٹ) یا چھوٹی نقدی شامل کرنا (کیش ان)۔',
        },
      },
      {
        title: { en: 'Close and Reconcile', ur: 'بند اور مطابقت کریں' },
        description: {
          en: 'At end of day, close the session. Count your physical cash and enter it. The system compares expected vs actual cash and shows any difference.',
          ur: 'دن کے آخر میں سیشن بند کریں۔ فزیکل نقدی گنیں اور درج کریں۔ سسٹم متوقع اور اصل نقدی کا موازنہ کرتا ہے اور فرق دکھاتا ہے۔',
        },
      },
    ],
  },
  {
    id: 'commissions',
    title: { en: 'Commissions', ur: 'کمیشن' },
    icon: HandCoins,
    category: 'financial',
    summary: {
      en: 'Track sales commissions for staff and referrers',
      ur: 'عملے اور ریفرل کرنے والوں کے فروخت کمیشن ٹریک کریں',
    },
    steps: [
      {
        title: { en: 'Set Up Commission Rates', ur: 'کمیشن کی شرح مقرر کریں' },
        description: {
          en: 'Configure commission rates — either a flat amount or a percentage of the sale. Different rates can be set for different products or staff members.',
          ur: 'کمیشن کی شرح مقرر کریں — فکسڈ رقم یا فروخت کا فیصد۔ مختلف پروڈکٹس یا عملے کے ارکان کے لیے مختلف شرحیں مقرر کی جا سکتی ہیں۔',
        },
      },
      {
        title: { en: 'View Commission Reports', ur: 'کمیشن رپورٹس دیکھیں' },
        description: {
          en: 'Track who earned what commission over any date range. Export for payroll processing.',
          ur: 'ٹریک کریں کہ کس نے کسی بھی مدت میں کتنا کمیشن کمایا۔ تنخواہ کی کارروائی کے لیے ایکسپورٹ کریں۔',
        },
      },
    ],
  },
  {
    id: 'referrals',
    title: { en: 'Referral Persons', ur: 'ریفرل افراد' },
    icon: UserCheck,
    category: 'financial',
    summary: {
      en: 'Manage people who refer customers to your business',
      ur: 'ان لوگوں کا انتظام جو کسٹمرز کو آپ کے کاروبار کی طرف بھیجتے ہیں',
    },
    steps: [
      {
        title: { en: 'Add a Referral Person', ur: 'ریفرل شخص شامل کریں' },
        description: {
          en: 'Register anyone who brings customers to your shop. Enter their name, phone, and commission arrangement.',
          ur: 'جو بھی آپ کی دکان پر کسٹمر لائے اسے رجسٹر کریں۔ نام، فون اور کمیشن کی ترتیب درج کریں۔',
        },
      },
      {
        title: { en: 'Track Referral Sales', ur: 'ریفرل فروخت ٹریک کریں' },
        description: {
          en: 'When making a sale in POS, you can tag a referral person. Their commission is calculated automatically.',
          ur: 'POS میں فروخت کرتے وقت آپ ریفرل شخص ٹیگ کر سکتے ہیں۔ ان کا کمیشن خود بخود حساب ہوتا ہے۔',
        },
      },
    ],
  },
  {
    id: 'vouchers',
    title: { en: 'Vouchers', ur: 'واؤچرز' },
    icon: FileText,
    category: 'financial',
    summary: {
      en: 'Create payment and receipt vouchers for record keeping',
      ur: 'ریکارڈ رکھنے کے لیے ادائیگی اور وصولی واؤچر بنائیں',
    },
    steps: [
      {
        title: { en: 'Create a Voucher', ur: 'واؤچر بنائیں' },
        description: {
          en: 'Go to Vouchers and create either a Payment Voucher (money going out) or a Receipt Voucher (money coming in). Enter amount, description, and related party.',
          ur: 'Vouchers پر جائیں اور ادائیگی واؤچر (رقم باہر جا رہی) یا وصولی واؤچر (رقم آ رہی) بنائیں۔ رقم، تفصیل اور متعلقہ فریق درج کریں۔',
        },
      },
      {
        title: { en: 'Print Vouchers', ur: 'واؤچر پرنٹ کریں' },
        description: {
          en: 'Each voucher gets a unique number. Print vouchers for physical record keeping and have them signed by the relevant parties.',
          ur: 'ہر واؤچر کو منفرد نمبر ملتا ہے۔ فزیکل ریکارڈ کے لیے واؤچر پرنٹ کریں اور متعلقہ فریقین سے دستخط کروائیں۔',
        },
      },
    ],
  },
  {
    id: 'tax-collections',
    title: { en: 'Tax Collections', ur: 'ٹیکس وصولی' },
    icon: Percent,
    category: 'financial',
    summary: {
      en: 'Track sales tax collected from customers',
      ur: 'کسٹمرز سے وصول شدہ سیلز ٹیکس ٹریک کریں',
    },
    concepts: [
      {
        term: { en: 'Sales Tax', ur: 'سیلز ٹیکس' },
        analogy: {
          en: 'Sales tax is like a government fee added on top of the price. When you sell something for Rs. 100 with 17% tax, the customer pays Rs. 117. That extra Rs. 17 isn\'t your money — you collected it for the government and must pay it to them.',
          ur: 'سیلز ٹیکس حکومت کی فیس ہے جو قیمت پر شامل کی جاتی ہے۔ جب آپ 17% ٹیکس کے ساتھ Rs. 100 کا سامان بیچتے ہیں تو کسٹمر Rs. 117 ادا کرتا ہے۔ وہ اضافی Rs. 17 آپ کی رقم نہیں — آپ نے حکومت کے لیے وصول کی ہے اور انہیں دینی ہے۔',
        },
        definition: {
          en: 'A government-levied tax added to the selling price of goods, collected by the seller and remitted to the tax authority.',
          ur: 'حکومت کی طرف سے سامان کی فروخت قیمت پر لگایا جانے والا ٹیکس جو فروخت کنندہ وصول کرتا ہے اور ٹیکس اتھارٹی کو جمع کراتا ہے۔',
        },
        inApp: {
          en: 'Go to Tax Collections to see total tax collected over any period. Use this to prepare your tax returns and ensure you\'re paying the correct amount to FBR.',
          ur: 'کسی بھی مدت میں وصول شدہ کل ٹیکس دیکھنے کے لیے Tax Collections پر جائیں۔ اپنے ٹیکس ریٹرنز تیار کرنے اور FBR کو صحیح رقم ادا کرنے کے لیے استعمال کریں۔',
        },
      },
    ],
    steps: [
      {
        title: { en: 'View Tax Collected', ur: 'وصول شدہ ٹیکس دیکھیں' },
        description: {
          en: 'Tax Collections shows the total sales tax collected from all sales. Filter by date range to see monthly or quarterly totals.',
          ur: 'Tax Collections تمام فروخت سے وصول شدہ کل سیلز ٹیکس دکھاتا ہے۔ ماہانہ یا سہ ماہی کل دیکھنے کے لیے تاریخ سے فلٹر کریں۔',
        },
      },
    ],
  },
  {
    id: 'discounts',
    title: { en: 'Discount Management', ur: 'ڈسکاؤنٹ کا انتظام' },
    icon: BadgePercent,
    category: 'financial',
    summary: {
      en: 'Create and manage discount rules for sales',
      ur: 'فروخت کے لیے ڈسکاؤنٹ قواعد بنائیں اور ان کا انتظام کریں',
    },
    steps: [
      {
        title: { en: 'Create a Discount Rule', ur: 'ڈسکاؤنٹ قاعدہ بنائیں' },
        description: {
          en: 'Set up discounts as either a fixed amount (e.g., Rs. 500 off) or a percentage (e.g., 10% off). You can apply discounts to specific products, categories, or all items.',
          ur: 'ڈسکاؤنٹ فکسڈ رقم (مثلاً Rs. 500 چھوٹ) یا فیصد (مثلاً 10% چھوٹ) کے طور پر مقرر کریں۔ ڈسکاؤنٹ مخصوص پروڈکٹس، کیٹیگریز یا تمام اشیاء پر لگائیں۔',
        },
      },
      {
        title: { en: 'Apply in POS', ur: 'POS میں لاگو کریں' },
        description: {
          en: 'When processing a sale, enter the discount in the order summary section. The maximum discount allowed is configured in Settings.',
          ur: 'فروخت کرتے وقت آرڈر سمری میں ڈسکاؤنٹ درج کریں۔ زیادہ سے زیادہ ڈسکاؤنٹ کی اجازت سیٹنگز میں مقرر ہوتی ہے۔',
        },
      },
    ],
  },

  /* ──────────────────────────────────────────────
     ACCOUNTING (5 modules) — Heavy concept coverage
     ────────────────────────────────────────────── */
  {
    id: 'chart-of-accounts',
    title: { en: 'Chart of Accounts', ur: 'چارٹ آف اکاؤنٹس' },
    icon: BookOpen,
    category: 'accounting',
    summary: {
      en: 'The master list of all financial accounts — assets, liabilities, equity, revenue, and expenses',
      ur: 'تمام مالیاتی کھاتوں کی ماسٹر فہرست — اثاثے، ذمہ داریاں، ایکویٹی، آمدنی اور اخراجات',
    },
    concepts: [
      {
        term: { en: 'Chart of Accounts', ur: 'چارٹ آف اکاؤنٹس' },
        analogy: {
          en: 'Think of it like a filing cabinet for money. Each drawer is labeled: "Cash", "Inventory", "Rent Expense", "Sales Revenue", etc. Every time money moves in your business, it goes from one drawer to another. The Chart of Accounts is the list of all those drawers.',
          ur: 'اسے پیسوں کی فائلنگ کابینہ سمجھیں۔ ہر دراز پر لیبل لگا ہے: "نقدی"، "انوینٹری"، "کرایے کا خرچ"، "فروخت کی آمدنی" وغیرہ۔ جب بھی آپ کے کاروبار میں پیسہ حرکت کرتا ہے تو وہ ایک دراز سے دوسری میں جاتا ہے۔ چارٹ آف اکاؤنٹس ان تمام درازوں کی فہرست ہے۔',
        },
        definition: {
          en: 'A structured list of all financial accounts used to record and categorize every transaction in a business.',
          ur: 'کاروبار میں ہر لین دین کو ریکارڈ اور درجہ بند کرنے کے لیے استعمال ہونے والے تمام مالیاتی کھاتوں کی منظم فہرست۔',
        },
        inApp: {
          en: 'Go to Chart of Accounts to view your account tree. The system comes with default accounts. You can add custom accounts as needed.',
          ur: 'اپنے اکاؤنٹ ٹری دیکھنے کے لیے Chart of Accounts پر جائیں۔ سسٹم میں ڈیفالٹ اکاؤنٹس موجود ہیں۔ ضرورت کے مطابق کسٹم اکاؤنٹس شامل کر سکتے ہیں۔',
        },
      },
      {
        term: { en: 'Assets (What You Own)', ur: 'اثاثے (جو آپ کے پاس ہے)' },
        analogy: {
          en: 'Everything valuable that your business owns: cash in the register, products on the shelves (inventory), money customers owe you (receivables), shop equipment, vehicles. If you could sell it or collect it, it\'s an asset.',
          ur: 'وہ سب کچھ قیمتی جو آپ کے کاروبار کی ملکیت ہے: رجسٹر میں نقدی، شیلف پر موجود سامان (انوینٹری)، کسٹمرز کا بقایا (قابل وصول)، دکان کا سامان، گاڑیاں۔ اگر آپ اسے بیچ سکتے ہیں یا وصول کر سکتے ہیں تو یہ اثاثہ ہے۔',
        },
        definition: { en: 'Resources owned by the business that have economic value.', ur: 'کاروبار کی ملکیت وسائل جن کی اقتصادی قیمت ہو۔' },
        inApp: { en: 'Asset accounts appear at the top of your Chart of Accounts — Cash, Bank, Inventory, Equipment, etc.', ur: 'اثاثوں کے اکاؤنٹس چارٹ آف اکاؤنٹس میں سب سے اوپر نظر آتے ہیں — نقدی، بینک، انوینٹری، آلات وغیرہ۔' },
      },
      {
        term: { en: 'Liabilities (What You Owe)', ur: 'ذمہ داریاں (جو آپ نے دینا ہے)' },
        analogy: {
          en: 'Money your business owes to others: unpaid supplier bills (payables), loans from the bank, tax you collected but haven\'t paid to the government yet. Think of it as your business\'s debts.',
          ur: 'وہ رقم جو آپ کے کاروبار نے دوسروں کو دینی ہے: سپلائرز کے غیر ادا شدہ بل (واجبات الادا)، بینک سے قرض، ٹیکس جو آپ نے وصول کیا مگر ابھی حکومت کو نہیں دیا۔ اسے اپنے کاروبار کے قرض سمجھیں۔',
        },
        definition: { en: 'Obligations the business owes to external parties.', ur: 'وہ ذمہ داریاں جو کاروبار نے بیرونی فریقین کو ادا کرنی ہیں۔' },
        inApp: { en: 'Liability accounts include Accounts Payable, Loans, and Tax Payable in your Chart of Accounts.', ur: 'ذمہ داریوں کے اکاؤنٹس میں واجبات الادا، قرض اور ٹیکس واجب الادا شامل ہیں۔' },
      },
      {
        term: { en: 'Owner Equity (What the Business is Worth to You)', ur: 'مالک کی ایکویٹی (کاروبار آپ کے لیے کتنا قیمتی ہے)' },
        analogy: {
          en: 'If you sold everything your business owns (assets) and paid off all debts (liabilities), the money left over is YOUR equity — what the business is truly worth to you. Formula: Assets - Liabilities = Owner Equity.',
          ur: 'اگر آپ اپنے کاروبار کی تمام ملکیت (اثاثے) بیچ دیں اور تمام قرض (ذمہ داریاں) ادا کر دیں تو بچی ہوئی رقم آپ کی ایکویٹی ہے — کاروبار آپ کے لیے واقعی کتنا قیمتی ہے۔ فارمولا: اثاثے - ذمہ داریاں = مالک کی ایکویٹی۔',
        },
        definition: { en: 'The residual interest in the business after deducting liabilities from assets. Represents the owner\'s stake.', ur: 'ذمہ داریاں اثاثوں سے نکالنے کے بعد بچنے والا حصہ۔ مالک کے حصے کی نمائندگی کرتا ہے۔' },
        inApp: { en: 'Owner Equity is calculated automatically in your Balance Sheet report. It increases when business makes profit and decreases with losses.', ur: 'مالک کی ایکویٹی آپ کی بیلنس شیٹ رپورٹ میں خود بخود حساب ہوتی ہے۔ منافع سے بڑھتی ہے اور نقصان سے کم ہوتی ہے۔' },
      },
    ],
    steps: [
      {
        title: { en: 'View the Account Tree', ur: 'اکاؤنٹ ٹری دیکھیں' },
        description: {
          en: 'The Chart of Accounts is organized in a tree: Assets at the top, then Liabilities, Owner Equity, Revenue, and Expenses. Each has sub-accounts.',
          ur: 'چارٹ آف اکاؤنٹس ٹری کی شکل میں ہے: سب سے اوپر اثاثے، پھر ذمہ داریاں، مالک کی ایکویٹی، آمدنی اور اخراجات۔ ہر ایک کے ذیلی اکاؤنٹس ہیں۔',
        },
      },
      {
        title: { en: 'Add a Custom Account', ur: 'کسٹم اکاؤنٹ شامل کریں' },
        description: {
          en: 'If you need a new account (e.g., "Shop Renovation Expense"), click "Add Account". Choose the account type, give it a name and code.',
          ur: 'اگر آپ کو نیا اکاؤنٹ چاہیے (مثلاً "دکان تزئین نو اخراجات") تو "Add Account" پر کلک کریں۔ اکاؤنٹ کی قسم منتخب کریں، نام اور کوڈ دیں۔',
        },
      },
    ],
    tips: [
      {
        en: 'Don\'t modify the default system accounts unless you understand accounting. The defaults cover most business scenarios.',
        ur: 'جب تک آپ حسابات نہ سمجھیں ڈیفالٹ سسٹم اکاؤنٹس میں تبدیلی نہ کریں۔ ڈیفالٹ زیادہ تر کاروباری منظرناموں کو پورا کرتے ہیں۔',
      },
    ],
  },
  {
    id: 'journal-entries',
    title: { en: 'Journal Entries', ur: 'جرنل انٹریز' },
    icon: PenLine,
    category: 'accounting',
    summary: {
      en: 'The diary of every financial transaction — where money moved from and to',
      ur: 'ہر مالیاتی لین دین کی ڈائری — پیسہ کہاں سے کہاں گیا',
    },
    concepts: [
      {
        term: { en: 'Double-Entry Bookkeeping', ur: 'ڈبل انٹری بک کیپنگ' },
        analogy: {
          en: 'Every time money moves, it has two sides — like a seesaw. When a customer pays Rs. 10,000 cash for a product: (1) your Cash goes UP by Rs. 10,000 (that\'s a Debit to Cash), and (2) your Sales Revenue goes UP by Rs. 10,000 (that\'s a Credit to Revenue). Both sides must always balance, just like a seesaw.',
          ur: 'جب بھی پیسہ حرکت کرتا ہے، اس کے دو رخ ہوتے ہیں — جیسے ایک جھولا۔ جب کسٹمر پروڈکٹ کے لیے Rs. 10,000 نقد ادا کرتا ہے: (1) آپ کی نقدی Rs. 10,000 سے بڑھتی ہے (یہ نقدی کا ڈیبٹ ہے)، اور (2) آپ کی فروخت آمدنی Rs. 10,000 سے بڑھتی ہے (یہ آمدنی کا کریڈٹ ہے)۔ دونوں طرف ہمیشہ برابر ہونی چاہئیں، بالکل جھولے کی طرح۔',
        },
        definition: {
          en: 'An accounting method where every transaction affects at least two accounts — debits must equal credits.',
          ur: 'ایک حسابی طریقہ جہاں ہر لین دین کم از کم دو اکاؤنٹس کو متاثر کرتا ہے — ڈیبٹ اور کریڈٹ برابر ہونے چاہئیں۔',
        },
        inApp: {
          en: 'The system creates most journal entries automatically (from sales, purchases, expenses). You only need manual entries for special cases like owner investment or corrections.',
          ur: 'سسٹم زیادہ تر جرنل انٹریز خود بخود بناتا ہے (فروخت، خریداری، اخراجات سے)۔ آپ کو صرف خاص معاملات جیسے مالک کی سرمایہ کاری یا درستگی کے لیے دستی انٹری کرنی ہوتی ہے۔',
        },
      },
      {
        term: { en: 'Debits and Credits', ur: 'ڈیبٹ اور کریڈٹ' },
        analogy: {
          en: 'Forget what "debit" and "credit" mean in everyday life. In accounting: Debit = money arriving somewhere (left side), Credit = money leaving somewhere (right side). When you receive cash from a sale: Cash account is DEBITED (money arrived in your pocket), Sales account is CREDITED (revenue was earned). They always match in amount.',
          ur: 'روزمرہ زندگی میں "ڈیبٹ" اور "کریڈٹ" کے معنی بھول جائیں۔ حسابات میں: ڈیبٹ = پیسہ کہیں پہنچ رہا ہے (بائیں طرف)، کریڈٹ = پیسہ کہیں سے جا رہا ہے (دائیں طرف)۔ جب فروخت سے نقدی ملتی ہے: کیش اکاؤنٹ ڈیبٹ ہوتا ہے (پیسہ آپ کی جیب میں آیا)، سیلز اکاؤنٹ کریڈٹ ہوتا ہے (آمدنی ہوئی)۔ رقم ہمیشہ برابر ہوتی ہے۔',
        },
        definition: {
          en: 'Debit: an entry on the left side of a ledger that increases assets/expenses. Credit: an entry on the right side that increases liabilities/equity/revenue.',
          ur: 'ڈیبٹ: لیجر کے بائیں جانب اندراج جو اثاثے/اخراجات بڑھاتا ہے۔ کریڈٹ: دائیں جانب اندراج جو ذمہ داریاں/ایکویٹی/آمدنی بڑھاتا ہے۔',
        },
        inApp: {
          en: 'In Journal Entries, each entry has debit and credit rows. The system won\'t let you save unless total debits = total credits.',
          ur: 'جرنل انٹریز میں ہر انٹری میں ڈیبٹ اور کریڈٹ قطاریں ہوتی ہیں۔ سسٹم آپ کو محفوظ نہیں کرنے دے گا جب تک کل ڈیبٹ = کل کریڈٹ نہ ہو۔',
        },
      },
    ],
    steps: [
      {
        title: { en: 'View Auto-Generated Entries', ur: 'خود بخود بنی انٹریز دیکھیں' },
        description: {
          en: 'Most entries are created automatically when you process sales, purchases, and expenses. Go to Journal Entries to see the full history.',
          ur: 'زیادہ تر انٹریز خود بخود بنتی ہیں جب آپ فروخت، خریداری اور اخراجات ریکارڈ کرتے ہیں۔ مکمل تاریخ دیکھنے کے لیے Journal Entries پر جائیں۔',
        },
      },
      {
        title: { en: 'Create a Manual Entry', ur: 'دستی انٹری بنائیں' },
        description: {
          en: 'For special transactions (like owner investing money, or correcting an error), click "Add Entry". Select the date, add debit and credit lines, and ensure they balance.',
          ur: 'خاص لین دین (جیسے مالک کی سرمایہ کاری یا غلطی کی درستگی) کے لیے "Add Entry" پر کلک کریں۔ تاریخ منتخب کریں، ڈیبٹ اور کریڈٹ لائنز شامل کریں، اور یقینی بنائیں کہ وہ برابر ہیں۔',
        },
      },
    ],
    examples: [
      {
        label: { en: 'Example: Owner Invests Rs. 5,000,000 in Business', ur: 'مثال: مالک Rs. 5,000,000 کاروبار میں لگاتا ہے' },
        fields: [
          { name: { en: 'Debit', ur: 'ڈیبٹ' }, value: 'Cash — Rs. 5,000,000' },
          { name: { en: 'Credit', ur: 'کریڈٹ' }, value: 'Owner Equity — Rs. 5,000,000' },
          { name: { en: 'Description', ur: 'تفصیل' }, value: 'Owner capital investment' },
        ],
      },
    ],
    warnings: [
      {
        en: 'IMPORTANT: The Balance Sheet equation must always hold: Assets = Liabilities + Owner Equity. If your Balance Sheet doesn\'t balance, check your journal entries for errors.',
        ur: 'اہم: بیلنس شیٹ کا فارمولا ہمیشہ درست ہونا چاہیے: اثاثے = ذمہ داریاں + مالک کی ایکویٹی۔ اگر بیلنس شیٹ برابر نہ ہو تو جرنل انٹریز میں غلطیاں چیک کریں۔',
      },
    ],
  },
  {
    id: 'purchases',
    title: { en: 'Purchases', ur: 'خریداری' },
    icon: ShoppingCart,
    category: 'accounting',
    summary: {
      en: 'Create purchase orders, receive goods, and track costs',
      ur: 'خریداری کے آرڈرز بنائیں، سامان وصول کریں اور لاگت ٹریک کریں',
    },
    steps: [
      {
        title: { en: 'Create a Purchase Order', ur: 'خریداری کا آرڈر بنائیں' },
        description: {
          en: 'Go to Purchases and click "New Purchase". Select the supplier, add products with quantities and costs, and set the expected delivery date.',
          ur: 'Purchases پر جائیں اور "New Purchase" پر کلک کریں۔ سپلائر منتخب کریں، مقداروں اور لاگت کے ساتھ پروڈکٹس شامل کریں، اور متوقع ترسیل کی تاریخ مقرر کریں۔',
        },
      },
      {
        title: { en: 'Receive Goods', ur: 'سامان وصول کریں' },
        description: {
          en: 'When stock arrives, mark the purchase as received. The system automatically updates inventory quantities and creates a payable if not paid upfront.',
          ur: 'جب اسٹاک آئے تو خریداری کو وصول شدہ نشان زد کریں۔ سسٹم خود بخود انوینٹری کی مقداریں اپڈیٹ کرتا ہے اور اگر فوری ادائیگی نہ ہو تو واجب الادا بناتا ہے۔',
        },
      },
      {
        title: { en: 'Track Purchase Costs', ur: 'خریداری کی لاگت ٹریک کریں' },
        description: {
          en: 'All purchase costs feed into your financial reports. The system uses these to calculate your Cost of Goods Sold (COGS) and profit margins.',
          ur: 'تمام خریداری کی لاگت آپ کی مالیاتی رپورٹس میں شامل ہوتی ہے۔ سسٹم ان سے فروخت شدہ سامان کی لاگت (COGS) اور منافع مارجن کا حساب لگاتا ہے۔',
        },
      },
    ],
  },
  {
    id: 'services',
    title: { en: 'Services', ur: 'خدمات' },
    icon: Wrench,
    category: 'accounting',
    summary: {
      en: 'Track service income like repairs, transfers, and custom work',
      ur: 'خدمات کی آمدنی ٹریک کریں جیسے مرمت، ٹرانسفر اور کسٹم کام',
    },
    steps: [
      {
        title: { en: 'Add a Service', ur: 'خدمت شامل کریں' },
        description: {
          en: 'Record services your business provides — gun repairs, cleaning, license transfers, customization. Enter the service name, charge, and link to the appropriate revenue account.',
          ur: 'اپنے کاروبار کی خدمات ریکارڈ کریں — بندوق کی مرمت، صفائی، لائسنس ٹرانسفر، کسٹمائزیشن۔ خدمت کا نام، فیس اور مناسب آمدنی اکاؤنٹ سے لنک درج کریں۔',
        },
      },
    ],
  },
  {
    id: 'reports',
    title: { en: 'Reports', ur: 'رپورٹیں' },
    icon: BarChart3,
    category: 'accounting',
    summary: {
      en: 'Generate financial reports — Balance Sheet, Profit & Loss, and more',
      ur: 'مالیاتی رپورٹیں بنائیں — بیلنس شیٹ، نفع و نقصان، اور مزید',
    },
    concepts: [
      {
        term: { en: 'Balance Sheet', ur: 'بیلنس شیٹ' },
        analogy: {
          en: 'A Balance Sheet is like a photograph of your business\'s financial health on a specific day. On one side: everything you OWN (assets). On the other side: everything you OWE (liabilities) + what\'s left for you (equity). These two sides must ALWAYS be equal: Assets = Liabilities + Equity.',
          ur: 'بیلنس شیٹ ایک مخصوص دن آپ کے کاروبار کی مالی صحت کی تصویر ہے۔ ایک طرف: وہ سب جو آپ کے پاس ہے (اثاثے)۔ دوسری طرف: جو آپ نے دینا ہے (ذمہ داریاں) + جو آپ کا حصہ ہے (ایکویٹی)۔ یہ دونوں طرف ہمیشہ برابر ہونی چاہئیں: اثاثے = ذمہ داریاں + ایکویٹی۔',
        },
        definition: {
          en: 'A financial statement showing a business\'s assets, liabilities, and owner\'s equity at a specific point in time.',
          ur: 'ایک مالیاتی گوشوارہ جو کسی مخصوص وقت پر کاروبار کے اثاثے، ذمہ داریاں اور مالک کی ایکویٹی دکھاتا ہے۔',
        },
        inApp: {
          en: 'Go to Reports > Balance Sheet. Select the date and the system generates it automatically from all your recorded transactions.',
          ur: 'Reports > Balance Sheet پر جائیں۔ تاریخ منتخب کریں اور سسٹم آپ کے تمام ریکارڈ شدہ لین دین سے خود بخود بنائے گا۔',
        },
      },
      {
        term: { en: 'Profit & Loss (Income Statement)', ur: 'نفع و نقصان (آمدنی کا گوشوارہ)' },
        analogy: {
          en: 'If the Balance Sheet is a photograph, Profit & Loss is a movie. It shows your income and expenses over a period (like a month). Revenue minus Expenses = Profit (or Loss). Did you make or lose money this month?',
          ur: 'اگر بیلنس شیٹ تصویر ہے تو نفع و نقصان فلم ہے۔ یہ ایک مدت (جیسے ایک مہینے) میں آپ کی آمدنی اور اخراجات دکھاتا ہے۔ آمدنی منفی اخراجات = منافع (یا نقصان)۔ کیا اس مہینے آپ نے کمایا یا کھویا؟',
        },
        definition: {
          en: 'A financial statement showing revenue, expenses, and resulting profit or loss over a specific time period.',
          ur: 'ایک مالیاتی گوشوارہ جو مخصوص مدت میں آمدنی، اخراجات اور نتیجتاً منافع یا نقصان دکھاتا ہے۔',
        },
        inApp: {
          en: 'Go to Reports > Profit & Loss. Choose a date range (this month, this quarter, this year) and the system calculates everything.',
          ur: 'Reports > Profit & Loss پر جائیں۔ تاریخ کی حد منتخب کریں (اس مہینے، سہ ماہی، سال) اور سسٹم سب کچھ حساب لگائے گا۔',
        },
      },
    ],
    steps: [
      {
        title: { en: 'Generate a Report', ur: 'رپورٹ بنائیں' },
        description: {
          en: 'Go to Reports, select the report type (Balance Sheet, P&L, Sales Summary, etc.), choose the date range, and click Generate.',
          ur: 'Reports پر جائیں، رپورٹ کی قسم منتخب کریں (بیلنس شیٹ، نفع و نقصان، فروخت کی سمری وغیرہ)، تاریخ کی حد چنیں اور Generate پر کلک کریں۔',
        },
      },
      {
        title: { en: 'Understand the Numbers', ur: 'اعداد و شمار سمجھیں' },
        description: {
          en: 'Balance Sheet must always balance (Assets = Liabilities + Equity). If it doesn\'t, there\'s an error in your entries. P&L shows if your business is profitable — green total means profit, red means loss.',
          ur: 'بیلنس شیٹ ہمیشہ برابر ہونی چاہیے (اثاثے = ذمہ داریاں + ایکویٹی)۔ اگر نہ ہو تو انٹریز میں غلطی ہے۔ نفع و نقصان دکھاتا ہے کہ کاروبار منافع میں ہے — سبز ٹوٹل منافع ہے، سرخ نقصان۔',
        },
      },
    ],
    tips: [
      {
        en: 'Run Profit & Loss weekly to stay on top of your business performance. Run Balance Sheet monthly to verify everything is correct.',
        ur: 'کاروبار کی کارکردگی پر نظر رکھنے کے لیے ہفتہ وار نفع و نقصان چلائیں۔ سب کچھ درست ہونے کی تصدیق کے لیے ماہانہ بیلنس شیٹ چلائیں۔',
      },
    ],
  },

  /* ──────────────────────────────────────────────
     MANAGEMENT (10 modules)
     ────────────────────────────────────────────── */
  {
    id: 'todos',
    title: { en: 'Tasks', ur: 'کام' },
    icon: ListTodo,
    category: 'management',
    summary: { en: 'Create and track business tasks and to-dos', ur: 'کاروباری کام اور ٹو-ڈوز بنائیں اور ٹریک کریں' },
    steps: [
      { title: { en: 'Create a Task', ur: 'کام بنائیں' }, description: { en: 'Click "Add Task". Enter a title, description, due date, and assign it to a staff member.', ur: '"Add Task" پر کلک کریں۔ عنوان، تفصیل، آخری تاریخ درج کریں اور عملے کے رکن کو تفویض کریں۔' } },
      { title: { en: 'Track Progress', ur: 'پیشرفت ٹریک کریں' }, description: { en: 'Tasks show as Pending, In Progress, or Completed. Filter by status or assignee.', ur: 'کام زیر التوا، جاری، یا مکمل دکھائی دیتے ہیں۔ سٹیٹس یا تفویض شدہ شخص سے فلٹر کریں۔' } },
    ],
  },
  {
    id: 'messages',
    title: { en: 'Messages', ur: 'پیغامات' },
    icon: MessageSquare,
    category: 'management',
    summary: { en: 'Internal messaging between staff members', ur: 'عملے کے ارکان کے درمیان اندرونی پیغام رسانی' },
    steps: [
      { title: { en: 'Send a Message', ur: 'پیغام بھیجیں' }, description: { en: 'Click "New Message", select the recipient, type your message, and send. Messages are visible only to the sender and receiver.', ur: '"New Message" پر کلک کریں، وصول کنندہ منتخب کریں، پیغام ٹائپ کریں اور بھیجیں۔ پیغامات صرف بھیجنے والے اور وصول کنندہ کو نظر آتے ہیں۔' } },
    ],
  },
  {
    id: 'audit-logs',
    title: { en: 'Audit Logs', ur: 'آڈٹ لاگز' },
    icon: ClipboardList,
    category: 'management',
    summary: { en: 'View a detailed record of all user actions in the system', ur: 'سسٹم میں تمام صارف اقدامات کا تفصیلی ریکارڈ دیکھیں' },
    steps: [
      { title: { en: 'Browse Activity History', ur: 'سرگرمی کی تاریخ دیکھیں' }, description: { en: 'Audit Logs record every action: who did what, when. Filter by user, action type (create, update, delete, void), or date range.', ur: 'آڈٹ لاگز ہر عمل ریکارڈ کرتے ہیں: کس نے کیا کیا، کب۔ صارف، عمل کی قسم (بنانا، اپڈیٹ، حذف، منسوخ) یا تاریخ سے فلٹر کریں۔' } },
    ],
    tips: [{ en: 'Review audit logs regularly if you have multiple staff — it helps catch mistakes early.', ur: 'اگر آپ کے کئی عملہ ہیں تو باقاعدگی سے آڈٹ لاگز دیکھیں — اس سے غلطیاں جلد پکڑنے میں مدد ملتی ہے۔' }],
  },
  {
    id: 'audit-reports',
    title: { en: 'Audit Reports', ur: 'آڈٹ رپورٹیں' },
    icon: FileBarChart,
    category: 'management',
    summary: { en: 'Generate compliance and audit reports', ur: 'تعمیل اور آڈٹ رپورٹیں بنائیں' },
    steps: [
      { title: { en: 'Generate an Audit Report', ur: 'آڈٹ رپورٹ بنائیں' }, description: { en: 'Select a date range and the type of audit report (transaction audit, user activity, inventory audit). The system compiles a comprehensive report.', ur: 'تاریخ کی حد اور آڈٹ رپورٹ کی قسم (لین دین آڈٹ، صارف سرگرمی، انوینٹری آڈٹ) منتخب کریں۔ سسٹم جامع رپورٹ مرتب کرتا ہے۔' } },
    ],
  },
  {
    id: 'users',
    title: { en: 'Users', ur: 'صارفین' },
    icon: UserCog,
    category: 'management',
    summary: { en: 'Create and manage staff accounts with role-based access', ur: 'کردار پر مبنی رسائی کے ساتھ عملے کے اکاؤنٹس بنائیں' },
    steps: [
      { title: { en: 'Create a User Account', ur: 'صارف اکاؤنٹ بنائیں' }, description: { en: 'Click "Add User". Enter name, username, email, phone, password, select role (Admin/Manager/Cashier), and assign a branch.', ur: '"Add User" پر کلک کریں۔ نام، یوزر نیم، ای میل، فون، پاسورڈ درج کریں، کردار منتخب کریں (ایڈمن/مینیجر/کیشیئر) اور برانچ تفویض کریں۔' } },
      { title: { en: 'Understand Roles', ur: 'کردار سمجھیں' }, description: { en: 'Admin: Full access to everything. Manager: Can process sales, manage products/inventory, view financials — cannot manage users or system settings. Cashier: POS only — cannot access inventory, financial data, or settings.', ur: 'ایڈمن: ہر چیز تک مکمل رسائی۔ مینیجر: فروخت، پروڈکٹس/انوینٹری، مالیات دیکھ سکتا ہے — صارفین یا سسٹم سیٹنگز کا انتظام نہیں کر سکتا۔ کیشیئر: صرف POS — انوینٹری، مالی ڈیٹا یا سیٹنگز تک رسائی نہیں۔' } },
    ],
    warnings: [{ en: 'Never share admin credentials. Create individual accounts for each staff member for security and audit purposes.', ur: 'ایڈمن پاسورڈ کبھی شیئر نہ کریں۔ سیکیورٹی اور آڈٹ کے لیے ہر عملے کے رکن کا الگ اکاؤنٹ بنائیں۔' }],
  },
  {
    id: 'branches',
    title: { en: 'Branches', ur: 'برانچیں' },
    icon: Building,
    category: 'management',
    summary: { en: 'Set up and manage multiple business locations', ur: 'متعدد کاروباری مقامات مرتب اور منظم کریں' },
    steps: [
      { title: { en: 'Add a Branch', ur: 'برانچ شامل کریں' }, description: { en: 'Click "Add Branch". Enter branch name, unique code, address, phone, email, and dealer license number. Toggle "Set as main branch" for your primary location.', ur: '"Add Branch" پر کلک کریں۔ برانچ کا نام، منفرد کوڈ، پتہ، فون، ای میل اور ڈیلر لائسنس نمبر درج کریں۔ اپنے بنیادی مقام کے لیے "Set as main branch" آن کریں۔' } },
    ],
  },
  {
    id: 'settings',
    title: { en: 'Settings', ur: 'ترتیبات' },
    icon: Settings,
    category: 'management',
    summary: { en: 'Configure business info, tax, payments, receipts, and security', ur: 'کاروبار کی معلومات، ٹیکس، ادائیگیاں، رسیدیں اور سیکیورٹی کنفیگر کریں' },
    steps: [
      { title: { en: 'Business Info', ur: 'کاروبار کی معلومات' }, description: { en: 'Set your company name, NTN, STRN, address, phone, and email. This information appears on all receipts and invoices.', ur: 'اپنی کمپنی کا نام، NTN، STRN، پتہ، فون اور ای میل مقرر کریں۔ یہ معلومات تمام رسیدوں اور انوائسز پر ظاہر ہوتی ہیں۔' } },
      { title: { en: 'Tax & Currency', ur: 'ٹیکس اور کرنسی' }, description: { en: 'Set default tax rate (17% for Pakistan Sales Tax), currency (PKR), and whether prices include tax.', ur: 'ڈیفالٹ ٹیکس شرح (پاکستان سیلز ٹیکس کے لیے 17%)، کرنسی (PKR) اور آیا قیمتوں میں ٹیکس شامل ہے مقرر کریں۔' } },
      { title: { en: 'Sales & Payments', ur: 'فروخت اور ادائیگیاں' }, description: { en: 'Enable/disable payment methods (Cash, Card, Credit, Mobile, COD, Bank Transfer) using checkboxes. Set the default payment method that auto-selects in POS.', ur: 'چیک باکسز سے ادائیگی کے طریقے فعال/غیر فعال کریں (کیش، کارڈ، کریڈٹ، موبائل، COD، بینک ٹرانسفر)۔ POS میں خود منتخب ہونے والا ڈیفالٹ ادائیگی کا طریقہ مقرر کریں۔' } },
      { title: { en: 'Receipt Settings', ur: 'رسید کی ترتیبات' }, description: { en: 'Choose receipt format (58mm/80mm/A4), add header and footer text, configure what information to display.', ur: 'رسید کی شکل (58mm/80mm/A4) منتخب کریں، ہیڈر اور فوٹر ٹیکسٹ شامل کریں، ظاہر ہونے والی معلومات کنفیگر کریں۔' } },
    ],
  },
  {
    id: 'billing',
    title: { en: 'Billing', ur: 'بلنگ' },
    icon: Wallet,
    category: 'management',
    summary: { en: 'Manage your subscription plan and payment history', ur: 'اپنے سبسکرپشن پلان اور ادائیگی کی تاریخ کا انتظام کریں' },
    steps: [
      { title: { en: 'View Your Plan', ur: 'اپنا پلان دیکھیں' }, description: { en: 'See your current subscription plan, features included, and next billing date.', ur: 'اپنا موجودہ سبسکرپشن پلان، شامل خصوصیات اور اگلی بلنگ کی تاریخ دیکھیں۔' } },
      { title: { en: 'Payment History', ur: 'ادائیگی کی تاریخ' }, description: { en: 'View all past payments with dates, amounts, and status.', ur: 'تمام گزشتہ ادائیگیاں تاریخوں، رقوم اور سٹیٹس کے ساتھ دیکھیں۔' } },
    ],
  },
  {
    id: 'support',
    title: { en: 'Support', ur: 'سپورٹ' },
    icon: Headphones,
    category: 'management',
    summary: { en: 'Get help from the development team', ur: 'ڈیولپمنٹ ٹیم سے مدد حاصل کریں' },
    steps: [
      { title: { en: 'Contact Support', ur: 'سپورٹ سے رابطہ کریں' }, description: { en: 'Go to Support to find contact information for the development team. Describe your issue clearly with screenshots if possible.', ur: 'ڈیولپمنٹ ٹیم کی رابطہ معلومات کے لیے Support پر جائیں۔ ممکن ہو تو اسکرین شاٹس کے ساتھ اپنا مسئلہ واضح طور پر بیان کریں۔' } },
    ],
  },

  /* ──────────────────────────────────────────────
     EXTRA — Troubleshooting & Tips
     ────────────────────────────────────────────── */
  {
    id: 'common-issues',
    title: { en: 'Common Issues & Solutions', ur: 'عام مسائل اور حل' },
    icon: AlertTriangle,
    category: 'management',
    summary: { en: 'Quick fixes for frequently encountered problems', ur: 'عام مسائل کے فوری حل' },
    steps: [
      { title: { en: 'Cannot Log In', ur: 'لاگ ان نہیں ہو رہا' }, description: { en: 'Check your username/email and password carefully. If forgotten, contact your admin to reset. If your account is deactivated, you cannot log in.', ur: 'اپنا یوزر نیم/ای میل اور پاسورڈ احتیاط سے چیک کریں۔ اگر بھول گئے ہیں تو اپنے ایڈمن سے ری سیٹ کروائیں۔ اگر اکاؤنٹ غیر فعال ہے تو لاگ ان نہیں ہو سکتے۔' } },
      { title: { en: 'Product Not Showing in POS', ur: 'پروڈکٹ POS میں نظر نہیں آ رہی' }, description: { en: 'Ensure the product is Active and has stock > 0. Check the product\'s branch matches your current branch.', ur: 'یقینی بنائیں کہ پروڈکٹ فعال ہے اور اسٹاک 0 سے زیادہ ہے۔ چیک کریں کہ پروڈکٹ کی برانچ آپ کی موجودہ برانچ سے ملتی ہے۔' } },
      { title: { en: 'Serial Number Rejected', ur: 'سیریل نمبر مسترد ہو گیا' }, description: { en: 'Serial numbers must be unique. Check if it was already used in another sale or recorded in inventory.', ur: 'سیریل نمبر منفرد ہونے چاہئیں۔ چیک کریں کہ یہ پہلے سے کسی اور فروخت میں استعمال تو نہیں ہوا یا انوینٹری میں ریکارڈ ہے۔' } },
      { title: { en: 'Balance Sheet Not Balancing', ur: 'بیلنس شیٹ برابر نہیں ہو رہی' }, description: { en: 'Check recent journal entries for errors. Ensure total debits = total credits on every entry. Look for missing entries (like owner equity initial investment).', ur: 'حالیہ جرنل انٹریز میں غلطیاں چیک کریں۔ ہر انٹری میں کل ڈیبٹ = کل کریڈٹ یقینی بنائیں۔ غائب انٹریز تلاش کریں (جیسے مالک کی ایکویٹی ابتدائی سرمایہ کاری)۔' } },
      { title: { en: 'Receipt Not Printing', ur: 'رسید پرنٹ نہیں ہو رہی' }, description: { en: 'Check printer connection and paper. Verify receipt width in Settings > Receipt matches your printer. Try a test print from browser.', ur: 'پرنٹر کنکشن اور کاغذ چیک کریں۔ Settings > Receipt میں رسید کی چوڑائی اپنے پرنٹر سے ملائیں۔ براؤزر سے ٹیسٹ پرنٹ آزمائیں۔' } },
    ],
  },
  {
    id: 'tips-shortcuts',
    title: { en: 'Tips & Shortcuts', ur: 'مشورے اور شارٹ کٹس' },
    icon: Lightbulb,
    category: 'management',
    summary: { en: 'Work faster with these productivity tips', ur: 'ان پیداواری مشوروں سے تیزی سے کام کریں' },
    steps: [
      { title: { en: 'Quick Search in POS', ur: 'POS میں فوری تلاش' }, description: { en: 'Just start typing in the search bar — results filter in real-time. No need to press Enter.', ur: 'سرچ بار میں ٹائپ شروع کریں — نتائج فوری فلٹر ہوتے ہیں۔ انٹر دبانے کی ضرورت نہیں۔' } },
      { title: { en: 'Hold & Resume Orders', ur: 'آرڈرز روکیں اور دوبارہ شروع کریں' }, description: { en: 'Click "Hold" to save a cart, resume anytime from POS Tabs. Great for when customers step away.', ur: '"Hold" پر کلک کر کے کارٹ محفوظ کریں، کسی بھی وقت POS Tabs سے دوبارہ شروع کریں۔ کسٹمر جب باہر جائے تو بہترین۔' } },
      { title: { en: 'Use Category Filters', ur: 'کیٹیگری فلٹرز استعمال کریں' }, description: { en: 'In POS, click category chips to quickly narrow down products. Combine with search for precise results.', ur: 'POS میں پروڈکٹس فوری تلاش کے لیے کیٹیگری چپس پر کلک کریں۔ درست نتائج کے لیے سرچ کے ساتھ ملائیں۔' } },
      { title: { en: 'Regular Backups', ur: 'باقاعدہ بیک اپ' }, description: { en: 'Export your reports regularly. This gives you a record outside the system in case you ever need it.', ur: 'اپنی رپورٹیں باقاعدگی سے ایکسپورٹ کریں۔ یہ سسٹم سے باہر ریکارڈ دیتا ہے اگر آپ کو کبھی ضرورت ہو۔' } },
    ],
  },
]
