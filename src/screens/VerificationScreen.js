import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { auth } from '../config/firebaseConfig';
import { sendEmailVerification } from 'firebase/auth';
import { useState } from 'react';

const { width, height } = Dimensions.get('window');

export default function VerificationScreen({ navigation }) {
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);

  const handleResend = async () => {
    setResendLoading(true);
    setResendMessage('');
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setResendMessage('Verification email sent! Please check your inbox.');
        Alert.alert(
          'Email Sent',
          'Verification email sent successfully! Please check your inbox and spam folder.',
          [{ text: 'OK' }]
        );
        setResendDisabled(true);
        setTimeout(() => setResendDisabled(false), 30000); // 30 seconds cooldown
      } else {
        setResendMessage('No user is currently logged in.');
        Alert.alert(
          'Authentication Error',
          'No user is currently logged in. Please log in again.',
          [
            { text: 'OK', onPress: () => navigation.navigate('Login') }
          ]
        );
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      const errorMessage = error.code === 'auth/too-many-requests' 
        ? 'Too many requests. Please try again later.'
        : 'Failed to resend verification email. Please try again.';
      setResendMessage(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setResendLoading(false);
    }
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
      {/* Multi-color gradient background */}
      <LinearGradient
        colors={["#23243a", "#22305a", "#3a5a8c", "#23243a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Floating blurred shapes for depth */}
      <BlurView intensity={80} tint="dark" style={[styles.floatingShape, styles.shape1]} />
      <BlurView intensity={60} tint="light" style={[styles.floatingShape, styles.shape2]} />
      <BlurView intensity={50} tint="dark" style={[styles.floatingShape, styles.shape3]} />
      {/* Glassmorphic Card */}
      <BlurView intensity={110} tint="dark" style={styles.glassCard}>
        <View style={styles.iconWrapper}>
          <MaterialIcons name="mark-email-read" size={54} color="#34C759" style={styles.iconShadow} />
        </View>
        <Text style={styles.headline}>Verify Your Email</Text>
        <Text style={styles.message}>
          We’ve sent a verification link to your email address. Please check your inbox and click the link to verify your account.
        </Text>
        <Text style={styles.trustMessage}>
          Didn’t receive the email? You can resend it below. Make sure to check your spam or promotions folder as well.
        </Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('Login')}
        >
          <LinearGradient
            colors={["#3a5a8c", "#22305a"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.backButtonText}>Back to Login</Text>
          </LinearGradient>
        </TouchableOpacity>
        {/* Resend Verification Email Button */}
        <TouchableOpacity
          style={[styles.resendButton, resendDisabled && styles.resendButtonDisabled]}
          onPress={handleResend}
          disabled={resendLoading || resendDisabled}
        >
          <Text style={styles.resendButtonText}>
            {resendLoading ? 'Sending...' : 'Resend Verification Email'}
          </Text>
        </TouchableOpacity>
        {resendMessage ? (
          <Text style={styles.resendMessage}>{resendMessage}</Text>
        ) : null}
      </BlurView>
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
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -2,
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
  glassCard: {
    width: '92%',
    maxWidth: 420,
    backgroundColor: 'rgba(30, 36, 54, 0.60)',
    borderRadius: 32,
    padding: 38,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    shadowColor: '#22305a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 12,
    marginTop: 12,
  },
  iconWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(58, 90, 140, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: '#22305a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 10,
  },
  iconShadow: {
    textShadowColor: '#34C759',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  headline: {
    fontSize: 28,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    marginBottom: 14,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  message: {
    fontSize: 17,
    fontFamily: 'Inter_400Regular',
    color: '#B0FFCB',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 10,
    marginHorizontal: 4,
  },
  trustMessage: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 30,
    marginHorizontal: 4,
  },
  backButton: {
    width: '100%',
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 2,
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    textShadowColor: '#1a2980',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
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
  resendButton: {
    width: '100%',
    height: 48,
    backgroundColor: 'rgba(58,90,140,0.12)',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 2,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: '#3a5a8c',
    letterSpacing: 0.2,
  },
  resendMessage: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#34C759',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 2,
  },
});