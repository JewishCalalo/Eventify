import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { db, auth } from '../../configs/FirebaseConfig';
import { collection, doc, getDocs, setDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { EventContext } from './EventContext';

export function Notifications() {
  const { user, theme, setFriends, friends, setEvents, events } = useContext(EventContext);
  const [notifications, setNotifications] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const notificationsCollection = collection(db, 'users', auth.currentUser.uid, 'notifications');
        const notificationsSnapshot = await getDocs(notificationsCollection);
        const notificationsList = notificationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Fetched notifications:', notificationsList); // Debug log to check fetched notifications
        setNotifications(notificationsList);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const handleAcceptFriendRequest = async (notification) => {
    try {
      const friendRef = doc(db, 'users', auth.currentUser.uid, 'friends', notification.senderID);
      await setDoc(friendRef, {
        friendID: notification.senderID,
        fullName: notification.senderName,
      });

      const userFriendRef = doc(db, 'users', notification.senderID, 'friends', auth.currentUser.uid);
      await setDoc(userFriendRef, {
        friendID: auth.currentUser.uid,
        fullName: user.fullName,
      });

      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'notifications', notification.id));

      setFriends([...friends, { friendID: notification.senderID, fullName: notification.senderName }]);
      setNotifications(notifications.filter(n => n.id !== notification.id));
      Alert.alert('Friend request accepted!');
    } catch (error) {
      Alert.alert('Error accepting friend request. Please try again.');
    }
  };

  const handleDeclineFriendRequest = async (notification) => {
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid, 'trash', notification.id), notification);
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'notifications', notification.id));
      setNotifications(notifications.filter(n => n.id !== notification.id));
      Alert.alert('Friend request declined.');
    } catch (error) {
      Alert.alert('Error declining friend request. Please try again.');
    }
  };

  const handleAcceptEventInvitation = async (notification) => {
    try {
      console.log('Notification object:', notification); // Debug log to check notification contents
      
      const { eventID, eventTitle, senderID, date } = notification;
      
      if (!eventID) {
        throw new Error('Missing eventID in notification.');
      }
      if (!eventTitle) {
        throw new Error('Missing eventTitle in notification.');
      }
      if (!senderID) {
        throw new Error('Missing senderID in notification.');
      }
      if (!date || !date.seconds) {
        throw new Error('Missing or invalid date in notification.');
      }
      
      const eventRef = doc(db, 'users', auth.currentUser.uid, 'events', eventID);

      // Ensure the date field is properly converted
      const eventDate = Timestamp.fromMillis(date.seconds * 1000);

      await setDoc(eventRef, {
        title: eventTitle,
        date: eventDate,
        invitedBy: senderID,
      });

      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'notifications', notification.id));

      setEvents([...events, { id: eventID, title: eventTitle, date: new Date(eventDate.seconds * 1000), invitedBy: senderID }]);
      setNotifications(notifications.filter(n => n.id !== notification.id));
      Alert.alert('Event invitation accepted!');
    } catch (error) {
      console.error('Error accepting event invitation:', error);
      Alert.alert('Error', `Error accepting event invitation. Details: ${error.message}`);
    }
  };

  const handleDeclineEventInvitation = async (notification) => {
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid, 'trash', notification.id), notification);
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'notifications', notification.id));
      setNotifications(notifications.filter(n => n.id !== notification.id));
      Alert.alert('Event invitation declined.');
    } catch (error) {
      Alert.alert('Error declining event invitation. Please try again.');
    }
  };

  return (
    <LinearGradient colors={['#673b70', '#939194']} style={styles.container}>
      {notifications.length === 0 ? (
        <Text style={[styles.noNotificationsText, { color: theme.text, fontWeight: 'bold' }]}>No notifications</Text>
      ) : (
        notifications.map((notification) => (
          <View key={notification.id} style={styles.notificationCard}>
            {notification.type === 'friend_request' ? (
              <>
                <Text style={[styles.notificationText, { color: theme.text }]}>
                  {notification.senderName} sent you a friend request
                </Text>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={[styles.button, { backgroundColor: theme.icon }]} onPress={() => handleAcceptFriendRequest(notification)}>
                    <Text style={[styles.buttonText, { color: theme.text }]}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeclineFriendRequest(notification)}>
                    <Ionicons name="trash" size={24} color={theme.icon} />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.notificationText, { color: theme.text }]}>
                  {notification.senderName} invited you to an event: {notification.eventTitle}
                </Text>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={[styles.button, { backgroundColor: theme.icon }]} onPress={() => handleAcceptEventInvitation(notification)}>
                    <Text style={[styles.buttonText, { color: theme.text }]}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeclineEventInvitation(notification)}>
                    <Ionicons name="trash" size={24} color={theme.icon} />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        ))
      )}
      <TouchableOpacity style={[styles.trashButton, { backgroundColor: theme.icon }]} onPress={() => navigation.navigate('TrashBinScreen')}>
        <Ionicons name="trash" size={30} color={theme.text} />
      </TouchableOpacity>
    </LinearGradient>
  );
}

// Export component
export default Notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  noNotificationsText: {
    textAlign: 'center',
    fontSize: 18,
  },
  notificationCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
  },
  notificationText: {
    fontSize: 16,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: '#800080',
    width: '48%',
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
  },
  trashButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
});
