import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { db } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export default function AnnouncementDetailScreen({ route }) {
  const { announcementId } = route.params;
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);

  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const docRef = doc(db, 'announcements', announcementId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setAnnouncement({
            id: docSnap.id,
            ...docSnap.data(),
          });
        }
      } catch (error) {
        console.log('Error fetching announcement:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [announcementId]);

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
    const postTime = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return postTime.toLocaleDateString() + ' at ' + postTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

  if (!announcement) {
    return (
      <View style={styles.container}>
        <View style={styles.backgroundGradient} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Announcement not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGradient} />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={[styles.card, { borderLeftColor: getTypeColor(announcement.type) }]}>
          <View style={styles.header}>
            <View style={styles.authorPicture}>
              <Text style={styles.authorInitial}>
                {announcement.authorName ? announcement.authorName.charAt(0).toUpperCase() : 'A'}
              </Text>
            </View>
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{announcement.authorName || 'Anonymous'}</Text>
              <Text style={styles.timestamp}>{formatTimestamp(announcement.createdAt)}</Text>
              <Text style={styles.typeLabel}>{announcement.type || 'General'}</Text>
            </View>
          </View>
          
          <Text style={styles.title}>{announcement.title}</Text>
          <Text style={styles.content}>{announcement.content}</Text>
        </View>
      </ScrollView>
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
  scrollContainer: {
    padding: 24,
    paddingTop: 60,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  authorPicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  authorInitial: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
    lineHeight: 32,
  },
  content: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
    lineHeight: 24,
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