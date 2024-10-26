import React, { useState, useEffect } from 'react';
import { View, Button, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { db } from '../../configs/FirebaseConfig';
import { useNavigation, useRouter } from 'expo-router';
import { collection, addDoc, getDocs, Timestamp } from "firebase/firestore";

export default function HomeScreen() {
  const [events, setEvents] = useState([]);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: new Date() });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'events'));
        const eventsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, []);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (selectedDate) => {
    setNewEvent({ ...newEvent, date: selectedDate });
    hideDatePicker();
  };

  const addEvent = async () => {
    if (newEvent.title && newEvent.date) {
      const docRef = await addDoc(collection(db, 'events'), {
        title: newEvent.title,
        date: Timestamp.fromDate(newEvent.date)
      });
      setEvents([...events, { id: docRef.id, ...newEvent, date: Timestamp.fromDate(newEvent.date) }]);
      setNewEvent({ title: '', date: new Date() });
    }
  };

  return (
    <View style={styles.container}>
    <TouchableOpacity onPress={()=>router.back()}>
    <Ionicons name="chevron-back" size={24} color="black" />
    </TouchableOpacity>
      <TextInput
        placeholder="Event Title"
        value={newEvent.title}
        onChangeText={(text) => setNewEvent({ ...newEvent, title: text })}
        style={styles.input}
      />
      <Button title="Show Date Picker" onPress={showDatePicker} />
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
      <Button title="Add Event" onPress={addEvent} />
      {events.map((event) => {
        const date = event.date?.toDate ? event.date.toDate() : new Date();
        return (
          <Text key={event.id}>{event.title}: {date.toString()}</Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '100%',
    marginBottom: 10,
    padding: 10,
  },
});
