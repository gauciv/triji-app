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

  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const fetchPosts = () => {
    setLoading(true);
    setError(null);
    
    try {
      const q = query(
        collection(db, 'freedom-wall-posts'),
        orderBy('createdAt', 'desc')
      );

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
  }, []);

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
        likeCount: 0,
        likedBy: [],
      });
      setPostContent('');
      setCustomNickname('');
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
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Feather name="arrow-left" size={24} color="#F5F5DC" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Freedom Wall</Text>
            <Text style={styles.headerSubtitle}>Share your thoughts anonymously</Text>
          </View>
        </View>

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
        <View style={styles.modalContainer}>
          <View style={styles.stickyNoteModal}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowModal(false)}
              >
                <Feather name="x" size={24} color="#666666" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.nicknameInput}
              value={customNickname}
              onChangeText={setCustomNickname}
              placeholder="Nickname (optional)"
              placeholderTextColor="#999999"
              maxLength={15}
            />
            
            <TextInput
              style={styles.modalTextInput}
              value={postContent}
              onChangeText={setPostContent}
              placeholder="What's on your mind?"
              placeholderTextColor="#999999"
              multiline
              textAlignVertical="top"
              autoFocus
              maxLength={100}
            />
            
            <Text style={styles.characterCounter}>
              {postContent.length}/100
            </Text>
            
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 30,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(245, 245, 220, 0.1)',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'Inter_600SemiBold',
    color: '#F5F5DC',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#D3D3D3',
    textAlign: 'center',
  },
  postsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-around',
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
    backgroundColor: '#FFFACD',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
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
    color: '#2C2C2C',
    textAlignVertical: 'top',
    letterSpacing: 0.3,
    outline: 'none',
  },
  characterCounter: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#666666',
    textAlign: 'right',
    marginBottom: 10,
  },
  nicknameInput: {
    height: 40,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#2C2C2C',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    marginBottom: 16,
    paddingHorizontal: 4,
    outline: 'none',
  },
  postButton: {
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
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