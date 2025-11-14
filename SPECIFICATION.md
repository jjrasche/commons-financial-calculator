# Financial Model Calculator - Technical Specification

## Purpose

Interactive web calculator for modeling The Commons cooperative economics. Real-time manipulation of variables to see impact on wages and savings.

---

## Core Principle

**Everyone works the same total hours per month.** No tiers, no locked positions. Pure equality.

Example: If total monthly labor needed is 1,500 hours and you have 200 members, everyone works 7.5 hours/month.

---

## User Interface Layout

### Left Panel (40% width): Input Controls

8 slider controls with live values displayed next to each slider. All updates calculate instantly.

### Right Panel (60% width): Outputs

**Top Section: Large Key Metrics**
- Total Wages Distributed ($/month)
- Total Saved ($/month)
- Effective Wage ($/hr)

**Middle Section: Visuals**
- Bar chart: Wages vs Savings (side by side)
- Line graph: Effective wage over time as distribution % changes (show curve from 0% to 100%)
- Pie chart: Monthly cost breakdown (Food, Labor, Operating)

**Bottom Section: Constraint Violations Box**
- Shows all active constraint violations
- Hidden if no violations
- Red alert styling when visible

---

## Input Controls (Sliders)

### 1. Food Cost per Meal
- Range: $4.00 - $7.00
- Step: $0.25
- Default: $5.00

### 2. Public Meal Price
- Range: $8.00 - $15.00
- Step: $0.50
- Default: $11.00

### 3. Member Meal Price
- Range: $5.00 - $10.00
- Step: $0.25
- Default: $7.00

### 4. Base Hourly Wage
- Range: $15.00 - $25.00
- Step: $1.00
- Default: $20.00

### 5. Daily Production Volume
- Range: 300 - 600 meals
- Step: 25
- Default: 500

### 6. Member Meal Percentage
- Range: 15% - 35%
- Step: 1%
- Default: 23%

### 7. Annual Operating Costs
- Range: $80,000 - $150,000
- Step: $5,000
- Default: $115,000

### 8. Wage Distribution Percentage
- Range: 0% - 100%
- Step: 5%
- Default: 50%

---

## Outputs

### Large Key Metrics

**Total Wages Distributed**
- Format: $XX,XXX/month
- Large font, green

**Total Saved**
- Format: $XX,XXX/month
- Large font, blue

**Effective Wage**
- Format: $XX.XX/hr
- Large font, red if >$60/hr, black otherwise

**Margin of Safety**
- Definition: How much revenue exceeds break-even
- Formula: (Current Revenue - Breakeven Revenue) / Current Revenue × 100
- Format: XX%
- Shows cushion before operating at deficit

### Visuals

**Bar Chart: Wages vs Savings**
- Two bars side by side
- X-axis: Category (Wages, Savings)
- Y-axis: Dollars
- Shows distribution of surplus

**Line Graph: Effective Wage Curve**
- X-axis: Wage Distribution % (0-100%)
- Y-axis: Effective Wage ($/hr)
- Shows how effective wage increases as more surplus distributed
- Reference line at $60/hr (wage cap)

**Pie Chart: Monthly Cost Breakdown**
- Slices: Food Cost, Base Labor Cost, Operating Cost
- Shows percentage of each
- Total = 100% of costs (not including surplus)

### Constraint Violations Box

Only visible when violations exist. Shows all active violations:

- "Effective wage ($XX.XX/hr) exceeds $60/hr cap"
- "Public price ($XX.XX) below minimum 1.3x food cost ($XX.XX)"
- "Member price ($XX.XX) below food cost ($XX.XX)"
- "Member price ($XX.XX) above public price ($XX.XX)"
- "Daily labor (XX hrs) exceeds 60-hour limit"
- "Operating at deficit: -$XX,XXX/month"
- "Public price ($XX.XX) exceeds $15/meal ceiling"

---

## Calculation Engine

### Monthly Revenue
```
Member Meals/Day = Daily Volume × Member %
Public Meals/Day = Daily Volume × (1 - Member %)

Monthly Member Revenue = Member Meals/Day × Member Price × 30
Monthly Public Revenue = Public Meals/Day × Public Price × 30
Total Revenue = Member Revenue + Public Revenue
```

