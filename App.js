import React from 'react';
import { StatusBar } from 'expo-status-bar';
import SplashScreen from './SplashScreen';

export default function App() {
  return (
    <>
      <SplashScreen />
      <StatusBar style="light" />
    </>
  );
}