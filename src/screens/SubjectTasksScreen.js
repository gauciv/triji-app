import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Feather } from '@expo/vector-icons';
import { db } from '../config/firebaseConfig';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth } from '../config/firebaseConfig';

export default function SubjectTasksScreen({ route, navigation }) {
  const { subjectId, subjectName, subjectCode } = route.params;
  const [tasks, setTasks] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('');

  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    fetchUserRole();
    fetchTasks();
  }, [selectedStatus]);

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
          where('subjectId', '==', subjectId),
          orderBy('createdAt', 'desc')
        );
      } else {
        q = query(
          collection(db, 'tasks'),
          where('subjectId', '==', subjectId),
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
    
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        status: nextStatus
      });
    } catch (error) {
      console.log('Error updating status:', error);
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
          {item.details && (
            <Text style={[
              styles.taskDetails,
              item.status === 'Completed' && styles.taskDetailsCompleted
            ]}>
              {item.details}
            </Text>
          )}
          {item.deadline && (
            <Text style={styles.taskDeadline}>Due: {item.deadline}</Text>
          )}
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
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{subjectCode}</Text>
          <Text style={styles.headerSubtitle}>{subjectName}</Text>
        </View>
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
      ) : tasks.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Feather name="clipboard" size={64} color="#8E8E93" />
          <Text style={styles.emptyStateText}>
            No tasks posted for this subject yet!
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

      {(userRole === 'officer' || userRole === 'admin') && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('CreateTask', { 
            subjectId, 
            subjectName, 
            subjectCode 
          })}
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
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    marginTop: 2,
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
  taskCardCompleted: {
    opacity: 0.6,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskInfo: {
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  taskDetails: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#CCCCCC',
    marginBottom: 4,
    lineHeight: 18,
  },
  taskDetailsCompleted: {
    color: '#666666',
  },
  taskDeadline: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#FF9500',
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
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
});