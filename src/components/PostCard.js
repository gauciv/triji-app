import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { Feather } from '@expo/vector-icons';

export default function PostCard({ post, timestamp, rotation, onLike, isLiked, onPress }) {
  const [countdown, setCountdown] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
  });

  useEffect(() => {
    const calculateCountdown = () => {
      if (!post.expiresAt) return;
      
      const now = new Date();
      const expiresAt = post.expiresAt.toDate ? post.expiresAt.toDate() : new Date(post.expiresAt);
      const timeDiff = expiresAt.getTime() - now.getTime();
      
      if (timeDiff <= 0) {
        setCountdown('expired');
        return;
      }
      
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) {
        setCountdown(`${days}d, ${hours}h`);
      } else {
        setCountdown(`${hours}h`);
      }
    };
    
    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, [post.expiresAt]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <TouchableOpacity 
      style={[
        styles.card, 
        { 
          transform: [{ rotate: rotation }],
          backgroundColor: post.noteColor || '#FFFACD',
          opacity: post.status === 'pending' ? 0.7 : 1
        }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        <View style={styles.personaContainer}>
          <View style={[styles.personaDot, { backgroundColor: post.personaColor || '#34C759' }]} />
          <Text style={[styles.personaText, { color: post.personaColor || '#34C759' }]}>
            {post.persona || 'Anonymous'}
          </Text>
        </View>
        
        <Text style={styles.postText} numberOfLines={4} ellipsizeMode="tail">
          {post.content}
        </Text>
        
        <View style={styles.cardFooter}>
          <TouchableOpacity 
            style={styles.likeButton}
            onPress={(e) => {
              e.stopPropagation();
              onLike();
            }}
          >
            <Text style={[styles.heartIcon, isLiked && styles.heartLiked]}>♥</Text>
            <Text style={styles.likeCount}>{post.likeCount || 0}</Text>
          </TouchableOpacity>
          
          <View style={styles.seenCounter}>
            <Feather name="eye" size={8} color="#666666" />
            <Text style={styles.seenCount}>{post.viewCount || 0}</Text>
          </View>
          
          {post.status === 'pending' ? (
            <View style={styles.pendingIndicator}>
              <Feather name="clock" size={6} color="#FF9500" />
              <Text style={styles.pendingText}>Syncing...</Text>
            </View>
          ) : countdown && (
            <Text style={styles.countdown}>{countdown}</Text>
          )}
        </View>
      </View>
      
      {/* Sticky note tape effect */}
      <View style={styles.tape} />
      
      {/* Report button */}
      <TouchableOpacity 
        style={styles.reportButton}
        onPress={(e) => {
          e.stopPropagation();
          setShowReportModal(true);
        }}
      >
        <Feather name="alert-triangle" size={12} color="#FF3B30" />
      </TouchableOpacity>
      
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
                !selectedReason && styles.submitButtonDisabled
              ]}
              onPress={() => {
                console.log('Report submitted:', { reason: selectedReason, description });
                setShowReportModal(false);
                setSelectedReason('');
                setDescription('');
              }}
              disabled={!selectedReason}
            >
              <Text style={styles.submitButtonText}>Submit Report</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 100,
    height: 140,
    borderRadius: 4,
    margin: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
    position: 'relative',
  },
  cardContent: {
    padding: 5,
    flex: 1,
    justifyContent: 'space-between',
  },
  postText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#2C2C2C',
    lineHeight: 14,
    textAlign: 'left',
    letterSpacing: 0.2,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 2,
  },

  personaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  personaDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  personaText: {
    fontSize: 9,
    fontFamily: 'Inter_500Medium',
    fontWeight: '600',
  },

  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  heartIcon: {
    fontSize: 16,
    color: '#8E8E93',
    marginRight: 4,
  },
  heartLiked: {
    color: '#FF3B30',
  },
  likeCount: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#666666',
  },
  tape: {
    position: 'absolute',
    top: -10,
    right: 20,
    width: 30,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  countdown: {
    fontSize: 8,
    fontFamily: 'Inter_400Regular',
    color: '#FF6B35',
    fontStyle: 'italic',
  },
  seenCounter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeIcon: {
    marginRight: 2,
  },
  seenCount: {
    fontSize: 8,
    fontFamily: 'Inter_400Regular',
    color: '#666666',
  },
  pendingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockIcon: {
    marginRight: 2,
  },
  pendingText: {
    fontSize: 7,
    fontFamily: 'Inter_400Regular',
    color: '#FF9500',
    fontStyle: 'italic',
  },
  reportButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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