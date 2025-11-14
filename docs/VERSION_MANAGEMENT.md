# Version Management Guide

## Overview

Triji uses **Semantic Versioning** (SemVer) with automated releases via semantic-release. The version is automatically updated based on conventional commit messages.

---

## Version Format

We follow [Semantic Versioning 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH

Example: 1.2.0
```

- **MAJOR** (1.x.x): Breaking changes, requires new APK build
- **MINOR** (x.2.x): New features, backward compatible, OTA update possible
- **PATCH** (x.x.0): Bug fixes, backward compatible, OTA update possible

---

## How Versioning Works

### 1. Automatic Version Bumping

The version is automatically bumped based on your commit message type:

| Commit Type             | Version Bump | Example       | Update Method      |
| ----------------------- | ------------ | ------------- | ------------------ |
| `feat:`                 | **MINOR**    | 1.1.0 → 1.2.0 | OTA Update         |
| `fix:`                  | **PATCH**    | 1.1.0 → 1.1.1 | OTA Update         |
| `perf:`                 | **PATCH**    | 1.1.0 → 1.1.1 | OTA Update         |
| `BREAKING CHANGE`       | **MAJOR**    | 1.1.0 → 2.0.0 | New Build Required |
| `feat!:`                | **MAJOR**    | 1.1.0 → 2.0.0 | New Build Required |
| `docs:`, `chore:`, etc. | **NONE**     | No release    | -                  |

### 2. Files That Are Synced

When a new version is released, these files are automatically updated:

- ✅ `package.json` → `version` field
- ✅ `app.json` → `expo.version` field
- ✅ `app.json` → `expo.android.versionCode` (calculated from version)
- ✅ `app.json` → `expo.ios.buildNumber` field
- ✅ `CHANGELOG.md` → Automatically generated release notes
- ✅ GitHub → Creates a new release with tag

### 3. Android Version Code Calculation

The Android `versionCode` is automatically calculated from the semantic version:

```javascript
versionCode = MAJOR * 10000 + MINOR * 100 + PATCH

Examples:
1.2.0  → 10200
1.2.3  → 10203
2.0.0  → 20000
```

---

## Version Display

### Splash Screen (Loading Screen)

- Shows current app version from `package.json`
- Located at: `src/screens/SplashScreen.js`
- Format: `v1.2.0`

### Settings Screen

- Shows **Current Version** (from package.json)
- Shows **Latest Release** (fetched from GitHub API)
- Displays update button if newer version is available
- Located at: `src/screens/AccountSettingsScreen.js`

---

## CI/CD Workflow

### Automatic Release Process

When you push to `main` branch:

1. **CI Tests Run** (`.github/workflows/ci.yml`)
   - Linting
   - Unit tests
   - Build validation

2. **Release Workflow Triggers** (`.github/workflows/release.yml`)
   - Analyzes commit messages
   - Determines version bump type
   - Updates version in all files
   - Generates changelog
   - Creates GitHub release
   - Publishes EAS update (if OTA-compatible)

3. **Files Committed Back**
   - `package.json` with new version
   - `app.json` with new version
   - `CHANGELOG.md` with release notes
   - Commit message: `chore(release): X.Y.Z [skip ci]`

---

## Manual Version Management

### Checking Current Version

```bash
# In package.json
cat package.json | grep '"version"'

# In app.json
cat app.json | grep '"version"'

# Latest git tag
git describe --tags --abbrev=0
```

### Checking Latest GitHub Release

```bash
# Using curl
curl -s https://api.github.com/repos/gauciv/triji-app/releases/latest | grep '"tag_name"'

# Or visit
https://github.com/gauciv/triji-app/releases/latest
```

### Manual Sync (if needed)

If versions get out of sync, run:

```bash
npm run version:sync
```

This runs `scripts/sync-version.js` which updates `app.json` to match `package.json`.

---

## Commit Message Guidelines

To trigger a release, use conventional commit format:

### Feature (Minor Version Bump)

```bash
git commit -m "feat: add new announcement filter"
git commit -m "feat(dashboard): show active tasks count"
```

### Bug Fix (Patch Version Bump)

```bash
git commit -m "fix: resolve login issue"
git commit -m "fix(tasks): correct due date calculation"
```

### Breaking Change (Major Version Bump)

```bash
git commit -m "feat!: redesign authentication flow"

# Or with body
git commit -m "feat: new API integration

BREAKING CHANGE: Updated Firebase SDK to v11, requires new build"
```

### No Release

```bash
git commit -m "docs: update README"
git commit -m "chore: update dependencies"
git commit -m "style: format code"
git commit -m "test: add unit tests"
git commit -m "refactor: improve code structure"
```

---

## Release Types

### OTA Update (Over-The-Air)

✅ **When to use:**

- JavaScript/TypeScript changes only
- UI updates
- Bug fixes
- New features that don't require native changes

✅ **Commit types:**

- `feat:` → Minor version bump
- `fix:` → Patch version bump
- `perf:` → Patch version bump

✅ **Process:**

1. Commit changes with conventional message
2. Push to main
3. CI/CD automatically publishes EAS update
4. Users get update on next app launch (no reinstall needed)

### New Build Required

⚠️ **When to use:**

- Native module changes
- Expo SDK version upgrade
- Android/iOS permission changes
- Gradle/Xcode configuration changes
- Breaking changes

⚠️ **Commit types:**

- `feat!:` → Major version bump
- Commit body with `BREAKING CHANGE:`

⚠️ **Process:**

1. Commit changes with breaking change message
2. Push to main
3. CI/CD creates new GitHub release
4. Manually run: `npm run build:android:prod`
5. Distribute new APK to users

---

## Troubleshooting

### Version Mismatch

**Problem:** App shows old version (1.1.2) but GitHub release is newer (1.2.0)

**Cause:** You installed an APK that was built before the version bump

**Solution:**

1. Pull latest code: `git pull`
2. Check versions are synced:
   ```bash
   cat package.json | grep version
   cat app.json | grep version
   ```
3. If not synced, run: `npm run version:sync`
4. Publish OTA update: `npm run update:production`
5. Close and reopen app on device

**OR** rebuild APK with latest version:

```bash
npm run build:android:prod
```

### Semantic Release Not Triggering

**Problem:** Pushed commits but no release was created

**Causes & Solutions:**

1. **Commit message doesn't follow convention**
   - ❌ `git commit -m "updated dashboard"`
   - ✅ `git commit -m "feat: update dashboard layout"`

2. **Commit type doesn't trigger release**
   - `docs:`, `chore:`, `test:`, `refactor:` → No release
   - Use `feat:` or `fix:` instead

3. **CI/CD workflow failed**
   - Check: https://github.com/gauciv/triji-app/actions
   - Look for errors in "Release" workflow

4. **Missing secrets**
   - Check GitHub secrets are configured:
     - `GH_TOKEN` or `GITHUB_TOKEN`
     - `EXPO_TOKEN`

### Version Not Updating in App

**Problem:** Settings screen shows outdated version

**Solution:**

1. Pull latest changes
2. Clear Metro bundler cache:
   ```bash
   npx expo start --clear
   ```
3. Rebuild app if needed

---

## Best Practices

### 1. Always Use Conventional Commits

```bash
# Good
git commit -m "feat: add user profile editing"
git commit -m "fix: resolve notification crash"

# Bad
git commit -m "updates"
git commit -m "fixed stuff"
```

### 2. Group Related Changes

```bash
# Instead of multiple small commits
git commit -m "fix: button color"
git commit -m "fix: button size"

# Do one commit
git commit -m "fix: improve button styling"
```

### 3. Test Before Pushing

```bash
# Run tests locally
npm run test

# Run linter
npm run lint

# Check build
npm run validate
```

### 4. Check Release Notes

After a release, verify:

- GitHub release page shows correct version
- CHANGELOG.md is updated
- App can be updated via OTA or requires rebuild

---

## Scripts

### Version-Related Scripts

```json
{
  "version:sync": "node scripts/sync-version.js",
  "update:preview": "eas update --branch preview",
  "update:production": "eas update --branch production",
  "build:android:prod": "eas build --platform android --profile production",
  "semantic-release": "semantic-release"
}
```

### Usage

```bash
# Sync version to app.json
npm run version:sync

# Publish OTA update to production
npm run update:production

# Build new production APK
npm run build:android:prod
```

---

## Version History

View all releases:

- **GitHub**: https://github.com/gauciv/triji-app/releases
- **Changelog**: [CHANGELOG.md](../CHANGELOG.md)

Current version locations:

- Code: `package.json`, `app.json`
- Display: `SplashScreen.js`, `AccountSettingsScreen.js`
- Git: Tags (e.g., `v1.2.0`)

---

## Quick Reference

| Action                | Command                                      |
| --------------------- | -------------------------------------------- |
| Check current version | `cat package.json \| grep version`           |
| Check latest release  | `git describe --tags --abbrev=0`             |
| Sync versions         | `npm run version:sync`                       |
| Publish OTA update    | `npm run update:production`                  |
| Build new APK         | `npm run build:android:prod`                 |
| View releases         | https://github.com/gauciv/triji-app/releases |

---

## Support

For issues related to versioning:

1. Check this documentation
2. Review [TROUBLESHOOTING_QA.md](./TROUBLESHOOTING_QA.md)
3. Check GitHub Actions logs
4. Review semantic-release configuration in `.releaserc.js`
