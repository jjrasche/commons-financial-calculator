import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CalculationResults } from '../types';

interface CostBreakdownChartProps {
  results: CalculationResults;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

export default function CostBreakdownChart({ results }: CostBreakdownChartProps) {
  const data = [
    { name: 'Food Cost', value: results.monthlyFoodCost },
    { name: 'Base Labor', value: results.monthlyBaseLaborCost },
    { name: 'Operating', value: results.monthlyOperating },
  ];

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Monthly Cost Breakdown</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry) => `${entry.name}: ${((entry.value / results.totalCosts) * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
