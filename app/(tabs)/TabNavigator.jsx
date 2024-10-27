import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import HomeScreen from './home';
import CalendarScreen from './calendar';
import ProfileScreen from './profile';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarIcon: ({ color }) => <FontAwesome6 name="house-chimney" size={24} color={color} /> }}
      />
      <Tab.Screen 
        name="Calendar" 
        component={CalendarScreen} 
        options={{ tabBarIcon: ({ color }) => <FontAwesome6 name="calendar" size={24} color={color} /> }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarIcon: ({ color }) => <FontAwesome6 name="user" size={24} color={color} /> }}
      />
    </Tab.Navigator>
  );
}
