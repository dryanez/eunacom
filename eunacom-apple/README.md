# EUNACOM — Native Apple Application (iOS, iPadOS, macOS)

[![Swift 6.0](https://img.shields.io/badge/Swift-6.0-orange.svg)](https://swift.org)
[![Platforms](https://img.shields.io/badge/Platforms-iOS%2017%2B%20%7C%20iPadOS%2017%2B%20%7C%20macOS%2014%2B-blue.svg)](https://developer.apple.com)
[![SwiftData](https://img.shields.io/badge/Persistence-SwiftData-green.svg)](https://developer.apple.com/documentation/swiftdata)
[![StoreKit 2](https://img.shields.io/badge/Monetization-StoreKit%202-purple.svg)](https://developer.apple.com/documentation/storekit)
[![Apple HIG](https://img.shields.io/badge/Design-Liquid%20Glass-teal.svg)](https://developer.apple.com/design/human-interface-guidelines/)

---

## 🩺 Overview

**EUNACOM Native Apple** is the dedicated, high-performance universal app built from the ground up for Apple platforms (iPhone, iPad, and Mac) using the best practices and generators from [`claude-code-apple-skills`](https://github.com/rshankras/claude-code-apple-skills).

### Key Highlights
- **100% Native Swift 6 & SwiftUI**: Fully asynchronous architecture utilizing `@Observable`, `actor`, and strict concurrency safety.
- **Adaptive Multiplatform Navigation**: Modern `TabView` on iPhone, multi-column `NavigationSplitView` on iPad and macOS.
- **Liquid Glass Design Language**: Translucent materials (`.ultraThinMaterial`), dynamic lighting, SF Symbols variable rendering, and CoreHaptics tactile feedback.
- **SwiftData & Offline-First**: Zero-latency local question cache and progress tracking with an actor-based `OfflineQueue` that syncs with Supabase when reconnected.
- **StoreKit 2 Subscriptions**: In-App Purchases (Monthly, Semestral, Annual, and Lifetime Founder) with local testing support (`Products.storekit`).
- **MedLingo Clinical Gamification**: Duolingo-style sendero learning path, hearts & lives economy, daily streak tracking with freeze passes, and milestone celebration modals with confetti.
- **System Extensions**:
  - **WidgetKit**: Daily Streak and Question of the Day Home/Lock Screen widgets.
  - **ActivityKit**: Live Activity & Dynamic Island exam timer countdown.
  - **TipKit**: Native contextual gestures and diagnostic advice tips.
  - **CoreSpotlight**: Search EUNACOM codes (e.g. `1.01.1.001`) directly from iOS Spotlight.
  - **Privacy**: Fully compliant `PrivacyInfo.xcprivacy` manifest.

---

## 📁 Architecture & File Structure

```
eunacom-apple/
├── Package.swift                             # Swift Package Manager manifest
├── PrivacyInfo.xcprivacy                     # App Store Privacy Manifest
├── Sources/
│   ├── App/
│   │   ├── EUNACOMApp.swift                  # @main entry point with SwiftData container
│   │   ├── MainContentView.swift             # Adaptive iPhone / iPad / Mac navigation
│   │   ├── AppState.swift                    # Global navigation & scene coordinator
│   │   └── AppConfiguration.swift            # Endpoint configuration & build info
│   ├── Core/
│   │   ├── DesignSystem/
│   │   │   ├── Colors.swift                  # Medical semantic palette
│   │   │   ├── LiquidGlass.swift             # Translucent materials & card modifiers
│   │   │   ├── HapticEngine.swift            # CoreHaptics tactile generator
│   │   │   └── ConfettiView.swift            # Particle celebration engine
│   │   ├── Networking/
│   │   │   ├── APIClient.swift               # URLSession async/await client
│   │   │   ├── APIEndpoint.swift             # Type-safe endpoint protocol
│   │   │   ├── NetworkError.swift            # Localized typed errors
│   │   │   ├── OfflineQueue.swift            # NWPathMonitor reachability & sync queue
│   │   │   └── Endpoints/EUNACOMEndpoints.swift
│   │   ├── Persistence/
│   │   │   ├── PersistenceController.swift   # SwiftData ModelContainer & seed preloader
│   │   │   └── Models/
│   │   │       ├── QuestionItem.swift        # Question @Model
│   │   │       ├── UserProgress.swift        # Mastery & answer history @Model
│   │   │       ├── TestSession.swift         # Timed session @Model
│   │   │       ├── StreakRecord.swift        # Daily streak tracking @Model
│   │   │       └── MedLingoState.swift       # Gamification @Model
│   │   ├── Auth/
│   │   │   ├── AuthManager.swift             # Sign in with Apple & Supabase
│   │   │   └── KeychainService.swift         # Secure Apple Keychain wrapper
│   │   ├── Store/
│   │   │   ├── StoreKitManager.swift         # StoreKit 2 transaction manager
│   │   │   ├── SubscriptionStatus.swift      # Entitlement states
│   │   │   ├── Products.swift                # Tier constants & plan details
│   │   │   └── Products.storekit             # Local Xcode StoreKit test environment
│   │   ├── Tips/
│   │   │   └── AppTips.swift                 # TipKit rules
│   │   └── Spotlight/
│   │       └── SpotlightIndexer.swift        # CoreSpotlight indexer
│   ├── Features/
│   │   ├── Dashboard/                        # Overview & countdown ring
│   │   ├── MisClases/                        # 14-slide Masterclass decks & audio player
│   │   ├── TestEngine/                       # Custom test builder & question runner
│   │   ├── Simulation/                       # Official 180-question 2-block exam
│   │   ├── ReviewErrors/                     # Spaced repetition error review
│   │   ├── MedLingo/                         # Duolingo-style clinical gamification
│   │   ├── StudyPlanner/                     # Felipe Spaced Repetition calendar
│   │   ├── Biblioteca/                       # Exam reconstructions & high-yield PDFs
│   │   ├── Paywall/                          # StoreKit 2 Paywall
│   │   ├── Settings/                         # App settings & account deletion
│   │   └── Onboarding/                       # Value-moment onboarding
│   ├── Widgets/
│   │   ├── StreakWidget.swift                # Home & Lock screen streak widget
│   │   └── DailyQuestionWidget.swift         # Question of the day widget
│   └── LiveActivities/
│       └── ExamTimerActivity.swift           # Dynamic Island countdown timer
└── Tests/
    └── EUNACOMTests/                         # Swift Testing test suite
```

---

## 🚀 How to Open and Run in Xcode

1. Open **Xcode 16+** on macOS.
2. Select **File > Open** and choose the `eunacom-apple` folder (or double-click `Package.swift`).
3. Select an active Simulator (e.g. **iPhone 16 Pro**, **iPad Pro**, or **My Mac (Mac Catalyst / Designed for iPad)**).
4. For testing StoreKit In-App Purchases:
   - Go to **Product > Scheme > Edit Scheme...**
   - In **Run > Options**, set **StoreKit Configuration** to `Products.storekit`.
5. Press **Cmd + R** to Build & Run.
6. Press **Cmd + U** to run all automated unit tests with Swift Testing.

---

## 🛡️ App Store Submission Readiness

- **Privacy Manifest**: Verified `PrivacyInfo.xcprivacy` declaring `CA92.1` for UserDefaults and `C617.1` for local database file timestamps.
- **Account Deletion**: Conforms with Apple App Store Guideline 5.1.1(v) via full account & data wipe option in Settings.
- **StoreKit 2**: Fully handles transaction verification, family sharing, external renewals, and restore purchases according to Apple Guidelines 3.1.1.
