# Semantic Versioning & Automated Release Guide

This project uses **semantic-release** for automated versioning, changelog generation, and deployments following the [Semantic Versioning](https://semver.org/) specification and [Conventional Commits](https://www.conventionalcommits.org/) standard.

---

## 📋 Table of Contents

1. [How It Works](#how-it-works)
2. [Commit Message Format](#commit-message-format)
3. [Version Bump Rules](#version-bump-rules)
4. [Deployment Strategy](#deployment-strategy)
5. [Examples](#examples)
6. [Manual Release](#manual-release)
7. [Troubleshooting](#troubleshooting)

---

## 🔄 How It Works

When you push commits to the `main` branch:

1. **GitHub Actions** workflow triggers
2. **Conventional Commits** format is validated
3. **semantic-release** analyzes commit messages
4. **Version** is determined based on commit types
5. **CHANGELOG.md** is automatically updated
6. **app.json** and **package.json** versions are synced
7. **Git tag** is created
8. **GitHub Release** is published
9. **Deployment** is triggered:
   - **PATCH/MINOR**: EAS Update (OTA) - users get update automatically
   - **MAJOR**: EAS Build (APK) - users must reinstall

---

## 📝 Commit Message Format

All commits **must** follow the Conventional Commits specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Commit Types

| Type       | Description                           | Version Bump | Deployment     |
|------------|---------------------------------------|--------------|----------------|
| `feat`     | New feature                           | MINOR (0.x.0)| EAS Update     |
| `fix`      | Bug fix                               | PATCH (0.0.x)| EAS Update     |
| `perf`     | Performance improvement               | PATCH (0.0.x)| EAS Update     |
| `revert`   | Revert previous commit                | PATCH (0.0.x)| EAS Update     |
| `docs`     | Documentation only                    | None         | None           |
| `style`    | Code style (formatting, whitespace)   | None         | None           |
| `refactor` | Code refactoring (no behavior change) | None         | None           |
| `test`     | Adding/updating tests                 | None         | None           |
| `chore`    | Maintenance tasks                     | None         | None           |
| `build`    | Build system changes                  | None         | None           |
| `ci`       | CI/CD changes                         | None         | None           |

### Breaking Changes

Add `BREAKING CHANGE:` in the footer or append `!` after type to trigger a **MAJOR** version bump:

```
feat!: migrate to new Firebase API

BREAKING CHANGE: Users must update Firebase SDK to v11+
```

This triggers:
- **MAJOR version bump** (x.0.0)
- **EAS Build** (full APK rebuild)
- GitHub Release marked as breaking change

---

## 🔢 Version Bump Rules

### PATCH (0.0.x) - Bug Fixes & Improvements
**Triggers:** `fix:`, `perf:`, `revert:`

**Examples:**
```bash
fix: resolve login crash on Android
fix(auth): handle expired tokens correctly
perf: optimize task list rendering
revert: revert "feat: add new feature"
```

**Result:**
- Version: `1.0.0` → `1.0.1`
- Deployment: **EAS Update (OTA)**
- Users receive update automatically

### MINOR (0.x.0) - New Features
**Triggers:** `feat:`

**Examples:**
```bash
feat: add dark mode toggle
feat(dashboard): implement unified activity feed
feat(tasks): add task completion tracking
```

**Result:**
- Version: `1.0.0` → `1.1.0`
- Deployment: **EAS Update (OTA)**
- Users receive update automatically

### MAJOR (x.0.0) - Breaking Changes
**Triggers:** `BREAKING CHANGE:` footer or `!` after type

**Examples:**
```bash
feat!: migrate to new authentication system

BREAKING CHANGE: All users must re-authenticate
```

```bash
refactor!: change task data structure

BREAKING CHANGE: Requires full app reinstall
```

**Result:**
- Version: `1.0.0` → `2.0.0`
- Deployment: **EAS Build (APK)**
- Users must manually reinstall

---

## 🚀 Deployment Strategy

### Automatic Deployment (via semantic-release)

| Release Type | Version Change | Action              | User Impact               |
|--------------|----------------|---------------------|---------------------------|
| **PATCH**    | 1.0.0 → 1.0.1  | EAS Update (OTA)    | Auto-update (~5 min)      |
| **MINOR**    | 1.0.0 → 1.1.0  | EAS Update (OTA)    | Auto-update (~5 min)      |
| **MAJOR**    | 1.0.0 → 2.0.0  | EAS Build (APK)     | Manual reinstall required |

### What Requires a MAJOR Release (APK Rebuild)?

Use `BREAKING CHANGE` for:

- ✅ Adding/removing native dependencies
- ✅ Changing `app.json` permissions, icons, splash screen
- ✅ Modifying ProGuard rules
- ✅ Updating Expo SDK version
- ✅ Changes to Android/iOS native code
- ✅ Database schema changes requiring migration

### What Can Use MINOR/PATCH (OTA Update)?

- ✅ JavaScript code changes
- ✅ UI layout and styling updates
- ✅ New screens/components (pure JS)
- ✅ Bug fixes in existing features
- ✅ Performance optimizations
- ✅ Text/copy changes

---

## 📚 Examples

### Example 1: Bug Fix (Patch)

```bash
git add .
git commit -m "fix: resolve notification crash on Android 11"
git push origin main
```

**Result:**
```
✅ Version bumped: 1.0.5 → 1.0.6
✅ CHANGELOG updated
✅ Git tag created: v1.0.6
✅ GitHub Release published
✅ EAS Update deployed (OTA)
```

### Example 2: New Feature (Minor)

```bash
git add .
git commit -m "feat: add grade calculator feature"
git push origin main
```

**Result:**
```
✅ Version bumped: 1.0.6 → 1.1.0
✅ CHANGELOG updated
✅ Git tag created: v1.1.0
✅ GitHub Release published
✅ EAS Update deployed (OTA)
```

### Example 3: Breaking Change (Major)

```bash
git add .
git commit -m "feat!: migrate to Firebase v12

BREAKING CHANGE: Requires Firebase SDK v12+. Users must reinstall the app."
git push origin main
```

**Result:**
```
✅ Version bumped: 1.1.0 → 2.0.0
✅ CHANGELOG updated
✅ Git tag created: v2.0.0
✅ GitHub Release published
✅ EAS Build triggered (APK)
⚠️  Users must download and install new APK
```

### Example 4: Multiple Changes

```bash
# Feature 1
git add src/screens/NewScreen.js
git commit -m "feat: add profile customization screen"

# Bug fix
git add src/utils/notifications.js
git commit -m "fix: handle null notification tokens"

# Push together
git push origin main
```

**Result:**
```
✅ Version bumped: 1.1.0 → 1.2.0 (highest: minor)
✅ CHANGELOG includes both commits
✅ EAS Update deployed
```

### Example 5: Documentation (No Release)

```bash
git add README.md
git commit -m "docs: update installation instructions"
git push origin main
```

**Result:**
```
ℹ️  No version bump
ℹ️  No release created
✅ Changes pushed to main
```

---

## 🛠️ Manual Release

If you need to trigger a release manually (bypassing CI):

```bash
# Install dependencies
npm ci

# Run semantic-release locally
npm run semantic-release
```

**Prerequisites:**
- `GITHUB_TOKEN` environment variable set
- `EXPO_TOKEN` environment variable set
- On `main` branch
- No uncommitted changes

---

## 🔍 Commit Message Validation

### Valid Commits ✅

```bash
feat: add new feature
fix: resolve bug
feat(auth): add social login
fix(ui): correct button alignment
perf: optimize task loading
docs: update README
chore: update dependencies
feat!: breaking change
```

### Invalid Commits ❌

```bash
# Missing type
"add new feature"

# Invalid type
added: new feature

# No colon
feat add feature

# No description
feat:

# Wrong case
Feat: new feature

# Description starts with uppercase (should be lowercase)
feat: Add new feature
```

### Validation in CI

The GitHub Actions workflow automatically validates commit messages. If validation fails:

```
❌ Commit does not follow Conventional Commits format
Expected format: <type>(<scope>): <description>
```

---

## 🧪 Testing Before Push

### Check Commit Message Locally

```bash
# Validate last commit
npx commitlint --from HEAD~1 --to HEAD --verbose

# Validate commit message from string
echo "feat: add new feature" | npx commitlint
```

### Dry Run semantic-release

```bash
# See what would happen without making changes
npm run semantic-release -- --dry-run
```

---

## 🐛 Troubleshooting

### Issue: "No release necessary"

**Cause:** No commits with release triggers (`feat`, `fix`, `perf`, `revert`, `BREAKING CHANGE`)

**Solution:** Ensure at least one commit has a type that triggers a release

### Issue: Version not updated in app.json

**Cause:** `scripts/sync-version.js` failed

**Solution:**
```bash
# Manually sync version
npm run version:sync 1.2.3
```

### Issue: EAS Update/Build failed

**Cause:** Missing `EXPO_TOKEN` in GitHub secrets

**Solution:**
1. Go to https://expo.dev/accounts/gauciv/settings/access-tokens
2. Create new token
3. Add to GitHub: Settings → Secrets → Actions → New secret
4. Name: `EXPO_TOKEN`

### Issue: Duplicate releases

**Cause:** Pushing multiple commits rapidly

**Solution:** semantic-release handles this automatically, but you can:
- Squash commits before pushing
- Wait for CI to complete before pushing again

### Issue: Wrong version bump

**Cause:** Incorrect commit message format

**Solution:**
- Review commit message guidelines above
- Use `git commit --amend` to fix last commit
- Force push if needed: `git push --force-with-lease`

---

## 📊 Release History

View all releases:
- **GitHub:** https://github.com/gauciv/triji-app/releases
- **CHANGELOG:** [CHANGELOG.md](../CHANGELOG.md)
- **Git tags:** `git tag -l`

---

## 🔗 References

- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [semantic-release Documentation](https://semantic-release.gitbook.io/)
- [EAS Update Documentation](https://docs.expo.dev/eas-update/introduction/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

---

## 🎯 Best Practices

1. **Write clear commit messages** - They become your changelog
2. **One logical change per commit** - Makes versioning accurate
3. **Use scopes** - Helps organize changelog: `feat(auth):`, `fix(ui):`
4. **Breaking changes are serious** - Only use when users must take action
5. **Test locally first** - Use `--dry-run` to preview releases
6. **Keep commits atomic** - Each commit should be deployable
7. **Document breaking changes** - Explain migration steps in commit body

---

## ⚙️ Configuration Files

- `.releaserc.js` - semantic-release configuration
- `.commitlintrc.js` - Commit message validation rules
- `.github/workflows/release.yml` - GitHub Actions CI/CD
- `scripts/sync-version.js` - Sync versions across files
- `scripts/deploy.js` - Deployment logic (EAS Update/Build)

---

**Last Updated:** November 14, 2025
