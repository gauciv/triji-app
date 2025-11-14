const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Scheduled function to run daily at midnight UTC
exports.cleanupExpiredPosts = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('UTC')
  .onRun(async context => {
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();

    try {
      // Query for expired posts
      const expiredPostsQuery = await db
        .collection('freedom-wall-posts')
        .where('expiresAt', '<=', now)
        .get();

      if (expiredPostsQuery.empty) {
        console.log('No expired posts to delete');
        return null;
      }

      // Create batch for deletion
      const batch = db.batch();

      expiredPostsQuery.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Execute batch deletion
      await batch.commit();

      console.log(`Deleted ${expiredPostsQuery.docs.length} expired posts`);
      return null;
    } catch (error) {
      console.error('Error cleaning up expired posts:', error);
      throw error;
    }
  });
