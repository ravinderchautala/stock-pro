/*
  STOCKPRO DATABASE SCHEMA
  Run this SQL in your Supabase SQL Editor to set up the required tables.
*/

-- 1. Products Table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER DEFAULT 0,
  cost_price DECIMAL(10,2) DEFAULT 0,
  selling_price DECIMAL(10,2) DEFAULT 0,
  min_stock_level INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Sales Table
CREATE TABLE sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity_sold INTEGER NOT NULL,
  selling_price DECIMAL(10,2) NOT NULL,
  sale_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Rentals Table
CREATE TABLE rentals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  rent_date DATE NOT NULL,
  return_date DATE NOT NULL,
  rent_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'rented' CHECK (status IN ('rented', 'returned')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;

-- Create Policies (User-based data isolation)
CREATE POLICY "Users can manage their own products" ON products
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sales" ON sales
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own rentals" ON rentals
  FOR ALL USING (auth.uid() = user_id);
