import React, { createContext, useContext } from 'react';
import { useNetInfo } from '@react-native-community/netinfo';

const NetworkContext = createContext();

export const NetworkProvider = ({ children }) => {
  const netInfo = useNetInfo();
  
  return (
    <NetworkContext.Provider value={{ isConnected: netInfo.isConnected }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};