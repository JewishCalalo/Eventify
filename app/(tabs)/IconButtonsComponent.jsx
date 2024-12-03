import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const IconButtonsComponent = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconContainer} onPress={() => navigation.navigate('MyEventsScreen')}>
        <Ionicons name="calendar" size={24} color="black" />
        <Text style={styles.label}>My Events</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconContainer} onPress={() => navigation.navigate('FriendsScreen')}>
        <Ionicons name="people" size={24} color="black" />
        <Text style={styles.label}>Friends</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconContainer} onPress={() => navigation.navigate('ConcludedEventsScreen')}>
        <Ionicons name="checkmark-done" size={24} color="black" />
        <Text style={styles.label}>Concluded Events</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconContainer} onPress={() => navigation.navigate('TeamEventifyScreen')}>
        <Ionicons name="people-circle" size={24} color="black" />
        <Text style={styles.label}>Team Eventify</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  iconContainer: {
    alignItems: 'center',
  },
  label: {
    marginTop: 5,
    fontSize: 14,
  },
});

export default IconButtonsComponent;
