import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Calendar, 
  LogOut,
  Menu,
  X,
  Languages
} from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { Language, languages, translations } from '../lib/translations';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lowStockCount: number;
  overdueRentalsCount: number;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export function Sidebar({ 
  activeTab, 
  setActiveTab, 
  lowStockCount, 
  overdueRentalsCount,
  language,
  setLanguage
}: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const t = translations[language];

  const navItems = [
    { label: t.dashboard, icon: LayoutDashboard, id: 'dashboard' },
    { label: t.inventory, icon: Package, id: 'inventory' },
    { label: t.sales, icon: ShoppingCart, id: 'sales' },
    { label: t.rentals, icon: Calendar, id: 'rentals' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-400 flex items-center gap-2">
            <Package className="text-blue-400" />
            StockPro
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                activeTab === item.id 
                  ? "bg-blue-600 text-white" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
              {item.id === 'inventory' && lowStockCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {lowStockCount}
                </span>
              )}
              {item.id === 'rentals' && overdueRentalsCount > 0 && (
                <span className="ml-auto bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {overdueRentalsCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-4">
          <div className="px-4 py-2">
            <div className="flex items-center gap-2 text-slate-400 mb-2 text-xs font-semibold uppercase tracking-wider">
              <Languages size={14} />
              <span>Language</span>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-full bg-slate-800 text-slate-200 text-sm border-none rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.native}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">{t.logout}</span>
          </button>
        </div>
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
