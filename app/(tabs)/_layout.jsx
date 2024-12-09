import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';
import CalendarTab from './calendar';
import SignIn from '../auth/sign-in';
import SignUp from '../auth/sign-up';
import AddEventScreen from './AddEventScreen';
import Account from './Account';
import Settings from './Settings';
import Profile from './profile';
import ResultsScreen from './ResultsScreen';
import MyEventsScreen from './MyEventsScreen';
import FriendsScreen from './FriendsScreen';
import ConcludedEventsScreen from './ConcludedEventsScreen';
import TeamEventifyScreen from './TeamEventifyScreen';
import TrashBinScreen from './TrashBinScreen';
import AppLoading from 'expo-app-loading';
import { useFonts } from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { EventProvider } from './EventContext';
import { theme } from './theme';

const Stack = createStackNavigator();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'montserrat': require('/React Native/Eventify/assets/fonts/Montserrat-Regular.ttf'),
    'montserrat-medium': require('/React Native/Eventify/assets/fonts/Montserrat-Medium.ttf'),
    'montserrat-italic': require('/React Native/Eventify/assets/fonts/Montserrat-Italic.ttf'),
    'montserrat-bold': require('/React Native/Eventify/assets/fonts/Montserrat-Bold.ttf'),
    'Roboto-Regular': require('/React Native/Eventify/assets/fonts/Roboto-Regular.ttf'),
    'Arial': require('/React Native/Eventify/assets/fonts/Arial.ttf'),
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <EventProvider>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            headerStyle: { backgroundColor: theme.headerBackground },
            headerTintColor: theme.headerText,
          }}
        >
          <Stack.Screen name="HomeTabs" component={TabNavigator} />
          <Stack.Screen name="CalendarScreen" component={CalendarTab} />
          <Stack.Screen name="SignIn" component={SignIn} />
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen name="AddEventScreen" component={AddEventScreen} />
          <Stack.Screen name="Account" component={Account} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="ResultsScreen" component={ResultsScreen} />
          <Stack.Screen name="My Events" component={MyEventsScreen} />
          <Stack.Screen name="Friends" component={FriendsScreen} />
          <Stack.Screen name="Concluded Events" component={ConcludedEventsScreen} />
          <Stack.Screen name="Team Eventify" component={TeamEventifyScreen} />
          <Stack.Screen name="TrashBinScreen" component={TrashBinScreen} />
        </Stack.Navigator>
    </EventProvider>
  );
}
