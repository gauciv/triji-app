import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert, KeyboardAvoidingView } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Feather } from '@expo/vector-icons';
import { db } from '../config/firebaseConfig';
import { collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';

export default function PostDetailScreen({ route, navigation }) {
  const { post, timestamp } = route.params;
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);
  const [userPersona, setUserPersona] = useState(null);

  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    // Generate user persona once for this session
    const persona = generatePersona();
    setUserPersona(persona);
    
    const q = query(
      collection(db, 'freedom-wall-posts', post.id, 'comments'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const commentsList = [];
      querySnapshot.forEach((doc) => {
        commentsList.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setComments(commentsList);
    });

    return () => unsubscribe();
  }, [post.id]);

  const generatePersona = () => {
    const adjectives = ['Blue', 'Red', 'Green', 'Purple', 'Orange', 'Pink', 'Yellow', 'Silver'];
    const animals = ['Koala', 'Panda', 'Fox', 'Cat', 'Bird', 'Fish', 'Owl', 'Bear'];
    const colors = ['#007AFF', '#FF3B30', '#34C759', '#AF52DE', '#FF9500', '#FF2D92', '#FFCC00', '#8E8E93'];
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    return { name: `${adjective} ${animal}`, color };
  };

  const handlePostComment = async () => {
    if (!commentText.trim() || !userPersona) {
      Alert.alert('Error', 'Please write a comment.');
      return;
    }

    setPosting(true);
    try {
      await addDoc(collection(db, 'freedom-wall-posts', post.id, 'comments'), {
        text: commentText.trim(),
        createdAt: new Date(),
        persona: userPersona.name,
        personaColor: userPersona.color,
      });
      setCommentText('');
    } catch (error) {
      console.log('Error posting comment:', error);
      Alert.alert('Error', 'Failed to post comment. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const formatCommentTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentBubble}>
      <View style={styles.commentHeader}>
        <View style={[styles.commentPersonaDot, { backgroundColor: item.personaColor }]} />
        <Text style={[styles.commentPersona, { color: item.personaColor }]}>
          {item.persona}
        </Text>
        <Text style={styles.commentTimestamp}>
          {formatCommentTimestamp(item.createdAt)}
        </Text>
      </View>
      <Text style={styles.commentText}>{item.text}</Text>
    </View>
  );

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const renderPostHeader = () => (
    <View style={styles.postHeaderContainer}>
      <View style={[styles.postCard, { backgroundColor: post.noteColor || '#FFFACD' }]}>
        <View style={styles.personaContainer}>
          <View style={[styles.personaDot, { backgroundColor: post.personaColor || '#34C759' }]} />
          <Text style={[styles.personaText, { color: post.personaColor || '#34C759' }]}>
            {post.persona || 'Anonymous'}
          </Text>
        </View>
        
        <Text style={styles.postText}>{post.content}</Text>
        
        <View style={styles.cardFooter}>
          <View style={styles.likeInfo}>
            <Text style={styles.heartIcon}>♥</Text>
            <Text style={styles.likeCount}>{post.likeCount || 0}</Text>
          </View>
          <Text style={styles.timestamp}>{timestamp}</Text>
        </View>
      </View>
      
      <Text style={styles.commentsTitle}>Comments ({comments.length})</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.mainContainer}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={24} color="#F5F5DC" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post Detail</Text>
        </View>

        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={renderComment}
          ListHeaderComponent={renderPostHeader}
          showsVerticalScrollIndicator={false}
          style={styles.flatList}
          contentContainerStyle={styles.flatListContent}
        />
        
        <View style={styles.commentInput}>
          <TextInput
            style={styles.textInput}
            value={commentText}
            onChangeText={setCommentText}
            placeholder="Write a comment..."
            placeholderTextColor="#8E8E93"
            multiline
            maxLength={200}
          />
          <TouchableOpacity 
            style={[styles.sendButton, posting && styles.sendButtonDisabled]}
            onPress={handlePostComment}
            disabled={posting || !commentText.trim()}
          >
            <Feather name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#2A2A2A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(245, 245, 220, 0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    color: '#F5F5DC',
  },
  flatList: {
    flex: 1,
  },
  flatListContent: {
    paddingBottom: 16,
  },
  postHeaderContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#2A2A2A',
  },
  commentsTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#F5F5DC',
    marginTop: 20,
    marginBottom: 16,
  },
  commentBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  commentPersonaDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  commentPersona: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    marginRight: 8,
  },
  commentTimestamp: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    marginLeft: 'auto',
  },
  commentText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    padding: 16,
    backgroundColor: '#2A2A2A',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#8E8E93',
    opacity: 0.6,
  },
  postCard: {
    backgroundColor: '#FFFACD',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
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
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#2C2C2C',
    lineHeight: 24,
    letterSpacing: 0.3,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  likeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heartIcon: {
    fontSize: 16,
    color: '#FF3B30',
    marginRight: 4,
  },
  likeCount: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#666666',
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#666666',
    fontStyle: 'italic',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
});