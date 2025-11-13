import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure how notifications are displayed when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Request notification permissions and register for push notifications
 * @returns {Promise<string|null>} Push token if successful, null otherwise
 */
export async function registerForPushNotifications() {
  let token = null;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    // Get the token that uniquely identifies this device
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Push notification token:', token);
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  // Android-specific configuration
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

/**
 * Schedule a local push notification
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Additional data to pass with notification
 */
export async function schedulePushNotification(title, body, data = {}) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: null, // Send immediately
  });
}

/**
 * Get notification preference for a specific type
 * @param {string} type - 'tasks', 'announcements', or 'freedom_wall'
 * @returns {Promise<boolean>} Whether notifications are enabled for this type
 */
export async function getNotificationPreference(type) {
  try {
    const value = await AsyncStorage.getItem(`notifications_${type}`);
    return value === 'true';
  } catch (error) {
    console.log('Error reading notification preference:', error);
    return false;
  }
}

/**
 * Set notification preference for a specific type
 * @param {string} type - 'tasks', 'announcements', or 'freedom_wall'
 * @param {boolean} enabled - Whether to enable notifications
 */
export async function setNotificationPreference(type, enabled) {
  try {
    await AsyncStorage.setItem(`notifications_${type}`, enabled.toString());
  } catch (error) {
    console.log('Error saving notification preference:', error);
  }
}

/**
 * Check if user has granted notification permissions
 * @returns {Promise<boolean>} Whether permissions are granted
 */
export async function checkNotificationPermissions() {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

/**
 * Set up notification listeners
 * @param {function} onNotificationReceived - Callback when notification is received
 * @param {function} onNotificationTapped - Callback when notification is tapped
 * @returns {object} Object with subscription remove functions
 */
export function setupNotificationListeners(onNotificationReceived, onNotificationTapped) {
  // Listener for when a notification is received while app is foregrounded
  const notificationListener = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification received:', notification);
    if (onNotificationReceived) {
      onNotificationReceived(notification);
    }
  });

  // Listener for when a user taps on or interacts with a notification
  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Notification tapped:', response);
    if (onNotificationTapped) {
      onNotificationTapped(response);
    }
  });

  return {
    notificationListener,
    responseListener,
    remove: () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    }
  };
}
