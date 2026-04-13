import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import {
  BookOpen,
  Search,
  Lightbulb,
  AlertTriangle,
  Languages,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  ShoppingCart,
  Package,
  Warehouse,
  Receipt,
  Users,
  RotateCcw,
  Truck,
  FolderTree,
  CreditCard,
  HandCoins,
  Banknote,
  UserCheck,
  Percent,
  BadgePercent,
  FileText,
  PenLine,
  Wrench,
  BarChart3,
  ClipboardList,
  UserCog,
  Building,
  Settings,
  Wallet,
  Play,
  Store,
  TrendingUp,
  Calculator,
  Shield,
  BookMarked,
  GraduationCap,
  ArrowRight,
  Bookmark,
  Clock,
  Keyboard,
  ChevronDown,
  Link2,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useTheme } from '@/contexts/theme-context'

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

const FONT_EN = "'Ubuntu', system-ui, sans-serif"
const FONT_UR = "'Jameel Noori Nastaleeq', serif"

/* Theme-aware color palette — resolved at render time */
type GuideColors = {
  accent: string
  accentDim: string
  accentGlow: string
  bg: string
  bgElevated: string
  bgSunken: string
  border: string
  borderSubtle: string
  text: string
  textMuted: string
  textFaint: string
  info: string
  success: string
  warning: string
}

const THEME_COLORS: Record<string, GuideColors> = {
  light: {
    accent: 'oklch(0.35 0.18 255)',       /* dark blue titles */
    accentDim: 'oklch(0.45 0.14 255)',
    accentGlow: 'oklch(0.30 0.20 255)',
    bg: 'var(--color-background)',
    bgElevated: 'var(--color-card)',
    bgSunken: 'oklch(0.96 0.002 260)',
    border: 'var(--color-border)',
    borderSubtle: 'oklch(0.90 0.004 260)',
    text: 'oklch(0.10 0 0)',              /* dark black text */
    textMuted: 'oklch(0.20 0 0)',         /* very dark paragraphs */
    textFaint: 'oklch(0.40 0 0)',
    info: 'var(--color-info)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
  },
  dark: {
    accent: 'oklch(0.72 0.16 245)',       /* light blue titles */
    accentDim: 'oklch(0.60 0.12 245)',
    accentGlow: 'oklch(0.80 0.14 245)',
    bg: 'var(--color-background)',
    bgElevated: 'var(--color-card)',
    bgSunken: 'oklch(0.12 0.004 285)',
    border: 'var(--color-border)',
    borderSubtle: 'oklch(0.22 0.005 285)',
    text: 'oklch(0.97 0 0)',              /* white text */
    textMuted: 'oklch(0.88 0 0)',         /* near-white paragraphs */
    textFaint: 'oklch(0.60 0 0)',
    info: 'var(--color-info)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
  },
  midnight: {
    accent: 'oklch(0.70 0.18 250)',       /* light blue titles */
    accentDim: 'oklch(0.55 0.14 250)',
    accentGlow: 'oklch(0.78 0.16 250)',
    bg: 'var(--color-background)',
    bgElevated: 'var(--color-card)',
    bgSunken: 'oklch(0.08 0 0)',
    border: 'var(--color-border)',
    borderSubtle: 'oklch(0.15 0 0)',
    text: 'oklch(0.95 0 0)',              /* white text */
    textMuted: 'oklch(0.85 0 0)',         /* near-white paragraphs */
    textFaint: 'oklch(0.55 0 0)',
    info: 'var(--color-info)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
  },
}

function estimateReadTime(section: GuideSection): number {
  const words = section.steps.length * 40 + (section.concepts?.length ?? 0) * 60 + (section.tips?.length ?? 0) * 15 + (section.warnings?.length ?? 0) * 15 + (section.examples?.length ?? 0) * 20
  return Math.max(1, Math.round(words / 200))
}

/* ── Workflow Phases ── */
const workflowIntro: BilingualText = {
  en: 'This guide walks you through every step of running your business — from initial setup to daily sales to monthly accounting. Follow the phases in order if you are new, or jump to any module you need help with.',
  ur: 'یہ گائیڈ آپ کو کاروبار چلانے کے ہر مرحلے میں رہنمائی کرتا ہے — ابتدائی سیٹ اپ سے لے کر روزانہ کی فروخت اور ماہانہ حسابات تک۔ اگر آپ نئے ہیں تو مراحل کو ترتیب سے فالو کریں، یا کسی بھی ماڈیول پر جائیں جہاں آپ کو مدد چاہیے۔',
}

const workflowPhases: WorkflowPhase[] = [
  {
    id: 'phase-setup',
    title: { en: 'Initial Setup', ur: 'ابتدائی سیٹ اپ' },
    description: {
      en: 'Before you can sell anything, set up your business info, create branches, add staff accounts, configure tax rates, and organize your product categories.',
      ur: 'کچھ بھی فروخت کرنے سے پہلے، اپنے کاروبار کی معلومات درج کریں، برانچیں بنائیں، عملے کے اکاؤنٹس شامل کریں، ٹیکس کی شرح مقرر کریں، اور پروڈکٹ کیٹیگریز ترتیب دیں۔',
    },
    modules: ['settings', 'branches', 'users', 'categories', 'chart-of-accounts'],
    icon: Play,
  },
  {
    id: 'phase-stock',
    title: { en: 'Stock Up', ur: 'اسٹاک تیار کریں' },
    description: {
      en: 'Add your suppliers, register your products with prices and serial tracking, create purchase orders for incoming stock, and manage your inventory levels across branches.',
      ur: 'اپنے سپلائرز شامل کریں، قیمتوں اور سیریل ٹریکنگ کے ساتھ پروڈکٹس رجسٹر کریں، آنے والے اسٹاک کے لیے خریداری کے آرڈرز بنائیں، اور برانچوں میں اپنی انوینٹری کا انتظام کریں۔',
    },
    modules: ['suppliers', 'products', 'purchases', 'inventory'],
    icon: Package,
  },
  {
    id: 'phase-sell',
    title: { en: 'Daily Selling', ur: 'روزمرہ فروخت' },
    description: {
      en: 'Open your cash register, process sales through the Point of Sale, manage customer records with firearm licenses, handle returns.',
      ur: 'اپنا کیش رجسٹر کھولیں، پوائنٹ آف سیل سے فروخت کریں، فائر آرم لائسنس کے ساتھ کسٹمر ریکارڈ رکھیں، واپسیاں سنبھالیں۔',
    },
    modules: ['cash-register', 'pos', 'sales', 'customers', 'returns'],
    icon: Store,
  },
  {
    id: 'phase-money',
    title: { en: 'Money Tracking', ur: 'رقم کی نگرانی' },
    description: {
      en: 'Track your business expenses, manage what you owe (payables) and what others owe you (receivables), handle commissions, tax collections, vouchers, and discounts.',
      ur: 'اپنے کاروبار کے اخراجات ٹریک کریں، واجبات الادا اور قابل وصول رقم کا انتظام کریں، کمیشن، ٹیکس وصولی، واؤچرز اور ڈسکاؤنٹ سنبھالیں۔',
    },
    modules: ['expenses', 'payables', 'receivables', 'commissions', 'referrals', 'vouchers', 'tax-collections', 'discounts'],
    icon: TrendingUp,
  },
  {
    id: 'phase-accounting',
    title: { en: 'Accounting & Reports', ur: 'حسابات اور رپورٹیں' },
    description: {
      en: 'Review your journal entries, check your chart of accounts, track service income, and generate financial reports like Balance Sheet and Profit & Loss.',
      ur: 'اپنی جرنل انٹریز کا جائزہ لیں، چارٹ آف اکاؤنٹس چیک کریں، سروس کی آمدنی ٹریک کریں، اور مالیاتی رپورٹیں بنائیں۔',
    },
    modules: ['journal-entries', 'chart-of-accounts', 'services', 'reports'],
    icon: Calculator,
  },
  {
    id: 'phase-admin',
    title: { en: 'Administration', ur: 'انتظامیہ' },
    description: {
      en: 'Review audit logs and reports, manage user accounts, configure settings, and get support when needed.',
      ur: 'آڈٹ لاگز اور رپورٹس دیکھیں، صارف اکاؤنٹس کا انتظام کریں، سیٹنگز ترتیب دیں۔',
    },
    modules: ['audit-logs', 'users', 'branches', 'settings'],
    icon: Shield,
  },
]

/* ═══════════════════════════════════════════════════════════════
   GUIDE SECTIONS — 30 Chapters
   ═══════════════════════════════════════════════════════════════ */

