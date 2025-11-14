# Testing & Quality Gates Guide

## 📋 Overview

This project uses a comprehensive testing and quality assurance system to ensure code quality and reliability.

### Testing Stack

- **Jest** - JavaScript testing framework
- **React Native Testing Library** - Component testing utilities
- **ESLint** - Code linting and static analysis
- **Prettier** - Code formatting
- **TypeScript** - Type checking (without migration)
- **Husky** - Git hooks for pre-commit checks
- **lint-staged** - Run linters on staged files

---

## 🧪 Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:ci
```

### Run Tests for Specific File

```bash
npm test -- errorHandler.test.js
```

---

## 🎨 Code Quality Commands

### Linting

```bash
# Run ESLint (check for issues)
npm run lint

# Run ESLint and auto-fix issues
npm run lint:fix
```

### Formatting

```bash
# Check if code is formatted
npm run format:check

# Auto-format all files
npm run format
```

### Type Checking

```bash
# Check types (no compilation)
npm run type-check
```

### Validate Everything

```bash
# Run all quality checks (lint + format + test)
npm run validate
```

---

## 🪝 Git Hooks

### Pre-commit Hook

Automatically runs on `git commit`:

1. **ESLint** - Checks and fixes linting issues in staged files
2. **Prettier** - Formats staged files
3. **Staged files only** - Only checks/fixes files you're committing

If any check fails, the commit is blocked.

### Bypass Hook (Emergency Only)

```bash
git commit --no-verify -m "emergency fix"
```

⚠️ **Use sparingly!** Bypassing hooks can introduce bugs.

---

## 📊 Coverage Thresholds

Current minimum coverage requirements:

| Metric     | Threshold |
| ---------- | --------- |
| Statements | 50%       |
| Branches   | 40%       |
| Functions  | 50%       |
| Lines      | 50%       |

Coverage report is generated in `coverage/` directory after running tests.

### View Coverage Report

```bash
# Generate coverage
npm run test:ci

# Open HTML report (macOS)
open coverage/lcov-report/index.html

# Open HTML report (Linux)
xdg-open coverage/lcov-report/index.html

