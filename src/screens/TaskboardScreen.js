import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Feather } from '@expo/vector-icons';
import { db } from '../config/firebaseConfig';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';
import { auth } from '../config/firebaseConfig';

export default function TaskboardScreen({ navigation }) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('');

  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const fetchTasks = () => {
    setLoading(true);
    setError(null);

    try {
      const q = query(
        collection(db, 'tasks'),
        where('status', '!=', 'Completed'),
        orderBy('status'),
        orderBy('deadline', 'asc')
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const tasksList = [];
        querySnapshot.forEach((doc) => {
          tasksList.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        
        const groupedTasks = processTasksForAgenda(tasksList);
        setSections(groupedTasks);
        setLoading(false);
      }, (error) => {
        console.log('Error fetching tasks:', error);
        setError('Could not load tasks. Please check your connection.');
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.log('Error setting up listener:', error);
      setError('Could not load tasks. Please check your connection.');
      setLoading(false);
      return null;
    }
  };

  const processTasksForAgenda = (tasks) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() + 7);

    // Initialize arrays for each category
    const overdueTasks = [];
    const dueTodayTasks = [];
    const dueTomorrowTasks = [];
    const dueThisWeekTasks = [];
    const dueLaterTasks = [];

    // Process each task and categorize by deadline
    tasks.forEach(task => {
      if (!task.deadline) {
        dueLaterTasks.push(task);
        return;
      }

      const taskDate = new Date(task.deadline);
      const taskDay = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());

      if (taskDay < today) {
        overdueTasks.push(task);
      } else if (taskDay.getTime() === today.getTime()) {
        dueTodayTasks.push(task);
      } else if (taskDay.getTime() === tomorrow.getTime()) {
        dueTomorrowTasks.push(task);
      } else if (taskDay <= thisWeek) {
        dueThisWeekTasks.push(task);
      } else {
        dueLaterTasks.push(task);
      }
    });

    // Format for SectionList - only include sections with data
    const sections = [];
    
    if (overdueTasks.length > 0) {
      sections.push({ title: 'Overdue', data: overdueTasks });
    }
    if (dueTodayTasks.length > 0) {
      sections.push({ title: 'Due Today', data: dueTodayTasks });
    }
    if (dueTomorrowTasks.length > 0) {
      sections.push({ title: 'Due Tomorrow', data: dueTomorrowTasks });
    }
    if (dueThisWeekTasks.length > 0) {
      sections.push({ title: 'Due This Week', data: dueThisWeekTasks });
    }
    if (dueLaterTasks.length > 0) {
      sections.push({ title: 'Due Later', data: dueLaterTasks });
    }

    return sections;
  };

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

  useEffect(() => {
    fetchUserRole();
    const unsubscribe = fetchTasks();
    return () => unsubscribe && unsubscribe();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderTaskCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.taskCard}
      onPress={() => navigation.navigate('SubjectTasks', {
        subjectId: item.subjectId,
        subjectName: item.subjectName,
        subjectCode: item.subjectCode
      })}
    >
      <View style={styles.taskHeader}>
        <Text style={styles.taskTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.taskSubject}>{item.subjectCode}</Text>
      </View>
      <Text style={styles.taskDate}>{formatDate(item.deadline)}</Text>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

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
        <Text style={styles.headerTitle}>Agenda</Text>
      </View>

      {error ? (
        <View style={styles.errorState}>
          <Feather name="wifi-off" size={64} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchTasks()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : sections.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Feather name="calendar" size={64} color="#8E8E93" />
          <Text style={styles.emptyStateText}>No upcoming tasks</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderTaskCard}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
      )}

      {(userRole === 'officer' || userRole === 'admin') && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('CreateTask')}
        >
          <Feather name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
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
  listContainer: {
    padding: 20,
  },
  sectionHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 8,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  taskCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 12,
    lineHeight: 20,
  },
  taskSubject: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  taskDate: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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