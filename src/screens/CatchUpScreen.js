import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions, Animated, PanResponder } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Feather } from '@expo/vector-icons';
import { db, auth } from '../config/firebaseConfig';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

// Responsive card dimensions
const CARD_ASPECT = 1.4; // less tall
const CARD_WIDTH = Math.min(width * 0.45, 350);
const CARD_HEIGHT = CARD_WIDTH * CARD_ASPECT;
const CARD_RADIUS = 28;
const CARD_PADDING = 20;
const CARD_FONT = width > 600 ? 22 : 16;

const TYPE_META = {
  announcement: {
    label: 'Announcement',
    colors: ['#4F8CFF', '#7B9EFF'],
    shadow: '#7B9EFF',
  },
  task: {
    label: 'Task',
    colors: ['#34C759', '#6FE29A'],
    shadow: '#34C759',
  },
  wall: {
    label: 'Wall Post',
    colors: ['#FFD23F', '#FFE066'],
    shadow: '#FFD23F',
  },
};

export default function CatchUpScreen({ navigation }) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const position = useRef(new Animated.Value(0)).current;
  const [swiping, setSwiping] = useState(false);

  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    // Check if user is authenticated
    if (!auth.currentUser) {
      console.log('User not authenticated in CatchUpScreen');
      setLoading(false);
      return;
    }

    setLoading(true);
    let unsubT = null;
    let unsubW = null;
    
    // Announcements
    const qA = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'), limit(10));
    const unsubA = onSnapshot(
      qA, 
      (snap) => {
        const announcements = snap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'announcement' }));
        // Tasks
        const qT = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'), limit(10));
        unsubT = onSnapshot(
          qT, 
          (snap2) => {
            const tasks = snap2.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'task' }));
            // Wall Posts
            const qW = query(collection(db, 'freedom-wall-posts'), orderBy('createdAt', 'desc'), limit(10));
            unsubW = onSnapshot(
              qW, 
              (snap3) => {
                const wallPosts = snap3.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'wall' }));
                // Combine in the order: announcements, tasks, wallPosts
                const combined = [...announcements, ...tasks, ...wallPosts];
                setUpdates(combined);
                setLoading(false);
              },
              (error) => {
                console.log('Error fetching wall posts in CatchUp:', error.code, error.message);
                setLoading(false);
              }
            );
          },
          (error) => {
            console.log('Error fetching tasks in CatchUp:', error.code, error.message);
            setLoading(false);
          }
        );
      },
      (error) => {
        console.log('Error fetching announcements in CatchUp:', error.code, error.message);
        setLoading(false);
      }
    );
    
    return () => { 
      unsubA();
      if (unsubT) unsubT();
      if (unsubW) unsubW();
    };
  }, []);

  // PanResponder for swipe gestures
  const pan = useRef(new Animated.ValueXY()).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => {
        const shouldSet = Math.abs(gesture.dx) > 10;
        if (shouldSet) console.log('PanResponder activated');
        return shouldSet;
      },
      onPanResponderMove: Animated.event([
        null,
        { dx: pan.x },
      ], { useNativeDriver: false }),
      onPanResponderRelease: (_, gesture) => {
        // Debug: log gesture
        console.log('Gesture dx:', gesture.dx, 'activeIndex:', activeIndex);
        // Correct swipe logic:
        // Drag left (dx < -threshold) = next card
        // Drag right (dx > threshold) = previous card
        if (gesture.dx < -20 && activeIndex < updates.length - 1) {
          // Swipe left: go to next card
          animateSwipe('next');
        } else if (gesture.dx > 20 && activeIndex > 0) {
          // Swipe right: go to previous card
          animateSwipe('prev');
        } else {
          // Snap back to center
          Animated.spring(pan, { 
            toValue: { x: 0, y: 0 }, 
            useNativeDriver: false,
            tension: 100,
            friction: 8
          }).start();
        }
      },
    })
  ).current;

  const animateSwipe = (direction) => {
    if (swiping) return;
    
    setSwiping(true);
    
    // Animate the card off screen
    const toValue = direction === 'next' ? -width : width;
    
    Animated.timing(pan, {
      toValue: { x: toValue, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      // Reset pan position immediately
      pan.setValue({ x: 0, y: 0 });
      
      // Update the active index
      setActiveIndex((prev) => {
        let nextIdx = prev;
        if (direction === 'next') {
          nextIdx = Math.min(prev + 1, updates.length - 1);
        } else if (direction === 'prev') {
          nextIdx = Math.max(prev - 1, 0);
        }
        console.log('Direction:', direction, 'Old index:', prev, 'New index:', nextIdx);
        return nextIdx;
      });
      
      setSwiping(false);
    });
  };

  const handleArrow = (direction) => {
    if (swiping) return;
    
    if (direction === 'next' && activeIndex < updates.length - 1) {
      animateSwipe('next');
    } else if (direction === 'prev' && activeIndex > 0) {
      animateSwipe('prev');
    }
  };

  const renderCard = (item, isFront) => {
    const meta = TYPE_META[item.type] || TYPE_META.announcement;
    return (
      <Animated.View
        {...(isFront ? panResponder.panHandlers : {})}
        style={[
          styles.card,
          isFront && {
            transform: pan.getTranslateTransform(),
            zIndex: 2,
          },
        ]}
        key={item.id + '-' + activeIndex}
      >
        <BlurView intensity={isFront ? 120 : 180} tint="dark" style={styles.cardBlur}>
          <View style={styles.cardContent}>
            <Text style={styles.typeLabel}>{meta.label}</Text>
            <Text style={[styles.cardTitle, { fontSize: CARD_FONT }]} numberOfLines={2}>{item.title || item.persona || 'Untitled'}</Text>
            <Text style={styles.cardMeta} numberOfLines={1}>
              {item.type === 'announcement' && (item.authorName || 'Announcement')}
              {item.type === 'task' && (item.dueDate ? `Due: ${new Date(item.dueDate.seconds ? item.dueDate.seconds * 1000 : item.dueDate).toLocaleDateString()}` : 'No due date')}
              {item.type === 'wall' && (item.persona || 'Anonymous')}
            </Text>
            <Text style={styles.cardBody} numberOfLines={3}>
              {item.type === 'announcement' ? (item.body || item.content || '') :
                item.type === 'task' ? (item.description || '') :
                (item.content || '')}
            </Text>
          </View>
        </BlurView>
      </Animated.View>
    );
  };

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (updates.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={["#23243a", "#22305a", "#3a5a8c", "#23243a"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.heading}>No updates available</Text>
        <TouchableOpacity style={[styles.proceedBtn, { width: '92%', borderRadius: 22, height: 54 }]} onPress={() => navigation.replace('MainApp')} activeOpacity={0.92}>
          <View style={[styles.buttonShadowWrap, { borderRadius: 22 }] }>
            <BlurView intensity={110} tint="dark" style={[styles.buttonBlur, { borderRadius: 22 }] }>
              <LinearGradient
                colors={["#4F8CFF", "#7B9EFF", "#3a5a8c"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.buttonGradient, { borderRadius: 22 }]}
              >
                <View style={styles.buttonContentRow}>
                  <Text style={[styles.proceedBtnText, { fontSize: CARD_FONT + 4 } ]}>Go to Dashboard</Text>
                  <Feather name="arrow-right" size={24} color="#fff" style={styles.buttonIcon} />
                </View>
              </LinearGradient>
            </BlurView>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  const frontCard = updates[activeIndex];
  const backCard = updates[activeIndex + 1];

  return (
    <View style={styles.container}>
      {/* Gradient background and floating shapes */}
      <LinearGradient
        colors={["#23243a", "#22305a", "#3a5a8c", "#23243a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <BlurView intensity={80} tint="dark" style={[styles.floatingShape, styles.shape1]} />
      <BlurView intensity={60} tint="light" style={[styles.floatingShape, styles.shape2]} />
      <BlurView intensity={50} tint="dark" style={[styles.floatingShape, styles.shape3]} />

      {/* Go to Dashboard button at top right */}
      <TouchableOpacity
        style={styles.dashboardBtn}
        onPress={() => navigation.replace('MainApp')}
        activeOpacity={0.88}
      >
        <Feather name="grid" size={20} color="#fff" style={{ marginRight: 6 }} />
        <Text style={styles.dashboardBtnText}>Dashboard</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>Catch-up on the Latest Updates!</Text>
      {/* Dot progress indicator */}
      <View style={styles.dotContainer}>
        {updates.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.dot,
              idx === activeIndex ? styles.dotActive : null
            ]}
          />
        ))}
      </View>
      <View style={styles.swipeStackContainer}>
        {/* Left Arrow */}
        {activeIndex > 0 && (
          <TouchableOpacity onPress={() => handleArrow('prev')} style={styles.cardArrowBtn}>
            <Feather name="chevron-left" size={32} color="#fff" />
          </TouchableOpacity>
        )}
        {/* Card Stack */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: CARD_HEIGHT }}>
          {frontCard && renderCard(frontCard, true)}
        </View>
        {/* Right Arrow */}
        {activeIndex < updates.length - 1 && (
          <TouchableOpacity onPress={() => handleArrow('next')} style={styles.cardArrowBtn}>
            <Feather name="chevron-right" size={32} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingShape: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.25,
    zIndex: -1,
  },
  shape1: {
    width: 180,
    height: 180,
    top: height * 0.1,
    left: width * 0.1,
    backgroundColor: '#22305a',
  },
  shape2: {
    width: 120,
    height: 120,
    bottom: height * 0.18,
    right: width * 0.15,
    backgroundColor: '#3a5a8c',
  },
  shape3: {
    width: 90,
    height: 90,
    top: height * 0.5,
    right: width * 0.25,
    backgroundColor: '#23243a',
  },
  reelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 340,
    marginBottom: 8,
  },
  cardArrowBtn: {
    padding: 8,
    backgroundColor: 'rgba(30,36,54,0.18)',
    borderRadius: 20,
    marginHorizontal: 2,
    zIndex: 2,
  },
  cardSkeleton: {
    height: 260,
    backgroundColor: 'rgba(30,36,54,0.55)',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    shadowColor: '#7B9EFF',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.22,
    shadowRadius: 36,
    elevation: 16,
    marginHorizontal: 16,
    marginVertical: 16,
    overflow: 'hidden',
  },
  cardAccent: {
    width: 24,
    height: '80%',
    borderRadius: 12,
    marginLeft: 16,
    marginRight: 18,
    backgroundColor: '#B5B5B5',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 18,
  },
  typeLabel: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: '#fff',
    opacity: 0.85,
    marginBottom: 2,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 22,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 0.1,
  },
  cardMeta: {
    fontSize: 14,
    color: '#B0FFCB',
    fontFamily: 'Inter_500Medium',
    marginBottom: 8,
  },
  cardBody: {
    fontSize: 15,
    color: '#fff',
    fontFamily: 'Inter_400Regular',
  },
  cardCounter: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#fff',
    opacity: 0.7,
    marginBottom: 16,
    textAlign: 'center',
  },
  proceedBtn: {
    width: '96%',
    height: 72,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
    marginBottom: 16,
    alignSelf: 'center',
    // No shadow here, use buttonShadowWrap for 3D effect
  },
  proceedBtnGlow: {
    shadowColor: '#4F8CFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 18,
    elevation: 24,
  },
  buttonShadowWrap: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    shadowColor: '#4F8CFF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 32,
    elevation: 16,
    backgroundColor: 'transparent',
  },
  buttonBlur: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(30,36,54,0.35)',
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.98,
  },
  buttonContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  proceedBtnText: {
    fontSize: 22,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    letterSpacing: 0.6,
    textShadowColor: '#1a2980',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    marginRight: 12,
  },
  buttonIcon: {
    marginLeft: 0,
    marginTop: 2,
    textShadowColor: '#4F8CFF',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 40,
  },
  heading: {
    fontSize: 28,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
    marginBottom: 15,
    marginTop: 32, // move title further down
    textAlign: 'center',
    paddingHorizontal: 20,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  swipeStackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: CARD_HEIGHT + 10,
    marginBottom: 100, // more space below cards for button
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT, // use full calculated height for compactness
    borderRadius: CARD_RADIUS,
    backgroundColor: 'rgba(30,36,54,0.55)', // dark glassmorphism
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 18,
    alignSelf: 'center',
    marginHorizontal: 0,
    marginVertical: 0,
    overflow: 'hidden',
  },
  cardBlur: {
    flex: 1,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    backgroundColor: 'rgba(30,36,54,0.55)', // dark glassmorphism
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.10)',
    padding: CARD_PADDING,
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 2,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginHorizontal: 4,
    transition: 'background-color 0.2s, width 0.2s, height 0.2s',
  },
  dotActive: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4F8CFF',
  },
  dashboardBtn: {
    position: 'absolute',
    top: 32,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F8CFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 22,
    shadowColor: '#4F8CFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  dashboardBtnText: {
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    letterSpacing: 0.2,
  },
});