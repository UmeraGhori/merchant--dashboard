# 🍽️ Merchant Dashboard

A full-stack multi-store merchant dashboard built with Next.js, Tailwind CSS, shadcn/ui, and Supabase.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, Server Components) |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui (Radix UI primitives) |
| Auth | Supabase Auth |
| Database | Supabase / PostgreSQL with RLS |
| Validation | Zod + React Hook Form |
| Type Safety | TypeScript |

---

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/           # Protected layout group
│   │   ├── layout.tsx         # Auth guard + sidebar
│   │   ├── stores/
│   │   │   ├── page.tsx       # Stores list
│   │   │   └── [storeId]/
│   │   │       ├── products/page.tsx
│   │   │       └── orders/page.tsx
│   │   └── orders/page.tsx    # All orders across all stores
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── actions/               # Next.js Server Actions
│       ├── auth.ts
│       ├── stores.ts
│       ├── products.ts
│       └── orders.ts
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── layout/Sidebar.tsx
│   ├── auth/                  # LoginForm, SignupForm
│   ├── stores/                # StoreCard, StoreForm, dialogs
│   ├── products/              # ProductsTable, ProductForm, dialogs
│   └── orders/                # OrdersTable, OrderStats
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # Browser client
│   │   ├── server.ts          # Server client
│   │   └── middleware.ts      # Session refresh
│   └── utils.ts
├── types/index.ts
└── middleware.ts              # Route protection

supabase/
├── migrations/
│   ├── 001_initial_schema.sql # Tables, RLS, triggers, functions
│   └── 002_seed_data.sql      # Demo merchants, stores, products, orders
└── seed/
    └── create_auth_users.sql  # Demo auth users
```

---


### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Demo Credentials

| Email | Password | Data |
|---|---|---|
| demo-a@merchant.com | demo1234 | 2 stores, 6 products, 5 orders |

---

## Features

### Authentication
- Sign up with name, email, password (Zod validated)
- Sign in / Sign out via Supabase Auth
- Middleware-based route protection (redirect to `/login` if unauthenticated)
- Authenticated users redirected away from auth pages

### Store Management
- View all stores in a responsive card grid
- Create store with full validation (name, street, city, state, ZIP, phone, timezone)
- Edit store information via pre-filled dialog
- Activate / Deactivate store with confirmation dialog
- Delete store permanently with confirmation
- Store cards show live product and order counts

### Product Management
- View products in a clean table per store
- Add product with name, description, price (min $0.01), availability toggle
- Edit product via pre-filled dialog
- Remove product with confirmation dialog
- Click availability badge to toggle inline

### Order Management
- View orders per store with status filter tabs
- View all orders across all stores grouped by store
- Filter orders by status — persisted in URL (`?status=pending`)
- Expandable order rows showing items, quantities, customer info
- Update order status: pending → confirmed → preparing → ready → delivered / cancelled
- Order stats strip showing counts and revenue

---

## Database Schema

```
auth.users (Supabase managed)
  └── stores (merchant_id → auth.users.id)
        └── products (store_id → stores.id)
        └── orders  (store_id → stores.id)
              └── order_items (order_id → orders.id)
```

### Triggers & Functions

| Name | Purpose |
|---|---|
| `handle_updated_at()` | Auto-updates `updated_at` timestamp on all tables before every update |
| `set_product_merchant_id()` | Auto-sets `merchant_id` on products from the parent store — prevents client spoofing |
| `set_order_merchant_id()` | Auto-sets `merchant_id` on orders from the parent store — prevents client spoofing |

---

## Design Choices

### Scalability

The application uses Next.js Server Components for data fetching, meaning pages render on the server and only send HTML to the client — reducing browser load regardless of data size. Supabase handles database connection pooling automatically, so the app can support many concurrent merchants without managing connections manually.

The database schema uses UUIDs as primary keys instead of sequential integers, which avoids ID conflicts if the system ever needs to be distributed or merged. All data queries use server-side Supabase filters with `.eq()` rather than fetching all rows and filtering in JavaScript — so performance stays consistent even as order and product volumes grow.

Proper indexes are defined on `merchant_id`, `store_id`, and `status` columns so queries remain fast as the dataset scales. Adding new stores or products for any merchant does not affect other merchants' query performance due to this indexing strategy.

The Next.js App Router route group `(dashboard)` keeps the protected layout shared across all dashboard pages without affecting URL structure, making it straightforward to add new pages in future without restructuring the project.

### Security

The most critical security decision was enabling **Row Level Security (RLS)** on every table in PostgreSQL. RLS means that even if application code has a bug and forgets to filter by merchant, the database itself will never return another merchant's data — security is enforced at the lowest possible layer, independent of application logic.

Every RLS policy checks `auth.uid()` against the `merchant_id` column for select, insert, update, and delete operations — so each merchant is completely isolated at the database level. On top of RLS, every Server Action explicitly filters by the authenticated user's ID as a second layer of protection (defense in depth).

Authentication uses Supabase Auth with JWT tokens — passwords are never stored in plain text and token verification happens server-side. The `merchant_id` on products and orders is set automatically by a **database trigger** rather than trusting the client to send the correct value — this prevents spoofing attacks where a malicious user could assign their products to another merchant's store.

Route protection is handled in Next.js middleware so unauthenticated users are redirected before any page code or data fetching runs. All data mutations go through **Server Actions** rather than client-side API calls, keeping sensitive logic on the server and preventing direct database access from the browser.

### Business Rules

The core business rule — **merchants can only access their own stores and products** — is enforced at three independent layers:

1. **Middleware** redirects unauthenticated users before any page loads
2. **Server Actions** re-verify the authenticated user on every mutation and filter all queries by `merchant_id`
3. **RLS policies** at the database level provide the final guarantee — no query can succeed without matching `auth.uid()`

This defense-in-depth approach means no single point of failure can expose cross-merchant data. The seed data intentionally creates two separate merchants with separate stores and products to demonstrate and verify that data isolation works correctly — logging in as one merchant shows absolutely no data belonging to the other.

Order items snapshot the `product_name` and `unit_price` at the time of order creation. This means historical orders remain accurate and unchanged even if a merchant later edits or deletes a product — preserving the integrity of order history as a business record.

---

## API / Data Flow

```
Browser
  └── Next.js Server Component (page.tsx)
        └── Supabase Server Client
              └── PostgreSQL (RLS enforced)
                    └── Returns only merchant's own data

Browser form submit
  └── Next.js Server Action (actions/*.ts)
        └── auth.getUser() — verify session
        └── Supabase query with .eq('merchant_id', user.id)
              └── PostgreSQL (RLS as final guard)
                    └── revalidatePath() — refresh UI
```