# Open HTML report (Windows)
start coverage/lcov-report/index.html
```

---

## 🔍 CI/CD Quality Gates

GitHub Actions runs these checks on every push to `main`:

1. ✅ **Conventional Commits** - Validates commit format
2. ✅ **Linting** - Checks code quality with ESLint
3. ✅ **Tests** - Runs full test suite with coverage
4. ✅ **Formatting** - Verifies code formatting with Prettier
5. ✅ **Type Checking** - Validates TypeScript types
6. ✅ **Semantic Release** - Automated versioning and deployment

All checks run with `continue-on-error: true` during releases to avoid blocking deployments for minor issues.

---

## 📝 Writing Tests

### Test File Structure

```
src/
├── components/
│   ├── InfoRow.js
│   └── __tests__/
│       └── InfoRow.test.js
├── utils/
│   ├── errorHandler.js
│   └── __tests__/
│       └── errorHandler.test.js
```

### Component Test Example

```javascript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    const { getByText } = render(<MyComponent title="Hello" />);
    expect(getByText('Hello')).toBeTruthy();
  });

  it('should handle button press', () => {
    const onPress = jest.fn();
    const { getByText } = render(<MyComponent onPress={onPress} />);

    fireEvent.press(getByText('Submit'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

### Utility Function Test Example

```javascript
import { formatDate } from '../dateUtils';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2025-01-15');
    expect(formatDate(date)).toBe('Jan 15, 2025');
  });

  it('should handle invalid dates', () => {
    expect(formatDate(null)).toBe('Invalid date');
  });
});
```

### Async Test Example

```javascript
it('should fetch data successfully', async () => {
  const mockData = { id: 1, name: 'Test' };
  const fetchData = jest.fn().mockResolvedValue(mockData);

  const result = await fetchData();

  expect(result).toEqual(mockData);
  expect(fetchData).toHaveBeenCalledTimes(1);
});
```

---

## 🎯 Best Practices

### Test Organization

- **One test file per source file** - Keep tests close to code
- **Describe blocks** - Group related tests
- **Clear test names** - Use "should" statements
- **Arrange-Act-Assert** - Structure tests clearly

### What to Test

✅ **DO Test:**

- Component rendering
- User interactions (button presses, input changes)
- Utility function logic
- Edge cases and error handling
- State changes

❌ **DON'T Test:**

- Third-party libraries (Firebase, Expo)
- React Native core components
- Implementation details (internal state)
- Styling/layout (use snapshot tests sparingly)

### Mocking

```javascript
// Mock Firebase
jest.mock('../config/firebaseConfig', () => ({
  auth: { currentUser: { uid: 'test-id' } },
  db: {},
}));

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
}));
```

---

## 🐛 Debugging Tests

### Run Single Test

```bash
npm test -- -t "should render correctly"
```

### Run Tests with Verbose Output

```bash
npm test -- --verbose
```

### Run Tests with No Coverage

```bash
npm test -- --coverage=false
```

### Debug with Node Inspector

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

Then open `chrome://inspect` in Chrome.

---

## 📈 Improving Coverage

### Find Untested Code

```bash
npm run test:ci
open coverage/lcov-report/index.html
```

Red/yellow lines indicate untested code.

### Strategies to Increase Coverage

1. **Test edge cases** - null, undefined, empty arrays
2. **Test error paths** - catch blocks, error states
3. **Test async code** - promises, timeouts, callbacks
4. **Test user flows** - complete interaction sequences
5. **Test utilities first** - easier to test, high impact

---

## 🚀 CI/CD Integration

### GitHub Actions Workflow

The release workflow runs quality checks automatically:

```yaml
- name: Run Linter
  run: npm run lint
  continue-on-error: true

- name: Run Tests
  run: npm run test:ci
  continue-on-error: true

- name: Check Code Format
  run: npm run format:check
  continue-on-error: true

- name: Type Check
  run: npm run type-check
  continue-on-error: true
```

### View CI Results

1. Go to **GitHub Actions** tab
2. Click on latest workflow run
3. Expand each step to see results
4. Download coverage artifacts if needed

---

## 🔧 Configuration Files

### `jest.config.js`

- Test environment setup
- Coverage thresholds
- Transform patterns
- Module mappings

### `.eslintrc.js`

- Linting rules
- React/React Native rules
- Code style preferences

### `.prettierrc.json`

- Code formatting rules
- Print width, semicolons, quotes

### `tsconfig.json`

- TypeScript configuration
- Path aliases
- Compiler options

### `.husky/pre-commit`

- Pre-commit hook script
- Runs lint-staged

---

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## 🆘 Troubleshooting

### Tests Failing on CI but Passing Locally

```bash
# Clear Jest cache
npm test -- --clearCache

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### ESLint/Prettier Conflicts

```bash
# Format first, then lint
npm run format
npm run lint:fix
```

### Pre-commit Hook Not Running

```bash
# Reinstall Husky
npm run prepare
chmod +x .husky/pre-commit
```

### Mock Not Working

- Check mock is defined **before** import
- Use `jest.clearAllMocks()` in `beforeEach`
- Verify mock path matches import path

---

## 📝 Examples

### Example 1: Testing a Form Component

```javascript
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CreateTaskScreen from '../CreateTaskScreen';

describe('CreateTaskScreen', () => {
  it('should submit form with valid data', async () => {
    const { getByPlaceholderText, getByText } = render(<CreateTaskScreen />);

    fireEvent.changeText(getByPlaceholderText('Task title'), 'New Task');
    fireEvent.press(getByText('Submit'));

    await waitFor(() => {
      expect(getByText('Success')).toBeTruthy();
    });
  });
});
```

### Example 2: Testing Error Handling

```javascript
import { showErrorAlert } from '../errorHandler';

describe('showErrorAlert', () => {
  it('should handle network errors', () => {
    const error = new Error('Network request failed');
    error.code = 'NETWORK_ERROR';

    showErrorAlert(error, 'Connection Error');

    expect(Alert.alert).toHaveBeenCalledWith('Connection Error', 'Network request failed');
  });
});
```

---

## ✅ Quality Checklist

Before submitting a PR:

- [ ] All tests pass (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Types are valid (`npm run type-check`)
- [ ] Coverage is maintained/improved
- [ ] New code has tests
- [ ] Commit follows conventional format
- [ ] Documentation updated if needed

---

**Last Updated:** November 2025
