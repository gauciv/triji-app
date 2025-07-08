import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

export default function TaskCardSkeleton() {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.8, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }), [opacity]);

  return (
    <View style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <View style={styles.taskInfo}>
          <Animated.View style={[styles.titleSkeleton, animatedStyle]} />
          <Animated.View style={[styles.subjectSkeleton, animatedStyle]} />
        </View>
        <Animated.View style={[styles.statusSkeleton, animatedStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  taskCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskInfo: {
    flex: 1,
  },
  titleSkeleton: {
    height: 16,
    backgroundColor: '#666666',
    borderRadius: 4,
    marginBottom: 8,
    width: '70%',
  },
  subjectSkeleton: {
    height: 12,
    backgroundColor: '#666666',
    borderRadius: 4,
    width: '50%',
  },
  statusSkeleton: {
    width: 80,
    height: 24,
    backgroundColor: '#666666',
    borderRadius: 12,
    marginLeft: 12,
  },
});