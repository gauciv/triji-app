import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';

export default function PostCard({ post, timestamp, rotation, onReaction }) {
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={[styles.card, { transform: [{ rotate: rotation }] }]}>
      <View style={styles.cardContent}>
        <View style={styles.personaContainer}>
          <View style={[styles.personaDot, { backgroundColor: post.personaColor || '#34C759' }]} />
          <Text style={[styles.personaText, { color: post.personaColor || '#34C759' }]}>
            {post.persona || 'Anonymous'}
          </Text>
        </View>
        
        <Text style={styles.postText}>{post.content}</Text>
        
        <View style={styles.reactionsContainer}>
          {['👍', '😂', '❤️', '😮'].map((emoji) => (
            <TouchableOpacity 
              key={emoji}
              style={styles.reactionButton}
              onPress={() => onReaction(emoji)}
            >
              <Text style={styles.reactionEmoji}>{emoji}</Text>
              <Text style={styles.reactionCount}>
                {post.reactions?.[emoji] || 0}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.cardFooter}>
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
    width: 160,
    minHeight: 140,
    backgroundColor: '#FFFACD',
    borderRadius: 4,
    margin: 8,
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
    padding: 16,
    flex: 1,
    justifyContent: 'space-between',
  },
  postText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#2C2C2C',
    lineHeight: 20,
    textAlign: 'left',
    // Simulating handwriting style with letter spacing
    letterSpacing: 0.3,
  },
  cardFooter: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 10,
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
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    fontWeight: '600',
  },
  reactionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    marginBottom: 4,
  },
  reactionButton: {
    alignItems: 'center',
    padding: 4,
  },
  reactionEmoji: {
    fontSize: 16,
  },
  reactionCount: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: '#666666',
    marginTop: 2,
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