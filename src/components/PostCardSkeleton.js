import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

export default function PostCardSkeleton({ rotation }) {
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
    <View style={[
      styles.card,
      { transform: [{ rotate: rotation }] }
    ]}>
      <Animated.View style={[styles.skeletonContainer, animatedStyle]}>
        {/* Persona skeleton */}
        <View style={styles.personaContainer}>
          <View style={styles.personaDot} />
          <View style={styles.personaName} />
        </View>
        
        {/* Content skeleton */}
        <View style={styles.contentLines}>
          <View style={styles.line} />
          <View style={[styles.line, styles.lineShort]} />
          <View style={styles.line} />
          <View style={[styles.line, styles.lineMedium]} />
        </View>
        
        {/* Footer skeleton */}
        <View style={styles.footer}>
          <View style={styles.footerItem} />
          <View style={styles.footerItem} />
          <View style={styles.footerItem} />
        </View>
      </Animated.View>
      
      {/* Tape effect */}
      <View style={styles.tape} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 110,
    height: 140,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  skeletonContainer: {
    flex: 1,
    padding: 8,
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
    backgroundColor: '#D0D0D0',
    marginRight: 4,
  },
  personaName: {
    width: 40,
    height: 6,
    backgroundColor: '#D0D0D0',
    borderRadius: 3,
  },
  contentLines: {
    flex: 1,
    marginBottom: 8,
  },
  line: {
    height: 4,
    backgroundColor: '#D0D0D0',
    borderRadius: 2,
    marginBottom: 3,
  },
  lineShort: {
    width: '60%',
  },
  lineMedium: {
    width: '80%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerItem: {
    width: 12,
    height: 4,
    backgroundColor: '#D0D0D0',
    borderRadius: 2,
  },
  tape: {
    position: 'absolute',
    top: -2,
    right: 15,
    width: 20,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 2,
  },
});