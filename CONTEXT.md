# Triji App - AI Agent Context Guide

> **Last Updated:** November 14, 2025  
> **Version:** 1.0.1  
> **Purpose:** Comprehensive technical context for AI agents working on this project

---

## 📱 Project Overview

**Triji** is a React Native mobile application built with Expo for educational institutions, providing a centralized platform for task management, announcements, and student communication.

### Core Identity
- **Name:** Triji
- **Package:** com.triji.app
- **Platform:** Android (iOS configuration available but not actively used)
- **Tech Stack:** React Native 0.81.5 + Expo SDK 54 + Firebase 11.10.0
- **Target Users:** Students, teachers, and administrators in educational settings

---

## 🏗️ Architecture

### Technology Stack
```
Frontend:
- React Native 0.81.5
- Expo SDK 54
- React Navigation 6.x (Stack + Bottom Tabs)
- Expo Linear Gradient, Blur effects
- @expo-google-fonts/inter

Backend:
- Firebase Authentication (Email/Password)
- Cloud Firestore (Real-time Database)
- Firebase Storage (future use)

State Management:
- React Hooks (useState, useEffect, useContext)
- Context API (NetworkContext)
- AsyncStorage (local persistence)

Build & Deployment:
- EAS Build (production APKs)
- EAS Update (OTA updates via production channel)
- ProGuard (code shrinking, obfuscation)
```

### App Structure
```
/workspaces/triji-app/
├── App.js                          # Root component, auth flow, navigation setup
├── app.json                        # Expo configuration, plugins, build settings
├── eas.json                        # EAS build profiles, optimization flags
├── package.json                    # Dependencies, scripts
├── firebase.json                   # Firebase Hosting config (web deployment)
├── firestore.rules                 # Firestore security rules
├── android/
│   └── app/
│       └── proguard-rules.pro      # Custom ProGuard rules for Firebase/Expo
├── assets/                         # App icons, splash screen
├── functions/                      # Firebase Cloud Functions (future)
├── src/
│   ├── components/                 # Reusable UI components
│   │   ├── PostCard.js
│   │   ├── TaskCardSkeleton.js
│   │   ├── AnnouncementCardSkeleton.js
│   │   ├── ErrorBoundary.js
│   │   ├── OfflineBanner.js
│   │   ├── ProfileSection.js
│   │   └── SettingsRow.js
│   ├── config/
│   │   └── firebaseConfig.js       # Firebase initialization
│   ├── context/
│   │   └── NetworkContext.js       # Network connectivity state
│   ├── navigation/
│   │   └── TabNavigator.js         # Bottom tab navigation
│   ├── screens/                    # All app screens (19 total)
│   │   ├── DashboardScreen.js      # Home screen with unified feed
│   │   ├── TaskboardScreen.js      # Task list with deadline management
│   │   ├── AnnouncementsScreen.js  # Announcements with type filtering
│   │   ├── FreedomWallScreen.js    # Anonymous posting wall
│   │   ├── ProfileScreen.js        # User profile
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   └── ... (16 more)
│   └── utils/
│       ├── errorHandler.js         # Centralized error handling
│       ├── firestoreListeners.js   # Real-time data sync + notifications
│       └── notifications.js        # Push notification setup + channels
└── .eas/
    └── workflows/                  # EAS CLI automated workflows
        ├── create-production-builds.yml
        └── publish-update.yml
```

---

## 🔥 Firebase Architecture

### Collections Structure

**`users` Collection:**
```javascript
{
  uid: string,                    // Firebase Auth UID
  email: string,
  firstName: string,
  lastName: string,
  role: "student" | "teacher" | "admin",
  createdAt: Timestamp,
  notificationsEnabled: boolean,
  // Optional fields:
  displayName: string,
  photoURL: string,
  bio: string
}
```

