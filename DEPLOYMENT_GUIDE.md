# Triji App - Deployment Guide

## Pre-Deployment Checklist

### ✅ Critical Fixes Needed:
1. **Fix AccountSettingsScreen.js** - Remove duplicate `handleChangePassword` function
2. **Fix EditProfileScreen.js** - Ensure all async operations are in async functions
3. **Remove expo-device dependency** - Already removed from notifications.js
4. **Test offline functionality** - Verify OfflineBanner works
5. **Test ErrorBoundary** - Ensure crash recovery works

### 🔧 Configuration Files:
- ✅ `eas.json` - Build configuration for EAS Build
- ✅ `app.json` - Updated with proper identifiers and versioning
- ✅ `.easignore` - Files to exclude from build

---

## Building APK for Android

### **Method 1: EAS Build (Recommended)**

1. **Install EAS CLI:**
```bash
npm install -g eas-cli
```

2. **Login to Expo:**
```bash
eas login
```

3. **Configure the project:**
```bash
eas build:configure
```

4. **Build APK:**
```bash
npm run build:android
# or
eas build --platform android --profile preview
```

5. **Download APK:**
- Build completes in ~10-20 minutes
- Download link provided in terminal
- Share APK file with users via Google Drive, Dropbox, or direct download

### **Method 2: Local Build (Alternative)**

```bash
expo build:android -t apk
```

---

## Building IPA for iOS

### **Requirements:**
- Apple Developer Account ($99/year)
- Provisioning profiles
- Signing certificates

### **Steps:**

1. **Setup Apple Developer:**
- Go to developer.apple.com
- Enroll in Apple Developer Program
- Create App ID: `com.triji.app`

2. **Build IPA:**
```bash
npm run build:ios
# or
eas build --platform ios --profile preview
```

3. **Distribution Options:**

**Option A: TestFlight (Recommended)**
- Upload to App Store Connect
- Users install via TestFlight app
- No need for UDID registration
- Up to 10,000 testers

**Option B: Ad-Hoc Distribution**
- Register device UDIDs
- Build includes specific devices only
- Users install via direct download
- Limited to 100 devices per year

**Option C: Enterprise Distribution**
- Requires Enterprise Developer Account ($299/year)
- No device limit
- In-house distribution only

---

## Sharing APK/IPA with Users

### **For Android APK:**

1. **Upload to cloud storage:**
```bash
# Upload APK to:
- Google Drive
- Dropbox
- Firebase App Distribution
- Direct download link on your server
```

2. **User Installation:**
```
1. Download APK to Android device
2. Open file
3. Allow "Install from Unknown Sources" if prompted
4. Tap Install
5. Open app
```

### **For iOS IPA:**

1. **TestFlight (Easiest):**
```
1. Upload IPA to App Store Connect
2. Add testers via email
3. Users install TestFlight from App Store
4. Testers receive invitation
5. Install app via TestFlight
```

2. **Ad-Hoc (Direct):**
```
1. Collect device UDIDs from users
2. Register devices in Apple Developer portal
3. Build IPA with registered devices
4. Distribute via:
   - Apple Configurator
   - Third-party services (Diawi, TestApp.io)
   - Install manifest (itms-services://)
```

---

## Firebase Configuration

### **Before Building:**

1. **Android:**
```bash
# Download google-services.json from Firebase Console
# Place in: android/app/google-services.json
```

2. **iOS:**
```bash
# Download GoogleService-Info.plist from Firebase Console
# Place in: ios/GoogleService-Info.plist
```

3. **Update Firebase Rules:**
```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /tasks/{taskId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    match /announcements/{announcementId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    match /freedom_wall/{postId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

---

## Production Checklist

### **Security:**
- [ ] Remove console.log statements (or use production logger)
- [ ] Secure Firebase API keys (use environment variables)
- [ ] Enable Firebase App Check
- [ ] Review Firestore security rules
- [ ] Enable rate limiting on Firebase Auth

### **Performance:**
- [ ] Test on slow networks (throttle to 3G)
- [ ] Verify offline mode works correctly
- [ ] Check app size (should be < 50MB)
- [ ] Test on older devices (Android 8+, iOS 12+)

### **User Experience:**
- [ ] Test all screens for errors
- [ ] Verify push notifications work (on real device)
- [ ] Test ErrorBoundary catches crashes
- [ ] Verify OfflineBanner shows correctly
- [ ] Test all forms and validation

### **Assets:**
- [ ] Add app icon (512x512 PNG)
- [ ] Add splash screen (1242x2688 PNG)
- [ ] Add adaptive icon for Android
- [ ] Add favicon for web

---

## Build Commands Quick Reference

```bash
# Development build (for testing)
eas build --platform android --profile development

# Preview build (APK for distribution)
eas build --platform android --profile preview

# Production build (for stores)
eas build --platform android --profile production

# Build both platforms
eas build --platform all --profile preview

# Check build status
eas build:list

# Download build
eas build:download --platform android
```

---

## Troubleshooting

### **Build fails with "expo-device not found":**
```bash
npm uninstall expo-device
# Already removed from notifications.js
```

### **Build fails with Firebase errors:**
```bash
# Verify firebase config files are in correct location
# Check Firebase project is active
# Verify API keys are correct
```

### **APK won't install on device:**
```bash
# Check Android version (minimum 8.0)
# Enable "Install from Unknown Sources"
# Verify APK isn't corrupted
```

### **Push notifications don't work:**
```bash
# Development builds required for push notifications
# Expo Go doesn't support push in SDK 53+
# Build with: eas build --profile development
```

---

## Distribution Platforms

### **Firebase App Distribution (Recommended):**
- Free
- Easy to use
- Email invitations
- Auto-updates
- Analytics

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Upload APK
firebase appdistribution:distribute app-release.apk \
  --app FIREBASE_APP_ID \
  --groups testers \
  --release-notes "Initial release"
```

### **Alternatives:**
- **TestApp.io** - iOS/Android distribution
- **Diawi** - Simple file hosting
- **HockeyApp** - Microsoft's solution
- **Installr** - Team distribution

---

## Version Management

```json
// app.json
{
  "expo": {
    "version": "1.0.0",  // User-facing version
    "android": {
      "versionCode": 1    // Increment for each build
    },
    "ios": {
      "buildNumber": "1.0.0"  // Increment for each build
    }
  }
}
```

**Versioning Rules:**
- Increment `versionCode` for every Android build
- Increment `buildNumber` for every iOS build
- Update `version` for user-facing releases
- Follow semantic versioning: MAJOR.MINOR.PATCH

---

## Next Steps

1. **Fix compilation errors**
2. **Test thoroughly on physical devices**
3. **Run: `npm run build:android`**
4. **Download APK and test installation**
5. **Share with beta testers**
6. **Collect feedback**
7. **Iterate and improve**

---

## Support

For build issues:
- EAS Build Docs: https://docs.expo.dev/build/introduction/
- Firebase Docs: https://firebase.google.com/docs
- Expo Forums: https://forums.expo.dev/

For distribution:
- Firebase App Distribution: https://firebase.google.com/docs/app-distribution
- TestFlight: https://developer.apple.com/testflight/
