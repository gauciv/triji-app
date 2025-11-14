#!/usr/bin/env node

/**
 * Deploy script - Triggers EAS Update or EAS Build based on release type
 * Usage: node scripts/deploy.js <release-type>
 * 
 * Release Types:
 * - patch: EAS Update (OTA)
 * - minor: EAS Update (OTA)
 * - major: EAS Build (full rebuild required)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const releaseType = process.argv[2];
const version = require('../package.json').version;

console.log('\n🚀 Deployment triggered');
console.log(`   Release Type: ${releaseType}`);
console.log(`   Version: ${version}\n`);

/**
 * Execute command and handle errors
 */
function execute(command, description) {
  console.log(`📦 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed\n`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
}

/**
 * Main deployment logic
 */
async function deploy() {
  if (releaseType === 'major') {
    // MAJOR: Breaking changes - requires full rebuild
    console.log('🔨 MAJOR release detected - Triggering EAS Build');
    console.log('⚠️  Users will need to reinstall the APK\n');
    
    const buildSuccess = execute(
      'eas build --platform android --profile production --non-interactive',
      'Building production APK'
    );
    
    if (buildSuccess) {
      console.log('📝 Next steps:');
      console.log('   1. Wait for build to complete on EAS');
      console.log('   2. Download APK from EAS dashboard');
      console.log('   3. Upload to GitHub Releases (will be automated by semantic-release)');
      console.log('   4. Notify users to install new version');
    }
    
  } else if (releaseType === 'minor' || releaseType === 'patch') {
    // MINOR/PATCH: No breaking changes - OTA update
    const updateType = releaseType === 'minor' ? '✨ Feature' : '🐛 Fix';
    console.log(`${updateType} release detected - Triggering EAS Update (OTA)`);
    console.log('✅ Users will receive update automatically\n');
    
    const updateSuccess = execute(
      `eas update --branch production --message "v${version}: ${releaseType} release"`,
      'Publishing OTA update'
    );
    
    if (updateSuccess) {
      console.log('📝 Update deployed successfully!');
      console.log('   Users will receive the update within ~5 minutes');
      console.log('   No reinstallation required');
    }
    
  } else {
    console.log('ℹ️  No deployment needed for this release type');
  }
}

// Run deployment
deploy().catch(error => {
  console.error('❌ Deployment failed:', error);
  process.exit(1);
});