**`tasks` Collection:**
```javascript
{
  id: string,                     // Auto-generated
  title: string,
  description: string,            // Also accepts 'details' field (admin compatibility)
  subjectCode: string,            // Also accepts 'subject' field (admin compatibility)
  deadline: string | Timestamp,   // ISO string or Firestore Timestamp
  createdAt: Timestamp,
  createdBy: string,              // User UID
  status: "pending" | "completed",
  archived: boolean,
  priority: "low" | "medium" | "high"
}
```

**`announcements` Collection:**
```javascript
{
  id: string,
  title: string,
  content: string,
  type: "general" | "critical" | "event" | "reminder",
  createdAt: Timestamp,
  createdBy: string,
  archived: boolean,
  expiresAt: Timestamp,           // Optional
  attachments: string[],          // Optional URLs
  pinned: boolean
}
```

**`freedomWallPosts` Collection:**
```javascript
{
  id: string,
  content: string,
  author: string,                 // Anonymous nickname
  color: string,                  // Card background color
  upvotes: number,
  downvotes: number,
  comments: [],                   // Future feature
  createdAt: Timestamp,
  userId: string,                 // For deletion permission
  flagged: boolean
}
```

### Authentication Flow
1. User signs up via `RegisterScreen` → Creates Firebase Auth user + Firestore user doc
2. Email verification required (future enhancement)
3. `onAuthStateChanged` in `App.js` manages auth state globally
4. Authenticated: Start Firestore listeners (`startAllListeners()`)
5. Logged out: Stop all listeners (`stopAllListeners()`)
6. **Native Firebase Auth persistence** - no manual AsyncStorage session management

---

## 📲 Core Features

### 1. Dashboard (Home)
- **File:** `DashboardScreen.js`
- **Purpose:** Unified activity feed showing 5 most recent updates from all sources
- **Features:**
  - Real-time stats: Total tasks, announcements, posts
  - Unified feed: Tasks, announcements, Freedom Wall posts sorted by timestamp
  - Relative timestamps (45s ago, 2h ago, etc.)
  - Navigation to detail screens
  - Pull-to-refresh

### 2. Taskboard
- **File:** `TaskboardScreen.js`
- **Purpose:** Task management with deadline tracking
- **Features:**
  - Task cards with subject badges, deadline, description
  - Sortable by deadline (ascending/descending)
  - Pagination (10 items per page)
  - Text truncation for long subjects (ellipsis)
  - Navigate to `TaskDetailScreen` for full view
  - Archive functionality
  - Field compatibility: Handles both `subjectCode`/`subject`, `description`/`details`

### 3. Announcements
- **File:** `AnnouncementsScreen.js`
- **Purpose:** Official announcements from admins/teachers
- **Features:**
  - Type-based filtering (General, Critical, Event, Reminder)
  - Search functionality
  - Type-specific emojis (🚨 Critical, 📅 Event, ⏰ Reminder, 📢 General)
  - Pagination (10 items per page)
  - Archive system
  - Rich text content display

### 4. Freedom Wall
- **File:** `FreedomWallScreen.js`
- **Purpose:** Anonymous student expression platform
- **Features:**
  - Anonymous posting with custom nicknames
  - Color-coded cards (user selectable)
  - Upvote/downvote system
  - Post cooldown (60 seconds)
  - Pagination (30 items per page)
  - Offline support (pending posts queue)
  - Sort options (Oldest/Newest, Most upvoted)

### 5. Profile & Settings
- **Files:** `ProfileScreen.js`, `AccountSettingsScreen.js`, `EditProfileScreen.js`
- **Features:**
  - User profile management
  - Notification settings toggle
  - Password change
  - Logout functionality
  - View personal posts/tasks (future)

### 6. Grade Calculator
- **File:** `GradeCalculatorScreen.js`
- **Purpose:** Utility for calculating weighted grades
- **Features:**
  - Add/remove grade components
  - Percentage weighting
  - Real-time GPA calculation

---

## 🔔 Notifications System

