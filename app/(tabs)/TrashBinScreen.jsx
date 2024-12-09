import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient'; 
import { db, auth } from '../../configs/FirebaseConfig';
import { collection, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { EventContext } from './EventContext';

export default function TrashBinScreen() {
  const { theme } = useContext(EventContext);
  const [trash, setTrash] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchTrash = async () => {
      const trashCollection = collection(db, 'users', auth.currentUser.uid, 'trash');
      const trashSnapshot = await getDocs(trashCollection);
      const trashList = trashSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTrash(trashList);
    };

    fetchTrash();
  }, []);

  const handleDeleteFromTrash = async (notification) => {
    try {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'trash', notification.id));
      setTrash(trash.filter(n => n.id !== notification.id));
      Alert.alert('Notification deleted from trash.');
    } catch (error) {
      Alert.alert('Error deleting notification from trash. Please try again.');
    }
  };

  return (
    <LinearGradient
      colors={['#939194' , '#673b70' ]}
      style={styles.container}
    >
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
        <Ionicons name="arrow-back" size={24} color={theme.icon} />
        <Text style={[styles.goBackText, { color: theme.text }]}>Go Back</Text>
      </TouchableOpacity>
      {trash.length === 0 ? (
        <Text style={[styles.noNotificationsText, { color: theme.text, fontWeight:'bold' }]}>No deleted notifications</Text>
      ) : (
        trash.map((notification) => (
          <View key={notification.id} style={styles.notificationCard}>
            <Text style={[styles.notificationText, { color: theme.text }]}>
              {notification.senderName} - {notification.type === 'friend_request' ? 'Friend Request' : 'Event Invitation'} - {notification.eventTitle}
            </Text>
            <TouchableOpacity style={styles.button} onPress={() => handleDeleteFromTrash(notification)}>
              <Ionicons name="trash" size={24} color="red" />
            </TouchableOpacity>
          </View>
        ))
      )}
    </LinearGradient>
  );
}

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
    fontSize: 16,
    marginLeft: 8,
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
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
});
