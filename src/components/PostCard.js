import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';

export default function PostCard({ post, timestamp, rotation, onLike, isLiked, onPress }) {
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <TouchableOpacity 
      style={[styles.card, { transform: [{ rotate: rotation }] }]}
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
        
        <View style={styles.likeContainer}>
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
        </View>
        
        <View style={styles.cardFooter}>
          <Text style={styles.timestamp}>{timestamp}</Text>
        </View>
      </View>
      
      {/* Sticky note tape effect */}
      <View style={styles.tape} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 100,
    height: 140,
    backgroundColor: '#FFFACD',
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
    padding: 8,
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
    marginTop: 12,
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 8,
    fontFamily: 'Inter_400Regular',
    color: '#666666',
    fontStyle: 'italic',
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
  likeContainer: {
    marginTop: 4,
    marginBottom: 2,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 2,
  },
  heartIcon: {
    fontSize: 14,
    color: '#CCC',
    marginRight: 4,
  },
  heartLiked: {
    color: '#FF3B30',
  },
  likeCount: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: '#666666',
  },
  tape: {
    position: 'absolute',
    top: -4,
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
});