### Architecture
- **Local notifications only** (Firebase Cloud Messaging requires backend)
- **Android notification channels:**
  - `tasks` (HIGH priority, green LED)
  - `announcements` (HIGH priority, red LED)
  - `freedomwall` (DEFAULT priority, blue LED)

### Implementation
1. **Setup:** `notifications.js` - registers permissions, creates channels
2. **Triggering:** `firestoreListeners.js` - detects new documents via `onSnapshot`
3. **Messages:**
   - Tasks: "📋 New Task Added • [Subject] • [Title]"
   - Announcements: "[Type Emoji] [Type] Announcement • [Title]"
   - Freedom Wall: "💬 Freedom Wall • [Author]: [preview...]"

### Limitations
- ⚠️ **Only works when app is open or in background** (not when fully closed)
- For closed-app notifications, requires Firebase Cloud Functions backend (future)

---

## 🚀 Build & Deployment

### Build Optimization (ProGuard)
**Purpose:** Reduce APK size from ~200MB to ~30-50MB

**Configuration:**
- `android/app/proguard-rules.pro` - Custom rules protecting:
  - Firebase (Auth, Firestore, Messaging)
  - Expo modules
  - React Native core
  - AsyncStorage
- `app.json` - `expo-build-properties` plugin enables ProGuard + resource shrinking
- `eas.json` - Production profile with `gradleCommand: ":app:assembleRelease"`

### EAS Update (OTA)
**Channel:** `production`

**What can be updated OTA:**
- ✅ JavaScript code (all `.js` files)
- ✅ UI layouts, styles, colors
- ✅ Business logic, Firebase queries
- ✅ New screens/features (pure JS)
- ✅ Bug fixes

**What requires rebuild:**
- ❌ Native dependencies (new npm packages with native code)
- ❌ `app.json` changes (permissions, icons, splash)
- ❌ ProGuard rules
- ❌ Android/iOS native config

**Commands:**
```bash
# OTA Update (30 seconds)
npm run update:production
# or
eas workflow:run publish-update

# Full APK Build (10-15 minutes)
npm run build:android:prod
# or
eas workflow:run create-production-builds
```

### EAS Workflows
**Location:** `.eas/workflows/`

1. **`create-production-builds.yml`**
   - Builds optimized APK
   - Publishes OTA update
   - Optional skip build (OTA only)

2. **`publish-update.yml`**
   - Fast OTA update only
   - Custom message input
   - No APK build

---

## 🎨 Design System

### Color Palette
```javascript
Primary Background: #1B2845 (Dark Blue)
Secondary Background: #274060 (Lighter Blue)
Accent: #22e584 (Neon Green)
Text Primary: #FFFFFF
Text Secondary: #A0AEC0
Card Background: #2A3F5F
Border: #3D5A7F

Task Badge Colors:
- Default: #22e584
- High Priority: #FF6B6B
- Medium Priority: #FFA500

Announcement Types:
- Critical: #FF4757
- Event: #5352ED
- Reminder: #FFA502
- General: #22e584
```

### Typography
```
Font Family: Inter (400, 500, 600)
Heading: 24px, SemiBold (Inter_600SemiBold)
Title: 18px, Medium (Inter_500Medium)
Body: 14px, Regular (Inter_400Regular)
Caption: 12px, Regular
```

### Spacing
```
Padding: 16px (standard), 12px (compact)
Margin: 16px (standard), 8px (tight)
Border Radius: 12px (cards), 8px (buttons)
```

---

## 🐛 Common Issues & Solutions

### 1. Authentication Persistence
**Issue:** Users logged out when app closes  
**Solution:** Use Firebase native `onAuthStateChanged`, no manual AsyncStorage  
**Files:** `App.js`, `LoginScreen.js`, `AccountSettingsScreen.js`

### 2. Task Field Compatibility
**Issue:** Admin dashboard uses different field names  
**Solution:** Fallback logic `task.subjectCode || task.subject`  
**Files:** `TaskboardScreen.js`, `TaskDetailScreen.js`, `DashboardScreen.js`

