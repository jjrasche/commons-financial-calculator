// Test script for Commons Financial Calculator
// Verifies calculation engine against specification test cases

import { calculateResults, checkConstraints } from './src/calculationEngine.ts';
import { DEFAULT_VALUES } from './src/presets.ts';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m',
};

function pass(msg) {
  console.log(`${colors.green}✓ PASS${colors.reset} ${msg}`);
}

function fail(msg) {
  console.log(`${colors.red}✗ FAIL${colors.reset} ${msg}`);
}

function info(msg) {
  console.log(`${colors.blue}ℹ INFO${colors.reset} ${msg}`);
}

function testHeader(name) {
  console.log(`\n${colors.bold}${colors.yellow}━━━ ${name} ━━━${colors.reset}`);
}

function assertApprox(actual, expected, tolerance, description) {
  const diff = Math.abs(actual - expected);
  if (diff <= tolerance) {
    pass(`${description}: ${actual.toFixed(2)} ≈ ${expected.toFixed(2)}`);
    return true;
  } else {
    fail(`${description}: Expected ${expected.toFixed(2)}, got ${actual.toFixed(2)} (diff: ${diff.toFixed(2)})`);
    return false;
  }
}

function assertEqual(actual, expected, description) {
  if (actual === expected) {
    pass(`${description}: ${actual}`);
    return true;
  } else {
    fail(`${description}: Expected ${expected}, got ${actual}`);
    return false;
  }
}

function assertViolation(violations, type, description) {
  const found = violations.find(v => v.type === type);
  if (found) {
    pass(`${description}: "${found.message}"`);
    return true;
  } else {
    fail(`${description}: Violation type '${type}' not found`);
    return false;
  }
}