const guideSections: GuideSection[] = [
  // ── OPERATIONS ──
  {
    id: 'dashboard', title: { en: 'Dashboard', ur: 'ڈیش بورڈ' }, icon: LayoutDashboard, category: 'operations',
    summary: { en: 'Your business at a glance — sales, revenue, stock alerts', ur: 'آپ کے کاروبار کا مکمل جائزہ — فروخت، آمدنی، اسٹاک الرٹس' },
    steps: [
      { title: { en: 'Understanding KPI Cards', ur: 'KPI کارڈز کو سمجھنا' }, description: { en: 'At the top you\'ll see 4 cards: Today\'s Sales (total revenue today), Orders Today (number of transactions), Products (total items + low stock count), and Revenue MTD (month-to-date earnings). Green arrows mean improvement, red arrows mean decline.', ur: 'اوپر 4 کارڈز نظر آئیں گے: آج کی فروخت، آج کے آرڈرز، پروڈکٹس، اور ماہانہ آمدنی۔ سبز تیر بہتری اور سرخ تیر کمی کی نشاندہی کرتے ہیں۔' } },
      { title: { en: 'Recent Sales List', ur: 'حالیہ فروخت کی فہرست' }, description: { en: 'Shows the last 5 transactions with customer name, invoice number, time, amount, and payment method.', ur: 'آخری 5 لین دین دکھاتا ہے جن میں کسٹمر کا نام، انوائس نمبر، وقت، رقم اور ادائیگی کا طریقہ شامل ہوتا ہے۔' } },
      { title: { en: 'Low Stock Alerts', ur: 'کم اسٹاک الرٹس' }, description: { en: 'Shows products running low. Red badges = critically low (2 or fewer), amber = approaching minimum. Click any product to go to inventory.', ur: 'کم اسٹاک والی پروڈکٹس دکھاتا ہے۔ سرخ بیج = انتہائی کم، نارنجی = کم ہو رہا ہے۔' } },
    ],
    tips: [{ en: 'Check the dashboard first thing every morning to see overnight sales and stock alerts.', ur: 'ہر صبح سب سے پہلے ڈیش بورڈ چیک کریں۔' }],
  },
  {
    id: 'pos', title: { en: 'Point of Sale (POS)', ur: 'پوائنٹ آف سیل (POS)' }, icon: ShoppingCart, category: 'operations',
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
    examples: [{ label: { en: 'Example: Selling a Glock 19', ur: 'مثال: Glock 19 فروخت کرنا' }, fields: [
      { name: { en: 'Product', ur: 'پروڈکٹ' }, value: 'Glock 19 Gen 5' }, { name: { en: 'Serial Number', ur: 'سیریل نمبر' }, value: 'ABC12345' },
      { name: { en: 'Customer', ur: 'کسٹمر' }, value: 'Ahmed Khan' }, { name: { en: 'Price', ur: 'قیمت' }, value: 'Rs. 450,000' }, { name: { en: 'Payment', ur: 'ادائیگی' }, value: 'Cash' },
    ] }],
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
    id: 'products', title: { en: 'Products', ur: 'پروڈکٹس' }, icon: Package, category: 'operations',
    summary: { en: 'Add, edit, and organize your product catalog with serial tracking', ur: 'سیریل ٹریکنگ کے ساتھ پروڈکٹ کیٹلاگ شامل کریں، تبدیل کریں، ترتیب دیں' },
    steps: [
      { title: { en: 'Add a New Product', ur: 'نئی پروڈکٹ شامل کریں' }, description: { en: 'Click "Add Product". Fill in: name, product code, category, sale price, cost price, and tax settings. Enable serial tracking for firearms.', ur: '"Add Product" پر کلک کریں۔ نام، کوڈ، کیٹیگری، فروخت قیمت، لاگت قیمت، ٹیکس سیٹنگز بھریں۔ فائر آرمز کے لیے سیریل ٹریکنگ فعال کریں۔' } },
      { title: { en: 'Search and Filter', ur: 'تلاش اور فلٹر' }, description: { en: 'Use the search bar for name/code/barcode. Filter by category or status (Active/Inactive).', ur: 'نام/کوڈ/بارکوڈ کے لیے سرچ بار استعمال کریں۔ کیٹیگری یا حالت سے فلٹر کریں۔' } },
      { title: { en: 'Edit Product Details', ur: 'پروڈکٹ کی تفصیلات تبدیل کریں' }, description: { en: 'Click the edit icon on any product row to modify details, pricing, or tracking settings.', ur: 'کسی بھی پروڈکٹ کی قطار میں ایڈٹ آئیکن پر کلک کریں۔' } },
      { title: { en: 'Deactivate Products', ur: 'پروڈکٹس غیر فعال کریں' }, description: { en: 'Instead of deleting, deactivate products you no longer sell. They stay hidden from POS but remain in records.', ur: 'حذف کرنے کی بجائے غیر فعال کریں۔ POS سے چھپ جائیں گی لیکن ریکارڈ میں رہیں گی۔' } },
    ],
    examples: [{ label: { en: 'Example: Adding a Firearm', ur: 'مثال: فائر آرم شامل کرنا' }, fields: [
      { name: { en: 'Name', ur: 'نام' }, value: 'Glock 19 Gen 5' }, { name: { en: 'Code', ur: 'کوڈ' }, value: 'FIR-001' },
      { name: { en: 'Category', ur: 'کیٹیگری' }, value: 'Firearms > Pistols' }, { name: { en: 'Sale Price', ur: 'فروخت قیمت' }, value: 'Rs. 450,000' },
      { name: { en: 'Cost Price', ur: 'لاگت قیمت' }, value: 'Rs. 380,000' }, { name: { en: 'Serial Tracking', ur: 'سیریل ٹریکنگ' }, value: 'Enabled' },
    ] }],
    tips: [
      { en: 'Use consistent product codes (e.g., FIR-001, AMM-001) for easy identification.', ur: 'آسان شناخت کے لیے مستقل کوڈ استعمال کریں (مثلاً FIR-001, AMM-001)۔' },
      { en: 'Set accurate cost prices to get correct profit margins in reports.', ur: 'رپورٹس میں درست منافع کے لیے صحیح لاگت قیمت درج کریں۔' },
    ],
  },
  {
    id: 'inventory', title: { en: 'Inventory / Stock', ur: 'انوینٹری / اسٹاک' }, icon: Warehouse, category: 'operations',
    summary: { en: 'Track stock levels, make adjustments, transfer between branches', ur: 'اسٹاک لیول ٹریک کریں، ایڈجسٹمنٹ کریں، برانچوں کے درمیان منتقلی' },
    steps: [
      { title: { en: 'View Stock Levels', ur: 'اسٹاک لیول دیکھیں' }, description: { en: 'Go to Stock page. See current stock for each product with status indicators (In Stock, Low, Out of Stock).', ur: 'اسٹاک صفحے پر جائیں۔ ہر پروڈکٹ کا موجودہ اسٹاک حالت کے ساتھ دیکھیں۔' } },
      { title: { en: 'Make Stock Adjustments', ur: 'اسٹاک ایڈجسٹمنٹ کریں' }, description: { en: 'Click "Adjust Stock" to record changes. Types: Received, Damaged, Lost, Returned, Correction, Audit.', ur: '"Adjust Stock" سے تبدیلیاں ریکارڈ کریں۔ اقسام: موصول، خراب، گم، واپس، اصلاح، آڈٹ۔' } },
      { title: { en: 'Transfer Between Branches', ur: 'برانچوں کے درمیان منتقلی' }, description: { en: 'Click "Transfer" to move stock from one branch to another. Select source, destination, products, and quantities.', ur: '"Transfer" سے ایک برانچ سے دوسری میں اسٹاک منتقل کریں۔' } },
    ],
    tips: [{ en: 'Run regular stock audits and use "Audit" adjustment type to correct discrepancies.', ur: 'باقاعدگی سے اسٹاک آڈٹ کریں اور فرق درست کرنے کے لیے "Audit" ایڈجسٹمنٹ استعمال کریں۔' }],
  },
  {
    id: 'sales', title: { en: 'Sales History', ur: 'فروخت کی تاریخ' }, icon: Receipt, category: 'operations',
    summary: { en: 'Review past sales, filter, and void transactions', ur: 'گزشتہ فروخت دیکھیں، فلٹر کریں، لین دین منسوخ کریں' },
    steps: [
      { title: { en: 'View All Sales', ur: 'تمام فروخت دیکھیں' }, description: { en: 'Click "Sales History" in the sidebar. View all completed transactions with filters.', ur: 'سائیڈبار میں "Sales History" پر کلک کریں۔' } },
      { title: { en: 'Search and Filter', ur: 'تلاش اور فلٹر' }, description: { en: 'Search by sale number or customer name. Filter by payment method, status, or date range.', ur: 'سیل نمبر یا کسٹمر نام سے تلاش کریں۔' } },
      { title: { en: 'Void a Sale', ur: 'فروخت منسوخ کریں' }, description: { en: 'Click "Void", enter reason, and confirm. Voided sales are marked but preserved for audit.', ur: '"Void" پر کلک کریں، وجہ درج کریں، تصدیق کریں۔' } },
    ],
    warnings: [{ en: 'Voided sales cannot be un-voided. Always double-check before confirming.', ur: 'منسوخ فروخت واپس نہیں ہو سکتی۔ تصدیق سے پہلے دوبارہ چیک کریں۔' }],
  },
  {
    id: 'customers', title: { en: 'Customers', ur: 'صارفین' }, icon: Users, category: 'operations',
    summary: { en: 'Maintain customer records with CNIC and firearm license tracking', ur: 'شناختی کارڈ اور فائر آرم لائسنس کے ساتھ کسٹمر ریکارڈ رکھیں' },
    steps: [
      { title: { en: 'Add a Customer', ur: 'کسٹمر شامل کریں' }, description: { en: 'Click "Add Customer". Enter name, CNIC/passport, phone, email, and firearm license details.', ur: '"Add Customer" پر کلک کریں۔ نام، شناختی کارڈ، فون، ای میل اور لائسنس کی تفصیلات درج کریں۔' } },
      { title: { en: 'Track Firearm Licenses', ur: 'فائر آرم لائسنس ٹریک کریں' }, description: { en: 'Enter license number and expiry date. The system shows badges: Valid, Expiring Soon, Expired.', ur: 'لائسنس نمبر اور میعاد ختم ہونے کی تاریخ درج کریں۔ سسٹم حالت دکھائے گا۔' } },
    ],
    tips: [{ en: 'Always record CNIC for firearm sales — it is a legal requirement.', ur: 'فائر آرم کی فروخت کے لیے ہمیشہ شناختی کارڈ درج کریں — یہ قانونی ضرورت ہے۔' }],
    warnings: [{ en: 'Never sell firearms to customers with expired licenses.', ur: 'میعاد ختم لائسنس والے صارفین کو فائر آرم فروخت نہ کریں۔' }],
  },
  {
    id: 'returns', title: { en: 'Returns', ur: 'واپسیاں' }, icon: RotateCcw, category: 'operations',
    summary: { en: 'Handle product returns, refunds, exchanges, and store credit', ur: 'پروڈکٹ واپسی، رقم واپسی، تبادلہ، اور اسٹور کریڈٹ' },
    steps: [
      { title: { en: 'Start a New Return', ur: 'نئی واپسی شروع کریں' }, description: { en: 'Click "New Return". Look up the original sale by sale number.', ur: '"New Return" پر کلک کریں۔ سیل نمبر سے اصل فروخت تلاش کریں۔' } },
      { title: { en: 'Select Items to Return', ur: 'واپسی کی اشیاء منتخب کریں' }, description: { en: 'Choose items, specify quantity, condition, and whether restockable.', ur: 'اشیاء منتخب کریں، مقدار، حالت، اور واپس اسٹاک ہونے کی صلاحیت بتائیں۔' } },
      { title: { en: 'Set Return Type', ur: 'واپسی کی قسم' }, description: { en: 'Choose Refund, Exchange, or Store Credit.', ur: 'رقم واپسی، تبادلہ، یا اسٹور کریڈٹ منتخب کریں۔' } },
    ],
    tips: [{ en: 'Restockable items are automatically added back to inventory.', ur: 'واپس اسٹاک ہونے والی اشیاء خود بخود انوینٹری میں شامل ہو جاتی ہیں۔' }],
  },
  {
    id: 'suppliers', title: { en: 'Suppliers', ur: 'سپلائرز' }, icon: Truck, category: 'operations',
    summary: { en: 'Maintain supplier contacts with NTN and payment terms', ur: 'NTN اور ادائیگی کی شرائط کے ساتھ سپلائر رابطے رکھیں' },
    steps: [
      { title: { en: 'Add a Supplier', ur: 'سپلائر شامل کریں' }, description: { en: 'Click "Add Supplier". Enter company name, contact person, phone, email, NTN, and payment terms.', ur: '"Add Supplier" پر کلک کریں۔ کمپنی کا نام، رابطہ شخص، فون، ای میل، NTN اور ادائیگی کی شرائط درج کریں۔' } },
    ],
    tips: [{ en: 'Set payment terms (Net 30, Net 60) to track payable deadlines.', ur: 'ادائیگی کی شرائط (Net 30, Net 60) مقرر کریں۔' }],
  },
  {
    id: 'categories', title: { en: 'Categories', ur: 'کیٹیگریز' }, icon: FolderTree, category: 'operations',
    summary: { en: 'Create and organize product categories', ur: 'پروڈکٹ کیٹیگریز بنائیں اور ترتیب دیں' },
    steps: [
      { title: { en: 'Create a Category', ur: 'کیٹیگری بنائیں' }, description: { en: 'Click "Add Category". Enter a name. Categories organize products in the POS grid and product list.', ur: '"Add Category" پر کلک کریں۔ نام درج کریں۔' } },
    ],
    tips: [{ en: 'Suggested categories: Firearms, Ammunition, Accessories, Optics, Clothing.', ur: 'تجویز کردہ کیٹیگریز: فائر آرمز، گولہ بارود، لوازمات، آپٹکس، لباس۔' }],
  },
  // ── FINANCIAL ──
  {
    id: 'expenses', title: { en: 'Expenses', ur: 'اخراجات' }, icon: HandCoins, category: 'financial',
    summary: { en: 'Record and categorize business expenses', ur: 'کاروباری اخراجات ریکارڈ اور درجہ بند کریں' },
    steps: [
      { title: { en: 'Record an Expense', ur: 'خرچ ریکارڈ کریں' }, description: { en: 'Click "Add Expense". Enter description, amount, category, date, and payment method.', ur: '"Add Expense" پر کلک کریں۔ تفصیل، رقم، کیٹیگری، تاریخ اور ادائیگی کا طریقہ درج کریں۔' } },
    ],
    tips: [{ en: 'Create expense categories like Rent, Utilities, Transport, Salary for better tracking.', ur: 'بہتر ٹریکنگ کے لیے کرایہ، بجلی، ٹرانسپورٹ، تنخواہ جیسی کیٹیگریز بنائیں۔' }],
  },
  {
    id: 'payables', title: { en: 'Payables', ur: 'واجبات الادا' }, icon: CreditCard, category: 'financial',
    summary: { en: 'Track money you owe to suppliers and others', ur: 'سپلائرز اور دوسروں کو دینے والی رقم ٹریک کریں' },
    steps: [
      { title: { en: 'Understanding Payables', ur: 'واجبات الادا سمجھیں' }, description: { en: 'When you buy goods on credit (pay later), that\'s a "payable". It means you owe money to someone.', ur: 'جب آپ ادھار پر سامان خریدتے ہیں تو یہ "واجبات الادا" ہے۔ اس کا مطلب ہے آپ نے کسی کو رقم دینی ہے۔' } },
      { title: { en: 'Record a Payable', ur: 'واجب الادا ریکارڈ کریں' }, description: { en: 'Click "Add Payable". Select the supplier, enter amount, due date, and reference number.', ur: '"Add Payable" پر کلک کریں۔ سپلائر منتخب کریں، رقم، مقررہ تاریخ اور حوالہ نمبر درج کریں۔' } },
      { title: { en: 'Make a Payment', ur: 'ادائیگی کریں' }, description: { en: 'Click "Pay" on a payable to record full or partial payment.', ur: 'واجب الادا پر "Pay" سے مکمل یا جزوی ادائیگی ریکارڈ کریں۔' } },
    ],
    concepts: [{
      term: { en: 'Accounts Payable', ur: 'واجبات الادا' },
      analogy: { en: 'Like a tab at a restaurant — you ate the food (got the goods) but haven\'t paid the bill yet.', ur: 'ریستوران کے ٹیب کی طرح — آپ نے کھانا کھا لیا لیکن بل ابھی نہیں دیا۔' },
      definition: { en: 'Money your business owes to suppliers for goods/services received but not yet paid for.', ur: 'وہ رقم جو آپ کے کاروبار نے سپلائرز کو دینی ہے لیکن ابھی تک ادا نہیں کی۔' },
      inApp: { en: 'Go to Payables in the sidebar. Each entry shows supplier, amount, due date, and payment status.', ur: 'سائیڈبار میں Payables پر جائیں۔' },
    }],
  },
  {
    id: 'receivables', title: { en: 'Receivables', ur: 'قابل وصول' }, icon: Wallet, category: 'financial',
    summary: { en: 'Track money customers owe you from credit sales', ur: 'ادھار فروخت سے صارفین پر واجب رقم ٹریک کریں' },
    steps: [
      { title: { en: 'Understanding Receivables', ur: 'قابل وصول سمجھیں' }, description: { en: 'When you sell on credit (customer pays later), that\'s a "receivable". The customer owes you money.', ur: 'جب آپ ادھار پر فروخت کرتے ہیں تو یہ "قابل وصول" ہے۔ صارف نے آپ کو رقم دینی ہے۔' } },
      { title: { en: 'Collect Payment', ur: 'رقم وصول کریں' }, description: { en: 'Click "Collect" to record a payment received from the customer.', ur: '"Collect" سے کسٹمر سے موصول ادائیگی ریکارڈ کریں۔' } },
    ],
    concepts: [{
      term: { en: 'Accounts Receivable', ur: 'قابل وصول' },
      analogy: { en: 'Like lending money to a friend — they have your money and you\'re waiting to get it back.', ur: 'دوست کو ادھار دینے کی طرح — ان کے پاس آپ کی رقم ہے اور آپ واپسی کا انتظار کر رہے ہیں۔' },
      definition: { en: 'Money owed to your business by customers who purchased on credit.', ur: 'وہ رقم جو ادھار خریداری کرنے والے صارفین نے آپ کے کاروبار کو دینی ہے۔' },
      inApp: { en: 'Go to Receivables in the sidebar.', ur: 'سائیڈبار میں Receivables پر جائیں۔' },
    }],
  },
  {
    id: 'cash-register', title: { en: 'Cash Register', ur: 'کیش رجسٹر' }, icon: Banknote, category: 'financial',
    summary: { en: 'Open/close cash sessions, track cash in/out, reconcile', ur: 'کیش سیشن کھولیں/بند کریں، نقدی کی آمد و رفت ٹریک کریں' },
    steps: [
      { title: { en: 'Open a Session', ur: 'سیشن کھولیں' }, description: { en: 'Click "Open Register". Enter the opening cash amount.', ur: '"Open Register" پر کلک کریں۔ ابتدائی نقد رقم درج کریں۔' } },
      { title: { en: 'Cash In/Out During Day', ur: 'دن میں نقدی داخل/خارج' }, description: { en: 'Use "Cash In" to add money and "Cash Out" to record removals.', ur: '"Cash In" سے رقم شامل کریں اور "Cash Out" سے نکالی گئی رقم ریکارڈ کریں۔' } },
      { title: { en: 'Close Session', ur: 'سیشن بند کریں' }, description: { en: 'At end of day, click "Close Register". Count the cash in drawer and enter it. The system shows expected vs actual.', ur: 'دن کے آخر میں "Close Register" پر کلک کریں۔ دراز میں رقم گنیں اور درج کریں۔' } },
    ],
    tips: [{ en: 'Always open a register session before processing sales.', ur: 'فروخت سے پہلے ہمیشہ رجسٹر سیشن کھولیں۔' }],
  },
  {
    id: 'commissions', title: { en: 'Commissions', ur: 'کمیشن' }, icon: BadgePercent, category: 'financial',
    summary: { en: 'Set commission rates and track earned commissions', ur: 'کمیشن کی شرح مقرر کریں اور حاصل کردہ کمیشن ٹریک کریں' },
    steps: [
      { title: { en: 'Set Commission Rates', ur: 'کمیشن کی شرح مقرر کریں' }, description: { en: 'Configure percentage or fixed-amount commission rules for staff or referral partners.', ur: 'عملے یا حوالہ شراکت داروں کے لیے فیصد یا مقررہ رقم کمیشن کے اصول ترتیب دیں۔' } },
    ],
  },
  {
    id: 'referrals', title: { en: 'Referrals', ur: 'حوالہ جات' }, icon: UserCheck, category: 'financial',
    summary: { en: 'Track referral persons and their sales contributions', ur: 'حوالہ دینے والے افراد اور ان کی فروخت کی شراکت ٹریک کریں' },
    steps: [
      { title: { en: 'Add a Referral Person', ur: 'حوالہ شخص شامل کریں' }, description: { en: 'Click "Add Referral Person". Enter name, phone, and commission rate.', ur: '"Add Referral Person" پر کلک کریں۔' } },
    ],
  },
  {
    id: 'vouchers', title: { en: 'Vouchers', ur: 'واؤچرز' }, icon: FileText, category: 'financial',
    summary: { en: 'Create payment and receipt vouchers for formal records', ur: 'باقاعدہ ریکارڈ کے لیے ادائیگی اور وصولی واؤچرز بنائیں' },
    steps: [
      { title: { en: 'Create a Voucher', ur: 'واؤچر بنائیں' }, description: { en: 'Click "Add Voucher". Choose type (Payment or Receipt), enter amount, account, and description.', ur: '"Add Voucher" پر کلک کریں۔ قسم منتخب کریں، رقم، اکاؤنٹ اور تفصیل درج کریں۔' } },
    ],
  },
  {
    id: 'tax-collections', title: { en: 'Tax Collections', ur: 'ٹیکس وصولی' }, icon: Percent, category: 'financial',
    summary: { en: 'Track sales tax collected on transactions', ur: 'لین دین پر وصول شدہ سیلز ٹیکس ٹریک کریں' },
    steps: [
      { title: { en: 'Understanding Sales Tax', ur: 'سیلز ٹیکس سمجھیں' }, description: { en: 'Sales tax is collected from customers on each sale and must be deposited to the government. Standard rate is 17%.', ur: 'سیلز ٹیکس ہر فروخت پر صارفین سے وصول کیا جاتا ہے۔ معیاری شرح 17% ہے۔' } },
    ],
    concepts: [{
      term: { en: 'Sales Tax', ur: 'سیلز ٹیکس' },
      analogy: { en: 'The government\'s share of every sale. You collect it from customers and pass it on — you\'re the middleman.', ur: 'ہر فروخت میں حکومت کا حصہ۔ آپ صارفین سے وصول کر کے آگے دیتے ہیں۔' },
      definition: { en: 'A government-imposed tax added to the sale price of goods.', ur: 'حکومت کی جانب سے اشیاء کی فروخت قیمت پر لگایا جانے والا ٹیکس۔' },
      inApp: { en: 'Go to Tax Collections in the sidebar. Tax is auto-calculated on each sale based on your Settings > Tax rate.', ur: 'سائیڈبار میں Tax Collections پر جائیں۔' },
    }],
  },
  {
    id: 'discounts', title: { en: 'Discounts', ur: 'رعایت' }, icon: BadgePercent, category: 'financial',
    summary: { en: 'Create discount rules — percentage or fixed amount', ur: 'رعایت کے اصول بنائیں — فیصد یا مقررہ رقم' },
    steps: [
      { title: { en: 'Create a Discount Rule', ur: 'رعایت کا اصول بنائیں' }, description: { en: 'Click "Add Discount". Set name, type (percentage or fixed), value, and scope.', ur: '"Add Discount" پر کلک کریں۔ نام، قسم، قدر، اور حد مقرر کریں۔' } },
    ],
  },
  // ── ACCOUNTING ──
  {
    id: 'chart-of-accounts', title: { en: 'Chart of Accounts', ur: 'چارٹ آف اکاؤنٹس' }, icon: BookOpen, category: 'accounting',
    summary: { en: 'The master list of all accounts — where every rupee is categorized', ur: 'تمام اکاؤنٹس کی ماسٹر فہرست — ہر روپیہ کہاں درجہ بند ہے' },
    steps: [
      { title: { en: 'View Accounts', ur: 'اکاؤنٹس دیکھیں' }, description: { en: 'Go to Chart of Accounts. See all accounts organized by type: Assets, Liabilities, Equity, Revenue, Expenses.', ur: 'Chart of Accounts پر جائیں۔ تمام اکاؤنٹس قسم کے مطابق دیکھیں۔' } },
      { title: { en: 'Add a Custom Account', ur: 'حسب ضرورت اکاؤنٹ شامل کریں' }, description: { en: 'Click "Add Account". Choose the type, enter name and code.', ur: '"Add Account" پر کلک کریں۔ قسم منتخب کریں، نام اور کوڈ درج کریں۔' } },
    ],
    concepts: [
      { term: { en: 'Assets', ur: 'اثاثے' }, analogy: { en: 'Everything you OWN — cash in the register, products on shelves, money customers owe you.', ur: 'ہر وہ چیز جو آپ کی ملکیت ہے — رجسٹر میں نقدی، شیلف پر پروڈکٹس۔' }, definition: { en: 'Resources owned by the business that have economic value.', ur: 'کاروبار کی ملکیت وسائل جن کی اقتصادی قدر ہے۔' }, inApp: { en: 'In Chart of Accounts under "Assets". Includes Cash, Inventory, Receivables.', ur: 'Chart of Accounts میں "Assets" کے تحت۔' } },
      { term: { en: 'Liabilities', ur: 'واجبات' }, analogy: { en: 'Everything you OWE — money owed to suppliers, loans, tax collected but not yet paid.', ur: 'ہر وہ چیز جو آپ نے دینی ہے — سپلائرز کو واجب رقم، قرض۔' }, definition: { en: 'Obligations the business owes to others.', ur: 'وہ ذمہ داریاں جو کاروبار نے دوسروں کو ادا کرنی ہیں۔' }, inApp: { en: 'In Chart of Accounts under "Liabilities". Includes Payables, Tax Payable, Loans.', ur: 'Chart of Accounts میں "Liabilities" کے تحت۔' } },
      { term: { en: 'Owner Equity', ur: 'مالک کی ایکویٹی' }, analogy: { en: 'If you sold everything and paid all debts, what\'s left is YOUR money — the owner\'s equity.', ur: 'اگر سب بیچ دیں اور تمام قرض ادا کریں، جو بچے وہ آپ کی رقم ہے۔' }, definition: { en: 'The owner\'s residual interest: Assets minus Liabilities = Equity.', ur: 'مالک کا بقایا مفاد: اثاثے منفی واجبات = ایکویٹی۔' }, inApp: { en: 'In Chart of Accounts under "Equity".', ur: 'Chart of Accounts میں "Equity" کے تحت۔' } },
    ],
    warnings: [{ en: 'The golden rule: Assets = Liabilities + Equity. If your Balance Sheet doesn\'t balance, check for missing journal entries.', ur: 'سنہری اصول: اثاثے = واجبات + ایکویٹی۔ اگر بیلنس شیٹ توازن میں نہ ہو تو گمشدہ جرنل انٹریز چیک کریں۔' }],
  },
  {
    id: 'journal-entries', title: { en: 'Journal Entries', ur: 'جرنل انٹریز' }, icon: PenLine, category: 'accounting',
    summary: { en: 'The diary of every financial transaction — debits and credits', ur: 'ہر مالیاتی لین دین کی ڈائری — ڈیبٹ اور کریڈٹ' },
    steps: [
      { title: { en: 'Understanding Journal Entries', ur: 'جرنل انٹریز سمجھیں' }, description: { en: 'Every transaction creates a journal entry with at least one debit and one credit. The system creates most automatically.', ur: 'ہر لین دین ایک جرنل انٹری بناتا ہے۔ سسٹم زیادہ تر خود بخود بناتا ہے۔' } },
      { title: { en: 'Create a Manual Entry', ur: 'دستی انٹری بنائیں' }, description: { en: 'Click "Add Entry". Select accounts, enter debit and credit amounts (they MUST be equal).', ur: '"Add Entry" پر کلک کریں۔ ڈیبٹ اور کریڈٹ رقم برابر ہونی چاہیے۔' } },
    ],
    concepts: [
      { term: { en: 'Double-Entry Bookkeeping', ur: 'دوہری اندراج' }, analogy: { en: 'Every transaction has two sides: selling a gun for cash means "cash increased" AND "inventory decreased".', ur: 'ہر لین دین کے دو رخ ہیں: نقد بندوق بیچنا یعنی "نقدی بڑھی" اور "انوینٹری کم ہوئی"۔' }, definition: { en: 'Every transaction is recorded in at least two accounts, ensuring debits always equal credits.', ur: 'ہر لین دین کم از کم دو اکاؤنٹس میں ریکارڈ ہوتا ہے۔' }, inApp: { en: 'The system handles this automatically. See both sides in Journals.', ur: 'سسٹم یہ خود سنبھالتا ہے۔ Journals میں دیکھیں۔' } },
      { term: { en: 'Debits & Credits', ur: 'ڈیبٹ اور کریڈٹ' }, analogy: { en: 'Debit = money coming IN to an account. Credit = money going OUT.', ur: 'ڈیبٹ = اکاؤنٹ میں رقم آنا۔ کریڈٹ = رقم جانا۔' }, definition: { en: 'Debit increases assets/expenses. Credit increases liabilities/equity/revenue.', ur: 'ڈیبٹ اثاثے/اخراجات بڑھاتا ہے۔ کریڈٹ واجبات/ایکویٹی/آمدنی بڑھاتا ہے۔' }, inApp: { en: 'In every journal entry, total debits must equal total credits.', ur: 'ہر جرنل انٹری میں کل ڈیبٹ کل کریڈٹ کے برابر ہونا چاہیے۔' } },
    ],
    warnings: [{ en: 'Total debits must ALWAYS equal total credits.', ur: 'کل ڈیبٹ ہمیشہ کل کریڈٹ کے برابر ہونا چاہیے۔' }],
  },
  {
    id: 'purchases', title: { en: 'Purchases', ur: 'خریداری' }, icon: Truck, category: 'accounting',
    summary: { en: 'Create purchase orders, receive goods, track costs', ur: 'خریداری کے آرڈرز بنائیں، سامان وصول کریں، لاگت ٹریک کریں' },
    steps: [
      { title: { en: 'Create a Purchase Order', ur: 'خریداری کا آرڈر بنائیں' }, description: { en: 'Click "New Purchase". Select supplier, add products with quantities and costs.', ur: '"New Purchase" پر کلک کریں۔ سپلائر منتخب کریں۔' } },
      { title: { en: 'Receive Goods', ur: 'سامان وصول کریں' }, description: { en: 'When goods arrive, mark the purchase as received. Inventory updates automatically.', ur: 'سامان آنے پر خریداری کو موصول نشان زد کریں۔' } },
    ],
  },
  {
    id: 'services', title: { en: 'Services', ur: 'خدمات' }, icon: Wrench, category: 'accounting',
    summary: { en: 'Track service income and expenses', ur: 'سروس آمدنی اور اخراجات ٹریک کریں' },
    steps: [
      { title: { en: 'Add a Service', ur: 'سروس شامل کریں' }, description: { en: 'Click "Add Service". Enter name, type (income or expense), and default price.', ur: '"Add Service" پر کلک کریں۔' } },
    ],
  },
  {
    id: 'reports', title: { en: 'Reports', ur: 'رپورٹیں' }, icon: BarChart3, category: 'accounting',
    summary: { en: 'Generate Balance Sheet, Profit & Loss, and other financial reports', ur: 'بیلنس شیٹ، نفع و نقصان اور دیگر مالیاتی رپورٹیں بنائیں' },
    steps: [
      { title: { en: 'Run a Report', ur: 'رپورٹ بنائیں' }, description: { en: 'Go to Reports. Select report type, date range, and click Generate.', ur: 'Reports پر جائیں۔ رپورٹ کی قسم، تاریخ کی حد منتخب کریں اور Generate پر کلک کریں۔' } },
    ],
    concepts: [
      { term: { en: 'Balance Sheet', ur: 'بیلنس شیٹ' }, analogy: { en: 'A photo of your wallet at one moment — what you own, what you owe, and what\'s left for you.', ur: 'ایک لمحے میں آپ کے بٹوے کی تصویر — آپ کی ملکیت، قرض، اور بچت۔' }, definition: { en: 'Financial statement showing assets, liabilities, and equity at a specific point in time.', ur: 'کسی مخصوص وقت پر اثاثے، واجبات اور ایکویٹی دکھانے والا مالیاتی بیان۔' }, inApp: { en: 'Go to Reports > Balance Sheet.', ur: 'Reports > Balance Sheet پر جائیں۔' } },
      { term: { en: 'Profit & Loss', ur: 'نفع و نقصان' }, analogy: { en: 'Your monthly score card — how much you earned vs how much you spent.', ur: 'آپ کا ماہانہ اسکور کارڈ — کتنا کمایا بمقابلہ کتنا خرچ کیا۔' }, definition: { en: 'Financial statement showing revenue, expenses, and resulting profit or loss over a period.', ur: 'ایک مدت میں آمدنی، اخراجات اور نفع یا نقصان دکھانے والا بیان۔' }, inApp: { en: 'Go to Reports > Profit & Loss.', ur: 'Reports > Profit & Loss پر جائیں۔' } },
    ],
  },
  // ── MANAGEMENT ──
  {
    id: 'users', title: { en: 'Users', ur: 'صارفین' }, icon: UserCog, category: 'management',
    summary: { en: 'Create staff accounts with role-based access', ur: 'کردار پر مبنی رسائی کے ساتھ عملے کے اکاؤنٹس بنائیں' },
    steps: [
      { title: { en: 'Create a User', ur: 'صارف بنائیں' }, description: { en: 'Click "Add User". Enter name, username, email, password, role (Admin/Manager/Cashier), and branch.', ur: '"Add User" پر کلک کریں۔ نام، صارف نام، ای میل، پاس ورڈ، کردار اور برانچ درج کریں۔' } },
      { title: { en: 'Understand Roles', ur: 'کردار سمجھیں' }, description: { en: 'Admin: full access. Manager: sales, products, inventory, financial. Cashier: POS only.', ur: 'ایڈمن: مکمل رسائی۔ منیجر: فروخت، پروڈکٹس، انوینٹری، مالیاتی۔ کیشئر: صرف POS۔' } },
    ],
    warnings: [{ en: 'Never share admin credentials. Create individual accounts for each staff member.', ur: 'ایڈمن اسناد کبھی شیئر نہ کریں۔' }],
  },
  {
    id: 'branches', title: { en: 'Branches', ur: 'برانچیں' }, icon: Building, category: 'management',
    summary: { en: 'Configure multi-location branch network', ur: 'کثیر مقامات کی برانچ نیٹ ورک ترتیب دیں' },
    steps: [
      { title: { en: 'Add a Branch', ur: 'برانچ شامل کریں' }, description: { en: 'Click "Add Branch". Enter name, code, address, phone, email, and dealer license number.', ur: '"Add Branch" پر کلک کریں۔ نام، کوڈ، پتہ، فون، ای میل اور لائسنس نمبر درج کریں۔' } },
    ],
  },
  {
    id: 'audit-logs', title: { en: 'Activity Logs', ur: 'سرگرمی کے نوشتے' }, icon: ClipboardList, category: 'management',
    summary: { en: 'View detailed history of all actions', ur: 'تمام کارروائیوں کی تفصیلی تاریخ دیکھیں' },
    steps: [
      { title: { en: 'View Logs', ur: 'لاگز دیکھیں' }, description: { en: 'Go to Activity Logs. See who did what, when, with full details.', ur: 'Activity Logs پر جائیں۔ کس نے کیا کب کیا دیکھیں۔' } },
    ],
  },
  {
    id: 'settings', title: { en: 'Settings', ur: 'سیٹنگز' }, icon: Settings, category: 'management',
    summary: { en: 'Configure business info, tax, receipts, payments', ur: 'کاروباری معلومات، ٹیکس، رسیدیں، ادائیگیاں ترتیب دیں' },
    steps: [
      { title: { en: 'Business Info', ur: 'کاروباری معلومات' }, description: { en: 'Set company name, NTN, STRN, dealer license, address. Appears on all receipts.', ur: 'کمپنی کا نام، NTN، STRN، لائسنس، پتہ درج کریں۔' } },
      { title: { en: 'Tax & Currency', ur: 'ٹیکس اور کرنسی' }, description: { en: 'Set default tax rate (17%), currency (PKR).', ur: 'ٹیکس شرح (17%)، کرنسی (PKR) مقرر کریں۔' } },
      { title: { en: 'Sales & Payments', ur: 'فروخت اور ادائیگی' }, description: { en: 'Enable/disable payment methods and set default.', ur: 'ادائیگی کے طریقے فعال/غیر فعال کریں۔' } },
    ],
    tips: [{ en: 'Complete business info and tax settings first — they affect receipts and calculations.', ur: 'پہلے کاروباری معلومات اور ٹیکس سیٹنگز مکمل کریں۔' }],
  },
  {
    id: 'reversals', title: { en: 'Reversal Requests', ur: 'واپسی کی درخواستیں' }, icon: RotateCcw, category: 'management',
    summary: { en: 'Review and approve/deny transaction reversal requests', ur: 'لین دین کی واپسی کی درخواستوں کا جائزہ لیں' },
    steps: [
      { title: { en: 'Review Requests', ur: 'درخواستوں کا جائزہ' }, description: { en: 'Go to Reversal Requests. See pending requests with details. Approve or deny.', ur: 'Reversal Requests پر جائیں۔ زیر التواء درخواستیں دیکھیں۔' } },
    ],
  },
  {
    id: 'common-issues', title: { en: 'Common Issues', ur: 'عام مسائل' }, icon: AlertTriangle, category: 'management',
    summary: { en: 'Quick fixes for frequently encountered problems', ur: 'عام مسائل کے فوری حل' },
    steps: [
      { title: { en: 'Cannot log in', ur: 'لاگ ان نہیں ہو رہا' }, description: { en: 'Check username/password. Contact admin if account deactivated.', ur: 'صارف نام/پاس ورڈ چیک کریں۔ ایڈمن سے رابطہ کریں۔' } },
      { title: { en: 'Product not in POS', ur: 'پروڈکٹ POS میں نہیں' }, description: { en: 'Ensure product is "Active" and has stock > 0. Check branch.', ur: 'پروڈکٹ "Active" ہے اور اسٹاک 0 سے زیادہ ہے چیک کریں۔' } },
      { title: { en: 'Balance Sheet not balancing', ur: 'بیلنس شیٹ توازن میں نہیں' }, description: { en: 'Check for manual journal entry errors. Run Trial Balance first.', ur: 'دستی جرنل انٹری کی غلطیاں چیک کریں۔ پہلے ٹرائل بیلنس چلائیں۔' } },
    ],
  },
  {
    id: 'tips-shortcuts', title: { en: 'Tips & Shortcuts', ur: 'مشورے اور شارٹ کٹس' }, icon: Lightbulb, category: 'management',
    summary: { en: 'Work faster with productivity tips', ur: 'پیداواری مشوروں سے تیزی سے کام کریں' },
    steps: [
      { title: { en: 'Quick search in POS', ur: 'POS میں فوری تلاش' }, description: { en: 'Start typing a product name or code — results filter in real-time.', ur: 'پروڈکٹ کا نام یا کوڈ ٹائپ کرنا شروع کریں۔' } },
      { title: { en: 'Hold & Resume Carts', ur: 'کارٹ روکیں اور دوبارہ شروع کریں' }, description: { en: 'Click "Hold" to save current cart. Resume later.', ur: '"Hold" سے موجودہ کارٹ محفوظ کریں۔' } },
      { title: { en: 'Check Dashboard Daily', ur: 'روزانہ ڈیش بورڈ چیک کریں' }, description: { en: 'Start each day by checking dashboard for sales and alerts.', ur: 'ہر دن ڈیش بورڈ سے شروع کریں۔' } },
    ],
  },
]

