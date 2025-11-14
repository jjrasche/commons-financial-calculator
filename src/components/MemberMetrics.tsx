import { CalculationResults } from '../types';
import { formatCurrency } from '../calculationEngine';

interface MemberMetricsProps {
  results: CalculationResults;
}

export default function MemberMetrics({ results }: MemberMetricsProps) {
  const staffingColor =
    results.staffingRatio < 0.9 ? 'text-red-400' :
    results.staffingRatio > 1.2 ? 'text-yellow-400' :
    'text-green-400';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div className="bg-indigo-900/30 p-3 rounded-lg border border-indigo-700/50">
        <div className="text-xs text-indigo-400 font-medium mb-1">Total Members</div>
        <div className="text-xl md:text-2xl font-bold text-indigo-300">
          {results.totalMembers}
        </div>
      </div>

      <div className="bg-cyan-900/30 p-3 rounded-lg border border-cyan-700/50">
        <div className="text-xs text-cyan-400 font-medium mb-1">Avg Hours/Member</div>
        <div className="text-xl md:text-2xl font-bold text-cyan-300">
          {results.avgHoursPerMember.toFixed(1)}/mo
        </div>
      </div>

      <div className={`bg-gray-800 p-3 rounded-lg border ${
        results.staffingRatio < 0.9 ? 'border-red-700/50' :
        results.staffingRatio > 1.2 ? 'border-yellow-700/50' :
        'border-green-700/50'
      }`}>
        <div className="text-xs text-gray-400 font-medium mb-1">Staffing Level</div>
        <div className={`text-xl md:text-2xl font-bold ${staffingColor}`}>
          {(results.staffingRatio * 100).toFixed(0)}%
        </div>
      </div>

      <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
        <div className="text-xs text-gray-400 font-medium mb-1">Member Hours</div>
        <div className="text-xl md:text-2xl font-bold text-gray-300">
          {results.totalMemberHours.toFixed(0)}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Need: {results.laborHoursNeeded.toFixed(0)}
        </div>
      </div>
    </div>
  );
}
