import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');
const initialSubject = { name: '', units: '', grade: '' };

export default function GradeCalculatorScreen({ navigation }) {
  const [subjects, setSubjects] = useState([{ units: '', grade: '' }]);
  const [gwa, setGwa] = useState(null);

  const handleInputChange = (index, field, value) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[index][field] = value;
    setSubjects(updatedSubjects);
  };

  const addSubject = () => {
    setSubjects(prev => [...prev, { units: '', grade: '' }]);
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
  };

  return (
    <KeyboardAvoidingView
      style={styles.mainContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Base dark gradient */}
      <LinearGradient
        colors={['#0A0F1C', '#0A0F1C', '#0A0F1C']}
        style={styles.gradientBackground}
      />

      {/* Radial effect overlay */}
      <View style={styles.radialOverlay}>
        <LinearGradient
          colors={['rgba(78, 67, 118, 0.4)', 'rgba(47, 53, 103, 0.2)', 'transparent']}
          style={styles.centerGlow}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
      </View>

      {/* Top edge glow */}
      <LinearGradient
        colors={['rgba(86, 95, 170, 0.15)', 'transparent']}
        style={styles.topGlow}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Content */}
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Feather name="arrow-left" size={24} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>

        <View style={styles.cardContainer}>
          <BlurView intensity={20} tint="dark" style={styles.mainCard}>
            <View style={styles.iconContainer}>
              <Feather name="award" size={32} color="#4ADE80" style={styles.glowingIcon} />
            </View>

            <Text style={styles.headerTitle}>GWA Calculator</Text>
            <Text style={styles.subtitle}>Enter your subjects, units, and grades below:</Text>
            
            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
              {subjects.map((subject, idx) => (
                <View key={idx} style={styles.subjectContainer}>
                  <View style={styles.subjectRow}>
                    <Text style={styles.subjectNumber}>Subject {idx + 1}</Text>
                    
                    <View style={styles.inputsContainer}>
                      <TextInput
                        style={[styles.input, styles.unitsInput]}
                        placeholder="Units"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        keyboardType="numeric"
                        value={subject.units}
                        onChangeText={text => handleInputChange(idx, 'units', text)}
                      />
                      
                      <TextInput
                        style={[styles.input, styles.gradeInput]}
                        placeholder="Grade"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        keyboardType="numeric"
                        value={subject.grade}
                        onChangeText={text => handleInputChange(idx, 'grade', text)}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.calculateButton} onPress={calculateGWA}>
                <Feather name="check-circle" size={20} color="#fff" />
                <Text style={styles.calculateButtonText}>Calculate GWA</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.addButton} onPress={addSubject}>
                <Text style={styles.addButtonText}>Add Another Subject</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#0A0F1C',
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  radialOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerGlow: {
    position: 'absolute',
    width: Math.max(width, height) * 1.5,
    height: Math.max(width, height) * 1.5,
    borderRadius: Math.max(width, height) * 0.75,
    transform: [
      { translateX: -Math.max(width, height) * 0.75 },
      { translateY: -Math.max(width, height) * 0.75 }
    ],
  },
  topGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: height * 0.4,
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 48 : 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
    marginBottom: 8,
  },
  cardContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  mainCard: {
    flex: 1,
    backgroundColor: 'rgba(17, 20, 33, 0.95)',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    shadowColor: '#4ADE80',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  glowingIcon: {
    textShadowColor: '#4ADE80',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: 24,
  },
  scrollView: {
    flex: 1,
    marginBottom: 20,
  },
  subjectContainer: {
    marginBottom: 16,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(30, 34, 58, 0.5)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  subjectNumber: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  inputsContainer: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
    justifyContent: 'flex-end',
  },
  input: {
    backgroundColor: 'rgba(15, 18, 31, 0.8)',
    borderRadius: 8,
    padding: 8,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    height: 36,
    textAlign: 'center',
  },
  unitsInput: {
    width: 70,
  },
  gradeInput: {
    width: 70,
  },
  buttonContainer: {
    gap: 12,
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4ADE80',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#4ADE80',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
  },
  calculateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  addButtonText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    fontWeight: '500',
  },
}); 