# Commons Financial Calculator

Interactive financial modeling tool for The Commons worker cooperative meal delivery service.

## Overview

This calculator helps model the economics of a cooperative where members work equal hours and share in both meals and surplus distribution.

## Features

- Real-time calculation engine with instant updates
- Interactive sliders for 8 key variables with expanded ranges
- Visual charts (bar, line, pie) optimized for dark mode
- Constraint validation with live feedback
- Scenario presets for common configurations
- Dark mode UI with excellent contrast
- LocalStorage persistence of settings

## Documentation

See [SPECIFICATION.md](./SPECIFICATION.md) for complete technical specification and test cases.

## Tech Stack

- React 18 + TypeScript
- Vite (dev server & build tool)
- Recharts (data visualization)
- Tailwind CSS (styling)

## Getting Started
```bash
# Install dependencies
npm install

# Run development server (starts at http://localhost:5173)
npm run dev

# Build for production
npm run build

# Run automated calculation tests
node test-calculations.mjs
```

## Visual Testing

To visually verify the application is working correctly:

1. **Open the app**: Navigate to http://localhost:5173 in your browser
2. **Check dark mode**: Verify dark gray background (not black, not white)
3. **Test sliders**: Move sliders and verify real-time updates in metrics and charts
4. **Verify charts**:
   - Bar chart (Wages vs Savings) - should show blue bars on dark background
   - Line chart (Effective Wage Curve) - should show green line with red $60/hr reference line
   - Pie chart (Cost Breakdown) - should show blue/green/yellow slices with light gray labels
5. **Test scenarios**: Use "Load Scenario" dropdown to test presets
6. **Trigger violations**: Set extreme values to see red constraint violation alerts
7. **Check responsiveness**: Resize browser window to test mobile/desktop layouts

### Taking Screenshots

For documentation or bug reports, capture screenshots:
- **Windows**: Win + Shift + S (Snipping Tool)
- **Mac**: Cmd + Shift + 4
- **Browser DevTools**: F12 → Device toolbar for mobile views

## Expanded Slider Ranges

- **Food Cost per Meal**: $2 - $12 (step: $0.25)
- **Public Meal Price**: $5 - $25 (step: $0.50)
- **Member Meal Price**: $3 - $20 (step: $0.25)
- **Base Hourly Wage**: $10 - $40 (step: $0.50)
- **Daily Production Volume**: 100 - 1,000 meals (step: 10)
- **Member Meal Percentage**: 5% - 50% (step: 1%)
- **Annual Operating Costs**: $40k - $300k (step: $5k)
- **Wage Distribution Percentage**: 0% - 100% (step: 1%)

## License

MIT
