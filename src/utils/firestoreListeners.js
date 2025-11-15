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

  // Track the timestamp when listener starts
  const listenerStartTime = new Date();

  const tasksQuery = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'), limit(10));

  tasksUnsubscribe = onSnapshot(
    tasksQuery,
    async snapshot => {
      // Check if user has enabled tasks notifications
      const notificationsEnabled = await getNotificationPreference('tasks');
      if (!notificationsEnabled) {
        return;
      }

      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const task = change.doc.data();
          const currentUser = auth.currentUser;

          // Don't notify user about their own tasks
          if (task.authorId === currentUser?.uid) {
            return;
          }

          // Only notify about tasks created AFTER listener started
          const taskCreatedAt = task.createdAt?.toDate
            ? task.createdAt.toDate()
            : new Date(task.createdAt);

          if (taskCreatedAt <= listenerStartTime) {
            return;
          }

          const subject = task.subjectCode || task.subject || 'Task';
          const title = task.title || 'New assignment';

          console.log('🔔 Sending Task notification:', { subject, title });

          schedulePushNotification(
            '📋 New Task Added',
            `${subject} • ${title}`,
            { type: 'task', taskId: change.doc.id },
            'tasks'
          );
        }
      });
    },
    error => {
      console.error('Tasks listener error:', error);
    }
  );
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

  // Track the timestamp when listener starts
  const listenerStartTime = new Date();

  const announcementsQuery = query(
    collection(db, 'announcements'),
    orderBy('createdAt', 'desc'),
    limit(10)
  );

  announcementsUnsubscribe = onSnapshot(
    announcementsQuery,
    async snapshot => {
      const notificationsEnabled = await getNotificationPreference('announcements');
      if (!notificationsEnabled) {
        return;
      }

      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const announcement = change.doc.data();
          const currentUser = auth.currentUser;

          if (announcement.authorId === currentUser?.uid) {
            return;
          }

          // Only notify about announcements created AFTER listener started
          const announcementCreatedAt = announcement.createdAt?.toDate
            ? announcement.createdAt.toDate()
            : new Date(announcement.createdAt);

          if (announcementCreatedAt <= listenerStartTime) {
            return;
          }

          const announcementType = announcement.announcementType || announcement.type || 'General';
          let emoji = '📢';
          switch (announcementType) {
            case 'Critical':
              emoji = '🚨';
              break;
            case 'Event':
              emoji = '📅';
              break;
            case 'Reminder':
              emoji = '⏰';
              break;
            case 'General':
              emoji = '📢';
              break;
          }

          console.log('🔔 Sending Announcement notification:', {
            type: announcementType,
            title: announcement.title,
          });

          schedulePushNotification(
            `${emoji} ${announcementType} Announcement`,
            announcement.title || 'A new announcement has been posted',
            { type: 'announcement', announcementId: change.doc.id },
            'announcements'
          );
        }
      });
    },
    error => {
      console.error('Announcements listener error:', error);
    }
  );
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

  // Track the timestamp when listener starts to only notify about NEW posts
  const listenerStartTime = new Date();

  const freedomWallQuery = query(
    collection(db, 'freedom-wall-posts'),
    orderBy('createdAt', 'desc'),
    limit(10) // Increased to catch multiple posts
  );

  freedomWallUnsubscribe = onSnapshot(
    freedomWallQuery,
    async snapshot => {
      const notificationsEnabled = await getNotificationPreference('freedom_wall');
      if (!notificationsEnabled) {
        return;
      }

      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const post = change.doc.data();
          const currentUser = auth.currentUser;

          // Don't notify about own posts
          if (post.authorId === currentUser?.uid) {
            return;
          }

          // Only notify about posts created AFTER listener started
          const postCreatedAt = post.createdAt?.toDate
            ? post.createdAt.toDate()
            : new Date(post.createdAt);

          if (postCreatedAt <= listenerStartTime) {
            return; // Post existed before listener started
          }

          const content = post.content || post.note || 'New post';
          const preview = content.substring(0, 60);
          const author = post.nickname || post.displayName || 'Anonymous';

          console.log('🔔 Sending Freedom Wall notification:', { author, preview });

          schedulePushNotification(
            '💬 New Freedom Wall Post',
            `${author}: ${preview}${content.length > 60 ? '...' : ''}`,
            { type: 'freedomWall', postId: change.doc.id },
            'freedomwall'
          );
        }
      });
    },
    error => {
      console.error('Freedom Wall listener error:', error);
    }
  );
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
