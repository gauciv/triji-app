import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Platform, Dimensions, Animated } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Feather } from '@expo/vector-icons';
import { auth } from '../config/firebaseConfig';
import { signOut } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const featureData = [
  { id: '1', title: 'Taskboard', icon: 'book-open', color: '#007AFF', gradient: ['#4F8CFF', '#7B9EFF'] },
  { id: '2', title: 'Announcements', icon: 'bell', color: '#FF6B35', gradient: ['#FF6B35', '#FFD23F'] },
  { id: '3', title: 'Grade Calculator', icon: 'calculator', color: '#AF52DE', gradient: ['#AF52DE', '#7B9EFF'] },
  { id: '4', title: 'Freedom Wall', icon: 'message-circle', color: '#34C759', gradient: ['#34C759', '#6FE29A'] },
  { id: '5', title: 'Student Profile', icon: 'user', color: '#FF9500', gradient: ['#FF9500', '#FFD23F'] },
];

// If odd number of cards, add a placeholder to align the last card
const getGridData = () => {
  const data = [...featureData];
  if (data.length % 2 !== 0) {
    data.push({ id: 'placeholder', placeholder: true });
  }
  return data;
};

export default function DashboardScreen({ navigation }) {
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Dynamic greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const [pressedId, setPressedId] = useState(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate('Login');
    } catch (error) {
      console.log('Logout error:', error.message);
    }
  };

  const renderFeatureCard = ({ item }) => {
    if (item.placeholder) {
      // Render an invisible placeholder to keep grid alignment
      return <View style={{ width: width * 0.44, height: 120, opacity: 0 }} />;
    }
    const scale = pressedId === item.id ? 1.04 : 1;
    return (
      <TouchableOpacity
        onPress={() => {
          if (item.title === 'Taskboard') navigation.navigate('Taskboard');
          else if (item.title === 'Announcements') navigation.navigate('Announcements');
          else if (item.title === 'Freedom Wall') navigation.navigate('FreedomWall');
          else if (item.title === 'Grade Calculator') navigation.navigate('GradeCalculator');
        }}
        activeOpacity={0.85}
        style={{ width: width * 0.44, alignItems: 'center', transform: [{ scale }] }}
        onPressIn={() => setPressedId(item.id)}
        onPressOut={() => setPressedId(null)}
      >
        <BlurView intensity={110} tint="dark" style={styles.featureCard}>
          <LinearGradient
            colors={item.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGlow}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color }]}> 
              <Feather name={item.icon} size={28} color="#FFFFFF" />
            </View>
          </LinearGradient>
          <Text style={styles.featureTitle}>{item.title}</Text>
        </BlurView>
      </TouchableOpacity>
    );
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <View style={styles.backgroundGradient} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Gradient background */}
      <LinearGradient
        colors={["#1B2845", "#23243a", "#22305a", "#3a5a8c", "#23243a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Floating blurred shapes */}
      <BlurView intensity={80} tint="dark" style={[styles.floatingShape, styles.shape1]} />
      <BlurView intensity={60} tint="light" style={[styles.floatingShape, styles.shape2]} />
      <BlurView intensity={50} tint="dark" style={[styles.floatingShape, styles.shape3]} />
      <View style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <TouchableOpacity 
          style={styles.profilePicture}
          onPress={() => navigation.navigate('AccountSettings')}
        >
          <Text style={styles.profileInitial}>U</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={getGridData()}
        renderItem={renderFeatureCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={[styles.gridContainer, { marginTop: 10, paddingBottom: 90 }]}
        columnWrapperStyle={styles.rowEvenly}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    textShadowColor: '#23243a',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 0.2,
  },
  profilePicture: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  profileInitial: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  gridContainer: {
    paddingHorizontal: 24,
    // paddingBottom: 100, // replaced with less padding in FlatList
  },
  row: {
    justifyContent: 'space-between',
  },
  rowEvenly: {
    justifyContent: 'space-evenly',
  },
  featureCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    marginBottom: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    shadowColor: '#7B9EFF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  iconGlow: {
    borderRadius: 24,
    padding: 2,
    marginBottom: 14,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  featureTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 2,
    letterSpacing: 0.1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
});