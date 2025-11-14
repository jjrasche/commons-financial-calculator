import { CalculationResults } from '../types';
import { formatCurrency, formatPercentage } from '../calculationEngine';

interface KeyMetricsProps {
  results: CalculationResults;
}

export default function KeyMetrics({ results }: KeyMetricsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <div className="text-xs text-green-600 font-medium mb-1">Total Wages Distributed</div>
        <div className="text-2xl md:text-3xl font-bold text-green-700">
          {formatCurrency(Math.max(0, results.wagesPool))}/mo
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="text-xs text-blue-600 font-medium mb-1">Total Saved</div>
        <div className="text-2xl md:text-3xl font-bold text-blue-700">
          {formatCurrency(Math.max(0, results.savingsPool))}/mo
        </div>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <div className="text-xs text-purple-600 font-medium mb-1">Effective Wage</div>
        <div
          className={`text-2xl md:text-3xl font-bold ${
            results.effectiveWage > 60 ? 'text-red-600' : 'text-purple-700'
          }`}
        >
          {formatCurrency(results.effectiveWage, 2)}/hr
        </div>
      </div>

      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
        <div className="text-xs text-orange-600 font-medium mb-1">Margin of Safety</div>
        <div className="text-2xl md:text-3xl font-bold text-orange-700">
          {formatPercentage(results.marginOfSafety)}
        </div>
      </div>
    </div>
  );
}
