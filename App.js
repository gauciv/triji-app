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
  AccountSettingsScreen,
  EditProfileScreen,
  GradeCalculatorScreen,
  PostDetailScreen,
  CreateTaskScreen,
  TaskDetailScreen,
  ProfileScreen
} from './src/screens';
import TabNavigator from './src/navigation/TabNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NetworkProvider } from './src/context/NetworkContext';
import { ErrorBoundary, OfflineBanner } from './src/components';
import { setupNotificationListeners, registerForPushNotifications } from './src/utils/notifications';
import { startAllListeners, stopAllListeners } from './src/utils/firestoreListeners';
// Import Firebase to ensure it's initialized before the app starts
import './src/config/firebaseConfig';

const Stack = createStackNavigator();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initialRouteName, setInitialRouteName] = useState('Login');
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');

  useEffect(() => {
    const initializeApp = async () => {
      const startTime = Date.now();
      const minDisplayTime = 2000; // Minimum 2 seconds splash screen

      try {
        setLoadingMessage('Checking session...');
        // Check for existing user session
        const savedSession = await AsyncStorage.getItem('user_session');
        if (savedSession) {
          setInitialRouteName('MainApp');
        } else {
          setInitialRouteName('Login');
        }
        
        setLoadingMessage('Setting up notifications...');
        // Register for push notifications (will gracefully handle Expo Go limitations)
        try {
          await registerForPushNotifications();
        } catch (error) {
          console.log('Push notification setup skipped:', error.message);
        }
        
        // Start Firestore listeners for new content
        if (savedSession) {
          setLoadingMessage('Starting listeners...');
          try {
            startAllListeners();
          } catch (error) {
            console.log('Listener setup error:', error.message);
          }
        }
        
        setLoadingMessage('Finalizing...');
        // Set up notification listeners
        const listeners = setupNotificationListeners(
          (notification) => {
            console.log('Received notification:', notification);
          },
          (response) => {
            console.log('Notification tapped:', response);
            // TODO: Navigate to appropriate screen based on notification data
          }
        );

        // Ensure minimum display time for splash screen
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, minDisplayTime - elapsed);
        
        if (remainingTime > 0) {
          setLoadingMessage('Almost ready...');
          await new Promise(resolve => setTimeout(resolve, remainingTime));
        }
        
        return () => {
          listeners.remove();
          stopAllListeners();
        };
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
        <SplashScreen loadingMessage={loadingMessage} />
        <StatusBar style="light" />
      </>
    );
  }

  return (
    <ErrorBoundary>
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
            <Stack.Screen name="CreateAnnouncement" component={CreateAnnouncementScreen} />
            <Stack.Screen name="AnnouncementDetail" component={AnnouncementDetailScreen} />
            <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="GradeCalculator" component={GradeCalculatorScreen} />
            <Stack.Screen name="PostDetail" component={PostDetailScreen} />
            <Stack.Screen name="CreateTask" component={CreateTaskScreen} />
            <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </Stack.Navigator>
          <StatusBar style="light" />
        </NavigationContainer>
      </NetworkProvider>
    </ErrorBoundary>
  );
}