import { useState, useEffect, useMemo } from 'react';
import { useAuth } from './hooks/useAuth';
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { Sales } from './components/Sales';
import { Rentals } from './components/Rentals';
import { supabase } from './lib/supabase';
import { Product, Sale, Rental, DashboardStats } from './types';
import { Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { cn } from './lib/utils';
import { Language, translations } from './lib/translations';

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [language, setLanguage] = useState<Language>('en');
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const t = translations[language];

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const testConnection = async () => {
    try {
      const { error } = await supabase.from('products').select('id').limit(1);
      if (error) {
        if (error.message.includes('Failed to fetch')) {
          setConnectionError('Could not connect to Supabase. Please check your internet connection or VITE_SUPABASE_URL.');
        } else if (error.message.includes('Could not find the table') || error.code === 'PGRST301' || error.code === '42P01') {
          setConnectionError('Database tables are missing. Please run the SQL script in supabase_schema.sql in your Supabase SQL Editor to create the required tables.');
        } else {
          console.warn('Supabase query error:', error.message);
        }
      } else {
        setConnectionError(null);
        console.log('Successfully connected to Supabase.');
      }
    } catch (err) {
      setConnectionError('An unexpected error occurred while connecting to Supabase.');
    }
  };

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [productsRes, salesRes, rentalsRes] = await Promise.all([
        supabase.from('products').select('*').order('name'),
        supabase.from('sales').select('*, product:products(*)').order('sale_date', { ascending: false }),
        supabase.from('rentals').select('*, product:products(*)').order('created_at', { ascending: false })
      ]);

      if (productsRes.error) {
        if (productsRes.error.message.includes('Could not find the table')) {
          setConnectionError('Database tables are missing. Please run the SQL script in supabase_schema.sql in your Supabase SQL Editor.');
          return;
        }
        throw productsRes.error;
      }
      if (salesRes.error) throw salesRes.error;
      if (rentalsRes.error) throw rentalsRes.error;

      if (productsRes.data) setProducts(productsRes.data);
      if (salesRes.data) setSales(salesRes.data);
      if (rentalsRes.data) setRentals(rentalsRes.data);
      setConnectionError(null);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setConnectionError(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      testConnection();
      fetchData();
    }
  }, [user]);

  const stats: DashboardStats = useMemo(() => {
    const totalProfit = sales.reduce((acc, sale) => {
      const cost = Number(sale.product?.cost_price) || 0;
      const selling = Number(sale.selling_price) || 0;
      const qty = Number(sale.quantity_sold) || 0;
      return acc + (selling - cost) * qty;
    }, 0);

    return {
      totalProducts: products.length,
      lowStockItems: products.filter(p => p.quantity <= p.min_stock_level).length,
      totalSales: sales.length,
      totalProfit: isNaN(totalProfit) ? 0 : totalProfit,
      activeRentals: rentals.filter(r => r.status === 'rented').length,
    };
  }, [products, sales, rentals]);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayProfit = sales
        .filter(s => s.sale_date === date)
        .reduce((acc, s) => {
          const cost = Number(s.product?.cost_price) || 0;
          const selling = Number(s.selling_price) || 0;
          const qty = Number(s.quantity_sold) || 0;
          return acc + (selling - cost) * qty;
        }, 0);
      return { 
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }), 
        profit: isNaN(dayProfit) ? 0 : dayProfit 
      };
    });
  }, [sales]);

  const categorySalesData = useMemo(() => {
    const categories = [...new Set(products.map(p => p.category))];
    return categories.map(cat => ({
      name: cat,
      sales: sales.filter(s => s.product?.category === cat).length
    })).filter(c => c.sales > 0);
  }, [products, sales]);

  const handleAddProduct = async (data: any) => {
    try {
      const { data: newProduct, error } = await supabase
        .from('products')
        .insert([{ ...data, user_id: user?.id }])
        .select()
        .single();
      
      if (error) throw error;
      if (newProduct) {
        setProducts([...products, newProduct]);
        showNotification('Product added successfully!');
      }
    } catch (error: any) {
      console.error('Error adding product:', error);
      showNotification(error.message || 'Failed to add product', 'error');
    }
  };

  const handleEditProduct = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update(product)
        .eq('id', product.id);
      
      if (error) throw error;
      setProducts(products.map(p => p.id === product.id ? product : p));
      showNotification('Product updated successfully!');
    } catch (error: any) {
      console.error('Error updating product:', error);
      showNotification(error.message || 'Failed to update product', 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts(products.filter(p => p.id !== id));
      showNotification('Product deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting product:', error);
      showNotification(error.message || 'Failed to delete product', 'error');
    }
  };

  const handleRecordSale = async (data: any) => {
    try {
      const { data: newSale, error } = await supabase
        .from('sales')
        .insert([{ ...data, user_id: user?.id }])
        .select('*, product:products(*)')
        .single();
      
      if (error) throw error;
      if (newSale) {
        setSales([newSale, ...sales]);
        // Update stock
        const product = products.find(p => p.id === data.product_id);
        if (product) {
          const newQty = product.quantity - data.quantity_sold;
          await handleEditProduct({ ...product, quantity: newQty });
        }
        showNotification('Sale recorded successfully!');
      }
    } catch (error: any) {
      console.error('Error recording sale:', error);
      showNotification(error.message || 'Failed to record sale', 'error');
    }
  };

  const handleRent = async (data: any) => {
    try {
      const { data: newRental, error } = await supabase
        .from('rentals')
        .insert([{ ...data, user_id: user?.id }])
        .select('*, product:products(*)')
        .single();
      
      if (error) throw error;
      if (newRental) {
        setRentals([newRental, ...rentals]);
        // Update stock
        const product = products.find(p => p.id === data.product_id);
        if (product) {
          await handleEditProduct({ ...product, quantity: product.quantity - 1 });
        }
        showNotification('Rental recorded successfully!');
      }
    } catch (error: any) {
      console.error('Error recording rental:', error);
      showNotification(error.message || 'Failed to record rental', 'error');
    }
  };

  const handleReturn = async (id: string, productId: string) => {
    try {
      const { error } = await supabase
        .from('rentals')
        .update({ status: 'returned' })
        .eq('id', id);
      
      if (error) throw error;
      setRentals(rentals.map(r => r.id === id ? { ...r, status: 'returned' } : r));
      // Update stock
      const product = products.find(p => p.id === productId);
      if (product) {
        await handleEditProduct({ ...product, quantity: product.quantity + 1 });
      }
      showNotification('Product returned successfully!');
    } catch (error: any) {
      console.error('Error returning product:', error);
      showNotification(error.message || 'Failed to return product', 'error');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const overdueCount = rentals.filter(r => r.status === 'rented' && new Date(r.return_date) < new Date()).length;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        lowStockCount={stats.lowStockItems}
        overdueRentalsCount={overdueCount}
        language={language}
        setLanguage={setLanguage}
      />
      
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
        {notification && (
          <div className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-right-full duration-300 pointer-events-auto",
            notification.type === 'success' ? "bg-white border-green-100 text-green-800" : "bg-white border-red-100 text-red-800"
          )}>
            {notification.type === 'success' ? <CheckCircle size={20} className="text-green-500" /> : <XCircle size={20} className="text-red-500" />}
            <p className="text-sm font-semibold">{notification.message}</p>
          </div>
        )}
      </div>

      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {connectionError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex flex-col gap-3">
              <div className="flex items-center gap-3 text-red-700">
                <AlertCircle size={20} />
                <p className="text-sm font-medium">{connectionError}</p>
              </div>
              {connectionError.includes('supabase_schema.sql') && (
                <button 
                  onClick={() => {
                    const sql = `/*
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
  FOR ALL USING (auth.uid() = user_id);`;
                    
                    const blob = new Blob([sql], { type: 'text/plain' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'supabase_schema.sql';
                    a.click();
                    showNotification('SQL script downloaded. Please run it in Supabase SQL Editor.');
                  }}
                  className="w-fit px-4 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors"
                >
                  Download SQL Script
                </button>
              )}
            </div>
          )}
          {loading ? (
            <div className="h-[60vh] flex items-center justify-center">
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard stats={stats} chartData={chartData} salesData={categorySalesData} language={language} />
              )}
              {activeTab === 'inventory' && (
                <Inventory 
                  products={products} 
                  onAdd={handleAddProduct} 
                  onEdit={handleEditProduct} 
                  onDelete={handleDeleteProduct} 
                  language={language}
                />
              )}
              {activeTab === 'sales' && (
                <Sales 
                  products={products} 
                  sales={sales} 
                  onSave={handleRecordSale} 
                  language={language}
                />
              )}
              {activeTab === 'rentals' && (
                <Rentals 
                  products={products} 
                  rentals={rentals} 
                  onRent={handleRent} 
                  onReturn={handleReturn} 
                  language={language}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
