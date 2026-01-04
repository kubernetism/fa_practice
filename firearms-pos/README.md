# Firearms POS & Inventory Management System

A comprehensive desktop application for firearms retail businesses featuring inventory management, point of sale, customer tracking, and financial management.

## Features

### Point of Sale
- **Quick Sales** - Fast checkout with barcode/product code scanning
- **POS Tabs** - Multiple open tabs for handling multiple customers simultaneously
- **Payment Methods** - Cash, Card, Debit Card, Mobile, Credit, Mixed, COD, Pay Later (Receivable)
- **Partial Payments** - Accept partial payments with automatic receivable creation
- **Tax Calculations** - Automatic tax calculation based on product settings
- **Discounts** - Apply discounts at item or sale level
- **Receipt Generation** - Automatic PDF receipt generation

### Inventory Management
- **Product Catalog** - Manage firearms, ammunition, and accessories
- **Serial Number Tracking** - Track individual firearms by serial number
- **Stock Management** - Real-time inventory levels per branch
- **Low Stock Alerts** - Notifications for items below threshold
- **Purchase Orders** - Track purchases from suppliers
- **Returns** - Handle customer returns and inventory adjustments

### Customer Management
- **Customer Database** - Store customer information
- **Firearm License Tracking** - Track license numbers and expiry dates
- **License Validation** - Automatic validation during firearm sales
- **Purchase History** - View customer purchase history

### Financial Management
- **Account Receivables** - Track customer debts and payments
- **Account Payables** - Track supplier debts and payments
- **Cash Register** - Daily cash management
- **Chart of Accounts** - Financial account structure
- **Expense Tracking** - Record and categorize expenses
- **Commissions** - Track sales commissions

### Reports & Analytics
- **Sales Reports** - Daily, weekly, monthly sales analysis
- **Inventory Reports** - Stock levels and movement
- **Profit/Loss Reports** - Financial performance tracking
- **Audit Reports** - Detailed transaction logs
- **Aging Reports** - Receivables/Payables aging analysis

### Administration
- **Multi-Branch Support** - Manage multiple store locations
- **User Management** - Create and manage user accounts
- **Role-Based Access Control** - Granular permission management
- **Activity Logs** - Track all user activities
- **Database Viewer** - Direct database access for admins
- **License Management** - Software license configuration
- **Settings** - Business settings, tax rates, receipt customization

## User Roles & Permissions

| Section | Cashier | Manager | Admin |
|---------|---------|---------|-------|
| Dashboard | Yes | Yes | Yes |
| Point of Sale | Yes | Yes | Yes |
| POS Tabs | Yes | Yes | Yes |
| Sales History | Yes | Yes | Yes |
| Products | No | Yes | Yes |
| Inventory | No | Yes | Yes |
| Purchases | No | Yes | Yes |
| Returns | No | Yes | Yes |
| Customers | No | Yes | Yes |
| Suppliers | No | Yes | Yes |
| Expenses | No | Yes | Yes |
| Commissions | No | Yes | Yes |
| Receivables | No | Yes | Yes |
| Payables | No | Yes | Yes |
| Cash Register | No | No | Yes |
| Chart of Accounts | No | No | Yes |
| Users | No | No | Yes |
| Branches | No | No | Yes |
| Reports | No | No | Yes |
| Audit Reports | No | No | Yes |
| Activity Logs | No | No | Yes |
| Settings | No | No | Yes |
| Database Viewer | No | No | Yes |

## Tech Stack

- **Electron** - Desktop application framework
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Drizzle ORM** - Database management
- **SQLite** - Local database (better-sqlite3)
- **Tailwind CSS v4** - Styling
- **Radix UI** - Accessible UI components
- **Vite** - Build tool
- **PDFKit** - Receipt/report generation

## Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- For Windows builds: Windows with .NET SDK (for electron-builder)

## Installation

```bash
# Clone the repository
git clone https://github.com/Gen-AI-Developer/fa_practice.git
cd fa_practice/firearms-pos

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## Scripts

```bash
# Development
pnpm dev              # Start development server with hot reload

