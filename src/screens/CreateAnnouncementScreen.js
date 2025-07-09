import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth, db } from '../config/firebaseConfig';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';

export default function CreateAnnouncementScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedType, setSelectedType] = useState('General');
  const [loading, setLoading] = useState(false);
  const [expiresAt, setExpiresAt] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // Default 7 days
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [step, setStep] = useState(1);

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
    if (!title.trim() || !content.trim()) return;
    
    setLoading(true);
    try {
      const user = auth.currentUser;
      let authorName = '';
      
      // Fetch user's full name from profile
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        authorName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
      }
      
      await addDoc(collection(db, 'announcements'), {
        title: title.trim(),
        content: content.trim(),
        type: selectedType,
        authorName: authorName,
        authorId: user.uid,
        authorPhotoURL: '',
        createdAt: new Date(),
        expiresAt: expiresAt,
      });
      navigation.goBack();
    } catch (error) {
      console.log('Error creating announcement:', error);
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
            onPress={() => step === 1 ? navigation.goBack() : setStep(1)}
          >
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {step === 1 ? 'New Announcement' : 'Write Content'}
          </Text>
        </View>
        
        {step === 2 && (
          <View style={styles.headerBottom}>
            <TouchableOpacity 
              style={[styles.publishButton, (!content.trim() || loading) && styles.publishButtonDisabled]}
              onPress={handleCreateAnnouncement}
              disabled={!content.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.publishButtonText}>Publish</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {step === 1 ? (
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
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
              {Platform.OS === 'web' ? (
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
              )}
            </View>

            <TouchableOpacity 
              style={[styles.nextButton, !title.trim() && styles.nextButtonDisabled]}
              onPress={() => setStep(2)}
              disabled={!title.trim()}
            >
              <Text style={styles.nextButtonText}>Next</Text>
              <Feather name="arrow-right" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.twitterContainer}>
          <View style={styles.twitterHeader}> 
            <Text style={styles.twitterTitle}>{title}</Text>
            <View style={styles.twitterMeta}>
              <View style={[styles.twitterTypeChip, { backgroundColor: getTypeColor(selectedType) + '22' }]}> 
                <Text style={[styles.twitterTypeText, { color: getTypeColor(selectedType) }]}>{selectedType}</Text>
              </View>
              <Text style={styles.twitterExpiry}>Expires {expiresAt.toLocaleDateString()}</Text>
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
        </View>
      )}
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
    zIndex: -1,
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
    paddingHorizontal: 0,
    paddingBottom: 60,
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
    marginBottom: 28,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
    marginBottom: 10,
    letterSpacing: 0.1,
    opacity: 0.92,
  },
  input: {
    height: 54,
    backgroundColor: 'rgba(30, 32, 40, 0.55)',
    borderRadius: 16,
    paddingHorizontal: 18,
    fontSize: 17,
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
    transition: 'all 0.2s',
  },
  textArea: {
    minHeight: 120,
    maxHeight: 220,
    paddingTop: 18,
    paddingBottom: 18,
    backgroundColor: 'rgba(30, 32, 40, 0.55)',
    borderRadius: 18,
    paddingHorizontal: 18,
    fontSize: 17,
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
    transition: 'all 0.2s',
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
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
    textAlignVertical: 'top',
    padding: 20,
    borderRadius: 22,
    borderWidth: 1.5,
    marginTop: 0, // remove extra top margin
    marginBottom: 8,
    minHeight: 180,
    maxHeight: 320,
    backgroundColor: 'rgba(30, 32, 40, 0.55)',
    borderColor: 'rgba(255,255,255,0.13)',
    marginHorizontal: '4%',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 8,
    transition: 'all 0.2s',
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
    gap: 12,
  },
  typeCard: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 12,
    paddingHorizontal: 16,
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
    height: 52,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
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
});