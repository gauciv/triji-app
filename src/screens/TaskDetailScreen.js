import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { db, auth } from '../config/firebaseConfig';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

export default function TaskDetailScreen({ route, navigation }) {
  const { task } = route.params || {};
  
  const [countdown, setCountdown] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isTogglingCompletion, setIsTogglingCompletion] = useState(false);

  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    // Check if current user has completed this task
    if (task && auth.currentUser) {
      const completedBy = task.completedBy || [];
      setIsCompleted(completedBy.includes(auth.currentUser.uid));
    }
  }, [task]);

  useEffect(() => {
    // Calculate countdown to deadline
    const calculateCountdown = () => {
      if (!task?.deadline) return;
      
      const now = new Date();
      const deadline = new Date(task.deadline);
      const timeDiff = deadline.getTime() - now.getTime();
      
      if (timeDiff <= 0) {
        setCountdown('This task is overdue');
        return;
      }
      
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) {
        setCountdown(`Due in ${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}`);
      } else {
        setCountdown(`Due in ${hours} hour${hours !== 1 ? 's' : ''}`);
      }
    };
    
    calculateCountdown();
    const interval = setInterval(calculateCountdown, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [task]);

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSubjectFontSize = (text) => {
    if (!text) return 16;
    const length = text.length;
    if (length <= 6) return 16;  // Short acronyms like "CS101"
    if (length <= 12) return 14; // Medium length
    if (length <= 20) return 12; // Longer names
    return 11; // Very long subject names
  };

  const isOverdue = (dateString) => {
    if (!dateString) return false;
    const deadline = new Date(dateString);
    const today = new Date();
    return deadline < today;
  };

  const toggleTaskCompletion = async () => {
    if (!auth.currentUser || !task?.id) return;
    
    setIsTogglingCompletion(true);
    try {
      const taskRef = doc(db, 'tasks', task.id);
      
      if (isCompleted) {
        // Remove user from completedBy array
        await updateDoc(taskRef, {
          completedBy: arrayRemove(auth.currentUser.uid)
        });
        setIsCompleted(false);
      } else {
        // Add user to completedBy array
        await updateDoc(taskRef, {
          completedBy: arrayUnion(auth.currentUser.uid)
        });
        setIsCompleted(true);
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
      Alert.alert('Error', 'Failed to update task status. Please try again.');
    } finally {
      setIsTogglingCompletion(false);
    }
  };

  if (!fontsLoaded || !task) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={["#1B2845", "#23243a", "#22305a"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.backgroundGradient}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  const overdue = isOverdue(task.deadline);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1B2845", "#23243a", "#22305a", "#3a5a8c", "#23243a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />

      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Feather name="arrow-left" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Facebook-style Task Card */}
        <View style={styles.taskCardContainer}>
          {/* Task Header Info */}
          <View style={styles.taskHeader}>
            <View style={styles.taskAvatar}>
              <Feather name="clipboard" size={24} color="#22e584" />
            </View>
            <View style={styles.taskInfo}>
              <View style={styles.subjectRow}>
                <Text style={[styles.taskSubject, { fontSize: getSubjectFontSize(task.subjectCode) }]} numberOfLines={1}>
                  {task.subjectCode || 'Subject'}
                </Text>
                <View style={[
                  styles.statusBadgeDisplay,
                  isCompleted ? styles.statusBadgeCompleted : styles.statusBadgePending
                ]}>
                  <Feather 
                    name={isCompleted ? "check-circle" : "circle"} 
                    size={14} 
                    color={isCompleted ? "#22e584" : "#FFB800"} 
                  />
                  <Text style={[
                    styles.statusBadgeText,
                    isCompleted ? styles.statusBadgeTextCompleted : styles.statusBadgeTextPending
                  ]}>
                    {isCompleted ? 'Done' : 'Pending'}
                  </Text>
                </View>
              </View>
              <Text style={styles.taskDeadline}>{formatDate(task.deadline)}</Text>
            </View>
          </View>

          {/* Separator */}
          <View style={styles.separator} />

          {/* Task Title */}
          <View style={styles.taskTitleContainer}>
            <Text style={styles.taskTitle}>{task.title || 'Untitled Task'}</Text>
          </View>

          {/* Task Description */}
          {task.description && task.description.trim() ? (
            <View style={styles.taskDescriptionContainer}>
              <Text style={styles.taskDescription}>{task.description}</Text>
            </View>
          ) : (
            <View style={styles.emptyDescriptionContainer}>
              <Feather name="file-text" size={32} color="rgba(255, 255, 255, 0.3)" />
              <Text style={styles.emptyDescriptionText}>No description provided</Text>
            </View>
          )}

          {/* Mark as Done Button */}
          <TouchableOpacity
            style={[
              styles.markDoneButton,
              isCompleted && styles.markDoneButtonCompleted,
              isTogglingCompletion && styles.markDoneButtonDisabled
            ]}
            onPress={toggleTaskCompletion}
            disabled={isTogglingCompletion}
            activeOpacity={0.7}
          >
            <Feather 
              name={isCompleted ? "check-circle" : "circle"} 
              size={20} 
              color={isCompleted ? "#22e584" : "#FFB800"} 
            />
            <Text style={[
              styles.markDoneButtonText,
              isCompleted && styles.markDoneButtonTextCompleted
            ]}>
              {isCompleted ? 'Completed' : 'Mark as Done'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  scrollView: {
    flex: 1,
    marginTop: 50,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  taskCardContainer: {
    backgroundColor: 'rgba(30, 32, 40, 0.7)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
  },
  taskAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(34, 229, 132, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(34, 229, 132, 0.3)',
  },
  taskInfo: {
    flex: 1,
    marginLeft: 12,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  taskSubject: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    flex: 0,
  },
  statusBadgeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  statusBadgeCompleted: {
    backgroundColor: 'rgba(34, 229, 132, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34, 229, 132, 0.3)',
  },
  statusBadgePending: {
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.3)',
  },
  statusBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
  statusBadgeTextCompleted: {
    color: '#22e584',
  },
  statusBadgeTextPending: {
    color: '#FFB800',
  },
  subjectBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(34, 229, 132, 0.2)',
  },
  subjectBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#22e584',
    textAlign: 'center',
  },
  taskDeadline: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  taskTitleContainer: {
    padding: 16,
    paddingBottom: 12,
  },
  taskTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 22,
    color: '#FFFFFF',
    lineHeight: 30,
  },
  taskDescriptionContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  taskDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 22,
  },
  emptyDescriptionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDescriptionText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 12,
  },
  markDoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 184, 0, 0.4)',
  },
  markDoneButtonCompleted: {
    backgroundColor: 'rgba(34, 229, 132, 0.15)',
    borderColor: 'rgba(34, 229, 132, 0.4)',
  },
  markDoneButtonDisabled: {
    opacity: 0.5,
  },
  markDoneButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#FFB800',
    marginLeft: 10,
  },
  markDoneButtonTextCompleted: {
    color: '#22e584',
  },
});
