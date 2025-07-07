import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import {
  SplashScreen,
  LoginScreen,
  RegisterScreen,
  VerificationScreen,
  DashboardScreen,
  AnnouncementsScreen,
  ProfileScreen,
  CreateAnnouncementScreen,
  AnnouncementDetailScreen,
  ArchivedAnnouncementsScreen,
  AccountSettingsScreen,
  EditProfileScreen,
  GradeCalculatorScreen
} from './src/screens';
import { initializeApp } from 'firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator();

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

export default function App() {
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [initialRouteName, setInitialRouteName] = useState('Login');

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const savedSession = await AsyncStorage.getItem('user_session');
        if (savedSession) {
          setInitialRouteName('Dashboard');
        } else {
          setInitialRouteName('Login');
        }
      } catch (error) {
        console.log('Error checking session:', error);
        setInitialRouteName('Login');
      }
    };

    const initializeFirebase = async () => {
      try {
        initializeApp(firebaseConfig);
        await checkUserSession();
        setIsFirebaseReady(true);
      } catch (error) {
        console.log('Firebase initialization error:', error);
      }
    };

    initializeFirebase();
  }, []);

  if (!isFirebaseReady) {
    return (
      <>
        <SplashScreen />
        <StatusBar style="light" />
      </>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={initialRouteName}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Verification" component={VerificationScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Announcements" component={AnnouncementsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="CreateAnnouncement" component={CreateAnnouncementScreen} />
        <Stack.Screen name="AnnouncementDetail" component={AnnouncementDetailScreen} />
        <Stack.Screen name="ArchivedAnnouncements" component={ArchivedAnnouncementsScreen} />
        <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="GradeCalculator" component={GradeCalculatorScreen} />
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}