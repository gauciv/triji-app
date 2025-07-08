import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Feather } from '@expo/vector-icons';
import { db } from '../config/firebaseConfig';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';

export default function ReviewReportsScreen({ navigation }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    const q = query(
      collection(db, 'reports'),
      orderBy('reportedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reportsList = [];
      querySnapshot.forEach((doc) => {
        reportsList.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setReports(reportsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDismissReport = async (reportId) => {
    Alert.alert(
      'Dismiss Report',
      'Are you sure you want to dismiss this report?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Dismiss',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'reports', reportId));
              Alert.alert('Success', 'Report dismissed.');
            } catch (error) {
              console.log('Error dismissing report:', error);
              Alert.alert('Error', 'Failed to dismiss report.');
            }
          }
        }
      ]
    );
  };

  const handleDeletePost = async (report) => {
    Alert.alert(
      'Delete Post',
      'This will permanently delete the reported post. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete the original post
              await deleteDoc(doc(db, 'freedom-wall-posts', report.postId));
              // Delete the report
              await deleteDoc(doc(db, 'reports', report.id));
              Alert.alert('Success', 'Post and report deleted.');
            } catch (error) {
              console.log('Error deleting post:', error);
              Alert.alert('Error', 'Failed to delete post.');
            }
          }
        }
      ]
    );
  };

  const renderReport = ({ item }) => (
    <View style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <Text style={styles.reasonText}>{item.reason}</Text>
        <Text style={styles.dateText}>
          {item.reportedAt?.toDate().toLocaleDateString()}
        </Text>
      </View>
      
      <Text style={styles.postContent}>{item.postContent}</Text>
      
      {item.description && (
        <Text style={styles.description}>"{item.description}"</Text>
      )}
      
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={() => handleDismissReport(item.id)}
        >
          <Text style={styles.dismissButtonText}>Dismiss Report</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeletePost(item)}
        >
          <Text style={styles.deleteButtonText}>Delete Post</Text>
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
        <Text style={styles.headerTitle}>Review Reports</Text>
      </View>

      {reports.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Feather name="shield-check" size={64} color="#8E8E93" />
          <Text style={styles.emptyStateText}>No reports to review</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={renderReport}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
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
  listContainer: {
    padding: 20,
  },
  reportCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reasonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#FF3B30',
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
  },
  postContent: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
    marginBottom: 8,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  description: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  dismissButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  dismissButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    marginTop: 16,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
});