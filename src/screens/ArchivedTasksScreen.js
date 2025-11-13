import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { db, auth } from '../config/firebaseConfig';
import { collection, query, onSnapshot, orderBy, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import TaskCardSkeleton from '../components/TaskCardSkeleton';
import { logError } from '../utils/errorHandler';

export default function ArchivedTasksScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    let unsubscribeTasks = null;
    
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const q = query(
          collection(db, 'tasks'),
          orderBy('deadline', 'desc')
        );

        unsubscribeTasks = onSnapshot(q, (querySnapshot) => {
          const tasksList = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Only show tasks that current user has completed
            if (data.completedBy && data.completedBy.includes(user.uid)) {
              tasksList.push({
                id: doc.id,
                ...data,
              });
            }
          });
          setTasks(tasksList);
          setLoading(false);
        }, (error) => {
          logError(error, 'Fetch Archived Tasks');
          setLoading(false);
        });
      } else {
        // User logged out, cleanup listener
        if (unsubscribeTasks) {
          unsubscribeTasks();
          unsubscribeTasks = null;
        }
        setTasks([]);
        setLoading(false);
      }
    });

    return () => {
      if (unsubscribeTasks) {
        unsubscribeTasks();
      }
      unsubscribeAuth();
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1B2845", "#23243a", "#22305a", "#3a5a8c", "#23243a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Completed Tasks</Text>
          <Text style={styles.headerSubtext}>{tasks.length} completed task{tasks.length !== 1 ? 's' : ''}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
            colors={['#22e584', '#FFFFFF']}
          />
        }
      >
        {loading ? (
          <View style={styles.listContainer}>
            <TaskCardSkeleton />
            <TaskCardSkeleton />
            <TaskCardSkeleton />
          </View>
        ) : tasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="check-circle" size={64} color="#8E8E93" />
            <Text style={styles.emptyTitle}>No completed tasks</Text>
            <Text style={styles.emptyMessage}>Tasks you mark as done will appear here</Text>
          </View>
        ) : (
          tasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskCard}
              onPress={() => navigation.navigate('TaskDetail', { task })}
              activeOpacity={0.7}
            >
              <View style={styles.taskCardHeader}>
                <View style={styles.subjectBadge}>
                  <Text style={styles.subjectBadgeText}>{task.subjectCode || 'N/A'}</Text>
                </View>
                <View style={styles.completedBadge}>
                  <Feather name="check-circle" size={13} color="#22e584" />
                  <Text style={styles.completedText}>Done</Text>
                </View>
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
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B2845',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  listContainer: {
    paddingBottom: 20,
  },
  taskCard: {
    backgroundColor: 'rgba(34, 229, 132, 0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 229, 132, 0.2)',
  },
  taskCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(34, 229, 132, 0.2)',
  },
  subjectBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#22e584',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 229, 132, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(34, 229, 132, 0.3)',
  },
  completedText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#22e584',
  },
  taskTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  taskDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
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
  },
  taskDate: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#8E8E93',
    marginLeft: 6,
  },
});
