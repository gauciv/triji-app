# Changelog

All notable changes to Triji will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- semantic-release-insert-here -->

## [1.1.1](https://github.com/gauciv/triji-app/compare/v1.1.0...v1.1.1) (2025-11-14)


### 🐛 Bug Fixes

* reorder semantic-release plugins to ensure EAS deployment triggers ([4958a3e](https://github.com/gauciv/triji-app/commit/4958a3e3d0b65ee6903b97bd9cd8d83c93f91729))

## [1.1.0](https://github.com/gauciv/triji-app/compare/v1.0.0...v1.1.0) (2025-11-14)


### ✨ Features

* polish notification messages ([0738036](https://github.com/gauciv/triji-app/commit/07380362f52ddc2a7959f6927dac5e662baad3d3))
* **ui:** create recent updates function for collective updates ([739573f](https://github.com/gauciv/triji-app/commit/739573f54ed0314f943c9e6e6d20c8d21ff6d7d8))
* use safe area insets for android with bottom bar navigations ([abbba4e](https://github.com/gauciv/triji-app/commit/abbba4e3b74d55a07ddde89ce1c8fba9cb5aca2f))
* utilize firebase persistence instead of manual user session check ([4f2babb](https://github.com/gauciv/triji-app/commit/4f2babba58d6b149adf59c56ca5019fd2559b44b))


### 🐛 Bug Fixes

* resolve activity card not mapping to full view ([6ffd2cf](https://github.com/gauciv/triji-app/commit/6ffd2cf8e6e33ed1e76ef91051c621c042d29688))
* resolve duplicate config error ([7859f2d](https://github.com/gauciv/triji-app/commit/7859f2d2930584e88df09a0f72bd07d3f43e63a1))
* resolve logout issue on app exit ([195cccc](https://github.com/gauciv/triji-app/commit/195cccc7fd0c6d97ba361852c1319ada134e7ba0))
* resolve responsiveness issue on task cards ([b3fcb32](https://github.com/gauciv/triji-app/commit/b3fcb326a491c6b8491a45fb13d8cd9ca76fc621))
* resolve task full detail responsiveness ([91385c2](https://github.com/gauciv/triji-app/commit/91385c2e72418c50ac10ace17ea99c885690287b))


### 📚 Documentation

* create CONTEXT file ([cae11e8](https://github.com/gauciv/triji-app/commit/cae11e8e4630e2786db990df7e529c44d1098eb8))
* create versioning strategy and guide ([20e1060](https://github.com/gauciv/triji-app/commit/20e1060994ccddfea3f07055a280974e3821721a))
* setup README file ([1277af4](https://github.com/gauciv/triji-app/commit/1277af4569c8b0e0472648c276d926a0d265eca9))


### 👷 CI/CD

* configure workflow to bypass branch protection for releases ([8aae29d](https://github.com/gauciv/triji-app/commit/8aae29d80c2edffe6f3c0841399ca1a3dec86209))
* test aupdate and build automation ([0da5af1](https://github.com/gauciv/triji-app/commit/0da5af1ba6a8985528d60d805fe1d54204ddd12d))
* update Node.js version to 20 for semantic-release compatibility ([5ec9ce2](https://github.com/gauciv/triji-app/commit/5ec9ce204aacd29a4179f6aeaa249b2edca23fb7))

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
