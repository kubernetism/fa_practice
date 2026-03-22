import React, { useState, useMemo } from 'react'
import {
  BookOpen,
  Search,
  Lightbulb,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Headphones,
  Target,
  Home,
  Monitor,
  Languages,
  Plus,
  Minus,
  LayoutDashboard,
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
  Play,
  Store,
  TrendingUp,
  Calculator,
  Shield,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

/* ── Types ── */
type Language = 'en' | 'ur'
type BilingualText = { en: string; ur: string }
type GuideStep = { title: BilingualText; description: BilingualText }
type GuideExample = { label: BilingualText; fields: { name: BilingualText; value: string }[] }
type ConceptExplainer = { term: BilingualText; analogy: BilingualText; definition: BilingualText; inApp: BilingualText }

type GuideSection = {
  id: string
  title: BilingualText
  icon: React.ElementType
  category: 'operations' | 'financial' | 'accounting' | 'management'
  summary: BilingualText
  steps: GuideStep[]
  examples?: GuideExample[]
  concepts?: ConceptExplainer[]
  tips?: BilingualText[]
  warnings?: BilingualText[]
}

type WorkflowPhase = {
  id: string
  title: BilingualText
  description: BilingualText
  modules: string[]
  icon: React.ElementType
}

/* ── Helpers ── */
const t = (text: BilingualText, lang: Language) => text[lang]

/* ── Workflow Phases ── */
const workflowIntro: BilingualText = {
  en: 'This guide walks you through every step of running your business — from initial setup to daily sales to monthly accounting. Follow the phases in order if you are new, or jump to any module you need help with.',
  ur: 'یہ گائیڈ آپ کو کاروبار چلانے کے ہر مرحلے میں رہنمائی کرتا ہے — ابتدائی سیٹ اپ سے لے کر روزانہ کی فروخت اور ماہانہ حسابات تک۔ اگر آپ نئے ہیں تو مراحل کو ترتیب سے فالو کریں، یا کسی بھی ماڈیول پر جائیں جہاں آپ کو مدد چاہیے۔',
}

const workflowPhases: WorkflowPhase[] = [
  {
    id: 'phase-setup',
    title: { en: 'Initial Setup (One-Time)', ur: 'ابتدائی سیٹ اپ (ایک بار)' },
    description: {
      en: 'Before you can sell anything, set up your business info, create branches, add staff accounts, configure tax rates, and organize your product categories.',
      ur: 'کچھ بھی فروخت کرنے سے پہلے، اپنے کاروبار کی معلومات درج کریں، برانچیں بنائیں، عملے کے اکاؤنٹس شامل کریں، ٹیکس کی شرح مقرر کریں، اور پروڈکٹ کیٹیگریز ترتیب دیں۔',
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
    modules: ['cash-register', 'pos', 'sales', 'customers', 'returns'],
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
      en: 'Review your journal entries, check your chart of accounts, track service income, and generate financial reports like Balance Sheet and Profit & Loss.',
      ur: 'اپنی جرنل انٹریز کا جائزہ لیں، چارٹ آف اکاؤنٹس چیک کریں، سروس کی آمدنی ٹریک کریں، اور بیلنس شیٹ اور نفع و نقصان جیسی مالیاتی رپورٹیں بنائیں۔',
    },
    modules: ['journal-entries', 'chart-of-accounts', 'services', 'reports'],
    icon: Calculator,
  },
  {
    id: 'phase-admin',
    title: { en: 'Administration & Oversight', ur: 'انتظامیہ اور نگرانی' },
    description: {
      en: 'Review audit logs and reports, manage user accounts, configure settings, and get support when needed.',
      ur: 'آڈٹ لاگز اور رپورٹس دیکھیں، صارف اکاؤنٹس کا انتظام کریں، سیٹنگز ترتیب دیں، اور ضرورت پڑنے پر سپورٹ حاصل کریں۔',
    },
    modules: ['audit-logs', 'audit-reports', 'users', 'branches', 'settings'],
    icon: Shield,
  },
]

/* ── Guide Sections (35 modules) ── */
const guideSections: GuideSection[] = [
  // ── OPERATIONS ──
  {
    id: 'dashboard',
    title: { en: 'Dashboard', ur: 'ڈیش بورڈ' },
    icon: LayoutDashboard,
    category: 'operations',
    summary: { en: 'Your business at a glance — sales, revenue, stock alerts', ur: 'آپ کے کاروبار کا مکمل جائزہ — فروخت، آمدنی، اسٹاک الرٹس' },
    steps: [
      { title: { en: 'Understanding KPI Cards', ur: 'KPI کارڈز کو سمجھنا' }, description: { en: 'At the top you\'ll see 4 cards: Today\'s Sales (total revenue today), Orders Today (number of transactions), Products (total items + low stock count), and Revenue MTD (month-to-date earnings). Green arrows mean improvement, red arrows mean decline.', ur: 'اوپر 4 کارڈز نظر آئیں گے: آج کی فروخت، آج کے آرڈرز، پروڈکٹس، اور ماہانہ آمدنی۔ سبز تیر بہتری اور سرخ تیر کمی کی نشاندہی کرتے ہیں۔' } },
      { title: { en: 'Recent Sales List', ur: 'حالیہ فروخت کی فہرست' }, description: { en: 'Shows the last 5 transactions with customer name, invoice number, time, amount, and payment method.', ur: 'آخری 5 لین دین دکھاتا ہے جن میں کسٹمر کا نام، انوائس نمبر، وقت، رقم اور ادائیگی کا طریقہ شامل ہوتا ہے۔' } },
      { title: { en: 'Low Stock Alerts', ur: 'کم اسٹاک الرٹس' }, description: { en: 'Shows products running low. Red badges = critically low (2 or fewer), amber = approaching minimum. Click any product to go to inventory.', ur: 'کم اسٹاک والی پروڈکٹس دکھاتا ہے۔ سرخ بیج = انتہائی کم، نارنجی = کم ہو رہا ہے۔' } },
    ],
    tips: [{ en: 'Check the dashboard first thing every morning to see overnight sales and stock alerts.', ur: 'ہر صبح سب سے پہلے ڈیش بورڈ چیک کریں۔' }],
  },
  {
    id: 'pos',
    title: { en: 'Point of Sale (POS)', ur: 'پوائنٹ آف سیل (POS)' },
    icon: ShoppingCart,
    category: 'operations',
    summary: { en: 'Process sales — search products, build cart, select customer, choose payment, complete sale', ur: 'فروخت کریں — پروڈکٹس تلاش کریں، کارٹ بنائیں، کسٹمر چنیں، ادائیگی کا طریقہ منتخب کریں' },
    steps: [
      { title: { en: 'Open the POS Page', ur: 'POS صفحہ کھولیں' }, description: { en: 'Click "Point of Sale" in the sidebar. Split screen: products on the left, cart on the right.', ur: 'سائیڈبار میں "Point of Sale" پر کلک کریں۔ بائیں طرف پروڈکٹس، دائیں طرف کارٹ۔' } },
      { title: { en: 'Search and Add Products', ur: 'پروڈکٹس تلاش کریں اور شامل کریں' }, description: { en: 'Type a product name or code in the search bar, or use category chips to filter. Click a product card to add it to cart. For serial-tracked items (firearms), a dialog asks for the serial number.', ur: 'سرچ بار میں نام یا کوڈ ٹائپ کریں۔ کارڈ پر کلک کر کے کارٹ میں شامل کریں۔ سیریل ٹریکنگ والی اشیاء کے لیے سیریل نمبر مانگا جائے گا۔' } },
      { title: { en: 'Select a Customer', ur: 'کسٹمر منتخب کریں' }, description: { en: 'Use the customer dropdown at the top of the cart. Search by name. For anonymous sales, use "Walk-in Customer" (selected by default).', ur: 'کارٹ کے اوپر کسٹمر ڈراپ ڈاؤن استعمال کریں۔ بغیر نام فروخت کے لیے "Walk-in Customer" استعمال کریں۔' } },
      { title: { en: 'Adjust Quantities', ur: 'مقدار تبدیل کریں' }, description: { en: 'Use + and - buttons on each cart item. Click the trash icon to remove an item.', ur: 'ہر آئٹم پر + اور - بٹن سے مقدار تبدیل کریں۔ ہٹانے کے لیے ٹریش آئیکن دبائیں۔' } },
      { title: { en: 'Apply Discount (Optional)', ur: 'رعایت لگائیں (اختیاری)' }, description: { en: 'Enter a discount amount in the order summary section. This reduces the total before tax.', ur: 'آرڈر خلاصے میں رعایت کی رقم درج کریں۔' } },
      { title: { en: 'Choose Payment Method', ur: 'ادائیگی کا طریقہ چنیں' }, description: { en: 'Select from your enabled payment methods (Cash, Card, Credit, Mobile, COD, Bank Transfer). For cash, enter amount received to calculate change.', ur: 'فعال ادائیگی کے طریقوں میں سے منتخب کریں۔ نقد کے لیے وصول شدہ رقم درج کریں۔' } },
      { title: { en: 'Complete the Sale', ur: 'فروخت مکمل کریں' }, description: { en: 'Click "Complete Sale". The receipt generates automatically. Print or save it.', ur: '"Complete Sale" پر کلک کریں۔ رسید خود بخود بنے گی۔' } },
    ],
    examples: [{
      label: { en: 'Example: Selling a Glock 19', ur: 'مثال: Glock 19 فروخت کرنا' },
      fields: [
        { name: { en: 'Product', ur: 'پروڈکٹ' }, value: 'Glock 19 Gen 5' },
        { name: { en: 'Serial Number', ur: 'سیریل نمبر' }, value: 'ABC12345' },
        { name: { en: 'Customer', ur: 'کسٹمر' }, value: 'Ahmed Khan' },
        { name: { en: 'Price', ur: 'قیمت' }, value: 'Rs. 450,000' },
        { name: { en: 'Payment', ur: 'ادائیگی' }, value: 'Cash' },
      ],
    }],
    tips: [
      { en: 'Use "Hold" to save a cart and come back later — useful when a customer needs to step away.', ur: '"Hold" سے کارٹ محفوظ کریں اور بعد میں واپس آئیں۔' },
      { en: 'Credit sales are tracked in Receivables and must be settled later.', ur: 'ادھار فروخت "Receivables" میں ٹریک ہوتی ہے۔' },
    ],
    warnings: [
      { en: 'Serial numbers must be unique — the system rejects duplicates.', ur: 'سیریل نمبر منفرد ہونے چاہئیں — سسٹم ڈپلیکیٹ رد کرتا ہے۔' },
      { en: 'Voiding a completed sale requires Manager or Admin privileges.', ur: 'مکمل فروخت منسوخ کرنے کے لیے منیجر یا ایڈمن کی اجازت درکار ہے۔' },
    ],
  },
  {
    id: 'products',
    title: { en: 'Products', ur: 'پروڈکٹس' },
    icon: Package,
    category: 'operations',
    summary: { en: 'Add, edit, and organize your product catalog with serial tracking', ur: 'سیریل ٹریکنگ کے ساتھ پروڈکٹ کیٹلاگ شامل کریں، تبدیل کریں، ترتیب دیں' },
    steps: [
      { title: { en: 'Add a New Product', ur: 'نئی پروڈکٹ شامل کریں' }, description: { en: 'Click "Add Product". Fill in: name, product code, category, sale price, cost price, and tax settings. Enable serial tracking for firearms.', ur: '"Add Product" پر کلک کریں۔ نام، کوڈ، کیٹیگری، فروخت قیمت، لاگت قیمت، ٹیکس سیٹنگز بھریں۔ فائر آرمز کے لیے سیریل ٹریکنگ فعال کریں۔' } },
      { title: { en: 'Search and Filter', ur: 'تلاش اور فلٹر' }, description: { en: 'Use the search bar for name/code/barcode. Filter by category or status (Active/Inactive).', ur: 'نام/کوڈ/بارکوڈ کے لیے سرچ بار استعمال کریں۔ کیٹیگری یا حالت سے فلٹر کریں۔' } },
      { title: { en: 'Edit Product Details', ur: 'پروڈکٹ کی تفصیلات تبدیل کریں' }, description: { en: 'Click the edit icon on any product row to modify details, pricing, or tracking settings.', ur: 'کسی بھی پروڈکٹ کی قطار میں ایڈٹ آئیکن پر کلک کریں۔' } },
      { title: { en: 'Deactivate Products', ur: 'پروڈکٹس غیر فعال کریں' }, description: { en: 'Instead of deleting, deactivate products you no longer sell. They stay hidden from POS but remain in records.', ur: 'حذف کرنے کی بجائے غیر فعال کریں۔ POS سے چھپ جائیں گی لیکن ریکارڈ میں رہیں گی۔' } },
    ],
    examples: [{
      label: { en: 'Example: Adding a Firearm', ur: 'مثال: فائر آرم شامل کرنا' },
      fields: [
        { name: { en: 'Name', ur: 'نام' }, value: 'Glock 19 Gen 5' },
        { name: { en: 'Code', ur: 'کوڈ' }, value: 'FIR-001' },
        { name: { en: 'Category', ur: 'کیٹیگری' }, value: 'Firearms > Pistols' },
        { name: { en: 'Sale Price', ur: 'فروخت قیمت' }, value: 'Rs. 450,000' },
        { name: { en: 'Cost Price', ur: 'لاگت قیمت' }, value: 'Rs. 380,000' },
        { name: { en: 'Serial Tracking', ur: 'سیریل ٹریکنگ' }, value: 'Enabled' },
      ],
    }],
    tips: [
      { en: 'Use consistent product codes (e.g., FIR-001, AMM-001) for easy identification.', ur: 'آسان شناخت کے لیے مستقل کوڈ استعمال کریں (مثلاً FIR-001, AMM-001)۔' },
      { en: 'Set accurate cost prices to get correct profit margins in reports.', ur: 'رپورٹس میں درست منافع کے لیے صحیح لاگت قیمت درج کریں۔' },
    ],
  },
  {
    id: 'inventory',
    title: { en: 'Inventory / Stock', ur: 'انوینٹری / اسٹاک' },
    icon: Warehouse,
    category: 'operations',
    summary: { en: 'Track stock levels, make adjustments, transfer between branches', ur: 'اسٹاک لیول ٹریک کریں، ایڈجسٹمنٹ کریں، برانچوں کے درمیان منتقلی' },
    steps: [
      { title: { en: 'View Stock Levels', ur: 'اسٹاک لیول دیکھیں' }, description: { en: 'Go to Stock page. See current stock for each product with status indicators (In Stock, Low, Out of Stock).', ur: 'اسٹاک صفحے پر جائیں۔ ہر پروڈکٹ کا موجودہ اسٹاک حالت کے ساتھ دیکھیں۔' } },
      { title: { en: 'Make Stock Adjustments', ur: 'اسٹاک ایڈجسٹمنٹ کریں' }, description: { en: 'Click "Adjust Stock" to record changes. Types: Received, Damaged, Lost, Returned, Correction, Audit.', ur: '"Adjust Stock" سے تبدیلیاں ریکارڈ کریں۔ اقسام: موصول، خراب، گم، واپس، اصلاح، آڈٹ۔' } },
      { title: { en: 'Transfer Between Branches', ur: 'برانچوں کے درمیان منتقلی' }, description: { en: 'Click "Transfer" to move stock from one branch to another. Select source, destination, products, and quantities.', ur: '"Transfer" سے ایک برانچ سے دوسری میں اسٹاک منتقل کریں۔' } },
    ],
    tips: [
      { en: 'Run regular stock audits and use "Audit" adjustment type to correct discrepancies.', ur: 'باقاعدگی سے اسٹاک آڈٹ کریں اور فرق درست کرنے کے لیے "Audit" ایڈجسٹمنٹ استعمال کریں۔' },
    ],
  },
  {
    id: 'sales',
    title: { en: 'Sales History', ur: 'فروخت کی تاریخ' },
    icon: Receipt,
    category: 'operations',
    summary: { en: 'Review past sales, filter, and void transactions', ur: 'گزشتہ فروخت دیکھیں، فلٹر کریں، لین دین منسوخ کریں' },
    steps: [
      { title: { en: 'View All Sales', ur: 'تمام فروخت دیکھیں' }, description: { en: 'Click "Sales History" in the sidebar. View all completed transactions with filters.', ur: 'سائیڈبار میں "Sales History" پر کلک کریں۔' } },
      { title: { en: 'Search and Filter', ur: 'تلاش اور فلٹر' }, description: { en: 'Search by sale number or customer name. Filter by payment method, status, or date range.', ur: 'سیل نمبر یا کسٹمر نام سے تلاش کریں۔ ادائیگی کے طریقے، حالت، یا تاریخ سے فلٹر کریں۔' } },
      { title: { en: 'View Sale Details', ur: 'فروخت کی تفصیلات' }, description: { en: 'Click "View" on any sale for full details: items, quantities, prices, payment breakdown, serial numbers.', ur: 'کسی بھی فروخت پر "View" سے مکمل تفصیلات دیکھیں۔' } },
      { title: { en: 'Void a Sale', ur: 'فروخت منسوخ کریں' }, description: { en: 'Click "Void", enter reason, and confirm. Voided sales are marked but preserved for audit.', ur: '"Void" پر کلک کریں، وجہ درج کریں، تصدیق کریں۔ منسوخ فروخت آڈٹ کے لیے محفوظ رہتی ہے۔' } },
    ],
    warnings: [
      { en: 'Voided sales cannot be un-voided. Always double-check before confirming.', ur: 'منسوخ فروخت واپس نہیں ہو سکتی۔ تصدیق سے پہلے دوبارہ چیک کریں۔' },
    ],
  },
  {
    id: 'customers',
    title: { en: 'Customers', ur: 'صارفین' },
    icon: Users,
    category: 'operations',
    summary: { en: 'Maintain customer records with CNIC and firearm license tracking', ur: 'شناختی کارڈ اور فائر آرم لائسنس کے ساتھ کسٹمر ریکارڈ رکھیں' },
    steps: [
      { title: { en: 'Add a Customer', ur: 'کسٹمر شامل کریں' }, description: { en: 'Click "Add Customer". Enter name, CNIC/passport, phone, email, and firearm license details.', ur: '"Add Customer" پر کلک کریں۔ نام، شناختی کارڈ، فون، ای میل اور لائسنس کی تفصیلات درج کریں۔' } },
      { title: { en: 'Track Firearm Licenses', ur: 'فائر آرم لائسنس ٹریک کریں' }, description: { en: 'Enter license number and expiry date. The system shows badges: Valid, Expiring Soon, Expired.', ur: 'لائسنس نمبر اور میعاد ختم ہونے کی تاریخ درج کریں۔ سسٹم حالت دکھائے گا۔' } },
    ],
    tips: [{ en: 'Always record CNIC for firearm sales — it is a legal requirement.', ur: 'فائر آرم کی فروخت کے لیے ہمیشہ شناختی کارڈ درج کریں — یہ قانونی ضرورت ہے۔' }],
    warnings: [{ en: 'Never sell firearms to customers with expired licenses.', ur: 'میعاد ختم لائسنس والے صارفین کو فائر آرم فروخت نہ کریں۔' }],
  },
  {
    id: 'returns',
    title: { en: 'Returns', ur: 'واپسیاں' },
    icon: RotateCcw,
    category: 'operations',
    summary: { en: 'Handle product returns, refunds, exchanges, and store credit', ur: 'پروڈکٹ واپسی، رقم واپسی، تبادلہ، اور اسٹور کریڈٹ' },
    steps: [
      { title: { en: 'Start a New Return', ur: 'نئی واپسی شروع کریں' }, description: { en: 'Click "New Return". Look up the original sale by sale number.', ur: '"New Return" پر کلک کریں۔ سیل نمبر سے اصل فروخت تلاش کریں۔' } },
      { title: { en: 'Select Items to Return', ur: 'واپسی کی اشیاء منتخب کریں' }, description: { en: 'Choose items, specify quantity, condition, and whether restockable.', ur: 'اشیاء منتخب کریں، مقدار، حالت، اور واپس اسٹاک ہونے کی صلاحیت بتائیں۔' } },
      { title: { en: 'Set Return Type', ur: 'واپسی کی قسم' }, description: { en: 'Choose Refund, Exchange, or Store Credit.', ur: 'رقم واپسی، تبادلہ، یا اسٹور کریڈٹ منتخب کریں۔' } },
    ],
    tips: [{ en: 'Restockable items are automatically added back to inventory.', ur: 'واپس اسٹاک ہونے والی اشیاء خود بخود انوینٹری میں شامل ہو جاتی ہیں۔' }],
  },
  {
    id: 'suppliers',
    title: { en: 'Suppliers', ur: 'سپلائرز' },
    icon: Truck,
    category: 'operations',
    summary: { en: 'Maintain supplier contacts with NTN and payment terms', ur: 'NTN اور ادائیگی کی شرائط کے ساتھ سپلائر رابطے رکھیں' },
    steps: [
      { title: { en: 'Add a Supplier', ur: 'سپلائر شامل کریں' }, description: { en: 'Click "Add Supplier". Enter company name, contact person, phone, email, NTN, and payment terms.', ur: '"Add Supplier" پر کلک کریں۔ کمپنی کا نام، رابطہ شخص، فون، ای میل، NTN اور ادائیگی کی شرائط درج کریں۔' } },
    ],
    tips: [{ en: 'Set payment terms (Net 30, Net 60) to track payable deadlines.', ur: 'ادائیگی کی شرائط (Net 30, Net 60) مقرر کریں۔' }],
  },
  {
    id: 'categories',
    title: { en: 'Categories', ur: 'کیٹیگریز' },
    icon: FolderTree,
    category: 'operations',
    summary: { en: 'Create and organize product categories', ur: 'پروڈکٹ کیٹیگریز بنائیں اور ترتیب دیں' },
    steps: [
      { title: { en: 'Create a Category', ur: 'کیٹیگری بنائیں' }, description: { en: 'Click "Add Category". Enter a name. Categories organize products in the POS grid and product list.', ur: '"Add Category" پر کلک کریں۔ نام درج کریں۔ کیٹیگریز POS گرڈ اور پروڈکٹ لسٹ کو ترتیب دیتی ہیں۔' } },
    ],
    tips: [{ en: 'Suggested categories: Firearms, Ammunition, Accessories, Optics, Clothing.', ur: 'تجویز کردہ کیٹیگریز: فائر آرمز، گولہ بارود، لوازمات، آپٹکس، لباس۔' }],
  },
  // ── FINANCIAL ──
  {
    id: 'expenses',
    title: { en: 'Expenses', ur: 'اخراجات' },
    icon: HandCoins,
    category: 'financial',
    summary: { en: 'Record and categorize business expenses', ur: 'کاروباری اخراجات ریکارڈ اور درجہ بند کریں' },
    steps: [
      { title: { en: 'Record an Expense', ur: 'خرچ ریکارڈ کریں' }, description: { en: 'Click "Add Expense". Enter description, amount, category, date, and payment method.', ur: '"Add Expense" پر کلک کریں۔ تفصیل، رقم، کیٹیگری، تاریخ اور ادائیگی کا طریقہ درج کریں۔' } },
    ],
    tips: [{ en: 'Create expense categories like Rent, Utilities, Transport, Salary for better tracking.', ur: 'بہتر ٹریکنگ کے لیے کرایہ، بجلی، ٹرانسپورٹ، تنخواہ جیسی کیٹیگریز بنائیں۔' }],
  },
  {
    id: 'payables',
    title: { en: 'Payables (What You Owe)', ur: 'واجبات الادا (جو آپ نے دینا ہے)' },
    icon: CreditCard,
    category: 'financial',
    summary: { en: 'Track money you owe to suppliers and others', ur: 'سپلائرز اور دوسروں کو دینے والی رقم ٹریک کریں' },
    steps: [
      { title: { en: 'Understanding Payables', ur: 'واجبات الادا سمجھیں' }, description: { en: 'When you buy goods on credit (pay later), that\'s a "payable". It means you owe money to someone.', ur: 'جب آپ ادھار پر سامان خریدتے ہیں (بعد میں ادائیگی)، تو یہ "واجبات الادا" ہے۔ اس کا مطلب ہے آپ نے کسی کو رقم دینی ہے۔' } },
      { title: { en: 'Record a Payable', ur: 'واجب الادا ریکارڈ کریں' }, description: { en: 'Click "Add Payable". Select the supplier, enter amount, due date, and reference number.', ur: '"Add Payable" پر کلک کریں۔ سپلائر منتخب کریں، رقم، مقررہ تاریخ اور حوالہ نمبر درج کریں۔' } },
      { title: { en: 'Make a Payment', ur: 'ادائیگی کریں' }, description: { en: 'Click "Pay" on a payable to record full or partial payment. The balance updates automatically.', ur: 'واجب الادا پر "Pay" سے مکمل یا جزوی ادائیگی ریکارڈ کریں۔' } },
    ],
    concepts: [{
      term: { en: 'Accounts Payable', ur: 'واجبات الادا' },
      analogy: { en: 'Think of it like a tab at a restaurant — you ate the food (got the goods) but haven\'t paid the bill yet. The tab is your "payable".', ur: 'اسے ریستوران کے ٹیب کی طرح سمجھیں — آپ نے کھانا کھا لیا (سامان لے لیا) لیکن بل ابھی نہیں دیا۔ یہ ٹیب آپ کا "واجب الادا" ہے۔' },
      definition: { en: 'Money your business owes to suppliers or vendors for goods/services received but not yet paid for.', ur: 'وہ رقم جو آپ کے کاروبار نے سپلائرز کو موصول سامان/خدمات کے لیے دینی ہے لیکن ابھی تک ادا نہیں کی۔' },
      inApp: { en: 'Go to Payables in the sidebar. Each entry shows supplier, amount, due date, and payment status.', ur: 'سائیڈبار میں Payables پر جائیں۔ ہر اندراج میں سپلائر، رقم، مقررہ تاریخ اور ادائیگی کی حالت نظر آتی ہے۔' },
    }],
  },
  {
    id: 'receivables',
    title: { en: 'Receivables (What Others Owe You)', ur: 'قابل وصول (جو دوسروں نے آپ کو دینا ہے)' },
    icon: Wallet,
    category: 'financial',
    summary: { en: 'Track money customers owe you from credit sales', ur: 'ادھار فروخت سے صارفین پر واجب رقم ٹریک کریں' },
    steps: [
      { title: { en: 'Understanding Receivables', ur: 'قابل وصول سمجھیں' }, description: { en: 'When you sell on credit (customer pays later), that\'s a "receivable". The customer owes you money.', ur: 'جب آپ ادھار پر فروخت کرتے ہیں (صارف بعد میں ادا کرے)، تو یہ "قابل وصول" ہے۔ صارف نے آپ کو رقم دینی ہے۔' } },
      { title: { en: 'View Receivables', ur: 'قابل وصول دیکھیں' }, description: { en: 'Go to Receivables. Each entry shows customer name, amount owed, due date, and collection status.', ur: 'Receivables پر جائیں۔ ہر اندراج میں کسٹمر کا نام، واجب رقم، مقررہ تاریخ اور وصولی کی حالت نظر آتی ہے۔' } },
      { title: { en: 'Collect Payment', ur: 'رقم وصول کریں' }, description: { en: 'Click "Collect" to record a payment received from the customer.', ur: '"Collect" سے کسٹمر سے موصول ادائیگی ریکارڈ کریں۔' } },
    ],
    concepts: [{
      term: { en: 'Accounts Receivable', ur: 'قابل وصول' },
      analogy: { en: 'It\'s like lending money to a friend — they have your money and you\'re waiting to get it back. Each credit sale is a small "loan" to the customer.', ur: 'یہ ایسے ہے جیسے آپ نے دوست کو رقم ادھار دی — ان کے پاس آپ کی رقم ہے اور آپ واپسی کا انتظار کر رہے ہیں۔ ہر ادھار فروخت کسٹمر کو ایک چھوٹا "قرض" ہے۔' },
      definition: { en: 'Money owed to your business by customers who purchased on credit.', ur: 'وہ رقم جو ادھار خریداری کرنے والے صارفین نے آپ کے کاروبار کو دینی ہے۔' },
      inApp: { en: 'Go to Receivables in the sidebar. Track each customer\'s outstanding balance and collection history.', ur: 'سائیڈبار میں Receivables پر جائیں۔ ہر کسٹمر کا بقایا بیلنس اور وصولی کی تاریخ ٹریک کریں۔' },
    }],
  },
  {
    id: 'cash-register',
    title: { en: 'Cash Register', ur: 'کیش رجسٹر' },
    icon: Banknote,
    category: 'financial',
    summary: { en: 'Open/close cash sessions, track cash in/out, reconcile', ur: 'کیش سیشن کھولیں/بند کریں، نقدی کی آمد و رفت ٹریک کریں' },
    steps: [
      { title: { en: 'Open a Session', ur: 'سیشن کھولیں' }, description: { en: 'Click "Open Register". Enter the opening cash amount (how much cash is in the drawer before sales start).', ur: '"Open Register" پر کلک کریں۔ ابتدائی نقد رقم درج کریں (فروخت شروع ہونے سے پہلے دراز میں کتنی رقم ہے)۔' } },
      { title: { en: 'Cash In/Out During Day', ur: 'دن میں نقدی داخل/خارج' }, description: { en: 'Use "Cash In" to add money (e.g., change from bank) and "Cash Out" to record removals (e.g., paying a supplier in cash).', ur: '"Cash In" سے رقم شامل کریں اور "Cash Out" سے نکالی گئی رقم ریکارڈ کریں۔' } },
      { title: { en: 'Close Session', ur: 'سیشن بند کریں' }, description: { en: 'At end of day, click "Close Register". Count the cash in drawer and enter it. The system shows expected vs actual and any difference.', ur: 'دن کے آخر میں "Close Register" پر کلک کریں۔ دراز میں رقم گنیں اور درج کریں۔ سسٹم متوقع بمقابلہ اصل اور فرق دکھائے گا۔' } },
    ],
    tips: [{ en: 'Always open a register session before processing sales — it keeps your cash tracking accurate.', ur: 'فروخت سے پہلے ہمیشہ رجسٹر سیشن کھولیں — یہ نقدی کی ٹریکنگ درست رکھتا ہے۔' }],
  },
  {
    id: 'commissions',
    title: { en: 'Commissions', ur: 'کمیشن' },
    icon: BadgePercent,
    category: 'financial',
    summary: { en: 'Set commission rates and track earned commissions', ur: 'کمیشن کی شرح مقرر کریں اور حاصل کردہ کمیشن ٹریک کریں' },
    steps: [
      { title: { en: 'Set Commission Rates', ur: 'کمیشن کی شرح مقرر کریں' }, description: { en: 'Configure percentage or fixed-amount commission rules for staff or referral partners.', ur: 'عملے یا حوالہ شراکت داروں کے لیے فیصد یا مقررہ رقم کمیشن کے اصول ترتیب دیں۔' } },
      { title: { en: 'View Commission Reports', ur: 'کمیشن رپورٹ دیکھیں' }, description: { en: 'Track total commissions earned by each person over any date range.', ur: 'کسی بھی مدت میں ہر شخص کی کل حاصل کردہ کمیشن ٹریک کریں۔' } },
    ],
  },
  {
    id: 'referrals',
    title: { en: 'Referrals', ur: 'حوالہ جات' },
    icon: UserCheck,
    category: 'financial',
    summary: { en: 'Track referral persons and their sales contributions', ur: 'حوالہ دینے والے افراد اور ان کی فروخت کی شراکت ٹریک کریں' },
    steps: [
      { title: { en: 'Add a Referral Person', ur: 'حوالہ شخص شامل کریں' }, description: { en: 'Click "Add Referral Person". Enter name, phone, and commission rate.', ur: '"Add Referral Person" پر کلک کریں۔ نام، فون اور کمیشن کی شرح درج کریں۔' } },
      { title: { en: 'Link to Sales', ur: 'فروخت سے جوڑیں' }, description: { en: 'When processing a sale in POS, select a referral person to track their contribution.', ur: 'POS میں فروخت کے دوران حوالہ شخص منتخب کریں۔' } },
    ],
  },
  {
    id: 'vouchers',
    title: { en: 'Vouchers', ur: 'واؤچرز' },
    icon: FileText,
    category: 'financial',
    summary: { en: 'Create payment and receipt vouchers for formal records', ur: 'باقاعدہ ریکارڈ کے لیے ادائیگی اور وصولی واؤچرز بنائیں' },
    steps: [
      { title: { en: 'Create a Voucher', ur: 'واؤچر بنائیں' }, description: { en: 'Click "Add Voucher". Choose type (Payment or Receipt), enter amount, account, and description.', ur: '"Add Voucher" پر کلک کریں۔ قسم (ادائیگی یا وصولی) منتخب کریں، رقم، اکاؤنٹ اور تفصیل درج کریں۔' } },
      { title: { en: 'Print Voucher', ur: 'واؤچر پرنٹ کریں' }, description: { en: 'Click the print icon to generate a printable voucher for physical records.', ur: 'طبعی ریکارڈ کے لیے پرنٹ آئیکن سے واؤچر پرنٹ کریں۔' } },
    ],
  },
  {
    id: 'tax-collections',
    title: { en: 'Tax Collections', ur: 'ٹیکس وصولی' },
    icon: Percent,
    category: 'financial',
    summary: { en: 'Track sales tax collected on transactions', ur: 'لین دین پر وصول شدہ سیلز ٹیکس ٹریک کریں' },
    steps: [
      { title: { en: 'Understanding Sales Tax', ur: 'سیلز ٹیکس سمجھیں' }, description: { en: 'Sales tax is collected from customers on each sale and must be deposited to the government. In Pakistan, standard rate is 17%.', ur: 'سیلز ٹیکس ہر فروخت پر صارفین سے وصول کیا جاتا ہے اور حکومت کو جمع کرانا ہوتا ہے۔ پاکستان میں معیاری شرح 17% ہے۔' } },
      { title: { en: 'View Tax Reports', ur: 'ٹیکس رپورٹ دیکھیں' }, description: { en: 'Go to Tax Collections to see total tax collected per period, breakdowns by product and sale.', ur: 'Tax Collections میں فی مدت کل وصول شدہ ٹیکس دیکھیں۔' } },
    ],
    concepts: [{
      term: { en: 'Sales Tax', ur: 'سیلز ٹیکس' },
      analogy: { en: 'Think of it as the government\'s share of every sale. You collect it from customers and pass it on — it\'s not your money, you\'re just the middleman.', ur: 'اسے ہر فروخت میں حکومت کا حصہ سمجھیں۔ آپ صارفین سے وصول کر کے آگے دیتے ہیں — یہ آپ کی رقم نہیں، آپ صرف درمیانی ہیں۔' },
      definition: { en: 'A government-imposed tax added to the sale price of goods, collected by the seller and remitted to tax authorities.', ur: 'حکومت کی جانب سے اشیاء کی فروخت قیمت پر لگایا جانے والا ٹیکس جو بیچنے والا وصول کر کے ٹیکس حکام کو جمع کراتا ہے۔' },
      inApp: { en: 'Go to Tax Collections in the sidebar. Tax is auto-calculated on each sale based on your Settings > Tax rate.', ur: 'سائیڈبار میں Tax Collections پر جائیں۔ ٹیکس آپ کی سیٹنگز > ٹیکس شرح کی بنیاد پر ہر فروخت پر خود حساب ہوتا ہے۔' },
    }],
  },
  {
    id: 'discounts',
    title: { en: 'Discounts', ur: 'رعایت' },
    icon: BadgePercent,
    category: 'financial',
    summary: { en: 'Create discount rules — percentage or fixed amount', ur: 'رعایت کے اصول بنائیں — فیصد یا مقررہ رقم' },
    steps: [
      { title: { en: 'Create a Discount Rule', ur: 'رعایت کا اصول بنائیں' }, description: { en: 'Click "Add Discount". Set name, type (percentage or fixed), value, and whether it applies to specific products or all sales.', ur: '"Add Discount" پر کلک کریں۔ نام، قسم (فیصد یا مقررہ)، قدر، اور لاگو ہونے کی حد مقرر کریں۔' } },
    ],
  },
  // ── ACCOUNTING ──
  {
    id: 'chart-of-accounts',
    title: { en: 'Chart of Accounts', ur: 'چارٹ آف اکاؤنٹس' },
    icon: BookOpen,
    category: 'accounting',
    summary: { en: 'The master list of all accounts — where every rupee is categorized', ur: 'تمام اکاؤنٹس کی ماسٹر فہرست — ہر روپیہ کہاں درجہ بند ہے' },
    steps: [
      { title: { en: 'View Accounts', ur: 'اکاؤنٹس دیکھیں' }, description: { en: 'Go to Chart of Accounts. See all accounts organized by type: Assets, Liabilities, Equity, Revenue, Expenses.', ur: 'Chart of Accounts پر جائیں۔ تمام اکاؤنٹس قسم کے مطابق دیکھیں: اثاثے، واجبات، ایکویٹی، آمدنی، اخراجات۔' } },
      { title: { en: 'Add a Custom Account', ur: 'حسب ضرورت اکاؤنٹ شامل کریں' }, description: { en: 'Click "Add Account". Choose the type, enter name and code. Most common accounts are pre-created by the system.', ur: '"Add Account" پر کلک کریں۔ قسم منتخب کریں، نام اور کوڈ درج کریں۔ عام اکاؤنٹس سسٹم نے پہلے سے بنا دیے ہیں۔' } },
    ],
    concepts: [
      {
        term: { en: 'Assets', ur: 'اثاثے' },
        analogy: { en: 'Everything you OWN — cash in the register, products on shelves, money customers owe you. Like everything in your wallet and home.', ur: 'ہر وہ چیز جو آپ کی ملکیت ہے — رجسٹر میں نقدی، شیلف پر پروڈکٹس، صارفین پر واجب رقم۔ جیسے آپ کے بٹوے اور گھر میں سب کچھ۔' },
        definition: { en: 'Resources owned by the business that have economic value.', ur: 'کاروبار کی ملکیت وسائل جن کی اقتصادی قدر ہے۔' },
        inApp: { en: 'In Chart of Accounts, look under the "Assets" section. Includes Cash, Inventory, Receivables.', ur: 'Chart of Accounts میں "Assets" سیکشن دیکھیں۔ نقدی، انوینٹری، قابل وصول شامل ہیں۔' },
      },
      {
        term: { en: 'Liabilities', ur: 'واجبات' },
        analogy: { en: 'Everything you OWE — money owed to suppliers, loans, tax you collected but haven\'t paid to the government yet. Like your credit card bill.', ur: 'ہر وہ چیز جو آپ نے دینی ہے — سپلائرز کو واجب رقم، قرض، وصول شدہ ٹیکس جو ابھی حکومت کو نہیں دیا۔ جیسے آپ کا کریڈٹ کارڈ بل۔' },
        definition: { en: 'Obligations the business owes to others.', ur: 'وہ ذمہ داریاں جو کاروبار نے دوسروں کو ادا کرنی ہیں۔' },
        inApp: { en: 'In Chart of Accounts under "Liabilities". Includes Payables, Tax Payable, Loans.', ur: 'Chart of Accounts میں "Liabilities" کے تحت۔ واجبات الادا، ٹیکس واجب الادا، قرض شامل ہیں۔' },
      },
      {
        term: { en: 'Owner Equity', ur: 'مالک کی ایکویٹی' },
        analogy: { en: 'If you sold everything (assets) and paid all debts (liabilities), what\'s left is YOUR money — the owner\'s equity. It\'s like your "net worth" in the business.', ur: 'اگر آپ سب کچھ بیچ دیں (اثاثے) اور تمام قرض ادا کریں (واجبات)، جو بچے وہ آپ کی رقم ہے — مالک کی ایکویٹی۔ یہ کاروبار میں آپ کی "مالیت" ہے۔' },
        definition: { en: 'The owner\'s residual interest: Assets minus Liabilities = Equity.', ur: 'مالک کا بقایا مفاد: اثاثے منفی واجبات = ایکویٹی۔' },
        inApp: { en: 'In Chart of Accounts under "Equity". Includes Owner Capital, Retained Earnings.', ur: 'Chart of Accounts میں "Equity" کے تحت۔ مالک سرمایہ، برقرار آمدنی شامل ہیں۔' },
      },
    ],
    warnings: [{ en: 'The golden rule: Assets = Liabilities + Equity. If your Balance Sheet doesn\'t balance, check for missing journal entries.', ur: 'سنہری اصول: اثاثے = واجبات + ایکویٹی۔ اگر بیلنس شیٹ توازن میں نہ ہو تو گمشدہ جرنل انٹریز چیک کریں۔' }],
  },
  {
    id: 'journal-entries',
    title: { en: 'Journal Entries', ur: 'جرنل انٹریز' },
    icon: PenLine,
    category: 'accounting',
    summary: { en: 'The diary of every financial transaction — debits and credits', ur: 'ہر مالیاتی لین دین کی ڈائری — ڈیبٹ اور کریڈٹ' },
    steps: [
      { title: { en: 'Understanding Journal Entries', ur: 'جرنل انٹریز سمجھیں' }, description: { en: 'Every transaction creates a journal entry with at least one debit and one credit. The system creates most automatically (sales, purchases, expenses). You only need manual entries for special cases.', ur: 'ہر لین دین ایک جرنل انٹری بناتا ہے جس میں کم از کم ایک ڈیبٹ اور ایک کریڈٹ ہوتا ہے۔ سسٹم زیادہ تر خود بخود بناتا ہے۔ صرف خاص صورتوں میں دستی انٹری کی ضرورت ہوتی ہے۔' } },
      { title: { en: 'View Entries', ur: 'انٹریز دیکھیں' }, description: { en: 'Go to Journals. See all entries with date, description, accounts, and debit/credit amounts. Filter by date range or account.', ur: 'Journals پر جائیں۔ تاریخ، تفصیل، اکاؤنٹس اور ڈیبٹ/کریڈٹ رقوم کے ساتھ تمام انٹریز دیکھیں۔' } },
      { title: { en: 'Create a Manual Entry', ur: 'دستی انٹری بنائیں' }, description: { en: 'Click "Add Entry". Select accounts, enter debit and credit amounts (they MUST be equal), add description.', ur: '"Add Entry" پر کلک کریں۔ اکاؤنٹس منتخب کریں، ڈیبٹ اور کریڈٹ رقم درج کریں (برابر ہونی چاہیے)، تفصیل شامل کریں۔' } },
    ],
    concepts: [
      {
        term: { en: 'Double-Entry Bookkeeping', ur: 'دوہری اندراج' },
        analogy: { en: 'Imagine every transaction has two sides: when you sell a gun for cash, one side is "cash increased" and the other is "inventory decreased". Both sides must be recorded — that\'s double-entry.', ur: 'تصور کریں ہر لین دین کے دو رخ ہیں: جب آپ نقد بندوق بیچتے ہیں تو ایک طرف "نقدی بڑھی" اور دوسری طرف "انوینٹری کم ہوئی"۔ دونوں طرف ریکارڈ ہونی چاہیے — یہ دوہری اندراج ہے۔' },
        definition: { en: 'An accounting method where every transaction is recorded in at least two accounts, ensuring total debits always equal total credits.', ur: 'ایک حسابی طریقہ جہاں ہر لین دین کم از کم دو اکاؤنٹس میں ریکارڈ ہوتا ہے، اس بات کو یقینی بناتے ہوئے کہ کل ڈیبٹ ہمیشہ کل کریڈٹ کے برابر ہو۔' },
        inApp: { en: 'The system handles this automatically. When you make a sale, it debits Cash and credits Sales Revenue. You can see both sides in Journals.', ur: 'سسٹم یہ خود سنبھالتا ہے۔ جب آپ فروخت کرتے ہیں تو یہ نقدی ڈیبٹ اور فروخت آمدنی کریڈٹ کرتا ہے۔ دونوں طرف Journals میں دیکھ سکتے ہیں۔' },
      },
      {
        term: { en: 'Debits & Credits', ur: 'ڈیبٹ اور کریڈٹ' },
        analogy: { en: 'Debit = money coming IN to an account. Credit = money going OUT. When you receive cash, Cash account is debited (money came in). When you pay, it\'s credited (money went out).', ur: 'ڈیبٹ = اکاؤنٹ میں رقم آنا۔ کریڈٹ = رقم جانا۔ جب نقد ملے تو کیش اکاؤنٹ ڈیبٹ (رقم آئی)۔ جب ادا کریں تو کریڈٹ (رقم گئی)۔' },
        definition: { en: 'Debit increases assets/expenses, decreases liabilities/equity/revenue. Credit does the opposite.', ur: 'ڈیبٹ اثاثے/اخراجات بڑھاتا ہے، واجبات/ایکویٹی/آمدنی کم کرتا ہے۔ کریڈٹ اس کا الٹ کرتا ہے۔' },
        inApp: { en: 'In every journal entry, you\'ll see Debit and Credit columns. Total debits must equal total credits for the entry to save.', ur: 'ہر جرنل انٹری میں ڈیبٹ اور کریڈٹ کالم نظر آئیں گے۔ انٹری محفوظ ہونے کے لیے کل ڈیبٹ کل کریڈٹ کے برابر ہونا چاہیے۔' },
      },
    ],
    warnings: [{ en: 'Total debits must ALWAYS equal total credits. The system will not let you save an unbalanced entry.', ur: 'کل ڈیبٹ ہمیشہ کل کریڈٹ کے برابر ہونا چاہیے۔ سسٹم غیر متوازن انٹری محفوظ نہیں ہونے دے گا۔' }],
  },
  {
    id: 'purchases',
    title: { en: 'Purchases', ur: 'خریداری' },
    icon: Truck,
    category: 'accounting',
    summary: { en: 'Create purchase orders, receive goods, track costs', ur: 'خریداری کے آرڈرز بنائیں، سامان وصول کریں، لاگت ٹریک کریں' },
    steps: [
      { title: { en: 'Create a Purchase Order', ur: 'خریداری کا آرڈر بنائیں' }, description: { en: 'Click "New Purchase". Select supplier, add products with quantities and costs.', ur: '"New Purchase" پر کلک کریں۔ سپلائر منتخب کریں، مقدار اور لاگت کے ساتھ پروڈکٹس شامل کریں۔' } },
      { title: { en: 'Receive Goods', ur: 'سامان وصول کریں' }, description: { en: 'When goods arrive, mark the purchase as received. Inventory updates automatically.', ur: 'سامان آنے پر خریداری کو موصول کے طور پر نشان زد کریں۔ انوینٹری خود بخود اپڈیٹ ہوتی ہے۔' } },
    ],
  },
  {
    id: 'services',
    title: { en: 'Services', ur: 'خدمات' },
    icon: Wrench,
    category: 'accounting',
    summary: { en: 'Track service income and expenses separate from product sales', ur: 'پروڈکٹ فروخت سے الگ سروس آمدنی اور اخراجات ٹریک کریں' },
    steps: [
      { title: { en: 'Add a Service', ur: 'سروس شامل کریں' }, description: { en: 'Click "Add Service". Enter name, type (income or expense), and default price.', ur: '"Add Service" پر کلک کریں۔ نام، قسم (آمدنی یا خرچ) اور معیاری قیمت درج کریں۔' } },
    ],
  },
  {
    id: 'reports',
    title: { en: 'Reports', ur: 'رپورٹیں' },
    icon: BarChart3,
    category: 'accounting',
    summary: { en: 'Generate Balance Sheet, Profit & Loss, and other financial reports', ur: 'بیلنس شیٹ، نفع و نقصان اور دیگر مالیاتی رپورٹیں بنائیں' },
    steps: [
      { title: { en: 'Run a Report', ur: 'رپورٹ بنائیں' }, description: { en: 'Go to Reports. Select report type (Balance Sheet, Profit & Loss, Trial Balance, etc.), date range, and click Generate.', ur: 'Reports پر جائیں۔ رپورٹ کی قسم، تاریخ کی حد منتخب کریں اور Generate پر کلک کریں۔' } },
    ],
    concepts: [
      {
        term: { en: 'Balance Sheet', ur: 'بیلنس شیٹ' },
        analogy: { en: 'Like a photo of your wallet at one moment — what you own (assets), what you owe (liabilities), and what\'s left for you (equity). It must always balance: Assets = Liabilities + Equity.', ur: 'ایک لمحے میں آپ کے بٹوے کی تصویر — آپ کی ملکیت (اثاثے)، آپ نے کیا دینا ہے (واجبات)، اور آپ کے لیے کیا بچا (ایکویٹی)۔ ہمیشہ برابر ہونا چاہیے۔' },
        definition: { en: 'A financial statement showing assets, liabilities, and equity at a specific point in time.', ur: 'ایک مالیاتی بیان جو کسی مخصوص وقت پر اثاثے، واجبات اور ایکویٹی دکھاتا ہے۔' },
        inApp: { en: 'Go to Reports > Balance Sheet. Auto-calculated from your transactions. Select a date to see the snapshot.', ur: 'Reports > Balance Sheet پر جائیں۔ آپ کے لین دین سے خود حساب ہوتی ہے۔' },
      },
      {
        term: { en: 'Profit & Loss (P&L)', ur: 'نفع و نقصان' },
        analogy: { en: 'Like your monthly score card — how much you earned (revenue) vs how much you spent (expenses). Revenue minus Expenses = Profit (or Loss).', ur: 'آپ کا ماہانہ اسکور کارڈ — کتنا کمایا (آمدنی) بمقابلہ کتنا خرچ کیا (اخراجات)۔ آمدنی منفی اخراجات = نفع (یا نقصان)۔' },
        definition: { en: 'A financial statement showing revenue, expenses, and resulting profit or loss over a period of time.', ur: 'ایک مالیاتی بیان جو ایک مدت میں آمدنی، اخراجات اور نتیجتاً نفع یا نقصان دکھاتا ہے۔' },
        inApp: { en: 'Go to Reports > Profit & Loss. Select date range (this month, this quarter, custom).', ur: 'Reports > Profit & Loss پر جائیں۔ تاریخ کی حد منتخب کریں۔' },
      },
    ],
  },
  // ── MANAGEMENT ──
  {
    id: 'users',
    title: { en: 'Users', ur: 'صارفین' },
    icon: UserCog,
    category: 'management',
    summary: { en: 'Create staff accounts with role-based access (Admin/Manager/Cashier)', ur: 'کردار پر مبنی رسائی کے ساتھ عملے کے اکاؤنٹس بنائیں' },
    steps: [
      { title: { en: 'Create a User', ur: 'صارف بنائیں' }, description: { en: 'Click "Add User". Enter name, username, email, password, role (Admin/Manager/Cashier), and branch.', ur: '"Add User" پر کلک کریں۔ نام، صارف نام، ای میل، پاس ورڈ، کردار اور برانچ درج کریں۔' } },
      { title: { en: 'Understand Roles', ur: 'کردار سمجھیں' }, description: { en: 'Admin: full access. Manager: sales, products, inventory, financial. Cashier: POS only.', ur: 'ایڈمن: مکمل رسائی۔ منیجر: فروخت، پروڈکٹس، انوینٹری، مالیاتی۔ کیشئر: صرف POS۔' } },
    ],
    warnings: [{ en: 'Never share admin credentials. Create individual accounts for each staff member.', ur: 'ایڈمن اسناد کبھی شیئر نہ کریں۔ ہر عملے کے فرد کا الگ اکاؤنٹ بنائیں۔' }],
  },
  {
    id: 'branches',
    title: { en: 'Branches', ur: 'برانچیں' },
    icon: Building,
    category: 'management',
    summary: { en: 'Configure multi-location branch network', ur: 'کثیر مقامات کی برانچ نیٹ ورک ترتیب دیں' },
    steps: [
      { title: { en: 'Add a Branch', ur: 'برانچ شامل کریں' }, description: { en: 'Click "Add Branch". Enter name, code, address, phone, email, and dealer license number. Mark one as main.', ur: '"Add Branch" پر کلک کریں۔ نام، کوڈ، پتہ، فون، ای میل اور لائسنس نمبر درج کریں۔ ایک کو مین نشان زد کریں۔' } },
    ],
  },
  {
    id: 'audit-logs',
    title: { en: 'Activity Logs', ur: 'سرگرمی کے نوشتے' },
    icon: ClipboardList,
    category: 'management',
    summary: { en: 'View detailed history of all actions performed in the system', ur: 'سسٹم میں انجام دی گئی تمام کارروائیوں کی تفصیلی تاریخ دیکھیں' },
    steps: [
      { title: { en: 'View Logs', ur: 'لاگز دیکھیں' }, description: { en: 'Go to Activity Logs. See who did what, when, with full details. Filter by user, action type, or date.', ur: 'Activity Logs پر جائیں۔ کس نے کیا کب کیا مکمل تفصیلات کے ساتھ دیکھیں۔' } },
    ],
  },
  {
    id: 'audit-reports',
    title: { en: 'Audit Reports', ur: 'آڈٹ رپورٹس' },
    icon: FileBarChart,
    category: 'management',
    summary: { en: 'Generate compliance and audit reports', ur: 'تعمیل اور آڈٹ رپورٹس بنائیں' },
    steps: [
      { title: { en: 'Run Audit Report', ur: 'آڈٹ رپورٹ بنائیں' }, description: { en: 'Select report type and date range. Reports show transaction summaries, discrepancies, and compliance status.', ur: 'رپورٹ کی قسم اور تاریخ کی حد منتخب کریں۔ رپورٹس لین دین کا خلاصہ، تضادات اور تعمیل کی حالت دکھاتی ہیں۔' } },
    ],
  },
  {
    id: 'settings',
    title: { en: 'Settings', ur: 'سیٹنگز' },
    icon: Settings,
    category: 'management',
    summary: { en: 'Configure business info, tax, receipts, notifications, security, and payments', ur: 'کاروباری معلومات، ٹیکس، رسیدیں، اطلاعات، سیکیورٹی اور ادائیگیاں ترتیب دیں' },
    steps: [
      { title: { en: 'Business Info', ur: 'کاروباری معلومات' }, description: { en: 'Set company name, NTN, STRN, dealer license, address, contact info. Appears on all receipts.', ur: 'کمپنی کا نام، NTN، STRN، لائسنس، پتہ، رابطہ درج کریں۔ تمام رسیدوں پر نظر آتا ہے۔' } },
      { title: { en: 'Tax & Currency', ur: 'ٹیکس اور کرنسی' }, description: { en: 'Set default tax rate (17%), currency (PKR), and whether prices are tax-inclusive.', ur: 'ٹیکس شرح (17%)، کرنسی (PKR) اور قیمتوں میں ٹیکس شامل ہونے کی ترتیب دیں۔' } },
      { title: { en: 'Sales & Payments', ur: 'فروخت اور ادائیگی' }, description: { en: 'Enable/disable payment methods (Cash, Card, Credit, Mobile, COD, Bank Transfer) and set default payment method.', ur: 'ادائیگی کے طریقے فعال/غیر فعال کریں اور ڈیفالٹ ادائیگی کا طریقہ مقرر کریں۔' } },
      { title: { en: 'Receipt Settings', ur: 'رسید کی ترتیبات' }, description: { en: 'Configure receipt width (58mm/80mm/A4), header/footer text.', ur: 'رسید کی چوڑائی (58mm/80mm/A4)، ہیڈر/فوٹر متن ترتیب دیں۔' } },
    ],
    tips: [{ en: 'Complete business info and tax settings first — they affect receipts and calculations.', ur: 'پہلے کاروباری معلومات اور ٹیکس سیٹنگز مکمل کریں — یہ رسیدوں اور حسابات کو متاثر کرتی ہیں۔' }],
  },
  {
    id: 'reversals',
    title: { en: 'Reversal Requests', ur: 'واپسی کی درخواستیں' },
    icon: RotateCcw,
    category: 'management',
    summary: { en: 'Review and approve/deny transaction reversal requests', ur: 'لین دین کی واپسی کی درخواستوں کا جائزہ لیں اور منظور/مسترد کریں' },
    steps: [
      { title: { en: 'Review Requests', ur: 'درخواستوں کا جائزہ' }, description: { en: 'Go to Reversal Requests. See pending requests with transaction details and reason. Approve or deny.', ur: 'Reversal Requests پر جائیں۔ لین دین کی تفصیلات اور وجہ کے ساتھ زیر التواء درخواستیں دیکھیں۔' } },
    ],
  },
  // ── TROUBLESHOOTING ──
  {
    id: 'common-issues',
    title: { en: 'Common Issues & Solutions', ur: 'عام مسائل اور حل' },
    icon: AlertTriangle,
    category: 'management',
    summary: { en: 'Quick fixes for frequently encountered problems', ur: 'عام مسائل کے فوری حل' },
    steps: [
      { title: { en: 'Cannot log in', ur: 'لاگ ان نہیں ہو رہا' }, description: { en: 'Check username/password. If forgotten, contact your admin. Account may be deactivated.', ur: 'صارف نام/پاس ورڈ چیک کریں۔ بھول گئے تو ایڈمن سے رابطہ کریں۔ اکاؤنٹ غیر فعال ہو سکتا ہے۔' } },
      { title: { en: 'Product not showing in POS', ur: 'پروڈکٹ POS میں نہیں دکھ رہی' }, description: { en: 'Ensure product is "Active" and has stock > 0. Check branch matches your current branch.', ur: 'یقینی بنائیں پروڈکٹ "Active" ہے اور اسٹاک 0 سے زیادہ ہے۔ برانچ چیک کریں۔' } },
      { title: { en: 'Serial number rejected', ur: 'سیریل نمبر مسترد' }, description: { en: 'Serial numbers must be unique. Check if already used in another sale or recorded in inventory.', ur: 'سیریل نمبر منفرد ہونا چاہیے۔ چیک کریں کہ پہلے استعمال تو نہیں ہوا۔' } },
      { title: { en: 'Balance Sheet not balancing', ur: 'بیلنس شیٹ توازن میں نہیں' }, description: { en: 'Check for manual journal entries with errors. Ensure all transactions have proper double-entry. Run a Trial Balance first to identify which accounts are off.', ur: 'غلط دستی جرنل انٹریز چیک کریں۔ یقینی بنائیں تمام لین دین میں مناسب دوہری اندراج ہے۔ پہلے ٹرائل بیلنس چلائیں۔' } },
    ],
  },
  {
    id: 'tips-shortcuts',
    title: { en: 'Tips & Shortcuts', ur: 'مشورے اور شارٹ کٹس' },
    icon: Lightbulb,
    category: 'management',
    summary: { en: 'Work faster with productivity tips', ur: 'پیداواری مشوروں سے تیزی سے کام کریں' },
    steps: [
      { title: { en: 'Quick search in POS', ur: 'POS میں فوری تلاش' }, description: { en: 'Start typing a product name or code — results filter in real-time.', ur: 'پروڈکٹ کا نام یا کوڈ ٹائپ کرنا شروع کریں — نتائج فوری فلٹر ہوتے ہیں۔' } },
      { title: { en: 'Hold & Resume Carts', ur: 'کارٹ روکیں اور دوبارہ شروع کریں' }, description: { en: 'Click "Hold" to save current cart. Resume it later from held orders.', ur: '"Hold" سے موجودہ کارٹ محفوظ کریں۔ بعد میں دوبارہ شروع کریں۔' } },
      { title: { en: 'Check Dashboard Daily', ur: 'روزانہ ڈیش بورڈ چیک کریں' }, description: { en: 'Start each day by checking dashboard for overnight sales, low stock alerts, and revenue trends.', ur: 'ہر دن ڈیش بورڈ سے شروع کریں — رات کی فروخت، کم اسٹاک الرٹس اور آمدنی کے رجحانات دیکھیں۔' } },
    ],
  },
]

/* ── Category Config ── */
const categoryLabels: Record<string, BilingualText> = {
  all: { en: 'All', ur: 'سب' },
  operations: { en: 'Operations', ur: 'آپریشنز' },
  financial: { en: 'Financial', ur: 'مالیاتی' },
  accounting: { en: 'Accounting', ur: 'حسابات' },
  management: { en: 'Management', ur: 'انتظامیہ' },
}

const categoryColors: Record<string, string> = {
  operations: 'text-blue-400',
  financial: 'text-green-400',
  accounting: 'text-purple-400',
  management: 'text-primary',
}

const categories = ['all', 'operations', 'financial', 'accounting', 'management']

/* ── Concept Box Component ── */
function ConceptBox({ concept, lang }: { concept: ConceptExplainer; lang: Language }) {
  return (
    <div className="rounded-lg border border-border/50 bg-card/50 overflow-hidden">
      <div className="px-3 py-2 bg-primary/5 border-b border-border/30">
        <span className="text-xs font-bold text-primary">{t(concept.term, lang)}</span>
      </div>
      <div className="p-3 space-y-2.5">
        <div className="flex items-start gap-2">
          <Home className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
              {lang === 'en' ? 'Simple Analogy' : 'آسان مثال'}
            </span>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{t(concept.analogy, lang)}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <BookOpen className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">
              {lang === 'en' ? 'Definition' : 'تعریف'}
            </span>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{t(concept.definition, lang)}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Monitor className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-semibold text-green-400 uppercase tracking-wider">
              {lang === 'en' ? 'In This App' : 'ایپ میں کہاں ہے'}
            </span>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{t(concept.inApp, lang)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main Guide Screen ── */
export function GuideScreen() {
  const [lang, setLang] = useState<Language>('en')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const [showWorkflow, setShowWorkflow] = useState(true)
  const [fontSize, setFontSize] = useState(14)

  const isUrdu = lang === 'ur'

  const filtered = useMemo(() => {
    return guideSections.filter((s) => {
      if (activeCategory !== 'all' && s.category !== activeCategory) return false
      if (search) {
        const q = search.toLowerCase()
        const title = t(s.title, lang).toLowerCase()
        const summary = t(s.summary, lang).toLowerCase()
        const stepsMatch = s.steps.some(
          (st) => t(st.title, lang).toLowerCase().includes(q) || t(st.description, lang).toLowerCase().includes(q)
        )
        if (!title.includes(q) && !summary.includes(q) && !stepsMatch) return false
      }
      return true
    })
  }, [search, activeCategory, lang])

  return (
    <div className={`space-y-6 ${isUrdu ? 'font-urdu' : ''}`} style={{ zoom: fontSize / 14 }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isUrdu ? '' : 'tracking-tight'}`}>
            {isUrdu ? 'استعمال کی گائیڈ' : 'How-To Guide'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isUrdu ? 'فائر آرمز POS سسٹم کے ہر ماڈیول کی مکمل رہنمائی' : 'Complete bilingual guide for every module in Firearms POS'}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Font Size Controls */}
          <div className="flex items-center gap-0.5 rounded-lg border border-border/50 bg-card">
            <button
              onClick={() => setFontSize((s) => Math.max(10, s - 2))}
              disabled={fontSize <= 10}
              className="p-2 hover:bg-accent transition-colors rounded-l-lg disabled:opacity-30"
              title="Decrease font size"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs text-muted-foreground w-8 text-center tabular-nums">{fontSize}</span>
            <button
              onClick={() => setFontSize((s) => Math.min(24, s + 2))}
              disabled={fontSize >= 24}
              className="p-2 hover:bg-accent transition-colors rounded-r-lg disabled:opacity-30"
              title="Increase font size"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/50 bg-card hover:bg-accent transition-colors"
          >
            <Languages className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{lang === 'en' ? 'اردو' : 'English'}</span>
          </button>
        </div>
      </div>

      {/* Welcome Banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-5">
          <div className={`flex items-start gap-4 ${isUrdu ? 'flex-row-reverse text-right' : ''}`}>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div dir={isUrdu ? 'rtl' : 'ltr'}>
              <h2 className="font-bold text-base">
                {isUrdu ? 'فائر آرمز POS میں خوش آمدید' : 'Welcome to Firearms POS'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {t(workflowIntro, lang)}
              </p>
              <div className={`flex items-center gap-4 mt-3 text-xs text-muted-foreground ${isUrdu ? 'flex-row-reverse' : ''}`}>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                  <span>{guideSections.length} {isUrdu ? 'گائیڈز' : 'guides'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                  <span>{isUrdu ? 'مرحلہ وار' : 'Step-by-step'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5 text-purple-400" />
                  <span>{isUrdu ? 'انگریزی / اردو' : 'EN / Urdu'}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Overview */}
      <div>
        <button onClick={() => setShowWorkflow(!showWorkflow)} className="flex items-center gap-2 mb-3 group">
          {showWorkflow ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          <h2 className="text-lg font-bold tracking-tight group-hover:text-primary transition-colors">
            {isUrdu ? 'کاروبار کا ورک فلو' : 'Business Workflow Overview'}
          </h2>
          <Badge variant="outline" className="text-[9px]">{isUrdu ? '6 مراحل' : '6 Phases'}</Badge>
        </button>

        {showWorkflow && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {workflowPhases.map((phase, idx) => (
              <Card key={phase.id}>
                <CardContent className="p-4">
                  <div dir={isUrdu ? 'rtl' : 'ltr'} className={isUrdu ? 'text-right' : ''}>
                    <div className={`flex items-center gap-2.5 mb-2 ${isUrdu ? 'flex-row-reverse' : ''}`}>
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <phase.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-primary">
                          {isUrdu ? `مرحلہ ${idx + 1}` : `Phase ${idx + 1}`}
                        </span>
                        <h3 className="text-sm font-semibold truncate">{t(phase.title, lang)}</h3>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{t(phase.description, lang)}</p>
                    <div className={`flex flex-wrap gap-1 mt-2.5 ${isUrdu ? 'justify-end' : ''}`}>
                      {phase.modules.map((mod) => {
                        const section = guideSections.find((s) => s.id === mod)
                        return (
                          <button
                            key={mod}
                            onClick={() => {
                              setExpandedId(mod)
                              setActiveCategory('all')
                              setSearch('')
                              setShowWorkflow(false)
                              setTimeout(() => {
                                document.getElementById(`guide-${mod}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                              }, 100)
                            }}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          >
                            {section ? t(section.title, lang) : mod}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Search + Category Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={isUrdu ? 'گائیڈز تلاش کریں...' : 'Search guides...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            dir={isUrdu ? 'rtl' : 'ltr'}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
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
              {t(categoryLabels[cat], lang)}
            </button>
          ))}
        </div>
      </div>

      {/* Guide Sections */}
      <div className="space-y-3">
        {filtered.map((section) => {
          const isExpanded = expandedId === section.id
          const catColor = categoryColors[section.category] || 'text-muted-foreground'

          return (
            <Card key={section.id} id={`guide-${section.id}`} className="overflow-hidden">
              <button onClick={() => setExpandedId(isExpanded ? null : section.id)} className="w-full text-left">
                <CardContent className="p-4">
                  <div className={`flex items-center gap-3 ${isUrdu ? 'flex-row-reverse text-right' : ''}`}>
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <section.icon className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`flex items-center gap-2 ${isUrdu ? 'flex-row-reverse' : ''}`}>
                        <h3 className="font-semibold text-sm">{t(section.title, lang)}</h3>
                        <Badge variant="outline" className={`text-[9px] ${catColor} border-current/20`}>
                          {t(categoryLabels[section.category], lang)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{t(section.summary, lang)}</p>
                    </div>
                    <div className={`flex items-center gap-2 shrink-0 ${isUrdu ? 'flex-row-reverse' : ''}`}>
                      <span className="text-[10px] text-muted-foreground">{section.steps.length} {isUrdu ? 'مراحل' : 'steps'}</span>
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>
                </CardContent>
              </button>

              {isExpanded && (
                <div className="border-t border-border/50 px-4 pb-4" dir={isUrdu ? 'rtl' : 'ltr'}>
                  {/* Concepts */}
                  {section.concepts && section.concepts.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className={`text-xs font-semibold text-primary mb-2 ${isUrdu ? 'text-right' : ''}`}>
                        {isUrdu ? 'پہلے یہ سمجھیں' : 'Understand These Concepts First'}
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {section.concepts.map((concept, idx) => (
                          <ConceptBox key={idx} concept={concept} lang={lang} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Steps */}
                  <div className="mt-4 space-y-0">
                    {section.steps.map((step, idx) => (
                      <div key={idx} className={`flex gap-3 ${isUrdu ? 'flex-row-reverse' : ''}`}>
                        <div className="flex flex-col items-center">
                          <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                            {idx + 1}
                          </div>
                          {idx < section.steps.length - 1 && <div className="w-px flex-1 bg-border/50 my-1" />}
                        </div>
                        <div className={`pb-4 ${isUrdu ? 'text-right' : ''}`}>
                          <p className="text-sm font-medium">{t(step.title, lang)}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{t(step.description, lang)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Examples */}
                  {section.examples && section.examples.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {section.examples.map((example, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                          <p className={`text-xs font-semibold text-blue-400 mb-2 ${isUrdu ? 'text-right' : ''}`}>{t(example.label, lang)}</p>
                          <div className="space-y-1">
                            {example.fields.map((field, fIdx) => (
                              <div key={fIdx} className={`flex items-center gap-2 text-xs ${isUrdu ? 'flex-row-reverse' : ''}`}>
                                <span className="text-muted-foreground min-w-[100px]">{t(field.name, lang)}:</span>
                                <span className="font-mono text-foreground">{field.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tips */}
                  {section.tips && section.tips.length > 0 && (
                    <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <div className={`flex items-center gap-1.5 mb-2 ${isUrdu ? 'flex-row-reverse' : ''}`}>
                        <Lightbulb className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-semibold text-primary">{isUrdu ? 'مفید مشورے' : 'Pro Tips'}</span>
                      </div>
                      <ul className="space-y-1.5">
                        {section.tips.map((tip, idx) => (
                          <li key={idx} className={`flex items-start gap-2 text-xs text-muted-foreground ${isUrdu ? 'flex-row-reverse text-right' : ''}`}>
                            <ArrowRight className={`w-3 h-3 text-primary shrink-0 mt-0.5 ${isUrdu ? 'rotate-180' : ''}`} />
                            <span>{t(tip, lang)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Warnings */}
                  {section.warnings && section.warnings.length > 0 && (
                    <div className="mt-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                      <div className={`flex items-center gap-1.5 mb-2 ${isUrdu ? 'flex-row-reverse' : ''}`}>
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-xs font-semibold text-amber-500">{isUrdu ? 'اہم تنبیہ' : 'Important'}</span>
                      </div>
                      <ul className="space-y-1.5">
                        {section.warnings.map((warn, idx) => (
                          <li key={idx} className={`flex items-start gap-2 text-xs text-muted-foreground ${isUrdu ? 'flex-row-reverse text-right' : ''}`}>
                            <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                            <span>{t(warn, lang)}</span>
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
            <p className="text-sm">{isUrdu ? 'کوئی گائیڈ نہیں ملی' : 'No guides found matching your search'}</p>
            <p className="text-xs mt-1">{isUrdu ? 'مختلف الفاظ آزمائیں' : 'Try different keywords or clear the filter'}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <Card className="border-border/30">
        <CardContent className="p-5">
          <div className={`flex items-center justify-between ${isUrdu ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-3 ${isUrdu ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Headphones className="w-5 h-5 text-primary" />
              </div>
              <div className={isUrdu ? 'text-right' : ''}>
                <p className="text-sm font-semibold">{isUrdu ? 'مزید مدد چاہیے؟' : 'Need more help?'}</p>
                <p className="text-xs text-muted-foreground">{isUrdu ? 'ڈویلپر سے رابطہ کریں' : 'Contact the developer for assistance'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
