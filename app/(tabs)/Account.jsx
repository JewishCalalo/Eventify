import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { db, auth } from '../../configs/FirebaseConfig';
import { updateDoc, doc } from 'firebase/firestore';
import { EventContext } from './EventContext';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Account() {
  const { user, setUser, theme } = useContext(EventContext);
  const [fullName, setFullName] = useState(user.fullName);
  const [profileImage, setProfileImage] = useState(user.profileImage);
  const navigation = useNavigation();

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Sorry, we need camera roll permissions to make this work!');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      } else if (!result.canceled && result.uri) {
        setProfileImage(result.uri);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error picking image", error.message);
    }
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
              const updatedData = { fullName };

              if (profileImage !== undefined) {
                updatedData.profileImage = profileImage;
              }

              await updateDoc(userDocRef, updatedData);
              setUser(prevUser => ({ ...prevUser, fullName, profileImage }));
              Alert.alert("Changes saved!", "", [{ text: "OK", onPress: () => navigation.goBack() }]);
            } catch (error) {
              console.error(error);
              Alert.alert("Error saving changes", error.message);
            }
          }
        }
      ]
    );
  };

  return (
    <LinearGradient
      colors={['#673b70', '#939194']}
      style={styles.container}
    >
      <TouchableOpacity onPress={navigation.goBack}>
        <Text style={[styles.goBack, { color: theme.icon }]}>← Go Back</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={pickImage}>
        <Image source={{ uri: profileImage }} style={[styles.profileImage, { borderColor: theme.icon }]} />
        <Text style={[styles.changeImageText, { color: theme.icon }]}>Change User Profile</Text>
      </TouchableOpacity>
      <TextInput 
        style={[styles.input, { borderColor: theme.icon, color: theme.text }]} 
        placeholder="Full Name" 
        placeholderTextColor={theme.text}
        value={fullName} 
        onChangeText={setFullName} 
      />
      <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.icon }]} onPress={handleSaveChanges}>
        <Text style={[styles.saveButtonText, { color: theme.text }]}>Save Changes</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  goBack: {
    fontSize: 18,
    marginBottom: 10,
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
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  saveButton: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 18,
  },
});
