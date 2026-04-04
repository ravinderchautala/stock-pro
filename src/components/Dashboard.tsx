import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { formatCurrency, cn } from '../lib/utils';
import { DashboardStats } from '../types';
import { Language, translations } from '../lib/translations';

interface DashboardProps {
  stats: DashboardStats;
  chartData: any[];
  salesData: any[];
  language: Language;
}

export function Dashboard({ stats, chartData, salesData, language }: DashboardProps) {
  const t = translations[language];
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">{t.dashboard}</h2>
        <p className="text-slate-500">Welcome back! Here's what's happening with your business.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard 
          title={t.totalProducts} 
          value={stats.totalProducts} 
          icon={Package} 
          color="blue" 
        />
        <StatCard 
          title={t.lowStock} 
          value={stats.lowStockItems} 
          icon={AlertTriangle} 
          color="red" 
          alert={stats.lowStockItems > 0}
        />
        <StatCard 
          title={t.totalSales} 
          value={stats.totalSales} 
          icon={TrendingUp} 
          color="green" 
        />
        <StatCard 
          title={t.totalProfit} 
          value={formatCurrency(stats.totalProfit)} 
          icon={DollarSign} 
          color="indigo" 
        />
        <StatCard 
          title={t.activeRentals} 
          value={stats.activeRentals} 
          icon={Calendar} 
          color="orange" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profit Trend Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-6">{t.profitTrend}</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [formatCurrency(value), t.totalProfit]}
                />
                <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Category Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-6">{t.salesVolume}</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
                  {salesData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, alert }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    red: "bg-red-50 text-red-600",
    green: "bg-green-50 text-green-600",
    indigo: "bg-indigo-50 text-indigo-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className={cn(
      "bg-white p-6 rounded-2xl shadow-sm border transition-all",
      alert ? "border-red-200 ring-4 ring-red-50" : "border-slate-100"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-2 rounded-lg", colors[color])}>
          <Icon size={20} />
        </div>
        {alert && <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
      </div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );
}
