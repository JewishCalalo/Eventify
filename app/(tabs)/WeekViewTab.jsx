import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions, Modal, TextInput, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { db, auth } from '../../configs/FirebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { EventContext } from './EventContext';
import moment from 'moment';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import PushNotification from 'react-native-push-notification';
import { Picker } from '@react-native-picker/picker';

const { height } = Dimensions.get('window');

const WeekViewTab = () => {
  const { events, setEvents, theme } = useContext(EventContext);
  const [weekEvents, setWeekEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment().startOf('day'));
  const [currentWeek, setCurrentWeek] = useState(moment().startOf('week'));
  const [isModalVisible, setModalVisible] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [eventTime, setEventTime] = useState(new Date());
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [notificationTime, setNotificationTime] = useState(10);

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
        filterWeekEvents(eventsData);
      }
    };

    fetchEvents();
  }, [currentWeek]);

  const filterWeekEvents = (events) => {
    const startOfWeek = moment(currentWeek).startOf('week').toDate();
    const endOfWeek = moment(currentWeek).endOf('week').toDate();
    const weekEvents = events.filter(event => {
      const eventDate = event.date;
      return eventDate >= startOfWeek && eventDate <= endOfWeek;
    });
    setWeekEvents(weekEvents);
  };

  const handleDayPress = (day) => {
    setSelectedDate(day);
    filterWeekEvents(events);
  };

  const handlePreviousWeek = () => {
    setCurrentWeek(currentWeek.clone().subtract(1, 'week'));
  };

  const handleNextWeek = () => {
    setCurrentWeek(currentWeek.clone().add(1, 'week'));
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
        filterWeekEvents([...events, newEvent]);
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

  const deleteEvent = async (eventId) => {
    Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'events', eventId));
            const updatedEvents = events.filter(event => event.id !== eventId);
            setEvents(updatedEvents);
            filterWeekEvents(updatedEvents);
          } catch (error) {
            console.error("Error deleting event: ", error);
          }
        },
      },
    ]);
  };

  const renderEventItem = ({ item }) => (
    <View style={[styles.eventItem, { borderColor: theme.icon, backgroundColor: theme.background }]}>
      <Text style={[styles.eventTitle, { color: theme.text }]}>{item.title}</Text>
      <Text style={[styles.eventDate, { color: theme.text }]}>{moment(item.date).format('MMMM Do YYYY, h:mm:ss a')}</Text>
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

  const renderDay = (day) => (
    <TouchableOpacity
      key={day.format('YYYY-MM-DD')}
      style={[styles.dayContainer, day.isSame(selectedDate, 'day') && { backgroundColor: theme.icon }]}
      onPress={() => handleDayPress(day)}
    >
      <Text style={[styles.dayText, { color: day.isSame(selectedDate, 'day') ? theme.background : theme.text }]}>
        {day.format('ddd')}
      </Text>
      <Text style={[styles.dateText, { color: day.isSame(selectedDate, 'day') ? theme.background : theme.text }]}>
        {day.format('D')}
      </Text>
    </TouchableOpacity>
  );

  const startOfWeek = currentWeek.startOf('week');
  const daysOfWeek = [];
  for (let i = 0; i < 7; i++) {
    daysOfWeek.push(startOfWeek.clone().add(i, 'days'));
  }

  return (
    <View style={styles.fullScreenContainer}>
      <LinearGradient colors={['#939194', '#673b70']} style={styles.linearGradient}>
        <View style={styles.scrollViewContainer}>
          <View style={styles.header}>
            <Text style={[styles.monthText, { color: theme.text }]}>
              {currentWeek.format('MMMM YYYY')}
            </Text>
          </View>
          <View style={styles.navigationContainer}>
            <TouchableOpacity onPress={handlePreviousWeek} style={styles.arrowButton}>
              <Ionicons name="arrow-back" size={24} color={theme.icon} />
            </TouchableOpacity>
            <FlatList
              data={daysOfWeek}
              renderItem={({ item }) => renderDay(item)}
              keyExtractor={(item) => item.format('YYYY-MM-DD')}
              horizontal
              contentContainerStyle={styles.weekContainer}
              showsHorizontalScrollIndicator={false}
            />
            <TouchableOpacity onPress={handleNextWeek} style={styles.arrowButton}>
              <Ionicons name="arrow-forward" size={24} color={theme.icon} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={weekEvents.filter(event => moment(event.date).isSame(selectedDate, 'day')).length === 0 
              ? [{ id: 'no-event', title: 'No events for this date', date: selectedDate.toDate() }]
              : weekEvents.filter(event => moment(event.date).isSame(selectedDate, 'day'))}
            renderItem={({ item }) => item.id === 'no-event' ? (
              <View style={[styles.eventItem, { borderColor: theme.icon, backgroundColor: theme.background }]}>
                <Text style={[styles.eventTitle, { color: theme.text }]}>{item.title}</Text>
              </View>
            ) : renderEventItem({ item })}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.flatListContainer}
          />
        </View>
      </LinearGradient>

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
              {editingEvent ? `Edit Event on ${selectedDate.format('MMMM Do YYYY')}` : `Add Event on ${selectedDate.format('MMMM Do YYYY')}`}
            </Text>
            <TextInput
              style={[styles.modalInput, { borderColor: theme.icon, color: theme.text }]}
              value={eventTitle}
              onChangeText={setEventTitle}
              placeholder="Event Title"
              placeholderTextColor={theme.text}
            />
            <TouchableOpacity style={styles.modalButton} onPress={showTimePicker}>
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
              <TouchableOpacity style={styles.modalButton} onPress={handleSaveEvent}>
                <Text style={styles.modalButtonText}>Save Event</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    height: height,
  },
  linearGradient: {
    flex: 1,
  },
  scrollViewContainer: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginVertical: 15,
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  arrowButton: {
    paddingHorizontal: 10,
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayContainer: {
    width: 46.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  dayText: {
    fontSize: 15.5,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 14,
  },
  eventItem: {
    borderWidth: 2,
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventDate: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  flatListContainer: {
    flexGrow: 1,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
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
});

export default WeekViewTab;

