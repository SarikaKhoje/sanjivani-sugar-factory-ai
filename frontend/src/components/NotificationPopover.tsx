import React from 'react';
import { Bell, CheckCircle2, Clock, AlertTriangle, X } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'success';
  read: boolean;
}

interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  pendingCount?: number;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  isOpen,
  onClose,
  pendingCount = 8,
}) => {
  if (!isOpen) return null;

  const notifications: NotificationItem[] = [
    {
      id: '1',
      title: 'Pending Payment Audit',
      message: `${pendingCount} farmers currently require pending cane payment settlement totaling ₹1,19,000.`,
      time: '10 mins ago',
      type: 'warning',
      read: false,
    },
    {
      id: '2',
      title: 'Full Payment Clearance',
      message: 'Vijay More (Shirdi) & Kavita Deshmukh (Rahata) accounts are fully settled.',
      time: '1 hour ago',
      type: 'success',
      read: false,
    },
    {
      id: '3',
      title: 'Crushing Milestone Reached',
      message: 'Factory batch intake surpassed 1,200 tonnes across 6 regional collection centers.',
      time: '3 hours ago',
      type: 'info',
      read: true,
    },
  ];

  return (
    <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-elevated border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
      <div className="p-3.5 bg-forest-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-lime-400" />
          <span className="font-semibold text-sm">Factory Notifications</span>
          <span className="bg-lime-500/20 text-lime-300 text-xs px-2 py-0.5 rounded-full border border-lime-400/30">
            {notifications.filter((n) => !n.read).length} new
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-forest-200 hover:text-white p-1 rounded-lg hover:bg-forest-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
        {notifications.map((item) => (
          <div
            key={item.id}
            className={`p-3.5 hover:bg-cream-50 transition-colors ${
              !item.read ? 'bg-forest-50/30' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {item.type === 'warning' && (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                )}
                {item.type === 'success' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
                {item.type === 'info' && (
                  <Clock className="w-4 h-4 text-blue-500" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-semibold text-slate-800">{item.title}</h4>
                  <span className="text-[10px] text-slate-400">{item.time}</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  {item.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
        <button
          onClick={onClose}
          className="text-xs font-medium text-forest-700 hover:text-forest-900"
        >
          Close Notifications
        </button>
      </div>
    </div>
  );
};
