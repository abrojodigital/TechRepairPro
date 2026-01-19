-- TechRepairPro Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create custom types
create type repair_status as enum (
  'pending',
  'diagnosed',
  'in_progress',
  'waiting_parts',
  'completed',
  'delivered',
  'cancelled'
);

create type device_type as enum (
  'smartphone',
  'tablet',
  'laptop',
  'desktop',
  'console',
  'other'
);

create type user_role as enum ('admin', 'technician');

-- Profiles table (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  email text not null,
  full_name text not null,
  role user_role default 'technician' not null
);

-- Customers table
create table customers (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  name text not null,
  email text,
  phone text not null,
  address text,
  notes text
);

-- Devices table
create table devices (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now() not null,
  customer_id uuid references customers(id) on delete cascade not null,
  type device_type not null,
  brand text not null,
  model text not null,
  serial_number text,
  color text,
  condition_notes text
);

-- Repairs table
create table repairs (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  ticket_number text unique not null,
  device_id uuid references devices(id) on delete restrict not null,
  customer_id uuid references customers(id) on delete restrict not null,
  technician_id uuid references profiles(id) on delete set null,
  status repair_status default 'pending' not null,
  issue_description text not null,
  diagnosis text,
  resolution text,
  estimated_cost numeric(10,2),
  final_cost numeric(10,2),
  estimated_completion timestamptz,
  completed_at timestamptz,
  delivered_at timestamptz
);

-- Inventory table
create table inventory (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  name text not null,
  sku text unique not null,
  description text,
  category text not null,
  quantity integer default 0 not null,
  min_quantity integer default 0 not null,
  cost_price numeric(10,2) not null,
  sell_price numeric(10,2) not null,
  location text
);

-- Repair parts junction table
create table repair_parts (
  id uuid default uuid_generate_v4() primary key,
  repair_id uuid references repairs(id) on delete cascade not null,
  inventory_id uuid references inventory(id) on delete restrict not null,
  quantity integer not null,
  unit_price numeric(10,2) not null
);

-- Create indexes for common queries
create index idx_repairs_status on repairs(status);
create index idx_repairs_customer on repairs(customer_id);
create index idx_repairs_technician on repairs(technician_id);
create index idx_repairs_ticket on repairs(ticket_number);
create index idx_devices_customer on devices(customer_id);
create index idx_inventory_sku on inventory(sku);
create index idx_inventory_category on inventory(category);
create index idx_customers_phone on customers(phone);

-- Function to generate ticket numbers
create or replace function generate_ticket_number()
returns trigger as $$
begin
  new.ticket_number := 'TRP-' || to_char(now(), 'YYYYMMDD') || '-' ||
    lpad(nextval('ticket_seq')::text, 4, '0');
  return new;
end;
$$ language plpgsql;

-- Create sequence for ticket numbers
create sequence if not exists ticket_seq start 1;

-- Trigger to auto-generate ticket numbers
create trigger set_ticket_number
  before insert on repairs
  for each row
  when (new.ticket_number is null)
  execute function generate_ticket_number();

-- Function to update updated_at timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

create trigger update_customers_updated_at
  before update on customers
  for each row execute function update_updated_at();

create trigger update_repairs_updated_at
  before update on repairs
  for each row execute function update_updated_at();

create trigger update_inventory_updated_at
  before update on inventory
  for each row execute function update_updated_at();

-- Row Level Security (RLS) policies
alter table profiles enable row level security;
alter table customers enable row level security;
alter table devices enable row level security;
alter table repairs enable row level security;
alter table inventory enable row level security;
alter table repair_parts enable row level security;

-- Profiles: users can read all profiles, update only their own
create policy "Profiles are viewable by authenticated users"
  on profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id);

-- All other tables: authenticated users have full access
create policy "Authenticated users can manage customers"
  on customers for all
  to authenticated
  using (true);

create policy "Authenticated users can manage devices"
  on devices for all
  to authenticated
  using (true);

create policy "Authenticated users can manage repairs"
  on repairs for all
  to authenticated
  using (true);

create policy "Authenticated users can manage inventory"
  on inventory for all
  to authenticated
  using (true);

create policy "Authenticated users can manage repair_parts"
  on repair_parts for all
  to authenticated
  using (true);

-- Function to handle new user signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
