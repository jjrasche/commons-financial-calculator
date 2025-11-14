import { ScenarioPreset, CalculatorInputs } from './types';

export const DEFAULT_VALUES: CalculatorInputs = {
  foodCost: 5.0,
  publicPrice: 11.0,
  memberPrice: 7.0,
  baseWage: 20.0,
  dailyVolume: 500,
  memberPercentage: 23,
  annualOperating: 115000,
  wageDistribution: 50,
};

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    name: 'Growth Mode',
    values: {
      wageDistribution: 0,
      annualOperating: 115000,
      dailyVolume: 500,
    },
  },
  {
    name: 'Steady State',
    values: {
      wageDistribution: 50,
      annualOperating: 115000,
      dailyVolume: 500,
    },
  },
  {
    name: 'Member-Focused',
    values: {
      wageDistribution: 100,
      annualOperating: 115000,
      dailyVolume: 500,
    },
  },
  {
    name: 'High Volume',
    values: {
      dailyVolume: 600,
      memberPercentage: 20,
      wageDistribution: 50,
    },
  },
  {
    name: 'Budget Operations',
    values: {
      foodCost: 4.0,
      annualOperating: 80000,
      wageDistribution: 50,
    },
  },
];
