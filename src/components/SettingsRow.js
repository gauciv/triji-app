import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function SettingsRow({ icon, title, subtitle, onPress, isDestructive = false, showArrow = true }) {
  return (
    <TouchableOpacity 
      style={[styles.row, isDestructive && styles.destructiveRow]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconCircle}>
        <Feather 
          name={icon} 
          size={20} 
          color={isDestructive ? '#FF3B30' : '#22e584'} 
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, isDestructive && styles.destructiveTitle]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, isDestructive && styles.destructiveSubtitle]}>
            {subtitle}
          </Text>
        )}
      </View>
      {showArrow && (
        <Feather 
          name="chevron-right" 
          size={20} 
          color="rgba(255, 255, 255, 0.3)" 
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  destructiveRow: {
    backgroundColor: 'rgba(255, 59, 48, 0.05)',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(34, 229, 132, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  destructiveTitle: {
    color: '#FF3B30',
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  destructiveSubtitle: {
    color: 'rgba(255, 59, 48, 0.7)',
  },
});