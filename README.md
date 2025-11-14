# Triji

<div align="center">

![Triji Logo](./assets/icon.png)

**A Unified Educational Hub for Students and Educators**

[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020.svg)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-11.10.0-orange.svg)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-Private-red.svg)]()

</div>

---

## 📱 About Triji

Triji is a comprehensive mobile application designed to streamline the educational experience by consolidating **task management**, **announcements**, and **student communication** into a single, intuitive platform. Built with modern technologies, Triji provides real-time synchronization, offline support, and a seamless user experience.

### ✨ Key Features

- 📋 **Task Management** - Track assignments with deadline reminders and status updates
- 📢 **Announcements** - Receive official updates with type-based categorization (Critical, Event, Reminder, General)
- 💬 **Freedom Wall** - Anonymous student expression platform with upvote/downvote system
- 🏠 **Unified Dashboard** - See all recent activity from tasks, announcements, and posts in one feed
- 🔔 **Push Notifications** - Stay informed with timely alerts (tasks, announcements, new posts)
- 📊 **Grade Calculator** - Utility for calculating weighted grades and GPA
- 👤 **Profile Management** - Customize your profile and manage account settings
- 🌐 **Offline Support** - Access cached content without internet connection
- 🔄 **Real-time Sync** - Instant updates across all devices
- 🌙 **Dark Mode** - Battery-efficient, eye-friendly design

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Expo CLI**: `npm install -g expo-cli`
- **EAS CLI**: `npm install -g eas-cli`
- **Android Studio** (for Android development)
- **Firebase Project** (for backend services)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/gauciv/triji-app.git
   cd triji-app
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root directory:

   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Configure Firebase:**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable **Authentication** (Email/Password)
   - Create a **Firestore Database**
   - Copy your Firebase config to `.env`

