import React from 'react';
import { 
  Plus, 
  Calendar, 
  User, 
  Phone, 
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Product, Rental } from '../types';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { Language, translations } from '../lib/translations';

interface RentalsProps {
  products: Product[];
  rentals: Rental[];
  onRent: (rental: Omit<Rental, 'id' | 'user_id' | 'created_at'>) => void;
  onReturn: (id: string, productId: string) => void;
  language: Language;
}

export function Rentals({ products, rentals, onRent, onReturn, language }: RentalsProps) {
  const t = translations[language];
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const activeRentals = rentals.filter(r => r.status === 'rented');
  const overdueRentals = activeRentals.filter(r => new Date(r.return_date) < new Date());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t.rentals}</h2>
          <p className="text-slate-500">Track product rentals and returns.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus size={18} />
          {t.newRental}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <Calendar size={18} />
            <span className="text-sm font-medium">Active Rentals</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{activeRentals.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <AlertCircle size={18} className="text-red-500" />
            <span className="text-sm font-medium">Overdue Rentals</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{overdueRentals.length}</p>
        </div>
      </div>

      {/* Rentals List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Customer</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Product</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Dates</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Amount</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rentals.map((rental) => {
                const isOverdue = rental.status === 'rented' && new Date(rental.return_date) < new Date();
                return (
                  <tr key={rental.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{rental.customer_name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Phone size={12} /> {rental.customer_phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{rental.product?.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-1 text-slate-500">
                          <Clock size={12} /> Out: {formatDate(rental.rent_date)}
                        </div>
                        <div className={cn(
                          "flex items-center gap-1 font-medium",
                          isOverdue ? "text-red-600" : "text-slate-500"
                        )}>
                          <Clock size={12} /> Due: {formatDate(rental.return_date)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      {formatCurrency(rental.rent_amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full",
                        rental.status === 'rented' 
                          ? (isOverdue ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700")
                          : "bg-green-100 text-green-700"
                      )}>
                        {rental.status === 'rented' ? (isOverdue ? 'Overdue' : 'Rented') : 'Returned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {rental.status === 'rented' && (
                        <button 
                          onClick={() => onReturn(rental.id, rental.product_id)}
                          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <CheckCircle2 size={16} />
                          Return
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List */}
        <div className="md:hidden divide-y divide-slate-100">
          {rentals.map((rental) => {
            const isOverdue = rental.status === 'rented' && new Date(rental.return_date) < new Date();
            return (
              <div key={rental.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900">{rental.customer_name}</h4>
                    <p className="text-xs text-slate-500">{rental.customer_phone}</p>
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full",
                    rental.status === 'rented' 
                      ? (isOverdue ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700")
                      : "bg-green-100 text-green-700"
                  )}>
                    {rental.status === 'rented' ? (isOverdue ? 'Overdue' : 'Rented') : 'Returned'}
                  </span>
                </div>
                <div className="text-sm">
                  <p className="text-slate-500 text-xs">Product</p>
                  <p className="font-medium text-slate-900">{rental.product?.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-slate-500">Rent Date</p>
                    <p className="font-medium text-slate-900">{formatDate(rental.rent_date)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Return Date</p>
                    <p className={cn("font-medium", isOverdue ? "text-red-600" : "text-slate-900")}>
                      {formatDate(rental.return_date)}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                  <p className="font-bold text-slate-900">{formatCurrency(rental.rent_amount)}</p>
                  {rental.status === 'rented' && (
                    <button 
                      onClick={() => onReturn(rental.id, rental.product_id)}
                      className="flex items-center gap-1 text-sm font-medium text-blue-600"
                    >
                      <CheckCircle2 size={16} />
                      Return
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <RentalModal 
          products={products.filter(p => p.quantity > 0)} 
          language={language}
          onClose={() => setIsModalOpen(false)}
          onSave={(data: any) => {
            onRent(data);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function RentalModal({ products, onClose, onSave, language }: any) {
  const t = translations[language];
  const [formData, setFormData] = React.useState({
    product_id: '',
    customer_name: '',
    customer_phone: '',
    rent_date: new Date().toISOString().split('T')[0],
    return_date: '',
    rent_amount: 0,
    status: 'rented' as const,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">{t.newRental}</h3>
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
              <option value="">{t.search}</option>
              {products.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name} ({p.quantity} available)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.customerName}</label>
            <input
              required
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.customerPhone}</label>
            <input
              required
              value={formData.customer_phone}
              onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.rentDate}</label>
              <input
                type="date"
                required
                value={formData.rent_date}
                onChange={(e) => setFormData({ ...formData, rent_date: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.returnDate}</label>
              <input
                type="date"
                required
                value={formData.return_date}
                onChange={(e) => setFormData({ ...formData, return_date: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.rentAmount}</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.rent_amount || ''}
              onChange={(e) => setFormData({ ...formData, rent_amount: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
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
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700"
            >
              {t.confirm}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
