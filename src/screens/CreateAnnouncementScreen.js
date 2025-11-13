import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Platform, Alert } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth, db } from '../config/firebaseConfig';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { useNetwork } from '../context/NetworkContext';
import { showErrorAlert, logError } from '../utils/errorHandler';

export default function CreateAnnouncementScreen({ navigation }) {
  const { isConnected } = useNetwork();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedType, setSelectedType] = useState('General');
  const [loading, setLoading] = useState(false);
  const [expiresAt, setExpiresAt] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // Default 7 days
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [step, setStep] = useState(1);
  const [noExpiry, setNoExpiry] = useState(false);

  const announcementTypes = ['General', 'Reminder', 'Event', 'Critical'];

  const getTypeColor = (type) => {
    switch (type) {
      case 'Critical': return '#FF3B30';
      case 'Event': return '#AF52DE';
      case 'Reminder': return '#FF9500';
      default: return '#007AFF';
    }
  };

  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const handleCreateAnnouncement = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please provide a title for the announcement.');
      return;
    }
    
    if (!content.trim()) {
      Alert.alert('Missing Content', 'Please provide content for the announcement.');
      return;
    }
    
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Authentication Required', 'You must be logged in to create announcements.');
      return;
    }

    if (!isConnected) {
      Alert.alert('Offline', 'You need an internet connection to create announcements.');
      return;
    }
    
    setLoading(true);
    try {
      let authorName = 'Anonymous';
      
      // Fetch user's full name from profile
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
          if (fullName) {
            authorName = fullName;
          }
        }
      } catch (userError) {
        logError(userError, 'Fetch User Data');
        // Continue with 'Anonymous' as fallback
      }
      
      const announcementData = {
        title: title.trim(),
        content: content.trim(),
        type: selectedType,
        authorName: authorName,
        authorId: user.uid,
        authorPhotoURL: '',
        createdAt: new Date(),
        expiresAt: noExpiry ? new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000) : expiresAt, // 100 years if no expiry
      };
      
      await addDoc(collection(db, 'announcements'), announcementData);
      
      navigation.goBack();
    } catch (error) {
      showErrorAlert(error, 'Create Announcement', 'Creation Failed');
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={["#0f1c2e", "#162447", "#121212"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.shiningGradient}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <LinearGradient
        colors={["#1B2845", "#23243a", "#22305a", "#3a5a8c", "#23243a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.shiningGradient}
      />
      <TouchableOpacity 
        style={styles.floatingBackButton}
        onPress={() => step === 1 ? navigation.goBack() : setStep(1)}
      >
        <Feather name="arrow-left" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      {step === 1 ? (
        <View style={styles.centerCardWrapper}>
          <View style={[
            styles.cardModernPolished,
            { borderLeftColor: getTypeColor(selectedType), boxShadow: Platform.OS === 'web' ? `0px 0px 32px 0px ${getTypeColor(selectedType)}55, 0px 8px 32px 0px ${getTypeColor(selectedType)}22` : undefined, shadowColor: getTypeColor(selectedType) },
            styles.cardWithMargin,
          ]}>
            <View style={styles.iconTitleWrapperCard}>
              <View style={[
                styles.glowIconContainer,
                {
                  borderColor: getTypeColor(selectedType),
                  shadowColor: getTypeColor(selectedType),
                  boxShadow: Platform.OS === 'web' ? `0 0 32px 0 ${getTypeColor(selectedType)}99, 0 0 12px 0 ${getTypeColor(selectedType)}55` : undefined,
                },
              ]}>
                <MaterialCommunityIcons name="bell-ring" size={32} color={getTypeColor(selectedType)} style={styles.bellIcon} />
                <Feather name="plus-circle" size={16} color="#fff" style={styles.plusIconOverlay} />
              </View>
              <Text style={styles.screenTitle}>New Announcement</Text>
            </View>
            <ScrollView 
              style={{ width: '100%' }}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Title</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="What's this announcement about?"
                  placeholderTextColor="#8E8E93"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Type</Text>
                <View style={styles.typeGrid}>
                  {announcementTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeCard,
                        {
                          backgroundColor: selectedType === type ? getTypeColor(type) : 'rgba(255, 255, 255, 0.03)',
                          borderColor: selectedType === type ? getTypeColor(type) : 'rgba(255, 255, 255, 0.1)',
                        },
                        selectedType === type && styles.typeCardSelected
                      ]}
                      onPress={() => setSelectedType(type)}
                    >
                      <Text style={[
                        styles.typeCardText,
                        selectedType === type && styles.typeCardTextSelected
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Expires On</Text>
                <TouchableOpacity 
                  style={styles.checkboxRow}
                  onPress={() => setNoExpiry(!noExpiry)}
                >
                  <View style={[styles.checkbox, noExpiry && styles.checkboxChecked]}>
                    {noExpiry && <Feather name="check" size={16} color="#fff" />}
                  </View>
                  <Text style={styles.checkboxLabel}>No expiry date (indefinite)</Text>
                </TouchableOpacity>
                {!noExpiry && (
                  Platform.OS === 'web' ? (
                    <input
                      type="date"
                      value={expiresAt.toISOString().split('T')[0]}
                      onChange={(e) => setExpiresAt(new Date(e.target.value))}
                      min={new Date().toISOString().split('T')[0]}
                      style={{
                        height: '52px',
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '14px',
                        padding: '0 18px',
                        fontSize: '15px',
                        color: '#FFFFFF',
                        fontFamily: 'Inter_400Regular',
                        width: '100%',
                        boxSizing: 'border-box',
                      }}
                    />
                  ) : (
                    <>
                      <TouchableOpacity 
                        style={styles.dateButton}
                        onPress={() => setShowDatePicker(true)}
                      >
                        <Feather name="calendar" size={20} color="#8E8E93" />
                        <Text style={styles.dateButtonText}>
                          {expiresAt.toLocaleDateString()}
                        </Text>
                      </TouchableOpacity>
                      {showDatePicker && (
                        <DateTimePicker
                          value={expiresAt}
                          mode="date"
                          display="default"
                          onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) {
                              setExpiresAt(selectedDate);
                            }
                          }}
                          minimumDate={new Date()}
                        />
                      )}
                    </>
                  )
                )}
              </View>
              <TouchableOpacity 
                style={[
                  styles.actionButtonGlow,
                  !title.trim() && styles.actionButtonGlowDisabled
                ]}
                onPress={() => setStep(2)}
                disabled={!title.trim()}
              >
                <Feather name="arrow-right" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.actionButtonTextGlow}>Next</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      ) : (
        <View style={styles.centerCardWrapper}>
          <View style={[
            styles.cardModernPolished,
            styles.cardFinalizeStep,
            { borderLeftColor: getTypeColor(selectedType), boxShadow: Platform.OS === 'web' ? `0px 0px 32px 0px ${getTypeColor(selectedType)}55, 0px 8px 32px 0px ${getTypeColor(selectedType)}22` : undefined, shadowColor: getTypeColor(selectedType) },
            styles.cardWithMargin,
          ]}>
            <View style={styles.iconTitleWrapperCard}>
              <View style={[
                styles.glowIconContainer,
                {
                  borderColor: getTypeColor(selectedType),
                  shadowColor: getTypeColor(selectedType),
                  boxShadow: Platform.OS === 'web' ? `0 0 32px 0 ${getTypeColor(selectedType)}99, 0 0 12px 0 ${getTypeColor(selectedType)}55` : undefined,
                },
              ]}>
                <MaterialCommunityIcons name="bell-ring" size={32} color={getTypeColor(selectedType)} style={styles.bellIcon} />
                <Feather name="plus-circle" size={16} color="#fff" style={styles.plusIconOverlay} />
              </View>
              <Text style={styles.screenTitle}>New Announcement</Text>
            </View>
            <View style={styles.twitterHeader}> 
              <Text style={styles.twitterTitle}>{title}</Text>
              <View style={styles.twitterMeta}>
                <View style={[styles.twitterTypeChip, { backgroundColor: getTypeColor(selectedType) + '22' }]}> 
                  <Text style={[styles.twitterTypeText, { color: getTypeColor(selectedType) }]}>{selectedType}</Text>
                </View>
                <Text style={styles.twitterExpiry}>
                  {noExpiry ? 'No expiry' : `Expires ${expiresAt.toLocaleDateString()}`}
                </Text>
              </View>
            </View>
            <TextInput
              style={styles.twitterTextArea}
              value={content}
              onChangeText={setContent}
              placeholder="What do you want to announce?"
              placeholderTextColor="#8E8E93"
              multiline
              textAlignVertical="top"
              autoFocus
            />
            <TouchableOpacity 
              style={[
                styles.actionButtonGlow,
                (!content.trim() || loading) && styles.actionButtonGlowDisabled
              ]}
              onPress={handleCreateAnnouncement}
              disabled={!content.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Feather name="check" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.actionButtonTextGlow}>Publish</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  centerCardWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  shiningGradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  iconTitleWrapper: {
    alignItems: 'center',
    marginTop: 38,
    marginBottom: 8,
    zIndex: 2,
  },
  bellPlusWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  glowIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(18, 18, 18, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    marginBottom: 8,
    marginTop: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 18,
    elevation: 8,
    position: 'relative',
  },
  bellPlusIconContainer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  bellIcon: {
    zIndex: 3,
    textShadowColor: 'rgba(0,0,0,0.12)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  plusIconOverlay: {
    position: 'absolute',
    bottom: -6,
    right: -8,
    backgroundColor: 'rgba(30,32,40,0.9)',
    borderRadius: 12,
    padding: 1,
    zIndex: 4,
  },
  screenTitle: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
    marginTop: 8,
    marginBottom: 8,
    letterSpacing: 0.2,
    textAlign: 'center',
    zIndex: 2,
  },
  floatingBackButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 32,
    left: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(30,32,40,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.13)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
    zIndex: 100,
  },
  cardModernPolished: {
    backgroundColor: 'rgba(30, 32, 40, 0.65)',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.13)',
    borderLeftWidth: 7,
    marginBottom: 16,
    marginTop: 4,
    elevation: 10,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    backdropFilter: 'blur(18px)', // web only
    overflow: 'hidden',
    padding: 20,
    paddingTop: 32,
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 0,
    paddingTop: 36,
    paddingBottom: 0,
    backgroundColor: 'transparent',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowColor: 'transparent',
    marginTop: 18, // move header down for visual appeal
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
    backgroundColor: 'transparent',
    borderRadius: 0,
    marginHorizontal: 0,
    paddingVertical: 0,
    paddingLeft: 16, // add left padding for back button
    paddingRight: 0,
    shadowColor: 'transparent',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 10,
    backgroundColor: '#232429',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    shadowColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    width: 38,
    height: 38,
    marginLeft: 0, // ensure not flush to border
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 0,
    letterSpacing: 0.2,
    textShadowColor: 'transparent',
    textAlignVertical: 'center',
  },
  headerBottom: {
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
    borderRadius: 0,
    marginHorizontal: 0,
    marginTop: 24, // move publish button down for visual appeal
    paddingTop: 0,
    paddingBottom: 0,
    paddingRight: 0,
    shadowColor: 'transparent',
  },
  publishButton: {
    paddingHorizontal: 22,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0,0,0,0.08)',
    shadowColor: 'transparent',
    alignSelf: 'flex-end',
  },
  publishButtonDisabled: {
    borderColor: '#4A4A4A',
    backgroundColor: 'transparent',
    opacity: 0.6,
  },
  publishButtonText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: '#007AFF',
    letterSpacing: 0.2,
  },
  content: {
    flex: 1,
    marginTop: 18,
  },
  scrollContent: {
    marginTop: 40,
    paddingHorizontal: 8,
    paddingBottom: 5,
  },
  card: {
    backgroundColor: 'rgba(30, 32, 40, 0.55)',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    marginHorizontal: 0,
    marginTop: 32, // move input fields down for visual appeal
    shadowColor: 'transparent',
    maxWidth: 400, // limit width for web/large screens
    alignSelf: 'center', // center horizontally
    width: '90%', // responsive for mobile
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.1,
    opacity: 0.92,
  },
  input: {
    height: 50,
    backgroundColor: 'rgba(30, 32, 40, 0.55)',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.13)',
    marginBottom: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  textArea: {
    minHeight: 120,
    maxHeight: 200,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(30, 32, 40, 0.55)',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.13)',
    marginBottom: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
    textAlignVertical: 'top',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    backgroundColor: 'transparent', // ghost style
    borderRadius: 16,
    gap: 8,
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: '#007AFF',
    shadowColor: 'transparent',
  },
  nextButtonDisabled: {
    backgroundColor: 'transparent',
    borderColor: '#4A4A4A',
    opacity: 0.6,
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#007AFF',
  },
  twitterContainer: {
    flex: 1,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    marginTop: 32, // add space below header/publish button
  },
  twitterHeader: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingTop: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 24, // increase space below preview card
    borderRadius: 24,
    borderWidth: 0,
    width: '92%',
    minWidth: 0,
    overflow: 'hidden',
    backgroundColor: 'rgba(30, 32, 40, 0.55)',
    marginHorizontal: '4%',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 8,
  },
  twitterTitle: {
    fontSize: 22,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
    flexWrap: 'wrap',
    width: '100%',
    minWidth: 0,
    lineHeight: 28,
    flexShrink: 1,
    wordBreak: 'break-word',
    marginLeft: 8, // ensure not covered by back button
  },
  twitterMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
    marginLeft: 8,
  },
  twitterTypeChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
  },
  twitterTypeText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  twitterExpiry: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
  },
  twitterTextArea: {
    flex: 1,
    fontSize: 18,
    lineHeight: 28,
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
    textAlignVertical: 'top',
    padding: 22,
    borderRadius: 18,
    borderWidth: 1.5,
    marginTop: 0, // remove extra top margin
    marginBottom: 12,
    minHeight: 260,
    maxHeight: 400,
    backgroundColor: 'rgba(30, 32, 40, 0.55)',
    borderColor: 'rgba(255,255,255,0.13)',
    marginHorizontal: 0,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 8,
    transition: 'all 0.2s',
    width: '100%',
    boxSizing: 'border-box',
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeCard: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  typeCardSelected: {
    borderWidth: 2,
  },
  typeCardText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#8E8E93',
  },
  typeCardTextSelected: {
    color: '#FFFFFF',
  },
  dateButton: {
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  dateButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#22e584',
    borderColor: '#22e584',
  },
  checkboxLabel: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  cardWithMargin: {
    marginHorizontal: 18,
    marginTop: 0,
    marginBottom: 0,
    width: '95%',
    maxWidth: 420,
  },
  iconTitleWrapperCard: {
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 16,
    zIndex: 2,
  },
  actionButtonGlow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#22e584',
    borderRadius: 16,
    paddingHorizontal: 0,
    paddingVertical: 13,
    marginHorizontal: 4,
    shadowColor: '#22e584',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 12,
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
  },
  actionButtonGlowDisabled: {
    backgroundColor: '#2a2a2a',
    borderColor: '#4A4A4A',
    opacity: 0.6,
  },
  actionButtonTextGlow: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
    letterSpacing: 0.2,
  },
  cardFinalizeStep: {
    minHeight: 700,
    marginTop: 32,
  },
});