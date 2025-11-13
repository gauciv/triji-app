import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Platform, Modal } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, db } from '../config/firebaseConfig';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';

export default function AnnouncementDetailScreen({ route, navigation }) {
  const { announcementId } = route.params || {};
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState(null);
  
  // Safety check
  useEffect(() => {
    if (!announcementId) {
      setError('Announcement not found');
      setLoading(false);
    }
  }, [announcementId]);

  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch announcement
      const docRef = doc(db, 'announcements', announcementId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setAnnouncement({
          id: docSnap.id,
          ...docSnap.data(),
        });
      } else {
        setError('Announcement not found.');
      }
    } catch (error) {
      console.log('Error fetching data:', error);
      setError('Could not load announcement. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    try {
      await deleteDoc(doc(db, 'announcements', announcementId));
      navigation.navigate('Announcements');
    } catch (error) {
      console.log('Error deleting announcement:', error);
    }
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

  if (!announcement) {
    return (
      <View style={styles.container}>
        <View style={styles.backgroundGradient} />
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
        style={styles.shiningGradient}
      />
      {/* Header: Only back button, styled as floating glassy button */}
      <View style={styles.headerModernPolished}>
        <TouchableOpacity style={styles.floatingBackButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContainerPolished}>
        <View style={[
          styles.cardModernPolished,
          { borderLeftColor: getTypeColor(announcement.type), boxShadow: Platform.OS === 'web' ? `0px 8px 32px 0px ${getTypeColor(announcement.type)}22` : undefined },
        ]}>
          <View style={styles.cardAccentBar} />
          <View style={styles.cardContentModernPolished}>
            <View style={styles.cardHeaderModernPolished}>
              <View style={styles.authorPictureModernPolished}>
                <Text style={styles.authorInitialModernPolished}>
                  {announcement.authorName ? announcement.authorName.charAt(0).toUpperCase() : 'A'}
                </Text>
              </View>
              <Text style={styles.authorNameModernPolished}>{announcement.authorName || 'Anonymous'}</Text>
              {auth.currentUser && announcement.authorId === auth.currentUser.uid && (
                <TouchableOpacity style={styles.deleteButtonModern} onPress={handleDelete}>
                  <Feather name="trash-2" size={20} color="#FF3B30" />
                </TouchableOpacity>
              )}
            </View>
            {/* Title styled like the list */}
            <Text style={styles.titleModernPolished}>{announcement.title}</Text>
            <View style={styles.cardMetaModernPolished}>
              <View style={[styles.typeChipModernPolished, { backgroundColor: getTypeColor(announcement.type) + '22', borderColor: getTypeColor(announcement.type) + '55' }]}> 
                <Text style={[styles.typeChipTextModernPolished, { color: getTypeColor(announcement.type) }]}>{announcement.type || 'General'}</Text>
              </View>
              <Text style={styles.timestampModernPolished}>{formatTimestamp(announcement.createdAt)}</Text>
              <Text style={styles.expiryTextModernPolished}>Expires {announcement.expiresAt && (announcement.expiresAt.toDate ? announcement.expiresAt.toDate().toLocaleDateString() : new Date(announcement.expiresAt).toLocaleDateString())}</Text>
            </View>
            <Text style={styles.contentModernPolished}>{announcement.content}</Text>
          </View>
        </View>
      </ScrollView>
      {/* Modal remains unchanged */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Delete Announcement</Text>
            <Text style={styles.modalMessage}>Are you sure you want to delete this announcement?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.deleteConfirmButton}
                onPress={confirmDelete}
              >
                <Text style={styles.deleteConfirmButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  shiningGradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  scrollContainerPolished: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: 'rgba(30, 32, 40, 0.55)',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.13)',
    borderLeftWidth: 5,
    marginBottom: 28,
    marginTop: 4,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  authorPicture: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 2,
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
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: '85%',
    maxWidth: 350,
    backgroundColor: 'rgba(18, 18, 18, 0.95)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
  },
  deleteConfirmButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteConfirmButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
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
  headerModern: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 32,
    paddingBottom: 18,
    backgroundColor: 'transparent',
    position: 'relative',
    zIndex: 2,
    minHeight: 80,
  },
  backButtonModern: {
    position: 'absolute',
    left: 18,
    top: 32,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(30,32,40,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.13)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  headerTitleModern: {
    fontSize: 32, // Larger for prominence
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
    letterSpacing: 0.2,
    marginLeft: 0,
    marginRight: 0,
  },
  cardModernPolished: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: 'rgba(30, 32, 40, 0.65)',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.13)',
    borderLeftWidth: 7,
    marginBottom: 20,
    marginTop: 4,
    elevation: 10,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    backdropFilter: 'blur(18px)', // web only
    shadowColor: '#22e584',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    overflow: 'hidden',
  },
  cardAccentBar: {
    width: 7,
    backgroundColor: 'transparent', // color set by borderLeftColor
    borderTopLeftRadius: 22,
    borderBottomLeftRadius: 22,
  },
  cardContentModernPolished: {
    flex: 1,
    padding: 20,
  },
  cardHeaderModernPolished: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  authorPictureModernPolished: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 6,
    elevation: 1,
  },
  authorInitialModernPolished: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
  authorNameModernPolished: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: '#fff',
    opacity: 0.85,
    flexWrap: 'wrap',
    maxWidth: 120,
  },
  deleteButtonModern: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    marginLeft: 'auto',
  },
  titleModernPolished: {
    fontSize: 22,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
    marginBottom: 12,
    lineHeight: 30,
    flexWrap: 'wrap',
  },
  cardMetaModernPolished: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 2,
    marginBottom: 12,
  },
  typeChipModernPolished: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 2,
    marginBottom: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
  },
  typeChipTextModernPolished: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timestampModernPolished: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    opacity: 0.8,
    marginLeft: 2,
  },
  expiryTextModernPolished: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#FF9500',
    opacity: 0.9,
    marginLeft: 2,
  },
  contentModernPolished: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#fff',
    lineHeight: 26,
    marginTop: 12,
    opacity: 0.95,
  },
  headerModernPolished: {
    paddingTop: Platform.OS === 'ios' ? 50 : 32,
    paddingBottom: 12,
    paddingHorizontal: 18,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  floatingBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(30,32,40,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.13)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  scrollContainerPolished: {
    padding: 24,
    paddingBottom: 40,
    paddingTop: 10,
  },
});