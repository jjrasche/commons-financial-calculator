export interface CalculatorInputs {
  foodCost: number;
  publicPrice: number;
  memberPrice: number;
  baseWage: number;
  dailyVolume: number;
  memberPercentage: number;
  annualOperating: number;
  wageDistribution: number;
}

export interface CalculationResults {
  // Revenue
  memberMealsPerDay: number;
  publicMealsPerDay: number;
  monthlyMemberRevenue: number;
  monthlyPublicRevenue: number;
  totalRevenue: number;

  // Costs
  monthlyFoodCost: number;
  monthlyOperating: number;
  laborHoursPerDay: number;
  monthlyLaborHours: number;
  monthlyBaseLaborCost: number;
  totalCosts: number;

  // Surplus & Distribution
  surplus: number;
  wagesPool: number;
  savingsPool: number;
  bonusPerHour: number;
  effectiveWage: number;

  // Breakeven
  breakeven: number;
  marginOfSafety: number;
}

export interface ConstraintViolation {
  type: string;
  message: string;
}

export interface ScenarioPreset {
  name: string;
  values: Partial<CalculatorInputs>;
}