/* ═══════════════════════════════════════════════════════════════
   TABLE OF CONTENTS STRUCTURE
   ═══════════════════════════════════════════════════════════════ */

type TocEntry = { type: 'intro' } | { type: 'phase'; phaseIdx: number } | { type: 'chapter'; sectionIdx: number }

function buildToc(): TocEntry[] {
  const entries: TocEntry[] = [{ type: 'intro' }]
  workflowPhases.forEach((_, i) => entries.push({ type: 'phase', phaseIdx: i }))
  guideSections.forEach((_, i) => entries.push({ type: 'chapter', sectionIdx: i }))
  return entries
}

const tocEntries = buildToc()

const categoryOrder = ['operations', 'financial', 'accounting', 'management'] as const
/* Category meta uses theme accent for management — resolved at render time */
function getCategoryMeta(accent: string) {
  return {
    operations: { en: 'Operations', ur: 'آپریشنز', color: 'var(--color-info)', icon: ShoppingCart },
    financial: { en: 'Financial', ur: 'مالیاتی', color: 'var(--color-success)', icon: TrendingUp },
    accounting: { en: 'Accounting', ur: 'حسابات', color: 'var(--color-primary)', icon: Calculator },
    management: { en: 'Management', ur: 'انتظامیہ', color: accent, icon: Shield },
  } as Record<string, { en: string; ur: string; color: string; icon: React.ElementType }>
}

