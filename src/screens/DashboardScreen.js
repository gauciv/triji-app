import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  RefreshControl,
} from 'react-native';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { db, auth } from '../config/firebaseConfig';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
  doc,
  getDoc,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const { width, height } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [totalAnnouncements, setTotalAnnouncements] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    let unsubscribers = [];

    // Wait for auth state before fetching data
    const unsubscribeAuth = onAuthStateChanged(auth, async user => {
      if (user) {
        setIsAuthenticated(true);

        // Fetch user's first name from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const firstName = userData.firstName || userData.displayName?.split(' ')[0] || 'User';
            setUserName(firstName);
          } else {
            setUserName(user.displayName?.split(' ')[0] || 'User');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserName('User');
        }

        unsubscribers = fetchRecentData();
      } else {
        // User logged out, cleanup all listeners
        if (unsubscribers && unsubscribers.length > 0) {
          unsubscribers.forEach(unsub => unsub && unsub());
          unsubscribers = [];
        }
        setIsAuthenticated(false);
        setRecentUpdates([]);
        setTotalTasks(0);
        setTotalAnnouncements(0);
        setTotalPosts(0);
        setLoading(false);
        navigation.replace('Login');
      }
    });

    return () => {
      if (unsubscribers && unsubscribers.length > 0) {
        unsubscribers.forEach(unsub => unsub && unsub());
      }
      unsubscribeAuth();
    };
  }, []);

  const fetchRecentData = () => {
    // Only fetch if user is authenticated
    if (!auth.currentUser) {
      console.log('No authenticated user, skipping data fetch');
      setLoading(false);
      return [];
    }

    try {
      const unsubscribers = [];
      let taskUpdates = [];
      let announcementUpdates = [];
      let postUpdates = [];
      const now = new Date();

      const combineAndSortUpdates = () => {
        const combined = [...taskUpdates, ...announcementUpdates, ...postUpdates];
        combined.sort((a, b) => {
          const aTime = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
          const bTime = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
          return bTime - aTime;
        });
        setRecentUpdates(combined.slice(0, 5));
        setLoading(false);
      };

      // Fetch ALL tasks to get correct count
      const allTasksQuery = query(collection(db, 'tasks'));
      const unsubAllTasks = onSnapshot(allTasksQuery, snapshot => {
        let pendingCount = 0;
        snapshot.forEach(doc => {
          const data = doc.data();
          const isCompletedByCurrentUser =
            auth.currentUser && data.completedBy && data.completedBy.includes(auth.currentUser.uid);
          if (!isCompletedByCurrentUser) {
            pendingCount++;
          }
        });
        setTotalTasks(pendingCount);
      });
      unsubscribers.push(unsubAllTasks);

      // Fetch ALL announcements to get correct count
      const allAnnouncementsQuery = query(collection(db, 'announcements'));
      const unsubAllAnnouncements = onSnapshot(allAnnouncementsQuery, snapshot => {
        let activeCount = 0;
        snapshot.forEach(doc => {
          const data = doc.data();
          const expiresAt = data.expiresAt?.toDate
            ? data.expiresAt.toDate()
            : new Date(data.expiresAt);
          if (expiresAt > now) {
            activeCount++;
          }
        });
        setTotalAnnouncements(activeCount);
      });
      unsubscribers.push(unsubAllAnnouncements);

      // Fetch ALL freedom wall posts to get correct count
      const allPostsQuery = query(collection(db, 'freedom-wall-posts'));
      const unsubAllPosts = onSnapshot(allPostsQuery, snapshot => {
        let activeCount = 0;
        snapshot.forEach(doc => {
          const data = doc.data();
          const expiresAt = data.expiresAt?.toDate
            ? data.expiresAt.toDate()
            : new Date(data.expiresAt);
          if (expiresAt > now) {
            activeCount++;
          }
        });
        setTotalPosts(activeCount);
      });
      unsubscribers.push(unsubAllPosts);

      // Fetch recent tasks for feed
      const tasksQuery = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'), limit(10));

      const unsubTasks = onSnapshot(tasksQuery, snapshot => {
        taskUpdates = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          const isCompletedByCurrentUser =
            auth.currentUser && data.completedBy && data.completedBy.includes(auth.currentUser.uid);

          if (!isCompletedByCurrentUser && data.createdAt) {
            taskUpdates.push({
              id: doc.id,
              ...data,
              type: 'task',
              timestamp: data.createdAt,
            });
          }
        });
        combineAndSortUpdates();
      });
      unsubscribers.push(unsubTasks);

      // Fetch recent announcements for feed
      const announcementsQuery = query(
        collection(db, 'announcements'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      const unsubAnnouncements = onSnapshot(announcementsQuery, snapshot => {
        announcementUpdates = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          const expiresAt = data.expiresAt?.toDate
            ? data.expiresAt.toDate()
            : new Date(data.expiresAt);
          if (expiresAt > now && data.createdAt) {
            announcementUpdates.push({
              id: doc.id,
              ...data,
              type: 'announcement',
              timestamp: data.createdAt,
            });
          }
        });
        combineAndSortUpdates();
      });
      unsubscribers.push(unsubAnnouncements);

      // Fetch recent freedom wall posts for feed
      const postsQuery = query(
        collection(db, 'freedom-wall-posts'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      const unsubPosts = onSnapshot(postsQuery, snapshot => {
        postUpdates = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          const expiresAt = data.expiresAt?.toDate
            ? data.expiresAt.toDate()
            : new Date(data.expiresAt);
          if (expiresAt > now && data.createdAt) {
            postUpdates.push({
              id: doc.id,
              ...data,
              type: 'post',
              timestamp: data.createdAt,
              likedBy: Array.isArray(data.likedBy) ? data.likedBy : [],
            });
          }
        });
        combineAndSortUpdates();
      });
      unsubscribers.push(unsubPosts);

      setLoading(false);

      return unsubscribers;
    } catch (error) {
      console.log('Error fetching data:', error);
      setLoading(false);
      return [];
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);

    // Fetch user data again
    try {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const firstName = userData.firstName || userData.displayName?.split(' ')[0] || 'User';
          setUserName(firstName);
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }

    // Data will refresh automatically through onSnapshot listeners
    // Just wait a moment for the UI to feel responsive
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = dateString => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTimestamp = timestamp => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    if (diffSecs > 0) return `${diffSecs}s ago`;
    return 'Just now';
  };

  const renderUpdateItem = item => {
    if (!item) return null;

    let icon, iconColor, title, subtitle, onPress;

    switch (item.type) {
      case 'task':
        icon = 'clipboard';
        iconColor = '#22e584';
        title = item.title || 'Untitled Task';
        subtitle = item.subjectCode || item.subject || 'Task';
        onPress = () => navigation.navigate('TaskDetail', { task: item });
        break;
      case 'announcement':
        icon = 'bell';
        const badgeColors = getBadgeColors(item.announcementType || item.type);
        iconColor = badgeColors.text;
        title = item.title || 'Untitled Announcement';
        subtitle = item.announcementType || item.type || 'General';
        onPress = () => navigation.navigate('AnnouncementDetail', { announcementId: item.id });
        break;
      case 'post':
        icon = 'message-circle';
        iconColor = '#3498DB';
        title = item.content || 'No content';
        subtitle = `${item.nickname || item.displayName || 'Anonymous'} • ${item.likedBy?.length || 0} likes`;
        onPress = () => navigation.navigate('PostDetail', { post: item });
        break;
      default:
        return null;
    }

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.updateItem}
        activeOpacity={0.7}
        onPress={onPress}
      >
        <View style={[styles.updateIcon, { backgroundColor: `${iconColor}20` }]}>
          <Feather name={icon} size={20} color={iconColor} />
        </View>
        <View style={styles.updateContent}>
          <Text style={styles.updateTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.updateSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
        <Text style={styles.updateTime}>{formatTimestamp(item.timestamp)}</Text>
      </TouchableOpacity>
    );
  };

  const getBadgeColors = type => {
    switch (type) {
      case 'Critical':
        return { bg: 'rgba(239, 68, 68, 0.2)', text: '#EF4444' }; // Red
      case 'Event':
        return { bg: 'rgba(139, 92, 246, 0.2)', text: '#8B5CF6' }; // Purple
      case 'Reminder':
        return { bg: 'rgba(251, 191, 36, 0.2)', text: '#FBBF24' }; // Yellow/Amber
      case 'General':
      default:
        return { bg: 'rgba(34, 229, 132, 0.2)', text: '#22e584' }; // Green
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1B2845', '#23243a', '#22305a', '#3a5a8c', '#23243a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1B2845', '#23243a', '#22305a', '#3a5a8c', '#23243a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName} numberOfLines={1}>
            {userName}
          </Text>
          <Text style={styles.subGreeting}>Here's what's new</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('AccountSettings')}
        >
          <Feather name="settings" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalTasks}</Text>
          <Text style={styles.statLabel}>Tasks</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalAnnouncements}</Text>
          <Text style={styles.statLabel}>News</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalPosts}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
      </View>

      {/* Recent Updates Feed */}
      <ScrollView
        style={styles.feedContainer}
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#22e584"
            colors={['#22e584']}
            progressBackgroundColor="rgba(255, 255, 255, 0.1)"
          />
        }
      >
        {recentUpdates.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Updates</Text>
            <View style={styles.updatesContainer}>{recentUpdates.map(renderUpdateItem)}</View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Feather name="inbox" size={64} color="rgba(255, 255, 255, 0.3)" />
            <Text style={styles.emptyStateText}>Nothing to show yet</Text>
            <Text style={styles.emptyStateSubtext}>Check back later for updates</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1c2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontFamily: 'Inter_500Medium',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
  },
  userName: {
    fontSize: 28,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(34, 229, 132, 0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34, 229, 132, 0.2)',
    minWidth: 0,
  },
  statNumber: {
    fontSize: 22,
    fontFamily: 'Inter_600SemiBold',
    color: '#22e584',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  feedContainer: {
    flex: 1,
  },
  feedContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 19,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  updatesContainer: {
    gap: 8,
  },
  updateItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  updateIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateContent: {
    flex: 1,
    gap: 4,
  },
  updateTitle: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  updateSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  updateTime: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: 'rgba(255, 255, 255, 0.5)',
    flexShrink: 0,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
});
