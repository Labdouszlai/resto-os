# RestoOS - Restaurant Management SaaS

A complete, production-quality multi-tenant restaurant management system built with modern web technologies.

## Features

### Core Modules
- **Dashboard** - Real-time analytics with revenue, orders, customers, inventory metrics and interactive charts
- **POS (Point of Sale)** - Full-featured point of sale with table selection, order types, menu browsing, cart management, and payment processing
- **Orders** - Complete order lifecycle management (Draft → Pending → Confirmed → Preparing → Ready → Served → Completed → Cancelled)
- **Tables** - Visual restaurant floor/table management with capacity tracking and status management
- **Reservations** - Calendar-based reservation system with table assignment and status tracking
- **Menu Management** - Categories, menu items, modifiers, pricing, recipes, and ingredient linking
- **Customers** - Customer CRM with order history, spending analytics, and contact management
- **Inventory** - Real-time stock tracking, low-stock alerts, stock movements, and ingredient management
- **Suppliers** - Supplier directory with purchase history and contact management
- **Purchasing** - Purchase order management with automatic inventory updates on receipt
- **Expenses** - Expense tracking by category with financial reporting
- **Employees** - Staff management with roles, branches, and status tracking
- **Reports** - Professional reporting with revenue, sales, product, inventory, expense, and customer analytics
- **Settings** - Restaurant configuration, branch management, and profile settings

### Technical Features
- **Multi-Tenant Architecture** - Complete data isolation between restaurants
- **Role-Based Access Control** - 7 roles (Owner, Admin, Manager, Cashier, Waiter, Kitchen, Accountant) with granular permissions
- **Authentication** - Secure sign-up/sign-in/sign-out with Better Auth
- **Server-Side Validation** - Zod schemas for all forms and API inputs
- **Real-Time Dashboard** - Charts and metrics computed from actual database data
- **Global Search** - Search across customers, orders, menu items, employees, suppliers (Ctrl+K)
- **Notifications** - In-app notification system with real-time unread counts
- **Responsive Design** - Fully responsive across desktop, laptop, tablet, and mobile
- **CSV Export** - Export data from reports and lists

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui |
| Database | PostgreSQL (Supabase) |
| ORM | Drizzle ORM |
| Authentication | Better Auth |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Icons | Lucide React |
| Date Handling | date-fns |

## Architecture

```
resto-os/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Auth pages (sign-in, sign-up, sign-out)
│   │   ├── (dashboard)/     # Dashboard pages (POS, orders, menu, etc.)
│   │   ├── actions/         # Server actions (all business logic)
│   │   ├── api/             # API routes (Better Auth)
│   │   └── layout.tsx       # Root layout
│   ├── components/
│   │   ├── dashboard/       # Dashboard chart components
│   │   ├── layout/          # Sidebar, topbar, search, notifications
│   │   └── ui/              # shadcn/ui components
│   ├── lib/
│   │   ├── auth/            # Better Auth config (server, client)
│   │   ├── db/              # Drizzle schema and connection
│   │   ├── queries/         # Database query functions
│   │   └── validations/     # Zod validation schemas
│   ├── hooks/
│   ├── scripts/             # Seed script
│   └── middleware.ts        # Route protection
└── drizzle/                 # Migration files
```

## Database Schema

28 tables covering all business entities:

| Table | Description |
|-------|-------------|
| users | Authentication users |
| sessions | User sessions |
| accounts | Auth accounts (credentials) |
| verification | Auth verification tokens |
| restaurants | Restaurant organizations |
| branches | Restaurant locations |
| members | User-restaurant-role associations |
| employees | Staff records |
| customers | Customer CRM |
| tables | Restaurant tables |
| reservations | Table reservations |
| menu_categories | Menu organization |
| menu_items | Menu products |
| modifiers | Item modifiers/add-ons |
| menu_item_modifiers | Item-modifier links |
| ingredients | Recipe ingredients |
| recipes | Menu item recipes |
| recipe_items | Recipe ingredient links |
| suppliers | Vendor directory |
| purchase_orders | Purchase order records |
| purchase_order_items | PO line items |
| inventory_movements | Stock movement log |
| orders | Customer orders |
| order_items | Order line items |
| order_item_modifiers | Order item modifiers |
| payments | Payment records |
| expenses | Business expenses |
| notifications | In-app notifications |

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm
- PostgreSQL database (Supabase recommended)

### 1. Clone and Install

```bash
cd resto-os
pnpm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Random secret (min 32 chars)
- `BETTER_AUTH_URL` - Your app URL (default: http://localhost:3000)
- `NEXT_PUBLIC_APP_URL` - Public app URL

### 3. Database Setup

#### Supabase Setup
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → Database → Connection string
3. Copy the URI and paste it as `DATABASE_URL`
4. Use the connection pooler URL for production, direct connection for migrations

#### Run Migrations

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit push
```

#### Seed Demo Data

```bash
pnpm seed
```

This creates:
- 1 demo restaurant ("La Bella Cucina")
- 3 branches
- 25 menu items across 8 categories
- 120+ orders over 30 days
- 30 customers
- 15 employees
- 6 suppliers
- 25 ingredients with recipes
- Full inventory, expenses, reservations, and notifications

### 4. Start Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Login

**Demo Account:**
- Email: `demo@restoos.com`
- Password: `demo1234`

**Or create a new account** at `/sign-up`

## Available Routes

| Route | Description |
|-------|-------------|
| `/sign-in` | Sign in page |
| `/sign-up` | Registration page |
| `/dashboard` | Analytics dashboard |
| `/pos` | Point of Sale |
| `/orders` | Order management |
| `/orders/[id]` | Order detail |
| `/tables` | Table management |
| `/reservations` | Reservation management |
| `/menu` | Menu management |
| `/menu/recipes` | Recipe management |
| `/customers` | Customer CRM |
| `/customers/[id]` | Customer detail |
| `/inventory` | Inventory management |
| `/suppliers` | Supplier management |
| `/suppliers/[id]` | Supplier detail |
| `/purchases` | Purchase orders |
| `/expenses` | Expense tracking |
| `/employees` | Employee management |
| `/reports` | Analytics reports |
| `/settings` | Restaurant settings |

## Role-Based Access Control

| Role | Access Level |
|------|-------------|
| Owner | Full access to everything |
| Admin | Restaurant management, staff, menu, orders, inventory, reports |
| Manager | Orders, menu, inventory, employees, reports |
| Cashier | POS, orders, payments, customers |
| Waiter | Tables, orders, reservations |
| Kitchen | Kitchen orders, order status updates |
| Accountant | Revenue, expenses, payments, reports |

## Deployment

### Vercel

1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

```bash
# Build
pnpm build

# Start production server
pnpm start
```

### Environment Variables for Production

```
DATABASE_URL=your-supabase-connection-string
BETTER_AUTH_SECRET=your-production-secret
BETTER_AUTH_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## Security Notes

- All database queries are filtered by `restaurant_id` for tenant isolation
- Authentication is enforced on all protected routes
- Server-side validation on all inputs using Zod
- No secrets exposed to client-side code
- Session-based authentication with secure cookies
- RBAC enforced both client-side (UI hiding) and server-side (action checks)

## License

Private - All rights reserved.
