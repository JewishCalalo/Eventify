import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, TextInput, Alert, StyleSheet, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Calendar } from 'react-native-calendars';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { db, auth } from '../../configs/FirebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import PushNotification from 'react-native-push-notification';
import { EventContext } from './EventContext';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient'; 
import WeekViewTab from './WeekViewTab';
import YearViewTab from './YearViewTab';

export default function CalendarTab() {
  const [selectedDate, setSelectedDate] = useState('');
  const [eventsForSelectedDate, setEventsForSelectedDate] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [isModalVisible, setModalVisible] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [eventTime, setEventTime] = useState(new Date());
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [notificationTime, setNotificationTime] = useState(10);
  const [view, setView] = useState('month');
  const { events, setEvents, theme } = useContext(EventContext);

  useEffect(() => {
    const fetchEvents = async () => {
      const user = auth.currentUser;
      if (user) {
        const userEventsCollection = collection(db, 'users', user.uid, 'events');
        const querySnapshot = await getDocs(userEventsCollection);
        const eventsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate(),
        }));
        setEvents(eventsData);
        markEventDates(eventsData);
      }
    };

    const fetchEventInvitations = async () => {
      const user = auth.currentUser;
      if (user) {
        const invitationsCollection = collection(db, 'users', user.uid, 'eventInvitations');
        const querySnapshot = await getDocs(invitationsCollection);
        const invitationsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate(),
        }));
        setEvents(prevEvents => [...prevEvents, ...invitationsData]);
        markEventDates([...events, ...invitationsData]);
      }
    };

    fetchEvents();
    fetchEventInvitations();
  }, []);

  const markEventDates = (events) => {
    const marked = {};
    events.forEach((event) => {
      const date = event.date.toISOString().split('T')[0];
      if (marked[date]) {
        marked[date].marked = true;
      } else {
        marked[date] = { marked: true };
      }
    });
    setMarkedDates(marked);
  };

  const showTimePicker = () => {
    setTimePickerVisibility(true);
  };

  const hideTimePicker = () => {
    setTimePickerVisibility(false);
  };

  const handleConfirmTime = (time) => {
    const eventDateTime = new Date(selectedDate);
    eventDateTime.setHours(time.getHours(), time.getMinutes());
    setEventTime(eventDateTime);
    setShowSaveButton(true);
    hideTimePicker();
  };

  const renderEvent = ({ item }) => (
    <View style={[styles.eventItem, { borderColor: theme.icon, backgroundColor: theme.background }]}>
      <Text style={[styles.eventTitle, { color: theme.text }]}>{item.title}</Text>
      <Text style={[styles.eventDate, { color: theme.text }]}>{item.date.toString()}</Text>
      <View style={styles.eventActions}>
        <TouchableOpacity onPress={() => editEvent(item)}>
          <Ionicons name="create-outline" size={24} color="blue" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteEvent(item.id)}>
          <Ionicons name="trash-outline" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const scheduleNotification = (date, title, notifyBefore) => {
    const triggerDate = new Date(date.getTime() - notifyBefore * 60000);

    PushNotification.localNotificationSchedule({
      message: `Your event "${title}" is happening soon!`,
      date: triggerDate,
    });
  };

  const handleSaveEvent = async () => {
    const user = auth.currentUser;
    if (user) {
      if (editingEvent) {
        const eventDocRef = doc(db, 'users', user.uid, 'events', editingEvent.id);
        await updateDoc(eventDocRef, {
          title: eventTitle,
          date: eventTime,
          notifyBefore: notificationTime,
        });
        setEvents(prevEvents => prevEvents.map(event => event.id === editingEvent.id ? {
          ...event, title: eventTitle, date: eventTime, notifyBefore: notificationTime
        } : event));
      } else {
        const userEventsCollection = collection(db, 'users', user.uid, 'events');
        const docRef = await addDoc(userEventsCollection, {
          title: eventTitle,
          date: eventTime,
          notifyBefore: notificationTime,
        });
        const newEvent = {
          id: docRef.id,
          title: eventTitle,
          date: eventTime,
          notifyBefore: notificationTime,
        };
        setEvents(prevEvents => [...prevEvents, newEvent]);
        markEventDates([...events, newEvent]);
        scheduleNotification(eventTime, eventTitle, notificationTime);
      }

      setEventTitle('');
      setEventTime(new Date());
      setShowSaveButton(false);
      setEditingEvent(null);
      setNotificationTime(10);
      setModalVisible(false);
    }
  };

  const editEvent = (event) => {
    setEditingEvent(event);
    setEventTitle(event.title);
    setEventTime(event.date);
    setNotificationTime(event.notifyBefore || 10);
    setShowSaveButton(true);
    setModalVisible(true);
  };

  const deleteEvent = async (id) => {
    Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        onPress: async () => {
          const user = auth.currentUser;
          if (user) {
            const eventDocRef = doc(db, 'users', user.uid, 'events', id);
            await deleteDoc(eventDocRef);
            setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
          }
        },
      },
    ]);
  };

  useEffect(() => {
    if (selectedDate) {
      const filteredEvents = events.filter(event => {
        const eventDate = event.date.toISOString().split('T')[0];
        return eventDate === selectedDate;
      });
      setEventsForSelectedDate(filteredEvents);
    }
  }, [selectedDate, events]);

  return (
    <LinearGradient colors={['#939194' , '#673b70' ]} style={styles.linearGradient}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.hamburgerMenu} onPress={() => setView('menu')}>
          <Ionicons name="menu" size={28} color={theme.icon} />
        </TouchableOpacity>
        
        {view === 'menu' && (
          <View style={styles.menuContainer}>
            <TouchableOpacity onPress={() => setView('year')}>
              <Text style={styles.menuText}>Year View</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setView('month')}>
              <Text style={styles.menuText}>Month View</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setView('week')}>
              <Text style={styles.menuText}>Week View</Text>
            </TouchableOpacity>
          </View>
        )}

