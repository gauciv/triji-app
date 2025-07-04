import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Feather } from '@expo/vector-icons';

export default function RegisterScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const validateName = (name) => {
    return name.trim().length > 0 && !/\d/.test(name);
  };
  
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const isFormValid = () => {
    return validateName(firstName) && 
           validateName(lastName) && 
           validateEmail(email) && 
           password.trim().length > 0;
  };
  
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
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
        <Text style={styles.headline}>Create Account</Text>
        
        <View style={styles.logo}>
          <Text style={styles.logoText}>T</Text>
        </View>
        
        <View style={styles.inputContainer}>
          <View style={styles.nameGroup}>
            <TextInput
              style={[styles.nameInput, !validateName(firstName) && firstName.length > 0 && styles.inputError]}
              placeholder="First Name"
              placeholderTextColor="#8E8E93"
              value={firstName}
              onChangeText={setFirstName}
            />
            
            <TextInput
              style={[styles.nameInput, !validateName(lastName) && lastName.length > 0 && styles.inputError]}
              placeholder="Last Name"
              placeholderTextColor="#8E8E93"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>
          
          <TextInput
            style={[styles.input, !validateEmail(email) && email.length > 0 && styles.inputError]}
            placeholder="Email"
            placeholderTextColor="#8E8E93"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor="#8E8E93"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity 
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Feather 
                name={showPassword ? 'eye-off' : 'eye'} 
                size={18} 
                color="#8E8E93" 
              />
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.registerButton, !isFormValid() && styles.registerButtonDisabled]}
          disabled={!isFormValid()}
        >
          <Text style={styles.registerButtonText}>Register</Text>
        </TouchableOpacity>
        
        <View style={styles.loginContainer}>
          <Text style={styles.linkText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Log In</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
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
  glassCard: {
    width: '90%',
    maxWidth: 420,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headline: {
    fontSize: 28,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  logoText: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 32,
  },
  nameGroup: {
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 52,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    paddingHorizontal: 18,
    marginBottom: 16,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  nameInput: {
    width: '100%',
    height: 52,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    paddingHorizontal: 18,
    marginBottom: 12,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: 8,
  },
  passwordInput: {
    width: '100%',
    height: 52,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingRight: 50,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  eyeIcon: {
    position: 'absolute',
    right: 14,
    top: 16,
    padding: 4,
  },
  registerButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#007AFF',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 28,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  registerButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  link: {
    color: '#007AFF',
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  inputError: {
    borderColor: '#FF3B30',
    borderWidth: 1.5,
  },
  registerButtonDisabled: {
    backgroundColor: '#4A4A4A',
    opacity: 0.6,
  },
  loginContainer: {
    flexDirection: 'row',
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
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
});