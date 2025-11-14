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
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Effective Wage Curve</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="distribution" label={{ value: 'Distribution %', position: 'insideBottom', offset: -5 }} />
          <YAxis label={{ value: '$/hr', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}/hr`} />
          <Legend />
          <ReferenceLine y={60} stroke="red" strokeDasharray="3 3" label="$60/hr cap" />
          <Line type="monotone" dataKey="effectiveWage" stroke="#82ca9d" name="Effective Wage" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
