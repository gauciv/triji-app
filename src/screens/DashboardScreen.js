import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, Dimensions, RefreshControl } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { db, auth } from '../config/firebaseConfig';
import { collection, query, orderBy, limit, onSnapshot, where, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const { width, height } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [freedomWallPosts, setFreedomWallPosts] = useState([]);
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
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
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
        setTasks([]);
        setAnnouncements([]);
        setFreedomWallPosts([]);
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
      
      // Fetch latest tasks (max 3)
      const tasksQuery = query(
        collection(db, 'tasks'),
        orderBy('deadline', 'asc'),
        limit(3)
      );
      
      const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
        const tasksList = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          // Only show tasks that current user has NOT completed
          const isCompletedByCurrentUser = auth.currentUser && 
                                          data.completedBy && 
                                          data.completedBy.includes(auth.currentUser.uid);
          
          if (!isCompletedByCurrentUser) {
            tasksList.push({ id: doc.id, ...data, source: 'tasks' });
          }
        });
        setTasks(tasksList);
      }, (error) => {
        console.error('Error fetching tasks:', error);
        setLoading(false);
      });
      
      unsubscribers.push(unsubTasks);

      // Fetch latest announcements (max 3)
      const now = new Date();
      const announcementsQuery = query(
        collection(db, 'announcements'),
        orderBy('createdAt', 'desc'),
        limit(3)
      );
      
      const unsubAnnouncements = onSnapshot(announcementsQuery, (snapshot) => {
        const announcementsList = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          const expiresAt = data.expiresAt?.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt);
          if (expiresAt > now) {
            announcementsList.push({ id: doc.id, ...data, source: 'announcements' });
          }
        });
        setAnnouncements(announcementsList);
      }, (error) => {
        console.error('Error fetching announcements:', error);
        setLoading(false);
      });
      
      unsubscribers.push(unsubAnnouncements);

      // Fetch latest freedom wall posts (max 3)
      const postsQuery = query(
        collection(db, 'freedom-wall-posts'),
        orderBy('createdAt', 'desc'),
        limit(3)
      );
      
      const unsubPosts = onSnapshot(postsQuery, (snapshot) => {
        const postsList = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          const expiresAt = data.expiresAt?.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt);
          if (expiresAt > now) {
            postsList.push({ 
              id: doc.id, 
              ...data, 
              source: 'freedomwall',
              likedBy: Array.isArray(data.likedBy) ? data.likedBy : [],
              reportedBy: Array.isArray(data.reportedBy) ? data.reportedBy : [],
            });
          }
        });
        setFreedomWallPosts(postsList);
        setLoading(false);
      }, (error) => {
        console.error('Error fetching freedom wall posts:', error);
        setLoading(false);
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  const renderTaskItem = (task) => {
    if (!task) return null;
    
    return (
      <TouchableOpacity 
        key={task.id}
        style={styles.feedItem}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('Taskboard')}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardBadge}>
            <Text style={styles.cardBadgeText} numberOfLines={1}>{task.subjectCode || 'N/A'}</Text>
          </View>
          <Text style={styles.cardDate} numberOfLines={1}>{formatDate(task.deadline)}</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>{task.title || 'Untitled Task'}</Text>
      </TouchableOpacity>
    );
  };

  const getBadgeColors = (type) => {
    switch(type) {
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

  const renderAnnouncementItem = (announcement) => {
    if (!announcement) return null;
    
    const badgeColors = getBadgeColors(announcement.type);
    
    return (
      <TouchableOpacity 
        key={announcement.id}
        style={styles.feedItem}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('AnnouncementDetail', { announcementId: announcement.id })}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.cardBadge, { backgroundColor: badgeColors.bg }]}>
            <Text style={[styles.cardBadgeText, { color: badgeColors.text }]} numberOfLines={1}>
              {announcement.type || 'General'}
            </Text>
          </View>
          <Text style={styles.cardDate} numberOfLines={1}>{formatTimestamp(announcement.createdAt)}</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>{announcement.title || 'Untitled'}</Text>
      </TouchableOpacity>
    );
  };

  const renderFreedomWallItem = (post) => {
    if (!post) return null;
    
    return (
      <TouchableOpacity 
        key={post.id}
        style={styles.feedItem}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('PostDetail', { post: post })}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.cardBadge, { backgroundColor: 'rgba(52, 152, 219, 0.2)' }]}>
            <Text style={[styles.cardBadgeText, { color: '#3498DB' }]} numberOfLines={1}>
              {post.nickname || post.displayName || 'Anonymous'}
            </Text>
          </View>
          <View style={styles.likeCount}>
            <Feather name="heart" size={12} color="rgba(255, 255, 255, 0.5)" />
            <Text style={styles.likeCountText}>{post.likeCount || 0}</Text>
          </View>
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>{post.content || 'No content'}</Text>
      </TouchableOpacity>
    );
  };  const renderSection = (title, items, renderItem, emptyMessage, viewAllAction) => {
    if (items.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <TouchableOpacity onPress={viewAllAction}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.feedList}>
          {items.slice(0, 3).map(renderItem)}
        </View>
      </View>
    );
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={["#1B2845", "#23243a", "#22305a", "#3a5a8c", "#23243a"]}
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
        colors={["#1B2845", "#23243a", "#22305a", "#3a5a8c", "#23243a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName} numberOfLines={1}>{userName}</Text>
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
          <Text style={styles.statNumber}>{tasks.length}</Text>
          <Text style={styles.statLabel}>Tasks</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{announcements.length}</Text>
          <Text style={styles.statLabel}>News</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{freedomWallPosts.length}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
      </View>

      {/* Feed */}
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
        {renderSection(
          'Upcoming Tasks',
          tasks,
          renderTaskItem,
          'No tasks available',
          () => navigation.navigate('Tasks')
        )}

        {renderSection(
          'News',
          announcements,
          renderAnnouncementItem,
          'No announcements',
          () => navigation.navigate('Announcements')
        )}

        {renderSection(
          'Freedom Wall',
          freedomWallPosts,
          renderFreedomWallItem,
          'No posts yet',
          () => navigation.navigate('FreedomWall')
        )}

        {tasks.length === 0 && announcements.length === 0 && freedomWallPosts.length === 0 && (
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 19,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#22e584',
  },
  feedList: {
    gap: 0,
  },
  feedItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: 10,
    height: 72,
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardBadge: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    maxWidth: 120,
    flexShrink: 1,
  },
  cardBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: '#007AFF',
    textTransform: 'uppercase',
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  firstTag: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: '#3498DB',
  },
  cardDate: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255, 255, 255, 0.5)',
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    lineHeight: 20,
  },
  likeCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
    flexShrink: 0,
  },
  likeCountText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: 'rgba(255, 255, 255, 0.6)',
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