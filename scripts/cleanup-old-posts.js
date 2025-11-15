#!/usr/bin/env node

/**
 * Cleanup Script for Freedom Wall Posts
 * Deletes posts older than 24 hours based on createdAt timestamp
 * Also updates expiresAt for posts created with 3-day expiration
 *
 * Usage: node scripts/cleanup-old-posts.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
  ? require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
  : null;

if (!serviceAccount && !admin.apps.length) {
  console.error('❌ Error: FIREBASE_SERVICE_ACCOUNT_PATH environment variable not set');
  console.error('Please set it to the path of your Firebase service account JSON file');
  console.error('Example: export FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/serviceAccountKey.json');
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function cleanupOldPosts() {
  console.log('🧹 Starting cleanup of old Freedom Wall posts...\n');

  try {
    const postsRef = db.collection('freedom-wall-posts');
    const snapshot = await postsRef.get();

    if (snapshot.empty) {
      console.log('✅ No posts found in the database.');
      return;
    }

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    let deletedCount = 0;
    let updatedCount = 0;
    let totalCount = 0;

    console.log(`📊 Found ${snapshot.size} posts. Analyzing...\n`);

    const batch = db.batch();
    let batchCount = 0;

    for (const doc of snapshot.docs) {
      totalCount++;
      const data = doc.data();
      const postId = doc.id;

      // Convert Firestore Timestamp to JavaScript Date
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);

      const expiresAt = data.expiresAt?.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt);

      // Delete posts older than 24 hours (based on createdAt)
      if (createdAt < twentyFourHoursAgo) {
        console.log(`🗑️  Deleting post ${postId}:`);
        console.log(`   Created: ${createdAt.toLocaleString()}`);
        console.log(`   Age: ${Math.floor((now - createdAt) / (1000 * 60 * 60))} hours old`);
        console.log(`   Content: "${data.content?.substring(0, 50)}..."\n`);

        batch.delete(doc.ref);
        deletedCount++;
        batchCount++;
      }
      // Update posts with wrong expiration (3 days instead of 24 hours)
      else if (expiresAt > now) {
        const correctExpiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);

        // If the current expiresAt is more than 24 hours from createdAt, update it
        const currentExpirDiff = expiresAt.getTime() - createdAt.getTime();
        const oneDayInMs = 24 * 60 * 60 * 1000;

        if (currentExpirDiff > oneDayInMs + 60 * 60 * 1000) {
          // More than 25 hours
          console.log(`🔧 Updating post ${postId}:`);
          console.log(`   Created: ${createdAt.toLocaleString()}`);
          console.log(`   Old expires: ${expiresAt.toLocaleString()}`);
          console.log(`   New expires: ${correctExpiresAt.toLocaleString()}`);
          console.log(`   Content: "${data.content?.substring(0, 50)}..."\n`);

          batch.update(doc.ref, {
            expiresAt: admin.firestore.Timestamp.fromDate(correctExpiresAt),
          });
          updatedCount++;
          batchCount++;
        }
      }

      // Firestore batch limit is 500 operations
      if (batchCount >= 500) {
        console.log('💾 Committing batch...\n');
        await batch.commit();
        batchCount = 0;
      }
    }

    // Commit remaining operations
    if (batchCount > 0) {
      console.log('💾 Committing final batch...\n');
      await batch.commit();
    }

    console.log('═══════════════════════════════════════════════════');
    console.log('📈 Cleanup Summary:');
    console.log('═══════════════════════════════════════════════════');
    console.log(`Total posts scanned:      ${totalCount}`);
    console.log(`Posts deleted (>24h old): ${deletedCount}`);
    console.log(`Posts updated (exp fix):  ${updatedCount}`);
    console.log(`Remaining active posts:   ${totalCount - deletedCount}`);
    console.log('═══════════════════════════════════════════════════\n');

    if (deletedCount > 0 || updatedCount > 0) {
      console.log('✅ Cleanup completed successfully!');
    } else {
      console.log('✅ No cleanup needed. All posts are current!');
    }
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

// Run the cleanup
cleanupOldPosts()
  .then(() => {
    console.log('\n🎉 Script completed. Exiting...');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
