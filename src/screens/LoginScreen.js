import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Dimensions, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Feather } from '@expo/vector-icons';
import { auth, db } from '../config/firebaseConfig';
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const CARD_RADIUS = 28;
const LOGIN_CARD_WIDTH = width * 0.9;
const LOGIN_CARD_HEIGHT = height * 0.75; // Increased height
const LOGIN_CARD_MARGIN_TOP = -CARD_RADIUS * 0.7;

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const handleForgotPassword = async () => {
    setResetLoading(true);
    setResetMessage('');
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage('If an account exists for that email, a reset link has been sent.');
      setTimeout(() => {
        setShowForgotModal(false);
        setResetEmail('');
        setResetMessage('');
      }, 2000);
    } catch (error) {
      console.log('Password reset error:', error.message);
      setResetMessage('Please enter a valid email address.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if user document exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // User document doesn't exist, log them out and show error
        await signOut(auth);
        setError('Your account data could not be found. Please contact support.');
        return;
      }
      
      // Check if email is verified
      if (!user.emailVerified) {
        // Email not verified, send new verification and log out
        try {
          await sendEmailVerification(user);
        } catch (verificationError) {
          console.log('Error sending verification email:', verificationError);
        }
        await signOut(auth);
        setError('Please verify your email address before logging in. A new verification link has been sent.');
        return;
      }
      
      // User document exists and email verified, proceed with login
      if (!userCredential.user.emailVerified) {
        setError('Please verify your email before logging in. Check your inbox for the verification link.');
        // Optionally, you could offer to resend the verification email here.
        return;
      }
      await AsyncStorage.setItem('user_session', JSON.stringify(user));
      console.log('Login successful:', user.email);
      navigation.navigate('Dashboard');
    } catch (error) {
      console.log('Login error:', error.message);
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
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
      <LinearGradient
        colors={['#1e2756', '#253164', '#2d407e']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.5, 1]}
      >
        {/* Background Card with Header */}
        <View style={styles.bgCard}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Your dashboard is waiting.</Text>
        </View>

        {/* Login Card Overlay */}
        <View style={[styles.loginCard, { backgroundColor: 'rgba(27, 33, 64, 0.95)' }]}>
          <Text style={styles.loginLabel}>LOGIN</Text>
          {/* Username Input */}
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="username"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
            <Feather name="user" size={20} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
          </View>
          {/* Password Input */}
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="password"
              placeholderTextColor="rgba(255,255,255,0.5)"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
            </TouchableOpacity>
          </View>
          {/* Options Row */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe ? <View style={styles.checkboxInner} /> : null}
              </View>
              <Text style={styles.rememberMe}>Remember Me</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Alert.alert('Help', 'Please contact support or use the password reset option.')}> 
              <Text style={styles.needHelp}>Need Help?</Text>
            </TouchableOpacity>
          </View>
          {/* Sign In Button */}
          <TouchableOpacity style={styles.signInButton} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signInButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <View style={styles.divider} />
          {/* Footer inside card for spacing */}
          <View style={styles.footerCardSpacer} />
          {/* Footer inside login card */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e2756', // Updated fallback color
  },
  bgCard: {
    width: '100%',
    backgroundColor: 'rgba(27, 33, 64, 0.85)',
    borderRadius: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    alignItems: 'flex-start',
    paddingTop: 56,
    paddingBottom: 120,
    paddingLeft: 28,
    paddingRight: 28,
    marginBottom: LOGIN_CARD_MARGIN_TOP,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 15,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
    marginTop: 40,
    marginBottom: 8,
    letterSpacing: 0.2,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    fontStyle: 'italic',
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  loginCard: {
    height: LOGIN_CARD_HEIGHT,
    width: '100%',
    borderRadius: CARD_RADIUS,
    paddingTop: 48,
    paddingBottom: 48,
    paddingLeft: 28,
    paddingRight: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    marginTop: LOGIN_CARD_MARGIN_TOP - 20,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.35,
    shadowRadius: 35,
    elevation: 20,
    justifyContent: 'flex-start',
  },
  loginLabel: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
    alignSelf: 'flex-start',
    marginBottom: 40,
    marginLeft: 2,
    letterSpacing: 1.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(27, 33, 64, 0.92)',
    borderRadius: 25,
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 2,
    width: '100%',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    paddingVertical: 12,
    borderWidth: 0,
    borderColor: 'transparent',
    outlineStyle: 'none',
    outlineWidth: 0,
    outlineColor: 'transparent',
  },
  inputIcon: {
    marginLeft: 10,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'transparent',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: '#fff',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  rememberMe: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  needHelp: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'Inter_600SemiBold',
  },
  signInButton: {
    width: '100%',
    backgroundColor: '#3b4d94',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 2,
    marginBottom: 40,
  },
  footerCardSpacer: {
    flex: 1,  // This will push the footer to the bottom
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
    marginBottom: 0,
  },
  footerText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  footerLink: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'Inter_600SemiBold',
    marginLeft: 2,
    textDecorationLine: 'underline',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    marginBottom: 10,
    textAlign: 'center',
  },
});