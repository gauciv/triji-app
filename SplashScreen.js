import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useFonts, Inter_600SemiBold } from '@expo-google-fonts/inter';

export default function SplashScreen() {
  let [fontsLoaded] = useFonts({
    Inter_600SemiBold,
  });

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGradient} />
      
      <View style={styles.content}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>T</Text>
        </View>
        
        <ActivityIndicator 
          size="small" 
          color="#8E8E93" 
          style={styles.spinner}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#007AFF',
    opacity: 0.05,
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: 32,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  spinner: {
    marginTop: 8,
  },
});