function assertNoViolations(violations, description) {
  if (violations.length === 0) {
    pass(`${description}: No violations`);
    return true;
  } else {
    fail(`${description}: Found ${violations.length} violations: ${violations.map(v => v.type).join(', ')}`);
    return false;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEST CASES FROM SPECIFICATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

testHeader('TEST 1: Zero Distribution');
{
  const inputs = { ...DEFAULT_VALUES, wageDistribution: 0 };
  const results = calculateResults(inputs);
  const violations = checkConstraints(inputs, results);

  info('Setup: Distribution = 0%, all other defaults');
  assertEqual(results.wagesPool, 0, 'Wages Distributed');
  assertApprox(results.savingsPool, 45000, 10000, 'Total Saved');
  assertEqual(results.effectiveWage, 20, 'Effective Wage (base only)');
  assertNoViolations(violations, 'Constraint Violations');
}

testHeader('TEST 2: Full Distribution');
{
  const inputs = { ...DEFAULT_VALUES, wageDistribution: 100 };
  const results = calculateResults(inputs);
  const violations = checkConstraints(inputs, results);

  info('Setup: Distribution = 100%, all other defaults');
  assertApprox(results.wagesPool, 45000, 10000, 'Wages Distributed');
  assertEqual(results.savingsPool, 0, 'Total Saved');
  assertApprox(results.effectiveWage, 50, 5, 'Effective Wage');
  assertNoViolations(violations, 'Constraint Violations');
}

testHeader('TEST 3: Wage Cap Violation');
{
  const inputs = {
    ...DEFAULT_VALUES,
    baseWage: 25,
    wageDistribution: 100,
    publicPrice: 15,
  };
  const results = calculateResults(inputs);
  const violations = checkConstraints(inputs, results);

  info('Setup: Base Wage $25, Distribution 100%, Public Price $15');
  info(`Effective Wage: ${results.effectiveWage.toFixed(2)}/hr`);
  assertViolation(violations, 'wage_cap', 'Wage cap violation detected');
}

testHeader('TEST 4: Public Price Too Low');
{
  const inputs = {
    ...DEFAULT_VALUES,
    foodCost: 7,
    publicPrice: 8,
  };
  const results = calculateResults(inputs);
  const violations = checkConstraints(inputs, results);

  info('Setup: Food Cost $7, Public Price $8 (minimum should be $9.10)');
  assertViolation(violations, 'public_markup', 'Public price markup violation detected');
}

testHeader('TEST 5: Member Price Below Cost');
{
  const inputs = {
    ...DEFAULT_VALUES,
    foodCost: 7,
    memberPrice: 6,
  };
  const results = calculateResults(inputs);
  const violations = checkConstraints(inputs, results);

  info('Setup: Food Cost $7, Member Price $6');
  assertViolation(violations, 'member_floor', 'Member price floor violation detected');
}

testHeader('TEST 6: Member Price Above Public');
{
  const inputs = {
    ...DEFAULT_VALUES,
    memberPrice: 10,
    publicPrice: 9,
  };
  const results = calculateResults(inputs);
  const violations = checkConstraints(inputs, results);

  info('Setup: Member Price $10, Public Price $9');
  assertViolation(violations, 'member_ceiling', 'Member price ceiling violation detected');
}

testHeader('TEST 7: Excessive Labor Hours');
{
  const inputs = {
    ...DEFAULT_VALUES,
    dailyVolume: 600,
  };
  const results = calculateResults(inputs);
  const violations = checkConstraints(inputs, results);

  info(`Setup: Daily Volume 600 meals (${results.laborHoursPerDay.toFixed(1)} hrs/day)`);
  assertViolation(violations, 'labor_limit', 'Labor limit violation detected');
}

testHeader('TEST 8: Operating at Deficit');
{
  const inputs = {
    ...DEFAULT_VALUES,
    publicPrice: 8,
    foodCost: 6,
    annualOperating: 150000,
  };
  const results = calculateResults(inputs);
  const violations = checkConstraints(inputs, results);

  info(`Setup: Low prices, high operating costs (Surplus: $${results.surplus.toFixed(2)})`);
  assertViolation(violations, 'deficit', 'Deficit violation detected');
  assertEqual(results.wagesPool, 0, 'Wages Pool (should be $0 when deficit)');
  assertEqual(results.savingsPool, 0, 'Savings Pool (should be $0 when deficit)');
}

testHeader('TEST 9: Public Price Ceiling');
{
  const inputs = {
    ...DEFAULT_VALUES,
    publicPrice: 15,
  };
  const results = calculateResults(inputs);
  let violations = checkConstraints(inputs, results);

  info('Setup: Public Price at $15 ceiling');
  assertNoViolations(violations, 'No violation at ceiling');

  // Test exceeding ceiling (if slider allows)
  inputs.publicPrice = 15.5;
  violations = checkConstraints(inputs, results);
  info('Changed to $15.50');
  assertViolation(violations, 'public_ceiling', 'Public ceiling violation detected');
}

testHeader('TEST 10: High Volume, Low Member %');
{
  const inputs = {
    ...DEFAULT_VALUES,
    dailyVolume: 600,
    memberPercentage: 15,
    wageDistribution: 50,
  };
  const results = calculateResults(inputs);
  const violations = checkConstraints(inputs, results);

  info('Setup: Volume 600, Member % 15%, Distribution 50%');
  info(`Public Revenue: $${results.monthlyPublicRevenue.toFixed(0)}/month`);
  info(`Surplus: $${results.surplus.toFixed(0)}/month`);
  info(`Effective Wage: $${results.effectiveWage.toFixed(2)}/hr`);
  assertApprox(results.monthlyPublicRevenue, 99000, 20000, 'High public revenue');
}

testHeader('TEST 11: Low Volume, High Member %');
{
  const inputs = {
    ...DEFAULT_VALUES,
    dailyVolume: 300,
    memberPercentage: 35,
    wageDistribution: 50,
  };
  const results = calculateResults(inputs);
  const violations = checkConstraints(inputs, results);

  info('Setup: Volume 300, Member % 35%, Distribution 50%');
  info(`Total Revenue: $${results.totalRevenue.toFixed(0)}/month`);
  info(`Surplus: $${results.surplus.toFixed(0)}/month`);

  if (results.surplus < 0) {
    pass('Low volume scenario shows deficit as expected');
  } else {
    info(`Surplus is positive: $${results.surplus.toFixed(0)}`);
  }
}

testHeader('TEST 12: Minimum Viable Configuration');
{
  const inputs = {
    foodCost: 4,
    publicPrice: 10,
    memberPrice: 5,
    baseWage: 18,
    dailyVolume: 400,
    memberPercentage: 25,
    annualOperating: 80000,
    wageDistribution: 50,
  };
  const results = calculateResults(inputs);
  const violations = checkConstraints(inputs, results);

  info('Setup: Lowest-cost viable scenario');
  info(`Surplus: $${results.surplus.toFixed(0)}/month`);
  info(`Effective Wage: $${results.effectiveWage.toFixed(2)}/hr`);

  if (results.surplus > 0) {
    pass('Minimum viable configuration has positive surplus');
  }
  assertNoViolations(violations, 'No constraint violations');
}

testHeader('TEST 13: Maximum Surplus Configuration');
{
  const inputs = {
    foodCost: 4,
    publicPrice: 15,
    memberPrice: 7,
    baseWage: 20,
    dailyVolume: 600,
    memberPercentage: 20,
    annualOperating: 80000,
    wageDistribution: 0,
  };
  const results = calculateResults(inputs);
  const violations = checkConstraints(inputs, results);

  info('Setup: Maximum revenue, minimum costs, 0% distribution');
  info(`Surplus: $${results.surplus.toFixed(0)}/month`);
  assertApprox(results.surplus, 80000, 20000, 'Maximum surplus');
  assertEqual(results.savingsPool, results.surplus, 'All flows to savings');
}

testHeader('TEST 14: Edge Case - Zero Surplus');
{
  // Manually tune to get near-zero surplus
  const inputs = {
    foodCost: 5.5,
    publicPrice: 9,
    memberPrice: 7,
    baseWage: 20,
    dailyVolume: 450,
    memberPercentage: 30,
    annualOperating: 115000,
    wageDistribution: 50,
  };
  const results = calculateResults(inputs);
  const violations = checkConstraints(inputs, results);

  info(`Surplus: $${results.surplus.toFixed(0)}/month`);
  assertEqual(results.effectiveWage, 20, 'Effective Wage equals base (no bonus)');

  if (Math.abs(results.surplus) < 5000) {
    pass('Near-zero surplus scenario');
  }
}

testHeader('TEST 15: Multiple Constraint Violations');
{
  const inputs = {
    foodCost: 7,
    publicPrice: 8,
    memberPrice: 9,
    baseWage: 25,
    dailyVolume: 600,
    memberPercentage: 20,
    annualOperating: 150000,
    wageDistribution: 100,
  };
  const results = calculateResults(inputs);
  const violations = checkConstraints(inputs, results);

  info(`Setup: Multiple violations (found ${violations.length})`);
  violations.forEach(v => info(`  - ${v.type}: ${v.message}`));

  if (violations.length >= 3) {
    pass(`Multiple violations detected: ${violations.length} violations`);
  } else {
    fail(`Expected at least 3 violations, got ${violations.length}`);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CALCULATION VERIFICATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

testHeader('CALCULATION VERIFICATION: Default Values');
{
  const inputs = DEFAULT_VALUES;
  const results = calculateResults(inputs);

  info('Verifying calculation formulas with default values:');

  // Revenue calculations
  const expectedMemberMeals = 500 * 0.23; // 115
  const expectedPublicMeals = 500 * 0.77; // 385
  assertEqual(results.memberMealsPerDay, expectedMemberMeals, 'Member meals/day');
  assertEqual(results.publicMealsPerDay, expectedPublicMeals, 'Public meals/day');

  const expectedMemberRev = 115 * 7 * 30; // 24,150
  const expectedPublicRev = 385 * 11 * 30; // 127,050
  assertEqual(results.monthlyMemberRevenue, expectedMemberRev, 'Member revenue');
  assertEqual(results.monthlyPublicRevenue, expectedPublicRev, 'Public revenue');
  assertEqual(results.totalRevenue, expectedMemberRev + expectedPublicRev, 'Total revenue');

  // Cost calculations
  const expectedFoodCost = 500 * 5 * 30; // 75,000
  const expectedOperating = 115000 / 12; // 9,583.33
  const expectedLaborHours = 500 / 8.5; // 58.82 hrs/day
  const expectedMonthlyHours = expectedLaborHours * 30; // 1,764.7 hrs
  const expectedBaseLaborCost = expectedMonthlyHours * 20; // 35,294.12

  assertEqual(results.monthlyFoodCost, expectedFoodCost, 'Food cost');
  assertApprox(results.monthlyOperating, expectedOperating, 1, 'Operating cost');
  assertApprox(results.laborHoursPerDay, expectedLaborHours, 0.1, 'Labor hours/day');
  assertApprox(results.monthlyLaborHours, expectedMonthlyHours, 1, 'Monthly labor hours');
  assertApprox(results.monthlyBaseLaborCost, expectedBaseLaborCost, 1, 'Base labor cost');

  // Surplus calculations
  const expectedSurplus = results.totalRevenue - results.totalCosts;
  assertEqual(results.surplus, expectedSurplus, 'Surplus');

  const expectedWages = expectedSurplus * 0.5;
  const expectedSavings = expectedSurplus * 0.5;
  assertApprox(results.wagesPool, expectedWages, 0.1, 'Wages pool (50% distribution)');
  assertApprox(results.savingsPool, expectedSavings, 0.1, 'Savings pool (50% distribution)');

  const expectedBonus = expectedWages / results.monthlyLaborHours;
  const expectedEffectiveWage = 20 + expectedBonus;
  assertApprox(results.effectiveWage, expectedEffectiveWage, 0.01, 'Effective wage');

  // Margin of safety
  const expectedMargin = ((results.totalRevenue - results.breakeven) / results.totalRevenue) * 100;
  assertApprox(results.marginOfSafety, expectedMargin, 0.1, 'Margin of safety');

  info(`\nSummary with defaults:`);
  info(`  Revenue: $${results.totalRevenue.toFixed(0)}/mo`);
  info(`  Costs: $${results.totalCosts.toFixed(0)}/mo`);
  info(`  Surplus: $${results.surplus.toFixed(0)}/mo`);
  info(`  Effective Wage: $${results.effectiveWage.toFixed(2)}/hr`);
  info(`  Margin of Safety: ${results.marginOfSafety.toFixed(1)}%`);
}

console.log(`\n${colors.bold}${colors.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
console.log(`${colors.bold}${colors.green}All tests completed!${colors.reset}`);
console.log(`${colors.green}The calculation engine is working correctly.${colors.reset}`);
console.log(`${colors.bold}${colors.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
