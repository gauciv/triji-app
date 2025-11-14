# Troubleshooting Quality Gates

## Common Issues & Fixes

### 1. ESLint Errors

If you see many ESLint errors after running `npm run validate`:

**Quick Fix - Auto-fix most issues:**

```bash
npm run lint:fix
```

**Common errors and solutions:**

**"React is not defined"**

- Already handled - ignore this error

**"Unused variable"**

- Prefix with underscore: `const _unused = value`
- Or remove it if not needed

**"Missing dependencies in useEffect"**

- Currently disabled - no action needed

### 2. Test Failures

If tests are failing:

**Run tests to see details:**

```bash
npm test
```

**Clear Jest cache:**

```bash
npm test -- --clearCache
npm test
```

**Skip tests temporarily:**

```bash
npm run test:ci  # Already configured to pass with no tests
```

### 3. Formatting Issues

**Auto-fix all formatting:**

```bash
npm run format
```

**Check what needs formatting:**

```bash
npm run format:check
```

### 4. Pre-commit Hook Fails

**Bypass for emergency commits:**

```bash
git commit --no-verify -m "emergency fix"
```

**Fix the hook:**

```bash
npm run prepare
chmod +x .husky/pre-commit
```

### 5. TypeScript Errors

Currently non-blocking. If you see errors:

```bash
npm run type-check
```

These are warnings only and won't block commits.

---

## Quick Commands

### Fix Everything

```bash
# Auto-fix lint issues
npm run lint:fix

# Auto-format code
npm run format

# Run tests
npm test

# Run all checks
npm run validate
```

### Selective Fixes

```bash
# Fix specific file
npx eslint src/components/MyComponent.js --fix

# Format specific file
npx prettier --write src/components/MyComponent.js
```

---

## Current Configuration

### ESLint (Very Permissive)

- ✅ Only critical errors blocked
- ⚠️ Most rules are warnings
- 🔕 Console logs allowed
- 🔕 Inline styles allowed
- 🔕 Color literals allowed

### Prettier

- ✅ Auto-formats on commit
- 🔕 Ignores generated files
- 🔕 Non-blocking in CI

### Jest

- ✅ Runs basic tests
- 🔕 No coverage thresholds
- 🔕 Passes even with no tests

### Pre-commit Hooks

- ✅ Auto-fixes issues
- ⚠️ Allows up to 10 warnings
- 🔕 Can be bypassed with --no-verify

---

## Gradual Improvement Plan

As the codebase improves, you can tighten the rules:

### Phase 1 (Current) - Development

```json
"lint": "eslint . --ext .js,.jsx"
```

Very permissive, warnings only

### Phase 2 - Stabilization

```json
"lint": "eslint . --ext .js,.jsx --max-warnings 50"
```

Allow some warnings

### Phase 3 - Production Ready

```json
"lint": "eslint . --ext .js,.jsx --max-warnings 0"
```

Zero warnings allowed

---

## Disable Checks Temporarily

### In package.json

```json
{
  "scripts": {
    "validate": "echo 'Validation temporarily disabled'"
  }
}
```

### In .eslintrc.js

```javascript
module.exports = {
  rules: {
    'no-console': 'off', // Disable specific rule
    // or
    'react-hooks/exhaustive-deps': 'off',
  },
};
```

### For specific files

Add comment at top of file:

```javascript
/* eslint-disable */
// or
/* eslint-disable no-console */
```

---

## Getting Help

**See what's failing:**

```bash
npm run lint > lint-report.txt
npm test > test-report.txt
```

**Check configuration:**

```bash
cat .eslintrc.js
cat jest.config.js
cat .prettierrc.json
```

**Reset everything:**

```bash
rm -rf node_modules package-lock.json
npm install
npm run prepare
```

---

## CI/CD Behavior

Current setup in GitHub Actions:

- ✅ Commit format check: **BLOCKING**
- ⚠️ Linter: **NON-BLOCKING** (warnings shown)
- ⚠️ Tests: **NON-BLOCKING** (warnings shown)
- ⚠️ Formatting: **SKIPPED** (not blocking releases)
- ✅ Semantic release: **RUNS REGARDLESS**

This means releases will proceed even with lint/test warnings.
