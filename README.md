<div align="center">

  # Broke?

  **A calm, minimal personal money tracker that answers one question:**  
  *“How much money do I actually have right now?”*

  <br />

  <a href="https://github.com/mayankkalra03/broke-mobile/releases/download/v1.1.0/Broke-Mobile-App-v1.1.0.apk">
    <img src="https://img.shields.io/badge/Download%20APK-v1.1.0-262320?style=for-the-badge&logo=android&logoColor=F5F2EB" alt="Download APK" />
  </a>

  <br /><br />

  [![Release](https://img.shields.io/github/v/release/mayankkalra03/broke-mobile?style=flat-square&color=7A4C22)](https://github.com/mayankkalra03/broke-mobile/releases/latest)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Expo SDK 57](https://img.shields.io/badge/Expo-SDK%2057-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev/)
  [![React Native](https://img.shields.io/badge/React%20Native-0.86-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactnative.dev/)
  [![Offline First](https://img.shields.io/badge/100%25-Offline--First-262320?style=flat-square)](https://github.com/mayankkalra03/broke-mobile)

</div>

---

## 💡 The Philosophy

Most finance apps are bloated with AI insights, stock trackers, generic motivational quotes, crypto charts, and purple gradient cards.

**Broke? is not that.**

It is an opinionated, ultra-fast personal utility designed for people who simply want to know their net available cash and bank balance at any moment.

- **Warm Tactile Parchment**: Warm paper background (`#F5F2EB`), soft ivory cream surfaces (`#FAF8F4`), and rich warm roast espresso (`#262320`). Zero pure white, zero pure black, zero neon clutter.
- **Zero AI-slop**: No fake dashboards, no decorative blobs, no 6-page onboarding carousels.
- **Speed first**: Record a ₹50 coffee in 3 seconds.
- **100% Offline & Private**: No cloud accounts, no third-party telemetry, no analytics. Your financial ledger never leaves your device.
- **Mathematical Accuracy**: Stored strictly in integer minor units (paise) to prevent floating-point calculation errors.

---

## ✨ Features

- **The Big Number**: Hero balance typography showing your real-time total net money immediately upon launch.
- **Personality Status Badges**: Contextual lineart badges (`Sparkles`, `Scale`, `Flame`, `Ghost`) reflecting your financial health with situational greetings.
- **Account Ledger**:
  - `Bank` and `Physical Cash` balances tracked side-by-side in clean rounded rectangle cards.
  - Safe account archiving (preserves ledger integrity without breaking transaction history).
- **Core Movements**:
  - **Spent**: Subtracts money from Bank or Cash in seconds. Categories and notes are optional.
  - **Received**: Fast deposits for salary, gifts, or repayments in warm antique cognac tones.
  - **Move Money**: Move money between accounts (`Bank → Cash`) with **zero** change to your total balance.
  - **Reality Check**: Fix real-world cash discrepancies (e.g. lost cash) by creating an audit adjustment record rather than silently overwriting numbers.
- **Date-Grouped History**: Chronological activity grouped by `Today`, `Yesterday`, etc. with instant type filtering.
- **Daily 9:00 PM Reminder**: Local offline notification prompt asking *"Did you record today's expenses?"*.
- **Data Sovereignty**: Complete JSON Export and Import. You own your data forever.

---

## 🧮 How Balance is Calculated

Current balance is **never** the source of truth; the transaction ledger is:

```text
Current Balance = Initial Balance + Money In - Expenses ± Transfers ± Adjustments
```

All internal numbers are stored as **integers in minor units (paise)**:
- `₹1,000` → `100,000` paise
- `₹100.50` → `10,050` paise

This ensures 100% arithmetic precision without floating-point rounding quirks (`0.1 + 0.2 !== 0.3`).

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [React Native](https://reactnative.dev/) with [Expo SDK 57](https://docs.expo.dev/) |
| **Routing** | [Expo Router](https://docs.expo.dev/router/introduction/) (File-based navigation) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict mode) |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) |
| **Local Database** | [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) (Native SQLite with AsyncStorage fallback) |
| **Notifications** | [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) (Local background triggers) |
| **Icons & Typography** | [Lucide React Native](https://lucide.dev/) + System Editorial Typography |
| **Testing** | [Jest](https://jestjs.io/) + [ts-jest](https://kulshekhar.github.io/ts-jest/) |

---

## 📂 Project Architecture

```text
src/
├── app/                  # Expo Router screens and modal flows
│   ├── (tabs)/           # Minimal tabs (Home, History, Settings)
│   ├── expense.tsx       # Fast Expense modal
│   ├── income.tsx        # Money In modal
│   ├── transfer.tsx      # Account Transfer modal
│   ├── adjust.tsx        # Balance Reconciliation modal
│   └── onboarding.tsx    # "Where's your money?" first launch
├── components/ui/        # Reusable design system tokens & tactile inputs
├── services/
│   ├── db/               # SQLite engine & database migrations
│   ├── export/           # JSON backup generation & import validator
│   └── notifications/    # Local notification scheduler
├── store/                # Zustand reactive domain store
├── theme/                # Design tokens (warm neutral background, near-black text)
├── types/                # Strict TypeScript models
└── utils/                # Safe integer paise math & date formatters
```

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/mayankkalra03/broke-mobile.git
cd broke-mobile
npm install
```

### 2. Run the Development Server
```bash
npx expo start
```
- Open **Expo Go** on your Android or iPhone and scan the QR code.
- Press `r` to reload or `w` to run in a web browser.

### 3. Run Tests & Type Checks
```bash
# Run unit tests (16 tests verifying financial math, transfers & exports)
npm test

# Run TypeScript check
npx tsc --noEmit

# Run Expo health check
npx expo-doctor
```

---

## 📦 Building Standalone APK

To build an installable Android APK via EAS:

```bash
# Direct preview APK build
npx eas-cli build -p android --profile preview
```

---

## 📄 License

MIT © [Mayank Kalra](https://github.com/mayankkalra03)
