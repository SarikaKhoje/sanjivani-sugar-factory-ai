import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { FarmerRecord } from '../types/farmer';
import { formatTonnes } from '../utils/formatters';

interface SugarcaneSupplyChartProps {
  farmers: FarmerRecord[];
}

export const SugarcaneSupplyChart: React.FC<SugarcaneSupplyChartProps> = ({ farmers }) => {
  // Sort farmers by sugarcane supplied descending for a clean analytical view
  const chartData = [...farmers]
    .sort((a, b) => b.sugarcane_supplied_tonnes - a.sugarcane_supplied_tonnes)
    .map((f) => ({
      name: f.name.split(' ')[0], // First name for clean X-axis label
      fullName: f.name,
      village: f.village,
      tonnes: f.sugarcane_supplied_tonnes,
      status: f.payment_status,
    }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-elevated border border-slate-700 text-xs">
          <p className="font-bold text-sm text-lime-400">{data.fullName}</p>
          <p className="text-slate-300 mt-0.5">Village: <span className="text-white font-medium">{data.village}</span></p>
          <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between gap-4">
            <span className="text-slate-400">Sugarcane:</span>
            <span className="font-bold text-white text-sm">{formatTonnes(data.tonnes)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between gap-4">
            <span className="text-slate-400">Status:</span>
            <span className={`font-semibold ${data.status === 'PAID' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {data.status === 'PAID' ? 'Fully Paid' : 'Pending'}
            </span>
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
            Sugarcane Supplied by Farmer
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Total cane delivered per farmer (in metric tonnes)
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-block w-3 h-3 rounded-sm bg-forest-800"></span>
          <span className="text-slate-600 font-medium">Sugarcane (Tonnes)</span>
        </div>
      </div>

      <div className="w-full overflow-x-auto pb-1">
        <div className="min-w-[480px] sm:min-w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -15, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                interval={0}
                angle={-25}
                textAnchor="end"
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tickFormatter={(v) => `${v}T`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="tonnes"
                radius={[6, 6, 0, 0]}
                animationDuration={800}
              >
                {chartData.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? '#14532D' : '#166534'}
                    className="hover:fill-forest-600 transition-colors cursor-pointer"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
