import { ConstraintViolation } from '../types';

interface ConstraintViolationsProps {
  violations: ConstraintViolation[];
}

export default function ConstraintViolations({ violations }: ConstraintViolationsProps) {
  if (violations.length === 0) {
    return null;
  }

  return (
    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
      <h3 className="text-lg font-bold text-red-800 mb-3">⚠️ Constraint Violations</h3>
      <ul className="space-y-2">
        {violations.map((violation, index) => (
          <li key={index} className="text-sm text-red-700 flex items-start">
            <span className="mr-2">•</span>
            <span>{violation.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
