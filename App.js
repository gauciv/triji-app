import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import {
  SplashScreen,
  LoginScreen,
  RegisterScreen,
  VerificationScreen,
  CreateAnnouncementScreen,
  AnnouncementDetailScreen,
  ArchivedAnnouncementsScreen,
  AccountSettingsScreen,
  EditProfileScreen,
  GradeCalculatorScreen,
  PostDetailScreen,
  SubjectTasksScreen,
  CreateTaskScreen,
  CatchUpScreen
} from './src/screens';
import TabNavigator from './src/navigation/TabNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NetworkProvider } from './src/context/NetworkContext';
import OfflineBanner from './src/components/OfflineBanner';
// Import Firebase to ensure it's initialized before the app starts
import './src/config/firebaseConfig';

const Stack = createStackNavigator();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initialRouteName, setInitialRouteName] = useState('Login');

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check for existing user session
        const savedSession = await AsyncStorage.getItem('user_session');
        if (savedSession) {
          setInitialRouteName('MainApp');
        } else {
          setInitialRouteName('Login');
        }
      } catch (error) {
        console.log('Error checking session:', error);
        setInitialRouteName('Login');
      } finally {
        setIsReady(true);
      }
    };

    initializeApp();
  }, []);

  if (!isReady) {
    return (
      <>
        <SplashScreen />
        <StatusBar style="light" />
      </>
    );
  }

  return (
    <NetworkProvider>
      <OfflineBanner />
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName={initialRouteName}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Verification" component={VerificationScreen} />
          <Stack.Screen name="MainApp" component={TabNavigator} />
          <Stack.Screen name="CatchUp" component={CatchUpScreen} />
          <Stack.Screen name="CreateAnnouncement" component={CreateAnnouncementScreen} />
          <Stack.Screen name="AnnouncementDetail" component={AnnouncementDetailScreen} />
          <Stack.Screen name="ArchivedAnnouncements" component={ArchivedAnnouncementsScreen} />
          <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="GradeCalculator" component={GradeCalculatorScreen} />
          <Stack.Screen name="PostDetail" component={PostDetailScreen} />
          <Stack.Screen name="SubjectTasks" component={SubjectTasksScreen} />
          <Stack.Screen name="CreateTask" component={CreateTaskScreen} />
        </Stack.Navigator>
        <StatusBar style="light" />
      </NavigationContainer>
    </NetworkProvider>
  );
}