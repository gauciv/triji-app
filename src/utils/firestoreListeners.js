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
  // Check if user is authenticated
  if (!auth.currentUser) {
    console.log('Cannot start tasks listener: User not authenticated');
    return;
  }

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

        const subject = task.subjectCode || task.subject || 'Task';
        const title = task.title || 'New assignment';
        schedulePushNotification(
          '📋 New Task Added',
          `${subject} • ${title}`,
          { type: 'task', taskId: change.doc.id },
          'tasks'
        );
      }
    });
  });
}

/**
 * Start listening for new announcements in Firestore and send notifications
 */
export function startAnnouncementsListener() {
  // Check if user is authenticated
  if (!auth.currentUser) {
    console.log('Cannot start announcements listener: User not authenticated');
    return;
  }

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

        const announcementType = announcement.announcementType || announcement.type || 'General';
        let emoji = '📢';
        switch(announcementType) {
          case 'Critical': emoji = '🚨'; break;
          case 'Event': emoji = '📅'; break;
          case 'Reminder': emoji = '⏰'; break;
          case 'General': emoji = '📢'; break;
        }
        
        schedulePushNotification(
          `${emoji} ${announcementType} Announcement`,
          announcement.title || 'A new announcement has been posted',
          { type: 'announcement', announcementId: change.doc.id },
          'announcements'
        );
      }
    });
  });
}

/**
 * Start listening for new Freedom Wall posts and send notifications
 */
export function startFreedomWallListener() {
  // Check if user is authenticated
  if (!auth.currentUser) {
    console.log('Cannot start freedom wall listener: User not authenticated');
    return;
  }

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

        const content = post.content || post.note || 'New post';
        const preview = content.substring(0, 60);
        const author = post.nickname || post.displayName || 'Anonymous';
        schedulePushNotification(
          '💬 Freedom Wall',
          `${author}: ${preview}${content.length > 60 ? '...' : ''}`,
          { type: 'freedomWall', postId: change.doc.id },
          'freedomwall'
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
