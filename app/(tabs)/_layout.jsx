import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './home';
import SignIn from '../auth/sign-in';
import SignUp from '../auth/sign-up';
import { useFonts } from 'expo-font';

const Stack = createStackNavigator();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'montserrat': require('/React Native/Eventify/assets/fonts/Montserrat-Regular.ttf'),
    'montserrat-medium': require('/React Native/Eventify/assets/fonts/Montserrat-Medium.ttf'),
    'montserrat-italic': require('/React Native/Eventify/assets/fonts/Montserrat-Italic.ttf'),
    'montserrat-bold': require('/React Native/Eventify/assets/fonts/Montserrat-Bold.ttf')
  });

  if (!fontsLoaded) {
    return null; // or a loading spinner
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="SignIn" component={SignIn} />
      <Stack.Screen name="SignUp" component={SignUp} />
    </Stack.Navigator>
  );
}


