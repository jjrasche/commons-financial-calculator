import { MemberTiers } from '../types';

interface MemberTierControlsProps {
  tiers: MemberTiers;
  onChange: (tiers: MemberTiers) => void;
}

export default function MemberTierControls({ tiers, onChange }: MemberTierControlsProps) {
  const updateTier = (tier: keyof MemberTiers, value: number) => {
    onChange({ ...tiers, [tier]: value });
  };

  return (
    <div className="bg-gray-750 p-4 rounded-lg border border-gray-600 mb-4">
      <h3 className="text-md font-semibold text-gray-100 mb-4">👥 Member Structure</h3>

      <div className="space-y-4">
        {/* Tier 1: 8 hrs/month */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-300">
              Tier 1 <span className="text-gray-500">(8 hrs/mo)</span>
            </label>
            <span className="text-sm font-semibold text-blue-400 bg-blue-900/30 px-3 py-1 rounded">
              {tiers.tier1Count} members
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={500}
            step={5}
            value={tiers.tier1Count}
            onChange={(e) => updateTier('tier1Count', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>500</span>
          </div>
        </div>

        {/* Tier 2: 20 hrs/month */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-300">
              Tier 2 <span className="text-gray-500">(20 hrs/mo)</span>
            </label>
            <span className="text-sm font-semibold text-green-400 bg-green-900/30 px-3 py-1 rounded">
              {tiers.tier2Count} members
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={300}
            step={5}
            value={tiers.tier2Count}
            onChange={(e) => updateTier('tier2Count', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>300</span>
          </div>
        </div>

        {/* Tier 3: 40 hrs/month */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-300">
              Tier 3 <span className="text-gray-500">(40 hrs/mo)</span>
            </label>
            <span className="text-sm font-semibold text-purple-400 bg-purple-900/30 px-3 py-1 rounded">
              {tiers.tier3Count} members
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={200}
            step={5}
            value={tiers.tier3Count}
            onChange={(e) => updateTier('tier3Count', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>200</span>
          </div>
        </div>
      </div>
    </div>
  );
}
