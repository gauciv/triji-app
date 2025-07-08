import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { Feather } from '@expo/vector-icons';

export default function PostCard({ post, timestamp, rotation, onLike, isLiked, onPress }) {
  const [countdown, setCountdown] = useState('');
  
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

});