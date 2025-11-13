import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNetwork } from '../context/NetworkContext';

export default function OfflineBanner() {
  const { isConnected } = useNetwork();
  const [wasOffline, setWasOffline] = useState(false);
  const [showBackOnline, setShowBackOnline] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
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
        <Feather name="wifi" size={16} color="#FFFFFF" />
        <Text style={styles.onlineText}>Back Online! Syncing...</Text>
      </Animated.View>
    );
  }

  if (isConnected === false) {
    return (
      <>
        <View style={[styles.banner, styles.offlineBanner]}>
          <Feather name="wifi-off" size={16} color="#FFFFFF" />
          <Text style={styles.offlineText}>No Internet Connection</Text>
          <TouchableOpacity 
            style={styles.infoButton}
            onPress={() => setShowHelpModal(true)}
          >
            <Feather name="help-circle" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Modal
          visible={showHelpModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowHelpModal(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowHelpModal(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Feather name="wifi-off" size={24} color="#FF9800" />
                <Text style={styles.modalTitle}>Offline Mode</Text>
                <TouchableOpacity onPress={() => setShowHelpModal(false)}>
                  <Feather name="x" size={24} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Feather name="x-circle" size={18} color="#FF3B30" />
                  <Text style={styles.sectionTitle}>Unavailable Features</Text>
                </View>
                <Text style={styles.featureItem}>• View or post announcements</Text>
                <Text style={styles.featureItem}>• Create or update tasks</Text>
                <Text style={styles.featureItem}>• Post to Freedom Wall</Text>
                <Text style={styles.featureItem}>• Update profile information</Text>
                <Text style={styles.featureItem}>• Receive push notifications</Text>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Feather name="check-circle" size={18} color="#4CAF50" />
                  <Text style={styles.sectionTitle}>What You Can Do</Text>
                </View>
                <Text style={styles.featureItem}>• Use the Grade Calculator</Text>
                <Text style={styles.featureItem}>• View your profile (cached data)</Text>
                <Text style={styles.featureItem}>• Browse app settings</Text>
              </View>

              <View style={styles.tipBox}>
                <Feather name="info" size={16} color="#007AFF" />
                <Text style={styles.tipText}>
                  Your changes will sync automatically when you reconnect
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowHelpModal(false)}
              >
                <Text style={styles.closeButtonText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </>
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
    gap: 6,
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
  },
  onlineText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  infoButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 12,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  featureItem: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 6,
    lineHeight: 20,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  tipText: {
    fontSize: 13,
    color: '#007AFF',
    flex: 1,
    lineHeight: 18,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});