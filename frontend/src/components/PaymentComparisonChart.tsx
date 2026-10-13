import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { FarmerRecord } from '../types/farmer';
import { formatCurrency } from '../utils/formatters';

interface PaymentComparisonChartProps {
  farmers: FarmerRecord[];
}

export const PaymentComparisonChart: React.FC<PaymentComparisonChartProps> = ({
  farmers,
}) => {
  const chartData = farmers.map((f) => ({
    name: f.name.split(' ')[0],
    fullName: f.name,
    village: f.village,
    amountPaid: f.amount_paid,
    pendingPayment: f.payment_pending_amount,
    totalValue: f.total_payment_value,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-elevated border border-slate-700 text-xs min-w-[210px]">
          <p className="font-bold text-sm text-lime-400">{data.fullName}</p>
          <p className="text-slate-300 text-[11px]">{data.village}</p>
          
          <div className="mt-2.5 space-y-1.5 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Amount Paid:
              </span>
              <span className="font-semibold">{formatCurrency(data.amountPaid)}</span>
            </div>

            <div className="flex items-center justify-between text-amber-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Pending Payment:
              </span>
              <span className="font-semibold">{formatCurrency(data.pendingPayment)}</span>
            </div>

            <div className="flex items-center justify-between text-slate-300 pt-1.5 border-t border-slate-800 font-medium">
              <span>Total Value:</span>
              <span className="text-white font-bold">{formatCurrency(data.totalValue)}</span>
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
            Payment Comparison per Farmer
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Amount paid versus pending payment balances
          </p>
        </div>
      </div>

      <div className="w-full overflow-x-auto pb-1">
        <div className="min-w-[520px] sm:min-w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
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
                tickFormatter={(v) => `₹${v / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
                formatter={(value) => (
                  <span className="text-xs text-slate-600 font-medium">
                    {value === 'amountPaid' ? 'Amount Paid (₹)' : 'Pending Payment (₹)'}
                  </span>
                )}
              />
              <Bar
                dataKey="amountPaid"
                name="amountPaid"
                fill="#16A34A"
                radius={[4, 4, 0, 0]}
                animationDuration={800}
              />
              <Bar
                dataKey="pendingPayment"
                name="pendingPayment"
                fill="#D97706"
                radius={[4, 4, 0, 0]}
                animationDuration={800}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
