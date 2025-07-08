import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert, Share, Modal, TextInput, ScrollView } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { db } from '../config/firebaseConfig';
import { doc, runTransaction, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../config/firebaseConfig';
import * as Clipboard from 'expo-clipboard';

export default function PostDetailScreen({ route, navigation }) {
  const { post } = route.params;
  const [countdown, setCountdown] = useState('');
  const [currentPost, setCurrentPost] = useState(post);
  const [showCopied, setShowCopied] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const animatedValue = new Animated.Value(0);

  const isLiked = currentPost.likedBy?.includes(auth.currentUser?.uid) || false;

  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    // Countdown timer
    const calculateCountdown = () => {
      if (!post.expiresAt) return;
      
      const now = new Date();
      const expiresAt = post.expiresAt.toDate ? post.expiresAt.toDate() : new Date(post.expiresAt);
      const timeDiff = expiresAt.getTime() - now.getTime();
      
      if (timeDiff <= 0) {
        setCountdown('This note has expired');
        return;
      }
      
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) {
        setCountdown(`This note will disappear in ${days} days, ${hours} hours`);
      } else {
        setCountdown(`This note will disappear in ${hours} hours`);
      }
    };
    
    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    
    // Background animation
    const animate = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 8000,
            useNativeDriver: false,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 8000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    };
    
    animate();
    
    // Track view count
    const trackView = async () => {
      const user = auth.currentUser;
      if (!user || !post.id) return;
      
      const viewedBy = post.viewedBy || [];
      const hasViewed = viewedBy.includes(user.uid);
      
      if (!hasViewed) {
        try {
          const postRef = doc(db, 'freedom-wall-posts', post.id);
          
          await runTransaction(db, async (transaction) => {
            const postDoc = await transaction.get(postRef);
            if (!postDoc.exists()) return;
            
            const data = postDoc.data();
            const currentViewCount = data.viewCount || 0;
            const currentViewedBy = data.viewedBy || [];
            
            transaction.update(postRef, {
              viewCount: currentViewCount + 1,
              viewedBy: [...currentViewedBy, user.uid]
            });
          });
        } catch (error) {
          console.log('Error tracking view:', error);
        }
      }
    };
    
    trackView();
    
    return () => clearInterval(interval);
  }, [post.expiresAt, post.id]);

  const handleLike = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const postRef = doc(db, 'freedom-wall-posts', post.id);
      
      await runTransaction(db, async (transaction) => {
        const postDoc = await transaction.get(postRef);
        if (!postDoc.exists()) return;
        
        const data = postDoc.data();
        const likedBy = data.likedBy || [];
        const currentLikeCount = data.likeCount || 0;
        const userHasLiked = likedBy.includes(user.uid);
        
        let newLikedBy, newLikeCount;
        
        if (userHasLiked) {
          // Unlike
          newLikeCount = Math.max(0, currentLikeCount - 1);
          newLikedBy = likedBy.filter(id => id !== user.uid);
        } else {
          // Like
          newLikeCount = currentLikeCount + 1;
          newLikedBy = [...likedBy, user.uid];
        }
        
        transaction.update(postRef, {
          likeCount: newLikeCount,
          likedBy: newLikedBy
        });
        
        // Update local state
        setCurrentPost(prev => ({
          ...prev,
          likeCount: newLikeCount,
          likedBy: newLikedBy
        }));
      });
    } catch (error) {
      console.log('Error updating like:', error);
      Alert.alert('Error', 'Failed to update like. Please try again.');
    }
  };

  const handleCopyText = async () => {
    try {
      await Clipboard.setStringAsync(post.content);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy text.');
    }
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: post.content,
        title: 'Shared from Freedom Wall'
      });
      console.log('Share result:', result);
    } catch (error) {
      console.log('Share error:', error);
      Alert.alert('Error', 'Failed to share text.');
    }
  };

  const handleSubmitReport = async () => {
    const user = auth.currentUser;
    if (!user || !selectedReason) return;

    setSubmitting(true);
    try {
      // Add report to reports collection
      await addDoc(collection(db, 'reports'), {
        postId: post.id,
        postContent: post.content,
        reason: selectedReason,
        description: description.trim(),
        reporterId: user.uid,
        reportedAt: serverTimestamp()
      });

      // Update post with reportedBy array
      const postRef = doc(db, 'freedom-wall-posts', post.id);
      const reportedBy = post.reportedBy || [];
      await updateDoc(postRef, {
        reportedBy: [...reportedBy, user.uid]
      });

      setShowReportModal(false);
      setSelectedReason('');
      setDescription('');
      
      Alert.alert(
        'Report Submitted',
        'Thank you for helping keep our community safe.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.log('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getGradientColors = () => {
    const baseColor = post.noteColor || '#FFFACD';
    return [baseColor + '20', baseColor + '10', baseColor + '05'];
  };

  const animatedStyle = {
    transform: [
      {
        translateX: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [-50, 50],
        }),
      },
      {
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [-30, 30],
        }),
      },
    ],
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Note Details</Text>
        <TouchableOpacity 
          style={styles.moreButton}
          onPress={() => {
            const user = auth.currentUser;
            const reportedBy = post.reportedBy || [];
            
            if (user && reportedBy.includes(user.uid)) {
              Alert.alert('Already Reported', 'You have already reported this post.');
            } else {
              setShowReportModal(true);
            }
          }}
        >
          <Feather name="alert-triangle" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.noteContainer}>
          <View style={styles.noteWrapper}>
            <View style={[styles.postCard, { backgroundColor: post.noteColor || '#FFFACD' }]}>
              <View style={styles.personaContainer}>
                <View style={[styles.personaDot, { backgroundColor: post.personaColor || '#34C759' }]} />
                <Text style={[styles.personaText, { color: post.personaColor || '#34C759' }]}>
                  {post.persona || 'Anonymous'}
                </Text>
              </View>
              
              <Text style={styles.postText}>{post.content}</Text>
            </View>
            
            <View style={styles.seenCounter}>
              <Feather name="eye" size={12} color="#666666" />
              <Text style={styles.seenCount}>{currentPost.viewCount || 0}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={styles.likeButton}
            onPress={handleLike}
          >
            <Text style={[styles.heartIcon, isLiked && styles.heartLiked]}>♥</Text>
            <Text style={styles.likeCount}>{currentPost.likeCount || 0}</Text>
          </TouchableOpacity>
          
          {countdown && (
            <View style={styles.countdownContainer}>
              <Feather name="clock" size={20} color="#FF6B35" />
              <Text style={styles.countdownText}>{countdown}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.utilityButtons}>
          <TouchableOpacity 
            style={[styles.utilityButton, showCopied && styles.copiedButton]}
            onPress={handleCopyText}
          >
            <Feather name={showCopied ? "check" : "copy"} size={18} color={showCopied ? "#34C759" : "#FFFFFF"} />
            <Text style={[styles.utilityButtonText, showCopied && styles.copiedText]}>
              {showCopied ? 'Copied!' : 'Copy Text'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.utilityButton}
            onPress={handleShare}
          >
            <Feather name="share" size={18} color="#FFFFFF" />
            <Text style={styles.utilityButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Report Modal */}
      <Modal
        visible={showReportModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={styles.reportModalContainer}>
          <View style={styles.reportHeader}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowReportModal(false)}
            >
              <Feather name="x" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.reportTitle}>Report Post</Text>
          </View>
          
          <ScrollView style={styles.reportContent}>
            <Text style={styles.sectionTitle}>Please select a reason:</Text>
            
            {['Spam', 'Harassment or Hate Speech', 'Personal Information', 'Inappropriate Content'].map((reason) => (
              <TouchableOpacity
                key={reason}
                style={[
                  styles.reasonOption,
                  selectedReason === reason && styles.reasonOptionSelected
                ]}
                onPress={() => setSelectedReason(reason)}
              >
                <Text style={[
                  styles.reasonText,
                  selectedReason === reason && styles.reasonTextSelected
                ]}>
                  {reason}
                </Text>
                {selectedReason === reason && (
                  <Feather name="check" size={16} color="#FF3B30" />
                )}
              </TouchableOpacity>
            ))}
            
            <Text style={styles.sectionTitle}>Additional Description (Optional):</Text>
            <TextInput
              style={styles.descriptionInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Provide more details about this report..."
              placeholderTextColor="#8E8E93"
              multiline
              textAlignVertical="top"
              maxLength={200}
            />
            
            <TouchableOpacity 
              style={[
                styles.submitButton,
                (!selectedReason || submitting) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmitReport}
              disabled={!selectedReason || submitting}
            >
              <Text style={styles.submitButtonText}>
                {submitting ? 'Submitting...' : 'Submit Report'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  noteContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  noteWrapper: {
    position: 'relative',
    width: '100%',
  },
  postCard: {
    width: '100%',
    minHeight: 300,
    borderRadius: 16,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  personaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  personaDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  personaText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    fontWeight: '600',
  },
  postText: {
    fontSize: 20,
    fontFamily: 'Inter_400Regular',
    color: '#2C2C2C',
    lineHeight: 30,
    letterSpacing: 0.4,
    flex: 1,
    marginVertical: 20,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    gap: 12,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  heartIcon: {
    fontSize: 18,
    color: '#8E8E93',
    marginRight: 6,
  },
  heartLiked: {
    color: '#FF3B30',
  },
  likeCount: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  countdownContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.3)',
    marginLeft: 8,
  },
  countdownText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#FF6B35',
    marginLeft: 6,
    flexShrink: 1,
  },
  utilityButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  utilityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  utilityButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
  },
  copiedButton: {
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(52, 199, 89, 0.4)',
  },
  copiedText: {
    color: '#34C759',
  },
  seenCounter: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  seenCount: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#666666',
  },
  reportModalContainer: {
    flex: 1,
    backgroundColor: '#2A2A2A',
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  reportTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginRight: 56,
  },
  reportContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
    marginBottom: 16,
    marginTop: 20,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  reasonOptionSelected: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderColor: '#FF3B30',
  },
  reasonText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
  },
  reasonTextSelected: {
    color: '#FF3B30',
    fontFamily: 'Inter_500Medium',
  },
  descriptionInput: {
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 30,
  },
  submitButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: '#666666',
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
});