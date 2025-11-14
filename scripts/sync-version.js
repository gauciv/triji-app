#!/usr/bin/env node

/**
 * Sync version from package.json to app.json
 * Usage: node scripts/sync-version.js [version]
 */

const fs = require('fs');
const path = require('path');

const version = process.argv[2] || require('../package.json').version;

// Read app.json
const appJsonPath = path.join(__dirname, '../app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

// Update version
appJson.expo.version = version;

// Also update versionCode for Android (integer incremented version)
// Convert semantic version to integer: 1.2.3 → 10203
const [major, minor, patch] = version.split('.').map(Number);
appJson.expo.android.versionCode = major * 10000 + minor * 100 + patch;

// Update iOS buildNumber
appJson.expo.ios.buildNumber = version;

// Write back to app.json
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');

console.log(`✅ Synced version to ${version}`);
console.log(`   - app.json: expo.version = ${version}`);
console.log(`   - Android versionCode: ${appJson.expo.android.versionCode}`);
console.log(`   - iOS buildNumber: ${version}`);
