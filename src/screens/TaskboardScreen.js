import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Feather } from '@expo/vector-icons';
import { db } from '../config/firebaseConfig';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { auth } from '../config/firebaseConfig';

export default function TaskboardScreen({ navigation }) {
  const [subjects, setSubjects] = useState([]);
  const [taskCounts, setTaskCounts] = useState({});
  const [selectedSemester, setSelectedSemester] = useState(1);
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
        where('semester', '==', selectedSemester),
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
        fetchTaskCounts(subjectsList);
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

  const fetchTaskCounts = async (subjectsList) => {
    const user = auth.currentUser;
    if (!user) return;

    const counts = {};
    
    for (const subject of subjectsList) {
      try {
        const q = query(
          collection(db, 'tasks'),
          where('userId', '==', user.uid),
          where('subjectId', '==', subject.id),
          where('status', 'in', ['To Do', 'In Progress'])
        );
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          counts[subject.id] = querySnapshot.size;
          setTaskCounts({...counts});
        });
      } catch (error) {
        console.log('Error fetching task count for subject:', subject.subjectCode, error);
        counts[subject.id] = 0;
      }
    }
  };

  useEffect(() => {
    const unsubscribe = fetchSubjects();
    return () => unsubscribe && unsubscribe();
  }, [selectedSemester]);

  const renderSubject = ({ item }) => {
    const taskCount = taskCounts[item.id] || 0;
    
    return (
      <TouchableOpacity 
        style={styles.subjectCard}
        onPress={() => navigation.navigate('SubjectTasks', { 
          subjectId: item.id,
          subjectName: item.subjectName,
          subjectCode: item.subjectCode
        })}
      >
        <View style={styles.subjectHeader}>
          <Text style={styles.subjectCode}>{item.subjectCode}</Text>
          {taskCount > 0 && (
            <View style={styles.taskBadge}>
              <Text style={styles.taskBadgeText}>{taskCount}</Text>
            </View>
          )}
        </View>
        <Text style={styles.subjectName}>{item.subjectName}</Text>
        <Text style={styles.subjectUnits}>{item.units} units</Text>
      </TouchableOpacity>
    );
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

      {error ? (
        <View style={styles.errorState}>
          <Feather name="wifi-off" size={64} color="#FF3B30" />
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
          <Feather name="book" size={64} color="#8E8E93" />
          <Text style={styles.emptyStateText}>
            No subjects found for {selectedSemester === 1 ? '1st' : '2nd'} semester
          </Text>
        </View>
      ) : (
        <FlatList
          data={subjects}
          keyExtractor={(item) => item.id}
          renderItem={renderSubject}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={styles.row}
        />
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
  subjectCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    margin: 8,
    flex: 1,
    minHeight: 120,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  subjectCode: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#007AFF',
    flex: 1,
  },
  taskBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  taskBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  subjectName: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
    marginBottom: 4,
    lineHeight: 18,
  },
  subjectUnits: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
  },
  row: {
    justifyContent: 'space-between',
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