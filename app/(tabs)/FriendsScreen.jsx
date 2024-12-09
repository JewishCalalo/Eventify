import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../../configs/FirebaseConfig';
import { EventContext } from './EventContext';
import { collection, getDocs, query, where, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';  

const FriendsScreen = () => {
  const navigation = useNavigation();
  const { user, theme, friends, setFriends } = useContext(EventContext);
  const [friendID, setFriendID] = useState('');
  const [showFriends, setShowFriends] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);

  const handleSendFriendRequest = async () => {
    const friendQuery = query(collection(db, 'users'), where('friendID', '==', friendID));
    const friendSnapshot = await getDocs(friendQuery);

    if (!friendSnapshot.empty) {
      const friendUID = friendSnapshot.docs[0].id;

      const notificationRef = doc(collection(db, 'users', friendUID, 'notifications'));
      await setDoc(notificationRef, {
        type: 'friend_request',
        senderID: auth.currentUser.uid,
        senderName: user.fullName,
        status: 'pending',
      });
      Alert.alert('Friend request sent successfully!');
    } else {
      Alert.alert('Friend not found.');
    }
    setFriendID('');
    setShowAddFriend(false);
  };

  const handleDeleteFriend = async (friendUID) => {
    Alert.alert(
      'Delete Friend',
      'Are you sure you want to delete this friend?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel'
        },
        {
          text: 'Delete',
          onPress: async () => {
            const friendRef = doc(db, 'users', auth.currentUser.uid, 'friends', friendUID);
            await deleteDoc(friendRef);
            setFriends(friends.filter(friend => friend.id !== friendUID));
            Alert.alert('Friend deleted successfully!');
          },
        }
      ]
    );
  };

  useEffect(() => {
    const fetchFriends = async () => {
      const friendCollection = collection(db, 'users', auth.currentUser.uid, 'friends');
      const friendSnapshot = await getDocs(friendCollection);
      const friendList = friendSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setFriends(friendList);
    };

    fetchFriends();
  }, []);

  const renderFriendItem = ({ item }) => (
    <View style={styles.friendItem}>
      <View style={styles.friendDetails}>
        <Text style={[styles.friendText, { color: theme.text }]}>{item.fullName}</Text>
        <Text style={[styles.friendIDText, { color: theme.text }]}>ID: {item.id}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDeleteFriend(item.id)}>
        <Ionicons name="trash" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={['#673b70', '#939194']} style={styles.container}>
      <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={theme.text} />
        <Text style={[styles.goBackText, { color: theme.text }]}>Go Back</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: theme.icon }]} onPress={() => setShowFriends(!showFriends)}>
        <Text style={[styles.buttonText, { color: theme.text }]}>Friends</Text>
      </TouchableOpacity>

      {showFriends && (
        <View style={styles.friendsContainer}>
          {friends.length === 0 ? (
            <Text style={[styles.noFriendsText, { color: theme.text }]}>No friends added yet.</Text>
          ) : (
            <FlatList
              data={friends}
              renderItem={renderFriendItem}
              keyExtractor={(item) => item.id}  // Ensure unique key for each item
              contentContainerStyle={styles.friendListContent}
            />
          )}

          <TouchableOpacity style={[styles.button, { backgroundColor: theme.icon }]} onPress={() => setShowAddFriend(!showAddFriend)}>
            <Text style={[styles.buttonText, { color: theme.text }]}>Add Friend</Text>
          </TouchableOpacity>

          {showAddFriend && (
            <View style={styles.addFriendContainer}>
              <TextInput
                style={[styles.input, { borderColor: theme.icon, color: theme.text }]}
                placeholder="Enter Friend ID"
                placeholderTextColor={theme.text}
                value={friendID}
                onChangeText={setFriendID}
              />
              <TouchableOpacity style={[styles.button, { backgroundColor: theme.icon }]} onPress={handleSendFriendRequest}>
                <Text style={[styles.buttonText, { color: theme.text }]}>Confirm</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
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
  button: {
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
  },
  friendsContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  noFriendsText: {
    fontSize: 18,
    fontStyle: 'italic',
  },
  friendListContent: {
    paddingBottom: 20,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderColor: 'lightgray',
    borderWidth: 1,
    marginBottom: 10,
  },
  friendDetails: {
    flex: 1,
  },
  friendText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  friendIDText: {
    fontSize: 14,
    marginTop: 5,
  },
  addFriendContainer: {
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
});

export default FriendsScreen;
