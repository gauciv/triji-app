import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Feather } from '@expo/vector-icons';
import { auth, db } from '../config/firebaseConfig';
import { collection, query, orderBy, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import AnnouncementCardSkeleton from '../components/AnnouncementCardSkeleton';

export default function AnnouncementsScreen({ navigation }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [error, setError] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  const windowWidth = Dimensions.get('window').width;
  const isSmallScreen = windowWidth < 400;

  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch user role
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role || '');
        }
      }

      // Set up announcements listener
      const q = query(
        collection(db, 'announcements'),
        where('expiresAt', '>', new Date()),
        orderBy('expiresAt', 'asc'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const announcementsList = [];
        querySnapshot.forEach((doc) => {
          announcementsList.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        setAnnouncements(announcementsList);
        setLoading(false);
        setInitialLoad(false);
      }, (error) => {
        console.log('Error fetching announcements:', error);
        setError('Could not load announcements. Please check your internet connection.');
        setLoading(false);
        setInitialLoad(false);
      });

      return unsubscribe;
    } catch (error) {
      console.log('Error setting up data fetch:', error);
      setError('Could not load announcements. Please check your internet connection.');
      setLoading(false);
    }
  };

  useEffect(() => {
    let unsubscribe;
    fetchData().then((unsub) => {
      unsubscribe = unsub;
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const getTypeColor = (type) => {
    switch (type) {
      case 'Critical': return '#FF3B30';
      case 'Event': return '#AF52DE';
      case 'Reminder': return '#FF9500';
      default: return '#007AFF';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const postTime = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffMs = now - postTime;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return 'Just now';
  };

  const getTimeRemaining = (expiresAt) => {
    if (!expiresAt) return '';
    const now = new Date();
    const expiry = expiresAt.toDate ? expiresAt.toDate() : new Date(expiresAt);
    const diffMs = expiry - now;
    
    if (diffMs <= 0) return 'Expired';
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) return `${diffDays}d remaining`;
    if (diffHours > 0) return `${diffHours}h remaining`;
    return 'Expires soon';
  };

  const renderAnnouncement = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.announcementCardModern}
        activeOpacity={0.88}
        onPress={() => navigation.navigate('AnnouncementDetail', { announcementId: item.id })}
      >
        <View style={styles.cardMainModern}>
          <View style={styles.cardLeftModern}>
            <View style={styles.authorPictureModern}>
              <Text style={styles.authorInitialModern}>
                {item.authorName ? item.authorName.charAt(0).toUpperCase() : 'A'}
              </Text>
            </View>
            <Text style={styles.authorNameModern}>{item.authorName || 'Anonymous'}</Text>
          </View>
          <View style={styles.cardRightModern}>
            <Text style={styles.titleModern}>{item.title}</Text>
            <View style={styles.cardMetaModern}>
              <View style={[styles.typeChipModern, { backgroundColor: getTypeColor(item.type) + '22' }]}> 
                <Text style={[styles.typeChipTextModern, { color: getTypeColor(item.type) }]}>{item.type || 'General'}</Text>
              </View>
              <Text style={styles.timestampModern}>{formatTimestamp(item.createdAt)}</Text>
              <Text style={styles.expiryTextModern}>{getTimeRemaining(item.expiresAt)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.container}>
        <View style={styles.backgroundGradient} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.backgroundGradient} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGradient} />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Announcements</Text>
        </View>
        <View style={styles.headerBottom}>
          <TouchableOpacity 
            style={styles.archiveButtonGhost}
            onPress={() => navigation.navigate('ArchivedAnnouncements')}
          >
            <Feather name="archive" size={20} color="#007AFF" />
            <Text style={styles.archiveButtonTextGhost}>Archive</Text>
          </TouchableOpacity>
          {userRole === 'officer' && (
            <TouchableOpacity 
              style={styles.addButtonModern}
              onPress={() => navigation.navigate('CreateAnnouncement')}
            >
              <Feather name="plus" size={18} color="#FFFFFF" />
              <Text style={styles.addButtonTextModern}>New</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {initialLoad ? (
        <View style={styles.listContainerModern}>
          <AnnouncementCardSkeleton />
          <AnnouncementCardSkeleton />
          <AnnouncementCardSkeleton />
          <AnnouncementCardSkeleton />
        </View>
      ) : announcements.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="bell" size={64} color="#8E8E93" />
          <Text style={styles.emptyTitle}>No announcements yet</Text>
          <Text style={styles.emptyMessage}>Check back soon!</Text>
        </View>
      ) : (
        <FlatList
          data={announcements}
          renderItem={renderAnnouncement}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainerModern}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#007AFF',
    opacity: 0.05,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  archiveButtonGhost: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0,0,0,0.08)',
    gap: 8,
  },
  archiveButtonTextGhost: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#007AFF',
    fontWeight: '600',
  },
  addButtonModern: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    gap: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonTextModern: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
  },
  listContainerModern: {
    paddingHorizontal: 16,
    paddingTop: 24, // more margin from header
    paddingBottom: 48,
    alignItems: 'stretch',
    gap: 24,
  },
  announcementCardModern: {
    backgroundColor: 'rgba(30, 32, 40, 0.55)',
    borderRadius: 16,
    padding: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.13)',
    borderLeftWidth: 5,
    marginBottom: 0,
    marginTop: 0,
    shadowColor: '#007AFF', // blue highlight
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
    width: '100%',
    maxWidth: 700,
    alignSelf: 'center',
    minWidth: 0,
    backdropFilter: 'blur(16px)', // web only
    boxShadow: Platform.OS === 'web' ? '0px 4px 24px 0px #007AFF33' : undefined,
  },
  cardMainModern: {
    flexDirection: 'row',
    gap: 18,
    alignItems: 'flex-start',
  },
  cardLeftModern: {
    alignItems: 'center',
    marginRight: 18,
    minWidth: 70,
  },
  authorPictureModern: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 2,
  },
  authorInitialModern: {
    fontSize: 22,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    zIndex: 1,
  },
  authorNameModern: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
    marginTop: 2,
    marginBottom: 2,
    textAlign: 'center',
    opacity: 0.85,
  },
  cardRightModern: {
    flex: 1,
    minWidth: 0,
  },
  titleModern: {
    fontSize: 22,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
    marginBottom: 10,
    lineHeight: 30,
    textShadowColor: 'rgba(0,0,0,0.12)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  cardMetaModern: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 2,
  },
  typeChipModern: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    marginTop: 2,
    marginBottom: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
    boxShadow: Platform.OS === 'web' ? '0px 2px 6px rgba(0,0,0,0.18)' : undefined,
  },
  typeChipTextModern: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timestampModern: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    opacity: 0.8,
    marginLeft: 2,
  },
  expiryTextModern: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#FF9500',
    opacity: 0.9,
    marginLeft: 2,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
});