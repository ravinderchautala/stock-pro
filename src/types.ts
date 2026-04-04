export type Product = {
  id: string;
  user_id: string;
  name: string;
  category: string;
  quantity: number;
  cost_price: number;
  selling_price: number;
  min_stock_level: number;
  created_at: string;
};

export type Sale = {
  id: string;
  user_id: string;
  product_id: string;
  quantity_sold: number;
  selling_price: number;
  sale_date: string;
  created_at: string;
  product?: Product;
};

export type Rental = {
  id: string;
  user_id: string;
  product_id: string;
  customer_name: string;
  customer_phone: string;
  rent_date: string;
  return_date: string;
  rent_amount: number;
  status: 'rented' | 'returned';
  created_at: string;
  product?: Product;
};

export type DashboardStats = {
  totalProducts: number;
  lowStockItems: number;
  totalSales: number;
  totalProfit: number;
  activeRentals: number;
};
