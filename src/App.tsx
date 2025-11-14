import { useState, useEffect } from 'react';
import { CalculatorInputs } from './types';
import { calculateResults, checkConstraints, formatCurrency, formatPercentage } from './calculationEngine';
import { DEFAULT_VALUES, SCENARIO_PRESETS } from './presets';
import SliderControl from './components/SliderControl';
import KeyMetrics from './components/KeyMetrics';
import WagesVsSavingsChart from './components/WagesVsSavingsChart';
import EffectiveWageChart from './components/EffectiveWageChart';
import CostBreakdownChart from './components/CostBreakdownChart';
import ConstraintViolations from './components/ConstraintViolations';
import ScenarioDropdown from './components/ScenarioDropdown';

const STORAGE_KEY = 'commons-calculator-inputs';

function App() {
  // Load from localStorage or use defaults
  const [inputs, setInputs] = useState<CalculatorInputs>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return DEFAULT_VALUES;
      }
    }
    return DEFAULT_VALUES;
  });

  // Save to localStorage whenever inputs change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  }, [inputs]);

  // Calculate results
  const results = calculateResults(inputs);
  const violations = checkConstraints(inputs, results);

  // Update individual input
  const updateInput = (key: keyof CalculatorInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  // Load scenario preset
  const loadPreset = (preset: typeof SCENARIO_PRESETS[0]) => {
    setInputs((prev) => ({ ...prev, ...preset.values }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Menu Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Commons Financial Calculator
              </h1>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                Interactive economic modeling for The Commons cooperative
              </p>
            </div>
            <ScenarioDropdown presets={SCENARIO_PRESETS} onSelectPreset={loadPreset} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Panel: Input Controls (40% on desktop) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Input Controls</h2>

            <SliderControl
              label="Food Cost per Meal"
              value={inputs.foodCost}
              min={4}
              max={7}
              step={0.25}
              onChange={(v) => updateInput('foodCost', v)}
              format={(v) => formatCurrency(v, 2)}
            />

            <SliderControl
              label="Public Meal Price"
              value={inputs.publicPrice}
              min={8}
              max={15}
              step={0.5}
              onChange={(v) => updateInput('publicPrice', v)}
              format={(v) => formatCurrency(v, 2)}
            />

            <SliderControl
              label="Member Meal Price"
              value={inputs.memberPrice}
              min={5}
              max={10}
              step={0.25}
              onChange={(v) => updateInput('memberPrice', v)}
              format={(v) => formatCurrency(v, 2)}
            />

            <SliderControl
              label="Base Hourly Wage"
              value={inputs.baseWage}
              min={15}
              max={25}
              step={1}
              onChange={(v) => updateInput('baseWage', v)}
              format={(v) => formatCurrency(v, 2)}
            />

            <SliderControl
              label="Daily Production Volume"
              value={inputs.dailyVolume}
              min={300}
              max={600}
              step={25}
              onChange={(v) => updateInput('dailyVolume', v)}
              format={(v) => `${v} meals`}
            />

            <SliderControl
              label="Member Meal Percentage"
              value={inputs.memberPercentage}
              min={15}
              max={35}
              step={1}
              onChange={(v) => updateInput('memberPercentage', v)}
              format={(v) => formatPercentage(v)}
            />

            <SliderControl
              label="Annual Operating Costs"
              value={inputs.annualOperating}
              min={80000}
              max={150000}
              step={5000}
              onChange={(v) => updateInput('annualOperating', v)}
              format={(v) => formatCurrency(v)}
            />

            <SliderControl
              label="Wage Distribution Percentage"
              value={inputs.wageDistribution}
              min={0}
              max={100}
              step={5}
              onChange={(v) => updateInput('wageDistribution', v)}
              format={(v) => formatPercentage(v)}
            />
          </div>

          {/* Right Panel: Outputs (60% on desktop) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Key Metrics */}
            <KeyMetrics results={results} />

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <WagesVsSavingsChart results={results} />
              <EffectiveWageChart inputs={inputs} />
            </div>

            <CostBreakdownChart results={results} />

            {/* Constraint Violations */}
            <ConstraintViolations violations={violations} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
