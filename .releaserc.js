module.exports = {
  branches: ['main'],
  repositoryUrl: 'https://github.com/gauciv/triji-app',
  plugins: [
    // Analyze commits to determine version bump
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'conventionalcommits',
        releaseRules: [
          // BREAKING CHANGE → Major version (requires rebuild)
          { breaking: true, release: 'major' },
          // feat: → Minor version (OTA update)
          { type: 'feat', release: 'minor' },
          // fix: → Patch version (OTA update)
          { type: 'fix', release: 'patch' },
          // perf: → Patch version (OTA update)
          { type: 'perf', release: 'patch' },
          // revert: → Patch version (OTA update)
          { type: 'revert', release: 'patch' },
          // docs:, style:, refactor:, test:, chore:, build:, ci: → No release
          { type: 'docs', release: false },
          { type: 'style', release: false },
          { type: 'refactor', release: false },
          { type: 'test', release: false },
          { type: 'chore', release: false },
          { type: 'build', release: false },
          { type: 'ci', release: false }
        ],
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES', 'BREAKING']
        }
      }
    ],
    
    // Generate release notes
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits',
        presetConfig: {
          types: [
            { type: 'feat', section: '✨ Features' },
            { type: 'fix', section: '🐛 Bug Fixes' },
            { type: 'perf', section: '⚡ Performance Improvements' },
            { type: 'revert', section: '⏪ Reverts' },
            { type: 'docs', section: '📚 Documentation', hidden: false },
            { type: 'style', section: '💄 Styles', hidden: true },
            { type: 'chore', section: '🔧 Chores', hidden: true },
            { type: 'refactor', section: '♻️ Code Refactoring', hidden: true },
            { type: 'test', section: '✅ Tests', hidden: true },
            { type: 'build', section: '📦 Build System', hidden: true },
            { type: 'ci', section: '👷 CI/CD', hidden: false }
          ]
        }
      }
    ],
    
    // Update CHANGELOG.md
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
        changelogTitle: '# Changelog\n\nAll notable changes to Triji will be documented in this file.\n\nThe format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),\nand this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n\n<!-- semantic-release-insert-here -->'
      }
    ],
    
    // Update package.json version (but don't publish to npm)
    [
      '@semantic-release/npm',
      {
        npmPublish: false
      }
    ],
    
    // Sync version to app.json and trigger appropriate deployment
    [
      '@semantic-release/exec',
      {
        prepareCmd: 'npm run version:sync ${nextRelease.version}',
        publishCmd: 'node scripts/deploy.js ${nextRelease.type}'
      }
    ],
    
    // Commit updated files back to repo
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'package-lock.json', 'app.json', 'CHANGELOG.md'],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
      }
    ],
    
    // Create GitHub release
    [
      '@semantic-release/github',
      {
        assets: [
          {
            path: 'CHANGELOG.md',
            label: 'Changelog'
          }
        ]
      }
    ]
  ]
};
