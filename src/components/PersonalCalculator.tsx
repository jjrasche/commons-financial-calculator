import { useState } from 'react';

export default function PersonalCalculator() {
  const [mealsPerWeek, setMealsPerWeek] = useState(14);
  const [shiftsPerMonth, setShiftsPerMonth] = useState(4);
  const [preferMeals, setPreferMeals] = useState(true);

  // Constants
  const HOURS_PER_SHIFT = 4;
  const WAGE_RATE = 25; // $/hour effective wage
  const MEMBER_MEAL_COST = 5;
  const MARKET_MEAL_PRICE = 12;
  const WEEKS_PER_MONTH = 4.33;

  // Calculations
  const totalHoursWorked = shiftsPerMonth * HOURS_PER_SHIFT;
  const wagesEarned = totalHoursWorked * WAGE_RATE;
  const mealsPerMonth = Math.round(mealsPerWeek * WEEKS_PER_MONTH);
  const memberMealsCost = mealsPerMonth * MEMBER_MEAL_COST;
  const marketMealsCost = mealsPerMonth * MARKET_MEAL_PRICE;
  const mealSavings = marketMealsCost - memberMealsCost;

  // Net calculations based on preference
  const netCash = preferMeals ? wagesEarned - memberMealsCost : wagesEarned;
  const totalValue = preferMeals ? mealSavings : mealSavings + wagesEarned;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-blue-900 to-purple-900 p-8 rounded-2xl shadow-2xl mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Your Personal Commons Calculator</h1>
        <p className="text-blue-200">See how much you can save as a member-worker</p>
      </div>

      {/* Input Sliders */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6">
        <h2 className="text-xl font-semibold text-gray-100 mb-6">Tell us about yourself</h2>

        {/* Meals per week */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Your family eats <span className="text-blue-400 font-bold text-lg">{mealsPerWeek}</span> meals/week
          </label>
          <input
            type="range"
            min={7}
            max={28}
            step={1}
            value={mealsPerWeek}
            onChange={(e) => setMealsPerWeek(parseInt(e.target.value))}
            className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>7 meals</span>
            <span>{mealsPerMonth} meals/month</span>
            <span>28 meals</span>
          </div>
        </div>

        {/* Shifts per month */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            You work <span className="text-blue-400 font-bold text-lg">{shiftsPerMonth}</span> shifts/month
          </label>
          <input
            type="range"
            min={3}
            max={6}
            step={1}
            value={shiftsPerMonth}
            onChange={(e) => setShiftsPerMonth(parseInt(e.target.value))}
            className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>3 shifts</span>
            <span>{totalHoursWorked} hours total</span>
            <span>6 shifts</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Each shift = {HOURS_PER_SHIFT} hours</p>
        </div>
      </div>

      {/* Toggle: Cash vs Meals */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">How would you like to receive value?</h3>
        <div className="flex gap-4">
          <button
            onClick={() => setPreferMeals(true)}
            className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all ${
              preferMeals
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            🍽️ Trade for Meals
          </button>
          <button
            onClick={() => setPreferMeals(false)}
            className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all ${
              !preferMeals
                ? 'bg-green-600 text-white shadow-lg scale-105'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            💵 Take as Cash
          </button>
        </div>
      </div>

      {/* Results - The Magic Moment */}
      <div className="bg-gradient-to-br from-green-900 to-emerald-900 p-8 rounded-2xl shadow-2xl border-2 border-green-500/50 mb-6">
        <h2 className="text-2xl font-bold text-white mb-6">Your Monthly Value</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur p-4 rounded-lg">
            <div className="text-sm text-green-200 mb-1">Wages Earned</div>
            <div className="text-3xl font-bold text-white">${wagesEarned.toFixed(0)}</div>
            <div className="text-xs text-green-300 mt-1">{totalHoursWorked} hours @ ${WAGE_RATE}/hr</div>
          </div>

          <div className="bg-white/10 backdrop-blur p-4 rounded-lg">
            <div className="text-sm text-green-200 mb-1">Your Meals at Member Cost</div>
            <div className="text-3xl font-bold text-white">{mealsPerMonth} meals</div>
            <div className="text-xs text-green-300 mt-1">@ ${MEMBER_MEAL_COST}/meal = ${memberMealsCost}</div>
          </div>

          <div className="bg-white/10 backdrop-blur p-4 rounded-lg">
            <div className="text-sm text-green-200 mb-1">Market Price Elsewhere</div>
            <div className="text-3xl font-bold text-white">${marketMealsCost}</div>
            <div className="text-xs text-green-300 mt-1">{mealsPerMonth} meals @ ${MARKET_MEAL_PRICE}/meal</div>
          </div>

          <div className="bg-white/10 backdrop-blur p-4 rounded-lg">
            <div className="text-sm text-green-200 mb-1">
              {preferMeals ? 'Cash After Meals' : 'Total Cash Available'}
            </div>
            <div className="text-3xl font-bold text-white">${netCash.toFixed(0)}</div>
            <div className="text-xs text-green-300 mt-1">
              {preferMeals ? `$${wagesEarned} - $${memberMealsCost}` : 'Full wages'}
            </div>
          </div>
        </div>

        {/* Big Savings Number */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 rounded-xl text-center">
          <div className="text-sm font-semibold text-gray-900 mb-2">
            {preferMeals ? '💰 YOUR TOTAL MONTHLY BENEFIT' : '💵 YOUR MONTHLY SAVINGS OPPORTUNITY'}
          </div>
          <div className="text-5xl md:text-6xl font-black text-white mb-2">
            ${totalValue.toFixed(0)}
          </div>
          <div className="text-sm text-gray-900">
            {preferMeals
              ? `You save $${mealSavings} on meals + keep $${netCash.toFixed(0)} cash`
              : `You earn $${wagesEarned} wages + save $${mealSavings} on meals if you join`
            }
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 text-center">
        <h3 className="text-2xl font-bold text-white mb-4">Ready to join The Commons?</h3>
        <p className="text-gray-300 mb-6">
          Secure your spot as a member-worker and start saving immediately
        </p>
        <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold py-4 px-12 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-xl">
          Reserve Your Spot - $250 Deposit
        </button>
        <p className="text-xs text-gray-400 mt-4">
          Fully refundable during your first 90 days
        </p>
      </div>

      {/* Assumptions Disclosure */}
      <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <details className="text-sm text-gray-400">
          <summary className="cursor-pointer hover:text-gray-300 font-medium">
            Calculation Assumptions
          </summary>
          <ul className="mt-2 space-y-1 ml-4 list-disc">
            <li>Effective wage rate: ${WAGE_RATE}/hour</li>
            <li>Member meal cost: ${MEMBER_MEAL_COST}/meal</li>
            <li>Market meal price comparison: ${MARKET_MEAL_PRICE}/meal</li>
            <li>Each shift: {HOURS_PER_SHIFT} hours</li>
            <li>Month calculation: {WEEKS_PER_MONTH} weeks</li>
          </ul>
        </details>
      </div>
    </div>
  );
}
