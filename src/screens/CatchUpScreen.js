import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Feather } from '@expo/vector-icons';
import { db } from '../config/firebaseConfig';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

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
  const flatListRef = useRef(null);

  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    setLoading(true);
    // Announcements
    const qA = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'), limit(10));
    const unsubA = onSnapshot(qA, (snap) => {
      const announcements = snap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'announcement' }));
      // Tasks
      const qT = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'), limit(10));
      const unsubT = onSnapshot(qT, (snap2) => {
        const tasks = snap2.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'task' }));
        // Wall Posts
        const qW = query(collection(db, 'freedom-wall-posts'), orderBy('createdAt', 'desc'), limit(10));
        const unsubW = onSnapshot(qW, (snap3) => {
          const wallPosts = snap3.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'wall' }));
          // Combine in the order: announcements, tasks, wallPosts
          const combined = [...announcements, ...tasks, ...wallPosts];
          setUpdates(combined);
          setLoading(false);
        });
        return unsubW;
      });
      return unsubT;
    });
    return () => { unsubA(); };
  }, []);

  const handleCardArrow = (dir) => {
    if (!updates.length) return;
    let newIndex = activeIndex;
    if (dir === 'left') newIndex = activeIndex === 0 ? updates.length - 1 : activeIndex - 1;
    if (dir === 'right') newIndex = activeIndex === updates.length - 1 ? 0 : activeIndex + 1;
    setActiveIndex(newIndex);
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index: newIndex, animated: true });
    }
  };

  const renderUpdate = ({ item }) => {
    const meta = TYPE_META[item.type] || TYPE_META.announcement;
    return (
      <BlurView intensity={90} tint="dark" style={[styles.cardSkeleton, { shadowColor: meta.shadow }]}> 
        <LinearGradient
          colors={meta.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.cardAccent}
        />
        <View style={styles.cardContent}>
          <Text style={styles.typeLabel}>{meta.label}</Text>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title || item.persona || 'Untitled'}</Text>
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
    );
  };

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Gradient background */}
      <LinearGradient
        colors={["#23243a", "#22305a", "#3a5a8c", "#23243a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Floating blurred shapes */}
      <BlurView intensity={80} tint="dark" style={[styles.floatingShape, styles.shape1]} />
      <BlurView intensity={60} tint="light" style={[styles.floatingShape, styles.shape2]} />
      <BlurView intensity={50} tint="dark" style={[styles.floatingShape, styles.shape3]} />
      <Text style={styles.heading}>Catch-up on the Latest Updates!</Text>
      <View style={styles.reelContainer}>
        {Platform.OS === 'web' && updates.length > 1 && (
          <TouchableOpacity onPress={() => handleCardArrow('left')} style={styles.cardArrowBtn}>
            <Feather name="chevron-left" size={32} color="#fff" />
          </TouchableOpacity>
        )}
        <FlatList
          ref={flatListRef}
          data={updates}
          renderItem={renderUpdate}
          keyExtractor={item => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToAlignment="center"
          decelerationRate={0.95}
          contentContainerStyle={{ alignItems: 'center' }}
          style={{ flexGrow: 0 }}
          onMomentumScrollEnd={e => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / (width * 0.8));
            setActiveIndex(idx);
          }}
          getItemLayout={(_, index) => ({ length: width * 0.8, offset: width * 0.8 * index, index })}
        />
        {Platform.OS === 'web' && updates.length > 1 && (
          <TouchableOpacity onPress={() => handleCardArrow('right')} style={styles.cardArrowBtn}>
            <Feather name="chevron-right" size={32} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity style={styles.proceedBtn} onPress={() => navigation.replace('Dashboard')}>
        <LinearGradient
          colors={["#3a5a8c", "#22305a"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buttonGradient}
        >
          <Text style={styles.proceedBtnText}>Go to Dashboard</Text>
        </LinearGradient>
      </TouchableOpacity>
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
    width: width * 0.7,
    height: 260,
    backgroundColor: 'rgba(30,36,54,0.60)',
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    shadowColor: '#22305a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 12,
    marginHorizontal: 16,
    marginVertical: 12,
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
  proceedBtn: {
    width: '92%',
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 2,
    alignSelf: 'center',
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proceedBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    textShadowColor: '#1a2980',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
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
    textAlign: 'center',
    paddingHorizontal: 20,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
}); 