import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNetwork } from '../context/NetworkContext';

export default function OfflineBanner() {
  const { isConnected } = useNetwork();
  const [wasOffline, setWasOffline] = useState(false);
  const [showBackOnline, setShowBackOnline] = useState(false);
  const fadeAnim = new Animated.Value(1);

  useEffect(() => {
    if (isConnected === false) {
      setWasOffline(true);
    } else if (isConnected === true && wasOffline) {
      setShowBackOnline(true);
      setWasOffline(false);
      
      // Fade out after 3 seconds
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }).start(() => {
          setShowBackOnline(false);
          fadeAnim.setValue(1);
        });
      }, 3000);
    }
  }, [isConnected, wasOffline]);

  if (showBackOnline) {
    return (
      <Animated.View style={[styles.banner, styles.onlineBanner, { opacity: fadeAnim }]}>
        <Text style={styles.onlineText}>Back Online!</Text>
      </Animated.View>
    );
  }

  if (isConnected === false) {
    return (
      <View style={[styles.banner, styles.offlineBanner]}>
        <Text style={styles.offlineText}>Offline Mode</Text>
        <TouchableOpacity style={styles.infoButton}>
          <Feather name="help-circle" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  offlineBanner: {
    backgroundColor: '#4A4A4A',
  },
  onlineBanner: {
    backgroundColor: '#34C759',
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  onlineText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  infoButton: {
    padding: 4,
  },
});