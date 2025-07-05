import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.max(Math.min(SCREEN_WIDTH * 0.7, 340), 220); // even wider
const SIDE_CARD_WIDTH = Math.max(Math.min(SCREEN_WIDTH * 0.45, 200), 130); // even wider
const CARD_HEIGHT = 450; // even taller
const SIDE_CARD_HEIGHT = 285; // even taller

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      {/* Profile Circle */}
      <View style={styles.profileCircle} />

      {/* Greeting */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greetingLine1}>Good</Text>
        <Text style={styles.greetingLine2}>Morning</Text>
      </View>

      {/* Carousel Cards */}
      <View style={styles.carouselWrapper}>
        <View style={styles.carouselContainer}>
          {/* Left Card (partially visible) */}
          <View style={[styles.card, styles.cardLeft]} />
          {/* Center Card (main) */}
          <View style={[styles.card, styles.cardCenter]} />
          {/* Right Card (partially visible) */}
          <View style={[styles.card, styles.cardRight]} />
        </View>
        {/* Only show the label for the center card below the carousel */}
        <View style={styles.centerLabelContainer}>
          <Text style={styles.centerLabel}>VIEW ASSIGNMENT</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 60,
  },
  profileCircle: {
    position: 'absolute',
    top: 40,
    right: 32,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    zIndex: 2,
  },
  greetingContainer: {
    width: '100%',
    paddingLeft: 32,
    marginBottom: 36,
  },
  greetingLine1: {
    fontSize: 32,
    color: '#888',
    fontWeight: '400',
  },
  greetingLine2: {
    fontSize: 32,
    color: '#888',
    fontWeight: '400',
  },
  carouselWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  carouselContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: CARD_HEIGHT,
  },
  card: {
    borderRadius: 28,
    marginHorizontal: -24, // overlap for carousel effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 30,
  },
  cardLeft: {
    width: SIDE_CARD_WIDTH,
    height: SIDE_CARD_HEIGHT,
    backgroundColor: '#E0E0E0',
    zIndex: 1,
  },
  cardCenter: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#8EA9FF',
    zIndex: 2,
  },
  cardRight: {
    width: SIDE_CARD_WIDTH,
    height: SIDE_CARD_HEIGHT,
    backgroundColor: '#F6FF8E',
    zIndex: 1,
  },
  centerLabelContainer: {
    marginTop: 28,
    alignItems: 'center',
    width: CARD_WIDTH,
    alignSelf: 'center',
  },
  centerLabel: {
    color: '#888',
    fontSize: 17,
    letterSpacing: 1,
    fontWeight: '600',
  },
});