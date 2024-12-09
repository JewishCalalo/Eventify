import React, { useContext, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { EventContext } from './EventContext';
import { db, auth } from '../../configs/FirebaseConfig';
import { doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';

const MyEventsScreen = () => {
  const { events, setEvents, theme, setTheme, setLanguage, setFonts } = useContext(EventContext);
  const navigation = useNavigation();

  useEffect(() => {
    const checkEvents = async () => {
      const now = new Date();

      const updatedEvents = events.map(async (event) => {
        if (!event.concluded && new Date(event.date) < now) {
          // Mark the event as concluded
          const user = auth.currentUser;
          if (user) {
            const eventDocRef = doc(db, 'users', user.uid, 'events', event.id);
            await updateDoc(eventDocRef, { concluded: true });
            return { ...event, concluded: true };
          }
        }
        return event;
      });

      // Wait for all events to be checked
      const resolvedEvents = await Promise.all(updatedEvents);
      setEvents(resolvedEvents);
    };

    checkEvents();
  }, []); // Only run once, on mount

  const fetchUserSettings = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.theme) setTheme(userData.theme);
          if (userData.language) setLanguage(userData.language);
          if (userData.fonts) setFonts(userData.fonts);
        }
      }
    } catch (error) {
      console.error("Error fetching user settings:", error);
    }
  };

  useEffect(() => {
    fetchUserSettings();
  }, []);

  const activeEvents = events.filter(event => !event.concluded);

  const confirmDeleteEvent = (eventId) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel'
        },
        {
          text: 'OK',
          onPress: () => deleteEvent(eventId)
        }
      ]
    );
  };

  const deleteEvent = async (eventId) => {
    const user = auth.currentUser;
    if (user) {
      const eventDocRef = doc(db, 'users', user.uid, 'events', eventId);
      await deleteDoc(eventDocRef);
      setEvents(events.filter(event => event.id !== eventId));
      Alert.alert('Success', 'Event deleted successfully!');
    }
  };

  const markAsConcluded = async (eventId) => {
    const user = auth.currentUser;
    if (user) {
      const eventDocRef = doc(db, 'users', user.uid, 'events', eventId);
      await updateDoc(eventDocRef, { concluded: true });
      setEvents(events.map(event => event.id === eventId ? { ...event, concluded: true } : event));
      Alert.alert('Success', 'Event marked as concluded!');
    }
  };

  const renderEventItem = ({ item }) => (
    <View style={styles.eventItem}>
      <View style={styles.eventDetails}>
        <Text style={[styles.eventTitle, { color: theme.text }]}>{item.title}</Text>
        <Text style={[styles.eventDate, { color: theme.text }]}>
          {new Date(item.date).toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          })}
        </Text>
      </View>
      <View style={styles.eventActions}>
        <TouchableOpacity onPress={() => navigation.navigate('AddEventScreen', { eventId: item.id })}>
          <Ionicons name="pencil" size={24} color={theme.icon} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => confirmDeleteEvent(item.id)}>
          <Ionicons name="trash" size={24} color="red" style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => markAsConcluded(item.id)}>
          <Ionicons name="checkmark" size={24} color="green" style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#673b70', '#939194']} style={styles.container}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
          <Text style={[styles.goBackText, { color: theme.text }]}>Go Back</Text>
        </TouchableOpacity>
        <FlatList
          data={activeEvents}
          renderItem={renderEventItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.flatListContent}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  goBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  goBackText: {
    marginLeft: 10,
    fontSize: 18,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderColor: 'lightgray',
    borderWidth: 1,
    marginBottom: 10,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventDate: {
    fontSize: 16,
  },
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 120,
  },
  icon: {
    marginHorizontal: 5,
  },
});

export default MyEventsScreen;
