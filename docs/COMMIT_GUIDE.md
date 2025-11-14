# Quick Reference: Commits & Releases

> **Note:** Commits that don't follow the conventional format (no `feat:`, `fix:`, etc.) will not trigger a release, even if CI passes successfully.

## 🚀 Common Commit Examples

### Bug Fixes (Patch: 1.0.0 → 1.0.1)
```bash
git commit -m "fix: resolve notification crash"
git commit -m "fix(auth): handle expired tokens"
git commit -m "fix(ui): correct button alignment"
```
**Result:** EAS Update (OTA) - users auto-update

### New Features (Minor: 1.0.0 → 1.1.0)
```bash
git commit -m "feat: add dark mode toggle"
git commit -m "feat(dashboard): show activity stats"
git commit -m "feat(tasks): add completion tracking"
```
**Result:** EAS Update (OTA) - users auto-update

### Breaking Changes (Major: 1.0.0 → 2.0.0)
```bash
git commit -m "feat!: migrate to new API

BREAKING CHANGE: Users must reinstall app"
```
**Result:** EAS Build (APK) - users must reinstall

### No Release
```bash
git commit -m "docs: update README"
git commit -m "chore: update dependencies"
git commit -m "style: format code"
git commit -m "test: add unit tests"
```
**Result:** No version bump, no deployment

---

## 📋 Commit Format Cheatsheet

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Required Types
- `feat` - New feature → MINOR bump
- `fix` - Bug fix → PATCH bump
- `perf` - Performance → PATCH bump
- `docs` - Documentation → No release
- `style` - Formatting → No release
- `refactor` - Code refactor → No release
- `test` - Tests → No release
- `chore` - Maintenance → No release
- `build` - Build system → No release
- `ci` - CI/CD → No release
- `revert` - Revert commit → PATCH bump

### Breaking Change Markers
```bash
# Method 1: Add ! after type
feat!: breaking change description

# Method 2: Add footer
feat: some change

BREAKING CHANGE: explanation of breaking change
```
**Result:** MAJOR version bump + EAS Build

---

## ⚡ Quick Commands

```bash
# Check if commit message is valid
echo "feat: add feature" | npx commitlint

# Preview what release would be created (dry run)
npm run semantic-release -- --dry-run

# Manually sync version to app.json
npm run version:sync 1.2.3

# View release history
git tag -l
```

---

## 🎯 Decision Tree

```
Do you have uncommitted changes?
├─ Yes → git add . && git commit -m "<type>: <description>"
└─ No → Continue

Is this a code/feature change?
├─ Yes → Does it require app reinstall?
│   ├─ Yes → Use "BREAKING CHANGE" → Major (2.0.0) → EAS Build
│   └─ No → Is it a new feature?
│       ├─ Yes → Use "feat:" → Minor (1.1.0) → EAS Update
│       └─ No → Use "fix:" → Patch (1.0.1) → EAS Update
└─ No (docs/chore) → Use "docs:" or "chore:" → No release

git push origin main → CI runs automatically
```

---

## 🔴 Common Mistakes to Avoid

### ❌ Wrong
```bash
"Add new feature"                    # No type
"added: new feature"                 # Invalid type
"feat add feature"                   # Missing colon
"feat:"                              # No description
"Feat: add feature"                  # Wrong case
"feat: Add feature"                  # Description starts with capital
```

### ✅ Correct
```bash
"feat: add new feature"
"fix: resolve login bug"
"feat(auth): implement social login"
"perf: optimize task rendering"
```

---

## 📊 When Will My Release Deploy?

| Commit Type | Version Bump | Deployment | Time to Users |
|-------------|--------------|------------|---------------|
| `fix:`      | Patch        | EAS Update | ~5 minutes    |
| `feat:`     | Minor        | EAS Update | ~5 minutes    |
| `feat!:`    | Major        | EAS Build  | Manual install|
| `docs:`     | None         | None       | N/A           |

---

## 🆘 Emergency Fixes

### Option 1: Hotfix with semantic-release
```bash
# Make urgent fix
git add .
git commit -m "fix: critical security patch"
git push origin main
# CI automatically deploys via EAS Update (~5 min)
```

### Option 2: Manual EAS Update
```bash
# Skip CI, deploy immediately
npm run update:production
# Live in ~30 seconds
```

### Option 3: Manual Build (Breaking)
```bash
# For critical native issues
npm run build:android:prod
# Wait for build, then distribute APK
```

---

## 📝 Full Documentation

See [VERSIONING.md](VERSIONING.md) for complete guide.
