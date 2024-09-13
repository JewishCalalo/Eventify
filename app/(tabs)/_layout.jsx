import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown:false
    }}>
      <Tabs.Screen name="home" 
      options={{
        tabBarIcon:({color})=><FontAwesome6 name="house-chimney" size={24} color="black" />
      }}
      />
      <Tabs.Screen name="premium"
      options={{
        tabBarIcon:({color})=><FontAwesome6 name="crown" size={24} color="black" />
      }}
      />
      <Tabs.Screen name="profile"
      options={{
        tabBarIcon:({color})=><Ionicons name="body" size={24} color="black" />
      }}
      />
    </Tabs>
  )
}