5. **Deploy Firestore Security Rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```

### Running the App

#### Development Mode

```bash
# Start Expo dev server
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios
```

#### Tunnel Mode (for testing on physical devices)

```bash
npx expo start --tunnel
```

---

## 🏗️ Tech Stack

### Frontend

- **React Native** 0.81.5 - Cross-platform mobile framework
- **Expo SDK** 54 - Managed workflow and development tools
- **React Navigation** 6.x - Screen navigation (Stack + Bottom Tabs)
- **Expo Linear Gradient** - Gradient backgrounds
- **Expo Blur** - Blur effects
- **Inter Font Family** - Clean, modern typography

### Backend

- **Firebase Authentication** - User authentication and management
- **Cloud Firestore** - Real-time NoSQL database
- **Firebase Storage** - Future file storage (planned)

### State Management

- **React Hooks** - useState, useEffect, useContext
- **Context API** - Global state (NetworkContext)
- **AsyncStorage** - Local persistence

### Notifications

- **Expo Notifications** - Local push notifications
- **Android Notification Channels** - Organized notification categories

### Build & Deployment

- **EAS Build** - Cloud-based builds for Android/iOS
- **EAS Update** - Over-the-air (OTA) JavaScript updates
- **ProGuard** - Code shrinking and obfuscation (reduces APK by 60%)

---

## 📁 Project Structure

```
triji-app/
├── .eas/
│   └── workflows/              # EAS automated workflows
│       ├── create-production-builds.yml
│       └── publish-update.yml
├── android/
│   └── app/
│       └── proguard-rules.pro  # Custom ProGuard rules
├── assets/                     # App icons, splash screen
│   ├── icon.png
│   ├── splash.png
│   ├── adaptive-icon.png
│   └── favicon.png
├── functions/                  # Firebase Cloud Functions (future)
│   └── index.js
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── AnnouncementCardSkeleton.js
│   │   ├── ErrorBoundary.js
│   │   ├── InfoRow.js
│   │   ├── OfflineBanner.js
│   │   ├── PostCard.js
│   │   ├── ProfileSection.js
│   │   ├── SettingsRow.js
│   │   ├── TaskCardSkeleton.js
│   │   └── index.js
│   ├── config/
│   │   └── firebaseConfig.js   # Firebase initialization
│   ├── context/
│   │   └── NetworkContext.js   # Network connectivity state
│   ├── navigation/
│   │   └── TabNavigator.js     # Bottom tab navigation
│   ├── screens/                # All app screens (19 total)
│   │   ├── DashboardScreen.js
│   │   ├── TaskboardScreen.js
│   │   ├── AnnouncementsScreen.js
│   │   ├── FreedomWallScreen.js
│   │   ├── ProfileScreen.js
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   └── ... (12 more)
│   └── utils/
│       ├── errorHandler.js     # Centralized error handling
│       ├── firestoreListeners.js # Real-time data sync
│       └── notifications.js    # Push notification setup
├── App.js                      # Root component
├── app.json                    # Expo configuration
├── eas.json                    # EAS build configuration
├── firebase.json               # Firebase configuration
├── firestore.rules             # Firestore security rules
├── package.json                # Dependencies and scripts
├── CONTEXT.md                  # Technical context for AI agents
├── SOCIAL_MEDIA_SPECS.md       # Social media content
└── README.md                   # This file
```

---

## 🔥 Firebase Collections

### `users`

```javascript
{
  uid: string,                // Firebase Auth UID
  email: string,
  firstName: string,
  lastName: string,
  role: "student" | "teacher" | "admin",
  createdAt: Timestamp,
  notificationsEnabled: boolean,
  displayName?: string,
  photoURL?: string,
  bio?: string
}
```

### `tasks`

```javascript
{
  id: string,
  title: string,
  description: string,        // Also accepts 'details'
  subjectCode: string,        // Also accepts 'subject'
  deadline: string | Timestamp,
  createdAt: Timestamp,
  createdBy: string,          // User UID
  status: "pending" | "completed",
  archived: boolean,
  priority: "low" | "medium" | "high"
}
```

### `announcements`

```javascript
{
  id: string,
  title: string,
  content: string,
  type: "general" | "critical" | "event" | "reminder",
  createdAt: Timestamp,
  createdBy: string,
  archived: boolean,
  expiresAt?: Timestamp,
  attachments?: string[],
  pinned: boolean
}
```

### `freedomWallPosts`

```javascript
{
  id: string,
  content: string,
  author: string,             // Anonymous nickname
  color: string,              // Card background color
  upvotes: number,
  downvotes: number,
  createdAt: Timestamp,
  userId: string,             // For deletion permission
  flagged: boolean
}
```

---

## 🛠️ Available Scripts

### Development

```bash
npm start              # Start Expo dev server
npm run android        # Run on Android emulator/device
npm run ios            # Run on iOS simulator (macOS only)
npm run web            # Run in web browser
```

### Building

```bash
npm run build:android:prod     # Build production Android APK
npm run build:ios:prod         # Build production iOS IPA
npm run build:production       # Build for all platforms
```

### Updates (OTA)

```bash
npm run update:production      # Publish OTA update to production
npm run update:preview         # Publish OTA update to preview
```

### Automated Releases

```bash
npm run semantic-release       # Run semantic-release locally
npm run version:sync           # Sync version to app.json
```

### EAS Workflows

```bash
eas workflow:run create-production-builds  # Build APK + publish update
eas workflow:run publish-update            # Fast OTA update only
```

### Other

```bash
npm run lint           # Run linter (not configured yet)
npm run test           # Run tests (not configured yet)
```

**Note:** Releases are automated via GitHub Actions. See [VERSIONING.md](docs/VERSIONING.md) for details.

---

## 📦 Build & Deployment

### Automated Versioning & Releases

This project uses **semantic-release** for fully automated versioning, changelog generation, and deployments based on [Conventional Commits](https://www.conventionalcommits.org/).

**How it works:**

1. Commit with conventional format: `feat: add feature` or `fix: bug fix`
2. Push to `main` branch
3. GitHub Actions automatically:
   - Determines version bump (patch/minor/major)
   - Updates CHANGELOG.md
   - Creates Git tag
   - Publishes GitHub Release
   - Deploys via EAS Update (OTA) or EAS Build (APK)

**Version Bump Rules:**

- `fix:`, `perf:`, `revert:` → **PATCH** (1.0.0 → 1.0.1) → EAS Update
- `feat:` → **MINOR** (1.0.0 → 1.1.0) → EAS Update
- `feat!:` or `BREAKING CHANGE:` → **MAJOR** (1.0.0 → 2.0.0) → EAS Build

📖 **Full guide:** [docs/VERSIONING.md](docs/VERSIONING.md)  
⚡ **Quick reference:** [docs/COMMIT_GUIDE.md](docs/COMMIT_GUIDE.md)

### Manual OTA Update (Emergency)

For immediate bug fixes bypassing CI:

```bash
npm run update:production
```

**Updates are live in ~30 seconds** and users receive them automatically within 5 minutes.

### Manual Production Build

For testing or emergency releases:

```bash
npm run build:android:prod
```

### What Can Be Updated via OTA?

✅ **Yes (OTA - PATCH/MINOR):**

- JavaScript code changes
- UI layouts, styles, colors
- Business logic, Firebase queries
- New screens/features (pure JS)
- Bug fixes

❌ **No (Requires Rebuild - MAJOR):**

- Native dependencies (new npm packages)
- `app.json` changes (permissions, icons)
- ProGuard rules
- Android/iOS native configuration

---

## 🔐 Security

### Authentication

- Firebase Authentication with email/password
- Native Firebase Auth persistence (no manual session management)
- Secure password reset via email

### Data Protection

- Firestore Security Rules enforce user permissions
- Admin role required for creating announcements/tasks
- Users can only read their own user documents
- Freedom Wall posts tied to user UID for moderation

### Code Obfuscation

- ProGuard enabled in production builds
- Custom rules protect Firebase and Expo modules
- Source code obfuscated to prevent reverse engineering

### Environment Variables

- All Firebase credentials stored in `.env` (gitignored)
- EAS uses Expo secrets for production builds
- Never commit API keys to version control

---

## 🎨 Design System

### Color Palette

```css
Primary Background:   #1B2845 (Midnight Blue)
Secondary Background: #274060 (Steel Blue)
Accent:              #22e584 (Neon Green)
Text Primary:        #FFFFFF (White)
Text Secondary:      #A0AEC0 (Gray)
Card Background:     #2A3F5F
Border:              #3D5A7F
```

### Typography

```
Font Family: Inter (400, 500, 600)
Heading:  24px, SemiBold
Title:    18px, Medium
Body:     14px, Regular
Caption:  12px, Regular
```

### Spacing

```
Padding:       16px (standard), 12px (compact)
Margin:        16px (standard), 8px (tight)
Border Radius: 12px (cards), 8px (buttons)
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Login/Logout functionality
- [ ] All screens load without errors
- [ ] Task creation and viewing
- [ ] Announcement creation and viewing
- [ ] Freedom Wall posting with cooldown
- [ ] Notifications appear (app in background)
- [ ] Bottom navigation safe area (Android button nav)
- [ ] Pull-to-refresh works
- [ ] Pagination works (10+ items)
- [ ] Offline banner appears when disconnected
- [ ] Task/announcement archiving
- [ ] Grade calculator accuracy

