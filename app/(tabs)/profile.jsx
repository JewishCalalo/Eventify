import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../../configs/FirebaseConfig';
import { signOut } from 'firebase/auth';
import { updateDoc, doc, getDoc } from 'firebase/firestore';
import { EventContext } from './EventContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileTab() {
  const navigation = useNavigation();
  const { user, setUser, theme, setTheme, setLanguage, setFonts } = useContext(EventContext);
  const [profileImage, setProfileImage] = useState(user?.profileImage || 'https://via.placeholder.com/120');
  const [fullName, setFullName] = useState(user?.fullName || 'User');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.uri);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: async () => {
            await signOut(auth);
            navigation.replace('SignIn');
          }
        }
      ]
    );
  };

  const handleSaveChanges = async () => {
    Alert.alert(
      "Confirm Changes",
      "Are you sure you want to save these changes?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Save",
          onPress: async () => {
            try {
              const userDocRef = doc(db, 'users', auth.currentUser.uid);
              await updateDoc(userDocRef, { fullName, profileImage });
              setUser({ ...user, fullName, profileImage });
              Alert.alert("Changes saved!");
            } catch (error) {
              console.error("Error saving changes: ", error);
              Alert.alert("Error", "Failed to save changes. Please try again.");
            }
          }
        }
      ]
    );
  };

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
      console.error("Error fetching user settings: ", error);
    }
  };

  useEffect(() => {
    fetchUserSettings();
  }, [auth.currentUser]);

  return (
    <LinearGradient
      colors={['#939194', '#673b70']}
      style={styles.container}
    >
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={pickImage}>
          <Image source={{ uri: profileImage }} style={[styles.profileImage, { borderColor: theme.icon }]} />
          <Text style={[styles.changeImageText, { color: theme.icon }]}>Change Profile Image</Text>
        </TouchableOpacity>
        <Text style={[styles.profileName, { color: theme.text }]}>{fullName}</Text>
        <Text style={[styles.friendID, { color: theme.icon }]}>Friend ID: {user.friendID}</Text>
      </View>

      {/* Account Section */}
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.icon }]} onPress={() => navigation.navigate('Account')}>
        <Text style={[styles.buttonText, { color: theme.text }]}>Account</Text>
      </TouchableOpacity>

      {/* Settings Section */}
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.icon }]} onPress={() => navigation.navigate('Settings')}>
        <Text style={[styles.buttonText, { color: theme.text }]}>Settings</Text>
      </TouchableOpacity>

      {/* Logout Section */}
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.icon }]} onPress={handleLogout}>
        <Text style={[styles.buttonText, { color: theme.text }]}>Logout</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    marginBottom: 10,
    alignSelf: 'center',
  },
  changeImageText: {
    textAlign: 'center',
    marginTop: 10,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  friendID: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
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
