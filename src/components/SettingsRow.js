import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function SettingsRow({ icon, title, onPress, isDestructive = false, showArrow = true }) {
  return (
    <TouchableOpacity 
      style={[styles.row, isDestructive && styles.destructiveRow]}
      onPress={onPress}
    >
      <Feather 
        name={icon} 
        size={20} 
        color={isDestructive ? '#FF3B30' : '#FFFFFF'} 
        style={styles.icon}
      />
      <Text style={[styles.title, isDestructive && styles.destructiveTitle]}>
        {title}
      </Text>
      {showArrow && (
        <Feather 
          name="chevron-right" 
          size={20} 
          color="#8E8E93" 
          style={styles.arrow}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  destructiveRow: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  icon: {
    marginRight: 16,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
  },
  destructiveTitle: {
    color: '#FF3B30',
  },
  arrow: {
    marginLeft: 8,
  },
});