import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { CalculatorInputs } from '../types';
import { calculateResults } from '../calculationEngine';

interface EffectiveWageChartProps {
  inputs: CalculatorInputs;
}

export default function EffectiveWageChart({ inputs }: EffectiveWageChartProps) {
  // Generate data points from 0% to 100% distribution
  const data = [];
  for (let i = 0; i <= 100; i += 5) {
    const tempInputs = { ...inputs, wageDistribution: i };
    const results = calculateResults(tempInputs);
    data.push({
      distribution: i,
      effectiveWage: results.effectiveWage,
    });
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-200 mb-3">Effective Wage Curve</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="distribution"
            label={{ value: 'Distribution %', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }}
            stroke="#9CA3AF"
          />
          <YAxis
            label={{ value: '$/hr', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
            stroke="#9CA3AF"
          />
          <Tooltip
            formatter={(value) => `$${Number(value).toFixed(2)}/hr`}
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
            labelStyle={{ color: '#E5E7EB' }}
            itemStyle={{ color: '#6EE7B7' }}
          />
          <Legend wrapperStyle={{ color: '#9CA3AF' }} />
          <ReferenceLine y={60} stroke="#F87171" strokeDasharray="3 3" label={{ value: "$60/hr cap", fill: '#F87171' }} />
          <Line type="monotone" dataKey="effectiveWage" stroke="#10B981" name="Effective Wage" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