{view === 'month' && (
  <>
    <Calendar
      current={selectedDate}  
      onDayPress={(day) => {
        setSelectedDate(day.dateString);
        setEventsForSelectedDate(
          events.filter(event => event.date.toISOString().split('T')[0] === day.dateString)
        );
        setModalVisible(false);
      }}
      markedDates={{
        ...markedDates,
        [selectedDate]: { selected: true, selectedColor: theme.icon },
      }}
      theme={{
        calendarBackground: theme.background,
        dayTextColor: theme.text,
        todayTextColor: theme.icon,
        selectedDayBackgroundColor: theme.icon,
        arrowColor: theme.icon,
        monthTextColor: theme.text,
      }}
    />
    <FlatList
      data={eventsForSelectedDate}
      renderItem={renderEvent}
      keyExtractor={(item) => item.id}
      style={styles.eventList}
      ListEmptyComponent={<Text style={{ color: theme.text, fontWeight: 'bold'}}>No events for selected date.</Text>}
    />
            <Modal
              visible={isModalVisible}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => {
                      setModalVisible(false);
                      setEventTitle('');
                      setEventTime(new Date());
                      setShowSaveButton(false);
                    }}
                  >
                    <Text style={[styles.closeButtonText, { color: theme.text }]}>X</Text>
                  </TouchableOpacity>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>
                    {editingEvent ? `Edit Event on ${selectedDate}` : `Add Event on ${selectedDate}`}
                  </Text>
                  <TextInput
                    style={[styles.modalInput, { borderColor: theme.icon, color: theme.text }]}
                    value={eventTitle}
                    onChangeText={setEventTitle}
                    placeholder="Event Title"
                    placeholderTextColor={theme.text}
                  />
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={showTimePicker}
                  >
                    <Text style={styles.modalButtonText}>Pick Time</Text>
                  </TouchableOpacity>
                  <DateTimePickerModal
                    isVisible={isTimePickerVisible}
                    mode="time"
                    onConfirm={handleConfirmTime}
                    onCancel={hideTimePicker}
                  />
                  <Text style={{ color: theme.text }}>Select Notification Timer:</Text>
                  <Picker
                    selectedValue={notificationTime}
                    style={[styles.picker, { color: theme.text }]}
                    onValueChange={(itemValue) => setNotificationTime(itemValue)}
                  >
                    <Picker.Item label="10 minutes before" value={10} />
                    <Picker.Item label="30 minutes before" value={30} />
                    <Picker.Item label="1 hour before" value={60} />
                    <Picker.Item label="1 day before" value={1440} />
                  </Picker>
                  {showSaveButton && (
                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={handleSaveEvent}
                    >
                      <Text style={styles.modalButtonText}>Save Event</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </Modal>
          </>
        )}

        {view === 'week' && <WeekViewTab />} 

        {view === 'year' && <YearViewTab setSelectedDate={setSelectedDate} setView={setView} />} 
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  hamburgerMenu: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuContainer: {
    position: 'absolute',
    top: 50,
    left: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    elevation: 5,
  },
  menuText: {
    fontSize: 18,
    padding: 10,
    color: '#000',
  },
  eventList: {
    flex: 1,
    marginTop: 20,
  },
  eventItem: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventDate: {
    fontSize: 14,
  },
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  closeButtonText: {
    fontSize: 18,
    color: 'red',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    height: 40,
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
    borderRadius: 5,
    borderColor: '#65558f',
    color: '#000',
  },
  modalButton: {
    backgroundColor: '#65558f',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  modalButtonText: {
    fontSize: 18,
    color: 'white',
  },
  picker: {
    height: 50,
    width: '100%',
    marginTop: 10,
    marginBottom: 20,
    color: '#000',
  },
  yearViewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yearViewText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

