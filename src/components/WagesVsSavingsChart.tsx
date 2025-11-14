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
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Wages vs Savings</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
          <Legend />
          <Bar dataKey="amount" fill="#8884d8" name="Amount ($)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
