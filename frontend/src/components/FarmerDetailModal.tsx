import React from 'react';
import { X, Sparkles, MapPin, Scale, IndianRupee, CheckCircle2, Clock } from 'lucide-react';
import { FarmerRecord } from '../types/farmer';
import { formatCurrency, formatTonnes } from '../utils/formatters';

interface FarmerDetailModalProps {
  farmer: FarmerRecord | null;
  onClose: () => void;
  onAskAIAboutFarmer: (farmerName: string) => void;
}

export const FarmerDetailModal: React.FC<FarmerDetailModalProps> = ({
  farmer,
  onClose,
  onAskAIAboutFarmer,
}) => {
  if (!farmer) return null;

  const paidRatio =
    farmer.total_payment_value > 0
      ? Math.round((farmer.amount_paid / farmer.total_payment_value) * 100)
      : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-forest-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute right-5 top-5 text-forest-200 hover:text-white p-1.5 rounded-xl hover:bg-forest-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-lime-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Farmer ID #{farmer.id}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {farmer.village}
            </span>
          </div>

          <h3 className="text-2xl font-bold text-white tracking-tight">
            {farmer.name}
          </h3>

          <div className="mt-3 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                farmer.payment_status === 'PAID'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {farmer.payment_status === 'PAID' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Account Fully Settled
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  Pending Payment Balance
                </>
              )}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Key Metric Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-cream-50 border border-slate-200/80">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                <Scale className="w-4 h-4 text-forest-700" />
                Sugarcane Supplied
              </div>
              <p className="text-xl font-bold text-slate-900">
                {formatTonnes(farmer.sugarcane_supplied_tonnes)}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Weighed at factory weighbridge</p>
            </div>

            <div className="p-4 rounded-2xl bg-cream-50 border border-slate-200/80">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                <IndianRupee className="w-4 h-4 text-forest-700" />
                Total Valuation
              </div>
              <p className="text-xl font-bold text-slate-900">
                {formatCurrency(farmer.total_payment_value)}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Based on seasonal FRP rate</p>
            </div>
          </div>

          {/* Payment Progress */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-700">Payment Clearance Progress</span>
              <span className="font-bold text-forest-800">{paidRatio}% Disbursed</span>
            </div>

            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-forest-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${paidRatio}%` }}
              ></div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
              <div>
                <span className="text-slate-500 text-[11px]">Amount Disbursed:</span>
                <p className="font-bold text-emerald-700">{formatCurrency(farmer.amount_paid)}</p>
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">Pending Balance:</span>
                <p className="font-bold text-amber-700">{formatCurrency(farmer.payment_pending_amount)}</p>
              </div>
            </div>
          </div>

          {/* Quick AI Prompt Button */}
          <button
            onClick={() => {
              onClose();
              onAskAIAboutFarmer(farmer.name);
            }}
            className="w-full py-3 px-4 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-md group"
          >
            <Sparkles className="w-4 h-4 text-lime-400 group-hover:rotate-12 transition-transform" />
            <span>Ask Sanjivani AI about {farmer.name.split(' ')[0]}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
