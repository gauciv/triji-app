import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Background Card with Header */}
          <View style={styles.bgCard}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Your dashboard is waiting.</Text>
          </View>

          {/* Login Card Overlay */}
          <View style={styles.loginCard}>
            <Text style={styles.loginLabel}>LOGIN</Text>
            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="username"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
              <Feather name="user" size={20} color="#888" style={styles.inputIcon} />
            </View>
            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="password"
                placeholderTextColor="#888"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#888"
                  style={styles.inputIcon}
                />
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
              <Text style={styles.needHelp}>Need Help?</Text>
            </View>
            {/* Sign In Button */}
            <TouchableOpacity style={styles.signInButton}>
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            {/* Footer inside card for spacing */}
            <View style={styles.footerCardSpacer} />
          </View>

          {/* Footer below cards */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const CARD_RADIUS = 28;
const LOGIN_CARD_WIDTH = width * 0.9;
const LOGIN_CARD_MARGIN_TOP = -CARD_RADIUS * 0.7;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgCard: {
    width: '100%',
    backgroundColor: '#000',
    borderRadius: CARD_RADIUS,
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 48,
    marginBottom: LOGIN_CARD_MARGIN_TOP,
    // shadow for separation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  subtitle: {
    color: '#B0B0B0',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  loginCard: {
    width: LOGIN_CARD_WIDTH,
    backgroundColor: '#23232b',
    borderRadius: CARD_RADIUS,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    marginTop: LOGIN_CARD_MARGIN_TOP,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  loginLabel: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
    alignSelf: 'flex-start',
    marginBottom: 22,
    marginLeft: 2,
    letterSpacing: 1.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181c',
    borderRadius: 25,
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingVertical: 2,
    width: '100%',
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    paddingVertical: 12,
  },
  inputIcon: {
    marginLeft: 10,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginVertical: 12,
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
    borderColor: '#888',
    backgroundColor: 'transparent',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: '#3B82F6',
    backgroundColor: '#3B82F6',
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  rememberMe: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  needHelp: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'Inter_600SemiBold',
  },
  signInButton: {
    width: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 24,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
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
    backgroundColor: '#2a2a2a',
    marginVertical: 2,
  },
  footerCardSpacer: {
    height: 0,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    justifyContent: 'center',
  },
  footerText: {
    color: '#B0B0B0',
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  footerLink: {
    color: '#3B82F6',
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'Inter_600SemiBold',
    marginLeft: 2,
    textDecorationLine: 'underline',
  },
});
