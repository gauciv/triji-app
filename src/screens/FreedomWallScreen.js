import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ImageBackground, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Feather } from '@expo/vector-icons';
import { db } from '../config/firebaseConfig';
import { collection, query, orderBy, onSnapshot, addDoc, doc, runTransaction } from 'firebase/firestore';
import { auth } from '../config/firebaseConfig';
import PostCard from '../components/PostCard';

export default function FreedomWallScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [customNickname, setCustomNickname] = useState('');
  const [posting, setPosting] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#FFFACD');
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortBy, setSortBy] = useState('Oldest to Newest');

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
      }, (error) => {
        console.log('Error fetching posts:', error);
        setError('Could not load the Freedom Wall');
        setLoading(false);
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
    if (!postContent.trim()) {
      Alert.alert('Error', 'Please write something before posting.');
      return;
    }

    setPosting(true);
    try {
      const persona = generatePersona();
      const finalPersona = customNickname.trim() || persona.name;
      
      await addDoc(collection(db, 'freedom-wall-posts'), {
        content: postContent.trim(),
        createdAt: new Date(),
        persona: finalPersona,
        personaColor: persona.color,
        noteColor: selectedColor,
        likeCount: 0,
        likedBy: [],
      });
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
      <ImageBackground
        source={{ uri: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJjb3JrYm9hcmQiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CiAgICAgIDxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0iIzJBMkEyQSIvPgogICAgICA8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxLjUiIGZpbGw9IiMzNTM1MzUiLz4KICAgICAgPGNpcmNsZSBjeD0iMTAiIGN5PSIzMCIgcj0iMSIgZmlsbD0iIzM1MzUzNSIvPgogICAgICA8Y2lyY2xlIGN4PSIzMCIgY3k9IjEwIiByPSIwLjgiIGZpbGw9IiMzNTM1MzUiLz4KICAgIDwvcGF0dGVybj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNjb3JrYm9hcmQpIi8+Cjwvc3ZnPgo=' }}
        style={styles.backgroundTexture}
        resizeMode="repeat"
      >
        <View style={styles.headerBar}>
          <TouchableOpacity 
            style={styles.backButtonContainer}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Feather name="arrow-left" size={24} color="#F5F5DC" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Freedom Wall</Text>
          
          <View style={styles.spacer} />
        </View>
        
        <View style={styles.subHeader}>
          <Text style={styles.headerSubtitle}>Share your thoughts anonymously</Text>
          
          <TouchableOpacity 
            style={styles.sortButton}
            onPress={() => setShowSortModal(true)}
          >
            <Text style={styles.sortButtonText}>Sort By: {sortBy}</Text>
            <Feather name="chevron-down" size={16} color="#D3D3D3" />
          </TouchableOpacity>
        </View>

        {posts.length === 0 && !loading ? (
          <View style={styles.emptyState}>
            <Feather name="message-circle" size={64} color="#8E8E93" />
            <Text style={styles.emptyStateText}>
              There are no sticky notes for today yet.{"\n"}Be the first!
            </Text>
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <PostCard 
                post={item} 
                timestamp={formatTimestamp(item.createdAt)}
                rotation={getRandomRotation(index)}
                onLike={() => handleLike(item.id)}
                isLiked={item.likedBy?.includes(auth.currentUser?.uid)}
                onPress={() => navigation.navigate('PostDetail', { 
                  post: item, 
                  timestamp: formatTimestamp(item.createdAt) 
                })}
              />
            )}
            contentContainerStyle={styles.postsContainer}
            showsVerticalScrollIndicator={false}
            numColumns={3}
            columnWrapperStyle={styles.row}
          />
        )}
        
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => setShowModal(true)}
        >
          <Feather name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </ImageBackground>
      
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.createNoteContainer}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setShowModal(false)}
            >
              <Feather name="arrow-left" size={24} color="#F5F5DC" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Note</Text>
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
                onPress={() => {}}
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
              <Text style={styles.characterCounter}>
                {postContent.length}/100
              </Text>
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
              style={[styles.postButton, posting && styles.postButtonDisabled]}
              onPress={handlePost}
              disabled={posting}
            >
              <Text style={styles.postButtonText}>
                {posting ? 'Posting...' : 'Post It'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <Modal
        visible={showSortModal}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity 
          style={styles.sortModalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.sortDropdown}>
            {['Newest to Oldest', 'Oldest to Newest', 'Most Hearts', 'Fewest Hearts'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.sortOption,
                  sortBy === option && styles.sortOptionSelected
                ]}
                onPress={() => {
                  setSortBy(option);
                  setShowSortModal(false);
                }}
              >
                <Text style={[
                  styles.sortOptionText,
                  sortBy === option && styles.sortOptionTextSelected
                ]}>
                  {option}
                </Text>
                {sortBy === option && (
                  <Feather name="check" size={16} color="#34C759" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
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
    backgroundColor: '#2A2A2A',
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
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
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
    bottom: 30,
    right: 30,
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
    elevation: 8,
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
});