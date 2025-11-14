import { CalculatorInputs, CalculationResults, ConstraintViolation } from './types';

export function calculateResults(inputs: CalculatorInputs): CalculationResults {
  const {
    foodCost,
    publicPrice,
    memberPrice,
    baseWage,
    dailyVolume,
    memberPercentage,
    annualOperating,
    wageDistribution,
  } = inputs;

  // Monthly Revenue
  const memberMealsPerDay = dailyVolume * (memberPercentage / 100);
  const publicMealsPerDay = dailyVolume * (1 - memberPercentage / 100);
  const monthlyMemberRevenue = memberMealsPerDay * memberPrice * 30;
  const monthlyPublicRevenue = publicMealsPerDay * publicPrice * 30;
  const totalRevenue = monthlyMemberRevenue + monthlyPublicRevenue;

  // Monthly Costs
  const monthlyFoodCost = dailyVolume * foodCost * 30;
  const monthlyOperating = annualOperating / 12;
  const laborHoursPerDay = dailyVolume / 8.5;
  const monthlyLaborHours = laborHoursPerDay * 30;
  const monthlyBaseLaborCost = monthlyLaborHours * baseWage;
  const totalCosts = monthlyFoodCost + monthlyOperating + monthlyBaseLaborCost;

  // Surplus & Distribution
  const surplus = totalRevenue - totalCosts;
  const wagesPool = surplus * (wageDistribution / 100);
  const savingsPool = surplus * (1 - wageDistribution / 100);
  const bonusPerHour = monthlyLaborHours > 0 ? wagesPool / monthlyLaborHours : 0;
  const effectiveWage = baseWage + bonusPerHour;

  // Breakeven
  const breakeven = totalCosts;
  const marginOfSafety = totalRevenue > 0 ? ((totalRevenue - breakeven) / totalRevenue) * 100 : 0;

  return {
    memberMealsPerDay,
    publicMealsPerDay,
    monthlyMemberRevenue,
    monthlyPublicRevenue,
    totalRevenue,
    monthlyFoodCost,
    monthlyOperating,
    laborHoursPerDay,
    monthlyLaborHours,
    monthlyBaseLaborCost,
    totalCosts,
    surplus,
    wagesPool,
    savingsPool,
    bonusPerHour,
    effectiveWage,
    breakeven,
    marginOfSafety,
  };
}

export function checkConstraints(
  inputs: CalculatorInputs,
  results: CalculationResults
): ConstraintViolation[] {
  const violations: ConstraintViolation[] = [];

  // 1. Effective Wage <= $60/hr
  if (results.effectiveWage > 60) {
    violations.push({
      type: 'wage_cap',
      message: `Effective wage ($${results.effectiveWage.toFixed(2)}/hr) exceeds $60/hr cap`,
    });
  }

  // 2. Public Price >= 1.3 × Food Cost
  const minPublicPrice = inputs.foodCost * 1.3;
  if (inputs.publicPrice < minPublicPrice) {
    violations.push({
      type: 'public_markup',
      message: `Public price ($${inputs.publicPrice.toFixed(2)}) below minimum 1.3x food cost ($${minPublicPrice.toFixed(2)})`,
    });
  }

  // 3. Public Price <= $15/meal
  if (inputs.publicPrice > 15) {
    violations.push({
      type: 'public_ceiling',
      message: `Public price ($${inputs.publicPrice.toFixed(2)}) exceeds $15/meal ceiling`,
    });
  }

  // 4. Member Price >= Food Cost
  if (inputs.memberPrice < inputs.foodCost) {
    violations.push({
      type: 'member_floor',
      message: `Member price ($${inputs.memberPrice.toFixed(2)}) below food cost ($${inputs.foodCost.toFixed(2)})`,
    });
  }

  // 5. Member Price <= Public Price
  if (inputs.memberPrice > inputs.publicPrice) {
    violations.push({
      type: 'member_ceiling',
      message: `Member price ($${inputs.memberPrice.toFixed(2)}) above public price ($${inputs.publicPrice.toFixed(2)})`,
    });
  }

  // 6. Labor Hours/Day <= 60
  if (results.laborHoursPerDay > 60) {
    violations.push({
      type: 'labor_limit',
      message: `Daily labor (${Math.round(results.laborHoursPerDay)} hrs) exceeds 60-hour limit`,
    });
  }

  // 7. Surplus >= $0 (no deficit)
  if (results.surplus < 0) {
    violations.push({
      type: 'deficit',
      message: `Operating at deficit: -$${Math.abs(results.surplus).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/month`,
    });
  }

  return violations;
}

export function formatCurrency(value: number, decimals: number = 0): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(0)}%`;
}
