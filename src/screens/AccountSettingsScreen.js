import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, StyleSheet, Alert } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Feather } from '@expo/vector-icons';
import { auth } from '../config/firebaseConfig';
import { signOut, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import SettingsRow from '../components/SettingsRow';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AccountSettingsScreen({ navigation }) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user_session');
      await signOut(auth);
      navigation.navigate('Login');
    } catch (error) {
      console.log('Logout error:', error.message);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      
      Alert.alert('Success', 'Password updated successfully!');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.log('Password change error:', error);
      if (error.code === 'auth/wrong-password') {
        Alert.alert('Error', 'Current password is incorrect.');
      } else {
        Alert.alert('Error', 'Failed to update password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <View style={styles.backgroundGradient} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGradient} />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Account Settings</Text>
        </View>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.group}>
            <SettingsRow 
              icon="user"
              title="Edit Profile"
              onPress={() => navigation.navigate('EditProfile')}
            />
            <SettingsRow 
              icon="lock"
              title="Change Password"
              onPress={() => setShowPasswordModal(true)}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <View style={styles.group}>
            {/* Conditional officer-only button */}
            {auth.currentUser?.role === 'officer' && (
              <SettingsRow 
                icon="shield"
                title="Review Reports"
                onPress={() => navigation.navigate('ReviewReports')}
              />
            )}
            <SettingsRow 
              icon="log-out"
              title="Log Out"
              onPress={handleLogout}
              isDestructive={true}
              showArrow={false}
            />
          </View>
        </View>
      </ScrollView>
      
      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Change Password</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <TextInput
                style={styles.modalInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor="#8E8E93"
                secureTextEntry
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput
                style={styles.modalInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor="#8E8E93"
                secureTextEntry
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <TextInput
                style={styles.modalInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor="#8E8E93"
                secureTextEntry
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowPasswordModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                onPress={handleChangePassword}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 24,
  },
  group: {
    marginHorizontal: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: 'rgba(18, 18, 18, 0.95)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  modalInput: {
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
  },
  saveButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#4A4A4A',
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
  },
});