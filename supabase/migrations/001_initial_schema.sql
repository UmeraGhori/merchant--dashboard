-- ─── Extensions ─────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- Stores: each merchant can have multiple stores
create table if not exists public.stores (
  id          uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references auth.users(id) on delete cascade,
  name        text not null check (char_length(name) between 2 and 255),
  street      text not null check (char_length(street) > 0),
  city        text not null check (char_length(city) > 0),
  state       text not null check (char_length(state) > 0),
  zip_code    text not null check (char_length(zip_code) > 0),
  phone       text not null check (char_length(phone) > 0),
  timezone    text not null default 'America/New_York',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Products: scoped to a store
create table if not exists public.products (
  id           uuid primary key default gen_random_uuid(),
  store_id     uuid not null references public.stores(id) on delete cascade,
  merchant_id  uuid not null references auth.users(id) on delete cascade,
  name         text not null check (char_length(name) between 1 and 255),
  description  text,
  price        numeric(10,2) not null check (price >= 0),
  is_available boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Orders: placed against a store
create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  store_id        uuid not null references public.stores(id) on delete cascade,
  merchant_id     uuid not null references auth.users(id) on delete cascade,
  customer_name   text not null check (char_length(customer_name) > 0),
  customer_email  text,
  customer_phone  text,
  status          text not null default 'pending'
                    check (status in ('pending','confirmed','preparing','ready','delivered','cancelled')),
  total_amount    numeric(10,2) not null default 0 check (total_amount >= 0),
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Order line items — snapshot product name/price at time of order
create table if not exists public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  product_id   uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity     integer not null check (quantity > 0),
  unit_price   numeric(10,2) not null check (unit_price >= 0),
  created_at   timestamptz not null default now()
);

-- ─── Indexes ────────────────────────────────────────────────
create index if not exists idx_stores_merchant_id    on public.stores(merchant_id);
create index if not exists idx_products_store_id     on public.products(store_id);
create index if not exists idx_products_merchant_id  on public.products(merchant_id);
create index if not exists idx_orders_store_id       on public.orders(store_id);
create index if not exists idx_orders_merchant_id    on public.orders(merchant_id);
create index if not exists idx_orders_status         on public.orders(status);
create index if not exists idx_order_items_order_id  on public.order_items(order_id);

-- ─── updated_at trigger ─────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger stores_updated_at
  before update on public.stores
  for each row execute function public.handle_updated_at();

create trigger products_updated_at
  before update on public.products
  for each row execute function public.handle_updated_at();

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.handle_updated_at();

-- ─── Function: auto-set merchant_id on products ─────────────
-- Ensures merchant_id on products always matches parent store's merchant_id
create or replace function public.set_product_merchant_id()
returns trigger
language plpgsql
security definer
as $$
begin
  select merchant_id into new.merchant_id
  from public.stores
  where id = new.store_id;
  return new;
end;
$$;

create trigger products_set_merchant_id
  before insert on public.products
  for each row execute function public.set_product_merchant_id();

-- ─── Function: auto-set merchant_id on orders ───────────────
create or replace function public.set_order_merchant_id()
returns trigger
language plpgsql
security definer
as $$
begin
  select merchant_id into new.merchant_id
  from public.stores
  where id = new.store_id;
  return new;
end;
$$;

create trigger orders_set_merchant_id
  before insert on public.orders
  for each row execute function public.set_order_merchant_id();

-- ─── Row Level Security ─────────────────────────────────────
alter table public.stores      enable row level security;
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- STORES: merchant sees and manages only their own stores
create policy "stores: merchant select own"
  on public.stores for select
  using (merchant_id = auth.uid());

create policy "stores: merchant insert own"
  on public.stores for insert
  with check (merchant_id = auth.uid());

create policy "stores: merchant update own"
  on public.stores for update
  using (merchant_id = auth.uid())
  with check (merchant_id = auth.uid());

create policy "stores: merchant delete own"
  on public.stores for delete
  using (merchant_id = auth.uid());

-- PRODUCTS: merchant sees and manages only products in their stores
create policy "products: merchant select own"
  on public.products for select
  using (merchant_id = auth.uid());

create policy "products: merchant insert own"
  on public.products for insert
  with check (
    merchant_id = auth.uid()
    and exists (
      select 1 from public.stores
      where id = store_id and merchant_id = auth.uid()
    )
  );

create policy "products: merchant update own"
  on public.products for update
  using (merchant_id = auth.uid())
  with check (merchant_id = auth.uid());

create policy "products: merchant delete own"
  on public.products for delete
  using (merchant_id = auth.uid());

-- ORDERS: merchant sees and manages only orders in their stores
create policy "orders: merchant select own"
  on public.orders for select
  using (merchant_id = auth.uid());

create policy "orders: merchant insert own"
  on public.orders for insert
  with check (
    merchant_id = auth.uid()
    and exists (
      select 1 from public.stores
      where id = store_id and merchant_id = auth.uid()
    )
  );

create policy "orders: merchant update own"
  on public.orders for update
  using (merchant_id = auth.uid())
  with check (merchant_id = auth.uid());

-- ORDER ITEMS: accessible if the parent order belongs to the merchant
create policy "order_items: merchant select own"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where id = order_id and merchant_id = auth.uid()
    )
  );

create policy "order_items: merchant insert own"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where id = order_id and merchant_id = auth.uid()
    )
  );
