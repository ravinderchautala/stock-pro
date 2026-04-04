import React from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Filter,
  Download,
  AlertCircle
} from 'lucide-react';
import { Product } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { Language, translations } from '../lib/translations';

interface InventoryProps {
  products: Product[];
  onAdd: (product: Omit<Product, 'id' | 'user_id' | 'created_at'>) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  language: Language;
}

export function Inventory({ products, onAdd, onEdit, onDelete, language }: InventoryProps) {
  const t = translations[language];
  const [searchTerm, setSearchTerm] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('All');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleExport = () => {
    const headers = ['Name', 'Category', 'Quantity', 'Cost Price', 'Selling Price', 'Min Stock'];
    const csvContent = [
      headers.join(','),
      ...filteredProducts.map(p => [
        p.name,
        p.category,
        p.quantity,
        p.cost_price,
        p.selling_price,
        p.min_stock_level
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t.inventory}</h2>
          <p className="text-slate-500">Manage your products and stock levels.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download size={18} />
            {t.exportCsv}
          </button>
          <button 
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            {t.addProduct}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table / Card List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Product Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Category</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Stock</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Cost Price</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Selling Price</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{product.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-semibold",
                        product.quantity <= product.min_stock_level ? "text-red-600" : "text-slate-900"
                      )}>
                        {product.quantity}
                      </span>
                      {product.quantity <= product.min_stock_level && (
                        <AlertCircle size={14} className="text-red-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{formatCurrency(product.cost_price)}</td>
                  <td className="px-6 py-4 text-slate-600">{formatCurrency(product.selling_price)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => {
                          setEditingProduct(product);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => onDelete(product.id)}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredProducts.map((product) => (
            <div key={product.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">{product.name}</h4>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-full">
                    {product.category}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => {
                      setEditingProduct(product);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-slate-400 hover:text-blue-600"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => onDelete(product.id)}
                    className="p-2 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 text-xs">Stock</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={cn(
                      "font-bold",
                      product.quantity <= product.min_stock_level ? "text-red-600" : "text-slate-900"
                    )}>
                      {product.quantity}
                    </span>
                    {product.quantity <= product.min_stock_level && (
                      <AlertCircle size={12} className="text-red-500" />
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Selling Price</p>
                  <p className="font-bold text-slate-900 mt-0.5">{formatCurrency(product.selling_price)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <ProductModal 
          product={editingProduct} 
          onClose={() => setIsModalOpen(false)}
          language={language}
          onSave={(data) => {
            if (editingProduct) {
              onEdit({ ...editingProduct, ...data });
            } else {
              onAdd(data);
            }
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function ProductModal({ product, onClose, onSave, language }: any) {
  const t = translations[language];
  const [formData, setFormData] = React.useState({
    name: product?.name || '',
    category: product?.category || '',
    quantity: product?.quantity || 0,
    cost_price: product?.cost_price || 0,
    selling_price: product?.selling_price || 0,
    min_stock_level: product?.min_stock_level || 5,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            {product ? t.editProduct : t.addProduct}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <Plus className="rotate-45" size={24} />
          </button>
        </div>
        <form className="p-6 space-y-4" onSubmit={(e) => {
          e.preventDefault();
          onSave(formData);
        }}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.productName}</label>
            <input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.category}</label>
            <input
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.quantity}</label>
              <input
                type="number"
                required
                value={formData.quantity || ''}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.minStock}</label>
              <input
                type="number"
                required
                value={formData.min_stock_level || ''}
                onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.costPrice}</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.cost_price || ''}
                onChange={(e) => setFormData({ ...formData, cost_price: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
