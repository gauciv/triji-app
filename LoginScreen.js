
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Pressable, Platform, ScrollView } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import Feather from 'react-native-vector-icons/Feather';

export default function LoginScreen({ navigation }) {
  // State is now hardcoded to match the reference image's appearance
  const [email, setEmail] = useState('someone@gmail.com');
  const [password, setPassword] = useState('•'); // To show the single dot as in the image
  const [rememberMe, setRememberMe] = useState(false);

  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Colors are static for light mode
  const colors = {
    blue: '#222', // Use dark gray for primary
    lightBg: '#F5F5F5', // Very light gray background
    cardLight: '#fff', // Card stays white for contrast
    textDark: '#111', // Almost black for text
    textLight: '#666', // Medium gray for secondary text
    inputBorderLight: '#D1D1D1', // Subtle gray border
    white: '#fff',
    separator: '#E0E0E0',
  };

  const theme = {
    container: {
      flex: 1,
      backgroundColor: colors.lightBg,
    },
    // Header is a simple rectangle with a rounded bottom
    header: {
      backgroundColor: colors.blue,
      paddingTop: Platform.OS === 'ios' ? 70 : 60,
      paddingBottom: 60, // Padding to allow the card to overlap into it
      paddingHorizontal: 24,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
    headerTitle: {
      color: colors.white,
      fontSize: 28,
      fontFamily: 'Inter_600SemiBold',
      marginBottom: 6,
    },
    headerSubtitle: {
      color: colors.white,
      fontSize: 16,
      fontFamily: 'Inter_400Regular',
      opacity: 0.9,
    },
    // The card is pulled up to overlap with the header's bottom padding
    card: {
      width: '100%',
      maxWidth: '100%',
      backgroundColor: colors.cardLight,
      borderRadius: 20,
      marginTop: -40, // Negative margin pulls the card up
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.08,
      shadowRadius: 20,
      elevation: 10,
      alignSelf: 'stretch',
      flexGrow: 1,
      justifyContent: 'center',
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardLight,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: colors.inputBorderLight,
      marginBottom: 20,
      height: 48,
      width: '85%',
      alignSelf: 'center',
      position: 'relative',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    input: {
      flex: 1,
      height: '100%',
      color: colors.textDark,
      fontSize: 16,
      fontFamily: 'Inter_400Regular',
      backgroundColor: 'transparent',
      paddingLeft: 18,
      paddingRight: 44,
      letterSpacing: 0.1,
    },
    inputIcon: {
      position: 'absolute',
      right: 20,
      color: colors.textLight,
      opacity: 0.8,
    },
    optionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 20,
      marginBottom: 28,
    },
    rememberMe: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 1.5,
      borderColor: '#B0B0B0',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    },
    checkboxIcon: {
      color: colors.blue,
      fontSize: 16,
    },
    rememberMeText: {
      fontFamily: 'Inter_400Regular',
      color: colors.textLight,
      fontSize: 14,
    },
    needHelp: {
      color: colors.textDark,
      fontSize: 14,
      fontFamily: 'Inter_500Medium',
    },
    signInButton: {
      backgroundColor: colors.textDark,
      borderRadius: 30,
      paddingVertical: 16,
      alignItems: 'center',
      shadowColor: '#222',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.13,
      shadowRadius: 8,
      elevation: 6,
      width: '100%',
    },
    signInButtonText: {
      color: colors.white,
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
    },
    separator: {
      height: 1,
      backgroundColor: colors.separator,
      width: '100%',
      marginVertical: 24,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    footerText: {
      color: colors.textLight,
      fontSize: 15,
      fontFamily: 'Inter_400Regular',
      marginRight: 4,
    },
    registerLink: {
      color: colors.textDark,
      fontSize: 15,
      fontFamily: 'Inter_600SemiBold',
      textDecorationLine: 'underline',
    },
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={theme.container}>
      <View style={{ flex: 1 }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={theme.header}>
            <Text style={[theme.headerTitle, { fontWeight: 'bold' }]}>Welcome Back</Text>
            <Text style={[theme.headerSubtitle, { fontStyle: 'italic' }]}>Your dashboard is waiting.</Text>
          </View>

      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <View style={[
          theme.card,
          {
            justifyContent: 'flex-start',
            paddingTop: 44,
            shadowColor: '#1877F2',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.18,
            shadowRadius: 24,
            elevation: 24,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
          },
        ]}>
          <View style={{ width: '100%', marginTop: 0, marginBottom: 10 }}>
            <Text style={{
              fontFamily: 'Inter_600SemiBold',
              fontWeight: 'bold',
              fontSize: 18,
              color: '#222B45',
              marginLeft: '7.5%',
              marginBottom: 36,
              letterSpacing: 0.1
            }}>LOGIN</Text>
            <View style={{ alignItems: 'center', width: '100%' }}>
              <View style={theme.inputRow}>
                <TextInput
                  style={theme.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="someone@gmail.com"
                  placeholderTextColor="#B0B0B0"
                />
                <Feather name="user" size={20} style={theme.inputIcon} />
              </View>

              <View style={theme.inputRow}>
                <TextInput
                  style={theme.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder=""
                  placeholderTextColor="#B0B0B0"
                />
                <Feather name="lock" size={20} style={theme.inputIcon} />
              </View>
            </View>

            <View style={{ width: '85%', alignSelf: 'center', marginTop: 18, marginBottom: 0 }}>
              <Pressable style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => setRememberMe((prev) => !prev)}>
                <View style={theme.checkbox}>
                  {rememberMe && <Feather name="check" style={theme.checkboxIcon} />}
                </View>
                <Text style={theme.rememberMeText}>Remember Me</Text>
              </Pressable>
            </View>
            <View style={{ width: '85%', alignSelf: 'center', flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 28, justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', color: '#222B45', fontSize: 13 }}>Need Help?</Text>
              <TouchableOpacity style={{ backgroundColor: colors.textDark, borderRadius: 24, paddingHorizontal: 24, paddingVertical: 8, shadowColor: '#222', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.13, shadowRadius: 6, elevation: 4 }}>
                <Text style={{ color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 15 }}>Sign In</Text>
              </TouchableOpacity>
            </View>

            <View style={theme.separator} />

            <View style={theme.footer}>
              <Text style={theme.footerText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={theme.registerLink}>Register instead</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
        </ScrollView>
      </View>
    </View>
  );
}