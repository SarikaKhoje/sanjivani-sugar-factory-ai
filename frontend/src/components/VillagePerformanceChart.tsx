import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { VillageData } from '../types/farmer';
import { formatCurrency, formatTonnes } from '../utils/formatters';

interface VillagePerformanceChartProps {
  villages: VillageData[];
}

export const VillagePerformanceChart: React.FC<VillagePerformanceChartProps> = ({
  villages,
}) => {
  const sortedVillages = [...villages].sort((a, b) => b.suppliedTonnes - a.suppliedTonnes);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-elevated border border-slate-700 text-xs min-w-[200px]">
          <p className="font-bold text-sm text-lime-400">{data.village} Division</p>
          <p className="text-slate-300 text-[11px] mt-0.5">
            Registered Farmers: <span className="text-white font-semibold">{data.farmersCount}</span>
          </p>
          <div className="mt-2.5 space-y-1 pt-2 border-t border-slate-800">
            <div className="flex justify-between text-slate-300">
              <span>Total Cane:</span>
              <span className="font-bold text-white">{formatTonnes(data.suppliedTonnes)}</span>
            </div>
            <div className="flex justify-between text-emerald-400">
              <span>Paid:</span>
              <span className="font-semibold">{formatCurrency(data.amountPaid)}</span>
            </div>
            <div className="flex justify-between text-amber-400">
              <span>Pending:</span>
              <span className="font-semibold">{formatCurrency(data.pendingAmount)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Village Performance &amp; Cane Intake
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Regional sugarcane supply across factory catchment areas
          </p>
        </div>
      </div>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedVillages}
            layout="vertical"
            margin={{ top: 10, right: 20, left: 25, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis
              type="number"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tickFormatter={(v) => `${v}T`}
            />
            <YAxis
              type="category"
              dataKey="village"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="suppliedTonnes"
              name="Sugarcane Tonnes"
              fill="#15803D"
              radius={[0, 6, 6, 0]}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
