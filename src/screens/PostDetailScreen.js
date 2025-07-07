import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Feather } from '@expo/vector-icons';

export default function PostDetailScreen({ route, navigation }) {
  const { post, timestamp } = route.params;

  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#F5F5DC" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post Detail</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.postCard}>
          <View style={styles.personaContainer}>
            <View style={[styles.personaDot, { backgroundColor: post.personaColor || '#34C759' }]} />
            <Text style={[styles.personaText, { color: post.personaColor || '#34C759' }]}>
              {post.persona || 'Anonymous'}
            </Text>
          </View>
          
          <Text style={styles.postText}>{post.content}</Text>
          
          <View style={styles.cardFooter}>
            <Text style={styles.timestamp}>{timestamp}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
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
    alignItems: 'flex-end',
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