import React, { useState } from 'react';
import {
  Search,
  Bell,
  Menu,
  Calendar,
  User,
  Factory,
} from 'lucide-react';
import { formatHeaderDate } from '../utils/formatters';
import { NotificationPopover } from './NotificationPopover';

interface TopNavProps {
  onToggleSidebar: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  pendingCount?: number;
  onSearchSubmit?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onToggleSidebar,
  searchQuery,
  setSearchQuery,
  pendingCount = 8,
  onSearchSubmit,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const formattedDate = formatHeaderDate();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearchSubmit) {
      onSearchSubmit();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden text-slate-600 hover:text-forest-900 p-2 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex w-9 h-9 rounded-xl bg-forest-900 text-lime-400 items-center justify-center shadow-sm">
              <Factory className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-forest-950">
                  Sanjivani AI
                </h1>
                <span className="hidden md:inline-flex text-[11px] font-medium bg-forest-50 text-forest-800 px-2 py-0.5 rounded-full border border-forest-200">
                  Kopargaon Sugar Factory
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block italic font-medium">
                Smart Farmer Information &amp; Payment Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Center: Search input */}
        <div className="flex-1 max-w-md mx-2 sm:mx-6">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search farmer name, village..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-cream-50/70 hover:bg-cream-50 focus:bg-white border border-slate-200 focus:border-forest-600 focus:ring-2 focus:ring-forest-600/10 rounded-xl transition-all outline-none placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-1 rounded"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right: Date, Notifications, Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Current Date */}
          <div className="hidden xl:flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60">
            <Calendar className="w-3.5 h-3.5 text-forest-700" />
            <span className="font-medium">{formattedDate}</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-600 hover:text-forest-900 rounded-xl hover:bg-slate-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {pendingCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white"></span>
              )}
            </button>

            <NotificationPopover
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
              pendingCount={pendingCount}
            />
          </div>

          {/* Profile / Avatar */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="w-9 h-9 rounded-xl bg-forest-800 text-lime-400 flex items-center justify-center font-bold text-xs shadow-subtle ring-1 ring-forest-700/50">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight">
                Accounts Officer
              </p>
              <p className="text-[11px] text-slate-500">Cane Division</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
