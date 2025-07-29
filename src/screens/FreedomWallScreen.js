import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, ImageBackground, TouchableOpacity, Modal, TextInput, Alert, Dimensions } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { db } from '../config/firebaseConfig';
import { collection, query, orderBy, onSnapshot, addDoc, doc, runTransaction } from 'firebase/firestore';
import { auth } from '../config/firebaseConfig';
import PostCard from '../components/PostCard';
import { useNetwork } from '../context/NetworkContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

export default function FreedomWallScreen({ navigation }) {
  const { isConnected, registerSyncCallback } = useNetwork();
  const [posts, setPosts] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [customNickname, setCustomNickname] = useState('');
  const [posting, setPosting] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#FFFACD');
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortBy, setSortBy] = useState('Oldest to Newest');
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [cardWidth, setCardWidth] = useState(Dimensions.get('window').width * 0.92);
  const [numColumns, setNumColumns] = useState(3);

  const combinedPosts = useMemo(() => {
    return [...posts, ...pendingPosts];
  }, [posts, pendingPosts]);

  const colorPalette = [
    '#FFFACD', // Pale yellow
    '#E6F3FF', // Light blue
    '#FFE6F0', // Soft pink
    '#E6FFE6', // Mint green
    '#F0E6FF', // Light purple
    '#FFE6CC', // Peach
  ];

  const getTextColor = (backgroundColor) => {
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#2C2C2C' : '#FFFFFF';
  };

  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const fetchPosts = () => {
    setLoading(true);
    setError(null);
    
    try {
      let q;
      
      switch (sortBy) {
        case 'Newest to Oldest':
          q = query(
            collection(db, 'freedom-wall-posts'),
            orderBy('createdAt', 'desc')
          );
          break;
        case 'Oldest to Newest':
          q = query(
            collection(db, 'freedom-wall-posts'),
            orderBy('createdAt', 'asc')
          );
          break;
        case 'Most Hearts':
          q = query(
            collection(db, 'freedom-wall-posts'),
            orderBy('likeCount', 'desc')
          );
          break;
        case 'Fewest Hearts':
          q = query(
            collection(db, 'freedom-wall-posts'),
            orderBy('likeCount', 'asc')
          );
          break;
        default:
          q = query(
            collection(db, 'freedom-wall-posts'),
            orderBy('createdAt', 'asc')
          );
      }

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const postsList = [];
        querySnapshot.forEach((doc) => {
          postsList.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        setPosts(postsList);
        setLoading(false);
        setIsInitialLoading(false);
      }, (error) => {
        console.log('Error fetching posts:', error);
        setError('Could not load the Freedom Wall');
        setLoading(false);
        setIsInitialLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.log('Error setting up listener:', error);
      setError('Could not load the Freedom Wall');
      setLoading(false);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = fetchPosts();
    return () => unsubscribe && unsubscribe();
  }, [sortBy]);

  // Listen for screen dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => {
      // Recalculate layout when screen dimensions change
      setTimeout(() => {
        // Force a re-layout by updating a state that triggers handleCardLayout
        setCardWidth(prev => prev + 0.1);
      }, 100);
    });

    return () => subscription?.remove();
  }, []);

  const syncPendingPosts = async () => {
    if (pendingPosts.length === 0) return;
    
    console.log(`Syncing ${pendingPosts.length} pending posts...`);
    
    for (const pendingPost of pendingPosts) {
      try {
        const { id, status, ...postData } = pendingPost;
        await addDoc(collection(db, 'freedom-wall-posts'), postData);
        
        // Remove from pending posts after successful sync
        setPendingPosts(prev => prev.filter(p => p.id !== pendingPost.id));
        console.log('Synced post:', pendingPost.id);
      } catch (error) {
        console.log('Error syncing post:', error);
      }
    }
  };

  useEffect(() => {
    registerSyncCallback(syncPendingPosts);
  }, [pendingPosts, registerSyncCallback]);

  useEffect(() => {
    checkCooldown();
  }, [showModal]);

  const checkCooldown = async () => {
    try {
      const lastPostTime = await AsyncStorage.getItem('lastPostTime');
      if (lastPostTime) {
        const timeDiff = Date.now() - parseInt(lastPostTime);
        const cooldownTime = 90000; // 90 seconds
        
        if (timeDiff < cooldownTime) {
          const remainingTime = Math.ceil((cooldownTime - timeDiff) / 1000);
          setIsOnCooldown(true);
          setCooldownSeconds(remainingTime);
          
          const interval = setInterval(() => {
            setCooldownSeconds(prev => {
              if (prev <= 1) {
                setIsOnCooldown(false);
                clearInterval(interval);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          
          return () => clearInterval(interval);
        }
      }
    } catch (error) {
      console.log('Error checking cooldown:', error);
    }
  };

  const formatCooldownTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const generatePersona = () => {
    const adjectives = ['Brave', 'Wise', 'Swift', 'Bold', 'Calm', 'Bright', 'Cool', 'Wild', 'Free', 'Kind'];
    const animals = ['Tiger', 'Eagle', 'Wolf', 'Fox', 'Bear', 'Lion', 'Owl', 'Hawk', 'Deer', 'Cat'];
    const colors = ['#FF6B35', '#F7931E', '#FFD23F', '#06FFA5', '#118AB2', '#073B4C', '#AF52DE', '#FF3B30', '#34C759', '#007AFF'];
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    return { name: `${adjective} ${animal}`, color };
  };

  const handlePost = async () => {
    if (isOnCooldown) {
      Alert.alert('Cooldown Active', 'Please wait for the cooldown to finish. This was implemented to avoid spam.');
      return;
    }
    
    if (!postContent.trim()) {
      Alert.alert('Error', 'Please write something before posting.');
      return;
    }

    setPosting(true);
    
    const persona = generatePersona();
    const finalPersona = customNickname.trim() || persona.name;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
    
    const postData = {
      content: postContent.trim(),
      createdAt: now,
      expiresAt: expiresAt,
      persona: finalPersona,
      personaColor: persona.color,
      noteColor: selectedColor,
      likeCount: 0,
      likedBy: [],
      viewCount: 0,
      viewedBy: [],
    };
    
    if (!isConnected) {
      // Add to pending posts for offline
      const pendingPost = {
        ...postData,
        id: `pending_${Date.now()}`,
        status: 'pending'
      };
      setPendingPosts(prev => [...prev, pendingPost]);
      
      // Save timestamp for cooldown (offline posts)
      await AsyncStorage.setItem('lastPostTime', Date.now().toString());
      
      setPostContent('');
      setCustomNickname('');
      setSelectedColor('#FFFACD');
      setShowModal(false);
      setPosting(false);
      return;
    }
    
    try {
      await addDoc(collection(db, 'freedom-wall-posts'), postData);
      
      // Save timestamp for cooldown
      await AsyncStorage.setItem('lastPostTime', Date.now().toString());
      
      setPostContent('');
      setCustomNickname('');
      setSelectedColor('#FFFACD');
      setShowModal(false);
    } catch (error) {
      console.log('Error posting:', error);
      Alert.alert('Error', 'Could not create post. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const postRef = doc(db, 'freedom-wall-posts', postId);
      
      await runTransaction(db, async (transaction) => {
        const postDoc = await transaction.get(postRef);
        if (!postDoc.exists()) return;
        
        const data = postDoc.data();
        const likedBy = data.likedBy || [];
        const currentLikeCount = data.likeCount || 0;
        const userHasLiked = likedBy.includes(user.uid);
        
        if (userHasLiked) {
          // Unlike
          transaction.update(postRef, {
            likeCount: Math.max(0, currentLikeCount - 1),
            likedBy: likedBy.filter(id => id !== user.uid)
          });
        } else {
          // Like
          transaction.update(postRef, {
            likeCount: currentLikeCount + 1,
            likedBy: [...likedBy, user.uid]
          });
        }
      });
    } catch (error) {
      console.log('Error updating like:', error);
      Alert.alert('Error', 'Failed to update like. Please try again.');
    }
  };

  // Responsive columns based on card/container width
  const handleCardLayout = (event) => {
    const width = event.nativeEvent.layout.width;
    setCardWidth(width);
    
    // Calculate optimal number of columns based on available width
    const cardWidth = 100; // PostCard width
    const cardMargin = 4; // PostCard margin
    const totalCardWidth = cardWidth + (cardMargin * 2);
    const availableWidth = width - 16; // Account for container padding
    
    // Calculate how many cards can fit
    const maxColumns = Math.floor(availableWidth / totalCardWidth);
    
    // Use 3 columns if possible, otherwise use the maximum that fits
    const optimalColumns = Math.max(2, Math.min(3, maxColumns));
    setNumColumns(optimalColumns);
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => fetchPosts()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
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
      {/* Floating blurred shapes for depth, similar to VerificationScreen */}
      <BlurView intensity={70} tint="dark" style={[styles.floatingShape, styles.shape1]} />
      <BlurView intensity={50} tint="light" style={[styles.floatingShape, styles.shape2]} />
      <BlurView intensity={40} tint="dark" style={[styles.floatingShape, styles.shape3]} />
      {/* Floating back button */}
      <TouchableOpacity style={styles.floatingBackButton} onPress={() => navigation.navigate('Dashboard')}>
        <Feather name="arrow-left" size={26} color="#fff" />
      </TouchableOpacity>
      {/* Main card container for Freedom Wall */}
      <View style={styles.mainCardContainer} onLayout={handleCardLayout}>
        {/* Center logo with glowing outline circle */}
        <View style={styles.logoCircleWrapper}>
          <View style={styles.logoCircleGlow} />
          <View style={styles.logoCircleOutline}>
            <MaterialCommunityIcons name="message-text" size={32} color="#22e584" style={styles.logoIcon} />
          </View>
        </View>
        
        <View style={styles.cardHeader}>
          <Text style={styles.headerTitleModernCard}>Freedom Wall</Text>
          <Text style={styles.headerSubtextCard}>Share your thoughts anonymously</Text>
          <TouchableOpacity style={styles.sortButton} onPress={() => setShowSortModal(true)}>
            <Text style={styles.sortButtonText}>Sort By: {sortBy}</Text>
            <Feather name="chevron-down" size={16} color="#b6c2d1" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.cardContent}>
          {/* Posts list or empty state */}
          {isInitialLoading ? (
            <View style={styles.loadingContainer}>
              <Feather name="message-circle" size={64} color="#8E8E93" />
              <Text style={styles.loadingText}>Loading Freedom Wall...</Text>
            </View>
          ) : combinedPosts.length === 0 ? (
            <View style={styles.emptyContainerModern}>
              <Feather name="message-circle" size={64} color="#8E8E93" />
              <Text style={styles.emptyTitleModern}>There are no sticky notes for today yet.\nBe the first!</Text>
            </View>
          ) : (
            <FlatList
              data={combinedPosts}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <PostCard 
                  post={item} 
                  timestamp={formatTimestamp(item.createdAt)}
                  rotation={getRandomRotation(index)}
                  onLike={() => handleLike(item.id)}
                  isLiked={item.likedBy?.includes(auth.currentUser?.uid)}
                />
              )}
              numColumns={numColumns}
              contentContainerStyle={styles.postsGridContainer}
              showsVerticalScrollIndicator={false}
              key={numColumns} // force re-render on column change
            />
          )}
        </View>
      </View>
      {/* Show FAB only when modal is not open */}
      {!showModal && (
        <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
          <Feather name="plus" size={28} color="#fff" />
        </TouchableOpacity>
      )}
      {/* Modal for creating a new post, glassmorphic style */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <BlurView intensity={110} tint="dark" style={styles.modalCard}>
            {/* Modal Header with Close Button */}
            <View style={styles.modalHeader}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowModal(false)}>
                <Feather name="x" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            {/* Preview Area */}
            <View style={styles.previewArea}>
              <Text style={styles.previewLabel}>Preview</Text>
              <View style={styles.previewContainer}>
                <PostCard 
                  post={{
                    content: postContent || "What's on your mind?",
                    persona: customNickname || 'Anonymous',
                    personaColor: '#34C759',
                    noteColor: selectedColor,
                    likeCount: 0,
                    likedBy: []
                  }}
                  timestamp="Just now"
                  rotation="2deg"
                  onLike={() => {}}
                  isLiked={false}
                />
              </View>
            </View>
            {/* Form Area */}
            <View style={styles.formArea}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nickname (optional)</Text>
                <TextInput
                  style={styles.formInput}
                  value={customNickname}
                  onChangeText={setCustomNickname}
                  placeholder="Enter your nickname"
                  placeholderTextColor="#8E8E93"
                  maxLength={15}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Message</Text>
                <TextInput
                  style={styles.messageInput}
                  value={postContent}
                  onChangeText={setPostContent}
                  placeholder="What's on your mind?"
                  placeholderTextColor="#8E8E93"
                  multiline
                  textAlignVertical="top"
                  maxLength={100}
                />
                <Text style={styles.characterCounter}>{postContent.length}/100</Text>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Color</Text>
                <View style={styles.colorPalette}>
                  {colorPalette.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorCircle,
                        { backgroundColor: color },
                        selectedColor === color && styles.selectedColorCircle
                      ]}
                      onPress={() => setSelectedColor(color)}
                    />
                  ))}
                </View>
              </View>
              <TouchableOpacity 
                style={[
                  styles.postButton, 
                  (posting || isOnCooldown) && styles.postButtonDisabled
                ]}
                onPress={handlePost}
                disabled={posting || isOnCooldown}
              >
                <Text style={[
                  styles.postButtonText,
                  isOnCooldown && styles.cooldownText
                ]}>
                  {posting ? 'Posting...' : isOnCooldown ? formatCooldownTime(cooldownSeconds) : 'Post It'}
                </Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </Modal>
    </View>
  );
}

