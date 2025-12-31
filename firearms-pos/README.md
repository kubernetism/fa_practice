# Firearms POS & Inventory Management System

A desktop application for firearms retail businesses featuring inventory management, point of sale, and business settings.

## Features

- **Inventory Management** - Track firearms, ammunition, and accessories
- **Point of Sale** - Process sales with tax calculations and payment methods
- **Customer Management** - Track customers and firearm licenses
- **Branch Support** - Multi-branch management with branch-specific settings
- **Business Settings** - Configure tax, currency, receipts, and more
- **Audit Logs** - Track all system activities
- **Reports** - Sales, inventory, profit/loss, and more

## Tech Stack

- **Electron** - Desktop application framework
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Drizzle ORM** - Database management
- **SQLite** - Local database
- **Tailwind CSS** - Styling
- **Vite** - Build tool

## Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- For Windows builds: Windows with .NET SDK (for electron-builder)

## Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## Database Commands

```bash
# Generate migration files after schema changes
pnpm db:generate

# Run migrations
pnpm db:migrate

# Open Drizzle Studio (database GUI)
pnpm db:studio
```

## Building for Production

### Linux

```bash
# Build for Linux (AppImage and .deb)
pnpm dist:linux

# Output will be in: release/
```

### Windows

```bash
# Build for Windows (NSIS installer and Portable)
pnpm dist:win

# Output will be in: release/
```

### macOS

```bash
# Build for macOS (DMG and ZIP)
pnpm dist:mac

# Output will be in: release/
```

### Build All Platforms

```bash
# Build for all platforms
pnpm dist

# Output will be in: release/
```

## Default Login

- **Username:** `admin`
- **Password:** `admin123`

## Project Structure

```
firearms-pos/
├── src/
│   ├── main/           # Electron main process
│   │   ├── db/         # Database schema and migrations
│   │   ├── ipc/        # IPC handlers
│   │   └── utils/      # Utility functions
│   ├── preload/        # Preload scripts
│   ├── renderer/       # React UI
│   │   ├── components/ # Reusable UI components
│   │   ├── contexts/   # React contexts
│   │   ├── screens/    # Page components
│   │   └── routes.tsx  # Route definitions
│   └── shared/         # Shared types
├── drizzle/            # Database migrations
├── resources/          # Icons and assets
└── out/                # Built output
```

## License

MIT
