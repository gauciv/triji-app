import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import SplashScreen from './SplashScreen';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import VerificationScreen from './VerificationScreen';
import DashboardScreen from './DashboardScreen';
import AnnouncementsScreen from './AnnouncementsScreen';
import ProfileScreen from './ProfileScreen';
import CreateAnnouncementScreen from './CreateAnnouncementScreen';
import AnnouncementDetailScreen from './AnnouncementDetailScreen';
import ArchivedAnnouncementsScreen from './ArchivedAnnouncementsScreen';
import { initializeApp } from 'firebase/app';

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

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        initializeApp(firebaseConfig);
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
        initialRouteName="Login"
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
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}