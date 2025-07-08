import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Feather } from '@expo/vector-icons';
import { db } from '../config/firebaseConfig';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { auth } from '../config/firebaseConfig';

export default function TaskboardScreen({ navigation }) {
  const [subjects, setSubjects] = useState([]);
  const [dueSoonTasks, setDueSoonTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const fetchSubjects = () => {
    setLoading(true);
    setError(null);

    try {
      const q = query(
        collection(db, 'subjects'),
        orderBy('subjectCode', 'asc')
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const subjectsList = [];
        querySnapshot.forEach((doc) => {
          subjectsList.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        setSubjects(subjectsList);
        setLoading(false);
      }, (error) => {
        console.log('Error fetching subjects:', error);
        setError('Could not load subjects. Please check your connection.');
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.log('Error setting up listener:', error);
      setError('Could not load subjects. Please check your connection.');
      setLoading(false);
      return null;
    }
  };

  const fetchDueSoonTasks = () => {
    try {
      const q = query(
        collection(db, 'tasks'),
        where('status', 'in', ['To Do', 'In Progress']),
        orderBy('deadline', 'asc'),
        limit(4)
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const tasksList = [];
        querySnapshot.forEach((doc) => {
          tasksList.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        setDueSoonTasks(tasksList);
      });

      return unsubscribe;
    } catch (error) {
      console.log('Error fetching due soon tasks:', error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribeSubjects = fetchSubjects();
    const unsubscribeTasks = fetchDueSoonTasks();
    
    return () => {
      unsubscribeSubjects && unsubscribeSubjects();
      unsubscribeTasks && unsubscribeTasks();
    };
  }, []);

  const getTimeRemaining = (deadline) => {
    if (!deadline) return 'No deadline';
    
    const now = new Date();
    const dueDate = new Date(deadline);
    const diffMs = dueDate - now;
    
    if (diffMs < 0) return 'Overdue';
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) return `${diffDays}d left`;
    if (diffHours > 0) return `${diffHours}h left`;
    return 'Due soon';
  };

  const renderDueSoonTask = ({ item }) => (
    <TouchableOpacity 
      style={styles.dueSoonCard}
      onPress={() => navigation.navigate('SubjectTasks', {
        subjectId: item.subjectId,
        subjectName: item.subjectName,
        subjectCode: item.subjectCode
      })}
    >
      <View style={styles.dueSoonHeader}>
        <Text style={styles.dueSoonSubject}>{item.subjectCode}</Text>
        <Text style={styles.dueSoonTime}>{getTimeRemaining(item.deadline)}</Text>
      </View>
      <Text style={styles.dueSoonTitle} numberOfLines={2}>{item.title}</Text>
      <View style={[styles.dueSoonStatus, { backgroundColor: getStatusColor(item.status) }]}>
        <Text style={styles.dueSoonStatusText}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSubject = ({ item }) => (
    <TouchableOpacity 
      style={styles.subjectRow}
      onPress={() => navigation.navigate('SubjectTasks', { 
        subjectId: item.id,
        subjectName: item.subjectName,
        subjectCode: item.subjectCode
      })}
    >
      <View style={styles.subjectInfo}>
        <Text style={styles.subjectCode}>{item.subjectCode}</Text>
        <Text style={styles.subjectName}>{item.subjectName}</Text>
      </View>
      <Feather name="chevron-right" size={20} color="#8E8E93" />
    </TouchableOpacity>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'To Do': return '#FF9500';
      case 'In Progress': return '#007AFF';
      case 'Completed': return '#34C759';
      default: return '#8E8E93';
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Taskboard</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Due Soon Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Due Soon</Text>
          {dueSoonTasks.length > 0 ? (
            <FlatList
              data={dueSoonTasks}
              keyExtractor={(item) => item.id}
              renderItem={renderDueSoonTask}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dueSoonList}
            />
          ) : (
            <View style={styles.emptyDueSoon}>
              <Text style={styles.emptyDueSoonText}>No upcoming deadlines</Text>
            </View>
          )}
        </View>

        {/* All Subjects Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Subjects</Text>
          {error ? (
            <View style={styles.errorState}>
              <Feather name="wifi-off" size={48} color="#FF3B30" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => fetchSubjects()}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : subjects.length === 0 && !loading ? (
            <View style={styles.emptyState}>
              <Feather name="book" size={48} color="#8E8E93" />
              <Text style={styles.emptyStateText}>No subjects found</Text>
            </View>
          ) : (
            <FlatList
              data={subjects}
              keyExtractor={(item) => item.id}
              renderItem={renderSubject}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2A2A2A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  dueSoonList: {
    paddingHorizontal: 20,
  },
  dueSoonCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 200,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dueSoonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dueSoonSubject: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#007AFF',
  },
  dueSoonTime: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#FF9500',
  },
  dueSoonTitle: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 18,
  },
  dueSoonStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  dueSoonStatusText: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
  },
  emptyDueSoon: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyDueSoonText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  subjectInfo: {
    flex: 1,
  },
  subjectCode: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#007AFF',
    marginBottom: 2,
  },
  subjectName: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 16,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
});