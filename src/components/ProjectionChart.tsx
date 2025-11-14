import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CalculatorInputs, ProjectionPoint } from '../types';
import { calculateResults } from '../calculationEngine';

interface ProjectionChartProps {
  inputs: CalculatorInputs;
  projectionMonths: number;
  volumeGrowthRate: number; // % per month
}

export default function ProjectionChart({ inputs, projectionMonths, volumeGrowthRate }: ProjectionChartProps) {
  // Generate projection data
  const data: ProjectionPoint[] = [];

  for (let month = 0; month <= projectionMonths; month++) {
    const growthFactor = Math.pow(1 + volumeGrowthRate / 100, month);
    const projectedVolume = Math.round(inputs.dailyVolume * growthFactor);

    const projectedInputs = {
      ...inputs,
      dailyVolume: projectedVolume,
    };

    const results = calculateResults(projectedInputs);

    data.push({
      month,
      surplus: results.surplus,
      effectiveWage: results.effectiveWage,
      totalMembers: results.totalMembers,
      dailyVolume: projectedVolume,
    });
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-200 mb-3">
        📈 Growth Projection ({volumeGrowthRate}% monthly growth)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="month"
            label={{ value: 'Months', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }}
            stroke="#9CA3AF"
          />
          <YAxis
            yAxisId="left"
            label={{ value: 'Surplus ($)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
            stroke="#9CA3AF"
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{ value: 'Effective Wage ($/hr)', angle: 90, position: 'insideRight', fill: '#9CA3AF' }}
            stroke="#9CA3AF"
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
            labelStyle={{ color: '#E5E7EB' }}
          />
          <Legend wrapperStyle={{ color: '#9CA3AF' }} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="surplus"
            stroke="#60A5FA"
            name="Surplus ($)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="effectiveWage"
            stroke="#10B981"
            name="Effective Wage ($/hr)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