/* ═══════════════════════════════════════════════════════════════
   VISUAL COMPONENTS — The Armorer's Codex
   ═══════════════════════════════════════════════════════════════ */

function Ornament({ className = '', c }: { className?: string; c: GuideColors }) {
  return (
    <div className={`flex items-center gap-3 my-6 ${className}`}>
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${c.borderSubtle}, transparent)` }} />
      <div className="flex items-center gap-1.5">
        <div className="w-1 h-1 rounded-full opacity-50" style={{ background: c.accent }} />
        <div className="w-1.5 h-1.5 rotate-45 opacity-70" style={{ background: c.accent }} />
        <div className="w-1 h-1 rounded-full opacity-50" style={{ background: c.accent }} />
      </div>
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${c.borderSubtle}, transparent)` }} />
    </div>
  )
}

function ConceptBox({ concept, lang, c, font }: { concept: ConceptExplainer; lang: Language; c: GuideColors; font: string }) {
  const isUrdu = lang === 'ur'
  return (
    <div className="my-6 rounded-lg overflow-hidden" style={{
      borderLeft: isUrdu ? 'none' : `3px solid ${c.accent}`,
      borderRight: isUrdu ? `3px solid ${c.accent}` : 'none',
      background: c.bgElevated,
    }}>
      <div className="px-5 py-3 flex items-center gap-3" style={{ borderBottom: `1px solid ${c.border}`, background: c.bgSunken }}>
        <GraduationCap className="w-4 h-4 shrink-0" style={{ color: c.accent }} />
        <span className="text-sm font-bold tracking-wide" style={{ color: c.accent, fontFamily: font }}>
          {t(concept.term, lang)}
        </span>
      </div>
      <div className="p-5 space-y-4">
        <div>
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] block mb-1.5" style={{ color: c.accent }}>
            {isUrdu ? 'آسان مثال' : 'Think of it as...'}
          </span>
          <p className="leading-[1.9] italic opacity-80" style={{ fontFamily: font }}>
            &ldquo;{t(concept.analogy, lang)}&rdquo;
          </p>
        </div>
        <div className="h-px" style={{ background: c.border }} />
        <div>
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] block mb-1.5" style={{ color: c.info }}>
            {isUrdu ? 'تعریف' : 'Formal Definition'}
          </span>
          <p className="leading-[1.9] opacity-70">{t(concept.definition, lang)}</p>
        </div>
        <div className="h-px" style={{ background: c.border }} />
        <div>
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] block mb-1.5" style={{ color: c.success }}>
            {isUrdu ? 'ایپ میں کہاں ملے گا' : 'Where to Find It'}
          </span>
          <p className="leading-[1.9] opacity-70">{t(concept.inApp, lang)}</p>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT — The Armorer's Codex
   ═══════════════════════════════════════════════════════════════ */

