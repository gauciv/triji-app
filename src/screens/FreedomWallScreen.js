import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ImageBackground } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { db } from '../config/firebaseConfig';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import PostCard from '../components/PostCard';

export default function FreedomWallScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
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
      setLoading(false);
    });

    return () => unsubscribe();
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

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
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
          <Text style={styles.headerTitle}>Freedom Wall</Text>
          <Text style={styles.headerSubtitle}>Share your thoughts anonymously</Text>
        </View>

        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <PostCard 
              post={item} 
              timestamp={formatTimestamp(item.createdAt)}
              rotation={getRandomRotation(index)}
            />
          )}
          contentContainerStyle={styles.postsContainer}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={styles.row}
        />
      </ImageBackground>
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 30,
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
});