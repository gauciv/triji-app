import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Linking, Platform, Image } from 'react-native';
import Checkbox from 'expo-checkbox';
import { BlurView } from 'expo-blur';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { auth, db } from '../config/firebaseConfig';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserMessage } from '../utils/errorHandler';

export default function RegisterScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agree, setAgree] = useState(false);

  const validateName = (name) => {
    return name.trim().length > 0 && !/\d/.test(name);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid = () => {
    return (
      validateName(firstName) &&
      validateName(lastName) &&
      validateEmail(email) &&
      password.trim().length > 0 &&
      password === confirmPassword &&
      agree
    );
  };

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, 'users', user.uid), {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        createdAt: new Date().toISOString(),
      });
      await sendEmailVerification(user);
      await AsyncStorage.setItem('user_session', JSON.stringify(user));
      navigation.navigate('Verification');
    } catch (error) {
      console.error('Registration error:', error);
      const userMessage = getUserMessage(error, 'Registration failed. Please try again.');
      setError(userMessage);
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
      <View style={styles.backgroundGradient} />
      <BlurView intensity={80} tint="dark" style={styles.glassCard}>
        <Text style={styles.greeting}>Welcome!,</Text>
        <Text style={styles.headline}>Let's Get You Started.</Text>
        <View style={styles.inputContainer}>
          <View style={styles.inputGroup}>
            <FontAwesome name="user-o" size={18} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, !validateName(firstName) && firstName.length > 0 && styles.inputError]}
              placeholder="First Name"
              placeholderTextColor="#8E8E93"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              selectionColor="#007AFF"
              underlineColorAndroid="transparent"
              {...(Platform.OS === 'web' ? { style: { ...styles.input, outline: 'none', boxShadow: 'none' } } : {})}
            />
          </View>
          <View style={styles.inputGroup}>
            <FontAwesome name="user-o" size={18} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, !validateName(lastName) && lastName.length > 0 && styles.inputError]}
              placeholder="Last Name"
              placeholderTextColor="#8E8E93"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              selectionColor="#007AFF"
              underlineColorAndroid="transparent"
              {...(Platform.OS === 'web' ? { style: { ...styles.input, outline: 'none', boxShadow: 'none' } } : {})}
            />
          </View>
          <View style={styles.inputGroup}>
            <Feather name="mail" size={18} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, !validateEmail(email) && email.length > 0 && styles.inputError]}
              placeholder="Email"
              placeholderTextColor="#8E8E93"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              selectionColor="#007AFF"
              underlineColorAndroid="transparent"
              {...(Platform.OS === 'web' ? { style: { ...styles.input, outline: 'none', boxShadow: 'none' } } : {})}
            />
          </View>
          <View style={styles.inputGroup}>
            <Feather name="lock" size={18} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, password.length > 0 && password.length < 6 && styles.inputError]}
              placeholder="Password"
              placeholderTextColor="#8E8E93"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              selectionColor="#007AFF"
              underlineColorAndroid="transparent"
              {...(Platform.OS === 'web' ? { style: { ...styles.input, outline: 'none', boxShadow: 'none' } } : {})}
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color="#8E8E93" />
            </TouchableOpacity>
          </View>
          <View style={styles.inputGroup}>
            <Feather name="lock" size={18} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, confirmPassword.length > 0 && confirmPassword !== password && styles.inputError]}
              placeholder="Confirm Password"
              placeholderTextColor="#8E8E93"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
              selectionColor="#007AFF"
              underlineColorAndroid="transparent"
              {...(Platform.OS === 'web' ? { style: { ...styles.input, outline: 'none', boxShadow: 'none' } } : {})}
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Feather name={showConfirmPassword ? 'eye-off' : 'eye'} size={18} color="#8E8E93" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.termsRow}>
          <Checkbox
            value={agree}
            onValueChange={setAgree}
            color={agree ? '#007AFF' : undefined}
            style={styles.checkbox}
          />
          <Text style={styles.termsText}>
            By creating an account, you agree to our{' '}
            <Text style={styles.link} onPress={() => Linking.openURL('https://yourapp.com/terms')}>Conditions of Use</Text> and{' '}
            <Text style={styles.link} onPress={() => Linking.openURL('https://yourapp.com/privacy')}>Privacy Notice</Text>
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.registerButton, (!isFormValid() || loading) && styles.registerButtonDisabled]}
          disabled={!isFormValid() || loading}
          onPress={handleRegister}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.registerButtonText}>Register</Text>
          )}
        </TouchableOpacity>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <View style={styles.bottomSection}>
          <View style={styles.logoBottom}>
            <Image 
              source={require('../../assets/icon.png')} 
              style={styles.logoImageBottom}
              resizeMode="contain"
            />
          </View>
          <View style={styles.loginContainer}>
            <Text style={styles.linkText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181C23',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#232A34',
    opacity: 0.7,
  },
  glassCard: {
    width: '92%',
    maxWidth: 400,
    backgroundColor: 'rgba(24, 28, 35, 0.85)',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  greeting: {
    fontSize: 16,
    color: '#B0B3B8',
    fontFamily: 'Inter_400Regular',
    marginBottom: 2,
    alignSelf: 'flex-start',
  },
  headline: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 18,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
  },
  eyeIcon: {
    padding: 4,
  },
  inputError: {
    borderColor: '#FF3B30',
    borderWidth: 1.5,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    width: '100%',
  },
  checkbox: {
    marginRight: 8,
    marginLeft: 2,
  },
  termsText: {
    color: '#8E8E93',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    flex: 1,
    flexWrap: 'wrap',
  },
  link: {
    color: '#007AFF', // blue
    textDecorationLine: 'underline',
    fontFamily: 'Inter_500Medium',
  },
  brandTextT: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: '#007AFF', // blue
    marginBottom: 2,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  registerButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#111216',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    marginTop: 2,
    shadowColor: '#7B61FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  registerButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
    letterSpacing: 0.3,
  },
  registerButtonDisabled: {
    backgroundColor: '#232A34',
    opacity: 0.6,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: 4,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    padding: 10,
    borderRadius: 8,
    width: '100%',
  },
  bottomSection: {
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  brandText: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    marginBottom: 2,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    paddingVertical: 2,
  },
  linkText: {
    color: '#8E8E93',
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
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
  logoBottom: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  logoImageBottom: {
    width: '100%',
    height: '100%',
  },
});