import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { db, auth } from '../../configs/FirebaseConfig';
import { useNavigation, useRoute } from '@react-navigation/native';
import { collection, addDoc, updateDoc, doc, Timestamp, getDoc, query, getDocs, setDoc, where } from "firebase/firestore";
import { Picker } from '@react-native-picker/picker';
import { EventContext } from './EventContext';
import { LinearGradient } from 'expo-linear-gradient';

// Function to send notifications to friends
const sendNotification = async (user, friendID, newEvent, docRef) => {
  const notificationData = {
    type: 'event_share',
    eventID: docRef.id,
    eventTitle: newEvent.title,
    senderID: user.uid, // Ensure senderID is included
    senderName: user.displayName, // Ensure senderName is included
    date: newEvent.date,
    read: false,
  };
  console.log('Notification data being sent:', notificationData); // Debug log to check notification contents
  const notificationRef = doc(collection(db, 'users', friendID, 'notifications'));
  await setDoc(notificationRef, notificationData);
};

export function AddEventScreen() {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: null, notifyBefore: 10 });
  const { events, setEvents, theme, friends } = useContext(EventContext);
  const navigation = useNavigation();
  const route = useRoute();
  const { eventId } = route.params || {};
  const [selectedFriends, setSelectedFriends] = useState([]);

  useEffect(() => {
    if (eventId) {
      const fetchEventDetails = async () => {
        const user = auth.currentUser;
        if (user) {
          const eventDocRef = doc(db, 'users', user.uid, 'events', eventId);
          const eventDocSnap = await getDoc(eventDocRef);
          if (eventDocSnap.exists()) {
            const eventData = eventDocSnap.data();
            setNewEvent({
              title: eventData.title,
              date: eventData.date ? eventData.date.toDate() : null,
              notifyBefore: eventData.notifyBefore,
            });
            if (eventData.sharedWith) {
              setSelectedFriends(eventData.sharedWith);
            }
          }
        }
      };

      fetchEventDetails();
    }
  }, [eventId]);

  const handleConfirm = (selectedDate) => {
    setNewEvent({ ...newEvent, date: selectedDate });
    setDatePickerVisibility(false);
  };

  const addEvent = async () => {
    const user = auth.currentUser;
    if (user && newEvent.title && newEvent.date) {
      const userEventsCollection = collection(db, 'users', user.uid, 'events');

      // Check for duplicate event
      const duplicateQuery = query(userEventsCollection, where('title', '==', newEvent.title), where('date', '==', Timestamp.fromDate(newEvent.date)));
      const duplicateSnapshot = await getDocs(duplicateQuery);
      if (!duplicateSnapshot.empty) {
        Alert.alert('Duplicate Event', 'An event with the same title, date, and time already exists.');
        return;
      }

      let docRef;
      const eventDate = Timestamp.fromDate(newEvent.date);
      if (eventId) {
        const eventDocRef = doc(userEventsCollection, eventId);
        await updateDoc(eventDocRef, {
          title: newEvent.title,
          date: eventDate,
          notifyBefore: newEvent.notifyBefore,
          sharedWith: selectedFriends,
        });
        setEvents(events.map(event => (event.id === eventId ? { ...event, ...newEvent, date: eventDate, sharedWith: selectedFriends } : event)));
        docRef = eventDocRef;
      } else {
        docRef = await addDoc(userEventsCollection, {
          title: newEvent.title,
          date: eventDate,
          notifyBefore: newEvent.notifyBefore,
          sharedWith: selectedFriends,
        });
        setEvents([...events, { id: docRef.id, ...newEvent, date: eventDate, sharedWith: selectedFriends }]);
      }

      // Send notifications to invited friends
      await Promise.all(selectedFriends.map(async (friendID) => {
        try {
          await sendNotification(user, friendID, newEvent, docRef);
          console.log(`Notification sent to friend ${friendID}`);
        } catch (error) {
          console.error(`Error sending notification to friend ${friendID}: `, error);
        }
      }));

      setNewEvent({ title: '', date: null, notifyBefore: 10 });
      setSelectedFriends([]);
      Alert.alert('Success', 'Event added successfully!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    }
  };

  return (
    <LinearGradient colors={['#673b70', '#939194']} style={styles.linearGradient}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>{eventId ? 'Edit Event' : 'Add Event'}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <TextInput 
            placeholder="Event Title" 
            value={newEvent.title} 
            onChangeText={(text) => setNewEvent({ ...newEvent, title: text })} 
            style={[styles.modalInput, { borderColor: theme.icon, color: theme.text }]}
            placeholderTextColor={theme.text} 
          />
          <TouchableOpacity style={styles.datePickerButton} onPress={() => setDatePickerVisibility(true)}>
            <Ionicons name="calendar" size={24} color={theme.text} style={styles.datePickerIcon} />
            <Text style={[styles.datePickerText, { color: theme.text }]}>{newEvent.date ? newEvent.date.toLocaleString() : 'Select Date and Time'}</Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="datetime"
            minimumDate={new Date()}
            date={newEvent.date || new Date()}
            onConfirm={handleConfirm}
            onCancel={() => setDatePickerVisibility(false)}
          />
          <Text style={{ color: theme.text }}>Notification Timer:</Text>
          <Picker
            selectedValue={newEvent.notifyBefore}
            style={[styles.picker, { color: theme.text }]}
            onValueChange={(itemValue) => setNewEvent({ ...newEvent, notifyBefore: itemValue })}
          >
            <Picker.Item label="10 minutes before" value={10} />
            <Picker.Item label="30 minutes before" value={30} />
            <Picker.Item label="1 hour before" value={60} />
            <Picker.Item label="1 day before" value={1440} />
          </Picker>
          <Text style={{ color: theme.text }}>Share with Friends:</Text>
          {friends.map((friend) => (
            <TouchableOpacity
              key={friend.friendID}
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
              {selectedFriends.includes(friend.friendID) && (
                <Ionicons name="checkmark" size={24} color={theme.text} style={styles.checkmarkIcon} />
              )}
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.modalButton, { backgroundColor: theme.icon }]} onPress={addEvent}>
            <Text style={[styles.modalButtonText, { color: theme.text }]}>{eventId ? 'Save Event' : 'Create Event'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// Export component
export default AddEventScreen;

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
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
    backgroundColor: 'white', // Ensure this matches your theme background
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalInput: {
    height: 40,
    borderWidth: 1,
    width: '100%',
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    textAlign: 'center',
    fontSize: 16,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  datePickerIcon: {
    marginRight: 10,
  },
  datePickerText: {
    fontSize: 16,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    borderWidth: 1,
  },
  friendText: {
    fontSize: 16,
    flex: 1,
  },
  checkmarkIcon: {
    marginLeft: 10,
  },
});