export function GuideScreen() {
  const { resolvedTheme } = useTheme()
  const c = THEME_COLORS[resolvedTheme] || THEME_COLORS.dark
  const categoryMeta = getCategoryMeta(c.accent)

  const [lang, setLang] = useState<Language>('en')
  const [fontSize, setFontSize] = useState(15)
  const [tocSearch, setTocSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [tocCollapsed, setTocCollapsed] = useState(false)
  const [bookmarks, setBookmarks] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem('guide-bookmarks')
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch { return new Set() }
  })
  const [visited, setVisited] = useState<Set<number>>(new Set([0]))
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())
  const readingRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const isUrdu = lang === 'ur'
  const font = isUrdu ? FONT_UR : FONT_EN
  const totalPages = tocEntries.length

  // Persist bookmarks
  useEffect(() => {
    localStorage.setItem('guide-bookmarks', JSON.stringify(Array.from(bookmarks)))
  }, [bookmarks])

  // Track visited pages
  useEffect(() => {
    setVisited((prev) => new Set(prev).add(currentPage))
  }, [currentPage])

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
        readingRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        setCurrentPage((p) => Math.max(0, p - 1))
        readingRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      } else if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        searchRef.current?.focus()
      } else if (e.key === 'b' && !e.ctrlKey && !e.metaKey) {
        toggleBookmark(currentPage)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [currentPage, totalPages])

  const navigateTo = useCallback((pageIdx: number) => {
    setCurrentPage(pageIdx)
    readingRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const toggleBookmark = useCallback((page: number) => {
    setBookmarks((prev) => {
      const next = new Set(prev)
      if (next.has(page)) next.delete(page)
      else next.add(page)
      return next
    })
  }, [])

  const toggleCategory = useCallback((cat: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }, [])

  const filteredSections = useMemo(() => {
    if (!tocSearch) return guideSections
    const q = tocSearch.toLowerCase()
    return guideSections.filter((s) =>
      t(s.title, lang).toLowerCase().includes(q) || t(s.summary, lang).toLowerCase().includes(q)
    )
  }, [tocSearch, lang])

  const currentEntry = tocEntries[currentPage]
  const readingProgress = Math.round((Array.from(visited).length / totalPages) * 100)

  // Find related chapters for current chapter
  const getRelatedChapters = useCallback((sectionId: string) => {
    const parentPhase = workflowPhases.find((p) => p.modules.includes(sectionId))
    if (!parentPhase) return []
    return parentPhase.modules
      .filter((m) => m !== sectionId)
      .map((m) => guideSections.find((s) => s.id === m))
      .filter(Boolean) as GuideSection[]
  }, [])

  // Get next/prev page labels
  const getPageLabel = (idx: number): string => {
    const entry = tocEntries[idx]
    if (!entry) return ''
    if (entry.type === 'intro') return isUrdu ? 'تعارف' : 'Introduction'
    if (entry.type === 'phase') return t(workflowPhases[entry.phaseIdx].title, lang)
    return t(guideSections[entry.sectionIdx].title, lang)
  }

  /* ══════════════════════════════════════════════════════════
     RENDER READING PANE PAGES
     ══════════════════════════════════════════════════════════ */

  function renderPage() {
    if (!currentEntry) return null

    /* ── INTRODUCTION ── */
    if (currentEntry.type === 'intro') {
      return (
        <div className="page-enter">
          <div className="text-center pt-12 pb-10">
            <div className="w-20 h-20 mx-auto mb-8 rounded-full flex items-center justify-center"
              style={{ border: `2px solid ${c.border}`, background: c.bgElevated }}>
              <BookMarked className="w-9 h-9" style={{ color: c.accent }} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.5em] mb-4" style={{ color: c.textFaint }}>
              {isUrdu ? 'فائر آرمز POS سسٹم' : 'Firearms POS System'}
            </p>
            <h1 className="text-4xl font-bold mb-2 tracking-tight" style={{ fontFamily: font, color: c.accentGlow }}>
              {isUrdu ? 'ارمرر کا دستور' : "The Armorer's Codex"}
            </h1>
            <p className="text-lg mb-2" style={{ fontFamily: font, color: c.textFaint }}>
              {isUrdu ? 'مکمل استعمال کی گائیڈ' : 'Complete Operational Guide'}
            </p>
            <Ornament c={c} />
            <p className="max-w-lg mx-auto leading-[1.9] mt-6" style={{ fontFamily: font, color: c.textMuted }}>
              {t(workflowIntro, lang)}
            </p>
          </div>

          <Ornament c={c} />

          {/* How to navigate */}
          <div className="mt-8 mb-6">
            <h2 className="text-lg font-bold mb-5 flex items-center gap-3" style={{ fontFamily: font, color: c.text }}>
              <GraduationCap className="w-5 h-5" style={{ color: c.accent }} />
              {isUrdu ? 'یہ گائیڈ کیسے استعمال کریں' : 'How to Navigate This Guide'}
            </h2>
            <div className="space-y-3 leading-[1.9]" style={{ fontFamily: font, color: c.textMuted }}>
              <p>
                {isUrdu
                  ? 'بائیں طرف فہرست مضامین ہے۔ کسی بھی باب پر کلک کریں یا نیچے "اگلا" بٹن سے ترتیب سے پڑھیں۔ پہلے 6 "حصے" کاروبار کے ورک فلو کا جائزہ دیتے ہیں، پھر ہر ماڈیول کا تفصیلی باب ہے۔'
                  : 'The table of contents is on the left. Click any chapter to jump directly, or read in order using the "Next" button. The first 6 "Parts" give you a workflow overview, followed by detailed chapters for each module.'}
              </p>
              <p>
                {isUrdu
                  ? 'حسابات کے ابواب میں خاص "تصور سمجھیں" خانے ہیں جو مشکل اصطلاحات آسان مثالوں سے سمجھاتے ہیں۔'
                  : 'Accounting chapters include special "Concept" boxes that explain difficult terms with everyday analogies — no prior accounting knowledge needed.'}
              </p>
            </div>
          </div>

          {/* Keyboard shortcuts */}
          <div className="rounded-lg p-5 mt-6" style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
            <div className="flex items-center gap-2 mb-4">
              <Keyboard className="w-4 h-4" style={{ color: c.info }} />
              <span className="text-sm font-bold" style={{ color: c.info }}>{isUrdu ? 'کی بورڈ شارٹ کٹس' : 'Keyboard Shortcuts'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { keys: isUrdu ? 'دائیں/بائیں تیر' : 'Arrow Keys', desc: isUrdu ? 'اگلا/پچھلا صفحہ' : 'Navigate pages' },
                { keys: '/', desc: isUrdu ? 'تلاش' : 'Focus search' },
                { keys: 'B', desc: isUrdu ? 'بک مارک' : 'Toggle bookmark' },
              ].map(({ keys, desc }) => (
                <div key={keys} className="flex items-center gap-2">
                  <kbd className="px-2 py-0.5 rounded text-[10px] font-mono font-bold" style={{ background: c.bgSunken, border: `1px solid ${c.border}` }}>{keys}</kbd>
                  <span style={{ color: c.textFaint }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-3 mt-8">
            {[
              { label: isUrdu ? 'ابواب' : 'Chapters', value: guideSections.length, color: c.info },
              { label: isUrdu ? 'حصے' : 'Parts', value: workflowPhases.length, color: c.accent },
              { label: isUrdu ? 'تصورات' : 'Concepts', value: guideSections.reduce((n, s) => n + (s.concepts?.length ?? 0), 0), color: c.success },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center py-4 rounded-lg" style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
                <div className="text-2xl font-bold tabular-nums" style={{ fontFamily: font, color }}>{value}</div>
                <div className="text-[10px] uppercase tracking-widest mt-1" style={{ color: c.textFaint }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    /* ── WORKFLOW PHASE ── */
    if (currentEntry.type === 'phase') {
      const phase = workflowPhases[currentEntry.phaseIdx]
      const PhaseIcon = phase.icon
      return (
        <div className="page-enter">
          <div className="relative text-center pt-8 pb-8">
            {/* Watermark number */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.04]"
              style={{ fontSize: '180px', fontFamily: font, color: c.accent, fontWeight: 700, lineHeight: 1 }}>
              {currentEntry.phaseIdx + 1}
            </div>
            <div className="relative">
              <span className="text-[10px] font-bold uppercase tracking-[0.5em]" style={{ color: c.accentDim }}>
                {isUrdu ? `حصہ ${currentEntry.phaseIdx + 1}` : `Part ${currentEntry.phaseIdx + 1}`}
              </span>
              <div className="w-16 h-16 mx-auto my-6 rounded-full flex items-center justify-center"
                style={{ border: `2px solid ${c.border}`, background: c.bgElevated }}>
                <PhaseIcon className="w-7 h-7" style={{ color: c.accent }} />
              </div>
              <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: font, color: c.text }}>{t(phase.title, lang)}</h1>
              <Ornament c={c} />
              <p className="max-w-md mx-auto leading-[1.9] mt-4" style={{ fontFamily: font, color: c.textMuted }}>
                {t(phase.description, lang)}
              </p>
            </div>
          </div>

          <div className="mt-10">
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] mb-5" style={{ color: c.accent }}>
              {isUrdu ? 'اس حصے کے ابواب' : 'Chapters in this Part'}
            </h3>
            <div className="space-y-2">
              {phase.modules.map((modId, idx) => {
                const section = guideSections.find((s) => s.id === modId)
                if (!section) return null
                const sectionIdx = guideSections.indexOf(section)
                const pageIdx = tocEntries.findIndex((e) => e.type === 'chapter' && e.sectionIdx === sectionIdx)
                const SectionIcon = section.icon
                const readTime = estimateReadTime(section)
                return (
                  <button
                    key={modId}
                    onClick={() => navigateTo(pageIdx)}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-lg text-left transition-all duration-200 group"
                    style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}
                  >
                    <span className="text-sm font-bold tabular-nums w-5 shrink-0" style={{ fontFamily: font, color: c.textMuted }}>
                      {idx + 1}
                    </span>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                      style={{ background: c.bgSunken, border: `1px solid ${c.borderSubtle}` }}>
                      <SectionIcon className="w-5 h-5" style={{ color: c.text }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base" style={{ fontFamily: font, color: c.text }}>{t(section.title, lang)}</p>
                      <p className="text-sm mt-1 truncate" style={{ color: c.textMuted }}>{t(section.summary, lang)}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs tabular-nums" style={{ color: c.textMuted }}>{section.steps.length} {isUrdu ? 'مراحل' : 'steps'}</span>
                      <span className="text-xs flex items-center gap-1" style={{ color: c.textMuted }}>
                        <Clock className="w-3 h-3" />{readTime}m
                      </span>
                      <ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-60 transition-opacity" style={{ color: c.textMuted }} />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )
    }

    /* ── CHAPTER ── */
    const section = guideSections[currentEntry.sectionIdx]
    if (!section) return null
    const SectionIcon = section.icon
    const chapterNum = currentEntry.sectionIdx + 1
    const catMeta = categoryMeta[section.category]
    const readTime = estimateReadTime(section)
    const related = getRelatedChapters(section.id)

    return (
      <div className="page-enter">
        {/* Chapter Header */}
        <div className="relative text-center pt-6 pb-6 mb-8" style={{ borderBottom: `1px solid ${c.border}` }}>
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.04]"
            style={{ fontSize: '140px', fontFamily: font, color: catMeta.color, fontWeight: 700, lineHeight: 1 }}>
            {chapterNum}
          </div>
          <div className="relative">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em]" style={{ color: c.accentDim }}>
                {isUrdu ? `باب ${chapterNum}` : `Chapter ${chapterNum}`}
              </span>
              <span className="text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
                style={{ background: c.bgSunken, color: catMeta.color, border: `1px solid ${c.border}` }}>
                {isUrdu ? catMeta.ur : catMeta.en}
              </span>
            </div>
            <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ border: `2px solid ${c.border}`, background: c.bgElevated }}>
              <SectionIcon className="w-5 h-5" style={{ color: catMeta.color }} />
            </div>
            <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: font, color: c.text }}>{t(section.title, lang)}</h1>
            <p className="text-sm mt-1 flex items-center justify-center gap-3" style={{ color: c.textFaint }}>
              <span>{t(section.summary, lang)}</span>
            </p>
            <div className="flex items-center justify-center gap-4 mt-3 text-[10px]" style={{ color: c.textFaint }}>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{readTime} min read</span>
              <span>{section.steps.length} {isUrdu ? 'مراحل' : 'steps'}</span>
              {section.concepts && <span>{section.concepts.length} {isUrdu ? 'تصورات' : 'concepts'}</span>}
            </div>
          </div>
        </div>

        {/* What You'll Learn */}
        {section.steps.length > 1 && (
          <div className="mb-8 rounded-lg p-5" style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3" style={{ color: c.accentDim }}>
              {isUrdu ? 'اس باب میں آپ سیکھیں گے' : 'What You Will Learn'}
            </h3>
            <div className={`grid gap-1.5 ${section.steps.length > 4 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {section.steps.map((step, idx) => (
                <div key={idx} className={`flex items-start gap-2 text-sm ${isUrdu ? 'flex-row-reverse text-right' : ''}`} style={{ color: c.textMuted }}>
                  <span className="text-[10px] font-bold tabular-nums mt-0.5 shrink-0" style={{ color: c.accent }}>{idx + 1}.</span>
                  <span>{t(step.title, lang)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Concepts First */}
        {section.concepts && section.concepts.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ fontFamily: font, color: c.accent }}>
              <GraduationCap className="w-4 h-4" />
              {isUrdu ? 'پہلے یہ تصورات سمجھیں' : 'Understand These Concepts First'}
            </h3>
            {section.concepts.map((concept, i) => <ConceptBox key={i} concept={concept} lang={lang} c={c} font={font} />)}
          </div>
        )}

        <Ornament c={c} />

        {/* Step-by-Step */}
        <div className="mb-8">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-6" style={{ color: c.accentDim }}>
            {isUrdu ? 'مرحلہ وار گائیڈ' : 'Step-by-Step Guide'}
          </h3>
          <div className="space-y-0">
            {section.steps.map((step, idx) => (
              <div key={idx} className={`flex gap-5 ${isUrdu ? 'flex-row-reverse' : ''}`}>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold transition-colors"
                    style={{
                      background: c.bgElevated,
                      color: c.accent,
                      border: `2px solid ${c.border}`,
                      fontFamily: font,
                    }}>
                    {idx + 1}
                  </div>
                  {idx < section.steps.length - 1 && (
                    <div className="w-px flex-1 my-2" style={{
                      background: c.borderSubtle,
                    }} />
                  )}
                </div>
                <div className={`pb-7 flex-1 ${isUrdu ? 'text-right' : ''}`}>
                  <p className="font-bold mb-1.5" style={{ fontFamily: font, color: c.text }}>{t(step.title, lang)}</p>
                  <p className="leading-[1.9]" style={{ fontFamily: font, color: c.textMuted }}>{t(step.description, lang)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Examples */}
        {section.examples && section.examples.length > 0 && section.examples.map((ex, idx) => (
          <div key={idx} className="mb-8 rounded-lg overflow-hidden" style={{ border: `1px solid ${c.border}`, background: c.bgElevated }}>
            <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom: `1px solid ${c.border}`, background: c.bgSunken }}>
              <FileText className="w-3.5 h-3.5" style={{ color: c.info }} />
              <span className="text-sm font-semibold" style={{ color: c.info, fontFamily: font }}>
                {t(ex.label, lang)}
              </span>
            </div>
            <div className="p-5">
              <div className="space-y-2">
                {ex.fields.map((f, fi) => (
                  <div key={fi} className={`flex items-baseline gap-4 text-sm ${isUrdu ? 'flex-row-reverse' : ''}`}>
                    <span className="min-w-[120px] text-xs uppercase tracking-wider" style={{ color: c.textFaint }}>{t(f.name, lang)}</span>
                    <span className="font-mono font-semibold text-sm" style={{ color: c.info }}>{f.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Tips */}
        {section.tips && section.tips.length > 0 && (
          <div className="mb-8 rounded-lg p-5" style={{ borderLeft: isUrdu ? 'none' : `3px solid ${c.success}`, borderRight: isUrdu ? `3px solid ${c.success}` : 'none', background: c.bgElevated }}>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4" style={{ color: c.success }} />
              <span className="text-sm font-bold" style={{ color: c.success, fontFamily: font }}>{isUrdu ? 'ماہرانہ مشورے' : 'Pro Tips'}</span>
            </div>
            <div className="space-y-3">
              {section.tips.map((tip, i) => (
                <div key={i} className={`flex items-start gap-3 ${isUrdu ? 'flex-row-reverse text-right' : ''}`}>
                  <ArrowRight className={`w-3.5 h-3.5 shrink-0 mt-1.5 ${isUrdu ? 'rotate-180' : ''}`} style={{ color: c.success }} />
                  <p className="leading-[1.8]" style={{ fontFamily: font, color: c.textMuted }}>{t(tip, lang)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {section.warnings && section.warnings.length > 0 && (
          <div className="mb-8 rounded-lg p-5" style={{ borderLeft: isUrdu ? 'none' : `3px solid ${c.warning}`, borderRight: isUrdu ? `3px solid ${c.warning}` : 'none', background: c.bgElevated }}>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4" style={{ color: c.warning }} />
              <span className="text-sm font-bold" style={{ color: c.warning, fontFamily: font }}>{isUrdu ? 'اہم تنبیہ' : 'Important Warning'}</span>
            </div>
            <div className="space-y-3">
              {section.warnings.map((w, i) => (
                <div key={i} className={`flex items-start gap-3 ${isUrdu ? 'flex-row-reverse text-right' : ''}`}>
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-1.5" style={{ color: c.warning, opacity: 0.6 }} />
                  <p className="leading-[1.8]" style={{ fontFamily: font, color: c.textMuted }}>{t(w, lang)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Chapters */}
        {related.length > 0 && (
          <>
            <Ornament c={c} />
            <div className="mb-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-4 flex items-center gap-2" style={{ color: c.accentDim }}>
                <Link2 className="w-3.5 h-3.5" />
                {isUrdu ? 'متعلقہ ابواب' : 'Related Chapters'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {related.map((rel) => {
                  const relIdx = guideSections.indexOf(rel)
                  const pageIdx = tocEntries.findIndex((e) => e.type === 'chapter' && e.sectionIdx === relIdx)
                  const RelIcon = rel.icon
                  return (
                    <button
                      key={rel.id}
                      onClick={() => navigateTo(pageIdx)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all hover:opacity-80"
                      style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}
                    >
                      <RelIcon className="w-3.5 h-3.5" style={{ color: c.textMuted }} />
                      <span style={{ fontFamily: font, color: c.text }}>{t(rel.title, lang)}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  /* ══════════════════════════════════════════════════════════
     RENDER LAYOUT
     ══════════════════════════════════════════════════════════ */

  return (
    <TooltipProvider delayDuration={300}>
      <style>{`
        @keyframes pageEnter {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .page-enter { animation: pageEnter 0.3s ease-out; }
        .guide-scroll::-webkit-scrollbar { width: 6px; }
        .guide-scroll::-webkit-scrollbar-track { background: transparent; }
        .guide-scroll::-webkit-scrollbar-thumb { background: ${c.borderSubtle}; border-radius: 3px; }
        .guide-scroll::-webkit-scrollbar-thumb:hover { background: ${c.border}; }
        .toc-scroll::-webkit-scrollbar { width: 4px; }
        .toc-scroll::-webkit-scrollbar-track { background: transparent; }
        .toc-scroll::-webkit-scrollbar-thumb { background: ${c.borderSubtle}; border-radius: 2px; }
      `}</style>

      <div className={`relative flex -m-6 overflow-hidden ${isUrdu ? 'font-urdu' : ''}`} style={{ background: c.bg, color: c.text, zoom: fontSize / 15, fontFamily: font, height: `calc(100% + 3rem)` }}>

        {/* ══════ LEFT: Table of Contents ══════ */}
        <aside
          className={`${tocCollapsed ? 'w-0 opacity-0 pointer-events-none' : 'w-[310px]'} shrink-0 flex flex-col overflow-hidden transition-all duration-300`}
          style={{ background: c.bgSunken, borderRight: `1px solid ${c.border}` }}
        >
          {/* TOC Header */}
          <div className="px-4 pt-5 pb-3 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookMarked className="w-4 h-4" style={{ color: c.accent }} />
                <span className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: c.accent }}>
                  {isUrdu ? 'فہرست مضامین' : 'Contents'}
                </span>
              </div>
              <span className="text-[9px] tabular-nums" style={{ color: c.textFaint }}>{readingProgress}%</span>
            </div>
            {/* Progress bar */}
            <div className="h-0.5 rounded-full mb-3" style={{ background: c.border }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${readingProgress}%`, background: c.accent }} />
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: c.textFaint }} />
              <Input
                ref={searchRef}
                placeholder={isUrdu ? 'تلاش... (/)' : 'Search... (/)'}
                value={tocSearch}
                onChange={(e) => setTocSearch(e.target.value)}
                className="pl-8 h-9 text-sm border-none focus-visible:ring-1"
                style={{ background: c.bgElevated, color: c.text }}
              />
            </div>
          </div>

          {/* TOC Scrollable List */}
          <div className="flex-1 overflow-y-auto toc-scroll px-2 pb-4">
            {/* Introduction */}
            <button
              onClick={() => navigateTo(0)}
              className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium mb-2 transition-all flex items-center gap-2 ${
                currentPage === 0 ? '' : 'opacity-50 hover:opacity-75'
              }`}
              style={currentPage === 0 ? { background: c.bgElevated, color: c.accent } : { color: c.text }}
            >
              <BookMarked className="w-3 h-3 shrink-0" />
              <span style={{ fontFamily: font }}>{isUrdu ? 'تعارف' : 'Introduction'}</span>
            </button>

            {/* Workflow Parts */}
            <div className="mb-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] px-3 block mb-1" style={{ color: c.textFaint }}>
                {isUrdu ? 'ورک فلو' : 'Workflow'}
              </span>
              {workflowPhases.map((phase, idx) => {
                const pageIdx = tocEntries.findIndex((e) => e.type === 'phase' && e.phaseIdx === idx)
                const isActive = currentPage === pageIdx
                const isVisited = visited.has(pageIdx)
                const PhIcon = phase.icon
                return (
                  <button
                    key={phase.id}
                    onClick={() => navigateTo(pageIdx)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all flex items-center gap-2 ${
                      isActive ? 'font-semibold' : isVisited ? 'opacity-60 hover:opacity-80' : 'opacity-40 hover:opacity-65'
                    }`}
                    style={isActive ? { background: c.bgElevated, color: c.accent } : { color: c.text }}
                  >
                    <span className="text-xs w-3 shrink-0 tabular-nums" style={{ fontFamily: font, color: c.textFaint }}>{idx + 1}</span>
                    <PhIcon className="w-3.5 h-3.5 shrink-0" style={{ color: c.textMuted }} />
                    <span className="truncate" style={{ fontFamily: font }}>{t(phase.title, lang)}</span>
                    {isVisited && !isActive && <div className="w-1 h-1 rounded-full shrink-0 ml-auto" style={{ background: c.accent }} />}
                  </button>
                )
              })}
            </div>

            {/* Module Chapters grouped by category */}
            {categoryOrder.map((cat) => {
              const meta = categoryMeta[cat]
              const sections = filteredSections.filter((s) => s.category === cat)
              if (sections.length === 0) return null
              const isCollapsed = collapsedCategories.has(cat)
              return (
                <div key={cat} className="mb-3">
                  <button
                    onClick={() => toggleCategory(cat)}
                    className="flex items-center gap-1.5 w-full px-3 py-1 text-left group"
                  >
                    <ChevronDown className={`w-3 h-3 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} style={{ color: c.textFaint }} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: meta.color }}>
                      {isUrdu ? meta.ur : meta.en}
                    </span>
                    <span className="text-[10px] ml-auto" style={{ color: c.textFaint }}>{sections.length}</span>
                  </button>
                  {!isCollapsed && sections.map((section) => {
                    const sectionIdx = guideSections.indexOf(section)
                    const pageIdx = tocEntries.findIndex((e) => e.type === 'chapter' && e.sectionIdx === sectionIdx)
                    const isActive = currentPage === pageIdx
                    const isVisited = visited.has(pageIdx)
                    const isBookmarked = bookmarks.has(pageIdx)
                    const Icon = section.icon
                    return (
                      <button
                        key={section.id}
                        onClick={() => navigateTo(pageIdx)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all flex items-center gap-2 ${
                          isActive ? 'font-semibold' : isVisited ? 'opacity-60 hover:opacity-80' : 'opacity-40 hover:opacity-65'
                        }`}
                        style={isActive ? { background: c.bgElevated, color: meta.color } : { color: c.text }}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: c.textMuted }} />
                        <span className="truncate" style={{ fontFamily: font }}>{t(section.title, lang)}</span>
                        <div className="flex items-center gap-1 ml-auto shrink-0">
                          {isBookmarked && <Bookmark className="w-2.5 h-2.5" style={{ color: c.accent, fill: c.accent }} />}
                          {isVisited && !isActive && !isBookmarked && <div className="w-1 h-1 rounded-full" style={{ background: meta.color }} />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </aside>

        {/* ══════ SPINE ══════ */}
        {!tocCollapsed && (
          <div className="w-[3px] shrink-0" style={{
            background: `linear-gradient(to bottom, transparent, ${c.accent}, transparent)`,
            opacity: 0.3,
          }} />
        )}

        {/* ══════ TOC Toggle (when collapsed) ══════ */}
        {tocCollapsed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setTocCollapsed(false)}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-6 h-14 rounded-r-md transition-opacity hover:opacity-100 opacity-60"
                style={{ background: c.bgElevated, borderRight: `1px solid ${c.border}`, borderTop: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}` }}
              >
                <ChevronRight className="w-4 h-4" style={{ color: c.accent }} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {isUrdu ? 'فہرست دکھائیں' : 'Show contents'}
            </TooltipContent>
          </Tooltip>
        )}

        {/* ══════ RIGHT: Reading Pane ══════ */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Reading Toolbar */}
          <div className="flex items-center justify-between px-5 py-2 shrink-0" style={{
            borderBottom: `1px solid ${c.border}`,
            background: c.bgSunken,
          }}>
            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setTocCollapsed(!tocCollapsed)}
                    className="p-1.5 rounded-md transition-colors hover:opacity-70"
                  >
                    <BookOpen className="w-4 h-4" style={{ color: c.textFaint }} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {tocCollapsed ? 'Show contents' : 'Hide contents'}
                </TooltipContent>
              </Tooltip>
              <span className="text-[10px] tabular-nums" style={{ fontFamily: font, color: c.textFaint }}>
                {currentPage + 1} / {totalPages}
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => toggleBookmark(currentPage)}
                    className="p-1.5 rounded-md transition-colors hover:opacity-70"
                  >
                    <Bookmark
                      className="w-3.5 h-3.5 transition-colors"
                      style={bookmarks.has(currentPage) ? { color: c.accent, fill: c.accent } : { color: c.textFaint }}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {bookmarks.has(currentPage) ? 'Remove bookmark (B)' : 'Bookmark this page (B)'}
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="flex items-center gap-2">
              {/* Font Size */}
              <div className="flex items-center rounded-md" style={{ border: `1px solid ${c.border}` }}>
                <button onClick={() => setFontSize((s) => Math.max(12, s - 1))} disabled={fontSize <= 12}
                  className="px-2 py-1 transition-colors hover:opacity-70 disabled:opacity-20">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-[10px] w-6 text-center tabular-nums" style={{ color: c.textFaint }}>{fontSize}</span>
                <button onClick={() => setFontSize((s) => Math.min(22, s + 1))} disabled={fontSize >= 22}
                  className="px-2 py-1 transition-colors hover:opacity-70 disabled:opacity-20">
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Language Toggle */}
              <button
                onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors hover:opacity-70"
                style={{ border: `1px solid ${c.border}` }}
              >
                <Languages className="w-3.5 h-3.5" style={{ color: c.textFaint }} />
                <span className="text-xs font-medium" style={{ color: c.text }}>{lang === 'en' ? 'اردو' : 'English'}</span>
              </button>
            </div>
          </div>

          {/* Reading Area */}
          <div
            ref={readingRef}
            className="flex-1 overflow-y-auto guide-scroll"
            dir={isUrdu ? 'rtl' : 'ltr'}
          >
            <div className="max-w-2xl mx-auto px-12 py-10">
              {renderPage()}
            </div>
          </div>

          {/* Page Navigation */}
          <div className="flex items-center justify-between px-5 py-3 shrink-0" style={{
            borderTop: `1px solid ${c.border}`,
            background: c.bgSunken,
          }}>
            <button
              onClick={() => navigateTo(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs transition-all disabled:opacity-15 hover:opacity-70 max-w-[200px]"
              style={{ border: `1px solid ${c.border}`, color: c.text }}
            >
              <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate" style={{ color: c.textMuted }}>{currentPage > 0 ? getPageLabel(currentPage - 1) : (isUrdu ? 'پچھلا' : 'Previous')}</span>
            </button>

            <div className="text-center">
              <span className="text-[9px] uppercase tracking-[0.2em]" style={{ fontFamily: font, color: c.textFaint }}>
                {currentEntry?.type === 'intro' && (isUrdu ? 'تعارف' : 'Introduction')}
                {currentEntry?.type === 'phase' && `${isUrdu ? 'حصہ' : 'Part'} ${currentEntry.phaseIdx + 1}`}
                {currentEntry?.type === 'chapter' && `${isUrdu ? 'باب' : 'Ch.'} ${currentEntry.sectionIdx + 1}`}
              </span>
              <div className="text-[9px] mt-0.5 flex items-center justify-center gap-1" style={{ color: c.textFaint }}>
                <span className="font-mono">&#8592; &#8594;</span>
              </div>
            </div>

            <button
              onClick={() => navigateTo(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage >= totalPages - 1}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs transition-all disabled:opacity-15 hover:opacity-70 max-w-[200px]"
              style={{ border: `1px solid ${c.border}`, color: c.text }}
            >
              <span className="truncate" style={{ color: c.textMuted }}>{currentPage < totalPages - 1 ? getPageLabel(currentPage + 1) : (isUrdu ? 'اگلا' : 'Next')}</span>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
