import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Feather } from '@expo/vector-icons';
import { auth, db } from './firebaseConfig';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';

export default function AnnouncementsScreen({ navigation }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');

  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role || '');
          }
        }
      } catch (error) {
        console.log('Error fetching user role:', error);
      }
    };

    const q = query(
      collection(db, 'announcements'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const announcementsList = [];
      querySnapshot.forEach((doc) => {
        announcementsList.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setAnnouncements(announcementsList);
      setLoading(false);
    });

    fetchUserRole();
    return () => unsubscribe();
  }, []);

  const renderAnnouncement = ({ item }) => {
    return (
      <View style={styles.announcementCard}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.content}>{item.content}</Text>
      </View>
    );
  };

  if (!fontsLoaded || loading) {
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
        <Text style={styles.headerTitle}>Announcements</Text>
        {userRole === 'officer' && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('CreateAnnouncement')}
          >
            <Feather name="plus" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        data={announcements}
        renderItem={renderAnnouncement}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  announcementCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    lineHeight: 20,
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
});