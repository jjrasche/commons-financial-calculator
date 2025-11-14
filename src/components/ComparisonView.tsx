import { CalculationResults } from '../types';
import { formatCurrency, formatPercentage } from '../calculationEngine';

interface ComparisonViewProps {
  currentResults: CalculationResults;
  comparisonResults: CalculationResults;
  onClose: () => void;
}

export default function ComparisonView({ currentResults, comparisonResults, onClose }: ComparisonViewProps) {
  const metrics = [
    { label: 'Total Surplus', key: 'surplus', format: (v: number) => formatCurrency(v) },
    { label: 'Effective Wage', key: 'effectiveWage', format: (v: number) => formatCurrency(v, 2) + '/hr' },
    { label: 'Total Members', key: 'totalMembers', format: (v: number) => v.toString() },
    { label: 'Wages Distributed', key: 'wagesPool', format: (v: number) => formatCurrency(v) },
    { label: 'Savings Pool', key: 'savingsPool', format: (v: number) => formatCurrency(v) },
    { label: 'Margin of Safety', key: 'marginOfSafety', format: (v: number) => formatPercentage(v) },
    { label: 'Staffing Level', key: 'staffingRatio', format: (v: number) => (v * 100).toFixed(0) + '%' },
    { label: 'Daily Volume', key: 'memberMealsPerDay', format: (_v: number, r: CalculationResults) =>
      `${(r.memberMealsPerDay + r.publicMealsPerDay).toFixed(0)} meals`
    },
  ];

  const getDelta = (key: string): number => {
    const current = (currentResults as any)[key];
    const comparison = (comparisonResults as any)[key];
    return comparison - current;
  };

  const getDeltaColor = (delta: number): string => {
    if (Math.abs(delta) < 0.01) return 'text-gray-400';
    return delta > 0 ? 'text-green-400' : 'text-red-400';
  };

  const formatDelta = (delta: number, metric: any): string => {
    if (Math.abs(delta) < 0.01) return '—';
    const sign = delta > 0 ? '+' : '';
    if (metric.key === 'marginOfSafety' || metric.key === 'staffingRatio') {
      return `${sign}${delta.toFixed(1)}%`;
    }
    if (metric.key === 'effectiveWage') {
      return `${sign}$${delta.toFixed(2)}`;
    }
    if (metric.key === 'totalMembers') {
      return `${sign}${delta.toFixed(0)}`;
    }
    return `${sign}$${delta.toFixed(0)}`;
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-100">📊 Scenario Comparison</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-3 gap-4 mb-4 text-sm font-semibold text-gray-300">
            <div>Metric</div>
            <div className="text-center">Current</div>
            <div className="text-center">Comparison (Δ)</div>
          </div>

          {metrics.map((metric) => {
            const current = (currentResults as any)[metric.key];
            const comparison = (comparisonResults as any)[metric.key];
            const delta = getDelta(metric.key);
            const deltaColor = getDeltaColor(delta);

            return (
              <div
                key={metric.key}
                className="grid grid-cols-3 gap-4 py-3 border-b border-gray-700 text-sm"
              >
                <div className="text-gray-300 font-medium">{metric.label}</div>
                <div className="text-center text-gray-200">
                  {metric.format ? metric.format(current, currentResults) : current}
                </div>
                <div className="text-center">
                  <span className="text-gray-200">
                    {metric.format ? metric.format(comparison, comparisonResults) : comparison}
                  </span>
                  <span className={`ml-2 ${deltaColor} font-semibold`}>
                    ({formatDelta(delta, metric)})
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-gray-750 border-t border-gray-700">
          <p className="text-xs text-gray-400 text-center">
            Green = improvement, Red = decline, Gray = no change
          </p>
        </div>
      </div>
    </div>
  );
}
