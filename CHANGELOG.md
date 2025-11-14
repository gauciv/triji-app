# Changelog

All notable changes to Triji will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-11-14

### 🐛 Bug Fixes
- Add ProGuard optimization to reduce APK size by 60%
- Fix safe area insets for Android button navigation
- Resolve task field compatibility between admin and user formats
- Fix date parsing for Firestore Timestamps

### ✨ Features
- Implement unified dashboard feed showing recent updates
- Add enhanced notifications with emojis and type-specific channels
- Configure EAS Update production channel for OTA updates

### ⚡ Performance Improvements
- Enable resource shrinking in production builds
- Optimize asset bundling patterns
- Implement text truncation for responsive card layouts

### 📚 Documentation
- Add comprehensive CONTEXT.md for AI agents
- Create SOCIAL_MEDIA_SPECS.md for marketing content
- Add detailed README.md with setup instructions

## [1.0.0] - 2025-11-13

### ✨ Features
- Initial release of Triji mobile app
- Task management with deadline tracking
- Announcement system with type categorization
- Freedom Wall for anonymous student posts
- Real-time Firestore synchronization
- Firebase Authentication (email/password)
- Offline support with data persistence
- Local push notifications
- Grade calculator utility
- User profile management

### 🎨 Design
- Dark mode theme with neon green accents
- Bottom tab navigation with safe area support
- Responsive UI for various screen sizes
- Inter font family for clean typography

### 🔐 Security
- Firestore security rules
- ProGuard code obfuscation
- Environment variable protection
