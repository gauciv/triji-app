import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function InfoRow({ 
  icon, 
  label, 
  value, 
  onPress, 
  isEditable = false, 
  showDivider = true,
  iconColor = '#22e584'
}) {
  const Content = (
    <View style={[styles.row, !showDivider && styles.noDivider]}>
      <View style={styles.leftContent}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
          <Feather name={icon} size={18} color={iconColor} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value || 'Not set'}</Text>
        </View>
      </View>
      {isEditable && (
        <Feather name="chevron-right" size={20} color="#8E8E93" />
      )}
    </View>
  );

  if (isEditable) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.touchable}>
        {Content}
      </TouchableOpacity>
    );
  }

  return Content;
}

const styles = StyleSheet.create({
  touchable: {
    borderRadius: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  noDivider: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: '#8E8E93',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
    lineHeight: 20,
  },
});