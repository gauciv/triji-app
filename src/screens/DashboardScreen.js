import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Platform, Dimensions, Animated } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Feather } from '@expo/vector-icons';
import { auth } from '../config/firebaseConfig';
import { signOut } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

// Enhanced responsive helpers
const isTablet = width > 768;
const isPhone = width <= 768;
const isMobile = width <= 480;

// Remove grid/2-column logic and card width
const getCardDimensions = () => {
  return {
    padding: 16,
    radius: 16,
    fontSize: 14,
    iconSize: 28,
    spacing: 16, // slightly larger for better separation
    minHeight: 38,
  };
};
const CARD_DIMS = getCardDimensions();

// Header/grid left padding (align grid with greeting)
const getHeaderPadding = () => {
  if (isTablet) return 64;
  if (isMobile) return 16;
  return 32;
};

const featureData = [
  { id: '1', title: 'Taskboard', icon: 'book-open', color: '#007AFF', gradient: ['#4F8CFF', '#7B9EFF'] },
  { id: '2', title: 'Announcements', icon: 'bell', color: '#FF6B35', gradient: ['#FF6B35', '#FFD23F'] },
  { id: '3', title: 'Grade Calculator', icon: 'calculator', color: '#AF52DE', gradient: ['#AF52DE', '#7B9EFF'] },
  { id: '4', title: 'Freedom Wall', icon: 'message-circle', color: '#34C759', gradient: ['#34C759', '#6FE29A'] },
  { id: '5', title: 'Student Profile', icon: 'user', color: '#FF9500', gradient: ['#FF9500', '#FFD23F'] },
];

