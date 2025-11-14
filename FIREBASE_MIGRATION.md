# Firebase Migration Plan

## Overview

Migrate the commons-financial-calculator from GitHub Pages + Groq API to Firebase Hosting + Firebase AI Logic, following the pattern established in the trip-organizer repository.

## Why Firebase?

- **API key security**: Firebase AI SDK handles authentication client-side without exposing raw API keys
- **Consistent stack**: Same setup as trip-organizer project
- **Free tier**: Firebase hosting + Gemini API included
- **No serverless functions needed**: AI calls happen through Firebase SDK
- **Auto-deploy**: Firebase CLI or GitHub Actions integration

## Current State Analysis

### Current Setup (GitHub Pages + Groq)
- Hosting: GitHub Pages (github.io)
- AI: Direct Groq API calls with exposed API key
- Problem: `VITE_GROQ_API_KEY` visible in browser bundle

### Target Setup (Firebase + Gemini)
- Hosting: Firebase Hosting
- AI: Firebase AI Logic with Gemini 2.0 Flash
- Solution: Firebase SDK handles authentication securely

## Reference Architecture (from trip-organizer)

### Key Files Found:
```
.firebaserc                 # Firebase project config
firebase.json               # Hosting & emulator config
firestore.rules             # Database security rules
src/config/firebase.ts      # Firebase initialization
src/services/ai.service.ts  # AI integration layer
.env.example                # Environment variables template
```

### Dependencies Used:
```json
{
  "firebase": "11.1.0",
  "firebase-tools": "13.0.0"
}
```

### Environment Variables:
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
```

## Migration Steps

### 1. Firebase Project Setup

**Create Firebase Project:**
1. Go to https://console.firebase.google.com
2. Create new project: "commons-financial-calculator"
3. Enable Google Analytics (optional)
4. Note your project ID

**Enable Required Services:**
1. Firebase Hosting: Enable in console
2. Firestore: Enable in production mode (if storing calculator scenarios)
3. Firebase AI Logic: Enable Gemini API access

**Get Configuration:**
1. Go to Project Settings → General
2. Under "Your apps" → Web apps
3. Register a new web app
4. Copy the Firebase configuration object

### 2. Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase init
```

**Select:**
- Hosting: Configure files for Firebase Hosting
- Firestore: Set up security rules (optional)
- Emulators: For local development (optional)

### 3. Add Dependencies

Update `package.json`:

```json
{
  "dependencies": {
    "firebase": "^11.1.0"
  },
  "devDependencies": {
    "firebase-tools": "^13.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "deploy": "npm run build && firebase deploy --only hosting",
    "deploy:rules": "firebase deploy --only firestore:rules",
    "emulators": "firebase emulators:start"
  }
}
```

### 4. Create Firebase Configuration Files

**`.firebaserc`:**
```json
{
  "projects": {
    "default": "commons-financial-calculator"
  }
}
```

**`firebase.json`:**
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "emulators": {
    "hosting": {
      "port": 5000
    }
  }
}
```

**`firestore.rules`** (if using Firestore for saving scenarios):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 5. Create Firebase Config File

**`src/config/firebase.ts`:**

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);

// For local development with emulators (optional):
// import { connectFirestoreEmulator } from 'firebase/firestore';
// if (import.meta.env.DEV) {
//   connectFirestoreEmulator(db, 'localhost', 8080);
// }

export { app };
```

### 6. Create AI Service

**`src/services/ai.service.ts`:**

```typescript
import { getGenerativeModel, AILogic } from '@firebase/ai-logic';
import { app } from '../config/firebase';
import { CalculatorInputs, CalculationResults } from '../types';

let aiLogic: AILogic | null = null;

async function initAI() {
  try {
    if (!aiLogic) {
      aiLogic = new AILogic(app);
    }
    return aiLogic;
  } catch (error) {
    console.error('Failed to initialize AI:', error);
    throw error;
  }
}

function getModel() {
  if (!aiLogic) {
    throw new Error('AI not initialized. Call initAI() first.');
  }
  return getGenerativeModel(aiLogic, { model: 'gemini-2.0-flash-exp' });
}

export async function analyzeCalculatorConcern(
  concern: string,
  inputs: CalculatorInputs,
  results: CalculationResults
): Promise<{ explanation: string; changes?: Partial<CalculatorInputs> }> {
  try {
    await initAI();
    const model = getModel();

    const prompt = `You are an AI assistant helping users explore a cooperative financial calculator.

Current state:
- Food Cost per Meal: $${inputs.foodCost.toFixed(2)}
- Public Meal Price: $${inputs.publicPrice.toFixed(2)}
- Member Meal Price: $${inputs.memberPrice.toFixed(2)}
- Base Hourly Wage: $${inputs.baseWage.toFixed(2)}
- Daily Production Volume: ${inputs.dailyVolume} meals
- Member Meal Percentage: ${inputs.memberPercentage}%
- Annual Operating Costs: $${inputs.annualOperating.toLocaleString()}
- Wage Distribution: ${inputs.wageDistribution}%

Current results:
- Monthly Surplus: $${results.surplus.toFixed(0)}
- Wages Pool: $${results.wagesPool.toFixed(0)}
- Savings Pool: $${results.savingsPool.toFixed(0)}
- Effective Wage: $${results.effectiveWage.toFixed(2)}/hr
- Margin of Safety: ${results.marginOfSafety.toFixed(1)}%

User concern: "${concern}"

Analyze their concern and suggest intelligent parameter adjustments. Respond in JSON format:
{
  "explanation": "Your explanation and reasoning",
  "changes": {
    "foodCost": 5.5,
    "publicPrice": 12
  }
}

