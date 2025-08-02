import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, KeyboardAvoidingView, Dimensions, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Feather } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { auth, db } from '../config/firebaseConfig';
import { signOut, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleGoogleSignIn = () => {
    // TODO: Implement Google Sign-In
    Alert.alert('Coming Soon', 'Google Sign-In will be available soon!');
  };

  const handleFacebookSignIn = () => {
    // TODO: Implement Facebook Sign-In
    Alert.alert('Coming Soon', 'Facebook Sign-In will be available soon!');
  };
  
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        {/* Enhanced gradient background with better color distribution */}
        <LinearGradient
          colors={["#1B2845", "#23243a", "#22305a", "#3a5a8c", "#23243a", "#1B2845"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.shiningGradient}
        />
        
        {/* Refined glow circles with better positioning and opacity */}
        <View style={styles.glowCircle1} />
        <View style={styles.glowCircle2} />
        <View style={styles.glowCircle3} />
        
        {/* Subtle floating elements for visual interest */}
        <View style={styles.floatingElement2} />
        <View style={styles.floatingElement3} />
        <View style={styles.floatingElement4} />
        
        {/* Main card container with refined styling */}
        <View style={styles.mainCardContainer}>
          {/* Enhanced login icon with better layering */}
          <View style={styles.loginCircleWrapper}>
            <View style={styles.loginCircleGlow} />
            <View style={styles.loginCircleOutline}>
              <View style={styles.loginIconContainer}>
                <MaterialIcons name="login" size={38} color="#22e584" style={styles.loginIcon} />
              </View>
            </View>
          </View>
          
          {/* Refined title and subtext with better typography */}
          <Text style={styles.headerTitleModernCard}>Welcome Back</Text>
          <Text style={styles.headerSubtextCard}>Sign in to access your dashboard</Text>
          
          {/* Enhanced decorative separator */}
          <View style={styles.separatorLine} />
          
          {/* Refined Social Login Buttons */}
          <View style={styles.socialButtonsContainer}>
            {/* Google Sign-In Button - Enhanced */}
            <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
              <View style={styles.socialButtonContent}>
                <View style={styles.googleIconContainer}>
                  <Text style={styles.googleGLogo}>G</Text>
                </View>
                <Text style={styles.googleButtonText}>Sign in with Google</Text>
              </View>
              <View style={styles.buttonGlow} />
            </TouchableOpacity>
            
            {/* Facebook Sign-In Button - Enhanced */}
            <TouchableOpacity style={styles.facebookButton} onPress={handleFacebookSignIn}>
              <View style={styles.socialButtonContent}>
                <View style={styles.facebookIconContainer}>
                  <MaterialIcons name="facebook" size={26} color="#FFFFFF" />
                </View>
                <Text style={styles.facebookButtonText}>Sign in with Facebook</Text>
              </View>
              <View style={styles.buttonGlow} />
            </TouchableOpacity>
          </View>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          {/* Enhanced bottom decoration */}
          <View style={styles.bottomDecoration} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  shiningGradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  glowCircle1: {
    position: 'absolute',
    top: 100,
    left: '50%',
    marginLeft: -110,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#22e58415',
    opacity: 0.7,
    zIndex: 1,
    shadowColor: '#22e584',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 90,
    elevation: 18,
  },
  glowCircle2: {
    position: 'absolute',
    top: 220,
    right: -60,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#3a5a8c18',
    opacity: 0.5,
    zIndex: 1,
    shadowColor: '#3a5a8c',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 70,
    elevation: 12,
  },
  glowCircle3: {
    position: 'absolute',
    bottom: 180,
    left: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#22305a20',
    opacity: 0.6,
    zIndex: 1,
    shadowColor: '#22305a',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 50,
    elevation: 10,
  },
  floatingElement1: {
    position: 'absolute',
    top: 140,
    left: 40,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22e584',
    opacity: 0.8,
    zIndex: 1,
  },
  floatingElement2: {
    position: 'absolute',
    top: 200,
    right: 50,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3a5a8c',
    opacity: 0.7,
    zIndex: 1,
  },
  floatingElement3: {
    position: 'absolute',
    bottom: 220,
    left: '50%',
    marginLeft: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22e584',
    opacity: 0.9,
    zIndex: 1,
  },
  floatingElement4: {
    position: 'absolute',
    top: 280,
    left: 80,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#22305a',
    opacity: 0.6,
    zIndex: 1,
  },
  mainCardContainer: {
    marginTop: 140,
    marginBottom: 50,
    marginHorizontal: 18,
    backgroundColor: 'rgba(18, 22, 34, 0.96)',
    borderRadius: 36,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 40,
    paddingHorizontal: 0,
    shadowColor: '#22e584',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 48,
    elevation: 24,
    maxWidth: 460,
    alignSelf: 'center',
    width: '88%',
    position: 'relative',
    zIndex: 2,
    flexDirection: 'column',
    display: 'flex',
    flex: 1,
  },
  loginCircleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 0,
    width: '100%',
    zIndex: 3,
    position: 'relative',
  },
  loginCircleGlow: {
    position: 'absolute',
    top: -4,
    left: '50%',
    marginLeft: -38,
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#22e58440',
    opacity: 0.9,
    zIndex: 2,
    shadowColor: '#22e584',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 36,
    elevation: 16,
  },
  loginCircleOutline: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
    borderWidth: 3.5,
    borderColor: '#22e584',
    backgroundColor: 'rgba(34, 229, 132, 0.12)',
    shadowColor: 'transparent',
  },
  loginIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(34, 229, 132, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginIcon: {
    zIndex: 4,
    textShadowColor: '#22e58499',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
  },
  headerTitleModernCard: {
    fontSize: 34,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    textAlign: 'center',
    width: '100%',
    marginBottom: 10,
    marginTop: 0,
    letterSpacing: 0.4,
    zIndex: 3,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  headerSubtextCard: {
    fontSize: 17,
    fontFamily: 'Inter_400Regular',
    color: '#b6c2d1',
    textAlign: 'center',
    width: '100%',
    marginBottom: 36,
    marginTop: 0,
    opacity: 0.92,
    zIndex: 3,
    lineHeight: 26,
    letterSpacing: 0.2,
  },
  separatorLine: {
    width: '65%',
    height: 3,
    backgroundColor: 'rgba(34, 229, 132, 0.35)',
    borderRadius: 2,
    marginBottom: 44,
    zIndex: 3,
  },
  socialButtonsContainer: {
    width: '82%',
    gap: 24,
    marginBottom: 44,
    zIndex: 3,
  },
  googleButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 22,
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  facebookButton: {
    width: '100%',
    backgroundColor: '#1877F2',
    borderRadius: 22,
    paddingVertical: 22,
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: 'rgba(24, 119, 242, 0.5)',
    shadowColor: '#1877F2',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  googleIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(234, 67, 53, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  facebookIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  googleButtonText: {
    color: '#333333',
    fontSize: 19,
    fontWeight: 'bold',
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.3,
  },
  facebookButtonText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: 'bold',
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.3,
  },
  googleGLogo: {
    fontSize: 30,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
    color: '#EA4335',
    textAlign: 'center',
    lineHeight: 36,
  },
  buttonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 22,
    zIndex: 1,
  },
  bottomDecoration: {
    width: '45%',
    height: 5,
    backgroundColor: 'rgba(34, 229, 132, 0.25)',
    borderRadius: 3,
    marginTop: 'auto',
    zIndex: 3,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    marginBottom: 10,
    textAlign: 'center',
    zIndex: 3,
  },
});