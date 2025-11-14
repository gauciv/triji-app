#!/bin/bash

echo "🚀 Setting up Testing & Quality Gates..."
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup Husky
echo "🪝 Setting up Husky git hooks..."
npx husky install
chmod +x .husky/pre-commit

# Run initial validation
echo ""
echo "✅ Running initial validation..."
npm run format
npm run lint:fix

# Run tests
echo ""
echo "🧪 Running tests..."
npm test -- --coverage

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Review the test results above"
echo "   2. Check docs/TESTING.md for detailed guide"
echo "   3. Try committing - pre-commit hooks will run automatically"
echo ""
echo "🎯 Quick commands:"
echo "   npm test          - Run tests"
echo "   npm run lint      - Check code quality"
echo "   npm run format    - Format code"
echo "   npm run validate  - Run all checks"
echo ""
