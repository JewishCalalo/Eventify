import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { EventContext } from './EventContext';

export default function Appearance() {
  const { theme, setTheme } = useContext(EventContext);
  const [mode, setMode] = useState(theme.mode);

  const toggleMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    setTheme({
      ...theme,
      mode: newMode,
      background: newMode === 'light' ? '#fff' : '#1c1c1c', // Softer dark color
      text: newMode === 'light' ? '#000' : '#e0e0e0', // Softer text color for dark mode
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>Appearance</Text>
      <TouchableOpacity style={styles.toggleButton} onPress={toggleMode}>
        <Text style={[styles.toggleButtonText, { color: theme.text }]}>{mode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  toggleButton: {
    backgroundColor: '#800080',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});
