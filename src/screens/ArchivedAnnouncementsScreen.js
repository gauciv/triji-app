import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Feather } from '@expo/vector-icons';
import { db } from '../config/firebaseConfig';
import { collection, query, orderBy, where, onSnapshot } from 'firebase/firestore';

export default function ArchivedAnnouncementsScreen({ navigation }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const q = query(
        collection(db, 'announcements'),
        where('expiresAt', '<=', new Date()),
        orderBy('expiresAt', 'desc')
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
      }, (error) => {
        console.log('Error fetching archived announcements:', error);
        setError('Could not load archived announcements. Please check your internet connection.');
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.log('Error setting up archived announcements fetch:', error);
      setError('Could not load archived announcements. Please check your internet connection.');
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

  const renderAnnouncement = ({ item }) => {
    return (
      <TouchableOpacity 
        style={[styles.announcementCard, { borderLeftColor: getTypeColor(item.type) }]}
        onPress={() => navigation.navigate('AnnouncementDetail', { announcementId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.authorPicture}>
            <Text style={styles.authorInitial}>
              {item.authorName ? item.authorName.charAt(0).toUpperCase() : 'A'}
            </Text>
          </View>
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{item.authorName || 'Anonymous'}</Text>
            <Text style={styles.timestamp}>{formatTimestamp(item.createdAt)}</Text>
            <Text style={styles.expiredText}>Expired</Text>
            <View style={[styles.typeChip, { backgroundColor: getTypeColor(item.type) }]}>
              <Text style={styles.typeChipText}>{item.type || 'General'}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.cardBody}>
          <Text style={styles.title}>{item.title}</Text>
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
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Archived Announcements</Text>
        </View>
      </View>
      
      {announcements.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="archive" size={64} color="#8E8E93" />
          <Text style={styles.emptyTitle}>No archived announcements</Text>
          <Text style={styles.emptyMessage}>Expired announcements will appear here</Text>
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
    borderLeftWidth: 4,
    height: 140,
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
  },
  expiredText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#FF3B30',
    marginTop: 2,
  },
  typeChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  typeChipText: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardBody: {
    paddingLeft: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
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
});