import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Animated, Easing } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const initialSubject = { name: '', units: '', grade: '' };

export default function GradeCalculatorScreen({ navigation }) {
  const [subjects, setSubjects] = useState([{ ...initialSubject }]);
  const [gwa, setGwa] = useState(null);
  const resultAnim = useRef(new Animated.Value(0)).current;
  // Button animations
  const addBtnAnim = useRef(new Animated.Value(1)).current;
  const calcBtnAnim = useRef(new Animated.Value(1)).current;
  // Animation for the last subject card
  const lastCardAnim = useRef(new Animated.Value(1)).current;

  const handleInputChange = (index, field, value) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[index][field] = value;
    setSubjects(updatedSubjects);
  };

  const addSubject = () => {
    setSubjects(prev => {
      // Animate the new card
      lastCardAnim.setValue(0);
      Animated.timing(lastCardAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
      return [...prev, { ...initialSubject }];
    });
    // Animate button
    Animated.sequence([
      Animated.timing(addBtnAnim, {
        toValue: 0.9,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(addBtnAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const removeSubject = (index) => {
    if (subjects.length === 1) return;
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const calculateGWA = () => {
    let totalUnits = 0;
    let weightedSum = 0;
    for (const subj of subjects) {
      const units = parseFloat(subj.units);
      const grade = parseFloat(subj.grade);
      if (isNaN(units) || isNaN(grade)) continue;
      totalUnits += units;
      weightedSum += units * grade;
    }
    if (totalUnits === 0) {
      setGwa('N/A');
    } else {
      setGwa((weightedSum / totalUnits).toFixed(2));
    }
    Animated.timing(resultAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
    // Animate button
    Animated.sequence([
      Animated.timing(calcBtnAnim, {
        toValue: 0.95,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(calcBtnAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#121212' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <View style={styles.backgroundGradient} />
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.navigate('Dashboard')}
            >
              <Feather name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>GWA Calculator</Text>
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>Enter your subjects, units, and grades below:</Text>
          {subjects.map((subject, idx) => {
            const CardWrapper = idx === subjects.length - 1 && subjects.length > 1 ? Animated.View : View;
            const cardStyle = idx === subjects.length - 1 && subjects.length > 1
              ? [styles.subjectRow, { opacity: lastCardAnim, transform: [{ scale: lastCardAnim }] }]
              : styles.subjectRow;
            return (
              <CardWrapper key={idx} style={cardStyle}>
                <BlurView intensity={40} tint="dark" style={styles.glassCard}>
                  <TextInput
                    style={styles.input}
                    placeholder="Subject Name"
                    placeholderTextColor="#aaa"
                    value={subject.name}
                    onChangeText={text => handleInputChange(idx, 'name', text)}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Units"
                    placeholderTextColor="#aaa"
                    keyboardType="numeric"
                    value={subject.units}
                    onChangeText={text => handleInputChange(idx, 'units', text)}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Grade"
                    placeholderTextColor="#aaa"
                    keyboardType="numeric"
                    value={subject.grade}
                    onChangeText={text => handleInputChange(idx, 'grade', text)}
                  />
                  <TouchableOpacity onPress={() => removeSubject(idx)} style={styles.removeBtn}>
                    <Feather name="x" size={18} color="#fff" />
                  </TouchableOpacity>
                </BlurView>
              </CardWrapper>
            );
          })}
          <Animated.View style={{ transform: [{ scale: addBtnAnim }] }}>
            <TouchableOpacity style={styles.addBtn} onPress={addSubject} activeOpacity={0.8}>
              <Feather name="plus" size={18} color="#fff" />
              <Text style={styles.addBtnText}>Add Subject</Text>
            </TouchableOpacity>
          </Animated.View>
          <Animated.View style={{ transform: [{ scale: calcBtnAnim }] }}>
            <TouchableOpacity style={styles.calcBtn} onPress={calculateGWA} activeOpacity={0.8}>
              <Feather name="check-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.calcBtnText}>Calculate GWA</Text>
            </TouchableOpacity>
          </Animated.View>
          {gwa !== null && (
            <Animated.View style={[styles.resultBox, { opacity: resultAnim, transform: [{ scale: resultAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }] }] }>
              <Text style={styles.resultLabel}>Your GWA:</Text>
              <Text style={styles.resultValue}>{gwa}</Text>
            </Animated.View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#232323',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 24,
    textAlign: 'center',
  },
  subjectRow: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  glassCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    backgroundColor: '#232323',
    color: '#fff',
    borderRadius: 8,
    padding: 10,
    marginRight: 8,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  removeBtn: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C759',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  calcBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginBottom: 24,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  calcBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  resultBox: {
    backgroundColor: '#232323',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  resultLabel: {
    color: '#aaa',
    fontSize: 16,
    marginBottom: 4,
  },
  resultValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 24,
    alignItems: 'center',
    minHeight: '100%',
  },
}); 