### 3. Date Format Handling
**Issue:** Firestore Timestamps vs ISO strings  
**Solution:** `formatDate()` function handles `.toDate()`, `.seconds`, ISO strings  
**Files:** All screens with date display

### 4. Bottom Navigation Overlap (Android)
**Issue:** Tab bar overlaps Android button navigation  
**Solution:** `useSafeAreaInsets()` for dynamic padding  
**Files:** `TabNavigator.js`

### 5. Text Overflow Breaking Layout
**Issue:** Long subject names break card layout  
**Solution:** `numberOfLines={1}`, `ellipsizeMode="tail"`, `maxWidth: '65%'`, `flexShrink: 1`  
**Files:** Task/announcement card components

### 6. Large APK Size
**Issue:** 200MB APK (too large)  
**Solution:** ProGuard + resource shrinking (reduces to 30-50MB)  
**Files:** `eas.json`, `app.json`, `android/app/proguard-rules.pro`

---

## 📝 Code Conventions

### File Naming
- **Screens:** `PascalCase` + `Screen` suffix (e.g., `DashboardScreen.js`)
- **Components:** `PascalCase` (e.g., `PostCard.js`)
- **Utils:** `camelCase` (e.g., `errorHandler.js`)

### State Management
- Use functional components with Hooks
- `useState` for local state
- `useEffect` for side effects, listeners
- `useContext` for shared state (network connectivity)

### Firebase Patterns
```javascript
// ✅ Good: Unsubscribe from listeners
useEffect(() => {
  const unsubscribe = onSnapshot(query, callback);
  return () => unsubscribe();
}, []);

// ✅ Good: Check auth before queries
if (!auth.currentUser) {
  return;
}

// ✅ Good: Handle Firestore Timestamps
const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);

// ❌ Bad: Forgot to unsubscribe (memory leak)
useEffect(() => {
  onSnapshot(query, callback);
}, []);
```

### Error Handling
```javascript
// Use centralized error handler
import { logError, showErrorAlert } from '../utils/errorHandler';

try {
  // code
} catch (error) {
  logError('Context description', error);
  showErrorAlert('User-friendly message');
}
```

---

## 🧪 Testing Checklist

### Before Production Build
- [ ] Login/Logout works
- [ ] All screens load without errors
- [ ] Task creation and viewing
- [ ] Announcement creation and viewing
- [ ] Freedom Wall posting (with cooldown)
- [ ] Notifications appear (app in background)
- [ ] Bottom navigation doesn't overlap (test on Android with button nav)
- [ ] Pull-to-refresh works
- [ ] Pagination works (10+ items)
- [ ] Offline banner appears when disconnected
- [ ] Task/announcement archiving works

### After OTA Update
- [ ] JavaScript changes applied
- [ ] No new errors in console
- [ ] Existing features still work
- [ ] Users receive update automatically (within ~5 minutes)

---

## 🔄 Automated Release Process

### Overview
This project uses **semantic-release** for fully automated versioning, changelog generation, and deployments. All releases are triggered by pushing commits to `main` branch with Conventional Commits format.

### Workflow
1. **Commit with conventional format:**
   ```bash
   git commit -m "feat: add new feature"  # Minor release
   git commit -m "fix: resolve bug"       # Patch release
   git commit -m "feat!: breaking change" # Major release
   ```

2. **Push to main:**
   ```bash
   git push origin main
   ```

3. **GitHub Actions automatically:**
   - Validates commit message format
   - Analyzes commits to determine version bump
   - Updates `package.json`, `app.json`, `CHANGELOG.md`
   - Creates Git tag
   - Publishes GitHub Release
   - Triggers deployment:
     - **PATCH/MINOR:** EAS Update (OTA) - users auto-update in ~5 minutes
     - **MAJOR:** EAS Build (APK) - users must reinstall

