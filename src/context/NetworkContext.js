import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useNetInfo } from '@react-native-community/netinfo';

const NetworkContext = createContext();

export const NetworkProvider = ({ children }) => {
  const netInfo = useNetInfo();
  const syncCallbackRef = useRef(null);
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    if (netInfo.isConnected === false) {
      wasOfflineRef.current = true;
    } else if (netInfo.isConnected === true && wasOfflineRef.current) {
      wasOfflineRef.current = false;
      // Trigger sync when coming back online
      if (syncCallbackRef.current) {
        syncCallbackRef.current();
      }
    }
  }, [netInfo.isConnected]);

  const registerSyncCallback = callback => {
    syncCallbackRef.current = callback;
  };

  return (
    <NetworkContext.Provider
      value={{
        isConnected: netInfo.isConnected,
        registerSyncCallback,
      }}
    >
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
