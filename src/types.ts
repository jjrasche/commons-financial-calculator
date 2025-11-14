export interface MemberTiers {
  tier1Count: number; // 8 hrs/month
  tier2Count: number; // 20 hrs/month
  tier3Count: number; // 40 hrs/month
}

export interface CalculatorInputs {
  foodCost: number;
  publicPrice: number;
  memberPrice: number;
  baseWage: number;
  dailyVolume: number;
  memberPercentage: number;
  annualOperating: number;
  wageDistribution: number;
  memberTiers: MemberTiers;
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

  // Member Metrics
  totalMembers: number;
  totalMemberHours: number;
  laborHoursNeeded: number;
  staffingRatio: number; // actual / needed
  avgHoursPerMember: number;
}

export interface ProjectionPoint {
  month: number;
  surplus: number;
  effectiveWage: number;
  totalMembers: number;
  dailyVolume: number;
}

export interface ConstraintViolation {
  type: string;
  message: string;
}

export interface ScenarioPreset {
  name: string;
  values: Partial<CalculatorInputs>;
}