Only include parameters you want to change. Constraints:
- foodCost: $2-$12
- publicPrice: $5-$25
- memberPrice: $0-$20
- baseWage: $10-$40
- dailyVolume: 100-1000
- memberPercentage: 5-50
- annualOperating: 40000-300000
- wageDistribution: 0-100`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Parse JSON response
    const parsed = JSON.parse(response);
    return parsed;
  } catch (error) {
    console.error('AI analysis failed:', error);
    return {
      explanation: 'Sorry, I encountered an error analyzing your concern. Please try again.',
    };
  }
}

export function isAIConfigured(): boolean {
  return !!import.meta.env.VITE_FIREBASE_API_KEY;
}
```

### 7. Update AIAssistant Component

**Modify `src/components/AIAssistant.tsx`:**

Replace the Groq API call section with:

```typescript
import { analyzeCalculatorConcern } from '../services/ai.service';

// In sendMessage function, replace the fetch call with:
try {
  const response = await analyzeCalculatorConcern(input, inputs, results);

  const assistantMessage: Message = {
    role: 'assistant',
    content: response.explanation,
    suggestedChanges: response.changes,
  };

  setMessages((prev) => [...prev, assistantMessage]);
} catch (error) {
  console.error('Error calling AI service:', error);
  setMessages((prev) => [
    ...prev,
    {
      role: 'assistant',
      content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    },
  ]);
}
```

### 8. Update Environment Variables

**Update `.env.local`:**

Remove:
```
VITE_GROQ_API_KEY=...
```

Add:
```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Update `.env.example`:**
```
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 9. Update Vite Config

**Modify `vite.config.ts`:**

Remove the GitHub Pages base path:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Remove: base: '/commons-financial-calculator/',
})
```

### 10. Update TypeScript Definitions

**Update `src/vite-env.d.ts`:**

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_FIREBASE_MEASUREMENT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### 11. Update .gitignore

Ensure these are ignored:

```
.env.local
.firebase/
.firebaserc
firebase-debug.log
firestore-debug.log
ui-debug.log
```

### 12. Remove GitHub Actions Workflow

Delete or disable:
```
.github/workflows/deploy.yml
```

## Deployment

### Initial Deployment

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

### Your app will be available at:
```
https://commons-financial-calculator.web.app
# or
https://commons-financial-calculator.firebaseapp.com
```

### Ongoing Deployment

```bash
# Quick deploy
npm run deploy

# Deploy with preview
firebase hosting:channel:deploy preview
```

## Testing

### Local Development

```bash
# Start Vite dev server
npm run dev

# Or use Firebase emulators
firebase emulators:start
```

### Test AI Integration

1. Go to Operational Calculator tab
2. Click the AI Assistant button
3. Try queries like:
   - "Sales are too low"
   - "Pay workers more"
   - "Make this profitable"

## Optional: Save Calculator Scenarios to Firestore

If you want users to save/share scenarios:

**Create `src/services/scenarios.service.ts`:**

```typescript
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { CalculatorInputs } from '../types';

export async function saveScenario(name: string, inputs: CalculatorInputs) {
  const scenariosRef = collection(db, 'scenarios');
  return await addDoc(scenariosRef, {
    name,
    inputs,
    createdAt: new Date(),
  });
}

export async function getScenarios() {
  const scenariosRef = collection(db, 'scenarios');
  const snapshot = await getDocs(scenariosRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
```

**Update Firestore rules:**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scenarios/{scenarioId} {
      allow read: if true;
      allow write: if false; // Or add authentication
    }
  }
}
```

## Troubleshooting

### AI not working
- Check Firebase console that Gemini API is enabled
- Verify environment variables are set correctly
- Check browser console for errors

### Deployment fails
- Ensure `dist` folder exists (run `npm run build`)
- Check Firebase project ID in `.firebaserc`
- Verify you're logged in: `firebase login`

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Clear cache: `rm -rf node_modules package-lock.json && npm install`

## Migration Checklist

- [ ] Create Firebase project
- [ ] Install Firebase CLI
- [ ] Add Firebase dependencies to package.json
- [ ] Create .firebaserc
- [ ] Create firebase.json
- [ ] Create src/config/firebase.ts
- [ ] Create src/services/ai.service.ts
- [ ] Update AIAssistant.tsx to use new AI service
- [ ] Update vite.config.ts (remove base path)
- [ ] Update .env.local with Firebase credentials
- [ ] Update .env.example
- [ ] Update src/vite-env.d.ts
- [ ] Remove Groq API key and references
- [ ] Test locally
- [ ] Deploy to Firebase
- [ ] Remove/disable GitHub Actions workflow
- [ ] Test production deployment

## Cost Considerations

**Firebase Hosting (Free Tier):**
- 10 GB storage
- 360 MB/day transfer
- More than enough for this calculator

**Gemini API (Free Tier):**
- 15 requests per minute
- 1500 requests per day
- Sufficient for moderate usage

## Next Steps After Migration

1. **Custom Domain** (optional): Configure custom domain in Firebase Console
2. **Analytics**: Enable Firebase Analytics for usage tracking
3. **Performance**: Monitor with Firebase Performance Monitoring
4. **Error Tracking**: Consider Firebase Crashlytics
5. **A/B Testing**: Use Firebase Remote Config for feature flags

## Rollback Plan

If migration fails, the GitHub Pages deployment is still active at:
`https://jjrasche.github.io/commons-financial-calculator/`

To rollback:
1. Re-enable GitHub Actions workflow
2. Restore vite.config.ts base path
3. Push to master branch

---

**End of Migration Plan**

Generated: 2025-11-14
Reference Project: https://github.com/jjrasche/trip-organizer
