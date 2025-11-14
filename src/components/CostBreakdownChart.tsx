import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CalculationResults } from '../types';

interface CostBreakdownChartProps {
  results: CalculationResults;
}

const COLORS = ['#60A5FA', '#34D399', '#FBBF24'];

export default function CostBreakdownChart({ results }: CostBreakdownChartProps) {
  const data = [
    { name: 'Food Cost', value: results.monthlyFoodCost },
    { name: 'Base Labor', value: results.monthlyBaseLaborCost },
    { name: 'Operating', value: results.monthlyOperating },
  ];

  const renderLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    name,
    value,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const percent = ((value / results.totalCosts) * 100).toFixed(0);

    return (
      <text
        x={x}
        y={y}
        fill="#E5E7EB"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight={500}
      >
        {`${name}: ${percent}%`}
      </text>
    );
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-200 mb-3">Monthly Cost Breakdown</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `$${Number(value).toLocaleString()}`}
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
            labelStyle={{ color: '#E5E7EB' }}
          />
          <Legend wrapperStyle={{ color: '#9CA3AF' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
