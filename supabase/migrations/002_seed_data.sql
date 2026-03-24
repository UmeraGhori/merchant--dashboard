do $$
declare
  -- Merchant A
  merchant_a_id  uuid := '11111111-1111-1111-1111-111111111111';
 
  -- Stores
  store_downtown  uuid;
  store_westside  uuid;
  store_eastbay   uuid;

  -- Products store 1
  p_burger     uuid;
  p_wrap       uuid;
  p_fries      uuid;
  p_shake      uuid;

  -- Products store 2
  p_avocado    uuid;
  p_acai       uuid;

  -- Products store 3
  p_ramen      uuid;
  p_gyoza      uuid;

begin

  -- ─── Stores ───────────────────────────────────────────────
  insert into public.stores (id, merchant_id, name, street, city, state, zip_code, phone, timezone, is_active)
  values (gen_random_uuid(), merchant_a_id, 'Downtown Bites', '123 Main St', 'New York', 'NY', '10001', '+1 212-555-0101', 'America/New_York', true)
  returning id into store_downtown;

  insert into public.stores (id, merchant_id, name, street, city, state, zip_code, phone, timezone, is_active)
  values (gen_random_uuid(), merchant_a_id, 'Westside Kitchen', '456 Oak Ave', 'Los Angeles', 'CA', '90028', '+1 323-555-0202', 'America/Los_Angeles', true)
  returning id into store_westside;

  insert into public.stores (id, merchant_id, name, street, city, state, zip_code, phone, timezone, is_active)
  values (gen_random_uuid(), merchant_b_id, 'East Bay Ramen', '789 Bay Blvd', 'Oakland', 'CA', '94601', '+1 510-555-0303', 'America/Los_Angeles', true)
  returning id into store_eastbay;

  -- ─── Products: Downtown Bites ─────────────────────────────
  insert into public.products (merchant_id, store_id, name, description, price, is_available)
  values (merchant_a_id, store_downtown, 'Classic Burger',    'Beef patty, lettuce, tomato, special sauce',        12.99, true)
  returning id into p_burger;

  insert into public.products (merchant_id, store_id, name, description, price, is_available)
  values (merchant_a_id, store_downtown, 'Veggie Wrap',       'Grilled veggies, hummus, feta in a warm wrap',      10.49, true)
  returning id into p_wrap;

  insert into public.products (merchant_id, store_id, name, description, price, is_available)
  values (merchant_a_id, store_downtown, 'Truffle Fries',     'Crispy fries with truffle oil and parmesan',         6.99, true)
  returning id into p_fries;

  insert into public.products (merchant_id, store_id, name, description, price, is_available)
  values (merchant_a_id, store_downtown, 'Chocolate Shake',   'Rich chocolate milkshake with whipped cream',        5.49, false)
  returning id into p_shake;

  -- ─── Products: Westside Kitchen ──────────────────────────
  insert into public.products (merchant_id, store_id, name, description, price, is_available)
  values (merchant_a_id, store_westside, 'Avocado Toast',     'Sourdough, smashed avocado, poached egg, chilli',   11.99, true)
  returning id into p_avocado;

  insert into public.products (merchant_id, store_id, name, description, price, is_available)
  values (merchant_a_id, store_westside, 'Acai Bowl',         'Frozen acai, banana, granola, fresh berries',        9.99, true)
  returning id into p_acai;

  -- ─── Orders: Downtown Bites ───────────────────────────────
  declare
    o1 uuid; o2 uuid; o3 uuid; o4 uuid; o5 uuid;
  begin
    insert into public.orders (merchant_id, store_id, customer_name, customer_email, customer_phone, status, total_amount)
    values (merchant_a_id, store_downtown, 'Alice Johnson', 'alice@example.com', '+1 555-1001', 'pending',   26.97) returning id into o1;
    insert into public.order_items (order_id, product_id, product_name, quantity, unit_price)
    values (o1, p_burger, 'Classic Burger', 1, 12.99), (o1, p_fries, 'Truffle Fries', 2, 6.99);

    insert into public.orders (merchant_id, store_id, customer_name, customer_email, customer_phone, status, total_amount)
    values (merchant_a_id, store_downtown, 'Bob Smith', 'bob@example.com', '+1 555-1002', 'confirmed', 23.48) returning id into o2;
    insert into public.order_items (order_id, product_id, product_name, quantity, unit_price)
    values (o2, p_wrap, 'Veggie Wrap', 2, 10.49), (o2, p_shake, 'Chocolate Shake', 1, 5.49) ; -- note: shake unavailable but order was placed before status changed

    insert into public.orders (merchant_id, store_id, customer_name, customer_email, customer_phone, status, total_amount)
    values (merchant_a_id, store_downtown, 'Carol Davis', 'carol@example.com', '+1 555-1003', 'preparing', 19.98) returning id into o3;
    insert into public.order_items (order_id, product_id, product_name, quantity, unit_price)
    values (o3, p_burger, 'Classic Burger', 1, 12.99), (o3, p_fries, 'Truffle Fries', 1, 6.99);

    insert into public.orders (merchant_id, store_id, customer_name, customer_email, customer_phone, status, total_amount)
    values (merchant_a_id, store_downtown, 'Dan Lee', 'dan@example.com', '+1 555-1004', 'delivered', 25.98) returning id into o4;
    insert into public.order_items (order_id, product_id, product_name, quantity, unit_price)
    values (o4, p_burger, 'Classic Burger', 2, 12.99);

    insert into public.orders (merchant_id, store_id, customer_name, customer_email, customer_phone, status, total_amount)
    values (merchant_a_id, store_downtown, 'Eva Martinez', 'eva@example.com', '+1 555-1005', 'cancelled', 10.49) returning id into o5;
    insert into public.order_items (order_id, product_id, product_name, quantity, unit_price)
    values (o5, p_wrap, 'Veggie Wrap', 1, 10.49);
  end;
  
$$;
