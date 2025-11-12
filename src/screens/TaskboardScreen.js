import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { db } from '../config/firebaseConfig';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import TaskCardSkeleton from '../components/TaskCardSkeleton';

export default function TaskboardScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  const windowWidth = Dimensions.get('window').width;

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
        
        setTasks(tasksList);
        setLoading(false);
        setInitialLoad(false);
      }, (error) => {
        console.log('Error fetching tasks:', error);
        setError('Could not load tasks. Please check your connection.');
        setLoading(false);
        setInitialLoad(false);
      });

      return unsubscribe;
    } catch (error) {
      console.log('Error setting up listener:', error);
      setError('Could not load tasks. Please check your connection.');
      setLoading(false);
      setInitialLoad(false);
      return null;
    }
  };

  useEffect(() => {
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

  const isOverdue = (dateString) => {
    if (!dateString) return false;
    const deadline = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return deadline < today;
  };

  const renderTaskCard = (task) => {
    const overdue = isOverdue(task.deadline);
    
    return (
      <View 
        key={task.id}
        style={styles.taskCard}
      >
        <View style={styles.taskCardHeader}>
          <View style={styles.subjectBadge}>
            <Text style={styles.subjectBadgeText}>{task.subjectCode || 'N/A'}</Text>
          </View>
          {overdue && (
            <View style={styles.overdueTag}>
              <Feather name="alert-circle" size={12} color="#FF3B30" />
              <Text style={styles.overdueText}>Overdue</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.taskTitle}>{task.title || 'Untitled Task'}</Text>
        
        {task.description && (
          <Text style={styles.taskDescription} numberOfLines={2}>
            {task.description}
          </Text>
        )}
        
        <View style={styles.taskFooter}>
          <View style={styles.dateContainer}>
            <Feather name="calendar" size={14} color="#8E8E93" />
            <Text style={styles.taskDate}>{formatDate(task.deadline)}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={["#0f1c2e", "#162447", "#121212"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.backgroundGradient}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1B2845", "#23243a", "#22305a", "#3a5a8c", "#23243a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />
      
      <TouchableOpacity 
        style={styles.floatingBackButton}
        onPress={() => navigation.goBack()}
      >
        <Feather name="arrow-left" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={styles.mainCardContainer}>
        <View style={styles.iconCircleWrapper}>
          <View style={styles.iconCircleGlow} />
          <View style={styles.iconCircleOutline}>
            <MaterialCommunityIcons name="clipboard-list-outline" size={32} color="#22e584" />
          </View>
        </View>
        
        <Text style={styles.headerTitle}>Task Board</Text>
        <Text style={styles.headerSubtext}>View all tasks and upcoming deadlines</Text>
        
        <View style={styles.tasksContent}>
          {initialLoad ? (
            <View style={styles.listContainer}>
              <TaskCardSkeleton />
              <TaskCardSkeleton />
              <TaskCardSkeleton />
            </View>
          ) : error ? (
            <View style={styles.emptyContainer}>
              <Feather name="wifi-off" size={64} color="#FF3B30" />
              <Text style={styles.emptyTitle}>Connection Error</Text>
              <Text style={styles.emptyMessage}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => fetchTasks()}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : tasks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="clipboard" size={64} color="#8E8E93" />
              <Text style={styles.emptyTitle}>No tasks yet</Text>
              <Text style={styles.emptyMessage}>Tasks will appear here once added by administrators</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.tasksScroll}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            >
              {tasks.map((task) => renderTaskCard(task))}
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1c2e',
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  floatingBackButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  mainCardContainer: {
    flex: 1,
    marginTop: 110,
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(28, 34, 47, 0.85)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(34, 229, 132, 0.2)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 15,
  },
  iconCircleWrapper: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  iconCircleGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22e584',
    opacity: 0.15,
  },
  iconCircleOutline: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#22e584',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34, 229, 132, 0.1)',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  headerSubtext: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  tasksContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tasksScroll: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 20,
  },
  taskCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  taskCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectBadge: {
    backgroundColor: 'rgba(34, 229, 132, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(34, 229, 132, 0.3)',
  },
  subjectBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#22e584',
  },
  overdueTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  overdueText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: '#FF3B30',
  },
  taskTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 24,
  },
  taskDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    marginBottom: 12,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskDate: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: '#8E8E93',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#22e584',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#0f1c2e',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
});