### Testing on Devices

**Android:**

```bash
# Install via ADB
adb install path/to/app.apk

# View logs
adb logcat | grep ReactNative
```

**iOS (macOS only):**

```bash
# Install on simulator
npx expo run:ios
```

---

## 🐛 Troubleshooting

### Common Issues

**1. "Firebase not initialized"**

- Ensure `.env` file exists with all Firebase credentials
- Restart Expo dev server: `npx expo start --clear`

**2. "Build failed on EAS"**

- Check EAS Build logs at https://expo.dev/accounts/gauciv/projects/triji-app/builds
- Verify `eas.json` configuration is valid
- Ensure `expo-build-properties` is installed

**3. "Notifications not working"**

- Notifications only work when app is open or in background (not fully closed)
- Check Android notification permissions are granted
- For closed-app notifications, Firebase Cloud Functions backend is required (future)

**4. "App crashes after ProGuard build"**

- Check `android/app/proguard-rules.pro` has correct rules
- Verify all Firebase and Expo modules are kept
- Review crash logs from device

**5. "OTA updates not received"**

- Ensure app was built with `channel: "production"` in `eas.json`
- Check updates are published to correct branch: `eas update:list`
- Users on v1.0.0 or earlier may not have channel configuration (rebuild required)

### Debug Commands

