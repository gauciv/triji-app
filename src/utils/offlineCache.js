import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Offline Cache Manager
 * Handles caching of Firebase data for offline access
 */

const CACHE_KEYS = {
  TASKS: 'cached_tasks',
  ANNOUNCEMENTS: 'cached_announcements',
  POSTS: 'cached_posts',
  USER_PROFILE: 'cached_user_profile',
  SUBJECTS: 'cached_subjects',
  LAST_SYNC: 'last_sync_time',
};

/**
 * Save data to cache
 */
export const cacheData = async (key, data) => {
  try {
    const cacheEntry = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(cacheEntry));
    console.log(`Cached ${key} successfully`);
    return true;
  } catch (error) {
    console.error(`Error caching ${key}:`, error);
    return false;
  }
};

/**
 * Get data from cache
 */
export const getCachedData = async (key, maxAge = 24 * 60 * 60 * 1000) => {
  // Default: 24 hours
  try {
    const cached = await AsyncStorage.getItem(key);
    if (!cached) {
      return null;
    }

    const { data, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;

    if (age > maxAge) {
      console.log(`Cache expired for ${key}`);
      return null;
    }

    console.log(`Retrieved ${key} from cache (age: ${Math.round(age / 1000 / 60)} minutes)`);
    return data;
  } catch (error) {
    console.error(`Error reading cache ${key}:`, error);
    return null;
  }
};

/**
 * Clear specific cache
 */
export const clearCache = async key => {
  try {
    await AsyncStorage.removeItem(key);
    console.log(`Cleared cache ${key}`);
    return true;
  } catch (error) {
    console.error(`Error clearing cache ${key}:`, error);
    return false;
  }
};

/**
 * Clear all app caches
 */
export const clearAllCaches = async () => {
  try {
    const keys = Object.values(CACHE_KEYS);
    await AsyncStorage.multiRemove(keys);
    console.log('Cleared all caches');
    return true;
  } catch (error) {
    console.error('Error clearing all caches:', error);
    return false;
  }
};

/**
 * Get cache info
 */
export const getCacheInfo = async () => {
  try {
    const info = {};
    for (const [name, key] of Object.entries(CACHE_KEYS)) {
      const cached = await AsyncStorage.getItem(key);
      if (cached) {
        const { timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        info[name] = {
          age: Math.round(age / 1000 / 60), // minutes
          lastUpdated: new Date(timestamp).toLocaleString(),
        };
      } else {
        info[name] = null;
      }
    }
    return info;
  } catch (error) {
    console.error('Error getting cache info:', error);
    return {};
  }
};

/**
 * Update last sync time
 */
export const updateLastSync = async () => {
  try {
    await AsyncStorage.setItem(CACHE_KEYS.LAST_SYNC, Date.now().toString());
    return true;
  } catch (error) {
    console.error('Error updating last sync:', error);
    return false;
  }
};

/**
 * Get last sync time
 */
export const getLastSyncTime = async () => {
  try {
    const timestamp = await AsyncStorage.getItem(CACHE_KEYS.LAST_SYNC);
    if (!timestamp) {
      return null;
    }
    return parseInt(timestamp, 10);
  } catch (error) {
    console.error('Error getting last sync time:', error);
    return null;
  }
};

export { CACHE_KEYS };
