import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform, Animated } from 'react-native';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Feather } from '@expo/vector-icons';
import { auth, db } from '../config/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function EditProfileScreen({ navigation }) {
  const [profile, setProfile] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    
    // Academic Information
    studentId: '',
    program: '',
    yearLevel: '',
    
    // Emergency Contact
    emergencyContactName: '',
    emergencyContactPhone: '',
    
    // Achievements
    achievements: []
  });
  const [newAchievement, setNewAchievement] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('personal'); // ['personal', 'academic', 'emergency', 'achievements']
  const [focusedInput, setFocusedInput] = useState(null);
  const [errors, setErrors] = useState({});
  const errorAnimation = new Animated.Value(0);
  
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setProfile({
              // Personal Information
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              email: userData.email || user.email,
              phone: userData.phone || '',
              dateOfBirth: userData.dateOfBirth || '',
              address: userData.address || '',
              
              // Academic Information
              studentId: userData.studentId || '',
              program: userData.program || '',
              yearLevel: userData.yearLevel || '',
              
              // Emergency Contact
              emergencyContactName: userData.emergencyContactName || '',
              emergencyContactPhone: userData.emergencyContactPhone || '',
              
              // Achievements
              achievements: userData.achievements || []
            });
          }
        }
      } catch (error) {
        console.log('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    const newErrors = {};
    
    // Validate required fields
    if (!profile.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!profile.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (profile.phone && !/^\+?[\d\s-]+$/.test(profile.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }
    if (profile.email && !/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      Animated.sequence([
        Animated.timing(errorAnimation, {
          toValue: 5,
          duration: 50,
          useNativeDriver: true
        }),
        Animated.timing(errorAnimation, {
          toValue: -5,
          duration: 50,
          useNativeDriver: true
        }),
        Animated.timing(errorAnimation, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true
        })
      ]).start();
      return;
    }

    setSaving(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const updatedData = {
          // Personal Information
          firstName: profile.firstName.trim(),
          lastName: profile.lastName.trim(),
          phone: profile.phone.trim(),
          dateOfBirth: profile.dateOfBirth.trim(),
          address: profile.address.trim(),
          
          // Academic Information
          studentId: profile.studentId.trim(),
          program: profile.program.trim(),
          yearLevel: profile.yearLevel.trim(),
          
          // Emergency Contact
          emergencyContactName: profile.emergencyContactName.trim(),
          emergencyContactPhone: profile.emergencyContactPhone.trim(),
          
          // Achievements
          achievements: profile.achievements
        };
        
        await updateDoc(doc(db, 'users', user.uid), updatedData);
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.log('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!fontsLoaded || loading) {
    return (
      <View style={[styles.container, { backgroundColor: '#121212' }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }]}>
            {!fontsLoaded ? 'Loading fonts...' : 'Loading profile...'}
          </Text>
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
          <Text style={styles.headerTitle}>Edit Profile</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        {/* Section Tabs */}
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
          style={styles.tabsScroll}
        >
          <TouchableOpacity 
            style={[styles.tab, activeSection === 'personal' && styles.activeTab]}
            onPress={() => setActiveSection('personal')}
          >
            <Text style={[styles.tabText, activeSection === 'personal' && styles.activeTabText]}>Personal</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeSection === 'academic' && styles.activeTab]}
            onPress={() => setActiveSection('academic')}
          >
            <Text style={[styles.tabText, activeSection === 'academic' && styles.activeTabText]}>Academic</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeSection === 'emergency' && styles.activeTab]}
            onPress={() => setActiveSection('emergency')}
          >
            <Text style={[styles.tabText, activeSection === 'emergency' && styles.activeTabText]}>Emergency</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeSection === 'achievements' && styles.activeTab]}
            onPress={() => setActiveSection('achievements')}
          >
            <Text style={[styles.tabText, activeSection === 'achievements' && styles.activeTabText]}>Achievements</Text>
          </TouchableOpacity>
        </ScrollView>

        <ScrollView 
          style={styles.formContainer}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            {/* Personal Information Section */}
            {activeSection === 'personal' && (
              <>
                <Animated.View style={[
                  styles.inputGroup,
                  errors.firstName && {
                    transform: [{ translateX: errorAnimation }]
                  }
                ]}>
                  <Text style={styles.label}>First Name</Text>
                  <TextInput
                    style={[
                      styles.input,
                      focusedInput === 'firstName' && styles.inputFocused,
                      errors.firstName && styles.inputError
                    ]}
                    value={profile.firstName}
                    onChangeText={(text) => {
                      setProfile(prev => ({ ...prev, firstName: text }));
                      if (errors.firstName) {
                        setErrors(prev => ({ ...prev, firstName: null }));
                      }
                    }}
                    onFocus={() => setFocusedInput('firstName')}
                    onBlur={() => setFocusedInput(null)}
                    placeholder="Enter first name"
                    placeholderTextColor="#8E8E93"
                  />
                  {errors.firstName && (
                    <Text style={styles.errorText}>{errors.firstName}</Text>
                  )}
                </Animated.View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    value={profile.lastName}
                    onChangeText={(text) => setProfile(prev => ({ ...prev, lastName: text }))}
                    placeholder="Enter last name"
                    placeholderTextColor="#8E8E93"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    value={profile.phone}
                    onChangeText={(text) => setProfile(prev => ({ ...prev, phone: text }))}
                    placeholder="Enter phone number"
                    placeholderTextColor="#8E8E93"
                    keyboardType="phone-pad"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Date of Birth</Text>
                  <TextInput
                    style={styles.input}
                    value={profile.dateOfBirth}
                    onChangeText={(text) => setProfile(prev => ({ ...prev, dateOfBirth: text }))}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#8E8E93"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Address</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={profile.address}
                    onChangeText={(text) => setProfile(prev => ({ ...prev, address: text }))}
                    placeholder="Enter your address"
                    placeholderTextColor="#8E8E93"
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </>
            )}

            {/* Academic Information Section */}
            {activeSection === 'academic' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Student ID</Text>
                  <TextInput
                    style={styles.input}
                    value={profile.studentId}
                    onChangeText={(text) => setProfile(prev => ({ ...prev, studentId: text }))}
                    placeholder="Enter student ID"
                    placeholderTextColor="#8E8E93"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Program</Text>
                  <TextInput
                    style={styles.input}
                    value={profile.program}
                    onChangeText={(text) => setProfile(prev => ({ ...prev, program: text }))}
                    placeholder="Enter program"
                    placeholderTextColor="#8E8E93"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Year Level</Text>
                  <TextInput
                    style={styles.input}
                    value={profile.yearLevel}
                    onChangeText={(text) => setProfile(prev => ({ ...prev, yearLevel: text }))}
                    placeholder="Enter year level"
                    placeholderTextColor="#8E8E93"
                  />
                </View>
              </>
            )}

            {/* Emergency Contact Section */}
            {activeSection === 'emergency' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Emergency Contact Name</Text>
                  <TextInput
                    style={styles.input}
                    value={profile.emergencyContactName}
                    onChangeText={(text) => setProfile(prev => ({ ...prev, emergencyContactName: text }))}
                    placeholder="Enter emergency contact name"
                    placeholderTextColor="#8E8E93"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Emergency Contact Phone</Text>
                  <TextInput
                    style={styles.input}
                    value={profile.emergencyContactPhone}
                    onChangeText={(text) => setProfile(prev => ({ ...prev, emergencyContactPhone: text }))}
                    placeholder="Enter emergency contact phone"
                    placeholderTextColor="#8E8E93"
                    keyboardType="phone-pad"
                  />
                </View>
              </>
            )}

            {/* Achievements Section */}
            {activeSection === 'achievements' && (
              <>
                <View style={styles.achievementsList}>
                  {profile.achievements.map((achievement, index) => (
                    <View key={index} style={styles.achievementItem}>
                      <Text style={styles.achievementText}>{achievement}</Text>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => {
                          const newAchievements = [...profile.achievements];
                          newAchievements.splice(index, 1);
                          setProfile(prev => ({ ...prev, achievements: newAchievements }));
                        }}
                      >
                        <Feather name="x" size={20} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
                <View style={styles.addAchievement}>
                  <TextInput
                    style={[styles.input, styles.achievementInput]}
                    value={newAchievement}
                    onChangeText={setNewAchievement}
                    placeholder="Enter new achievement"
                    placeholderTextColor="#8E8E93"
                  />
                  <TouchableOpacity
                    style={[styles.addButton, !newAchievement.trim() && styles.addButtonDisabled]}
                    disabled={!newAchievement.trim()}
                    onPress={() => {
                      if (newAchievement.trim()) {
                        setProfile(prev => ({
                          ...prev,
                          achievements: [...prev.achievements, newAchievement.trim()]
                        }));
                        setNewAchievement('');
                      }
                    }}
                  >
                    <Feather name="plus" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </>
            )}

            <TouchableOpacity 
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    position: 'relative',
    width: '100%',
    height: '100%',
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
  content: {
    flex: 1,
  },
  tabsScroll: {
    maxHeight: 50,
    marginVertical: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    paddingRight: 24,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    minWidth: 85,
  },
  activeTab: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  tabText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
    opacity: 0.7,
  },
  activeTabText: {
    opacity: 1,
    fontFamily: 'Inter_600SemiBold',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  form: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
    marginBottom: 6,
    opacity: 0.9,
  },
  input: {
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputFocused: {
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    ...Platform.select({
      ios: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inputError: {
    borderColor: '#FF3B30',
    backgroundColor: 'rgba(255, 59, 48, 0.05)',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  achievementsList: {
    marginBottom: 20,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  achievementText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
  },
  removeButton: {
    padding: 8,
    marginLeft: 12,
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderRadius: 8,
  },
  addAchievement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  achievementInput: {
    flex: 1,
    marginRight: 12,
  },
  addButton: {
    width: 52,
    height: 52,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#4A4A4A',
    opacity: 0.6,
  },
  saveButton: {
    height: 52,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    opacity: 0.9,
  },
});