### Monthly Costs
```
Monthly Food Cost = Daily Volume × Food Cost × 30
Monthly Operating = Annual Operating / 12

Labor Hours/Day = Daily Volume / 8.5
Monthly Labor Hours = Labor Hours/Day × 30
Monthly Base Labor = Monthly Labor Hours × Base Wage

Total Costs = Food + Operating + Base Labor
```

### Surplus & Distribution
```
Surplus = Revenue - Costs

Wages Pool = Surplus × (Distribution % / 100)
Savings Pool = Surplus × (1 - Distribution % / 100)

Bonus/Hour = Wages Pool / Monthly Labor Hours
Effective Wage = Base Wage + Bonus/Hour
```

### Breakeven
```
Breakeven Revenue = Total Costs
Margin of Safety = (Revenue - Breakeven) / Revenue × 100
```

---

## Constraints

1. Effective Wage = $60/hr
2. Public Price = 1.3 × Food Cost
3. Public Price = $15/meal
4. Member Price = Food Cost
5. Member Price = Public Price
6. Labor Hours/Day = 60
7. Surplus = $0 (no deficit)

---

## Scenario Presets

**Growth Mode**
- Distribution: 0%
- Operating: $115K
- Volume: 500

**Steady State**
- Distribution: 50%
- Operating: $115K
- Volume: 500

**Member-Focused**
- Distribution: 100%
- Operating: $115K
- Volume: 500

**High Volume**
- Volume: 600
- Member %: 20%
- Distribution: 50%

**Budget Operations**
- Food Cost: $4
- Operating: $80K
- Distribution: 50%

---

## Test Cases

### Test 1: Zero Distribution
**Setup:**
- Wage Distribution: 0%
- All other defaults

**Expected:**
- Wages Distributed: $0
- Saved: ~$45,000/month
- Effective Wage: $20/hr (base only)
- No constraint violations

**Validates:** All surplus flows to savings when distribution is 0%

---

### Test 2: Full Distribution
**Setup:**
- Wage Distribution: 100%
- All other defaults

**Expected:**
- Wages Distributed: ~$45,000/month
- Saved: $0
- Effective Wage: ~$50/hr
- No constraint violations (under $60 cap)

**Validates:** All surplus flows to wages when distribution is 100%

---

### Test 3: Wage Cap Violation
**Setup:**
- Base Wage: $25/hr
- Distribution: 100%
- Public Price: $15
- All other defaults

**Expected:**
- Effective Wage: >$60/hr
- Constraint violation alert visible
- Alert text: "Effective wage ($XX.XX/hr) exceeds $60/hr cap"

**Validates:** System detects and alerts when wage cap exceeded

---

### Test 4: Public Price Too Low
**Setup:**
- Food Cost: $7
- Public Price: $8
- All other defaults

**Expected:**
- Constraint violation alert visible
- Alert: "Public price ($8.00) below minimum 1.3x food cost ($9.10)"

**Validates:** Minimum markup constraint enforced (1.3x food cost)

---

### Test 5: Member Price Below Cost
**Setup:**
- Food Cost: $7
- Member Price: $6
- All other defaults

**Expected:**
- Constraint violation alert visible
- Alert: "Member price ($6.00) below food cost ($7.00)"

**Validates:** Members can't pay less than food cost

---

### Test 6: Member Price Above Public
**Setup:**
- Member Price: $10
- Public Price: $9
- All other defaults

**Expected:**
- Constraint violation alert visible
- Alert: "Member price ($10.00) above public price ($9.00)"

**Validates:** Members should pay less than public customers

---

### Test 7: Excessive Labor Hours
**Setup:**
- Daily Volume: 600 meals
- All other defaults

**Expected:**
- Labor Hours/Day: ~70 hrs (600 / 8.5)
- Constraint violation alert visible
- Alert: "Daily labor (70 hrs) exceeds 60-hour limit"

**Validates:** System detects when daily labor requirements exceed reasonable limits

---

### Test 8: Operating at Deficit
**Setup:**
- Public Price: $8
- Food Cost: $6
- Operating: $150K
- All other defaults

