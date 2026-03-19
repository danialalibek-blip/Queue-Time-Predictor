# Smart Queue AI

Smart Queue AI is a Flutter mobile app that helps people avoid waiting in banks, clinics, government service centers, stores, and other high-traffic places.

The app solves the full user task end-to-end:
- sign in with Firebase Auth
- see nearby locations with live queue status
- open a place card and view the current wait, crowd index, and 1-3 hour forecast
- update the queue in one tap
- save favorites
- create a smart booking slot
- edit or delete your own reports and bookings from the profile screen

## What Is Implemented

### Authentication
- Google sign-in through Firebase Auth
- Email and password sign-in through Firebase Auth
- Automatic verification email on registration via `sendEmailVerification()`
- Session persistence after app restart through Firebase Auth
- Sign out flow

### Firestore As Main Database
- `users`
- `locations`
- `queue_reports`
- `predictions`
- `bookings`
- `behavior_events`

The app uses Firestore as the primary data source. If Firebase is not configured yet, the app falls back to a local demo mode so the UI still runs without crashing.

### Core Product Flow
- Nearby locations list with sorting by wait time, distance, and crowd
- Live crowd index
- Smart prediction for the next 1-3 hours
- Alternative branch recommendation
- Smart booking slots
- Favorites
- B2B dashboard for managed branches
- Trust score and referral loop
- Low internet mode with last snapshot cache
- City heatmap map screen

### CRUD
- Queue report: create, read, update, delete
- Smart booking: create, read, update, delete
- Favorites: create, read, delete

## Tech Stack

- Flutter
- Firebase Auth
- Cloud Firestore
- Google Sign-In
- Android APK build via Flutter/Gradle

## Project Structure

```text
lib/
├── main.dart
├── models/
│   ├── app_user.dart
│   ├── booking.dart
│   ├── notification_item.dart
│   └── place.dart
├── screens/
│   ├── auth_screen.dart
│   ├── booking_screen.dart
│   ├── business_dashboard_screen.dart
│   ├── detail_screen.dart
│   ├── favorites_screen.dart
│   ├── home_screen.dart
│   ├── map_screen.dart
│   ├── notifications_screen.dart
│   ├── onboarding_screen.dart
│   ├── profile_screen.dart
│   └── update_screen.dart
├── services/
│   ├── auth_service.dart
│   ├── booking_service.dart
│   ├── business_service.dart
│   ├── favorites_service.dart
│   ├── firebase_runtime.dart
│   ├── notifications_service.dart
│   ├── offline_cache_service.dart
│   ├── places_service.dart
│   ├── queue_helpers.dart
│   └── referral_service.dart
├── theme/
│   ├── app_colors.dart
│   └── app_theme.dart
└── widgets/
```

## Firebase Setup

### 1. Create A Firebase Project
- Enable Firebase Auth
- Turn on `Email/Password`
- Turn on `Google`
- Create a Firestore database

### 2. Run The App With Firebase Config

Use `--dart-define` so keys stay out of source control:

```bash
/Users/danial/flutter/bin/flutter run \
  --dart-define=FIREBASE_API_KEY=your_api_key \
  --dart-define=FIREBASE_APP_ID=your_app_id \
  --dart-define=FIREBASE_MESSAGING_SENDER_ID=your_sender_id \
  --dart-define=FIREBASE_PROJECT_ID=your_project_id \
  --dart-define=FIREBASE_AUTH_DOMAIN=your_auth_domain \
  --dart-define=FIREBASE_STORAGE_BUCKET=your_storage_bucket \
  --dart-define=GOOGLE_SERVER_CLIENT_ID=your_google_server_client_id
```

Optional:
- `FIREBASE_IOS_BUNDLE_ID`
- `GOOGLE_WEB_CLIENT_ID`

### 3. Verification Email

When a user registers with email and password, the app immediately calls Firebase `sendEmailVerification()`.

## Firestore Collections

### `users`
- profile data
- trust score
- referral data
- onboarding flag
- favorite location IDs
- low internet mode flag

### `locations`
- static location metadata
- category
- map coordinates
- chart baseline

### `queue_reports`
- user queue updates
- business desk updates
- trust weight
- wait minutes
- people count

### `predictions`
- current predicted wait
- crowd index
- best visit time
- 1-3 hour forecast
- recommendation text

### `bookings`
- pseudo-booked user slots
- rescheduled and canceled states

### `behavior_events`
- interest
- booking demand
- actual arrival

## Prediction Logic

The prediction engine is intentionally simple and MVP-friendly:

```text
report_weight = time_decay * trust_weight
time_decay = 1 / (1 + age_minutes / 35)

current_wait =
  recent_wait * 0.68 +
  historical_wait * 0.24 +
  trend * 0.16 +
  behavior_boost
```

Behavior boost is driven by:
- views
- bookings
- actual arrivals

This keeps the app launchable in 2-4 weeks while still feeling smart.

## End-To-End User Flow

1. User signs in with Google or email/password.
2. The session persists after restart.
3. Home screen shows nearby places and live wait estimates.
4. User opens a location.
5. The app shows crowd index, forecast, best visit time, and alternative branch.
6. User updates the queue or books a suggested slot.
7. The report and booking are stored in Firestore.
8. The profile screen lets the user edit or delete both.

## Build And Verify

Analyze:

```bash
/Users/danial/flutter/bin/flutter analyze
```

Build debug APK:

```bash
/Users/danial/flutter/bin/flutter build apk --debug
```

## Branding

- Custom Android app icon included
- Custom color palette and branded label: `Smart Queue AI`
- Not using the default Flutter launcher icon

## Notes For Submission

- The app is Firebase-ready and works in live mode once real Firebase keys are provided.
- Without Firebase keys, the app runs in a safe demo fallback so reviewers can still navigate the product.
- This repository was prepared for GitHub publishing, but actual push to GitHub requires a real git remote and account credentials on the machine.
