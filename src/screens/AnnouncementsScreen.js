import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
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
        style={styles.announcementCard}
        onPress={() => navigation.navigate('AnnouncementDetail', { announcementId: item.id })}
      >
        <View style={styles.cardMain}>
          <View style={styles.cardLeft}>
            <View style={styles.authorPicture}>
              <Text style={styles.authorInitial}>
                {item.authorName ? item.authorName.charAt(0).toUpperCase() : 'A'}
              </Text>
            </View>
          </View>
          
          <View style={styles.cardRight}>
            <View style={styles.cardHeader}>
              <View style={styles.authorContainer}>
                <Text style={styles.authorName}>{item.authorName || 'Anonymous'}</Text>
              </View>
              <View style={styles.cardMeta}>
                <Text style={styles.timestamp}>{formatTimestamp(item.createdAt)}</Text>
                <View style={[styles.typeChip, { backgroundColor: getTypeColor(item.type) }]}>
                  <Text style={styles.typeChipText}>{item.type || 'General'}</Text>
                </View>
              </View>
            </View>
            
            <Text style={styles.title}>{item.title}</Text>
            
            <Text style={styles.expiryText}>{getTimeRemaining(item.expiresAt)}</Text>
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
            style={styles.archiveButton}
            onPress={() => navigation.navigate('ArchivedAnnouncements')}
          >
            <Feather name="archive" size={20} color="#FFFFFF" />
            <Text style={styles.archiveButtonText}>Archive</Text>
          </TouchableOpacity>
          
          {userRole === 'officer' && (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => navigation.navigate('CreateAnnouncement')}
            >
              <Feather name="plus" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>New</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {initialLoad ? (
        <View style={styles.listContainer}>
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
          contentContainerStyle={styles.listContainer}
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
  headerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  announcementCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  cardMain: {
    flexDirection: 'row',
    gap: 12,
  },
  cardLeft: {
    alignItems: 'center',
  },
  cardRight: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorPicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  authorInitial: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  authorContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  authorName: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  timestamp: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    lineHeight: 20,
  },
  typeChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeChipText: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  expiryText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#FF9500',
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
  backButton: {
    padding: 8,
    marginRight: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    flex: 1,
  },
  archiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  archiveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    gap: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
  },
});