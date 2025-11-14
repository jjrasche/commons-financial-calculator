import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CalculationResults } from '../types';

interface WagesVsSavingsChartProps {
  results: CalculationResults;
}

export default function WagesVsSavingsChart({ results }: WagesVsSavingsChartProps) {
  const data = [
    {
      name: 'Wages',
      amount: Math.max(0, results.wagesPool),
    },
    {
      name: 'Savings',
      amount: Math.max(0, results.savingsPool),
    },
  ];

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-200 mb-3">Wages vs Savings</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip
            formatter={(value) => `$${Number(value).toLocaleString()}`}
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
            labelStyle={{ color: '#E5E7EB' }}
            itemStyle={{ color: '#93C5FD' }}
          />
          <Legend wrapperStyle={{ color: '#9CA3AF' }} />
          <Bar dataKey="amount" fill="#60A5FA" name="Amount ($)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