# Building
pnpm build            # Build for production
pnpm dist             # Build distributables for all platforms
pnpm dist:win         # Build for Windows (NSIS installer + Portable)
pnpm dist:mac         # Build for macOS (DMG + ZIP)
pnpm dist:linux       # Build for Linux (AppImage + .deb)

# Database
pnpm db:generate      # Generate migration files after schema changes
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio (database GUI)

# Code Quality
pnpm typecheck        # Run TypeScript type checking
pnpm lint             # Run Biome linter
pnpm lint:fix         # Fix linting issues
pnpm format           # Format code with Biome
```

## Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |

## Project Structure

```
firearms-pos/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── db/
│   │   │   ├── index.ts      # Database connection
│   │   │   ├── schema.ts     # Schema exports
│   │   │   └── schemas/      # Table definitions
│   │   ├── ipc/              # IPC handlers
│   │   │   ├── auth-ipc.ts   # Authentication
│   │   │   ├── sales-ipc.ts  # Sales operations
│   │   │   ├── products-ipc.ts
│   │   │   └── ...
│   │   └── utils/            # Utility functions
│   ├── preload/
│   │   └── index.ts          # Preload script (API bridge)
│   ├── renderer/             # React UI
│   │   ├── components/
│   │   │   ├── ui/           # Base UI components (shadcn/ui)
│   │   │   ├── layout/       # Layout components
│   │   │   └── theme/        # Theme components
│   │   ├── contexts/         # React contexts
│   │   │   ├── auth-context.tsx
│   │   │   ├── branch-context.tsx
│   │   │   └── ...
│   │   ├── screens/          # Page components
│   │   │   ├── pos/
│   │   │   ├── sales/
│   │   │   ├── products/
│   │   │   └── ...
│   │   ├── lib/              # Utilities
│   │   ├── routes.tsx        # Route definitions
│   │   └── App.tsx           # App entry
│   └── shared/               # Shared types and constants
├── drizzle/                  # Database migrations
├── resources/                # App icons and assets
├── release/                  # Built distributables
└── out/                      # Compiled output
```

## Database Schema

### Core Tables
- `users` - User accounts and authentication
- `branches` - Store locations
- `products` - Product catalog
- `inventory` - Stock levels per branch
- `customers` - Customer information
- `suppliers` - Supplier information

### Sales Tables
- `sales` - Sale transactions
- `sale_items` - Individual items in sales
- `sales_tabs` - Open POS tabs
- `sales_tab_items` - Items in open tabs

### Financial Tables
- `account_receivables` - Customer debts
- `receivable_payments` - Payments against receivables
- `account_payables` - Supplier debts
- `payable_payments` - Payments against payables
- `expenses` - Business expenses
- `commissions` - Sales commissions

### System Tables
- `audit_logs` - Activity tracking
- `settings` - Application settings
- `licenses` - Software licensing

## Payment Flow

### Standard Sale (Full Payment)
1. Add items to cart
2. Select payment method (Cash/Card)
3. Enter amount paid
4. Sale created with `payment_status: 'paid'`

### Partial Payment
1. Add items to cart
2. Select payment method
3. Enter partial amount
4. Sale created with `payment_status: 'partial'`
5. Receivable automatically created for outstanding balance

### Pay Later (Receivable)
1. Add items to cart
2. Select customer (required)
3. Choose "Pay Later" payment method
4. Sale created with `payment_status: 'pending'`
5. Full amount added to customer's receivables

### Recording Receivable Payment
1. Go to Receivables
2. Find customer's outstanding balance
3. Record payment
4. Both receivable and linked sale are updated automatically

## License

MIT License - See [LICENSE](LICENSE) for details.

## Author

**Syed Safdar Ali Shah**
- Email: programmersafdar@live.com
- GitHub: [@Gen-AI-Developer](https://github.com/Gen-AI-Developer)
