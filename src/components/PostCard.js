import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';

export default function PostCard({ post, timestamp, rotation, onLike, isLiked }) {
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View 
      style={[
        styles.card, 
        { 
          transform: [{ rotate: rotation }],
          backgroundColor: post.noteColor || '#FFFACD'
        }
      ]}
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
          
          <Text style={styles.timestamp}>{timestamp}</Text>
        </View>
      </View>
      
      {/* Sticky note tape effect */}
      <View style={styles.tape} />
    </View>
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
});