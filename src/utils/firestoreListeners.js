import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../config/firebaseConfig';
import { schedulePushNotification, getNotificationPreference } from './notifications';

let tasksUnsubscribe = null;
let announcementsUnsubscribe = null;
let freedomWallUnsubscribe = null;

/**
 * Start listening for new tasks in Firestore and send notifications
 */
export function startTasksListener() {
  if (tasksUnsubscribe) {
    return; // Already listening
  }

  const tasksQuery = query(
    collection(db, 'tasks'),
    orderBy('createdAt', 'desc'),
    limit(1)
  );

  let isFirstLoad = true;

  tasksUnsubscribe = onSnapshot(tasksQuery, async (snapshot) => {
    // Skip the first load to avoid notifying about existing tasks
    if (isFirstLoad) {
      isFirstLoad = false;
      return;
    }

    // Check if user has enabled tasks notifications
    const notificationsEnabled = await getNotificationPreference('tasks');
    if (!notificationsEnabled) {
      return;
    }

    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const task = change.doc.data();
        const currentUser = auth.currentUser;

        // Don't notify user about their own tasks
        if (task.authorId === currentUser?.uid) {
          return;
        }

        schedulePushNotification(
          'New Task Added',
          `${task.subject}: ${task.header || 'Check the task board'}`,
          { type: 'task', taskId: change.doc.id }
        );
      }
    });
  });
}

/**
 * Start listening for new announcements in Firestore and send notifications
 */
export function startAnnouncementsListener() {
  if (announcementsUnsubscribe) {
    return; // Already listening
  }

  const announcementsQuery = query(
    collection(db, 'announcements'),
    orderBy('createdAt', 'desc'),
    limit(1)
  );

  let isFirstLoad = true;

  announcementsUnsubscribe = onSnapshot(announcementsQuery, async (snapshot) => {
    // Skip the first load
    if (isFirstLoad) {
      isFirstLoad = false;
      return;
    }

    const notificationsEnabled = await getNotificationPreference('announcements');
    if (!notificationsEnabled) {
      return;
    }

    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const announcement = change.doc.data();
        const currentUser = auth.currentUser;

        if (announcement.authorId === currentUser?.uid) {
          return;
        }

        schedulePushNotification(
          'New Announcement',
          announcement.title || 'A new announcement has been posted',
          { type: 'announcement', announcementId: change.doc.id }
        );
      }
    });
  });
}

/**
 * Start listening for new freedom wall posts in Firestore and send notifications
 */
export function startFreedomWallListener() {
  if (freedomWallUnsubscribe) {
    return; // Already listening
  }

  const freedomWallQuery = query(
    collection(db, 'freedom-wall-posts'),
    orderBy('createdAt', 'desc'),
    limit(1)
  );

  let isFirstLoad = true;

  freedomWallUnsubscribe = onSnapshot(freedomWallQuery, async (snapshot) => {
    // Skip the first load
    if (isFirstLoad) {
      isFirstLoad = false;
      return;
    }

    const notificationsEnabled = await getNotificationPreference('freedom_wall');
    if (!notificationsEnabled) {
      return;
    }

    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const post = change.doc.data();
        const currentUser = auth.currentUser;

        if (post.authorId === currentUser?.uid) {
          return;
        }

        const preview = post.note?.substring(0, 50) || 'New post on freedom wall';
        schedulePushNotification(
          'Freedom Wall',
          `${post.author || 'Someone'}: ${preview}${post.note?.length > 50 ? '...' : ''}`,
          { type: 'freedomWall', postId: change.doc.id }
        );
      }
    });
  });
}

/**
 * Start all listeners
 */
export function startAllListeners() {
  startTasksListener();
  startAnnouncementsListener();
  startFreedomWallListener();
}

/**
 * Stop all listeners
 */
export function stopAllListeners() {
  if (tasksUnsubscribe) {
    tasksUnsubscribe();
    tasksUnsubscribe = null;
  }
  if (announcementsUnsubscribe) {
    announcementsUnsubscribe();
    announcementsUnsubscribe = null;
  }
  if (freedomWallUnsubscribe) {
    freedomWallUnsubscribe();
    freedomWallUnsubscribe = null;
  }
}