**Expected:**
- Surplus: negative
- Constraint violation alert visible
- Alert: "Operating at deficit: -$XX,XXX/month"
- Wages Distributed: $0 (can't distribute when deficit)
- Saved: $0

**Validates:** System detects deficit scenarios and shows negative surplus

---

### Test 9: Public Price Ceiling
**Setup:**
- Public Price: $15 (max)
- All other defaults

**Expected:**
- No violation (at ceiling but not over)
- Revenue maximized

**Now change to $15.50:**
- If slider allows going above $15, should show violation
- Alert: "Public price ($15.50) exceeds $15/meal ceiling"

**Validates:** Market competitiveness ceiling enforced

---

### Test 10: High Volume, Low Member %
**Setup:**
- Daily Volume: 600
- Member %: 15%
- Distribution: 50%

**Expected:**
- High public revenue (~$99,000/month)
- Large surplus (~$60,000/month)
- Higher effective wage (~$45/hr)
- Possible labor hours violation if >60/day

**Validates:** Model scales with increased public sales volume

---

### Test 11: Low Volume, High Member %
**Setup:**
- Daily Volume: 300
- Member %: 35%
- Distribution: 50%

**Expected:**
- Lower revenue overall
- Lower surplus (maybe deficit)
- Possible constraint violations for deficit

**Validates:** Model shows when member-heavy, low-volume scenarios aren't viable

---

### Test 12: Minimum Viable Configuration
**Setup:**
- Food Cost: $4
- Public Price: $10
- Member Price: $5
- Base Wage: $18
- Volume: 400
- Member %: 25%
- Operating: $80K
- Distribution: 50%

**Expected:**
- Positive surplus (small, ~$15-20K)
- No constraint violations
- Effective wage: ~$25-30/hr
- Demonstrates bare minimum viable operation

**Validates:** Lowest-cost scenario still breaks even

---

### Test 13: Maximum Surplus Configuration
**Setup:**
- Food Cost: $4
- Public Price: $15
- Member Price: $7
- Base Wage: $20
- Volume: 600
- Member %: 20%
- Operating: $80K
- Distribution: 0%

**Expected:**
- Maximum surplus (~$80-90K/month)
- All flows to savings
- No constraint violations
- Demonstrates optimal growth scenario

**Validates:** Maximum possible savings rate for expansion

---

### Test 14: Scenario Preset Loading
**Action:** Click "Growth Mode" button

**Expected:**
- All 8 sliders snap to Growth Mode values
- Calculations update instantly
- No lag or flicker
- Outputs match expected for those inputs

**Repeat for each preset button**

**Validates:** Preset buttons load configurations correctly

---

### Test 15: Real-Time Calculation
**Action:** 
- Start with defaults
- Slowly drag "Wage Distribution" slider from 0% to 100%

**Expected:**
- Wages Distributed increases from $0 to max
- Saved decreases from max to $0
- Effective Wage increases linearly
- Line graph updates smoothly showing wage curve
- Bar chart animates smoothly
- No lag or stutter

**Validates:** All calculations and visuals update in real-time without performance issues

---

### Test 16: Multiple Constraint Violations
**Setup:**
- Food Cost: $7
- Public Price: $8 (below 1.3x)
- Member Price: $9 (above public)
- Base Wage: $25
- Distribution: 100% (likely exceeds cap)
- Volume: 600 (exceeds labor limit)

**Expected:**
- Constraint box shows 4-5 violations simultaneously
- All violations listed clearly
- Each violation message is distinct and accurate

**Validates:** System handles multiple simultaneous constraint violations

---

### Test 17: Edge Case - Zero Surplus
**Setup:**
- Adjust sliders until Revenue ˜ Costs (surplus near $0)
- Distribution: 50%

**Expected:**
- Surplus: ~$0
- Wages Distributed: ~$0
- Saved: ~$0
- Effective Wage: $20 (base only, no bonus)
- Margin of Safety: ~0%
- No constraint violations (break-even is valid)

**Validates:** System handles zero-surplus scenario without errors

---

### Test 18: Visual Chart Accuracy
**Setup:** 
- Set Distribution: 30%
- Surplus calculates to $40,000

**Expected:**
- Wages Distributed: $12,000 (30% of $40K)
- Saved: $28,000 (70% of $40K)
- Bar chart: Wages bar height = 30% of Savings bar height
- Pie chart: Percentages sum to 100%
- Line graph: Point at 30% x-axis matches current effective wage

**Validates:** All charts accurately represent calculated values

---

## Technical Implementation

**Framework:** React with useState hooks

**State Variables:** 8 sliders map to 8 state variables

**Calculation Trigger:** useEffect or derived values, update on any state change

**Responsive:** Stack vertically on mobile (<768px)

**Charts:** Use Recharts or Chart.js library

**Number Formatting:**
- Currency (large): $XX,XXX
- Currency (small): $XX.XX
- Percentages: XX%
