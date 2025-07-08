import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Feather } from '@expo/vector-icons';
import { db } from '../config/firebaseConfig';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { auth } from '../config/firebaseConfig';
import TaskCardSkeleton from '../components/TaskCardSkeleton';

export default function TaskboardScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const fetchTasks = () => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      let q;
      if (selectedStatus === 'All') {
        q = query(
          collection(db, 'tasks'),
          where('userId', '==', user.uid),
          where('semester', '==', selectedSemester),
          orderBy('createdAt', 'desc')
        );
      } else {
        q = query(
          collection(db, 'tasks'),
          where('userId', '==', user.uid),
          where('semester', '==', selectedSemester),
          where('status', '==', selectedStatus),
          orderBy('createdAt', 'desc')
        );
      }

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

  useEffect(() => {
    const unsubscribe = fetchTasks();
    return () => unsubscribe && unsubscribe();
  }, [selectedSemester, selectedStatus]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'To Do': return '#FF9500';
      case 'In Progress': return '#007AFF';
      case 'Completed': return '#34C759';
      default: return '#8E8E93';
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'To Do': return 'In Progress';
      case 'In Progress': return 'Completed';
      case 'Completed': return 'To Do';
      default: return 'To Do';
    }
  };

  const handleStatusUpdate = async (taskId, currentStatus) => {
    const nextStatus = getNextStatus(currentStatus);
    
    // Optimistic UI update
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, status: nextStatus } : task
      )
    );
    
    // Background database update
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        status: nextStatus
      });
    } catch (error) {
      console.log('Error updating status:', error);
      Alert.alert('Error', 'Failed to update task status. Please try again.');
      // Revert optimistic update on error
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: currentStatus } : task
        )
      );
    }
  };

  const renderTask = ({ item }) => (
    <View style={[
      styles.taskCard,
      item.status === 'Completed' && styles.taskCardCompleted
    ]}>
      <View style={styles.taskHeader}>
        <View style={styles.taskInfo}>
          <Text style={[
            styles.taskTitle,
            item.status === 'Completed' && styles.taskTitleCompleted
          ]}>
            {item.title}
          </Text>
          <Text style={[
            styles.taskSubject,
            item.status === 'Completed' && styles.taskSubjectCompleted
          ]}>
            {item.subject}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.statusButton, { backgroundColor: getStatusColor(item.status) }]}
          onPress={() => handleStatusUpdate(item.id, item.status)}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </TouchableOpacity>
      </View>
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
        <Text style={styles.headerTitle}>Taskboard</Text>
      </View>

      <View style={styles.semesterSelector}>
        <TouchableOpacity
          style={[
            styles.semesterButton,
            selectedSemester === 1 && styles.semesterButtonActive
          ]}
          onPress={() => setSelectedSemester(1)}
        >
          <Text style={[
            styles.semesterButtonText,
            selectedSemester === 1 && styles.semesterButtonTextActive
          ]}>
            1st Sem
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.semesterButton,
            selectedSemester === 2 && styles.semesterButtonActive
          ]}
          onPress={() => setSelectedSemester(2)}
        >
          <Text style={[
            styles.semesterButtonText,
            selectedSemester === 2 && styles.semesterButtonTextActive
          ]}>
            2nd Sem
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statusFilter}>
        {['All', 'To Do', 'In Progress', 'Completed'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              selectedStatus === status && styles.filterButtonActive
            ]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text style={[
              styles.filterButtonText,
              selectedStatus === status && styles.filterButtonTextActive
            ]}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <FlatList
          data={Array.from({ length: 6 }, (_, i) => ({ id: i }))}
          keyExtractor={(item) => item.id.toString()}
          renderItem={() => <TaskCardSkeleton />}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : error ? (
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
      ) : tasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="clipboard" size={64} color="#8E8E93" />
          <Text style={styles.emptyStateText}>
            No tasks for {selectedSemester === 1 ? '1st' : '2nd'} semester yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTask}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateTask', { semester: selectedSemester })}
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>
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
  semesterSelector: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 4,
  },
  semesterButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  semesterButtonActive: {
    backgroundColor: '#007AFF',
  },
  semesterButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#8E8E93',
  },
  semesterButtonTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 20,
  },
  taskCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  taskSubject: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
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
  statusFilter: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 10,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#8E8E93',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  taskCardCompleted: {
    opacity: 0.6,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  taskSubjectCompleted: {
    color: '#666666',
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
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
});