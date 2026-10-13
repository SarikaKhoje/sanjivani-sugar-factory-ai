import React from 'react';
import {
  LayoutDashboard,
  Users,
  IndianRupee,
  Sparkles,
  Settings,
  Factory,
  ChevronRight,
  X,
} from 'lucide-react';
import { ActiveTab, DashboardSummary } from '../types/farmer';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  summary: DashboardSummary | null;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  summary,
  mobileOpen,
  setMobileOpen,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string | number; badgeColor?: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'farmers',
      label: 'Farmer Records',
      icon: <Users className="w-5 h-5" />,
      badge: summary?.totalFarmers,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'payments',
      label: 'Payment Overview',
      icon: <IndianRupee className="w-5 h-5" />,
      badge: summary?.pendingPaymentCount ? `${summary.pendingPaymentCount} pending` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'ai-assistant',
      label: 'AI Assistant',
      icon: <Sparkles className="w-5 h-5" />,
      badge: 'MCP Live',
      badgeColor: 'bg-lime-100 text-lime-900 border border-lime-300',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const handleSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0F3822] text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header / Brand */}
        <div className="p-5 border-b border-forest-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-800 border border-lime-500/30 flex items-center justify-center text-lime-400 shadow-sm">
              <Factory className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-white">Sanjivani AI</span>
                <span className="text-[10px] uppercase font-semibold bg-lime-500/20 text-lime-400 px-1.5 py-0.5 rounded border border-lime-500/30">
                  MCP
                </span>
              </div>
              <p className="text-xs text-forest-200/80">Sugar Factory Intelligence</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-forest-300 hover:text-white p-1 rounded-lg hover:bg-forest-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Factory Details Badge */}
        <div className="px-5 py-3 bg-[#0B2E1C] border-b border-forest-800/60 text-xs">
          <p className="text-forest-200/70 font-medium">Sanjivani Sakhar Karkhana</p>
          <div className="flex items-center justify-between mt-1 text-[11px] text-forest-300">
            <span>Kopargaon Division</span>
            <span className="text-lime-400 font-mono">Season 25-26</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-forest-800 text-white shadow-sm border border-forest-700/60 font-semibold'
                    : 'text-forest-200/90 hover:bg-forest-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-lime-400' : 'text-forest-300'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.badge !== undefined && (
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-forest-700 text-forest-100'}`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-4 h-4 text-lime-400" />}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer / System Status */}
        <div className="p-4 border-t border-forest-800/80 bg-[#0B2E1C]">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-lime-500"></span>
            </span>
            <div className="text-xs">
              <p className="font-semibold text-forest-100">MCP Protocol Active</p>
              <p className="text-[11px] text-forest-300">PostgreSQL Live Sync</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
