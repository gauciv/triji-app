# Quality Gates & Testing Setup

## ✅ What's Included

This project now has a comprehensive testing and quality assurance system:

### 🧪 Testing

- **Jest** - Fast, modern JavaScript testing framework
- **React Native Testing Library** - Component testing utilities
- **Coverage Thresholds** - Minimum 50% coverage required
- **Automated Tests** - Run on every commit and CI/CD

### 🎨 Code Quality

- **ESLint** - Static analysis and code linting
- **Prettier** - Consistent code formatting
- **TypeScript** - Type checking (without full migration)
- **Pre-commit Hooks** - Automatic checks before committing

### 🚀 CI/CD Integration

- **GitHub Actions** - Automated quality checks
- **Conventional Commits** - Enforced commit format
- **Automated Reports** - Coverage and test results

---

## 📦 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Git Hooks

```bash
npm run prepare
chmod +x .husky/pre-commit
```

Or run the automated setup:

```bash
chmod +x scripts/setup-testing.sh
./scripts/setup-testing.sh
```

### 3. Run Tests

```bash
npm test
```

---

## 🎯 Available Commands

### Testing

```bash
npm test                # Run all tests
npm run test:watch      # Watch mode for development
npm run test:ci         # Run with coverage for CI
```

### Code Quality

```bash
npm run lint            # Check for linting issues
npm run lint:fix        # Auto-fix linting issues
npm run format          # Format all files
npm run format:check    # Check formatting
npm run type-check      # TypeScript type checking
```

### All-in-One

```bash
npm run validate        # Run all checks (lint + format + test)
```

---

## 🪝 Git Hooks

### Pre-commit Hook

Automatically runs when you `git commit`:

1. **ESLint** - Checks and fixes code quality issues
2. **Prettier** - Formats your code
3. **Only on staged files** - Fast and efficient

**Example:**

```bash
git add src/components/MyComponent.js
git commit -m "feat: add new component"
# ↓ Pre-commit hook runs automatically
# ✅ ESLint check passed
# ✅ Prettier formatting passed
# ✅ Commit successful
```

### Bypass (Emergency Only)

```bash
git commit --no-verify -m "emergency fix"
```

---

## 📊 Coverage Reports

After running tests with coverage:

```bash
npm run test:ci
```

View the HTML report:

```bash
# macOS
open coverage/lcov-report/index.html

# Linux
xdg-open coverage/lcov-report/index.html

# Windows
start coverage/lcov-report/index.html
```

**Current Thresholds:**

- Statements: 50%
- Branches: 40%
- Functions: 50%
- Lines: 50%

---

## 🔍 GitHub Actions Integration

Every push to `main` runs:

1. ✅ Verify Conventional Commits format
2. ✅ Run ESLint
3. ✅ Run tests with coverage
4. ✅ Check code formatting
5. ✅ Type check TypeScript
6. ✅ Semantic release (if releasable)

View results at: `https://github.com/gauciv/triji-app/actions`

---

## 📝 Writing Tests

### Component Test Example

Create `src/components/__tests__/MyComponent.test.js`:

```javascript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('should render title', () => {
    const { getByText } = render(<MyComponent title="Hello" />);
    expect(getByText('Hello')).toBeTruthy();
  });

  it('should handle press', () => {
    const onPress = jest.fn();
    const { getByText } = render(<MyComponent onPress={onPress} />);

    fireEvent.press(getByText('Button'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

### Utility Test Example

Create `src/utils/__tests__/myUtil.test.js`:

```javascript
import { formatDate } from '../myUtil';

describe('formatDate', () => {
  it('should format dates correctly', () => {
    const date = new Date('2025-01-15');
    expect(formatDate(date)).toBe('Jan 15, 2025');
  });
});
```

---

## 🐛 Troubleshooting

### Tests fail on CI but pass locally

```bash
npm test -- --clearCache
rm -rf node_modules package-lock.json
npm install
```

### Pre-commit hook not running

```bash
npm run prepare
chmod +x .husky/pre-commit
```

### ESLint and Prettier conflicts

```bash
npm run format
npm run lint:fix
```

---

## 📚 Documentation

For detailed guides, see:

- **[TESTING.md](./TESTING.md)** - Comprehensive testing guide
- **[COMMIT_GUIDE.md](./COMMIT_GUIDE.md)** - Commit message format
- **[VERSIONING.md](./VERSIONING.md)** - Release process

---

## ✅ Quality Checklist

Before pushing code:

- [ ] Tests pass: `npm test`
- [ ] No lint errors: `npm run lint`
- [ ] Code formatted: `npm run format`
- [ ] Types valid: `npm run type-check`
- [ ] Commit follows conventional format
- [ ] New features have tests

Or run everything at once:

```bash
npm run validate
```

---

## 🎉 Benefits

### For Developers

- ✅ Catch bugs before they reach production
- ✅ Consistent code style across team
- ✅ Automated quality checks
- ✅ Fast feedback loop

### For Project

- ✅ Higher code quality
- ✅ Better maintainability
- ✅ Fewer bugs in production
- ✅ Easier onboarding for new developers

---

## 📈 Next Steps

1. **Run setup script:**

   ```bash
   chmod +x scripts/setup-testing.sh
   ./scripts/setup-testing.sh
   ```

2. **Read full guide:**

   ```bash
   cat docs/TESTING.md
   ```

3. **Write your first test:**
   - Pick a simple utility function
   - Create `__tests__` directory next to it
   - Write test file
   - Run `npm test`

4. **Make a commit:**
   - Pre-commit hooks will run automatically
   - See the quality gates in action

---

**Questions?** Check [docs/TESTING.md](./TESTING.md) for detailed information.

**Issues?** Run `npm run validate` to check everything at once.
