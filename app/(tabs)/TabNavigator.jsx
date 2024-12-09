import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import HomeScreen from './home';
import CalendarScreen from './calendar';
import ProfileScreen from './profile';
import NotificationsScreen from './Notifications';
import AddEventScreen from './AddEventScreen';
import { EventContext } from './EventContext';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { theme, language } = useContext(EventContext);

  const translations = {
    en: {
      home: 'Home',
      calendar: 'Calendar',
      add: 'Add',
      notifications: 'Notifications',
      profile: 'Profile',
    },
    es: {
      home: 'Inicio',
      calendar: 'Calendario',
      add: 'Añadir',
      notifications: 'Notificaciones',
      profile: 'Perfil',
    },
    fr: {
      home: 'Accueil',
      calendar: 'Calendrier',
      add: 'Ajouter',
      notifications: 'Notifications',
      profile: 'Profil',
    },
  };

  const { home, calendar, add, notifications, profile } = translations[language] || translations.en;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === home) {
            iconName = 'home';
          } else if (route.name === calendar) {
            iconName = 'calendar-alt';
          } else if (route.name === add) {
            iconName = 'plus-circle';
          } else if (route.name === notifications) {
            iconName = 'bell';
          } else if (route.name === profile) {
            iconName = 'user';
          }

          return <FontAwesome5 name={iconName} size={size} color={color} />;
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.icon,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: theme.background },
      })}
    >
      <Tab.Screen 
        name={home} 
        component={HomeScreen} 
      />
      <Tab.Screen 
        name={calendar} 
        component={CalendarScreen} 
      />
      <Tab.Screen
        name={add}
        component={AddEventScreen}
        options={{ tabBarIcon: ({ color, size }) => <FontAwesome5 name="plus-circle" size={40} color={color} /> }}
      />
      <Tab.Screen 
        name={notifications} 
        component={NotificationsScreen} 
      />
      <Tab.Screen 
        name={profile} 
        component={ProfileScreen} 
      />
    </Tab.Navigator>
  );
}