// Better grid data handling
const getGridData = () => {
  const data = [...featureData];
  // Only add placeholder if we have an odd number and we're not on a single column layout
  if (data.length % 2 !== 0 && !isMobile) {
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
      return null;
    }

    const scale = pressedId === item.id ? 0.96 : 1;
    const isPressed = pressedId === item.id;

    return (
      <TouchableOpacity
        onPress={() => {
          if (item.title === 'Taskboard') navigation.navigate('Taskboard');
          else if (item.title === 'Announcements') navigation.navigate('Announcements');
          else if (item.title === 'Freedom Wall') navigation.navigate('FreedomWall');
          else if (item.title === 'Grade Calculator') navigation.navigate('GradeCalculator');
        }}
        activeOpacity={0.9}
        style={[
          styles.cardTouchable,
          {
            transform: [{ scale }],
            opacity: isPressed ? 0.8 : 1,
          }
        ]}
        onPressIn={() => setPressedId(item.id)}
        onPressOut={() => setPressedId(null)}
      >
        <BlurView 
          intensity={isPressed ? 160 : 120} 
          tint="dark" 
          style={[
            styles.featureCard, 
            {
              borderRadius: CARD_DIMS.radius * 1.5,
              padding: CARD_DIMS.padding,
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderWidth: 1.5,
              borderColor: isPressed ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.28)',
              shadowColor: '#fff',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.10,
              shadowRadius: 24,
              elevation: 16,
              minHeight: CARD_DIMS.minHeight,
            }
          ]}
        >
          <LinearGradient
            colors={item.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.iconGlow,
              {
                width: CARD_DIMS.iconSize + 20,
                height: CARD_DIMS.iconSize + 20,
                borderRadius: (CARD_DIMS.iconSize + 20) / 2,
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: item.color,
                  width: CARD_DIMS.iconSize + 16,
                  height: CARD_DIMS.iconSize + 16,
                  borderRadius: (CARD_DIMS.iconSize + 16) / 2,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              ]}
            >
              <Feather name={item.icon} size={CARD_DIMS.iconSize} color="#FFFFFF" />
            </View>
          </LinearGradient>
          <Text style={[
            styles.featureTitle, 
            { 
              fontSize: CARD_DIMS.fontSize,
              marginTop: CARD_DIMS.spacing / 2,
            }
          ]}>
            {item.title}
          </Text>
        </BlurView>
      </TouchableOpacity>
    );
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={["#1B2845", "#23243a", "#22305a", "#3a5a8c", "#23243a"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Enhanced gradient background */}
      <LinearGradient
        colors={["#1B2845", "#23243a", "#22305a", "#3a5a8c", "#23243a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      {/* More sophisticated floating shapes */}
      <BlurView intensity={70} tint="dark" style={[styles.floatingShape, styles.shape1]} />
      <BlurView intensity={50} tint="light" style={[styles.floatingShape, styles.shape2]} />
      <BlurView intensity={40} tint="dark" style={[styles.floatingShape, styles.shape3]} />
      {isTablet && <BlurView intensity={30} tint="light" style={[styles.floatingShape, styles.shape4]} />}
      
      {/* Improved header with better alignment */}
      <View style={[styles.header, { paddingHorizontal: getHeaderPadding() }]}>
        <View style={styles.greetingContainer}>
          <Text style={[
            styles.greeting,
            { 
              fontSize: isTablet ? 32 : isMobile ? 24 : 28,
              marginBottom: 4,
            }
          ]}>
            {getGreeting()}
          </Text>
          <View style={styles.greetingUnderline} />
        </View>
        <TouchableOpacity 
          style={[
            styles.profilePicture,
            {
              width: isTablet ? 52 : isMobile ? 40 : 44,
              height: isTablet ? 52 : isMobile ? 40 : 44,
              borderRadius: isTablet ? 26 : isMobile ? 20 : 22,
            }
          ]}
          onPress={() => navigation.navigate('AccountSettings')}
        >
          <Text style={[
            styles.profileInitial,
            { fontSize: isTablet ? 22 : isMobile ? 16 : 18 }
          ]}>
            U
          </Text>
        </TouchableOpacity>
      </View>

      {/* Enhanced grid with better spacing */}
      <FlatList
        data={featureData}
        renderItem={renderFeatureCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridListContainer}
        columnWrapperStyle={styles.gridRow}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: CARD_DIMS.spacing }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  gridListContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16, // gap between columns
  },
  floatingShape: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.15,
    zIndex: -1,
  },
  shape1: {
    width: isTablet ? 400 : 300,
    height: isTablet ? 240 : 180,
    top: height * 0.08,
    left: width * 0.05,
    backgroundColor: '#22305a',
  },
  shape2: {
    width: isTablet ? 160 : 120,
    height: isTablet ? 160 : 120,
    bottom: height * 0.2,
    right: width * 0.1,
    backgroundColor: '#3a5a8c',
  },
  shape3: {
    width: isTablet ? 120 : 90,
    height: isTablet ? 120 : 90,
    top: height * 0.5,
    right: width * 0.2,
    backgroundColor: '#23243a',
  },
  shape4: {
    width: 80,
    height: 80,
    top: height * 0.3,
    left: width * 0.8,
    backgroundColor: '#4F8CFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 32,
  },
  greetingContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  greeting: {
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(35, 36, 58, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
    letterSpacing: 0.3,
  },
  greetingUnderline: {
    width: 40,
    height: 3,
    backgroundColor: '#007AFF',
    borderRadius: 2,
    marginTop: 6,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  profilePicture: {
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileInitial: {
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  gridContainer: {
    flexGrow: 1,
  },
  rowWrapper: {
    justifyContent: 'space-evenly',
    marginBottom: CARD_DIMS.spacing,
    paddingHorizontal: 4,
  },
  cardTouchable: {
    flex: 1,
    alignItems: 'center',
    marginBottom: 0,
    width: undefined,
    minWidth: 0,
  },
  featureCard: {
    width: '100%',
    backgroundColor: 'rgba(30, 36, 54, 0.65)',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#7B9EFF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    overflow: 'hidden',
    minHeight: 38,
  },
  iconGlow: {
    padding: 3,
    marginBottom: CARD_DIMS.spacing,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureTitle: {
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.2,
    lineHeight: CARD_DIMS.fontSize * 1.3,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter_400Regular',
  },
});