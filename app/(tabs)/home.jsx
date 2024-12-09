import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { db, auth } from '../../configs/FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { EventContext } from './EventContext';
import SearchComponent from './SearchComponent';
import CarouselComponent from './CarouselComponent';
import { LinearGradient } from 'expo-linear-gradient';

const icons = [
  { key: '1', label: 'myEvents', icon: 'calendar' },
  { key: '2', label: 'friends', icon: 'people' },
  { key: '3', label: 'concludedEvents', icon: 'checkmark-circle' },
];

export default function HomeScreen() {
  const { theme, translations, fonts } = useContext(EventContext);
  const [fullName, setFullName] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserInfo = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setFullName(userDocSnap.data().fullName);
        }
      }
    };

    fetchUserInfo();
  }, []);

  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
  };

  return (
    <LinearGradient
    colors={['#939194' , '#673b70' ]}
      style={styles.container}
    >
      <ScrollView>
        <View style={styles.header}>
          <Text style={[styles.welcomeMessage, { color: theme.text, fontFamily: fonts }]}>
            {translations.welcome}, {fullName}
          </Text>
          <TouchableOpacity onPress={toggleSearch}>
            <Ionicons name="search" size={24} color={theme.icon} />
          </TouchableOpacity>
        </View>
        {searchVisible && <SearchComponent />}
        <Text style={[styles.heading, { fontFamily: fonts }]}>{translations.onThisDay}</Text>
        <CarouselComponent />
        <FlatList
          data={icons}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.icon} onPress={() => navigation.navigate(translations[item.label])}>
              <Ionicons name={item.icon} size={32} color={theme.icon} style={styles.iconImage} />
              <Text style={[styles.iconLabel, { color: theme.text, fontFamily: fonts }]}>{translations[item.label]}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.key}
          style={styles.flatList}
        />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeMessage: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'montserrat', 
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    fontFamily: 'montserrat', 
  },
  flatList: {
    marginTop: 20, 
    
  },
  icon: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    borderColor: 'lightgray',
    borderWidth: 1,
    marginBottom: 10, 
  },
  iconImage: {
    marginRight: 15, 
  },
  iconLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'montserrat',
  },
});