### Version Bump Rules

| Commit Type | Version Change | Deployment | User Action |
|-------------|----------------|------------|-------------|
| `fix:`, `perf:`, `revert:` | PATCH (1.0.0 → 1.0.1) | EAS Update | Auto-update |
| `feat:` | MINOR (1.0.0 → 1.1.0) | EAS Update | Auto-update |
| `feat!:` or `BREAKING CHANGE:` | MAJOR (1.0.0 → 2.0.0) | EAS Build | Reinstall APK |
| `docs:`, `chore:`, `style:`, etc. | None | None | None |

### When to Use MAJOR (Breaking Change)
Use `BREAKING CHANGE:` footer or `!` after type for:
- Adding/removing native dependencies
- Changing `app.json` (permissions, icons, splash)
- Modifying ProGuard rules
- Database schema changes requiring migration
- Updating Expo SDK version
- Any change requiring app reinstall

### When to Use MINOR/PATCH (OTA Update)
Safe for OTA updates:
- JavaScript code changes
- UI layouts, styles, colors
- New screens/features (pure JS)
- Bug fixes, performance improvements
- Text/copy changes

### Emergency Hotfix
For urgent fixes bypassing CI:
```bash
npm run update:production  # OTA update live in ~30 seconds
```

### Manual Release
To trigger release locally (requires `GITHUB_TOKEN` and `EXPO_TOKEN`):
```bash
npm run semantic-release
```

📖 **Full Documentation:** [docs/VERSIONING.md](docs/VERSIONING.md)  
⚡ **Quick Reference:** [docs/COMMIT_GUIDE.md](docs/COMMIT_GUIDE.md)

---

## 📦 Dependencies

### Core
- `expo`: ~54.0.0 (framework)
- `react`: 19.1.0
- `react-native`: 0.81.5
- `firebase`: ^11.10.0

### Navigation
- `@react-navigation/native`: ^6.1.18
- `@react-navigation/bottom-tabs`: ^6.6.1
- `@react-navigation/stack`: ^6.4.1

### UI/UX
- `expo-linear-gradient`: ~15.0.7
- `expo-blur`: ~15.0.7
- `@expo-google-fonts/inter`: ^0.4.1
- `@expo/vector-icons`: ^15.0.3

### Utilities
- `expo-notifications`: ~0.32.12
- `@react-native-async-storage/async-storage`: 2.2.0
- `@react-native-community/netinfo`: 11.4.1
- `@react-native-community/datetimepicker`: 8.4.4

### Build
- `expo-build-properties`: ^1.0.9 (ProGuard optimization)
- `expo-updates`: ~29.0.12 (OTA updates)

---

## 🚨 Critical Files (Never Delete)

1. **`src/config/firebaseConfig.js`** - Firebase initialization
2. **`App.js`** - Root component, auth flow
3. **`src/utils/firestoreListeners.js`** - Real-time data sync
4. **`src/navigation/TabNavigator.js`** - Main navigation
5. **`android/app/proguard-rules.pro`** - Prevents ProGuard crashes
6. **`.env`** - Firebase credentials (gitignored)
7. **`eas.json`** - Build configuration

---

## 🎯 Future Enhancements

### Backend (Firebase Cloud Functions)
- Push notifications for closed app state
- Scheduled announcement expiration
- Automated task reminders
- Content moderation for Freedom Wall
- Analytics and usage tracking

### Features
- Comment system for Freedom Wall posts
- Task completion tracking
- File attachments for announcements/tasks
- User reputation system
- Dark/light theme toggle
- In-app messaging between users

### Optimization
- Image caching optimization
- Lazy loading for large lists
- Background fetch for notifications
- Incremental updates (smaller OTA sizes)
- App size monitoring

---

## 📊 Performance Metrics

