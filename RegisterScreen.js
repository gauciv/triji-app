import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Feather } from '@expo/vector-icons';

export default function RegisterScreen() {
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
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGradient} />
      
      <BlurView intensity={20} style={styles.glassCard}>
        <Text style={styles.headline}>Create Account</Text>
        
        <View style={styles.logo}>
          <Text style={styles.logoText}>T</Text>
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, !validateName(firstName) && firstName.length > 0 && styles.inputError]}
            placeholder="First Name"
            placeholderTextColor="#8E8E93"
            value={firstName}
            onChangeText={setFirstName}
          />
          
          <TextInput
            style={[styles.input, !validateName(lastName) && lastName.length > 0 && styles.inputError]}
            placeholder="Last Name"
            placeholderTextColor="#8E8E93"
            value={lastName}
            onChangeText={setLastName}
          />
          
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
                size={20} 
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
        
        <TouchableOpacity style={styles.linkContainer}>
          <Text style={styles.link}>Already have an account? Log In</Text>
        </TouchableOpacity>
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
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  headline: {
    fontSize: 28,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    marginBottom: 32,
    textAlign: 'center',
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: 28,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: 16,
  },
  passwordInput: {
    width: '100%',
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingRight: 50,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 18,
    padding: 4,
  },
  registerButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#007AFF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonText: {
    fontSize: 17,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
  },
  linkContainer: {
    marginVertical: 8,
  },
  link: {
    color: '#007AFF',
    fontSize: 16,
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
});