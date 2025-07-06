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
              <View style={[styles.twitterTypeChip, { backgroundColor: getTypeColor(selectedType) }]}>
                <Text style={styles.twitterTypeText}>{selectedType}</Text>
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
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerBottom: {
    alignItems: 'flex-end',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    height: 52,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  textArea: {
    height: 120,
    paddingTop: 16,
    paddingBottom: 16,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  nextButtonDisabled: {
    backgroundColor: '#4A4A4A',
    opacity: 0.6,
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
  },
  publishButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },
  publishButtonDisabled: {
    backgroundColor: '#4A4A4A',
    opacity: 0.6,
  },
  publishButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  twitterContainer: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: '#121212',
  },
  twitterHeader: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  twitterTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  twitterMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  twitterTypeChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  twitterTypeText: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
    textTransform: 'uppercase',
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
    paddingTop: 0,
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