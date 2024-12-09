import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { db, auth } from '../../configs/FirebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { EventContext } from './EventContext';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function EventCreationScreen() {
  const { user, friends, theme } = useContext(EventContext);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);

  const handleCreateEvent = async () => {
    try {
      const eventRef = await addDoc(collection(db, 'users', auth.currentUser.uid, 'events'), {
        title,
        date: Timestamp.fromDate(date),
        sharedWith: selectedFriends,
      });

      // Share event with selected friends
      selectedFriends.forEach(async friendID => {
        await addDoc(collection(db, 'users', friendID, 'sharedEvents'), {
          eventId: eventRef.id,
          title,
          date: Timestamp.fromDate(date),
        });
      });

      Alert.alert('Event created successfully!');
    } catch (error) {
      Alert.alert('Failed to create event. Please try again.');
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.label, { color: theme.text }]}>Event Title:</Text>
      <TextInput
        style={[styles.input, { borderColor: theme.icon, color: theme.text }]}
        placeholder="Enter event title"
        placeholderTextColor={theme.text}
        value={title}
        onChangeText={setTitle}
      />
      <Text style={[styles.label, { color: theme.text }]}>Event Date:</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <Text style={[styles.dateText, { color: theme.text }]}>{date.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      <Text style={[styles.label, { color: theme.text }]}>Share with Friends:</Text>
      {friends.map((friend, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.friendItem,
            selectedFriends.includes(friend.friendID) && { backgroundColor: theme.icon },
          ]}
          onPress={() => {
            setSelectedFriends(prevSelectedFriends =>
              prevSelectedFriends.includes(friend.friendID)
                ? prevSelectedFriends.filter(id => id !== friend.friendID)
                : [...prevSelectedFriends, friend.friendID]
            );
          }}
        >
          <Text style={[styles.friendText, { color: selectedFriends.includes(friend.friendID) ? theme.text : theme.icon }]}>
            {friend.fullName}
          </Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.icon }]} onPress={handleCreateEvent}>
        <Text style={[styles.buttonText, { color: theme.text }]}>Create Event</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  dateText: {
    fontSize: 18,
    marginBottom: 20,
  },
  friendItem: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#d3d3d3',
    marginBottom: 10,
  },
  friendText: {
    fontSize: 16,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
  },
});
