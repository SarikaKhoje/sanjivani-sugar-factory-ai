import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { DashboardSummary } from '../types/farmer';
import { formatCurrency, formatNumber } from '../utils/formatters';

interface PaymentStatusDonutChartProps {
  summary: DashboardSummary | null;
}

export const PaymentStatusDonutChart: React.FC<PaymentStatusDonutChartProps> = ({
  summary,
}) => {
  const [viewMode, setViewMode] = useState<'count' | 'amount'>('count');

  if (!summary) {
    return null;
  }

  const countData = [
    {
      name: 'Fully Paid Farmers',
      value: summary.fullyPaidCount,
      color: '#16A34A',
    },
    {
      name: 'Pending Payment Farmers',
      value: summary.pendingPaymentCount,
      color: '#D97706',
    },
  ];

  const amountData = [
    {
      name: 'Amount Paid (Settled)',
      value: summary.totalAmountPaid,
      color: '#16A34A',
    },
    {
      name: 'Pending Payments',
      value: summary.totalPendingPayments,
      color: '#D97706',
    },
  ];

  const activeData = viewMode === 'count' ? countData : amountData;
  const totalValue = activeData.reduce((acc, curr) => acc + curr.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const pct = totalValue > 0 ? ((data.value / totalValue) * 100).toFixed(1) : 0;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-elevated border border-slate-700 text-xs">
          <p className="font-semibold text-white">{data.name}</p>
          <div className="mt-1 flex items-center justify-between gap-4">
            <span className="text-slate-400">Value:</span>
            <span className="font-bold text-white">
              {viewMode === 'count' ? `${formatNumber(data.value)} Farmers` : formatCurrency(data.value)}
            </span>
          </div>
          <div className="mt-0.5 flex items-center justify-between gap-4">
            <span className="text-slate-400">Share:</span>
            <span className="font-semibold text-lime-400">{pct}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const pendingPct =
    viewMode === 'count'
      ? summary.totalFarmers > 0
        ? Math.round((summary.pendingPaymentCount / summary.totalFarmers) * 100)
        : 0
      : summary.totalFactoryObligation > 0
      ? Math.round((summary.totalPendingPayments / summary.totalFactoryObligation) * 100)
      : 0;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Payment Status Overview
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Settled accounts vs outstanding pending payments
          </p>
        </div>

        {/* Toggle View Mode */}
        <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs font-medium">
          <button
            onClick={() => setViewMode('count')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              viewMode === 'count'
                ? 'bg-white text-forest-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Farmers
          </button>
          <button
            onClick={() => setViewMode('amount')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              viewMode === 'amount'
                ? 'bg-white text-forest-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Value (₹)
          </button>
        </div>
      </div>

      <div className="relative w-full h-56 flex items-center justify-center my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={activeData}
              innerRadius={65}
              outerRadius={88}
              paddingAngle={4}
              dataKey="value"
              animationDuration={800}
            >
              {activeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text inside Donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-slate-900 leading-none">
            {pendingPct}%
          </span>
          <span className="text-[11px] text-amber-700 font-semibold uppercase tracking-wider mt-1">
            Pending
          </span>
        </div>
      </div>

      {/* Legend & Breakdown */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
        <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span className="text-slate-700 font-medium">Fully Paid</span>
          </div>
          <span className="font-bold text-emerald-800">
            {viewMode === 'count'
              ? `${summary.fullyPaidCount} (${summary.totalFarmers - summary.pendingPaymentCount > 0 ? Math.round((summary.fullyPaidCount / summary.totalFarmers) * 100) : 0}%)`
              : formatCurrency(summary.totalAmountPaid)}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
            <span className="text-slate-700 font-medium">Pending</span>
          </div>
          <span className="font-bold text-amber-800">
            {viewMode === 'count'
              ? `${summary.pendingPaymentCount} (${pendingPct}%)`
              : formatCurrency(summary.totalPendingPayments)}
          </span>
        </div>
      </div>
    </div>
  );
};
