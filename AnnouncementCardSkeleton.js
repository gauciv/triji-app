import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

export default function AnnouncementCardSkeleton() {
  const shimmerValue = useSharedValue(0);

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      true
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(shimmerValue.value, [0, 1], [0.3, 0.7]);
    return { opacity };
  });

  return (
    <View style={styles.card}>
      <View style={styles.cardMain}>
        <View style={styles.cardLeft}>
          <Animated.View style={[styles.profileSkeleton, shimmerStyle]} />
        </View>
        
        <View style={styles.cardRight}>
          <View style={styles.cardHeader}>
            <Animated.View style={[styles.authorSkeleton, shimmerStyle]} />
            <View style={styles.cardMeta}>
              <Animated.View style={[styles.timestampSkeleton, shimmerStyle]} />
              <Animated.View style={[styles.typeSkeleton, shimmerStyle]} />
            </View>
          </View>
          
          <Animated.View style={[styles.titleSkeleton, shimmerStyle]} />
          <Animated.View style={[styles.titleSkeletonShort, shimmerStyle]} />
          
          <Animated.View style={[styles.expirySkeleton, shimmerStyle]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  cardMain: {
    flexDirection: 'row',
    gap: 12,
  },
  cardLeft: {
    alignItems: 'center',
  },
  cardRight: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileSkeleton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8E8E93',
  },
  authorSkeleton: {
    width: 80,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#8E8E93',
  },
  timestampSkeleton: {
    width: 40,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#8E8E93',
  },
  typeSkeleton: {
    width: 50,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#8E8E93',
  },
  titleSkeleton: {
    width: '90%',
    height: 18,
    borderRadius: 9,
    backgroundColor: '#8E8E93',
    marginBottom: 4,
  },
  titleSkeletonShort: {
    width: '60%',
    height: 18,
    borderRadius: 9,
    backgroundColor: '#8E8E93',
    marginBottom: 8,
  },
  expirySkeleton: {
    width: 70,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#8E8E93',
  },
});