```bash
# Clear Expo cache
npx expo start --clear

# Reset EAS credentials
eas credentials

# View EAS builds
eas build:list

# View OTA updates
eas update:list

# Check for errors
npm run lint

# Validate Firebase config
firebase projects:list
```

---

## 🚀 Performance Optimization

### Current Optimizations

✅ **ProGuard** - Code shrinking and obfuscation (60% size reduction)  
✅ **Resource Shrinking** - Removes unused resources  
✅ **Offline Persistence** - Firestore caching enabled  
✅ **Safe Area Insets** - Proper Android button navigation support  
✅ **Lazy Loading** - Components load on demand  
✅ **Image Optimization** - Compressed assets

### Performance Targets

- **App Size:** 30-50MB (optimized APK)
- **Initial Load:** < 3 seconds
- **Screen Transitions:** < 300ms
- **Data Fetch:** < 2 seconds (with cache)
- **OTA Update Size:** < 5MB (typical JS changes)

---

## 🛣️ Roadmap

### Current Version (v1.0.1)

- ✅ Core features: Tasks, Announcements, Freedom Wall
- ✅ Real-time synchronization
- ✅ Push notifications (local)
- ✅ Offline support
- ✅ ProGuard optimization
- ✅ EAS Update configured

### Planned Features

**v1.1.0 - Backend Enhancement**

- [ ] Firebase Cloud Functions for closed-app notifications
- [ ] Scheduled announcement expiration
- [ ] Automated task reminders
- [ ] Content moderation for Freedom Wall

**v1.2.0 - Social Features**

- [ ] Comment system for Freedom Wall posts
- [ ] User reputation/karma system
- [ ] Direct messaging between users
- [ ] Group study rooms

**v1.3.0 - Productivity**

- [ ] File attachments for tasks/announcements
- [ ] Task completion tracking and progress
- [ ] Calendar view for deadlines
- [ ] Study timer (Pomodoro)

**v2.0.0 - Platform Expansion**

- [ ] iOS release on App Store
- [ ] Web version (responsive)
- [ ] Admin dashboard (web)
- [ ] Analytics and usage insights

---

## 🤝 Contributing

This project is currently private for educational use. Contributions are not accepted at this time, but feedback and suggestions are welcome!

### Development Guidelines

If you're working on this project:

1. **Follow naming conventions:**
   - Screens: `PascalCase` + `Screen` suffix
   - Components: `PascalCase`
   - Utils: `camelCase`

2. **Always unsubscribe from Firestore listeners:**

   ```javascript
   useEffect(() => {
     const unsubscribe = onSnapshot(query, callback);
     return () => unsubscribe();
   }, []);
   ```

3. **Check auth state before queries:**

   ```javascript
   if (!auth.currentUser) {
     return;
   }
   ```

4. **Handle date formats gracefully:**

   ```javascript
   const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
   ```

5. **For OTA updates:** Only modify `.js` files
6. **For native changes:** Bump version in `app.json`, rebuild APK

---

## 📄 License

This project is **private** and intended for educational use only. All rights reserved.

---

## 📞 Contact

**Developer:** gauciv  
**GitHub:** [@gauciv](https://github.com/gauciv)  
**Project Link:** [https://github.com/gauciv/triji-app](https://github.com/gauciv/triji-app)

---

## 🙏 Acknowledgments

- **Expo Team** - For the amazing development platform
- **Firebase** - For real-time backend infrastructure
- **React Navigation** - For seamless navigation
- **Inter Font** - For clean, modern typography
- **Expo Community** - For helpful documentation and support

---

## 📊 Project Stats

```
Lines of Code:        8,000+
Screens:              19
Components:           7
Dependencies:         24
Build Time:           10-15 minutes
OTA Update Time:      30 seconds
Performance:          < 3s load, < 300ms transitions
```

---

<div align="center">

**Built with ❤️ using React Native and Firebase**

[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020.svg)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-11.10.0-orange.svg)](https://firebase.google.com/)

</div>
