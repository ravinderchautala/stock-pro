import React from 'react';
import { 
  Plus, 
  History, 
  Search,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import { Product, Sale } from '../types';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { Language, translations } from '../lib/translations';

interface SalesProps {
  products: Product[];
  sales: Sale[];
  onSave: (sale: Omit<Sale, 'id' | 'user_id' | 'created_at'>) => void;
  language: Language;
}

export function Sales({ products, sales, onSave, language }: SalesProps) {
  const t = translations[language];
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredSales = sales.filter(s => 
    s.product?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t.sales}</h2>
          <p className="text-slate-500">Record transactions and view history.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={18} />
          {t.recordSale}
        </button>
      </div>

      {/* Sales Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <TrendingUp size={18} />
            <span className="text-sm font-medium">Total Sales Today</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {sales.filter(s => new Date(s.sale_date).toDateString() === new Date().toDateString()).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <ArrowUpRight size={18} className="text-green-500" />
            <span className="text-sm font-medium">Revenue Today</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {formatCurrency(sales
              .filter(s => new Date(s.sale_date).toDateString() === new Date().toDateString())
              .reduce((acc, s) => acc + (s.selling_price * s.quantity_sold), 0)
            )}
          </p>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History size={18} className="text-slate-400" />
            <h3 className="font-semibold">Sales History</h3>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search sales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Product</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Quantity</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Unit Price</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-500">{formatDate(sale.sale_date)}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{sale.product?.name}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{sale.quantity_sold}</td>
                  <td className="px-6 py-4 text-slate-600">{formatCurrency(sale.selling_price)}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {formatCurrency(sale.selling_price * sale.quantity_sold)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredSales.map((sale) => (
            <div key={sale.id} className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900">{sale.product?.name}</h4>
                  <p className="text-xs text-slate-500">{formatDate(sale.sale_date)}</p>
                </div>
                <p className="font-bold text-slate-900">{formatCurrency(sale.selling_price * sale.quantity_sold)}</p>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>{sale.quantity_sold} units @ {formatCurrency(sale.selling_price)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <SaleModal 
          products={products.filter(p => p.quantity > 0)} 
          language={language}
          onClose={() => setIsModalOpen(false)}
          onSave={(data) => {
            onSave(data);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function SaleModal({ products, onClose, onSave, language }: any) {
  const t = translations[language];
  const [formData, setFormData] = React.useState({
    product_id: '',
    quantity_sold: 1,
    selling_price: 0,
    sale_date: new Date().toISOString().split('T')[0],
  });

  const selectedProduct = products.find((p: any) => p.id === formData.product_id);

  React.useEffect(() => {
    if (selectedProduct) {
      setFormData(prev => ({ ...prev, selling_price: selectedProduct.selling_price }));
    }
  }, [formData.product_id, selectedProduct]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">{t.recordSale}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <Plus className="rotate-45" size={24} />
          </button>
        </div>
        <form className="p-6 space-y-4" onSubmit={(e) => {
          e.preventDefault();
          onSave(formData);
        }}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.category}</label>
            <select
              required
              value={formData.product_id}
              onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">Choose a product...</option>
              {products.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.quantity} in stock)
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.quantitySold}</label>
              <input
                type="number"
                min="1"
                max={selectedProduct?.quantity || 1}
                required
                value={formData.quantity_sold || ''}
                onChange={(e) => setFormData({ ...formData, quantity_sold: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.sellingPrice}</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.selling_price || ''}
                onChange={(e) => setFormData({ ...formData, selling_price: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.saleDate}</label>
            <input
              type="date"
              required
              value={formData.sale_date}
              onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {selectedProduct && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">{t.subtotal}:</span>
                <span className="font-semibold">{formatCurrency(formData.quantity_sold * formData.selling_price)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">{t.estimatedProfit}:</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency((formData.selling_price - selectedProduct.cost_price) * formData.quantity_sold)}
                </span>
              </div>
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
            >
              {t.confirm}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
