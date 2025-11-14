import { useState, useEffect } from 'react';
import { CalculatorInputs, MemberTiers } from './types';
import { calculateResults, checkConstraints, formatCurrency, formatPercentage } from './calculationEngine';
import { DEFAULT_VALUES, SCENARIO_PRESETS } from './presets';
import SliderControl from './components/SliderControl';
import KeyMetrics from './components/KeyMetrics';
import MemberMetrics from './components/MemberMetrics';
import MemberTierControls from './components/MemberTierControls';
import WagesVsSavingsChart from './components/WagesVsSavingsChart';
import EffectiveWageChart from './components/EffectiveWageChart';
import CostBreakdownChart from './components/CostBreakdownChart';
import ProjectionChart from './components/ProjectionChart';
import ConstraintViolations from './components/ConstraintViolations';
import ScenarioDropdown from './components/ScenarioDropdown';
import ComparisonView from './components/ComparisonView';
import PersonalCalculator from './components/PersonalCalculator';

const STORAGE_KEY = 'commons-calculator-inputs';

function App() {
  // Load from localStorage or use defaults
  const [inputs, setInputs] = useState<CalculatorInputs>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Ensure memberTiers exists for backward compatibility
        if (!parsed.memberTiers) {
          parsed.memberTiers = DEFAULT_VALUES.memberTiers;
        }
        return parsed;
      } catch (e) {
        return DEFAULT_VALUES;
      }
    }
    return DEFAULT_VALUES;
  });

  // Comparison mode state
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonInputs, setComparisonInputs] = useState<CalculatorInputs>(inputs);

  // Projection settings
  const [projectionMonths, setProjectionMonths] = useState(24);
  const [volumeGrowthRate, setVolumeGrowthRate] = useState(2); // % per month
  const [showProjections, setShowProjections] = useState(true);

  // View mode: personal or operational
  const [viewMode, setViewMode] = useState<'personal' | 'operational'>('personal');

  // Save to localStorage whenever inputs change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  }, [inputs]);

  // Calculate results
  const results = calculateResults(inputs);
  const violations = checkConstraints(inputs, results);
  const comparisonResults = calculateResults(comparisonInputs);

  // Update individual input
  const updateInput = (key: keyof CalculatorInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  // Update member tiers
  const updateMemberTiers = (tiers: MemberTiers) => {
    setInputs((prev) => ({ ...prev, memberTiers: tiers }));
  };

  // Load scenario preset
  const loadPreset = (preset: typeof SCENARIO_PRESETS[0]) => {
    setInputs((prev) => ({ ...prev, ...preset.values }));
  };

  // Snapshot current scenario for comparison
  const snapshotForComparison = () => {
    setComparisonInputs(inputs);
    setShowComparison(true);
  };

  // Reset to defaults
  const resetToDefaults = () => {
    setInputs(DEFAULT_VALUES);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Comparison Modal */}
      {showComparison && (
        <ComparisonView
          currentResults={results}
          comparisonResults={comparisonResults}
          onClose={() => setShowComparison(false)}
        />
      )}

      {/* Top Menu Bar */}
      <div className="bg-gray-800 border-b border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-100">
                Commons Financial Calculator
              </h1>
              <p className="text-xs md:text-sm text-gray-400 mt-1">
                Interactive economic modeling for The Commons cooperative
              </p>
            </div>
            {viewMode === 'operational' && (
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={snapshotForComparison}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  📊 Compare Scenario
                </button>
                <button
                  onClick={resetToDefaults}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  ↺ Reset
                </button>
                <ScenarioDropdown presets={SCENARIO_PRESETS} onSelectPreset={loadPreset} />
              </div>
            )}
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('personal')}
              className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${
                viewMode === 'personal'
                  ? 'bg-gray-900 text-blue-400 border-b-2 border-blue-400'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              👤 Personal Calculator
            </button>
            <button
              onClick={() => setViewMode('operational')}
              className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${
                viewMode === 'operational'
                  ? 'bg-gray-900 text-green-400 border-b-2 border-green-400'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🏢 Operational Model
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {viewMode === 'personal' ? (
          <PersonalCalculator />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Panel: Input Controls (40% on desktop) */}
          <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700">
            <h2 className="text-lg font-semibold text-gray-100 mb-6">💰 Financial Controls</h2>

            <SliderControl
              label="Food Cost per Meal"
              value={inputs.foodCost}
              min={2}
              max={12}
              step={0.25}
              onChange={(v) => updateInput('foodCost', v)}
              format={(v) => formatCurrency(v, 2)}
            />

            <SliderControl
              label="Public Meal Price"
              value={inputs.publicPrice}
              min={5}
              max={25}
              step={0.5}
              onChange={(v) => updateInput('publicPrice', v)}
              format={(v) => formatCurrency(v, 2)}
            />

            <SliderControl
              label="Member Meal Price"
              value={inputs.memberPrice}
              min={3}
              max={20}
              step={0.25}
              onChange={(v) => updateInput('memberPrice', v)}
              format={(v) => formatCurrency(v, 2)}
            />

            <SliderControl
              label="Base Hourly Wage"
              value={inputs.baseWage}
              min={10}
              max={40}
              step={0.5}
              onChange={(v) => updateInput('baseWage', v)}
              format={(v) => formatCurrency(v, 2)}
            />

            <SliderControl
              label="Daily Production Volume"
              value={inputs.dailyVolume}
              min={100}
              max={1000}
              step={10}
              onChange={(v) => updateInput('dailyVolume', v)}
              format={(v) => `${v} meals`}
            />

            <SliderControl
              label="Member Meal Percentage"
              value={inputs.memberPercentage}
              min={5}
              max={50}
              step={1}
              onChange={(v) => updateInput('memberPercentage', v)}
              format={(v) => formatPercentage(v)}
            />

            <SliderControl
              label="Annual Operating Costs"
              value={inputs.annualOperating}
              min={40000}
              max={300000}
              step={5000}
              onChange={(v) => updateInput('annualOperating', v)}
              format={(v) => formatCurrency(v)}
            />

            <SliderControl
              label="Wage Distribution Percentage"
              value={inputs.wageDistribution}
              min={0}
              max={100}
              step={1}
              onChange={(v) => updateInput('wageDistribution', v)}
              format={(v) => formatPercentage(v)}
            />

            {/* Member Tier Controls */}
            <MemberTierControls
              tiers={inputs.memberTiers}
              onChange={updateMemberTiers}
            />
          </div>

          {/* Right Panel: Outputs (60% on desktop) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Key Metrics */}
            <KeyMetrics results={results} />

            {/* Member Metrics */}
            <MemberMetrics results={results} />

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <WagesVsSavingsChart results={results} />
              <EffectiveWageChart inputs={inputs} />
            </div>

            <CostBreakdownChart results={results} />

            {/* Projection Chart with Controls */}
            {showProjections && (
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="flex flex-wrap gap-4 mb-4 items-center">
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-xs text-gray-400 block mb-1">Projection Months</label>
                    <input
                      type="range"
                      min={6}
                      max={120}
                      step={6}
                      value={projectionMonths}
                      onChange={(e) => setProjectionMonths(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="text-xs text-gray-500 mt-1">{projectionMonths} months ({(projectionMonths / 12).toFixed(1)} years)</div>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-xs text-gray-400 block mb-1">Volume Growth Rate</label>
                    <input
                      type="range"
                      min={-5}
                      max={20}
                      step={0.5}
                      value={volumeGrowthRate}
                      onChange={(e) => setVolumeGrowthRate(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {volumeGrowthRate > 0 ? '+' : ''}{volumeGrowthRate}% per month
                      {volumeGrowthRate !== 0 && ` (${(Math.pow(1 + volumeGrowthRate / 100, 12) * 100 - 100).toFixed(0)}% annual)`}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowProjections(false)}
                    className="text-gray-400 hover:text-gray-200 text-xs"
                  >
                    ✕ Hide
                  </button>
                </div>
                <ProjectionChart
                  inputs={inputs}
                  projectionMonths={projectionMonths}
                  volumeGrowthRate={volumeGrowthRate}
                />
              </div>
            )}

            {!showProjections && (
              <button
                onClick={() => setShowProjections(true)}
                className="w-full bg-gray-800 p-4 rounded-lg border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600 transition-colors"
              >
                📈 Show Growth Projections
              </button>
            )}

            {/* Constraint Violations */}
            <ConstraintViolations violations={violations} />
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

export default App;
