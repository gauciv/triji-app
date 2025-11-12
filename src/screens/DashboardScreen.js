import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { db, auth } from '../config/firebaseConfig';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const { width, height } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [freedomWallPosts, setFreedomWallPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    // Wait for auth state before fetching data
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUserName(user.displayName || user.email || 'User');
        fetchRecentData();
      } else {
        setIsAuthenticated(false);
        setLoading(false);
        navigation.replace('Login');
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const fetchRecentData = () => {
    // Only fetch if user is authenticated
    if (!auth.currentUser) {
      console.log('No authenticated user, skipping data fetch');
      setLoading(false);
      return;
    }

    try {
      // Fetch latest tasks (max 5)
      const tasksQuery = query(
        collection(db, 'tasks'),
        orderBy('deadline', 'asc'),
        limit(5)
      );
      
      const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
        const tasksList = [];
        snapshot.forEach((doc) => {
          tasksList.push({ id: doc.id, ...doc.data(), source: 'tasks' });
        });
        setTasks(tasksList);
      }, (error) => {
        console.error('Error fetching tasks:', error);
        setLoading(false);
      });

      // Fetch latest announcements (max 5)
      const now = new Date();
      const announcementsQuery = query(
        collection(db, 'announcements'),
        orderBy('createdAt', 'desc'),
        limit(5)
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

      // Fetch latest freedom wall posts (max 5)
      const postsQuery = query(
        collection(db, 'freedom-wall-posts'),
        orderBy('createdAt', 'desc'),
        limit(5)
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

      return () => {
        unsubTasks();
        unsubAnnouncements();
        unsubPosts();
      };
    } catch (error) {
      console.log('Error fetching data:', error);
      setLoading(false);
    }
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
      <View 
        key={task.id}
        style={styles.feedItem}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.cardBadge}>
              <Text style={styles.cardBadgeText}>{task.subjectCode || 'N/A'}</Text>
            </View>
            <Text style={styles.cardDate}>{formatDate(task.deadline)}</Text>
          </View>
          <Text style={styles.cardTitle} numberOfLines={2}>{task.title || 'Untitled Task'}</Text>
          {task.description && (
            <Text style={styles.cardDescription} numberOfLines={2}>{task.description}</Text>
          )}
        </View>
        <TouchableOpacity style={styles.viewDetailsButton} activeOpacity={0.7}>
          <Text style={styles.viewDetailsText}>View Details</Text>
          <Feather name="chevron-right" size={16} color="#22e584" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderAnnouncementItem = (announcement) => {
    if (!announcement) return null;
    
    return (
      <View 
        key={announcement.id}
        style={styles.feedItem}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardBadge, { backgroundColor: 'rgba(255, 107, 53, 0.2)' }]}>
              <Text style={[styles.cardBadgeText, { color: '#FF6B35' }]}>{announcement.type || 'Info'}</Text>
            </View>
            <Text style={styles.cardDate}>{formatTimestamp(announcement.createdAt)}</Text>
          </View>
          <Text style={styles.cardTitle} numberOfLines={2}>{announcement.title || 'Untitled'}</Text>
          {announcement.content && (
            <Text style={styles.cardDescription} numberOfLines={2}>{announcement.content}</Text>
          )}
        </View>
        <TouchableOpacity 
          style={styles.viewDetailsButton} 
          activeOpacity={0.7}
          onPress={() => navigation.navigate('AnnouncementDetail', { announcementId: announcement.id })}
        >
          <Text style={styles.viewDetailsText}>View Details</Text>
          <Feather name="chevron-right" size={16} color="#22e584" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderFreedomWallItem = (post) => {
    if (!post) return null;
    
    return (
      <View 
        key={post.id}
        style={styles.feedItem}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardBadge, { backgroundColor: 'rgba(52, 152, 219, 0.2)' }]}>
              <Text style={[styles.cardBadgeText, { color: '#3498DB' }]}>
                {post.nickname || post.displayName || 'Anonymous'}
              </Text>
            </View>
            <Text style={styles.cardDate}>{formatTimestamp(post.createdAt)}</Text>
          </View>
          <Text style={styles.cardTitle} numberOfLines={3}>{post.content || 'No content'}</Text>
          <View style={styles.postFooter}>
            {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
              <Text style={styles.firstTag}>#{post.tags[0]}</Text>
            )}
            <View style={styles.likeCount}>
              <Feather name="heart" size={14} color="rgba(255, 255, 255, 0.5)" />
              <Text style={styles.likeCountText}>{post.likeCount || 0}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.viewDetailsButton} 
          activeOpacity={0.7}
          onPress={() => navigation.navigate('PostDetail', { post: post })}
        >
          <Text style={styles.viewDetailsText}>View Details</Text>
          <Feather name="chevron-right" size={16} color="#22e584" />
        </TouchableOpacity>
      </View>
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
          {items.slice(0, 5).map(renderItem)}
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
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
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
          <Text style={styles.statLabel}>Announcements</Text>
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
      >
        {renderSection(
          'Upcoming Tasks',
          tasks,
          renderTaskItem,
          'No tasks available',
          () => navigation.navigate('Tasks')
        )}

        {renderSection(
          'Recent Announcements',
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
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  greeting: {
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
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
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
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: 12,
  },
  cardContent: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardBadge: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
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
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    lineHeight: 21,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  likeCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  likeCountText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  viewDetailsText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: '#22e584',
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