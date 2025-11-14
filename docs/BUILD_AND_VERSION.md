# Build and Version Management Guide

## Understanding the Build-Release-Version Flow

### The Problem

When you push a commit, semantic-release runs and:

1. Analyzes your commit message
2. Bumps the version (e.g., 1.3.0 → 1.3.1)
3. Updates `package.json` and `app.json`
4. Creates a GitHub release
5. Triggers EAS Update (OTA) or EAS Build

However, if you manually trigger a build **before** semantic-release finishes, the APK will have the old version baked in.

### The Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ Commit pushed to main                                        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ GitHub Actions: semantic-release                             │
│ • Analyzes commit (feat/fix/breaking)                       │
│ • Bumps version in package.json & app.json                  │
│ • Creates GitHub release with tag                           │
│ • Runs deploy.js script                                     │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ Deploy Script (scripts/deploy.js)                           │
│                                                              │
│ If MINOR/PATCH:                                             │
│   → Runs: eas update --branch production (OTA)             │
│   → Users get update automatically (no reinstall)          │
│                                                              │
│ If MAJOR (breaking change):                                 │
│   → Runs: eas build --platform android --profile production │
│   → Users must download new APK                            │
└─────────────────────────────────────────────────────────────┘
```

### Version Mismatch Scenarios

#### ❌ Scenario 1: Manual Build Too Early

```bash
# You commit and push
git commit -m "fix: update channel config"
git push

# You immediately run build (before semantic-release finishes)
npx eas build --platform android --profile production

# Result: APK has v1.3.0, but semantic-release creates v1.3.1
# Problem: Version mismatch!
```

#### ✅ Scenario 2: Let CI/CD Handle It

```bash
# You commit and push
git commit -m "fix: update channel config"
git push

# Wait 2-3 minutes for semantic-release to finish
# Check GitHub Actions: https://github.com/gauciv/triji-app/actions

# semantic-release automatically triggers:
# - Minor/Patch: EAS Update (OTA)
# - Major: EAS Build (full rebuild)

# Result: Version always matches!
```

#### ✅ Scenario 3: Manual Build After Release

```bash
# You commit and push
git commit -m "fix: update channel config"
git push

# Wait for semantic-release to finish (check GitHub Actions)
# Pull the updated version
git pull

# Now build with the correct version
npx eas build --platform android --profile production

# Result: APK has correct version!
```

## Best Practices

### 1. **Always Pull Before Building Manually**

```bash
git pull  # Get the latest version from semantic-release
npx eas build --platform android --profile production
```

### 2. **Trust the CI/CD Pipeline**

For minor/patch releases (feat:, fix:), the CI/CD will automatically:

- Create a GitHub release
- Publish an OTA update
- Users get it within 5 minutes

For major releases (feat!:, BREAKING CHANGE), the CI/CD will:

- Create a GitHub release
- Trigger EAS Build
- APK will be available in EAS dashboard

### 3. **Check GitHub Actions Before Building**

Visit: https://github.com/gauciv/triji-app/actions

Wait for the "Release" workflow to complete (green checkmark).

### 4. **Use Release Branches for Urgent Fixes**

If you need to build immediately without waiting:

```bash
# Create a release branch
git checkout -b release/1.3.2

# Manually bump version
npm run version:sync 1.3.2
npm version 1.3.2 --no-git-tag-version

# Commit and build
git commit -am "chore: bump version to 1.3.2"
npx eas build --platform android --profile production

# Then merge back to main
git checkout main
git merge release/1.3.2
git push
```

## Dynamic Version Display

The app already reads version dynamically from `package.json`:

**SplashScreen.js:**

```javascript
import { version } from '../../package.json';
// Displays: v{version}
```

**AccountSettingsScreen.js:**

```javascript
import { version as appVersion } from '../../package.json';
// Displays: Current Version: v{appVersion}
// Fetches: Latest Release from GitHub API
```

This means:

- ✅ Code changes to version → OTA update → Users see new version
- ❌ APK built with old version → OTA update → Users still see old version (until rebuild)

## Fixing Version Mismatches

### If APK Shows Wrong Version

**Option 1: Bump and Rebuild**

```bash
# Manually bump to next version
npm run version:sync 1.3.3
npm version 1.3.3 --no-git-tag-version

# Commit as patch
git add package.json app.json package-lock.json
git commit -m "chore: bump version to 1.3.3"
git push

# Wait for CI/CD, or build manually after pull
git pull
npx eas build --platform android --profile production
```

**Option 2: Force Version Alignment**

```bash
# Reset to match GitHub release
git pull
npm run version:sync $(git describe --tags --abbrev=0 | sed 's/v//')

# This syncs app.json to the latest tag
# Then rebuild
```

## Monitoring Versions

### Check Current Versions

```bash
# Local files
echo "package.json:" && jq -r '.version' package.json
echo "app.json:" && jq -r '.expo.version' app.json

# GitHub releases
gh release list

# Git tags
git tag -l | sort -V | tail -5
```

### Check EAS Builds

```bash
eas build:list --platform android --limit 5
```

### Check EAS Updates

```bash
eas update:list --branch production
```

## Troubleshooting

### "APK shows old version after OTA update"

**Cause:** Version is read from `package.json`, which is bundled in JavaScript. OTA updates JavaScript, but if the APK was built with old version, the bundled `package.json` has the old version.

**Solution:** Rebuild APK with new version, or bump to next version and rebuild.

### "GitHub shows v1.3.1 but my code shows v1.3.0"

**Cause:** semantic-release ran and created v1.3.1, but you haven't pulled the changes yet.

**Solution:** `git pull` to get the updated files.

### "I want to skip a version number"

**Solution:** Manually bump and commit:

```bash
npm run version:sync 1.4.0
npm version 1.4.0 --no-git-tag-version
git add package.json app.json package-lock.json
git commit -m "chore: bump version to 1.4.0"
git push
```

This will skip versions in between. semantic-release will respect the manual version and continue from there.

## Summary

- ✅ **Let semantic-release handle versioning automatically**
- ✅ **Pull before building manually**
- ✅ **Use OTA updates for minor/patch changes**
- ✅ **Rebuild APK only for major changes or version fixes**
- ✅ **Monitor GitHub Actions to know when semantic-release finishes**
- ❌ **Don't build immediately after pushing without pulling first**
- ❌ **Don't manually edit versions unless absolutely necessary**
