import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth, db } from './firebaseConfig';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';

export default function CreateAnnouncementScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedType, setSelectedType] = useState('General');
  const [loading, setLoading] = useState(false);
  const [expiresAt, setExpiresAt] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // Default 7 days
  const [showDatePicker, setShowDatePicker] = useState(false);

  const announcementTypes = ['General', 'Reminder', 'Event', 'Critical'];

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
        <Text style={styles.headerTitle}>Create Announcement</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter announcement title"
            placeholderTextColor="#8E8E93"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Content</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={content}
            onChangeText={setContent}
            placeholder="Enter announcement content"
            placeholderTextColor="#8E8E93"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Announcement Type</Text>
          <View style={styles.chipContainer}>
            {announcementTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.chip,
                  selectedType === type && styles.chipSelected
                ]}
                onPress={() => setSelectedType(type)}
              >
                <Text style={[
                  styles.chipText,
                  selectedType === type && styles.chipTextSelected
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Expires On</Text>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {expiresAt.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={expiresAt}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setExpiresAt(selectedDate);
                }
              }}
              minimumDate={new Date()}
            />
          )}
        </View>

        <TouchableOpacity 
          style={[styles.createButton, (!title.trim() || !content.trim() || loading) && styles.createButtonDisabled]}
          onPress={handleCreateAnnouncement}
          disabled={!title.trim() || !content.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.createButtonText}>Create Announcement</Text>
          )}
        </TouchableOpacity>
      </View>
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
  headerTitle: {
    fontSize: 32,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    height: 52,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    paddingHorizontal: 18,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  textArea: {
    height: 120,
    paddingTop: 18,
  },
  createButton: {
    height: 52,
    backgroundColor: '#007AFF',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  createButtonDisabled: {
    backgroundColor: '#4A4A4A',
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
    letterSpacing: 0.3,
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
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  chipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  chipText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#8E8E93',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  dateButton: {
    height: 52,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    paddingHorizontal: 18,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  dateButtonText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
  },
});