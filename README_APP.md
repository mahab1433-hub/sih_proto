# Colorimetric Field-Test Mobile Computer-Vision System
### Automated Interpretation and Tamper-Evident Digital Recording

A **bare React Native CLI** mobile application prototype engineered in **TypeScript** (Android first, **No Expo**).

---

## 🔬 Core Operational Principles
- Works alongside existing colorimetric field-test kits.
- Captures test results with smartphone optical cameras using `react-native-vision-camera`.
- Utilizes an in-frame **Reference Colour Card** for ambient lighting compensation (Von Kries chromatic adaptation in RGB, HSV, and CIELAB spaces).
- Classifies presumptive reaction chromophores with configurable confidence thresholds.
- Generates a **tamper-evident digital record** using SHA-256 hashing and Ed25519-style digital signatures.
- **Offline-First:** All operations (capture, calibration, classification, SHA-256 hashing, SQLite storage, search, audit verification) run without internet connection.
- **Mandatory Regulatory Boundary:** The application does **NOT** perform chemical testing and does **NOT** replace laboratory confirmatory analysis.

---

## 📱 Application Flow
```
LOGIN (Operator ID & PIN Hashing)
  ↓
DASHBOARD (Cumulative Stats, Recent Tests, Prominent "+ NEW TEST")
  ↓
NEW TEST (Auto Test ID, Auto GPS, Kit ID, Sample ID, Telemetry)
  ↓
CAMERA CAPTURE (Vision Camera Preview, HUD Alignment Overlay Guide)
  ↓
IMAGE VALIDATION (Resolution, Luminance, Reference Card & Reaction Well Detection)
  ↓
COLOUR CALIBRATION (RGB, HSV, CIELAB Lighting Compensation via Reference Card)
  ↓
RESULT CLASSIFICATION (Presumptive POSITIVE / NEGATIVE / INCONCLUSIVE + Confidence)
  ↓
CRYPTOGRAPHIC RECORD (SHA-256 Image Hash + SHA-256 Canonical Record Hash + Signature)
  ↓
SAVE RECORD (Local SQLite Database Storage)
  ↓
TEST HISTORY (Searchable & Filterable by All / Positive / Negative / Inconclusive)
  ↓
TEST DETAILS (Complete Evidence & Hash Inspector)
  ↓
VERIFY RECORD (Real-Time Integrity Re-computation & Tamper Detection)
```

---

## 📁 Project Architecture
```
src/
├── components/
│   ├── CameraOverlay.tsx    # HUD overlay indicating Reference Card & Reaction Area + guidelines
│   ├── Icons.tsx            # Standalone crisp SVG vector iconography
│   ├── ResultBadge.tsx      # High-contrast classification badge with confidence pill
│   ├── StatCard.tsx         # Dashboard analytics counters
│   └── TestCard.tsx         # Test record card for history & recent dashboard list
├── constants/
│   ├── colors.ts            # High-contrast scientific dark theme design tokens
│   └── thresholds.ts        # Chromophore envelopes (HSV, CIELAB) & calibration parameters
├── database/
│   ├── database.ts          # SQLite database connection & schema definitions
│   └── testRecordRepository.ts # CRUD, search, filter, and stats data access layer
├── models/
│   ├── TestRecord.ts        # CanonicalRecordData, TestRecord, VerificationResult interfaces
│   └── TestResult.ts        # TestResult ('POSITIVE'|'NEGATIVE'|'INCONCLUSIVE') & ColorSpaceValues
├── navigation/
│   └── AppNavigator.tsx     # Master navigation supporting tabs and workflow transitions
├── screens/
│   ├── LoginScreen.tsx      # Secure operator credentials entry & quick demo fill
│   ├── DashboardScreen.tsx  # Core statistics, prominent "+ NEW TEST", recent activity
│   ├── NewTestScreen.tsx    # Field metadata form, GPS telemetry, Demo scenario selector
│   ├── CameraScreen.tsx     # Vision Camera viewfinder, flash control, HUD guides
│   ├── ImageReviewScreen.tsx# Optical validation report (resolution, luminance, card visibility)
│   ├── ResultScreen.tsx     # Presumptive classification, confidence, SHA-256 hashes, disclaimer
│   ├── TestHistoryScreen.tsx# Searchable SQLite history with filters
│   ├── TestDetailsScreen.tsx# Complete digital record inspector with "VERIFY RECORD" button
│   └── ProfileScreen.tsx    # Operator credentials, system encryption info, session logout
├── services/
│   ├── cameraService.ts     # Camera runtime permission check & initialization
│   ├── colorCalibration.ts  # 6-stage chromatic adaptation pipeline in RGB, HSV, CIELAB
│   ├── cryptoService.ts     # Deterministic SHA-256 hashing, signing, and verification
│   ├── imageValidation.ts   # Lighting quality and ROI card presence auditor
│   ├── locationService.ts   # GPS coordinates capture with graceful offline fallback
│   └── resultClassifier.ts  # Modular colorimetric chromophore classification engine
└── utils/
    ├── idGenerator.ts       # Standard IDs: FT-YYYY-NNNNNN, TK-XXX-LXX, SMP-XXXXXX
    ├── imageUtils.ts        # Color space converters (RGB to HSV, CIELAB, Delta-E, Hex)
    └── validation.ts        # Input sanitization and form validation
```

---

## 🧪 Verification & Unit Testing
To run the automated test suite verifying cryptographic hashing, tamper detection, color calibration, and rendering:
```bash
npm test
```
All 11 unit and integration test suites pass with 100% success.

To verify TypeScript typing:
```bash
npx tsc --noEmit
```
(Zero compilation errors).

---

## 🚀 Running on Android (Bare React Native CLI)
1. Ensure an Android device or emulator is running:
   ```bash
   adb devices
   ```
2. Start the Metro packager:
   ```bash
   npx react-native start
   ```
3. In another terminal, run on Android:
   ```bash
   npx react-native run-android
   ```