const getRandomRotation = (index) => {
  const rotations = ['-2deg', '-1deg', '0deg', '1deg', '2deg', '-1.5deg', '1.5deg'];
  return rotations[index % rotations.length];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backgroundTexture: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButtonContainer: {
    width: 50,
    alignItems: 'flex-start',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(245, 245, 220, 0.1)',
  },
  spacer: {
    width: 50,
  },
  subHeader: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerTitle: {
    flex: 1,
    fontSize: 28,
    fontFamily: 'Inter_600SemiBold',
    color: '#F5F5DC',
    textAlign: 'center',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#D3D3D3',
    textAlign: 'center',
    marginBottom: 16,
  },
  postsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    justifyContent: 'flex-start',
  },
  row: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    color: '#D3D3D3',
    fontSize: 18,
    fontFamily: 'Inter_400Regular',
    marginTop: 20,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Inter_400Regular',
  },
  retryButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
  fab: {
    position: 'absolute',
    bottom: 36,
    right: 36,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 20,
    zIndex: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(42, 42, 42, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  stickyNoteModal: {
    width: '100%',
    maxWidth: 400,
    height: '70%',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    transform: [{ rotate: '1deg' }],
  },
  modalHeader: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  modalTextInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    textAlignVertical: 'top',
    letterSpacing: 0.3,
    outline: 'none',
  },
  characterCounter: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    textAlign: 'right',
    marginTop: 8,
  },
  colorPalette: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorCircle: {
    borderColor: '#333333',
    borderWidth: 3,
  },
  createNoteContainer: {
    flex: 1,
    backgroundColor: '#2A2A2A',
  },
  previewArea: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  previewLabel: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#F5F5DC',
    marginBottom: 16,
  },
  previewContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  formInput: {
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  messageInput: {
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    textAlignVertical: 'top',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    gap: 6,
  },
  sortButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#D3D3D3',
  },
  sortModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    paddingTop: 140,
  },
  sortDropdown: {
    backgroundColor: 'rgba(42, 42, 42, 0.95)',
    borderRadius: 12,
    minWidth: 200,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  sortOptionSelected: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
  },
  sortOptionText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
  },
  sortOptionTextSelected: {
    color: '#34C759',
    fontFamily: 'Inter_500Medium',
  },
  createNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  createNoteBackButton: {
    width: 50,
    alignItems: 'flex-start',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(245, 245, 220, 0.1)',
  },
  createNoteTitle: {
    flex: 1,
    fontSize: 28,
    fontFamily: 'Inter_600SemiBold',
    color: '#F5F5DC',
    textAlign: 'center',
    marginRight: 50,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: 'Inter_400Regular',
    color: '#D3D3D3',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 24,
  },
  nicknameInput: {
    height: 40,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    borderBottomWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 4,
    outline: 'none',
  },
  postButton: {
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  postButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  postButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  postButtonTextDisabled: {
    color: '#666666',
  },
  cooldownText: {
    color: '#FF3B30',
  },
  // New styles for the modern Freedom Wall screen
  mainCardContainer: {
    marginTop: 104,
    marginBottom: 32,
    marginHorizontal: 12,
    backgroundColor: 'rgba(18, 22, 34, 0.92)',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 20,
    paddingHorizontal: 0,
    shadowColor: '#22e584',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 32,
    elevation: 12,
    maxWidth: 420,
    alignSelf: 'center',
    width: '92%',
    position: 'relative',
    zIndex: 2,
    flexDirection: 'column',
    display: 'flex',
    height: 750, // Extended height for better visual balance
  },
  headerTitleModernCard: {
    fontSize: 32,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtextCard: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#b6c2d1',
    textAlign: 'center',
    marginBottom: 20,
  },
  cardHeader: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  cardContent: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 16,
  },
  logoCircleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    marginTop: 0,
    width: '100%',
    zIndex: 3,
    position: 'relative',
  },
  logoCircleGlow: {
    position: 'absolute',
    top: 2,
    left: '50%',
    marginLeft: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#22e58444',
    opacity: 0.7,
    zIndex: 2,
    shadowColor: '#22e584',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 8,
  },
  logoCircleOutline: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
    borderWidth: 2.5,
    borderColor: '#22e584',
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
  },
  logoIcon: {
    zIndex: 5,
  },
  floatingBackButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  floatingShape: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  shape1: {
    top: -50,
    left: -50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  shape2: {
    bottom: -50,
    right: -50,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  shape3: {
    top: 100,
    right: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  modalCard: {
    width: '100%',
    maxWidth: 450,
    height: '85%',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 15,
    backgroundColor: 'rgba(42, 42, 42, 0.95)',
    alignSelf: 'center',
  },
  emptyContainerModern: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitleModern: {
    fontSize: 18,
    fontFamily: 'Inter_400Regular',
    color: '#b6c2d1',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 24,
  },
  postsGridContainer: {
    paddingHorizontal: 4, // Reduced padding for better space utilization
    paddingBottom: 20,
    justifyContent: 'flex-start',
    alignItems: 'center', // Center the grid content
  },
});