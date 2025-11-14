module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature (minor)
        'fix',      // Bug fix (patch)
        'docs',     // Documentation only
        'style',    // Code style changes (formatting)
        'refactor', // Code refactoring
        'perf',     // Performance improvement (patch)
        'test',     // Adding/updating tests
        'chore',    // Maintenance tasks
        'revert',   // Revert previous commit (patch)
        'build',    // Build system changes
        'ci'        // CI/CD changes
      ]
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
    'body-leading-blank': [1, 'always'],
    'body-max-line-length': [2, 'always', 200],
    'footer-leading-blank': [1, 'always'],
    'footer-max-line-length': [2, 'always', 200]
  }
};
