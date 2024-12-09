import React, { createContext, useState, useEffect } from 'react';
import { db, auth } from '../../configs/FirebaseConfig';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const EventContext = createContext();

const loadLanguageFile = async (language) => {
  switch (language) {
    case 'es':
      return import('../../locales/es.json');
    case 'en':
    default:
      return import('../../locales/en.json');
    case 'de' :
      return import('../../locales/de.json');
    case 'ja' :
      return import('../../locales/ja.json');
    case 'ko' :
      return import('../../locales/ko.json');
    case 'ru' :
      return import('../../locales/ru.json');
  }
};

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState({});
  const [theme, setTheme] = useState({
    background: '#fff',
    text: '#000',
    icon: '#800080',
    mode: 'light',
  });
  const [language, setLanguage] = useState('en');
  const [translations, setTranslations] = useState({});
  const [fonts, setFonts] = useState('montserrat');
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUser(userDocSnap.data());
        }
      }
    };

    const fetchEvents = async () => {
      const user = auth.currentUser;
      if (user) {
        const userEventsCollection = collection(db, 'users', user.uid, 'events');
        const querySnapshot = await getDocs(userEventsCollection);
        const eventsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), date: doc.data().date.toDate() }));
        setEvents(eventsData);
      }
    };

    const fetchFriends = async () => {
      const user = auth.currentUser;
      if (user) {
        const friendCollection = collection(db, 'users', user.uid, 'friends');
        const friendSnapshot = await getDocs(friendCollection);
        const friendList = friendSnapshot.docs.map(doc => doc.data());
        setFriends(friendList);
      }
    };

    const loadUserSettings = async () => {
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
    };

    const loadSettings = async () => {
      try {
        await loadUserSettings();
        const storedTheme = await AsyncStorage.getItem('theme');
        const storedLanguage = await AsyncStorage.getItem('language');
        const storedFonts = await AsyncStorage.getItem('fonts');
        if (storedTheme) setTheme(JSON.parse(storedTheme));
        if (storedLanguage) setLanguage(storedLanguage);
        if (storedFonts) setFonts(storedFonts);
      } catch (error) {
        console.log('Error loading settings from AsyncStorage:', error);
      }
    };

    fetchUserData();
    fetchEvents();
    fetchFriends();
    loadSettings();
  }, []);

  useEffect(() => {
    const saveSettings = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          theme,
          language,
          fonts,
        });
      }
      try {
        await AsyncStorage.setItem('theme', JSON.stringify(theme));
        await AsyncStorage.setItem('language', language);
        await AsyncStorage.setItem('fonts', fonts);
      } catch (error) {
        console.log('Error saving settings to AsyncStorage:', error);
      }
    };
    saveSettings();
  }, [theme, language, fonts]);

  useEffect(() => {
    const loadTranslations = async () => {
      const languageFile = await loadLanguageFile(language);
      setTranslations(languageFile.default);
    };

    loadTranslations();
  }, [language]);

  const markAsConcluded = async (eventId) => {
    const user = auth.currentUser;
    if (user) {
      const eventDocRef = doc(db, 'users', user.uid, 'events', eventId);
      await updateDoc(eventDocRef, {
        concluded: true,
      });
      setEvents(events.map(event => event.id === eventId ? { ...event, concluded: true } : event));
    }
  };

  return (
    <EventContext.Provider value={{ 
      events, 
      setEvents, 
      user, 
      setUser, 
      theme, 
      setTheme, 
      language, 
      setLanguage, 
      translations, 
      setFonts, 
      fonts, 
      friends, 
      setFriends, 
      markAsConcluded 
    }}>
      {children}
    </EventContext.Provider>
  );
};
