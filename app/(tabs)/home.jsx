import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, Modal, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { db, auth } from '../../configs/FirebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, Timestamp } from "firebase/firestore";
import * as Notifications from 'expo-notifications';

export default function HomeScreen() {
  const [events, setEvents] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: new Date() });
  const [editEventId, setEditEventId] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    const fetchEvents = async () => {
      const user = auth.currentUser;
      if (user) {
        const userEventsCollection = collection(db, 'users', user.uid, 'events');
        const querySnapshot = await getDocs(userEventsCollection);
        const eventsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), date: doc.data().date.toDate() }));
        setEvents(eventsData);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  const registerForPushNotificationsAsync = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  };

  const scheduleNotification = async (date, title) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Upcoming Event",
        body: `Your event "${title}" is happening soon!`,
      },
      trigger: date,
    });
  };

  const showModal = () => {
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
    setEditEventId(null);
    setNewEvent({ title: '', date: new Date() });
  };

  const handleConfirm = (selectedDate) => {
    setNewEvent({ ...newEvent, date: selectedDate });
    setDatePickerVisibility(false);
  };

  const addOrUpdateEvent = async () => {
    const user = auth.currentUser;
    if (user && newEvent.title && newEvent.date) {
      const userEventsCollection = collection(db, 'users', user.uid, 'events');
      if (editEventId) {
        const eventDocRef = doc(userEventsCollection, editEventId);
        await updateDoc(eventDocRef, {
          title: newEvent.title,
          date: Timestamp.fromDate(newEvent.date)
        });
        setEvents(events.map(event => event.id === editEventId ? { ...event, title: newEvent.title, date: newEvent.date } : event));
        setEditEventId(null);
      } else {
        const docRef = await addDoc(userEventsCollection, {
          title: newEvent.title,
          date: Timestamp.fromDate(newEvent.date)
        });
        setEvents([...events, { id: docRef.id, ...newEvent, date: newEvent.date }]);
        scheduleNotification(newEvent.date, newEvent.title);
      }
      setNewEvent({ title: '', date: new Date() });
      hideModal();
    }
  };

  const deleteEvent = async (id) => {
    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: async () => {
            const user = auth.currentUser;
            if (user) {
              const userEventsCollection = collection(db, 'users', user.uid, 'events');
              const eventDocRef = doc(userEventsCollection, id);
              await deleteDoc(eventDocRef);
              setEvents(events.filter(event => event.id !== id));
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => {
    const date = item.date;
    const isPast = date < new Date();
    return (
      <View style={[styles.eventItem, isPast ? styles.pastEvent : null]}>
        <View style={styles.eventTextContainer}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.eventDate}>{date.toString()}</Text>
        </View>
        <View style={styles.eventActions}>
          <TouchableOpacity onPress={() => {
            setNewEvent({ title: item.title, date: date });
            setEditEventId(item.id);
            setModalVisible(true);
            setDatePickerVisibility(true);
          }}>
            <Ionicons name="create-outline" size={24} color="blue" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteEvent(item.id)}>
            <Ionicons name="trash-outline" size={24} color="red" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={hideModal}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            <TextInput 
              placeholder="Event Title" 
              value={newEvent.title} 
              onChangeText={(text) => setNewEvent({ ...newEvent, title: text })} 
              style={styles.modalInput}
              autoFocus={true}
            />
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="datetime"
              minimumDate={new Date()}
              date={newEvent.date}
              onConfirm={handleConfirm}
              onCancel={() => setDatePickerVisibility(false)}
            />
            <TouchableOpacity style={styles.modalButton} onPress={addOrUpdateEvent}>
              <Text style={styles.modalButtonText}>Save Event</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <TouchableOpacity style={styles.addButton} onPress={() => {
        setNewEvent({ title: '', date: new Date() });
        setEditEventId(null);
        setModalVisible(true);
        setDatePickerVisibility(true);
      }}>
        <Ionicons name="add-circle" size={48} color="blue" />
      </TouchableOpacity>
      <FlatList
        data={events}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '100%',
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  addButton: {
    alignSelf: 'center',
    marginVertical: 20,
  },
  eventItem: {
    backgroundColor: '#f9c2ff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  pastEvent: {
    backgroundColor: '#cccccc',
  },
  eventTextContainer: {
    flex: 1,
    flexShrink: 1,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  eventDate: {
    fontSize: 16,
    color: 'gray',
  },
  eventActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  modalInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '100%',
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  modalButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  modalButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
});

