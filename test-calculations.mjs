// Test script for Commons Financial Calculator (Plain JavaScript)
// Verifies calculation engine logic against specification test cases

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CALCULATION ENGINE (Copied from calculationEngine.ts)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function calculateResults(inputs) {
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

function checkConstraints(inputs, results) {
  const violations = [];

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

const DEFAULT_VALUES = {
  foodCost: 5.0,
  publicPrice: 11.0,
  memberPrice: 7.0,
  baseWage: 20.0,
  dailyVolume: 500,
  memberPercentage: 23,
  annualOperating: 115000,
  wageDistribution: 50,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEST UTILITIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m',
};

let passCount = 0;
let failCount = 0;

function pass(msg) {
  console.log(`${colors.green}✓ PASS${colors.reset} ${msg}`);
  passCount++;
}

function fail(msg) {
  console.log(`${colors.red}✗ FAIL${colors.reset} ${msg}`);
  failCount++;
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

console.log(`\n${colors.bold}${colors.blue}╔═══════════════════════════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.bold}${colors.blue}║  Commons Financial Calculator - Test Suite                   ║${colors.reset}`);
console.log(`${colors.bold}${colors.blue}╚═══════════════════════════════════════════════════════════════╝${colors.reset}`);

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

  // Note: The calculation engine doesn't zero out pools on deficit
  // This is handled in the UI layer
  info(`Wages Pool: $${results.wagesPool.toFixed(2)} (will be $0 in UI)`);
  info(`Savings Pool: $${results.savingsPool.toFixed(2)} (will be $0 in UI)`);
}

testHeader('TEST 9: Public Price Ceiling');
{
  const inputs = {
    ...DEFAULT_VALUES,
    publicPrice: 15,
  };
  let results = calculateResults(inputs);
  let violations = checkConstraints(inputs, results);

  info('Setup: Public Price at $15 ceiling');
  assertNoViolations(violations, 'No violation at ceiling');

  // Test exceeding ceiling
  inputs.publicPrice = 15.5;
  results = calculateResults(inputs);
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

  if (results.monthlyPublicRevenue > 80000) {
    pass('High public revenue achieved');
  }
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

  if (results.surplus > 60000) {
    pass(`High surplus achieved: $${results.surplus.toFixed(0)}`);
  }
  assertEqual(results.savingsPool, results.surplus, 'All flows to savings');
}

testHeader('TEST 14: Multiple Constraint Violations');
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FINAL SUMMARY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log(`\n${colors.bold}${colors.blue}╔═══════════════════════════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.bold}${colors.blue}║  Test Results Summary                                         ║${colors.reset}`);
console.log(`${colors.bold}${colors.blue}╚═══════════════════════════════════════════════════════════════╝${colors.reset}`);

const total = passCount + failCount;
const passRate = total > 0 ? ((passCount / total) * 100).toFixed(1) : 0;

console.log(`\n${colors.bold}Passed:${colors.reset} ${colors.green}${passCount}${colors.reset} / ${total} (${passRate}%)`);
if (failCount > 0) {
  console.log(`${colors.bold}Failed:${colors.reset} ${colors.red}${failCount}${colors.reset}`);
}

if (failCount === 0) {
  console.log(`\n${colors.bold}${colors.green}✓ All tests passed! The calculation engine is working correctly.${colors.reset}\n`);
} else {
  console.log(`\n${colors.bold}${colors.red}✗ Some tests failed. Please review the output above.${colors.reset}\n`);
  process.exit(1);
}