### Target Metrics
- **App Size:** 30-50MB (optimized APK)
- **Initial Load:** < 3 seconds
- **Screen Transitions:** < 300ms
- **Data Fetch:** < 2 seconds (with cache)
- **OTA Update Size:** < 5MB (typical JS changes)

### Current Status (v1.0.1)
- ✅ ProGuard enabled
- ✅ Resource shrinking enabled
- ✅ Offline persistence enabled
- ✅ Safe area insets configured
- ✅ EAS Update configured

---

## 📞 Support & Maintenance

### When Things Break
1. **Check EAS Build logs:** https://expo.dev/accounts/gauciv/projects/triji-app/builds
2. **Check device logs:** `adb logcat` (Android)
3. **Review Firestore rules:** Ensure users have read/write permissions
4. **Verify Firebase config:** Check `.env` variables are set

### Common Commands
```bash
# Start dev server
npx expo start --tunnel

# Clear cache
npx expo start --clear

# Check for errors
npm run lint

# View EAS builds
eas build:list

# View OTA updates
eas update:list

# Rollback OTA update
eas update:rollback
```

---

## 🔐 Security Notes

### Environment Variables
- All Firebase credentials stored in `.env` (gitignored)
- EAS uses Expo secrets for production builds
- Never commit API keys to repository

### Firestore Rules
- Users can only read their own user document
- Admin role required for creating announcements/tasks
- Freedom Wall posts can be deleted only by creator
- Anonymous posting allowed but tied to user UID

### ProGuard
- Obfuscates code (harder to reverse engineer)
- Does NOT encrypt data
- Security rules on Firebase side are critical

---

## 📝 Version History

### v1.0.1 (Current - November 14, 2025)
- ✅ ProGuard optimization enabled
- ✅ Resource shrinking enabled
- ✅ EAS Update production channel configured
- ✅ Safe area insets for Android button navigation
- ✅ Unified dashboard feed
- ✅ Enhanced notifications with emojis
- ✅ Field compatibility (admin/user formats)

### v1.0.0 (Initial Release)
- ✅ Core features: Tasks, Announcements, Freedom Wall
- ✅ Firebase Authentication
- ✅ Real-time Firestore sync
- ✅ Local notifications
- ✅ Offline support

---

## 🤖 Instructions for AI Agents

### When Making Changes

1. **Always check auth state:**
   ```javascript
   if (!auth.currentUser) {
     // Handle unauthenticated state
     return;
   }
   ```

2. **Unsubscribe from Firestore listeners:**
   ```javascript
   useEffect(() => {
     const unsubscribe = onSnapshot(...);
     return () => unsubscribe();
   }, []);
   ```

3. **Handle date formats gracefully:**
   ```javascript
   const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
   if (isNaN(date.getTime())) {
     return 'Invalid date';
   }
   ```

4. **Use field fallbacks for compatibility:**
   ```javascript
   const subject = task.subjectCode || task.subject || 'N/A';
   ```

5. **Test on small screens (< 400px width):**
   ```javascript
   const isSmallScreen = Dimensions.get('window').width < 400;
   ```

6. **For OTA updates:** Only modify `.js` files, no native changes
7. **For native changes:** Bump version in `app.json`, rebuild APK
8. **Always test offline behavior** for network-dependent features

### When Troubleshooting

1. Check terminal for React Native errors
2. Review Firebase console for Firestore/Auth issues
3. Verify ProGuard rules if features break after build
4. Check EAS Build logs for build failures
5. Use `console.log` extensively (removed in production by ProGuard)

---

## 📚 Additional Resources

- **Expo Docs:** https://docs.expo.dev/
- **Firebase Docs:** https://firebase.google.com/docs
- **React Navigation:** https://reactnavigation.org/
- **EAS Build:** https://docs.expo.dev/build/introduction/
- **EAS Update:** https://docs.expo.dev/eas-update/introduction/

---

**Note:** This document should be updated whenever significant architectural changes, new features, or breaking changes are introduced to the project. Keep it current for maximum AI agent effectiveness.
