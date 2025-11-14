import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, RefreshControl, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNetwork } from '../context/NetworkContext';
import OfflineScreen from './OfflineScreen';

/**
 * HOC to add offline capabilities to any screen
 * Handles:
 * - Loading states
 * - Error states
 * - Offline mode with cached data
 * - Pull-to-refresh
 */
export default function withOfflineSupport(WrappedComponent, options = {}) {
  const { requiresAuth = false, showOfflineScreen = true, allowOfflineAccess = true } = options;

  return function OfflineCapableScreen(props) {
    const { isConnected } = useNetwork();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasCache, setHasCache] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Check if there's cached data available
    useEffect(() => {
      checkForCachedData();
    }, []);

    const checkForCachedData = async () => {
      // This should be implemented based on the screen's needs
      // For now, we'll assume cache exists if offline
      if (!isConnected) {
        // Check AsyncStorage for cached data
        setHasCache(true);
      }
    };

    const handleRefresh = async () => {
      setRefreshing(true);
      try {
        // Trigger data refresh in wrapped component
        if (props.onRefresh) {
          await props.onRefresh();
        }
      } catch (err) {
        console.error('Refresh error:', err);
      } finally {
        setRefreshing(false);
      }
    };

    const handleRetry = () => {
      setError(null);
      if (props.onRetry) {
        props.onRetry();
      }
    };

    // Show full offline screen if no connection and no cache
    if (!isConnected && showOfflineScreen && !allowOfflineAccess && !hasCache) {
      return (
        <OfflineScreen
          message="This feature requires an internet connection"
          showRetry
          onRetry={handleRetry}
        />
      );
    }

    // Show error screen if there's an error
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Feather name="alert-triangle" size={64} color="#FF6B6B" />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Feather name="refresh-cw" size={20} color="#FFFFFF" />
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Render wrapped component with offline props
    return (
      <WrappedComponent
        {...props}
        isOffline={!isConnected}
        hasCache={hasCache}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setError={setError}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#FFFFFF" />
        }
      />
    );
  };
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1B2845',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A9EFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
